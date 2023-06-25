import { Canvas } from './canvas';

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

export { Ball };
