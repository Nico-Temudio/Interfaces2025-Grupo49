class Celda{
    /**
   * @param {number} r - fila
   * @param {number} c - columna
   * @param {number} x - coordenada x en canvas (centro)
   * @param {number} y - coordenada y en canvas (centro)
   * @param {number} size - tamaño de la celda
   * @param {boolean} valid - si la celda es utilizable en el juego
   */
    constructor(r,c,x,y,size,valid,ctx){
    this.r = r; this.c = c; this.x = x+5; this.y = y+5; this.size = size; this.valid = valid;
    this.ficha = null; // referencia a Piece si existe
    this.ctx = ctx
  }
   draw(){
    this.ctx.save();
    // borde sutil
    this.ctx.beginPath();
    const cx = this.x  // centro X del casillero
    const cy = this.y  // centro Y del casillero
    const radius = this.size / 2.4;     // tamaño del círculo
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.valid ? 'rgba(176, 176, 176, 0)' : '#0000';              // color de relleno gris
    this.ctx.fill();

    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = this.valid ? 'rgba(255, 150, 150, 0)' : 'rgba(0,0,0,0)';
    this.ctx.stroke();
    this.ctx.restore();
  }
}