import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';

class Canvas {
  public width: number;
  public height: number;
  constructor(canvas = { width: 650, height: 480 }) {
    this.width = canvas.width;
    this.height = canvas.height;
  }
}

class Ball {
  public x: number;
  public y: number;
  public radius: number;
  public speed: number;
  public velocity: {
    x: number;
    y: number;
  };
  constructor(canvas: Canvas) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.speed = 10;
    this.radius = 10;
    this.velocity = {
      x: 2,
      y: 2,
    };
  }
  reset(canvas: Canvas) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.speed = 10;
    this.velocity = {
      x: 2,
      y: 2,
    };
  }
}

class Player {
  public id: number;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public canvas: Canvas;
  public score: number;
  public speed: number;
  public interval: NodeJS.Timer;
  public keyState: {
    ArrowUp: boolean;
    ArrowDown: boolean;
  };
  public socket: Socket;
  constructor(id: number, canvas: Canvas, socket: Socket) {
    this.id = id;
    this.width = 10;
    this.height = canvas.height / 5;
    this.x = 0;
    this.y = canvas.height / 2 - this.height / 2;
    this.canvas = new Canvas(canvas);
    this.score = 0;
    this.interval = null;
    this.keyState = {
      ArrowUp: false,
      ArrowDown: false,
    };
    this.socket = socket;
  }
}

class Game {
  public playerA: Player;
  public playerB: Player;
  public ball: Ball;

  constructor(playerA: Player) {
    this.playerA = playerA;
    this.playerB = null;
    this.ball = new Ball(playerA.canvas);
  }
}

class AIPlayer extends Player {
  public ball: Ball;
  constructor(id: number, canvas: Canvas, difficulty: number, ball: Ball) {
    super(id, canvas, null);
    this.speed = 5;
    this.keyState = {
      ArrowUp: false,
      ArrowDown: false,
    };
    this.ball = ball;
    // this.interval = setInterval(() => {
    //   const ball = this.ball;
    //   const paddleCenter = this.y + this.height / 2;
    //   const ballCenter = ball.y;
    //   if (paddleCenter < ballCenter) {
    //     this.keyState.ArrowDown = true;
    //     this.keyState.ArrowUp = false;
    //   } else {
    //     this.keyState.ArrowUp = true;
    //     this.keyState.ArrowDown = false;
    //   }
    // }, 1000 / difficulty);
    this.interval = setInterval(() => {
      const ball = this.ball;
      const paddleCenter = this.y + this.height / 2;
      const ballCenter = ball.y;
      const timeToReachPaddle =
        (0.8 * (ball.x - this.x - this.width)) / Math.abs(ball.velocity.x);
      const predictedY = ball.y + timeToReachPaddle * ball.velocity.y;
      const paddleTop = predictedY - this.height / 2;
      const paddleBottom = predictedY + this.height / 2;
      if (paddleCenter < paddleTop) {
        this.keyState.ArrowDown = true;
        this.keyState.ArrowUp = false;
      } else if (paddleCenter > paddleBottom) {
        this.keyState.ArrowUp = true;
        this.keyState.ArrowDown = false;
      } else {
        this.keyState.ArrowUp = false;
        this.keyState.ArrowDown = false;
      }
    }, 500 / difficulty);
  }
}
class GameProvider {
  public id: number;
  public game: Game;
  public ballChangedDirection = false;
  public ballDirection: number = -1;
  constructor() {
    this.game = null;
  }

  init(playerA: Player, playerB: Player) {
    this.game = new Game(playerA);
    playerB.x = playerB.canvas.width - playerB.width;
    this.game.playerB = playerB;
    return this.game;
  }

  paddleCol(player: Player) {
    const ball = this.game.ball;
    const paddleRight = player.x + player.width;
    const paddleLeft = player.x;
    const paddleTop = player.y;
    const paddleBottom = player.y + player.height;
    return (
      ball.x - ball.radius < paddleRight &&
      ball.x + ball.radius > paddleLeft &&
      ball.y - ball.radius < paddleBottom &&
      ball.y + ball.radius > paddleTop
    );
  }

  update(info: { userId: number; playerCanvas: Canvas }) {
    const { userId, playerCanvas } = info;
    const playerA = this.game.playerA;
    const playerB = this.game.playerB;
    const ball = this.game.ball;
    const { width, height } = playerCanvas;

    if (!this.game || !playerB) return;

    const player = userId === playerA.id ? playerA : playerB;

    if (playerA.keyState['ArrowUp'] && playerA.y > 5) {
      playerA.y -= 5;
    } else if (
      playerA.keyState['ArrowDown'] &&
      playerA.y < height - playerA.height - 5
    ) {
      playerA.y += 5;
    }

    if (playerB.keyState['ArrowUp'] && playerB.y > 5) {
      playerB.y -= 5;
    } else if (
      playerB.keyState['ArrowDown'] &&
      playerB.y < height - playerB.height - 5
    ) {
      playerB.y += 5;
    }

    ball.x += (ball.velocity.x * ball.speed) / 10;
    ball.y += (ball.velocity.y * ball.speed) / 10;

    // Check if ball hits top or bottom wall
    if (ball.y + ball.radius > height - 10 || ball.y - ball.radius < 10) {
      ball.velocity.y = -ball.velocity.y;
    }

    // Check if ball hits player A or B
    if (
      (this.paddleCol(this.game.playerA) ||
        this.paddleCol(this.game.playerB)) &&
      !this.ballChangedDirection
    ) {
      this.ballChangedDirection = true;
      ball.velocity.x = 2 * -Math.sign(ball.velocity.x);
      ball.velocity.y = Math.random() * 4 - 2;
      ball.velocity.x +=
        Math.sign(ball.velocity.x) * (2 - Math.abs(ball.velocity.y));
      ball.speed++;
      // console.log(ball.velocity);
      const timeoutId = setTimeout(() => {
        this.ballChangedDirection = false;
        clearTimeout(timeoutId);
      }, 1000);
    }

    // Check if ball goes out of bounds (player A scores)
    if (ball.x > width) {
      playerA.score++;
      ball.reset(playerA.canvas);
      ball.velocity.x = Math.abs(ball.velocity.x) * this.ballDirection;
      this.ballDirection = -this.ballDirection;
    }

    // Check if ball goes out of bounds (player B scores)
    if (ball.x < 0) {
      playerB.score++;
      ball.reset(playerB.canvas);
      ball.velocity.x = Math.abs(ball.velocity.x) * this.ballDirection;
      this.ballDirection = -this.ballDirection;
    }

    return this.game;
  }

