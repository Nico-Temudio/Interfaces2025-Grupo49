class Timer {
    constructor(elementId, getDifficulty, onTimeLimit, timeLimits) {
        this.startTime = null;
        this.intervalId = null;
        this.penaltyMs = 0;
        this.timeLimits = timeLimits;
        // Referencia al elemento DOM donde se mostrará el tiempo
        this.displayElement = document.getElementById(elementId); 
        this.getDifficulty = getDifficulty; // función que devuelve la dificultad actual
        this.onTimeLimit = onTimeLimit; // callback cuando se agota el tiempo
        
        // Inicializa el elemento con el texto por defecto
        if (this.displayElement) {
            this.displayElement.textContent = "TIEMPO: 00:00";
        }
    }

    start() {
        this.startTime = Date.now();
        this.penaltyMs = 0; // reset penalizaciones al iniciar
        if (this.intervalId) clearInterval(this.intervalId);
        // Intervalo de actualización más rápido para el display (100ms)
        this.intervalId = setInterval(() => this.update(), 100); 
        this.update();
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.startTime = null;
    }

    addPenalty(ms) {
        this.penaltyMs += ms;
        // Forzar una actualización para reflejar la penalización inmediatamente
    }

    // Devuelve el tiempo transcurrido en ms, incluyendo penalizaciones
    getElapsed() {
        if (!this.startTime) return this.penaltyMs;
        return Date.now() - this.startTime + (this.penaltyMs || 0);
    }

    // Actualiza el timer y verifica límites
    update() {
        if (!this.displayElement) {
            this.stop();
            console.error("Elemento de visualización del timer no encontrado.");
            return;
        }
        if (!this.startTime) return;

        const elapsed = this.getElapsed();
        this.draw(elapsed);

        const difficulty = (typeof this.getDifficulty === 'function') ? this.getDifficulty() : null;
        // Asume que los límites de tiempo están en milisegundos
        const limit = difficulty ? this.timeLimits[difficulty] : null; 
        
        if (limit && elapsed >= limit) {
            this.stop();
            // Llama al callback de tiempo límite
            if (typeof this.onTimeLimit === 'function') this.onTimeLimit(elapsed);
        }
    }

    draw(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        const text = `TIEMPO: ${minutes}:${seconds}`;

        // Obtener dificultad y límite para aplicar estilos
        const difficulty = (typeof this.getDifficulty === 'function') ? this.getDifficulty() : null;
        const limit = difficulty ? this.timeLimits[difficulty] : null;

        // Limpiar clases de estilo previas
        this.displayElement.classList.remove('timer-warning', 'timer-limit');

        if (limit) {
            if (ms >= limit - 5000 && ms < limit) {
                // Faltan 5 segundos o menos
                this.displayElement.classList.add('timer-warning');
            } else if (ms >= limit) {
                // Tiempo agotado
                this.displayElement.classList.add('timer-limit');
            }
        }

        this.displayElement.textContent = text;
    }
}
