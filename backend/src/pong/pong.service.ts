import { assignAchievementsDto } from './../users/dto/achievements.dto';
import NotificationService from 'src/notification/notification.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GameStatus, Ladder } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { AIPlayer, Ball, Canvas, Player } from './classes';
import { Invitation } from './interfaces/index';
import { GameProvider } from './services/gameprovider.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PongService {
  private queue: Socket[] = []; // Socket[] - Queue to store players waiting to join a game
  private gameProviders: GameProvider[] = []; // Array to store active game providers
  private activeInvitations: Map<number, Invitation> = new Map<
    number,
    Invitation
  >(); // Map to store active invitations
  use: any;

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private usersService: UsersService,
  ) {}

  inviteFriend(inviterId: number, invitedFriendId: number, client: Socket) {
    // Check if the invited friend is already in an active invitation
    if (this.isInvited(invitedFriendId)) {
      console.log('Invitation already sent to the friend.');
      return;
    }

    // Create an invitation object
    const invitation: Invitation = {
      inviterId,
      inviterSocket: client,
      invitedFriendId,
      timestamp: Date.now(),
    };

    // Add the invitation to the active invitations dictionary
    this.activeInvitations.set(inviterId, invitation);
    this.notificationService.sendNotification(
      inviterId,
      invitedFriendId,
      'Game Invite',
      '',
      invitedFriendId,
      '/pong',
    );

    // Start a timer to reset the invitation after 30 seconds
    setTimeout(() => {
      this.resetInvitation(inviterId);
    }, 30000); // 30 seconds
  }

  acceptInvitation(invitedFriendId: number, client: Socket) {
    // Check if the invited friend has an active invitation
    // if (this.isInvited(invitedFriendId)) {
    //   // Remove the invitation from the active invitations dictionary
    //   this.activeInvitations.delete(invitedFriendId);
    //   const invitation = this.activeInvitations.get(invitedFriendId);
    //   // Proceed with joining the game or taking any other action
    //   // to fulfill the invitation request
    //   const playerA = this.createPlayer(invitation.inviterSocket);
    //   const playerB = this.createPlayer(client);
    //   playerB.x = playerB.canvas.width - playerB.width;
    //   this.createGameProvider(playerA, playerB);
    //   playerA.socket.emit('init-game');
    //   playerB.socket.emit('init-game');
    //   // return;
    //   console.log('Invitation accepted. Joining the game...');
    // } else {
    //   console.log('No active invitation found for the friend.');
    //   console.log(this.activeInvitations);
    // }
  }

  resetInvitation(inviterId: number) {
    // Check if the inviter has an active invitation
    if (this.isInvited(inviterId)) {
      // Remove the invitation from the active invitations dictionary
      this.activeInvitations.delete(inviterId);

      // Proceed with any necessary reset or clean-up actions
      console.log('Invitation reset.');
    }
  }

  isInvited(playerId: number): boolean {
    return this.activeInvitations.has(playerId);
  }

  // Fetches the list of ongoing games with player information
  async getLiveGames() {
    try {
      const games = await this.prisma.game.findMany({
        where: {
          status: 'IN_PROGRESS',
        },
        include: {
          player1: true,
          player2: true,
        },
      });
      return games;
    } catch (error) {
      console.log(error);
    }
  }

  // Fetches the match history of a specific user
  async getMatchHistory(userId: number) {
    try {
      const games = await this.prisma.game.findMany({
        where: {
          OR: [
            {
              player1Id: userId,
            },
            {
              player2Id: userId,
            },
          ],
          status: 'FINISHED',
        },
        include: {
          player1: true,
          player2: true,
        },
      });
      return games;
    } catch (error) {
      console.log(error);
    }
  }

  // Updates the winner and loser of a game
  async updateWinnerandLoser(
    winnerId: number,
    loserId: number,
    gameId: number,
  ) {
    try {
      console.log(winnerId, loserId, gameId);
      const game = await this.prisma.game.update({
        where: {
          id: gameId,
        },
        data: {
          winner: {
            connect: {
              id: winnerId,
            },
          },
          loser: {
            connect: {
              id: loserId,
            },
          },
          status: 'FINISHED',
        },
      });
      console.log(game);
    } catch (error) {
      // Handle the error here
      console.log(error);
    }
  }

  // Updates the score of a game
  async updateScore(
    gameId: number,
    player1score: number,
    player2score: number,
    player1Id: number,
    player2Id: number,
  ) {
    try {
      if (player1score === 7 || player2score === 7) {
        this.updateWinnerandLoser(
          player1score === 7 ? player1Id : player2Id,
          player1score === 7 ? player2Id : player1Id,
          gameId,
        );
      }
      const game = await this.prisma.game.update({
        where: {
          id: gameId,
        },
        data: {
          player1Score: player1score,
          player2Score: player2score,
        },
      });
    } catch (error) {
      // Handle the error here
      console.log(error);
    }
  }

  // Creates a game between two players
  async createGame(player1Id: number, player2Id: number) {
    try {
      const game = await this.prisma.game.create({
        data: {
          player1: { connect: { id: player1Id } },
          player2: { connect: { id: player2Id } },
          status: GameStatus.IN_PROGRESS,
        },
      });
      return game;
    } catch (error) {
      // Handle the error here
      console.log(error);
    }
  }

  // Retrieves the client ID from the socket client
  private getClientIdFromClient(client: Socket): string {
    return client.handshake.query.clientId[0];
  }

  // Handles client disconnection
  handleClientDisconnect(client: Socket, playerA, playerB, game, winnerId) {
    if (!client) return;
    client.on('disconnect', () => {
      // this.usersService.changeUserStatus('ONLINE');
      // Update the score and remove the game provider
      this.updateScore(
        game.id,
        playerA.id === winnerId ? 7 : 0,
        playerB.id === winnerId ? 7 : 0,
        playerA.id,
        playerB.id,
      );
      this.removeGameProvider(game);
    });
  }

  // Adds a player to the queue
  async joinQueue(client: Socket) {
    client.on('disconnect', () => {
      this.leaveQueue(client);
    });

    const gameMode: string = this.getClientGameMode(client);
    const playMode: string = this.getClientPlayMode(client);
    // Check if the player is already in the queue
    if (this.isInQueue(client)) {
      console.log('Player is already in the queue.');
      return;
    }

    const matchingPlayers = this.queue.filter(
      (player) =>
        this.isMatchingGameMode(player, gameMode) &&
        this.isMatchingPlayMode(player, playMode),
    );

    // Check if there is a matching player in the queue
    if (matchingPlayers.length > 0) {
      const playerA = await this.createPlayer(matchingPlayers.shift());
      const playerB = await this.createPlayer(client);
      playerB.x = playerB.canvas.width - playerB.width;
      this.createGameProvider(playerA, playerB);
      playerA.socket.emit('init-game');
      playerB.socket.emit('init-game');
      return;
    }

    this.queue.push(client);
  }

  getClientGameMode(client) {
    return 'classic';
  }

  getClientPlayMode(client) {
    return 'single';
  }

  // get players acheivements
  async getPlayerAchievements(playerId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: playerId,
        },
        include: {
          achievements: true,
        },
      });
      return user.achievements.map((item) => item.name);
    } catch (error) {
      console.log(error);
    }
  }

  // Checks if a player's game mode matches the requested game mode
  private isMatchingGameMode(client: Socket, gameMode: string): boolean {
    const playerGameMode = this.getClientGameMode(client); // Implement a function to get the player's game mode
    return playerGameMode === gameMode;
  }

  // Checks if a player's play mode matches the requested play mode
  private isMatchingPlayMode(client: Socket, playMode: string): boolean {
    const playerPlayMode = this.getClientPlayMode(client); // Implement a function to get the player's play mode
    return playerPlayMode === playMode;
  }

  // Plays the game with an AI player
  async playWithAI(client: Socket) {
    const playerA = await this.createPlayer(client);
    const playerB = new AIPlayer(1, playerA.canvas, 3, new Ball(new Canvas()));
    const game = await this.createGameProvider(playerA, playerB);
    playerB.ball = game.game.ball;
    client.on('disconnect', () => {
      this.updateScore(game.id, playerA.score, 7, playerA.id, playerB.id);
      this.removeGameProvider(game);
    });
    return game;
  }

  // Removes a player from the queue
  leaveQueue(client: Socket) {
    this.queue = this.queue.filter((socket) => socket !== client);
  }

  // Creates a player instance from a client socket
  private async createPlayer(client: Socket): Promise<Player> {
    const userId = this.getClientIdFromClient(client); // Implement a function to get the user ID from the client
    const playerCanvas = new Canvas(); // Replace canvasWidth and canvasHeight with actual values
    const achievements = await this.getPlayerAchievements(parseInt(userId));

    return new Player(parseInt(userId), playerCanvas, client, achievements);
  }

  // Creates a game provider with two players
  private async createGameProvider(playerA: Player, playerB: Player) {
    const gameProvider = new GameProvider();
    const game = await this.createGame(playerA.id, playerB.id);
    gameProvider.id = game.id;
    gameProvider.init(playerA, playerB);
    this.gameProviders.push(gameProvider);
    this.handleClientDisconnect(
      playerA.socket,
      playerA,
      playerB,
      game,
      playerB.id,
    );
    this.handleClientDisconnect(
      playerB.socket,
      playerA,
      playerB,
      game,
      playerA.id,
    );
    return gameProvider;
  }

  // Removes a game provider from the list
  removeGameProvider(gameProvider: GameProvider) {
    this.gameProviders = this.gameProviders.filter(
      (provider) => provider.id !== gameProvider.id,
    );
  }

  // Retrieves the game provider based on a user ID
  private getGameProviderByUserId(userId: number): GameProvider {
    return this.gameProviders.find(
      (gameProvider) =>
        gameProvider.game.playerA.id === userId ||
        gameProvider.game.playerB.id === userId,
    );
  }

  // Checks if a client is in the queue
  private isInQueue(client: Socket): boolean {
    return this.queue.includes(client);
  }

  assingAchievements(player: Player) {
    const achievements = player.acheivementsWatcher.toAssignAchievements;

    for (const achievement of achievements) {
      this.usersService.assignAchievements(player.id, achievement);
    }

    player.acheivementsWatcher.toAssignAchievements.clear();
  }

  async gameOver(gameProvider: GameProvider) {
    const { playerA, playerB } = gameProvider.game;

    const winner = playerA.score > playerB.score ? playerA : playerB;
    const loser = playerA.score < playerB.score ? playerA : playerB;
    const playerAUser = await this.usersService.findUserById(playerA.id);
    playerA.acheivementsWatcher.checkAchievementsWhenGameIDone(
      playerA,
      playerB,
      playerAUser,
    );
    const playerBUser = await this.usersService.findUserById(playerB.id);
    playerB.acheivementsWatcher.checkAchievementsWhenGameIDone(
      playerB,
      playerA,
      playerBUser,
    );
    if (playerA.socket) {
      playerA.socket.emit('game-over', {
        winner: winner.id,
      });
    }
    if (playerB.socket) {
      playerB.socket.emit('game-over', {
        winner: winner.id,
      });
    }
    this.assingAchievements(playerA);
    this.assingAchievements(playerB);
    await this.adjustPlayerRating(winner.id, loser.id);
  }
  update(info: { userId: number; playerCanvas: Canvas }) {
    const gameProvider = this.getGameProviderByUserId(info.userId);
    if (!gameProvider) return null;
    const game = gameProvider.update(info);
    const { playerA, playerB } = game;
    // await this.use
    this.assingAchievements(playerA);
    this.assingAchievements(playerB);
    this.updateScore(
      gameProvider.id,
      playerA.score,
      playerB.score,
      playerA.id,
      playerB.id,
    );
    if (playerA.score >= 7 || playerB.score >= 7) {
      this.gameOver(gameProvider);
      this.removeGameProvider(gameProvider);
      return;
    }
    return game;
  }

  keyPressed(info: { key: string; userId: number }) {
    const gameProvider = this.getGameProviderByUserId(info.userId);
    if (gameProvider) gameProvider.keyPressed(info);
  }

  keyReleased(info: { key: string; userId: number }) {
    const gameProvider = this.getGameProviderByUserId(info.userId);
    if (gameProvider) gameProvider.keyReleased(info);
  }

  // // 2 - Point Adjustments:  :
  // /*
  //   * When a player wins a game, they earn points based on the ladder level of their opponent.
  //       - If a player wins against an opponent with a lower ladder level, they earn a base amount of points (50 points).
  //       - If a player wins against an opponent with the same ladder level, they earn a slightly higher amount of points (75 points).
  //       - If a player wins against an opponent with a higher ladder level, they earn an even higher amount of points (100 points).
  //   * When a player loses a game, they lose points based on the ladder level of their opponent.
  //       - If a player loses against an opponent with a lower ladder level, they lose a base amount of points (150 points).
  //       - If a player loses against an opponent with the same ladder level, they lose a slightly higher amount of points (100 points).
  //       - If a player loses against an opponent with a higher ladder level, they lose an even higher amount of points (50 points).
  // */

  // // 3 - Ladder Level Adjustments:
  // /*
  //   from begginer to amateur
  //    * 0 - 500
  //   from amteur to semi-professional
  //    * 500 - 1200
  //   from semi-professional to professional
  //    * 1200 - 3500
  //   from professional to worldclass
  //    * 3500 - 7000
  //   from worldclass to legendary
  //    * 7000 - 10000
  // */

  /*
  BEGINNER
  AMATEUR
  SEMI_PROFESSIONAL
  PROFESSIONAL
  WORLD_CLASS
  LEGENDARY
  */
  adjustLadderLevel(points: number): string {
    if (points >= 0 && points <= 500) {
      return 'BEGINNER';
    } else if (points > 500 && points <= 1200) {
      return 'AMATEUR';
    } else if (points > 1200 && points <= 3500) {
      return 'SEMI_PROFESSIONAL';
    } else if (points > 3500 && points <= 7000) {
      return 'PROFESSIONAL';
    } else if (points > 7000 && points <= 10000) {
      return 'WORLD_CLASS';
    } else {
      return 'LEGENDARY';
    }
  }

  async adjustPlayerRating(winnerId: number, loserId: number) {
    try {
      const winner = await this.usersService.findUserById(winnerId);
      const loser = await this.usersService.findUserById(loserId);

      // Assume winner.ladderLevel and loser.ladderLevel represent the ladder levels of the players

      let winPoints = 0;
      let lossPoints = 0;

      if (winner.ladder < loser.ladder) {
        winPoints = 50;
        lossPoints = 150;
      } else if (winner.ladder > loser.ladder) {
        winPoints = 100;
        lossPoints = 50;
      } else {
        winPoints = 75;
        lossPoints = 100;
      }

      // Update the winner's points and ladder level
      winner.rating += winPoints;
      loser.ladder = this.adjustLadderLevel(winner.rating) as Ladder;
      // Adjust ladder level if needed
      // ...

      // Update the loser's points and ladder level
      loser.rating -= lossPoints;
      loser.rating = loser.rating < 0 ? 0 : loser.rating;
      loser.ladder = this.adjustLadderLevel(loser.rating) as Ladder;
      // Adjust ladder level if needed
      // ...

      // Save the updated player data
      const { sentRequests, receivedRequests, achievements, ...winnerData } =
        winner;
      const {
        sentRequests: _,
        receivedRequests: __,
        achievements: ___,
        ...loserData
      } = loser;
      await this.usersService.updateUser({ user: winnerData }, winnerId);
      await this.usersService.updateUser({ user: loserData }, loserId);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(
        'Could not update user rating and ladder',
      );
      // Handle any errors that occur during the adjustment process
    }
  }
}
