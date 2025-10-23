class Figura{
    constructor(posX,posY,fill,context){
        this.posX = posX;
        this.posY = posY;
        this.fill = fill;
        this.ctx = context;
    }
     setFill(fill){
        this.fill = fill;
    } 
    setPosition(x, y){
        this.posX = x;
        this.posY = y;
    }
    getPosition(){
        return {
            x: this.posX,
            y: this.posY
        };
    }
    getPosX(){
        return this.posX;
    }
    getPosY(){
        return this.posY;
    }
    getFill(){
        return this.fill;
    }
    draw(){
        this.ctx.fillStyle = this.fill;
    }
    isPointInside(x, y){ }
}