  keyPressed(info: { key: string; userId: number }) {
    const player =
      info.userId === this.game.playerA.id
        ? this.game.playerA
        : this.game.playerB;
    player.keyState[info.key] = true;
    return this.game;
  }

  keyReleased(info: { key: string; userId: number }) {
    const player =
      info.userId === this.game.playerA.id
        ? this.game.playerA
        : this.game.playerB;
    player.keyState[info.key] = false;
    return this.game;
  }
}

@Injectable()
export class PongService {
  private queue: Socket[] = []; // Socket[]
  private gameProviders: GameProvider[] = []; // Array to store game providers

  constructor(private prisma: PrismaService) {}

  private getClientIdFromClient(client: Socket): string {
    return client.handshake.query.clientId[0];
  }

  joinQueue(client: Socket) {
    client.on('disconnect', () => {
      this.leaveQueue(client);
    });
    console.log('client with id', this.getClientIdFromClient(client), 'joined');
    this.queue.push(client);

    // Check if there are at least two players in the queue
    if (this.queue.length >= 2) {
      const playerA = this.createPlayer(this.queue.shift());
      console.log(playerA.id);
      const playerB = this.createPlayer(this.queue.shift());
      playerB.x = playerB.canvas.width - playerB.width;
      this.createGameProvider(playerA, playerB);
      console.log(
        'emitted init-game to playerA',
        this.getClientIdFromClient(playerA.socket),
      );
      playerA.socket.emit('init-game');
      console.log(
        'emitted init-game to playerB',
        this.getClientIdFromClient(playerB.socket),
      );
      playerB.socket.emit('init-game');
      console.log('/****************************************************/');
    }
  }

  playWithAI(client: Socket) {
    const playerA = this.createPlayer(client);
    const playerB = new AIPlayer(
      -1 * playerA.id,
      playerA.canvas,
      3,
      new Ball(new Canvas()),
    );
    const game = this.createGameProvider(playerA, playerB);
    playerB.ball = game.game.ball;
    return game;
  }

  leaveQueue(client: Socket) {
    this.queue = this.queue.filter((socket) => socket !== client);
  }

  private createPlayer(client: Socket): Player {
    const userId = this.getClientIdFromClient(client); // Implement a function to get the user ID from the client
    const playerCanvas = new Canvas(); // Replace canvasWidth and canvasHeight with actual values
    return new Player(parseInt(userId), playerCanvas, client);
  }

  private createGameProvider(playerA: Player, playerB: Player) {
    const gameProvider = new GameProvider();
    gameProvider.id = this.gameProviders.length;
    gameProvider.init(playerA, playerB);
    this.gameProviders.push(gameProvider);
    return gameProvider;
  }

  removeGameProvider(gameProvider: GameProvider) {
    this.gameProviders = this.gameProviders.filter(
      (provider) => provider.id !== gameProvider.id,
    );
  }

  private getGameProviderByUserId(userId: number): GameProvider {
    return this.gameProviders.find(
      (gameProvider) =>
        gameProvider.game.playerA.id === userId ||
        gameProvider.game.playerB.id === userId,
    );
  }

  update(info: { userId: number; playerCanvas: Canvas }) {
    const gameProvider = this.getGameProviderByUserId(info.userId);
    if (!gameProvider) return null;
    const game = gameProvider.update(info);
    const { playerA, playerB } = game;
    if (playerA.score >= 7 || playerB.score >= 7) {
      playerA.socket.emit('game-over', {
        winner: playerA.score > playerB.score ? playerA.id : playerB.id,
      });
      playerB.socket.emit('game-over', {
        winner: playerA.score > playerB.score ? playerA.id : playerB.id,
      });
      this.removeGameProvider(gameProvider);
      return;
    }
    return game;
  }

  keyPressed(client: Socket, info: { key: string; userId: number }) {
    const gameProvider = this.getGameProviderByUserId(info.userId);
    if (gameProvider) gameProvider.keyPressed(info);
  }

  keyReleased(client: Socket, info: { key: string; userId: number }) {
    const gameProvider = this.getGameProviderByUserId(info.userId);
    if (gameProvider) gameProvider.keyReleased(info);
  }
}
