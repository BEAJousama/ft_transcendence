import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

class Canvas {
  public width: number;
  public height: number;
  constructor(canvas: Canvas) {
    this.width = canvas.width;
    this.height = canvas.height;
  }
}

class Ball {
  public x: number;
  public y: number;
  public speed: number;
  public velocity: {
    x: number;
    y: number;
  };
  constructor(canvas: Canvas) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.speed = 1;
    this.velocity = {
      x: 2,
      y: 2,
    };
  }
  reset(canvas: Canvas) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.speed = 1;
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
  constructor(id: number, canvas: Canvas) {
    this.id = id;
    this.width = 10;
    this.height = canvas.height / 5;
    this.x = 10;
    this.y = canvas.height / 2 - this.height / 2;
    this.canvas = new Canvas(canvas);
    // this.ball = new Ball(canvas);
    this.score = 0;
    this.interval = null;
    this.keyState = {
      ArrowUp: false,
      ArrowDown: false,
    };
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

@Injectable()
export class PongService {
  game: Game;

  paddleCol(
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number,
  ) {
    return (
      this.game.ball.x > rectX &&
      this.game.ball.x < rectX + rectWidth &&
      this.game.ball.y > rectY &&
      this.game.ball.y < rectY + rectHeight
    );
  }

  init(info: { userId: number; playerCanvas: Canvas }) {
    const player = new Player(info.userId, info.playerCanvas);
    if (!this.game) {
      //   console.log('playerA');
      this.game = new Game(player);
    } else {
      //   console.log('playerB');
      player.x = player.canvas.width - player.width - 10;
      this.game.playerB = player;
    }
    console.log(this.game);
    return this.game;
  }

  update(info: { userId: number; playerCanvas: Canvas }) {
    const { userId, playerCanvas } = info;
    if (!this.game || !this.game.playerB) return;

    if (userId === this.game.playerA.id) {
      // Update player A's position
      if (this.game.playerA.keyState['ArrowUp'] && this.game.playerA.y > 5) {
        this.game.playerA.y -= 5;
      } else if (
        this.game.playerA.keyState['ArrowDown'] &&
        this.game.playerA.y < playerCanvas.height - this.game.playerA.height - 5
      ) {
        this.game.playerA.y += 5;
      }
    } else {
      // Update player B's position
      if (this.game.playerB.keyState['ArrowUp'] && this.game.playerB.y > 5) {
        this.game.playerB.y -= 5;
      } else if (
        this.game.playerB.keyState['ArrowDown'] &&
        this.game.playerB.y < playerCanvas.height - this.game.playerB.height - 5
      ) {
        this.game.playerB.y += 5;
      }
    }

    this.game.ball.x += this.game.ball.velocity.x * this.game.ball.speed;
    this.game.ball.y += this.game.ball.velocity.y * this.game.ball.speed;

    // Check if ball hits top or bottom wall
    if (
      this.game.ball.y + this.game.ball.velocity.y >
        this.game.playerA.canvas.height - 10 ||
      this.game.ball.y + this.game.ball.velocity.y < 10
    ) {
      this.game.ball.velocity.y = -this.game.ball.velocity.y;
    }
    // Check if ball hits player A or B
    if (
      this.paddleCol(
        this.game.playerA.x,
        this.game.playerA.y,
        this.game.playerA.width,
        this.game.playerA.height,
      )
    ) {
      // Randomize the ball's velocity
      this.game.ball.velocity.x = Math.random() > 0.5 ? 2 : -2;
      this.game.ball.velocity.y = Math.random() > 0.5 ? 2 : -2;
      this.game.ball.speed += 0.1;
    }
    if (
      this.paddleCol(
        this.game.playerB.x,
        this.game.playerB.y,
        this.game.playerB.width,
        this.game.playerB.height,
      )
    ) {
      // Randomize the ball's velocity
      this.game.ball.velocity.x = Math.random() > 0.5 ? 2 : -2;
      this.game.ball.velocity.y = Math.random() > 0.5 ? 2 : -2;
      this.game.ball.speed += 0.1;
    }

    // Check if ball goes out of bounds (player A scores)
    if (this.game.ball.x > this.game.playerA.canvas.width) {
      this.game.playerA.score++;
      this.game.ball.reset(this.game.playerA.canvas);
      this.game.ball.velocity.x = -this.game.ball.velocity.x;
    }
    // Check if ball goes out of bounds (player B scores)
    if (this.game.ball.x < 0) {
      this.game.playerB.score++;
      this.game.ball.reset(this.game.playerB.canvas);
    }
    return this.game;
  }

  keyPressed(info: { key: string; userId: number }) {
    if (info.userId === this.game.playerA.id)
      this.game.playerA.keyState[info.key] = true;
    else this.game.playerB.keyState[info.key] = true;
    return this.game;
  }

  keyReleased(info: { key: string; userId: number }) {
    if (info.userId === this.game.playerA.id)
      this.game.playerA.keyState[info.key] = false;
    else this.game.playerB.keyState[info.key] = false;
    return this.game;
  }
}
