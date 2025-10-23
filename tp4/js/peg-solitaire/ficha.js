class Ficha extends Figura{
    constructor(posX,posY,fill,context,radio,img){
        super (posX,posY,fill,context);
        this.radio = radio;
        this.source = img;
        this.img = new Image();
        this.img.src = img;
        
    }
    draw(){
        super.draw();
        this.ctx.beginPath();
        this.ctx.arc(this.posX, this.posY, this.radio, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.img.onload = () => {
          this.ctx.save(); // guarda el estado del canvas
            this.ctx.beginPath();
            this.ctx.arc(this.posX, this.posY, this.radio, 0, Math.PI * 2);
            this.ctx.closePath();
            this.ctx.clip(); // todo lo que se dibuje queda dentro del círculo

            // Dibuja la imagen centrada dentro del círculo
            this.ctx.drawImage(
                this.img,
                this.posX - this.radio,
                this.posY - this.radio,
                this.radio * 2,
                this.radio * 2
            );

            this.ctx.restore();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = 'red';
            this.ctx.stroke();
        };
    }    
    getFill() {
        return this.fill;
    }

    getRadius() {
        return this.radius;
    }

    isPointInside(x, y) {
        let _x = this.posX - x;
        let _y = this.posY - y;
        return Math.sqrt(_x * _x + _y * _y) < this.radius;
    }

    getPosition() {
        return {
            x: this.posX,
            y: this.posY
        }
    }

    setPosition(x, y) {
        this.posX = x;
        this.posY = y;
    }

    getPosX() {
        return this.posX;
    }

    getPosY() {
        return this.posY;
    }

    getImg() {
        return this.source;
    }

    isPointInside(x, y) {
        let xd = this.posX - x;
        let yd = this.posY - y;
        let distance = Math.sqrt(xd * xd + yd * yd);

        return distance <= this.radius;
    }
}