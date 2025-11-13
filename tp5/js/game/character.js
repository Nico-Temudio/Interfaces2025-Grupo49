class Character {
    constructor(element) {
        this.element = element;
        
        // --- PROPIEDADES FÍSICAS Y CONSTANTES ---
        this.gravity = 0.5;
        this.jumpStrength = -10; // Fuerza del salto (negativo para ir hacia arriba)
        this.floorOffset = 50;   // Altura del "piso" desde el borde inferior
        this.maxSpeed = 1.5;     // Velocidad horizontal máxima
        this.acceleration = 0.1; // Tasa de aceleración

        // --- ESTADO INICIAL ---
        this.reset();
    }

    reset() {
        // Inicializa la posición y velocidad del personaje
        this.posX = 100;
        this.posY = 200;
        this.velocityY = 0;
        this.speedX = 0;
        this.updateDOM();
    }

    jump() {
        // Solo permite saltar si está cerca del "piso" (o en el piso)
        if (this.velocityY === 0) {
            this.velocityY = this.jumpStrength;
        }
    }

    moveRight() {
        if (this.speedX < this.maxSpeed) {
            this.speedX += this.acceleration;
        }
    }

    moveLeft() {
        if (this.speedX > -this.maxSpeed) {
            this.speedX -= this.acceleration;
        }
    }

    slowDown() {
        // Desaceleración al soltar la tecla (fricción alta para detener rápido)
        this.speedX *= 0.5;
    }

    updatePhysics(containerRect) {
        const charW = this.element.offsetWidth;
        const charH = this.element.offsetHeight;
        
        // 1. Aplicar Física (Gravedad y Velocidad)
        this.velocityY += this.gravity;
        this.posY += this.velocityY;
        this.posX += this.speedX;
        
        // 2. Límites y Colisión con Piso (El piso está a containerRect.height - this.floorOffset)
        const floorY = containerRect.height - this.floorOffset - charH;

        if (this.posY >= floorY) {
            this.posY = floorY;
            this.velocityY = 0; // Detener la caída y permitir el salto
        }
        
        // Límites superiores
        if (this.posY < 0) this.posY = 0;

        // Límites laterales
        if (this.posX < 0) {
            this.posX = 0;
            this.speedX = 0; // Detener el movimiento si choca con la pared
        }
        if (this.posX + charW > containerRect.width) {
            this.posX = containerRect.width - charW;
            this.speedX = 0; // Detener el movimiento si choca con la pared
        }
        
        // 3. Actualizar DOM
        this.updateDOM();
    }

    updateDOM() {
        this.element.style.left = `${this.posX}px`;
        this.element.style.top = `${this.posY}px`;
    }
}