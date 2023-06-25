import { Ball } from './ball';
import { Canvas } from './canvas';
import { Player } from './player';

class AIPlayer extends Player {
  public ball: Ball;
  public interval: NodeJS.Timeout;
  constructor(id: number, canvas: Canvas, difficulty: number, ball: Ball) {
    super(id, canvas, null);
    this.speed = 5;
    this.keyState = {
      ArrowUp: false,
      ArrowDown: false,
    };
    this.ball = ball;
    this.interval = setInterval(() => {
      const ball = this.ball;
      const paddleCenter = this.y + this.height / 2;
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

export { AIPlayer };
