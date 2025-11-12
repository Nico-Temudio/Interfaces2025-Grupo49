document.addEventListener("DOMContentLoaded", () => {
    // === ELEMENTOS DEL DOM ===
    const container = document.querySelector(".solitario-container");
    const playBtn = document.querySelector(".play");
    const menuConfig = document.getElementById("menu-config");
    const startBtn = document.getElementById("btnIniciar");
    const exitBtn = document.getElementById("exit-game");
    const configBtn = document.getElementById("config-game");
    const tiempoSelect = document.getElementById("tiempolimite");
    const character = document.querySelector(".character");
    const tubo1 = document.querySelector(".tubo1");
    const preview = container.querySelector("img");
    const scoreDisplay = document.getElementById("movimientos");
    const timerDisplay = document.getElementById("timer");

    // === VARIABLES DE JUEGO ===
    let playing = false;
    let posX = 100;
    let posY = 200;
    let velocityY = 0;
    const gravity = 0.4;
    const jumpStrength = -7;
    let speedX = 0;
    const maxSpeed = 3;
    const acceleration = 0.2;
    let score = 0;
    let timeLimit = 0;
    let remainingTime = 0;
    let timerInterval = null;
    let tuboX = 0;
    let tuboPassed = false;

    // === ESTADO INICIAL ===
    function showMenu() {
        playing = false;
        clearInterval(timerInterval);
        preview.style.display = "block";
        playBtn.style.display = "block";
        menuConfig.style.display = "none";
        character.style.display = "none";
        tubo1.style.display = "none";
        scoreDisplay.style.display = "none";
        timerDisplay.style.display = "none";
        // MODIFICACIÓN: Ocultar botones de juego en el menú principal
        exitBtn.style.display = "none"; 
        configBtn.style.display = "none"; 
    }

    showMenu();

    // === MOSTRAR CONFIGURACIÓN (Desde el botón "Play") ===
    playBtn.addEventListener("click", () => {
        playBtn.style.display = "none";
        preview.style.display = "none";
        menuConfig.style.display = "block";
        // Los botones exitBtn/configBtn ya están ocultos por showMenu()
    });

    // === INICIAR JUEGO ===
    startBtn.addEventListener("click", () => {
        const option = tiempoSelect.value;
        timeLimit = option === "10m" ? 600 : 300; // 600 o 300 segundos
        remainingTime = timeLimit;

        menuConfig.style.display = "none";
        character.style.display = "block";
        tubo1.style.display = "block";
        scoreDisplay.style.display = "block";
        timerDisplay.style.display = "block";
        // MODIFICACIÓN: Mostrar botones de juego
        exitBtn.style.display = "block"; 
        configBtn.style.display = "block"; 

        startGame();
    });

    // === SALIR AL MENÚ ===
    exitBtn.addEventListener("click", showMenu);

    // === CONFIGURACIÓN DURANTE JUEGO ===
    configBtn.addEventListener("click", () => {
        playing = false;
        clearInterval(timerInterval);
        menuConfig.style.display = "block";
        // MODIFICACIÓN: Ocultar botones de juego al entrar en configuración
        exitBtn.style.display = "none"; 
        configBtn.style.display = "none"; 
    });

    // === INICIO Y RESETEO DE PARTIDA ===
    function startGame() {
        playing = true;
        posX = 100;
        posY = 200;
        velocityY = 0;
        speedX = 0;
        score = 0;
        tuboPassed = false;
        scoreDisplay.textContent = "Puntaje: 0";
        tuboX = container.getBoundingClientRect().width;

        startTimer();
        update();
    }

    // === TEMPORIZADOR REGRESIVO ===
    function startTimer() {
        clearInterval(timerInterval);
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            if (!playing) return;
            remainingTime--;

            if (remainingTime <= 0) {
                remainingTime = 0;
                endGame();
                return;
            }

            updateTimerDisplay();
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = String(Math.floor(remainingTime / 60)).padStart(2, "0");
        const seconds = String(remainingTime % 60).padStart(2, "0");
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    // === FINALIZAR PARTIDA ===
    function endGame() {
        playing = false;
        clearInterval(timerInterval);

        alert(`⏰ ¡Tiempo agotado!\nTu puntaje final fue: ${score}`);
        showMenu();
    }

    // === SALTO ===
    function jump() {
        velocityY = jumpStrength;
    }

    // === LOOP PRINCIPAL ===
    function update() {
        if (!playing) return;

        const rect = container.getBoundingClientRect();
        const charW = character.offsetWidth;
        const charH = character.offsetHeight;

        // Física del pájaro
        velocityY += gravity;
        posY += velocityY;
        posX += speedX;

        // Límites del contenedor
        if (posY + charH > rect.height) {
            posY = rect.height - charH;
            velocityY = 0;
        }
        if (posY < 0) posY = 0;
        if (posX < 0) posX = 0;
        if (posX + charW > rect.width) posX = rect.width - charW;

        // Actualizar posición
        character.style.left = `${posX}px`;
        character.style.top = `${posY}px`;

        // === Movimiento del tubo ===
        tuboX -= 2;
        if (tuboX < -80) {
            tuboX = rect.width;
            tubo1.style.top = `${Math.random() * (rect.height - 200)}px`;
            tuboPassed = false;
        }
        tubo1.style.left = `${tuboX}px`;

        // === Puntaje ===
        const tuboRect = tubo1.getBoundingClientRect();
        const charRect = character.getBoundingClientRect();

        if (!tuboPassed && tuboRect.right < charRect.left) {
            tuboPassed = true;
            score++;
            scoreDisplay.textContent = `Puntaje: ${score}`;
        }
        
        // Asumo que hay lógica de colisión aquí, si no, el juego continuaría infinitamente.
        // if (checkCollision(charRect, tuboRect)) {
        //     endGame();
        //     return;
        // }

        requestAnimationFrame(update);
    }

    // === CONTROLES DE TECLADO ===
    document.addEventListener("keydown", (e) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
            e.preventDefault(); // Bloquea scroll del navegador
        }

        if (!playing) return;

        switch (e.code) {
            case "Space":
            case "ArrowUp":
                jump();
                break;
            case "ArrowRight":
                if (speedX < maxSpeed) speedX += acceleration;
                break;
            case "ArrowLeft":
                if (speedX > -maxSpeed) speedX -= acceleration;
                break;
            case "ArrowDown":
                speedX *= 0.9;
                break;
        }
    });

    document.addEventListener("keyup", (e) => {
        if (["ArrowRight", "ArrowLeft"].includes(e.code)) {
            speedX *= 0.8;
        }
    });

    // === CLICK TAMBIÉN HACE SALTAR ===
    document.addEventListener("click", () => {
        if (playing) jump();
    });
});