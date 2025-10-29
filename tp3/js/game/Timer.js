class Timer {
    constructor(ctx,getDifficulty, onTimeLimit, timeLimits) {
        this.startTime = null;
        this.intervalId = null;
        this.penaltyMs = 0;
        this.timeLimits = timeLimits
        this.ctx = ctx;
        this.getDifficulty = getDifficulty; // función que devuelve la dificultad actual
        this.onTimeLimit = onTimeLimit; // callback cuando se agota el tiempo
    }

    start() {
        this.startTime = Date.now();
        this.penaltyMs = 0; // reset penalizaciones al iniciar
    if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => this.update(), 200);
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
    }
    // Devuelve el tiempo transcurrido en ms, incluyendo penalizaciones
    getElapsed() {
        if (!this.startTime) return this.penaltyMs;
        return Date.now() - this.startTime + (this.penaltyMs || 0);
    }
    // Actualiza el timer y verifica límites
    update() {
        if (!this.startTime) return;
        const elapsed = this.getElapsed();
        this.draw(elapsed);

        const difficulty = (typeof this.getDifficulty === 'function') ? this.getDifficulty() : null;
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
        const text = `${minutes}:${seconds}`;

        const difficulty = (typeof this.getDifficulty === 'function') ? this.getDifficulty() : null;
        const limit = difficulty ? this.timeLimits[difficulty] : null;

        let highlightColor = "#000000ff";
        if (limit) {
            if (ms >= limit - 5000 && ms < limit) highlightColor = "#ffcc00"; 
            else if (ms >= limit) highlightColor = "#cc0000"; 
        }

        const boxW = 70;
        const boxH = 30;
        const x = 0;
        const y = 0;
        const offset = 2;
        const textColor = "#FFFFFF";

        const ctx = this.ctx;
        ctx.save();

        ctx.clearRect(x, y, boxW + 6, boxH + 6);

        ctx.globalAlpha = 1;
        ctx.fillRect(x + 2, y + 2, boxW, boxH);

        ctx.fillStyle = highlightColor;
        ctx.fillRect(x + 2, y + 2, boxW - offset, boxH - offset);

        ctx.fillStyle = textColor;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 2 + boxW / 2 - offset / 2, 2 + boxH / 2 - offset / 2);

        ctx.restore();
    }
}
