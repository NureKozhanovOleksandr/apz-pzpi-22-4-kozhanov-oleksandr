interface Shape {
  render(ctx: CanvasRenderingContext2D): void;
}
class Rectangle implements Shape {
  constructor(private x: number, private y: number, private w: number, private h: number) {}
  render(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}
