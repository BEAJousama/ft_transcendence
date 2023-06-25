import { Canvas } from './canvas';
import { Socket } from 'socket.io';

class Player {
  public id: number;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public canvas: Canvas;
  public score: number;
  public speed: number;
  public keyState: {
    ArrowUp: boolean;
    ArrowDown: boolean;
  };
  public socket: Socket | null;
  constructor(id: number, canvas: Canvas, socket: Socket | null) {
    this.id = id;
    this.width = 10;
    this.height = canvas.height / 5;
    this.x = 0;
    this.y = canvas.height / 2 - this.height / 2;
    this.canvas = new Canvas(canvas);
    this.score = 0;
    this.keyState = {
      ArrowUp: false,
      ArrowDown: false,
    };
    this.socket = socket;
  }
}

export { Player };
