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
    const character = document.querySelector(".character");
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
    let posX = 100;
    let posY = 200;
    let velocityY = 0;
    const gravity = 0.5;
    const floor = 50;
    const jumpStrength = -7; 
    let speedX = 0;
    const maxSpeed = 3;
    const acceleration = 2; 
    let score = 0;
    let timeLimit = 0;
    let remainingTime = 0;
    let timerInterval = null;
    
    // Variables de invencibilidad
    let isInvincible = false;
    let invincibilityTimer = null; 
    
    // Almacena el timeout para la desaparición del ítem activo
    let itemTimeout = null; 
    
    // **NUEVA VARIABLE:** Para asegurar que los ítems se alternen
    let lastItemSpawned = null; // 'star', 'hongo', o null

    // Variables para obstáculos
    const tubeGap = 250; 
    const tubeSpeed = 2; 
    const tubeInterval = 300; 
    const obstacles = []; 
    
    // Obtener dimensiones del personaje
    const charW = character.offsetWidth;
    const charH = character.offsetHeight;
    
    let animationFrameId = null; 

    // Obtener dimensiones de los ítems usando la función de lectura forzada
    const starDims = getForcedDimensions(star);
    const hongoDims = getForcedDimensions(hongo);
    
// ---------------------------------------------------------------------

    // --- FUNCIÓN DE INMUNIDAD DE ESTRELLA ---
    function activateInvincibility() {
        const duration = 10000; // 10 segundos
        
        clearTimeout(invincibilityTimer);
        
        isInvincible = true;
        character.classList.add("character2");
        
        invincibilityTimer = setTimeout(() => {
            isInvincible = false;
            character.classList.remove("character2");
        }, duration);
        
        // Limpiar el timeout del ítem si se recoge
        clearTimeout(itemTimeout);
        star.style.display = "none";
        if(hongo) hongo.style.display = "none";
    }
    
    // === LÓGICA DE UI Y JUEGO ===
    function showMenu() {
        playing = false;
        clearInterval(timerInterval);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        
        // Limpiar estado de juego
        isInvencible = false;
        character.classList.remove("character2");
        clearTimeout(invincibilityTimer);
        clearTimeout(itemTimeout); // Limpiar timeout del ítem al salir

        preview.style.display = "block";
        playBtn.style.display = "block";
        menuConfig.style.display = "none";
        character.style.display = "none";
        star.style.display = "none";
        if(hongo) hongo.style.display = "none";
        
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

    // Event listeners para UI
    playBtn.addEventListener("click", () => {
        playBtn.style.display = "none";
        preview.style.display = "none";
        menuConfig.style.display = "block";
    });

    startBtn.addEventListener("click", () => {
        const option = tiempoSelect.value;
        timeLimit = option === "10m" ? 600 : 300; 
        
        if (!playing) {
             remainingTime = timeLimit;
        }

        menuConfig.style.display = "none";
        character.style.display = "block";
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
        clearTimeout(itemTimeout);
        
        menuConfig.style.display = "block";
        exitBtn.style.display = "none"; 
        configBtn.style.display = "none"; 
    });

    messageBtn.addEventListener("click", () => {
        messageOverlay.classList.add("invisible");
        
        const isTimeUp = messageTitle.textContent.includes('Tiempo Agotado');
        const isCollision = messageTitle.textContent.includes('Choque');

        // Lógica para resetear el score al morir o al terminar
        if (isTimeUp || isCollision) {
            score = 0; 
            scoreDisplay.textContent = "Puntaje: 0";
            
            if (isTimeUp) {
                remainingTime = timeLimit;
                showMenu(); 
                return;
            }
        }
        
        // Si es colisión y elige respawn/continuar
        if (isCollision) {
            character.style.display = "block";
            star.style.display = "none"; 
            if(hongo) hongo.style.display = "none"; 
            clearTimeout(itemTimeout);
            
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

        // Restablece la invencibilidad
        isInvincible = false;
        character.classList.remove("character2");
        clearTimeout(invincibilityTimer);

        // Oculta los ítems
        star.style.display = "none";
        if(hongo) hongo.style.display = "none";
        
        lastItemSpawned = null; // Reiniciar el contador de ítems
    }

    function startGame(resetTubes = false) {
        playing = true;
        
        if (!resetTubes) { 
            score = 0;
            scoreDisplay.textContent = "Puntaje: 0";
        }
        
        // Limpiar tubos existentes
        obstacles.forEach(obs => { 
            if(obs.topTube) obs.topTube.element.remove(); 
            if(obs.bottomTube) obs.bottomTube.element.remove(); 
        });
        obstacles.length = 0; 
        generateTubePair(container.getBoundingClientRect().width); 
        
        respawnCharacter(); 

        startTimer();
        // Llamada crucial para iniciar el bucle de animación
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        update(); 
    }
    
    function generateTubePair(startX) {
        const rect = container.getBoundingClientRect();
        const minHeight = 100;
        const maxHeight = rect.height - floor - tubeGap - 50; 
        
        const topTubeHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        const topTubeElement = document.createElement('div');
        topTubeElement.classList.add('tubo');
        topTubeElement.style.height = `${topTubeHeight}px`;
        topTubeElement.style.top = '0';
        container.appendChild(topTubeElement);
        
        const bottomTubeElement = document.createElement('div');
        bottomTubeElement.classList.add('tubo');
        const bottomTubeHeight = rect.height - floor - topTubeHeight - tubeGap;
        bottomTubeElement.style.height = `${bottomTubeHeight}px`;
        bottomTubeElement.style.bottom = `${floor}px`;
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
        clearTimeout(itemTimeout);
        
        messageTitle.textContent = title;
        messageText.textContent = message;
        messageOverlay.className = `mensaje-overlay ${resultClass}`; 
        messageOverlay.classList.remove("invisible");

        exitBtn.style.display = "none";
        configBtn.style.display = "none";
        character.style.display = "none";
        star.style.display = "none";
        if(hongo) hongo.style.display = "none";
    }

    function endGame(reason = "collision") {
        let title, message, resultClass;
        let btnText = "Volver a Intentar";

        if (reason === "collision") {
            title = "¡Choque! 💥";
            message = `¡Oh no! Has chocado con un obstáculo. Tu puntaje fue: ${score}.`;
            resultClass = "mensaje-perdido";
            btnText = "Respawn y Continuar";
            
        } else { 
            title = "⏰ ¡Tiempo Agotado!";
            message = `Se acabó el tiempo. Tu puntaje final fue: ${score}.`;
            resultClass = "mensaje-tiempo";
            btnText = "Volver al Menú";
        }
        
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

    // --- LÓGICA DE APARICIÓN DE ÍTEMS ---
    function generateRandomItem(containerHeight, characterX) {
        if (score <= 4) return; 
        
        // Si ya hay un ítem activo, no generamos otro y salimos
        if (star.style.display === 'block' || (hongo && hongo.style.display === 'block')) return;
        
        clearTimeout(itemTimeout); 
        
        // Ocultar ambos explícitamente antes de decidir cuál mostrar
        star.style.display = "none";
        if(hongo) hongo.style.display = "none";

        const items = [];
        if (star) items.push({ element: star, dims: starDims, type: 'star' });
        if (hongo) items.push({ element: hongo, dims: hongoDims, type: 'hongo' });
        
        if (items.length === 0) return;
        
        let itemToSpawnData;

        // **LÓGICA DE ALTERNANCIA (CORRECCIÓN):**
        if (lastItemSpawned === 'star' && hongo) {
            // Si el último fue estrella, forzar hongo
            itemToSpawnData = items.find(item => item.type === 'hongo');
        } else if (lastItemSpawned === 'hongo' && star) {
            // Si el último fue hongo, forzar estrella
            itemToSpawnData = items.find(item => item.type === 'star');
        } else {
            // Si es el primero o no se puede alternar, elegir al azar
            itemToSpawnData = items[Math.floor(Math.random() * items.length)];
        }
        
        if (!itemToSpawnData) return; // Por si acaso

        const itemToSpawn = itemToSpawnData.element;
        
        // Actualizar el último ítem generado
        lastItemSpawned = itemToSpawnData.type;

        // Posición X: Aparece aleatoriamente en un rango DELANTE del personaje
        const spawnXRange = 300; 
        const minSpawnX = characterX + charW + 50; 
        const maxSpawnX = minSpawnX + spawnXRange;
        const itemX = Math.random() * (maxSpawnX - minSpawnX) + minSpawnX;
        
        // Posición Y: Random en la sección superior/media
        const itemMinY = 50;
        const itemMaxY = containerHeight / 2;
        const itemY = Math.random() * (itemMaxY - itemMinY) + itemMinY;

        itemToSpawn.style.left = `${itemX}px`;
        itemToSpawn.style.top = `${itemY}px`;
        itemToSpawn.style.display = "block";
        
        // Establecer el timeout para la desaparición
        itemTimeout = setTimeout(() => {
            itemToSpawn.style.display = "none";
        }, 5000); // 5 segundos
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

        // 1. Física del personaje
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

        // 2. Movimiento, Colisión de Tubos e Ítems
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const pair = obstacles[i];
            
            // Los tubos SÍ se mueven
            pair.x -= tubeSpeed;
            
            pair.topTube.element.style.left = `${pair.x}px`;
            pair.bottomTube.element.style.left = `${pair.x}px`;

            const tubeWidth = pair.width; 
            const topTubeHeight = pair.topTube.height; 
            const bottomTubeHeight = pair.bottomTube.height; 

            // Coordenadas relativas del TUBO
            const topTubeRect = { left: pair.x, right: pair.x + tubeWidth, top: 0, bottom: topTubeHeight };
            const bottomTubeRect = { left: pair.x, right: pair.x + tubeWidth, top: containerHeight - floor - bottomTubeHeight, bottom: containerHeight - floor };
            
            // Colisión con tubos (Ignora si es invencible)
            if (checkRelativeCollision(charRect, topTubeRect) || checkRelativeCollision(charRect, bottomTubeRect)) {
                if (!isInvincible) { 
                    endGame("collision");
                    return; 
                }
            }

            // --- LÓGICA DE ÍTEMS: SÓLO COMPROBAR COLISIÓN (SON ESTÁTICOS) ---
            const itemsData = [
                { element: star, dims: starDims },
                { element: hongo, dims: hongoDims }
            ].filter(item => item.element && item.element.style.display !== 'none');

            let isFatalCollision = false; 

            itemsData.forEach(itemData => {
                if (isFatalCollision) return; 

                const item = itemData.element;
                const itemWidth = itemData.dims.width;
                
                const itemX = parseFloat(item.style.left);
                const itemY = parseFloat(item.style.top);

                const itemRect = {
                    left: itemX,
                    right: itemX + itemWidth,
                    top: itemY,
                    bottom: itemY + itemData.dims.height 
                };
                
                // Si el ítem ya está fuera de la pantalla (a la izquierda), lo ocultamos y limpiamos el timeout
                if (itemX + itemWidth < 0) {
                     item.style.display = 'none';
                     clearTimeout(itemTimeout);
                     return; 
                }

                // Comprobar colisión con el ítem
                if (checkRelativeCollision(charRect, itemRect)) {
                    item.style.display = 'none';
                    clearTimeout(itemTimeout);
                    
                    if (item.classList.contains('star')) {
                        activateInvincibility();
                        score += 10; 
                    } else if (item.classList.contains('hongo')) {
                        isFatalCollision = true; 
                        endGame("collision"); 
                        return;
                    }
                    
                    scoreDisplay.textContent = `Puntaje: ${score}`;
                }
            });

            if (isFatalCollision) {
                return; 
            }
            // --- FIN LÓGICA DE ÍTEM ---

            // Comprobar puntaje y generar ítem
            if (!pair.passed && pair.x + pair.width < charRect.left) { 
                pair.passed = true;
                score++;
                scoreDisplay.textContent = `Puntaje: ${score}`;

                // Generar ítem CADA VEZ que se pasa un tubo si score > 4
                generateRandomItem(containerHeight, posX); 
            }

            // Eliminar tubos fuera de la pantalla
            if (pair.x + pair.width < 0) {
                pair.topTube.element.remove();
                pair.bottomTube.element.remove();
                obstacles.splice(i, 1); 
            }
        }
        
        // 3. Generar nuevo tubo
        const screenWidth = rect.width;
        if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < screenWidth - tubeInterval) {
            generateTubePair(screenWidth);
        }

        animationFrameId = requestAnimationFrame(update);
    }

    // === CONTROLES DE TECLADO Y CLIC ===
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