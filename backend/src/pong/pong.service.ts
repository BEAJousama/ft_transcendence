import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

class ball {
  public x;
  public y;
  public radius;
  public velocityX;
  public velocityY;
  public speed;
  public color;
  public canvas_width;
  public canvas_height;
  constructor(width, height) {
    this.x = width / 2;
    this.y = height / 2;
    this.radius = 10;
    this.velocityX = 5;
    this.velocityY = 5;
    this.speed = 7;
    this.color = 'WHITE';
    this.canvas_width = width;
    this.canvas_height = height;
  }
  reset() {
    this.x = this.canvas_width / 2;
    this.y = this.canvas_height / 2;
    this.radius = 10;
    this.velocityX = 5;
    this.velocityY = 5;
    this.speed = 7;
    this.color = 'WHITE';
  }
}

class user {
  public x;
  public y;
  public score;
  public movespeed;
  public height;
  public width;
  constructor(x, height, width) {
    this.x = x;
    this.y = height / 2 - 50;
    this.height = height;
    this.width = width;
    this.score = 0;
    this.movespeed = 50;
  }
  moveup() {
    if (this.y > 0) this.y -= this.movespeed;
  }
  movedown() {
    if (this.y < this.height - 100) this.y += this.movespeed;
  }
  reset(x) {
    this.x = x;
    this.y = this.height / 2 - 50;
  }
}

@Injectable()
export class PongService {
  private player1: user;
  private player2: user;
  private _ball: ball;
  constructor(private prisma: PrismaService) {}
  // 1 - game rules :
  /* 
    Each game is played up to a certain number of points, such as 11 points.
    The first player to reach the winning score (11 points) wins the game.
    If the score reaches a tie (10-10), the game continues until one player has a two-point lead (12-10).
  */

  // 2 - Point Adjustments:  :
  /*
    * When a player wins a game, they earn points based on the ladder level of their opponent.
        - If a player wins against an opponent with a lower ladder level, they earn a base amount of points (50 points).
        - If a player wins against an opponent with the same ladder level, they earn a slightly higher amount of points (75 points).
        - If a player wins against an opponent with a higher ladder level, they earn an even higher amount of points (100 points).
    * When a player loses a game, they lose points based on the ladder level of their opponent.
        - If a player loses against an opponent with a lower ladder level, they lose a base amount of points (150 points).
        - If a player loses against an opponent with the same ladder level, they lose a slightly higher amount of points (100 points).
        - If a player loses against an opponent with a higher ladder level, they lose an even higher amount of points (50 points).
  */
  wallCol(
    pointX: number,
    pointY: number,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number,
  ) {
    return (
      pointX >= rectX &&
      pointX <= rectX + rectWidth &&
      pointY >= rectY &&
      pointY <= rectY + rectHeight
    );
  }

  reset() {
    this.player1.reset(0);
    this.player2.reset(this.player1.width - 40);
    this._ball.reset();
  }

  update(info) {
    if (!this.player1 || !this.player2 || !this._ball) {
      return {
        player1: this.player1,
        player2: this.player2,
        ball: this._ball,
      };
    }
    const keys = info;
    // console.log(keys);
    this._ball.x += this._ball.velocityX;
    this._ball.y += this._ball.velocityY;

    // protection
    if (
      this._ball.y + this._ball.radius > this.player1.height ||
      this._ball.y - this._ball.radius < 0
    )
      this._ball.velocityY = -this._ball.velocityY;
    else if (
      this.wallCol(
        this._ball.x + this._ball.radius,
        this._ball.y,
        this.player2.x,
        this.player2.y,
        40,
        100,
      ) ||
      this.wallCol(
        this._ball.x - this._ball.radius,
        this._ball.y,
        this.player1.x,
        this.player1.y,
        40,
        100,
      )
    )
      this._ball.velocityX = -this._ball.velocityX;
    if (this._ball.x - this._ball.radius < 0) {
      // still need to check if any of the players have lost
      this.player2.score++;
      this.reset();
    } else if (this._ball.x + this._ball.radius > this.player1.width) {
      this.player1.score++;
      this.reset();
    }

    if (keys.w) this.player1.moveup();
    else if (keys.s) this.player1.movedown();
    if (keys.up) this.player2.moveup();
    else if (keys.down) this.player2.movedown();

    return {
      player1: this.player1,
      player2: this.player2,
      ball: this._ball,
    };
  }

  calculateRating(winner: User, loser: User) {
    if (winner.rating > loser.rating) {
      winner.rating += 50;
      loser.rating -= 50;
    } else if (winner.rating === loser.rating) {
      winner.rating += 75;
      loser.rating -= 100;
    } else if (winner.rating < loser.rating) {
      winner.rating += 100;
      loser.rating -= 50;
    }
    return {
      winner,
      loser,
    };
  }

  // 3 - Ladder Level Adjustments:
  /* 
    from begginer to amateur
     * 0 - 500
    from amteur to semi-professional
     * 500 - 1200
    from semi-professional to professional
     * 1200 - 3500
    from professional to worldclass
     * 3500 - 7000
    from worldclass to legendary
     * 7000 - 10000
  */

  initialize({ width, height }) {
    this.player1 = new user(0, height, width);
    this.player2 = new user(width - 40, height, width);
    this._ball = new ball(width, height);
    return {
      player1: this.player1,
      player2: this.player2,
      ball: this._ball,
    };
  }
  async updateRating(winner: User, loser: User) {
    winner.wins++;
    loser.losses++;
  }

  async updatePlayerScores(game) {}

  async updateWinnerAndLoser(winner: User, loser: User) {
    try {
      // Get the game with the winner and loser
      const game = await this.prisma.game.findFirst({
        where: {
          winner: {
            is: null,
          },
        },
      });

      // Update the game with the winner and loser
      await this.prisma.game.update({
        where: { id: game.id },
        data: {
          winner: {
            connect: { id: winner.id },
          },
          loser: {
            connect: { id: loser.id },
          },
        },
      });

      return game;
    } catch (e) {}
  }

  async createGame(player1: User, player2: User) {
    try {
      const game = await this.prisma.game.create({
        data: {
          player1: {
            connect: { id: player1.id }, // Connects the game to the Player with ID 12 as player1
          },
          player2: {
            connect: { id: player2.id }, // Connects the game to the Player with ID 13 as player2
          },
          duration: 0, // Set the duration of the game in seconds
        },
      });
      return game;
    } catch (error) {
      // Handle any errors that occur during the game creation process
      console.error(error);
      throw new Error('Failed to create the game.');
    }
  }
}
