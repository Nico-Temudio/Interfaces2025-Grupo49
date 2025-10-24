class Ficha{
    /**
   * @param {Celda} celda - celda donde comienza la pieza
   * @param {Image} img - imagen a dibujar para la ficha
   * @param {string} id - identificador único
   */
    constructor(celda,img,id ,ctx){
        this.celda = celda; // referencia a la cell
        this.img = img;   // Image object
        this.id = id;
        this.size = celda.size * 0.86; // tamaño visual
        this.offsetX = 0; this.offsetY = 0; // offset durante el drag
        this.isDragging = false;
        this.ctx = ctx;
        
    }
    draw(){


        const drawX = (this.celda.x + this.offsetX) - this.size/2;
        const drawY = (this.celda.y + this.offsetY) - this.size/2;
        this.ctx.save();
        this.celda.roundRect(this.ctx, drawX, drawY, this.size, this.size, this.size*0.18);
        this.ctx.clip();
        // dibuja la imagen
        try{
        this.ctx.drawImage(this.img, drawX, drawY, this.size, this.size);
        }catch(e){
        // en caso de error, dibujar fallback
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(drawX, drawY, this.size, this.size);
        }
        this.ctx.restore();

        // si arrastrando, dibujar sombra simple
        if(this.isDragging){
        this.ctx.save();
        this.ctx.globalAlpha = 0.12;
        roundRect(ctx, drawX+6, drawY+8, this.size, this.size, this.size*0.18);
        this.ctx.fill();
        this.ctx.restore();
        }
        // super.draw();
        // this.ctx.beginPath();
        // this.ctx.arc(this.posX, this.posY, this.radio, 0, Math.PI * 2);
        // this.ctx.closePath();
        // this.ctx.fill();
        // this.img.onload = () => {
        //   this.ctx.save(); // guarda el estado del canvas
        //     this.ctx.beginPath();
        //     this.ctx.arc(this.posX, this.posY, this.radio, 0, Math.PI * 2);
        //     this.ctx.closePath();
        //     this.ctx.clip(); // todo lo que se dibuje queda dentro del círculo

        //     // Dibuja la imagen centrada dentro del círculo
        //     this.ctx.drawImage(
        //         this.img,
        //         this.posX - this.radio,
        //         this.posY - this.radio,
        //         this.radio * 2,
        //         this.radio * 2
        //     );

        //     this.ctx.restore();
        //     this.ctx.lineWidth = 1;
        //     this.ctx.strokeStyle = 'red';
        //     this.ctx.stroke();
        // };
    } 
    /** Obtiene el centro actual en canvas (considerando offset). */
    getCenter(){
        return {x: this.cell.x + this.offsetX, y: this.cell.y + this.offsetY};
    }   
    // getFill() {
    //     return this.fill;
    // }

    // getRadius() {
    //     return this.radius;
    // }

    // isPointInside(x, y) {
    //     let _x = this.posX - x;
    //     let _y = this.posY - y;
    //     return Math.sqrt(_x * _x + _y * _y) < this.radius;
    // }

    // getPosition() {
    //     return {
    //         x: this.posX,
    //         y: this.posY
    //     }
    // }

    // setPosition(x, y) {
    //     this.posX = x;
    //     this.posY = y;
    // }

    // getPosX() {
    //     return this.posX;
    // }

    // getPosY() {
    //     return this.posY;
    // }

    // getImg() {
    //     return this.source;
    // }

    // isPointInside(x, y) {
    //     let xd = this.posX - x;
    //     let yd = this.posY - y;
    //     let distance = Math.sqrt(xd * xd + yd * yd);

    //     return distance <= this.radius;
    // }
}