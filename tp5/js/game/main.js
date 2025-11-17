document.addEventListener("DOMContentLoaded", () => {
    // --- FUNCIÓN DE LECTURA FORZADA DE DIMENSIONES ---
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
        item.style.position = originalPosition;
        item.style.visibility = originalVisibility;

        return { width, height };
    }

    // === ELEMENTOS DEL DOM ===
    const container = document.querySelector(".solitario-container");
    const playBtn = document.querySelector(".play");
    const menuConfig = document.getElementById("menu-config");
    const startBtn = document.getElementById("btnIniciar");
    const exitBtn = document.getElementById("exit-game");
    const configBtn = document.getElementById("config-game");
    const tiempoSelect = document.getElementById("tiempolimite");
    
    // Naves
    const character = document.querySelector(".character"); // Nave Principal (Jugador)
    const nave = document.querySelector(".nave");           // Nave Secundaria (Aleatoria)
    
    const star = document.querySelector(".star");
    const hongo = document.querySelector(".hongo"); 
    const preview = container.querySelector("img");
    const scoreDisplay = document.getElementById("movimientos");
    const timerDisplay = document.getElementById("timer");
    
    const messageOverlay = document.getElementById("game-message");
    const messageTitle = document.getElementById("message-title");
    const messageText = document.getElementById("message-text");
    const messageBtn = document.getElementById("message-btn");

    // === VARIABLES DE JUEGO ===
    let playing = false;
    
    // Variables del Jugador (.character)
    let posX = 100;
    let posY = 200;
    let velocityY = 0;
    const gravity = 0.5;
    const floor = 10; 
    const jumpStrength = -7; 
    let speedX = 0;
    const maxSpeed = 3;
    const acceleration = 2; 
    
    // Variables de la Nave Aleatoria (.nave)
    let navePosX = 500; // Posición inicial X
    let navePosY = 150; // Posición inicial Y
    const naveW = nave ? nave.offsetWidth : 0; // Dimensiones de la nave aleatoria
    const naveH = nave ? nave.offsetHeight : 0;
    let naveSpeedX = 1; // Velocidad de oscilación vertical
    const naveMaxRangeY = 100; 
    const naveRangeCenterY = 150; 
    let naveDirectionY = 1; // 1 = abajo, -1 = arriba
    

    let score = 0;
    let timeLimit = 0;
    let remainingTime = 0;
    let timerInterval = null;
    
    // VARIABLE DE OBJETIVO (TUBO 40)
    const MAX_TUBES = 40; 
    
    // Variables de invencibilidad
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
    
    // Variables para obstáculos
    const tubeGap = 200; 
    const tubeSpeed = 2; 
    const tubeInterval = 300; 
    const obstacles = []; 
    
    // Obtener dimensiones del personaje principal
    const charW = character.offsetWidth;
    const charH = character.offsetHeight;
    
    let animationFrameId = null; 

    // Obtener dimensiones de los ítems
    const starDims = getForcedDimensions(star);
    const hongoDims = getForcedDimensions(hongo);
    
// ---------------------------------------------------------------------

    function activateInvincibility() {
        const duration = 10000; 
        
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
        if(hongo) hongo.style.display = "none";
    }

    function clearActiveItem() {
        if(activeItem.element) {
             activeItem.element.style.display = "none";
        }
        activeItem.element = null;
        activeItem.type = null;
        activeItem.dx = 0;
        activeItem.dy = 0;
        clearTimeout(itemTimeout);
    }
    
    function showMenu() {
        playing = false;
        clearInterval(timerInterval);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        
        isInvincible = false;
        character.classList.remove("character2");
        clearTimeout(invincibilityTimer);
        clearActiveItem(); 

        preview.style.display = "block";
        playBtn.style.display = "block";
        menuConfig.style.display = "none";
        character.style.display = "none";
        nave.style.display = "none"; // OCULTAR nave aleatoria
        
        scoreDisplay.style.display = "none";
        timerDisplay.style.display = "none";
        exitBtn.style.display = "none"; 
        configBtn.style.display = "none"; 
        messageOverlay.classList.add("invisible");

        obstacles.forEach(obs => { 
             if(obs.topTube) obs.topTube.element.remove(); 
             if(obs.bottomTube) obs.bottomTube.element.remove(); 
        });
        obstacles.length = 0; 
        
        score = 0;
        scoreDisplay.textContent = "Puntaje: 0";
    }

    showMenu();

    // --- CORRECCIÓN DEL BOTÓN PLAY ---
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
        nave.style.display = "block"; // MOSTRAR nave aleatoria
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
        const isCollision = messageTitle.textContent.includes('Choque');
        const isWin = messageTitle.textContent.includes('¡Victoria');

        if (isTimeUp || isCollision || isWin) {
            score = 0; 
            
            if (isTimeUp || isWin) {
                 remainingTime = timeLimit;
                 showMenu(); 
                 return;
            }
        }
        
        if (isCollision) {
            character.style.display = "block";
            nave.style.display = "block"; // MOSTRAR nave aleatoria
            clearActiveItem(); 
            
            exitBtn.style.display = "block"; 
            configBtn.style.display = "block"; 
            
            character.classList.remove("character2");

            startGame(true); 
        }
    });

    function respawnCharacter() {
        posX = 100;
        posY = 200;
        velocityY = 0;
        speedX = 0;
        character.style.left = `${posX}px`;
        character.style.top = `${posY}px`;
        
        // Inicializar Nave Aleatoria
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

    function startGame(resetTubes = false) {
        playing = true;
        
        if (!resetTubes) { 
            score = 0;
        } 
        scoreDisplay.textContent = `Puntaje: ${score}`; 
        
        obstacles.forEach(obs => { 
             if(obs.topTube) obs.topTube.element.remove(); 
             if(obs.bottomTube) obs.bottomTube.element.remove(); 
        });
        obstacles.length = 0; 
        generateTubePair(container.getBoundingClientRect().width); 
        
        respawnCharacter(); 

        startTimer();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        update(); 
    }
    
    /**
     * MODIFICADO: Generación de tubos invertidos y más pegados al margen.
     */
    function generateTubePair(startX) {
        const rect = container.getBoundingClientRect();
        
        // CORREGIDO: minHeight = 0 para que el tubo pegue al borde.
        const minHeight = 0; 
        // CORREGIDO: maxHeight es la altura total del contenedor menos el gap.
        const maxHeight = rect.height - tubeGap; 
        
        const topTubeHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        // --- TUBO SUPERIOR (COLGANTE - SIN INVERTIR) ---
        const topTubeElement = document.createElement('div');
        topTubeElement.classList.add('tubo');
        topTubeElement.style.height = `${topTubeHeight}px`;
        topTubeElement.style.top = '0'; // Pegado al techo
        container.appendChild(topTubeElement);
        
        // --- TUBO INFERIOR (APUNTANDO HACIA ARRIBA - INVERTIDO) ---
        const bottomTubeElement = document.createElement('div');
        bottomTubeElement.classList.add('tubo');
        // AÑADIDO: Inversión para el tubo de abajo
        bottomTubeElement.classList.add('tubo-invertido'); 
        
        // La altura restante para el tubo inferior
        const bottomTubeHeight = rect.height - topTubeHeight - tubeGap;
        bottomTubeElement.style.height = `${bottomTubeHeight}px`;
        bottomTubeElement.style.bottom = '0'; // Pegado al fondo
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

    function checkRelativeCollision(rectA, rectB) {
        return (
            rectA.left < rectB.right &&
            rectA.right > rectB.left &&
            rectA.top < rectB.bottom &&
            rectA.bottom > rectB.top
        );
    }

    function showEndMessage(title, message, resultClass) {
        playing = false;
        clearInterval(timerInterval);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        
        isInvincible = false;
        character.classList.remove("character2");
        clearTimeout(invincibilityTimer);
        clearActiveItem(); 
        
        messageTitle.textContent = title;
        messageText.textContent = message;
        messageOverlay.className = `mensaje-overlay ${resultClass}`; 
        messageOverlay.classList.remove("invisible");

        exitBtn.style.display = "none";
        configBtn.style.display = "none";
        // El personaje ya se ocultó en endGame (colisión) o no estaba visible (victoria/tiempo)
    }

    function endGame(reason = "collision") {
        let title, message, resultClass;
        let btnText = "Volver a Intentar";

        // Asegurarse de detener el juego y la animación inmediatamente
        playing = false;
        clearInterval(timerInterval);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        if (reason === "collision") {
            title = "¡Choque! 💥";
            message = `¡Oh no! Has chocado con un obstáculo. Tu puntaje fue: ${score}.`;
            resultClass = "mensaje-perdido";
            btnText = "Volver a Comenzar";
            
            // 1. Ocultar personaje y nave aleatoria inmediatamente
            character.style.display = 'none';
            nave.style.display = 'none';
            
            // 2. Crear y posicionar la explosión
            const explosionElement = document.createElement('div');
            explosionElement.classList.add('explosion');
            explosionElement.style.display = 'block';
            
            // Ajustar la posición de la explosión al personaje (usando las dimensiones estimadas de la explosión en CSS)
            const explosionW = 133; 
            const explosionH = 100; 
            
            explosionElement.style.left = `${posX + (charW / 2) - (explosionW / 2) - 80}px`;
            explosionElement.style.top = `${posY + (charH / 2) - (explosionH / 2 +40)}px`;
            container.appendChild(explosionElement);
            
            // --- AÑADIDO: Retraso de 2 segundos antes de mostrar el mensaje ---
            setTimeout(() => {
                // 3. Eliminar la explosión y mostrar el mensaje
                explosionElement.remove();
                messageBtn.textContent = btnText;
                showEndMessage(title, message, resultClass);
            }, 2000); 
            return; 
            
        } else { // time_up
            title = "¡Tiempo Agotado! ⏰";
            message = `Se acabó el tiempo. Tu puntaje final fue: ${score}.`;
            resultClass = "mensaje-tiempo";
            btnText = "Volver al Menú";
        }
        
        // Ejecución inmediata para Time Up o cualquier otra razón no colisión
        messageBtn.textContent = btnText;
        showEndMessage(title, message, resultClass);
    }
    
    // FUNCIÓN DE VICTORIA (TUBO 40)
    function endGameWin() {
        const title = "¡Victoria! 🎉";
        const message = `¡Has pasado los ${MAX_TUBES} tubos! ¡Juego Completado! Tu puntaje final es: ${score}.`;
        const resultClass = "mensaje-ganado"; 
        const btnText = "Volver al Menú";
        
        messageBtn.textContent = btnText;
        showEndMessage(title, message, resultClass);
    }
    
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

    function updateTimerDisplay() {
        const minutes = String(Math.floor(remainingTime / 60)).padStart(2, "0");
        const seconds = String(remainingTime % 60).padStart(2, "0");
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    function generateRandomItem(containerHeight, characterX) {
        if (score >= MAX_TUBES || score <= 4) return; 
        
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

    // === LOOP PRINCIPAL ===
    function update() {
        if (!playing) {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            return;
        }

        const rect = container.getBoundingClientRect(); 
        const containerHeight = rect.height; 
        const containerWidth = rect.width;

        // 1. Física del personaje (.character)
        velocityY += gravity;
        posY += velocityY;
        posX += speedX;

        // Ajuste del 'groundLevel' del personaje
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

        // 2. Movimiento, Colisión de Tubos
        let isFatalCollision = false; 

        for (let i = obstacles.length - 1; i >= 0; i--) {
            const pair = obstacles[i];
            
            pair.x -= tubeSpeed;
            
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
            // Tubo Inferior: top es (containerHeight - bottomTubeHeight) y bottom es containerHeight
            const bottomTubeRect = { 
                left: pair.x + tubeHitboxMargin, 
                right: pair.x + tubeWidth - tubeHitboxMargin, 
                top: containerHeight - bottomTubeHeight, 
                bottom: containerHeight 
            };
            // Colisión con tubos
            if (checkRelativeCollision(charRect, topTubeRect) || checkRelativeCollision(charRect, bottomTubeRect)) {
                if (!isInvincible) { 
                    isFatalCollision = true;
                    endGame("collision");
                    break; 
                }
            }

            // Comprobar puntaje y límite de tubos
            if (!pair.passed && pair.x + pair.width < charRect.left) { 
                pair.passed = true;
                score++;
                scoreDisplay.textContent = `Puntaje: ${score}`;

                // COMPROBACIÓN DE VICTORIA
                if (score >= MAX_TUBES) {
                    isFatalCollision = true; 
                    endGameWin();
                    break; 
                }
                
                generateRandomItem(containerHeight, posX); 
            }

            // Eliminar tubos fuera de la pantalla
            if (pair.x + pair.width < 0) {
                pair.topTube.element.remove();
                pair.bottomTube.element.remove();
                obstacles.splice(i, 1); 
            }
        }
        
        if (isFatalCollision) return;

        // 3. LÓGICA DE ÍTEM ACTIVO (MOVIMIENTO Y COLISIÓN)
        if (activeItem.element) {
            
            activeItem.x += activeItem.dx - tubeSpeed;
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
                    activateInvincibility();
                    score += 10; 
                } else if (activeItem.type === 'hongo') {
                    if (!isInvincible) {
                        endGame("collision"); 
                        return; 
                    } else {
                        clearActiveItem();
                        score += 5; 
                    }
                }
                
                scoreDisplay.textContent = `Puntaje: ${score}`;
                clearActiveItem(); 
            }
            
            if (activeItem.x + activeItem.dims.width < 0) {
                clearActiveItem();
            }
        }
        
        // --- 4. Lógica de Movimiento y Colisión de .nave (Objeto Aleatorio) ---
        if (nave && playing && naveW > 0) {
            // 4a. Movimiento Horizontal (Simula ser un obstáculo que pasa)
            navePosX -= tubeSpeed * 0.5; // Se mueve a mitad de velocidad de los tubos
            
            // Reposicionar si sale de la pantalla
            if (navePosX + naveW < 0) {
                navePosX = containerWidth + Math.random() * 500; // Reaparece fuera de la pantalla
                navePosY = naveRangeCenterY + Math.random() * naveMaxRangeY - naveMaxRangeY / 2;
                naveDirectionY = Math.random() > 0.5 ? 1 : -1; // Dirección vertical aleatoria al reaparecer
            }
            
            // 4b. Movimiento Vertical Oscilante (Aleatorio)
            navePosY += naveSpeedX * naveDirectionY * 0.5; // Velocidad de oscilación
            
            // Cambiar de dirección si alcanza los límites
            if (navePosY > naveRangeCenterY + naveMaxRangeY / 2 || navePosY + naveH > containerHeight - floor) {
                naveDirectionY = -1;
            } else if (navePosY < naveRangeCenterY - naveMaxRangeY / 2 || navePosY < 0) {
                naveDirectionY = 1;
            }

            // 4c. Aplicar la nueva posición
            nave.style.left = `${navePosX}px`;
            nave.style.top = `${navePosY}px`;
            
            // 4d. Detección de Colisión (Jugador vs. Nave Aleatoria)
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
        
        // 5. Generar nuevo tubo (Solo si no se ha ganado)
        if (score < MAX_TUBES) {
            const screenWidth = rect.width;
            if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < screenWidth - tubeInterval) {
                generateTubePair(screenWidth);
            }
        }


        animationFrameId = requestAnimationFrame(update);
    }

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
});