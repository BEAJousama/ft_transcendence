class Canvas {
  public width: number;
  public height: number;
  constructor(canvas = { width: 650, height: 480 }) {
    this.width = canvas.width;
    this.height = canvas.height;
  }
}

export { Canvas };
