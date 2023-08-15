import NotificationService from 'src/notification/notification.service';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GameStatus, Ladder } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { AIPlayer, Ball, Canvas, Player } from './classes';
import { Invitation } from './interfaces/index';
import { GameProvider } from './services/gameprovider.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { NotificationGateway } from 'src/notification/notification.gateway';

type Game = {
  playerAId: number;
  playerASocket: Socket;
  playerBSocket: Socket;
  gameMode: string;
  powerUps: string;
};

@Injectable()
export class PongService {
  private queue: Game[] = []; // Socket[] - Queue to store players waiting to join a game
  private gameProviders: GameProvider[] = []; // Array to store active game providers
  private activeInvitations: Map<number, Invitation> = new Map<
    number,
    Invitation
  >(); // Map to store active invitations

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private usersService: UsersService,
    @Inject(JwtService) private readonly jwtService,
    @Inject(NotificationGateway)
    private notificationGateway: NotificationGateway,
  ) {}

  // -----------------------------------------Game History-----------------------------------------//

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
  ) {
    try {
      await this.prisma.game.update({
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
      // console.log(error);
    }
  }

  // Creates a game between two players
  async createGame(player1Id: number, player2Id: number) {
    try {
      if (isNaN(player1Id) || isNaN(player2Id)) return;
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
      throw error;
    }
  }

  //-----------------------------------------Random Matching-----------------------------------------//

  private isMatchingGameMode(game: Game, gameMode: string): boolean {
    const playerGameMode = this.getClientGameMode(game); // Implement a function to get the player's game mode
    return playerGameMode === gameMode;
  }

  // Checks if a player's play mode matches the requested play mode
  private isMatchingPlayMode(game: Game, playMode: string): boolean {
    const playerPlayMode = this.getClientPlayMode(game); // Implement a function to get the player's play mode
    return playerPlayMode === playMode;
  }

  // Adds a player to the queue
  async joinQueue(
    client,
    {
      userId,
      gameMode,
      powerUps,
    }: {
      userId: number;
      gameMode: string;
      powerUps: string;
    },
  ) {
    client.on('disconnect', () => {
      this.leaveQueue(client);
    });

    // Check if the player is already in the queue
    if (await this.isInQueue(client)) {
      console.log(' Player is already in the queue.');
      const id = await this.getClientIdFromClient(client);
      const res = this.queue.find((game) => game.playerAId === parseInt(id));
      res.playerASocket.emit('game-over', {
        winner: 0,
      });
      res.playerASocket = client;
      client.emit('error', 'Player is already in the queue.');
      return;
    }

    const matchingPlayers = this.queue.filter(
      (game) =>
        this.isMatchingGameMode(game, gameMode) &&
        this.isMatchingPlayMode(game, powerUps),
    );

    // Check if there is a matching player in the queue
    if (matchingPlayers.length > 0) {
      const playerA = await this.createPlayer(
        matchingPlayers.shift().playerASocket,
      );

      this.queue = this.queue.filter(
        (game) => game.playerASocket !== playerA.socket,
      );
      const playerB = await this.createPlayer(client);
      playerB.x = playerB.canvas.width - playerB.width;
      this.createGameProvider(playerA, playerB, powerUps, gameMode);
      playerA.socket.emit('init-game');
      playerB.socket.emit('init-game');
      return;
    }

    const game: Game = {
      playerAId: userId,
      playerASocket: client,
      playerBSocket: null,
      gameMode: gameMode,
      powerUps: powerUps,
    };

    this.queue.push(game);
  }

  //--------------------------------------------------------------------------------------------------//

  // get player from game provider by id
  getPlayerById(id: number) {
    const gameProvider = this.getGameProviderByUserId(id);
    if (!gameProvider) return null;
    const { playerA, playerB } = gameProvider.game;
    return playerA.id === id ? playerA : playerB;
  }

  isAlreadyInGame(client, info: { userId: number }) {
    const gameProvider = this.getGameProviderByUserId(info.userId);
    const player = this.getPlayerById(info.userId);
    if (player && client) {
      player.socket.emit('game-over', {
        winner: 0,
      });
      player.socket.off('disconnect', () => {});
      player.socket = client;
    }
    return !!gameProvider;
  }

  leaveGame(
    client: Socket,
    info: {
      userId: number;
    },
  ) {
    const gameProvider = this.getGameProviderByUserId(info.userId);
    if (!gameProvider) return;
    const { playerA, playerB } = gameProvider.game;
    playerA.score = playerA.id === info.userId ? 0 : 7;
    playerB.score = playerB.id === info.userId ? 0 : 7;
    this.gameOver(gameProvider);
  }

  //-------------------------------invite friend-----------------------------------//
  inviteFriend(
    { inviterId, invitedFriendId, gameMode, powerUps }: any,
    client: Socket,
  ) {
    // Check if the invited friend is already in an active invitation
    if (this.isInvited(invitedFriendId)) {
      client.emit('error', 'Invitation already sent to the friend.');
      return;
    }

    if (
      this.isAlreadyInGame(null, { userId: inviterId }) ||
      this.isAlreadyInGame(null, { userId: invitedFriendId })
    ) {
      client.emit('error', 'Player already in Game');
      return;
    }
    // Create an invitation object
    const invitation: Invitation = {
      inviterId,
      inviterSocket: client,
      invitedFriendId,
      timestamp: Date.now(),
      gameMode,
      powerUps,
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
    return invitation;
  }

  async acceptInvitation(invitedFriendId: number, client: Socket) {
    // Check if the invited friend has an active invitation
    if (this.isInvited(invitedFriendId)) {
      // Remove the invitation from the active invitations dictionary
      const invitations = Array.from(this.activeInvitations.values());

      const invitation = invitations.find(
        (invitation) =>
          invitation.invitedFriendId.toString() === invitedFriendId.toString(),
      );
      this.activeInvitations.delete(invitation.inviterId);
      this.activeInvitations.delete(invitation.invitedFriendId);
      const playerA = await this.createPlayer(invitation.inviterSocket);
      const playerB = await this.createPlayer(client);
      playerB.x = playerB.canvas.width - playerB.width;
      this.createGameProvider(
        playerA,
        playerB,
        invitation.powerUps,
        invitation.gameMode,
      );
      playerA.socket.emit('init-game');
      playerB.socket.emit('init-game');
      // return;
      console.log('Invitation accepted. Joining the game...');
    } else {
      console.log('No active invitation found for the friend.');
    }
  }

  resetInvitation(inviterId: number) {
    // Check if the inviter has an active invitation
    const inv: Invitation = this.activeInvitations.get(inviterId);
    console.log(inv);
    if (this.isInvited(inviterId)) {
      // Remove the invitation from the active invitations dictionary

      this.activeInvitations.delete(inviterId);

      // Proceed with any necessary reset or clean-up actions
    } else if (inv) {
      if (inv && inv.inviterSocket) {
        const id = this.notificationGateway.clients_map.get(
          inv.inviterId.toString(),
        );
        this.notificationGateway.server.to(id).emit('invitation-canceled');
        this.activeInvitations.delete(inviterId);
        this.notificationService.sendNotification(
          inv.inviterId,
          inv.invitedFriendId,
          'Game Invite Rejected',
          '',
          inv.inviterId,
          '/pong',
        );
      }
    }
  }

  isInvited(playerId: number): boolean {
    const invitations = Array.from(this.activeInvitations.values());
    if (!invitations || !playerId) return false;
    const activeInvitations = invitations.filter(
      (invitation) =>
        invitation.invitedFriendId.toString() === playerId.toString(),
    );
    return activeInvitations.length > 0;
  }

  async checkForInvitaionSent(client) {
    const id = await this.getClientIdFromClient(client);
    return this.activeInvitations.has(parseInt(id));
  }

  async checkForActiveInvitations(client) {
    const id = await this.getClientIdFromClient(client);
    const invitations = Array.from(this.activeInvitations.values());
    const activeInvitations = invitations.filter(
      (invitation) => invitation.invitedFriendId.toString() === id,
    );
    if (activeInvitations.length > 0) {
      client.emit('check-for-active-invitations', {
        inviterId: activeInvitations[0]?.inviterId,
        invitedFriendId: activeInvitations[0]?.invitedFriendId,
        gameMode: activeInvitations[0]?.gameMode,
        powerUps: activeInvitations[0]?.powerUps,
      });
    }
  }

  async verifyClient(client) {
    let token: string = client.handshake.auth.token as string;
    if (token.search('Bearer') !== -1) token = token.split(' ')[1];
    try {
      const data = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      client.data = data;
      return data;
    } catch (err) {
      throw new WsException({
        error: 'Authentication failed',
        message: err.message,
      });
    }
  }

  // Retrieves the client ID from the socket client
  private async getClientIdFromClient(client: Socket): Promise<string> {
    // if (client.handshake.query.clientId)

    return (await this.verifyClient(client)).sub.toString();
  }

  // Handles client disconnection
  handleClientDisconnect(client: Socket, playerA, playerB, game, winnerId) {
    if (!client) return;
    client.on('disconnect', () => {
      if (!game || !playerA || !playerB) return;
      game?.playerA?.id === winnerId ? 7 : 0;
      game?.playerB?.id === winnerId ? 7 : 0;
      this.gameOver(game);
    });
  }

  getClientGameMode(game: Game) {
    return game.gameMode;
  }

  getClientPlayMode(game: Game) {
    return game.powerUps;
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

  // Plays the game with an AI player
  async playWithAI(client: Socket) {
    const playerA = await this.createPlayer(client);
    const playerB = new AIPlayer(1, playerA.canvas, 3, new Ball(new Canvas()));
    const game = await this.createGameProvider(
      playerA,
      playerB,
      'Classic',
      'Ranked Mode',
    );
    playerB.ball = game.game.ball;
    client.on('disconnect', () => {
      // this.updateScore(game.id, playerA.score, 7, playerA.id, playerB.id);
      // this.removeGameProvider(game);
      this.handleClientDisconnect(client, playerA, playerB, game, playerB.id);
    });
    return game;
  }

  // Removes a player from the queue
  leaveQueue(client: Socket) {
    this.queue = this.queue.filter(
      (game) => game.playerASocket !== client && game.playerBSocket !== client,
    );
  }

  // Creates a player instance from a client socket
  private async createPlayer(client: Socket): Promise<Player> {
    const userId = await this.getClientIdFromClient(client); // Implement a function to get the user ID from the client
    const playerCanvas = new Canvas(); // Replace canvasWidth and canvasHeight with actual values
    const achievements = await this.getPlayerAchievements(parseInt(userId));

    return new Player(parseInt(userId), playerCanvas, client, achievements);
  }

  // Creates a game provider with two players
  private async createGameProvider(
    playerA: Player,
    playerB: Player,
    powerUps?: string,
    gameMode?: string,
  ) {
    if (!playerA && !playerB) return;
    const gameProvider = new GameProvider(powerUps, gameMode);
    const game = await this.createGame(playerA.id, playerB.id);
    if (!game) return null;
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
    this.usersService.changeUserStatus(playerA.id, 'INGAME');
    this.usersService.changeUserStatus(playerB.id, 'INGAME');
    gameProvider.intervalId = setInterval(() => {
      this.update({
        userId: playerA.id,
        playerCanvas: playerA.canvas,
      });
      this.update({
        userId: playerB.id,
        playerCanvas: playerB.canvas,
      });
    }, 25);
    return gameProvider;
  }

  pauseGame(client: Socket, info: { userId: number }) {
    const gameProvider = this.getGameProviderByUserId(info.userId);
    if (!gameProvider) return;
    const { playerA, playerB } = gameProvider.game;
    gameProvider.paused = true;
    if (playerA.socket) playerA.socket.emit('game-paused');
    if (playerB.socket) playerB.socket.emit('game-paused');
  }

  resumeGame(client: Socket, info: { userId: number }) {
    const gameProvider = this.getGameProviderByUserId(info.userId);
    if (!gameProvider) return;
    gameProvider.paused = false;
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
  private async isInQueue(client: Socket): Promise<boolean> {
    const id = await this.getClientIdFromClient(client);
    return this.queue
      .map((game) => {
        return game.playerAId === parseInt(id);
      })
      .includes(true);
  }

  assingAchievements(player: Player) {
    const achievements = player.acheivementsWatcher.toAssignAchievements;

    for (const achievement of achievements) {
      this.usersService.assignAchievements(player.id, achievement);
    }

    player.acheivementsWatcher.toAssignAchievements.clear();
  }

  async gameOver(gameProvider: GameProvider) {
    if (
      !gameProvider ||
      !gameProvider.game ||
      !gameProvider.game.playerA ||
      !gameProvider.game.playerB
    )
      return;
    const { playerA, playerB } = gameProvider.game;

    const winner = playerA.score > playerB.score ? playerA : playerB;
    const loser = playerA.score < playerB.score ? playerA : playerB;
    this.updateScore(gameProvider.id, playerA.score, playerB.score);
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
    await this.adjustPlayerRating(winner.id, loser.id, gameProvider.gameMode);
    await this.updateWinnerandLoser(winner.id, loser.id, gameProvider.id);
    this.usersService.changeUserStatus(playerA.id, 'ONLINE');
    this.usersService.changeUserStatus(playerB.id, 'ONLINE');
    this.assingAchievements(playerA);
    this.assingAchievements(playerB);
    clearInterval(gameProvider.intervalId);
    this.removeGameProvider(gameProvider);
  }

  emitUpdate(
    data: { ball: Ball; playerA: Player; playerB: Player },
    client: Socket,
    timeremaining: Date,
  ) {
    if (data && client) {
      client.emit('update', data.ball);
      client.emit('update-time', timeremaining);
      client.emit('update-player-a', {
        id: data.playerA.id,
        x: data.playerA.x,
        y: data.playerA.y,
        score: data.playerA.score,
        width: data.playerA.width,
        height: data.playerA.height,
      });
      client.emit('update-player-b', {
        id: data.playerB.id,
        x: data.playerB.x,
        y: data.playerB.y,
        score: data.playerB.score,
        width: data.playerB.width,
        height: data.playerB.height,
      });
    }
  }

  update(info: { userId: number; playerCanvas: Canvas }) {
    const gameProvider = this.getGameProviderByUserId(info.userId);
    if (!gameProvider) return null;
    if (gameProvider.paused || !gameProvider.gameStarted) return;
    const game = gameProvider.update(info);
    const { playerA, playerB } = game;

    if (gameProvider.gameMode !== 'Time Attack') {
      if (playerA.score >= 7 || playerB.score >= 7) {
        this.gameOver(gameProvider);
        this.removeGameProvider(gameProvider);
        return;
      }
    } else {
      let differenceInMinutes =
        (gameProvider.endsAt.getTime() - Date.now()) / 60000;

      if (differenceInMinutes < 0) {
        this.gameOver(gameProvider);
        this.removeGameProvider(gameProvider);
      }
    }

    this.emitUpdate(game, playerA.socket, gameProvider.endsAt);
    this.emitUpdate(game, playerB.socket, gameProvider.endsAt);
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

  adjustLadderLevel(points: number): string {
    if (points >= 0 && points <= 2000) {
      return 'BEGINNER';
    } else if (points > 2000 && points <= 4000) {
      return 'AMATEUR';
    } else if (points > 4000 && points <= 6000) {
      return 'SEMI_PROFESSIONAL';
    } else if (points > 6000 && points <= 8000) {
      return 'PROFESSIONAL';
    } else if (points > 8000 && points < 10000) {
      return 'WORLD_CLASS';
    } else {
      return 'LEGENDARY';
    }
  }

  async adjustPlayerRating(
    winnerId: number,
    loserId: number,
    gameMode: string,
  ) {
    try {
      const winner = await this.usersService.findUserById(winnerId);
      // console.log(winner);
      const loser = await this.usersService.findUserById(loserId);
      // console.log(loser);

      // Assume winner.ladderLevel and loser.ladderLevel represent the ladder levels of the players

      if (gameMode === 'Ranked Mode') {
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
        winner.ladder = this.adjustLadderLevel(winner.rating) as Ladder;
        loser.rating -= lossPoints;
        loser.rating = loser.rating < 0 ? 0 : loser.rating;
        loser.ladder = this.adjustLadderLevel(loser.rating) as Ladder;
      }

      winner.winStreak++;
      winner.totalGames++;
      console.log('here', winner.totalGames);
      winner.wins++;
      // Adjust ladder level if needed
      // ...

      // Update the loser's points and ladder level
      loser.losses++;
      loser.winStreak = 0;
      loser.totalGames++;

      await this.usersService.updateUser({
        user: {
          rating: winner.rating,
          ladder: winner.ladder,
          winStreak: winner.winStreak,
          totalGames: winner.totalGames,
          wins: winner.wins,
        },
        id: winner.id,
      });
      await this.usersService.updateUser({
        user: {
          rating: loser.rating,
          ladder: loser.ladder,
          winStreak: loser.winStreak,
          totalGames: loser.totalGames,
          losses: loser.losses,
        },
        id: winner.id,
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Could not update user rating and ladder',
      );
    }
  }
}
