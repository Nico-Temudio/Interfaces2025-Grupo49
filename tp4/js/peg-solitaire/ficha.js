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
        this.size = celda.size ; // tamaño visual
        this.offsetX = 0; this.offsetY = 0; // offset durante el drag
        this.isDragging = false;
        this.ctx = ctx;
        
    }
    draw(){

        // Usaremos el radio para determinar el tamaño del área de dibujo
        const radio = this.size / 2.5;
        const diametro = radio * 2; // El ancho y alto de la imagen a dibujar

        // El centro de dibujo debe incluir el desplazamiento (offsetX/Y)
        const centerX = this.celda.x + this.offsetX;
        const centerY = this.celda.y + this.offsetY;

        // drawX/Y es la esquina superior izquierda del cuadrado donde se dibujará la imagen
        // Se calcula restando el radio (media del diámetro) al centro.
        const drawX = centerX - radio;
        const drawY = centerY - radio;

        this.ctx.save();
        this.ctx.beginPath();
        // Círculo de recorte
        this.ctx.arc(centerX, centerY, radio, 0, Math.PI * 2);
        this.ctx.clip();

        // dibuja la imagen
        try{
            // Dibuja la imagen desde la esquina superior izquierda (drawX/Y) con el tamaño del diámetro.
            // Esto asegura que la imagen se centre perfectamente dentro del círculo de recorte.
            this.ctx.drawImage(this.img, drawX, drawY, diametro, diametro);
        }catch(e){
            // en caso de error, dibujar fallback
            this.ctx.fillStyle = '#444';
            this.ctx.fillRect(drawX, drawY, diametro, diametro);
        }
        this.ctx.restore();

    }
    /** Obtiene el centro actual en canvas (considerando offset). */
    getCenter(){
        return {x: this.cell.x + this.offsetX, y: this.cell.y + this.offsetY};
    }   
}