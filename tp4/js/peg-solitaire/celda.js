class Celda{

    constructor(r,c,x,y,size,valid,ctx){
    this.r = r; this.c = c; this.x = x+5; this.y = y+5; this.size = size; this.valid = valid;
    this.ficha = null;
    this.ctx = ctx
  }
   draw(){
    this.ctx.save();
    this.ctx.beginPath();
    const cx = this.x  
    const cy = this.y  
    const radius = this.size / 2.4;     // tamaño del círculo
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.valid ? 'rgba(176, 176, 176, 0)' : '#0000'; 
    this.ctx.fill();

    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = this.valid ? 'rgba(255, 150, 150, 0)' : 'rgba(0,0,0,0)';
    this.ctx.stroke();
    this.ctx.restore();
  }
}