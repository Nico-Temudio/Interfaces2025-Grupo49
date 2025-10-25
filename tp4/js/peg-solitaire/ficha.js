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
        
        const radio = this.size / 2;
        // El centro de dibujo debe incluir el desplazamiento (offsetX/Y)
        const centerX = this.celda.x + this.offsetX; 
        const centerY = this.celda.y + this.offsetY; 
        
        // drawX/Y es la esquina superior izquierda de la imagen
        const drawX = centerX - radio;
        const drawY = centerY - radio;

        this.ctx.save();
        this.ctx.beginPath();
        // **CORRECCIÓN CLAVE:** Usar centerX y centerY para el círculo
        this.ctx.arc(centerX, centerY, radio, 0, Math.PI * 2); 
        this.ctx.clip(); 
        
        // dibuja la imagen
        try{
            // La imagen se dibuja desde la esquina superior izquierda (drawX/Y)
            this.ctx.drawImage(this.img, drawX, drawY, this.size, this.size);
        }catch(e){
            // en caso de error, dibujar fallback
            this.ctx.fillStyle = '#444';
            this.ctx.fillRect(drawX, drawY, this.size, this.size);
        }
        this.ctx.restore();

        // si arrastrando, dibujar sombra simple
        
    }
    /** Obtiene el centro actual en canvas (considerando offset). */
    getCenter(){
        return {x: this.cell.x + this.offsetX, y: this.cell.y + this.offsetY};
    }   
}