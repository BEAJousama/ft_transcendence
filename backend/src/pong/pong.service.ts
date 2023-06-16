import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

class Canvas {
  public width: number;
  public height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
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
  constructor(x: number, y: number, speed: number) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.velocity = {
      x: speed,
      y: speed,
    };
  }
}

class Player {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public score: number;
  public speed: number;
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    speed: number,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.score = 0;
    this.speed = speed;
  }
}

class Game {
  public canvas: Canvas;
  public ball: Ball;
  public player: Player;
  public opponent: Player;
  constructor(canvas: Canvas, ball: Ball, player: Player, opponent: Player) {
    this.canvas = canvas;
    this.ball = ball;
    this.player = player;
    this.opponent = opponent;
  }
}

@Injectable()
export class PongService {
  game: Game;

  init(info: { canvasWidth: number; canvasHeight: number }) {
    const canvas = new Canvas(info.canvasWidth, info.canvasHeight);
    const ball = new Ball(canvas.width / 2, canvas.height / 2, 5);
    const player = new Player(10, canvas.height / 2 - 50, 10, 100, 5);
    const opponent = new Player(
      canvas.width - 20,
      canvas.height / 2 - 50,
      10,
      100,
      5,
    );
    this.game = new Game(canvas, ball, player, opponent);
    return this.game;
  }

  update() {
    console.log('update');
    return this.game;
  }

  keyPressed(info: { key: string; userId: User }) {
    console.log(info);
    if (info.key === 'ArrowUp') {
      this.game.player.y -= this.game.player.speed;
    }
    if (info.key === 'ArrowDown') {
      this.game.player.y += this.game.player.speed;
    }
    return this.game;
  }
}
