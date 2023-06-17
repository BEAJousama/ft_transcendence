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
  public radius: number = 10;
  public speed: number;
  public velocity: {
    x: number;
    y: number;
  };
  constructor(canvas: Canvas) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.speed = 10;
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
  constructor(id: number, canvas: Canvas) {
    this.id = id;
    this.width = 10;
    this.height = canvas.height / 5;
    this.x = 0;
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

// @Injectable()
// export class PongService {
//   game: Game;

//   init(info: { userId: number; playerCanvas: Canvas }) {
//     const player = new Player(info.userId, info.playerCanvas);
//     if (!this.game) {
//       //   console.log('playerA');
//       this.game = new Game(player);
//     } else {
//       //   console.log('playerB');
//       player.x = player.canvas.width - player.width - 10;
//       this.game.playerB = player;
//     }
//     console.log(this.game);
//     return this.game;
//   }

//   paddleCol(player: Player) {
//     const ballRight = this.game.ball.x + this.game.ball.radius;
//     const ballLeft = this.game.ball.x - this.game.ball.radius;
//     const paddleRight = player.x + player.width;
//     const paddleLeft = player.x;

//     if (player === this.game.playerA) {
//       return (
//         ballLeft <= paddleRight &&
//         ballRight > paddleRight &&
//         this.game.ball.y + this.game.ball.radius > player.y &&
//         this.game.ball.y - this.game.ball.radius < player.y + player.height
//       );
//     } else if (player === this.game.playerB) {
//       return (
//         ballRight >= paddleLeft &&
//         ballLeft < paddleLeft &&
//         this.game.ball.y + this.game.ball.radius > player.y &&
//         this.game.ball.y - this.game.ball.radius < player.y + player.height
//       );
//     }

//     return false;
//   }

//   ballChangedDirection = false;

//   ballInMiddle() {
//     return (
//       this.game.ball.x + this.game.ball.radius > this.game.playerA.x &&
//       this.game.ball.x - this.game.ball.radius <
//         this.game.playerB.x + this.game.playerB.width
//     );
//   }

//   update(info: { userId: number; playerCanvas: Canvas }) {
//     const { userId, playerCanvas } = info;
//     if (!this.game || !this.game.playerB) return;

//     if (userId === this.game.playerA.id) {
//       // Update player A's position
//       if (this.game.playerA.keyState['ArrowUp'] && this.game.playerA.y > 5) {
//         this.game.playerA.y -= 5;
//       } else if (
//         this.game.playerA.keyState['ArrowDown'] &&
//         this.game.playerA.y < playerCanvas.height - this.game.playerA.height - 5
//       ) {
//         this.game.playerA.y += 5;
//       }
//     } else {
//       // Update player B's position
//       if (this.game.playerB.keyState['ArrowUp'] && this.game.playerB.y > 5) {
//         this.game.playerB.y -= 5;
//       } else if (
//         this.game.playerB.keyState['ArrowDown'] &&
//         this.game.playerB.y < playerCanvas.height - this.game.playerB.height - 5
//       ) {
//         this.game.playerB.y += 5;
//       }
//     }

//     this.game.ball.x += this.game.ball.velocity.x * this.game.ball.speed;
//     this.game.ball.y += this.game.ball.velocity.y * this.game.ball.speed;

//     // Check if ball hits top or bottom wall
//     if (
//       this.game.ball.y + this.game.ball.velocity.y >
//         this.game.playerA.canvas.height - 10 ||
//       this.game.ball.y + this.game.ball.velocity.y < 10
//     ) {
//       this.game.ball.velocity.y = -this.game.ball.velocity.y;
//     }
//     // Check if ball hits player A or B
//     if (
//       (this.paddleCol(this.game.playerA) ||
//         this.paddleCol(this.game.playerB)) &&
//       !this.ballChangedDirection
//     ) {
//       this.ballChangedDirection = true;
//       // Randomize the ball's velocity
//       this.game.ball.velocity.x = Math.random() > 0.5 ? 2 : -2;
//       this.game.ball.velocity.y = Math.random() > 0.5 ? 2 : -2;
//       this.game.ball.speed += 0.1;
//     }

//     // Check if ball goes out of bounds (player A scores)
//     if (this.game.ball.x > this.game.playerA.canvas.width) {
//       this.game.playerA.score++;
//       this.game.ball.reset(this.game.playerA.canvas);
//       this.game.ball.velocity.x = -this.game.ball.velocity.x;
//     }
//     // Check if ball goes out of bounds (player B scores)
//     if (this.game.ball.x < 0) {
//       this.game.playerB.score++;
//       this.game.ball.reset(this.game.playerB.canvas);
//       this.game.ball.velocity.x = -this.game.ball.velocity.x;
//     }

//     if (this.ballInMiddle()) {
//       this.ballChangedDirection = false;
//     }
//     return this.game;
//   }

//   keyPressed(info: { key: string; userId: number }) {
//     if (info.userId === this.game.playerA.id)
//       this.game.playerA.keyState[info.key] = true;
//     else this.game.playerB.keyState[info.key] = true;
//     return this.game;
//   }

//   keyReleased(info: { key: string; userId: number }) {
//     if (info.userId === this.game.playerA.id)
//       this.game.playerA.keyState[info.key] = false;
//     else this.game.playerB.keyState[info.key] = false;
//     return this.game;
//   }
// }

@Injectable()
export class PongService {
  game: Game;
  ballChangedDirection = false;
  ballDirection: number = -1;
  constructor() {
    this.game = null;
  }

  init(info: { userId: number; playerCanvas: Canvas }) {
    const { userId, playerCanvas } = info;
    const player = new Player(userId, playerCanvas);

    if (!this.game) {
      this.game = new Game(player);
    } else {
      player.x = player.canvas.width - player.width;
      this.game.playerB = player;
    }

    console.log('init ', this.game);
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

    if (player.keyState['ArrowUp'] && player.y > 5) {
      player.y -= 5;
    } else if (
      player.keyState['ArrowDown'] &&
      player.y < height - player.height - 5
    ) {
      player.y += 5;
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
      console.log(ball.velocity);
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
