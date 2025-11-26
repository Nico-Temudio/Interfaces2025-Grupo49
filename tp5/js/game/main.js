document.addEventListener("DOMContentLoaded", () => {

    /*Calcula las dimensiones (width, height) de un elemento, forzando su visualización temporalmente si está oculto para obtener valores correctos. */
    function getForcedDimensions(item) {
        if (!item) return { width: 0, height: 0 };
        const originalDisplay = item.style.display;
        const originalPosition = item.style.position;
        const originalVisibility = item.style.visibility;

        item.style.display = 'block';
        item.style.position = 'absolute';
        item.style.visibility = 'hidden';

        const width = item.offsetWidth;
        const height = item.offsetHeight;

        item.style.display = originalDisplay;
        item.position = originalPosition;
        item.style.visibility = originalVisibility;

        return { width, height };
    }

    // Elementos del dom
    const container = document.querySelector(".solitario-container");
    const playBtn = document.querySelector(".play");
    const menuConfig = document.getElementById("menu-config");
    const startBtn = document.getElementById("btnIniciar");
    const exitBtn = document.getElementById("exit-game");
    const configBtn = document.getElementById("config-game");
    const tiempoSelect = document.getElementById("tiempolimite");

    // Naves y Items
    const character = document.querySelector(".character");
    const nave = document.querySelector(".nave");
    const star = document.querySelector(".star");
    const hongo = document.querySelector(".hongo");
    const preview = container.querySelector("img");
    const scoreDisplay = document.getElementById("movimientos");
    const timerDisplay = document.getElementById("timer");

    // Mensaje Overlay
    const messageOverlay = document.getElementById("game-message");
    const messageTitle = document.getElementById("message-title");
    const messageText = document.getElementById("message-text");
    const messageBtn = document.getElementById("message-btn");

    //  Audio del juego
    const audioExplosion = new Audio('../tp5/sounds/large-underwater-explosion.mp3');
    const audioStarCollect = new Audio('../tp5/sounds/success.mp3');

    // Variables del juego
    let playing = false;

    // Variables del Jugador
    let posX = 100;
    let posY = 200;
    let velocityY = 0;
    const gravity = 0.5;
    const floor = 10;
    const jumpStrength = -7;
    let speedX = 0;
    const maxSpeed = 3;
    const acceleration = 2;

    // Variables de la Nave Aleatoria
    let navePosX = 500;
    let navePosY = 150;
    const naveW = nave ? nave.offsetWidth : 0;
    const naveH = nave ? nave.offsetHeight : 0;
    let naveSpeedX = 1;
    const naveMaxRangeY = 100;
    const naveRangeCenterY = 150;
    let naveDirectionY = 1;

    // Contadores y Puntajes
    let score = 0;
    let tubesPassed = 0;
    let starsCollected = 0;

    let timeLimit = 0;
    let remainingTime = 0;
    let timerInterval = null;


    // Variables de invencibilidad y obstáculos
    let isInvincible = false;
    let invincibilityTimer = null;
    let itemTimeout = null;
    let lastItemSpawned = null;

    let activeItem = {
        element: null,
        type: null,
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        dims: { width: 0, height: 0 }
    };

    // Variables para dificultad progresiva
    const INITIAL_TUBE_GAP = 200;
    const MIN_TUBE_GAP = 90; // Hueco mínimo
    const INITIAL_TUBE_SPEED = 2;
    const MAX_TUBE_SPEED = 8.5; // Velocidad máxima

    let currentTubeGap = INITIAL_TUBE_GAP;
    let currentTubeSpeed = INITIAL_TUBE_SPEED;
    const tubeInterval = 300;
    
    const obstacles = [];

    const charW = character.offsetWidth;
    const charH = character.offsetHeight;
    let animationFrameId = null;

    const starDims = getForcedDimensions(star);
    const hongoDims = getForcedDimensions(hongo);

    /* Activa el estado de invencibilidad del personaje por una duración fija (5 segundos). */
    function activateInvincibility() {
        const duration = 5000;

        clearTimeout(invincibilityTimer);

        isInvincible = true;
        character.classList.add("character2");

        invincibilityTimer = setTimeout(() => {
            isInvincible = false;
            character.classList.remove("character2");
        }, duration);

        clearTimeout(itemTimeout);
        activeItem.element = null;
        star.style.display = "none";
        if (hongo) hongo.style.display = "none";
    }

    /* Oculta y resetea el ítem activo actualmente en el juego. */
    function clearActiveItem() {
        if (activeItem.element) {
            activeItem.element.style.display = "none";
        }
        activeItem.element = null;
        activeItem.type = null;
        activeItem.dx = 0;
        activeItem.dy = 0;
        clearTimeout(itemTimeout);
    }

    /* Restaura la interfaz al estado de menu principal, deteniendo el juego y limpiando elementos. */
    function showMenu() {
        playing = false;
        clearInterval(timerInterval);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        isInvincible = false;
        character.classList.remove("character2");
        clearTimeout(invincibilityTimer);
        clearActiveItem();

        scoreDisplay.textContent = `Puntaje: 0`;

        preview.style.display = "block";
        playBtn.style.display = "block";
        menuConfig.style.display = "none";
        character.style.display = "none";
        nave.style.display = "none";

        // Ocultar elementos de UI de juego
        scoreDisplay.style.display = "none";
        timerDisplay.style.display = "none";
        exitBtn.style.display = "none";
        configBtn.style.display = "none";
        messageOverlay.classList.add("invisible");

        // Limpiar obstáculos
        obstacles.forEach(obs => {
            if (obs.topTube) obs.topTube.element.remove();
            if (obs.bottomTube) obs.bottomTube.element.remove();
        });
        obstacles.length = 0;

        // Reiniciar variables de juego
        score = 0;
        tubesPassed = 0;
        starsCollected = 0;
    }

    createSkyStars();
    showMenu();

    /* Manejo general de botones */

    if (playBtn) {
        playBtn.addEventListener("click", () => {
            playBtn.style.display = "none";
            preview.style.display = "none";
            menuConfig.style.display = "block";
        });
    }

    startBtn.addEventListener("click", () => {
        const option = tiempoSelect.value;
        timeLimit = option === "10m" ? 600 : 300;

        if (!playing) {
            remainingTime = timeLimit;
        }

        menuConfig.style.display = "none";
        character.style.display = "block";
        nave.style.display = "block";
        scoreDisplay.style.display = "block";
        timerDisplay.style.display = "block";
        exitBtn.style.display = "block";
        configBtn.style.display = "block";

        character.classList.remove("character2");

        startGame(false);
    });

    exitBtn.addEventListener("click", showMenu);

    configBtn.addEventListener("click", () => {
        playing = false;
        clearInterval(timerInterval);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        clearActiveItem();

        menuConfig.style.display = "block";
        exitBtn.style.display = "none";
        configBtn.style.display = "none";
    });

    messageBtn.addEventListener("click", () => {
        messageOverlay.classList.add("invisible");

        const isTimeUp = messageTitle.textContent.includes('Tiempo Agotado');
        const isCollision = messageTitle.textContent.includes('Aterrizaje forzoso');

        if (isTimeUp) {
            showMenu(); // Volver al menú
            return;
        }

        // Si es colisión, se reinicia el juego.
        if (isCollision) {
            character.style.display = "block";
            nave.style.display = "block";
            clearActiveItem();

            exitBtn.style.display = "block";
            configBtn.style.display = "block";

            character.classList.remove("character2");

            startGame(false); // Reinicia contadores y tubos
        }
    });

    /* Reposiciona el personaje, la nave y reinicia estados de invencibilidad/ítems. */
    function respawnCharacter() {
        posX = 100;
        posY = 200;
        velocityY = 0;
        speedX = 0;
        character.style.left = `${posX}px`;
        character.style.top = `${posY}px`;

        const containerWidth = container.getBoundingClientRect().width;
        navePosX = containerWidth + Math.random() * 500;
        navePosY = naveRangeCenterY + Math.random() * naveMaxRangeY - naveMaxRangeY / 2;
        if (nave) {
            nave.style.left = `${navePosX}px`;
            nave.style.top = `${navePosY}px`;
        }

        isInvincible = false;
        character.classList.remove("character2");
        clearTimeout(invincibilityTimer);

        clearActiveItem();

        lastItemSpawned = null;
    }

    /* Inicia o reinicia el bucle principal del juego, gestionando contadores y obstáculos. */
    function startGame(resetTubes = false) {
        playing = true;

        container.classList.remove("is-paused");

        if (!resetTubes) {
            // Reinicia contadores si resetTubes es false (nueva partida, o reset forzado por colisión)
            score = 0;
            tubesPassed = 0;
            starsCollected = 0;

            // Resetea dificultad
            currentTubeGap = INITIAL_TUBE_GAP;
            currentTubeSpeed = INITIAL_TUBE_SPEED;
        }

        scoreDisplay.textContent = `Puntaje: ${score}`;

        obstacles.forEach(obs => {
            if (obs.topTube) obs.topTube.element.remove();
            if (obs.bottomTube) obs.bottomTube.element.remove();
        });
        obstacles.length = 0;
        generateTubePair(container.getBoundingClientRect().width);

        respawnCharacter();

        // Resetea el tiempo restante al límite de tiempo establecido
        remainingTime = timeLimit;
        startTimer();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        update();
    }

    /* Crea y anade un nuevo par de tubos (obstáculos) al contenedor. */
    function generateTubePair(startX) {
        const rect = container.getBoundingClientRect();
        const minHeight = 0;

        const maxHeight = rect.height - currentTubeGap;
        const topTubeHeight = Math.random() * (maxHeight - minHeight) + minHeight;

        const topTubeElement = document.createElement('div');
        topTubeElement.classList.add('tubo');
        topTubeElement.style.height = `${topTubeHeight}px`;
        topTubeElement.style.top = '0';
        container.appendChild(topTubeElement);

        const bottomTubeElement = document.createElement('div');
        bottomTubeElement.classList.add('tubo');
        bottomTubeElement.classList.add('tubo-invertido');

        const bottomTubeHeight = rect.height - topTubeHeight - currentTubeGap;
        bottomTubeElement.style.height = `${bottomTubeHeight}px`;
        bottomTubeElement.style.bottom = '0';
        container.appendChild(bottomTubeElement);

        const tubeWidth = topTubeElement.offsetWidth;

        const pair = {
            id: Date.now() + Math.random(),
            x: startX,
            width: tubeWidth,
            passed: false,
            topTube: {
                element: topTubeElement,
                height: topTubeHeight
            },
            bottomTube: {
                element: bottomTubeElement,
                height: bottomTubeHeight
            }
        };

        obstacles.push(pair);

        topTubeElement.style.left = `${startX}px`;
        bottomTubeElement.style.left = `${startX}px`;
    }

    /* Verifica si dos rectángulos (hitboxes) se superponen. */
    function checkRelativeCollision(rectA, rectB) {
        return (rectA.left < rectB.right && rectA.right > rectB.left && rectA.top < rectB.bottom && rectA.bottom > rectB.top);
    }

    /*Formatea el tiempo total en segundos a un string "minutos y segundos". */
    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    }

    /* Muestra la capa de mensaje final (game over o tiempo agotado) y detiene el juego. */
    function showEndMessage(title, messageHTML, resultClass) {
        playing = false;
        clearInterval(timerInterval);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        isInvincible = false;
        character.classList.remove("character2");
        clearTimeout(invincibilityTimer);
        clearActiveItem();

        messageTitle.textContent = title;
        messageText.innerHTML = messageHTML;
        messageOverlay.className = `mensaje-overlay ${resultClass}`;
        messageOverlay.classList.remove("invisible");

        exitBtn.style.display = "none";
        configBtn.style.display = "none";
    }

    /* Maneja el fin del juego por colisión o por límite de tiempo. Muestra la explosión o el mensaje final y detiene la animación.*/
    function endGame(reason = "collision") {
        let title, messageHTML, resultClass;
        let btnText = "Volver a Intentar";

        playing = false;
        clearInterval(timerInterval);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        container.classList.add("is-paused");

        // Cálculo de Puntaje
        const elapsedSeconds = timeLimit - remainingTime;
        const formattedTime = formatTime(elapsedSeconds);
        const totalScore = score;


        if (reason === "collision") {
            // Reproduce el sonido de explosion
            audioExplosion.currentTime = 0;
            audioExplosion.play().catch(e => console.log("Error al reproducir sonido de explosión:", e));

            title = "¡Aterrizaje forzoso! 💥";

            messageHTML = `
            Has pasado ${tubesPassed} montañas y recogido ${starsCollected} escudos protectores.
            <br>Tu puntaje total es: <b>${totalScore}
            </b>.<br>Tiempo de juego: ${formattedTime}.`;
            resultClass = "mensaje-perdido";
            btnText = "Volver a Comenzar";

            character.style.display = 'none';
            nave.style.display = 'none';

            const explosionElement = document.createElement('div');
            explosionElement.classList.add('explosion');
            explosionElement.style.display = 'block';

            const explosionW = 133;
            const explosionH = 100;

            explosionElement.style.left = `${posX + (charW / 2) - (explosionW / 2) - 80}px`;
            explosionElement.style.top = `${posY + (charH / 2) - (explosionH / 2 + 40)}px`;
            container.appendChild(explosionElement);

            setTimeout(() => {
                explosionElement.remove();
                messageBtn.textContent = btnText;
                showEndMessage(title, messageHTML, resultClass);
            }, 2000);
            return;

        } else if (reason === "time_up") {
            title = "¡Tiempo Agotado! ⏰";

            messageHTML = `
            ¡Se acabó el tiempo!
            <br>Has pasado ${tubesPassed} tubos y recogido ${starsCollected} Stars.
            <br>Tu puntaje total es: <b>${totalScore}</b>.
            <br>Tiempo de juego: ${formattedTime}.`;
            resultClass = "mensaje-tiempo";
            btnText = "Volver al Menú";
        }

        messageBtn.textContent = btnText;
        showEndMessage(title, messageHTML, resultClass);
    }

    /* Inicia el temporizador de cuenta regresiva del juego. */
    function startTimer() {
        clearInterval(timerInterval);
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            if (!playing) return;
            remainingTime--;

            if (remainingTime <= 0) {
                remainingTime = 0;
                endGame("time_up");
                return;
            }

            updateTimerDisplay();
        }, 1000);
    }

    /* Actualiza la representación visual del tiempo restante en la interfaz.*/
    function updateTimerDisplay() {
        const minutes = String(Math.floor(remainingTime / 60)).padStart(2, "0");
        const seconds = String(remainingTime % 60).padStart(2, "0");
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    /* Genera y posiciona aleatoriamente un ítem (Satelites o Escudo) en el contenedor, asegurando que no haya uno activo ya y alternando el ultimo generado. */
    function generateRandomItem(containerHeight, characterX) {
        if (tubesPassed <= 4) return;

        if (activeItem.element) return;

        clearTimeout(itemTimeout);

        const items = [];
        if (star) items.push({ element: star, dims: starDims, type: 'star' });
        if (hongo) items.push({ element: hongo, dims: hongoDims, type: 'hongo' });

        if (items.length === 0) return;

        let itemToSpawnData;

        if (lastItemSpawned === 'star' && hongo) {
            itemToSpawnData = items.find(item => item.type === 'hongo');
        } else if (lastItemSpawned === 'hongo' && star) {
            itemToSpawnData = items.find(item => item.type === 'star');
        } else {
            itemToSpawnData = items[Math.floor(Math.random() * items.length)];
        }

        if (!itemToSpawnData) return;

        const itemToSpawn = itemToSpawnData.element;
        lastItemSpawned = itemToSpawnData.type;

        const spawnXRange = 300;
        const minSpawnX = characterX + charW + 50;
        const maxSpawnX = minSpawnX + spawnXRange;
        const itemX = Math.random() * (maxSpawnX - minSpawnX) + minSpawnX;

        const itemMinY = 50;
        const itemMaxY = containerHeight / 2;
        const itemY = Math.random() * (itemMaxY - itemMinY) + itemMinY;

        itemToSpawn.style.left = `${itemX}px`;
        itemToSpawn.style.top = `${itemY}px`;
        itemToSpawn.style.display = "block";

        activeItem.element = itemToSpawn;
        activeItem.type = itemToSpawnData.type;
        activeItem.x = itemX;
        activeItem.y = itemY;
        activeItem.dims = itemToSpawnData.dims;

        if (activeItem.type === 'hongo') {
            const attackSpeed = 1.5;
            activeItem.dx = -attackSpeed;
        } else {
            activeItem.dx = 0;
            activeItem.dy = 0;
        }

        itemTimeout = setTimeout(clearActiveItem, 5000);
    }

    // Función para aumentar dificultad
    function checkDifficulty() {
        // Cada 5 tubos pasados
        if (tubesPassed > 0 && tubesPassed % 5 === 0) {
            
            // Aumenta velocidad
            if (currentTubeSpeed < MAX_TUBE_SPEED) {
                currentTubeSpeed += 0.2;
            }

            // Reducir hueco
            if (currentTubeGap > MIN_TUBE_GAP) {
                currentTubeGap -= 5;
            }
        }
    }

/* Bucle principal del juego que maneja la física, el movimiento de obstáculos, las colisiones, el movimiento de la nave y la generación de nuevas rocas. */
    function update() {
        if (!playing) {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            return;
        }

        const rect = container.getBoundingClientRect();
        const containerHeight = rect.height;
        const containerWidth = rect.width;

        // Física de la nave
        velocityY += gravity;
        posY += velocityY;
        posX += speedX;

        const groundLevel = containerHeight - floor - charH;
        if (posY > groundLevel) {
            posY = groundLevel;
            velocityY = 0;
        }
        if (posY < 0) posY = 0;
        if (posX < 0) posX = 0;
        if (posX + charW > rect.width) posX = rect.width - charW;

        character.style.left = `${posX}px`;
        character.style.top = `${posY}px`;

        const hitboxMargin = 5;
        const charRect = {
            left: posX + hitboxMargin,
            right: posX + charW - hitboxMargin,
            top: posY + hitboxMargin,
            bottom: posY + charH - hitboxMargin
        };

        // 2. Movimiento y Colisión de Tubos
        let isFatalCollision = false;

        for (let i = obstacles.length - 1; i >= 0; i--) {
            const pair = obstacles[i];

            // Velocidad dinámica
            pair.x -= currentTubeSpeed;

            pair.topTube.element.style.left = `${pair.x}px`;
            pair.bottomTube.element.style.left = `${pair.x}px`;

            const tubeWidth = pair.width;
            const topTubeHeight = pair.topTube.height;
            const bottomTubeHeight = pair.bottomTube.height;

            const tubeHitboxMargin = 50;

            const topTubeRect = {
                left: pair.x + tubeHitboxMargin,
                right: pair.x + tubeWidth - tubeHitboxMargin,
                top: 0,
                bottom: topTubeHeight
            };
            const bottomTubeRect = {
                left: pair.x + tubeHitboxMargin,
                right: pair.x + tubeWidth - tubeHitboxMargin,
                top: containerHeight - bottomTubeHeight,
                bottom: containerHeight
            };

            if (checkRelativeCollision(charRect, topTubeRect) || checkRelativeCollision(charRect, bottomTubeRect)) {
                if (!isInvincible) {
                    isFatalCollision = true;
                    endGame("collision");
                    break;
                }
            }

            // Aumentar puntaje por pasar tubo
            if (!pair.passed && pair.x + pair.width < charRect.left) {
                pair.passed = true;

                tubesPassed++;
                score++;
                scoreDisplay.textContent = `Puntaje: ${score}`;

                // Chequea dificultad al pasar un tubo
                checkDifficulty();

                generateRandomItem(containerHeight, posX);
            }

            // Eliminar tubos
            if (pair.x + pair.width < 0) {
                pair.topTube.element.remove();
                pair.bottomTube.element.remove();
                obstacles.splice(i, 1);
            }
        }

        if (isFatalCollision) return;

        // 3. Lógica de ÍTEM ACTIVO
        if (activeItem.element) {

            activeItem.x += activeItem.dx - currentTubeSpeed;
            activeItem.y += activeItem.dy;

            if (activeItem.y < 0) {
                activeItem.y = 0;
                if (activeItem.dy < 0) activeItem.dy *= -1;
            }

            activeItem.element.style.left = `${activeItem.x}px`;
            activeItem.element.style.top = `${activeItem.y}px`;

            const itemRect = {
                left: activeItem.x,
                right: activeItem.x + activeItem.dims.width,
                top: activeItem.y,
                bottom: activeItem.y + activeItem.dims.height
            };

            if (checkRelativeCollision(charRect, itemRect)) {

                if (activeItem.type === 'star') {
                    // reproduccion de sonido de escudo.
                    audioStarCollect.currentTime = 0;
                    audioStarCollect.play().catch(e => console.log("Error al reproducir sonido de star:", e));

                    activateInvincibility();

                    score += 5; // +5 puntos por Star
                    starsCollected++;

                } else if (activeItem.type === 'hongo') {
                    if (!isInvincible) {
                        endGame("collision");
                        return;
                    } else {
                        clearActiveItem();
                    }
                }

                scoreDisplay.textContent = `Puntaje: ${score}`;
                clearActiveItem();
            }

            if (activeItem.x + activeItem.dims.width < 0) {
                clearActiveItem();
            }
        }

        // 4. Lógica de Movimiento y Colisión de .nave
        if (nave && playing && naveW > 0) {
            // La nave avanza también afectada por la velocidad de scroll
            navePosX -= currentTubeSpeed * 0.5;

            if (navePosX + naveW < 0) {
                navePosX = containerWidth + Math.random() * 500;
                navePosY = naveRangeCenterY + Math.random() * naveMaxRangeY - naveMaxRangeY / 2;
                naveDirectionY = Math.random() > 0.5 ? 1 : -1;
            }

            navePosY += naveSpeedX * naveDirectionY * 0.5;

            if (navePosY > naveRangeCenterY + naveMaxRangeY / 2 || navePosY + naveH > containerHeight - floor) {
                naveDirectionY = -1;
            } else if (navePosY < naveRangeCenterY - naveMaxRangeY / 2 || navePosY < 0) {
                naveDirectionY = 1;
            }

            nave.style.left = `${navePosX}px`;
            nave.style.top = `${navePosY}px`;

            const naveRect = {
                left: navePosX,
                right: navePosX + naveW,
                top: navePosY,
                bottom: navePosY + naveH
            };

            if (!isInvincible && checkRelativeCollision(charRect, naveRect)) {
                endGame("collision");
                return;
            }
        }

        // 5. Generar nuevo tubo
        const screenWidth = rect.width;
        if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < screenWidth - tubeInterval) {
            generateTubePair(screenWidth);
        }

        animationFrameId = requestAnimationFrame(update);
    }

    // Logica del teclado y mouse.
    document.addEventListener("keydown", (e) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
            e.preventDefault();
        }

        if (!playing) return;

        switch (e.code) {
            case "Space":
            case "ArrowUp":
                velocityY = jumpStrength;
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
        if (!playing) return;

        if (["ArrowRight", "ArrowLeft"].includes(e.code)) {
            speedX *= 0.1;
        }
    });

    document.addEventListener("click", (e) => {
        if (playing && !e.target.closest('#game-message') && !e.target.closest('#menu-config')) {
            velocityY = jumpStrength;
        }
    });

    function createSkyStars() {
        const container = document.querySelector(".solitario-container");
        const starCount = 50; // Cantidad de estrellas a crear

        for (let i = 0; i < starCount; i++) {
            const starDiv = document.createElement("div");
            starDiv.classList.add("stars");

            // Posición horizontal aleatoria (0 a 100% del ancho)
            const randomX = Math.random() * 100;

            // Posición vertical aleatoria (0 a 60% de la altura para que estén en el cielo)
            const randomY = Math.random() * 60;

            // Retraso aleatorio en la animación para que no brillen todas igual
            const randomDelay = Math.random() * 2;

            // Tamaño aleatorio para dar efecto de profundidad
            const randomScale = 0.8 + Math.random() * 0.8;

            // Aplicar estilos
            starDiv.style.left = `${randomX}%`;
            starDiv.style.top = `${randomY}%`;
            starDiv.style.animationDelay = `${randomDelay}s`;
            starDiv.style.transform = `scale(${randomScale})`;

            // Añadir al contenedor
            container.appendChild(starDiv);
        }
    }
});