document.addEventListener('DOMContentLoaded', function() {

    const puzzleImage = new Image();
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext('2d');

    const FIXED_CANVAS_WIDTH = 1400;
    const FIXED_CANVAS_HEIGHT = 750;

    let carouselImageIndex = 0; 
    let carouselInterval = null; 
    const carouselImages = []; 

    let difficulty = 6; 
    let pieces;
    let cols; 
    let rows;
    let pieceWidth; 
    let pieceHeight;
    
    let xOffset = 0; 
    let yOffset = 0; 
    let mouse;
    let winTimeoutId = null;
    let gameEnded = false;
    
    // Nivel y Efectos
    let currentLevel = 1; 
    let pieceEffect = "bright"; 
    const PIECE_EFFECTS_ORDER = ["bright", "grayscale", "invert"];
    let currentEffectIndex = 0; 
    
    let currentLevelImageID = "space"; 
    
    const LEVEL_IMAGE_MAPPING = {
        "space": 0, 
        "jungle": 1, 
        "desert": 2, 
        "city": 3, 
        "snow": 4, 
        "sea": 5, 
    };

    const DIFFICULTY_CONFIG = {
        4: { cols: 2, rows: 2, timeLimit: 15 * 1000, label: "Fácil (2x2)" },
        6: { cols: 3, rows: 2, timeLimit: 35 * 1000, label: "Medio (3x2)" }, 
        8: { cols: 4, rows: 2, timeLimit: 50 * 1000, label: "Difícil (4x2)" }, 
    };

    const TIME_LIMITS = {
        4: DIFFICULTY_CONFIG[4].timeLimit,
        6: DIFFICULTY_CONFIG[6].timeLimit,
        8: DIFFICULTY_CONFIG[8].timeLimit,
    };

    const images = [
        "img/game/bomberman1.png",
        "img/game/zelda.jpeg",
        "img/game/pacman.avif",
        "img/game/StreetFighter.png",
        "img/game/mario.jpeg",
        "img/game/cronoTrigger.avif"
    ];

    const timer = new Timer('stat-timer', () => difficulty, (elapsed) => gameOverTimeLimit(elapsed), TIME_LIMITS);

    const levelStatsDisplay = document.querySelector('#stat-level'); 
    const gameMessageOverlay = document.querySelector('#game-message-overlay');
    const startMessage = document.querySelector('#start-message');
    const endMessage = document.querySelector('#end-message');
    const exitButton = document.querySelector('#salir'); 

    const endGameControls = document.querySelector('#end-game-controls');
    const backToMenuButton = document.getElementById('back-to-menu');
    const nextLevelButton = document.querySelector('#next-level');
    const difficultyText = document.querySelector('#difficulty-label');
    
    const difficultyStatsDisplay = document.querySelector('#stat-difficulty'); 
    
    const difficultyStartButtons = document.querySelectorAll('#difficulty-selection-start .difficulty-start-button');
    const difficultySelectionContainer = document.querySelector('#difficulty-selection-start'); 
    
    // Referencias para la nueva pantalla de selección de imagen
    const imageSelectionContainer = document.querySelector('.message-content-wrapper.menu-img'); 
    const levelButtons = document.querySelectorAll('.level-button');

    function showStartMessage() {
        if (gameMessageOverlay) {
            gameMessageOverlay.classList.remove('hidden');
            gameMessageOverlay.classList.add('clickable'); 
            startMessage.classList.remove('hidden');
            endMessage.classList.add('hidden');
            difficultyText.classList.remove('hidden');
            
            if (endGameControls) endGameControls.classList.add('hidden');
            
            if (difficultySelectionContainer) difficultySelectionContainer.classList.remove('hidden');
            if (imageSelectionContainer) imageSelectionContainer.classList.add('hidden'); 
            
            // Re-habilita el clic en #start-message para ir a la selección de imagen
            if (startMessage) {
                startMessage.removeEventListener('pointerdown', handleStartGameClick, true);
                startMessage.addEventListener('pointerdown', handleStartGameClick, true); 
            }
        }
    }

    function showEndMessage(msg, showControls = false) {
        if (gameMessageOverlay) {
            gameMessageOverlay.classList.remove('hidden');
            gameMessageOverlay.classList.remove('clickable'); 
            endMessage.textContent = msg;
            startMessage.classList.add('hidden');
            endMessage.classList.remove('hidden');
            
            if (endGameControls) {
                if (showControls) {
                    endGameControls.classList.remove('hidden');
                } else {
                    endGameControls.classList.add('hidden');
                }
            }
            
            if (difficultySelectionContainer) difficultySelectionContainer.classList.add('hidden');
            if (imageSelectionContainer) imageSelectionContainer.classList.add('hidden');
        }
    }
    
    function showImageSelection() {
        if (carouselInterval) clearInterval(carouselInterval);
        
        if (difficultySelectionContainer) difficultySelectionContainer.classList.add('hidden');
        if (imageSelectionContainer) {
            difficultyText.classList.add('hidden');
            startMessage.classList.add('hidden');
            imageSelectionContainer.classList.remove('hidden');
        }
        // Desactiva el listener de inicio en #start-message
        if (startMessage) {
            startMessage.removeEventListener('pointerdown', handleStartGameClick, true);
        }
    }

    function hideAllMessages() {
        if (gameMessageOverlay) {
            gameMessageOverlay.classList.add('hidden');
            gameMessageOverlay.classList.remove('clickable');
            if (endGameControls) endGameControls.classList.add('hidden');
            
            if (difficultySelectionContainer) difficultySelectionContainer.classList.add('hidden');
            if (imageSelectionContainer) imageSelectionContainer.classList.add('hidden');
        }
    }
    
    // LÓGICA DE INICIALIZACIÓN Y SELECCIÓN

    function calculatePuzzleDimensions() {
        pieceWidth = 250; 
        pieceHeight = 250; 

        cols = DIFFICULTY_CONFIG[difficulty].cols;
        rows = DIFFICULTY_CONFIG[difficulty].rows;
        
        const effectivePuzzleWidth = pieceWidth * cols;
        const effectivePuzzleHeight = pieceHeight * rows; 
        
        xOffset = Math.floor((FIXED_CANVAS_WIDTH - effectivePuzzleWidth) / 2);
        yOffset = Math.floor((FIXED_CANVAS_HEIGHT - effectivePuzzleHeight) / 2);
    }

    function updateDifficultyStatsDisplay() {
        if (!difficultyStatsDisplay) return; 

        const config = DIFFICULTY_CONFIG[difficulty];
        
        if (config) {
            const text = `DIFICULTAD: ${config.label.toUpperCase()}`;
            difficultyStatsDisplay.textContent = text;
        } else {
            difficultyStatsDisplay.textContent = "DIFICULTAD: DESCONOCIDA";
        }
    }
    
    function updateLevelStatsDisplay() {
        if (levelStatsDisplay) {
            levelStatsDisplay.textContent = `NIVEL: ${currentLevel}`;
        }
    }

    function rotatePieceEffect() {
        currentEffectIndex = (currentEffectIndex + 1) % PIECE_EFFECTS_ORDER.length;
        pieceEffect = PIECE_EFFECTS_ORDER[currentEffectIndex];
    }

    function selectDifficulty(newDifficulty) {
        const val = parseInt(newDifficulty, 10);
        
        if (Number.isNaN(val) || !DIFFICULTY_CONFIG[val]) return;

        difficulty = val;
        
        difficultyStartButtons.forEach(btn => {
            btn.classList.remove('selected');
            if (parseInt(btn.dataset.difficulty, 10) === val) {
                btn.classList.add('selected');
            }
        });

        timer.stop();
        pieces = []; 
        
        if(carouselImages.length > 0) {
            calculatePuzzleDimensions(); 
            setCanvas();
        }

        updateDifficultyStatsDisplay(); 
    }
    
    function preloadCarouselImages() {
        let imagesLoadedCount = 0;
        images.forEach((src) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                imagesLoadedCount++;
                if (imagesLoadedCount === images.length) {
                    onImageLoaded(); 
                }
            };
            carouselImages.push(img);
        });
    }

    function onImageLoaded() {
        setCanvas();
        
        if (!DIFFICULTY_CONFIG[difficulty]) {
              difficulty = 6;
        }
        
        selectDifficulty(difficulty);

        calculatePuzzleDimensions(); 
        initPuzzle();
        
        updateLevelStatsDisplay(); 
    }
    
    preloadCarouselImages();

    function setCanvas() {
        canvas.width = FIXED_CANVAS_WIDTH;
        canvas.height = FIXED_CANVAS_HEIGHT;
        canvas.style.border = "1px solid black";
    }

    function drawCarouselImage() {
        ctx.clearRect(0, 0, FIXED_CANVAS_WIDTH, FIXED_CANVAS_HEIGHT);

        if (carouselImages.length > 0 && carouselImages[carouselImageIndex]) {
            const previewXOffset = Math.floor((FIXED_CANVAS_WIDTH - FIXED_CANVAS_HEIGHT) / 2); 
            const previewYOffset = 0; 

            ctx.drawImage(
                carouselImages[carouselImageIndex],
                0, 0, carouselImages[carouselImageIndex].width, carouselImages[carouselImageIndex].height,
                previewXOffset, previewYOffset, FIXED_CANVAS_HEIGHT, FIXED_CANVAS_HEIGHT
            );
        }
    }

    function initPuzzle() {
        mouse = { x: 0, y: 0 };
        
        canvas.removeEventListener('pointerdown', onPuzzleClick, true); 
        
        if (winTimeoutId) {
            clearTimeout(winTimeoutId);
            winTimeoutId = null;
        }
        
        pieces = [];
        gameEnded = false;
        
        if (carouselInterval) clearInterval(carouselInterval);
    
        updateDifficultyStatsDisplay(); 
        showStartMessage(); 
        
        calculatePuzzleDimensions(); 

        drawCarouselImage(); 
        carouselInterval = setInterval(() => {
            carouselImageIndex = (carouselImageIndex + 1) % images.length;
            drawCarouselImage();
        }, 1000); 

        const ayudaBtn = document.querySelector('#ayuda');
        if (ayudaBtn) {
            ayudaBtn.removeEventListener('click', useHelp); 
            ayudaBtn.addEventListener('click', useHelp);
        }
        if (backToMenuButton) backToMenuButton.removeEventListener('click', handleBackToMenu);
        if (nextLevelButton) nextLevelButton.removeEventListener('click', handleNextLevel);
    }
    
    function handleStartGameClick(e) {
        if (e && e.target.classList.contains('difficulty-start-button')) {
            return;
        }
        
        showImageSelection();
        startRandomLevelSelection(levelButtons); 
    }
    
    function handleImageSelect(selectedButton) {
        const selectedId = selectedButton.dataset.levelId;
        currentLevelImageID = selectedId;
        
        const newIndex = LEVEL_IMAGE_MAPPING[selectedId];
        if (newIndex !== undefined) {
             carouselImageIndex = newIndex; 
        }
        
        levelButtons.forEach(btn => btn.classList.remove('resaltado'));
        selectedButton.classList.add('resaltado');
    }

    function startRandomLevelSelection(buttons) {
        const HIGHLIGHT_CLASS = 'resaltado'; 
        let randomSelectionInterval = null;

        buttons.forEach(btn => btn.classList.remove(HIGHLIGHT_CLASS));
        buttons.forEach(btn => btn.disabled = true);

        function highlightRandomButton() {
            buttons.forEach(btn => btn.classList.remove(HIGHLIGHT_CLASS));

            const randomIndex = Math.floor(Math.random() * buttons.length);
            const randomButton = buttons[randomIndex];

            randomButton.classList.add(HIGHLIGHT_CLASS);
        }

        // 1. Iniciar el cambio de resaltado al azar (AHORA CADA 200ms)
        randomSelectionInterval = setInterval(highlightRandomButton, 300); // CAMBIO CLAVE

        // 2. Detener y elegir el botón seleccionado
        setTimeout(() => {
            // Detener la selección aleatoria
            clearInterval(randomSelectionInterval);
            randomSelectionInterval = null;

            const selectedButton = document.querySelector(`#level-grid button.${HIGHLIGHT_CLASS}`);

            if (selectedButton) {
                // PRIMER PASO: Configura la imagen y resalta el botón final.
                handleImageSelect(selectedButton); 
                
                // SEGUNDO PASO: Espera 1 segundo para mostrar el botón seleccionado.
                setTimeout(() => {
                    // TERCER PASO: Inicia el juego.
                    startGame(); 
                }, 1000); 

            } else {
                 console.error("Error: No se encontró ningún botón con la clase 'resaltado' para iniciar el juego.");
            }
            
            // Rehabilitar los botones
            buttons.forEach(btn => btn.disabled = false);

        }, 3000); // Duración de la selección aleatoria
    }

    // LÓGICA PRINCIPAL DEL JUEGO

    function buildPieces() {
        pieces = [];
        
        const gameImage = carouselImages[carouselImageIndex]; 
        const sourceHeight = gameImage.height ; 
        const gameHeight = rows * pieceHeight; 
        const scaleFactor = sourceHeight / gameHeight; 
        
        const srcPieceW = pieceWidth * scaleFactor;
        const srcPieceH = pieceHeight * scaleFactor;
        
        const effectiveSourceWidth = cols * srcPieceW;
        const sourceWidth = gameImage.width; 

        let sourceXOffset = Math.floor((sourceWidth - effectiveSourceWidth) / 2);
        if (sourceXOffset < 0) {
            sourceXOffset = 0; 
        }

        const sourceYOffset = 0; 
        
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                
                const piece = {};
                
                piece.sx = i * srcPieceW + sourceXOffset; 
                piece.sy = j * srcPieceH + sourceYOffset;
                
                piece.xPos = xOffset + i * pieceWidth; 
                piece.yPos = yOffset + j * pieceHeight; 
                
                piece.rotation = 0;
                piece.locked = false; 
                
                const tmpCanvas = document.createElement('canvas');
                tmpCanvas.width = pieceWidth; 
                tmpCanvas.height = pieceHeight; 
                const tctx = tmpCanvas.getContext('2d');
                
                tctx.drawImage(
                    gameImage, 
                    piece.sx, 
                    piece.sy, 
                    srcPieceW, 
                    srcPieceH, 
                    0,
                    0,
                    pieceWidth, 
                    pieceHeight 
                );
                
                // Aplicación de efectos
                const imgData = tctx.getImageData(0, 0, pieceWidth, pieceHeight); 
                const data = imgData.data;
                
                if (pieceEffect === "grayscale") {
                    for (let p = 0; p < data.length; p += 4) {
                        const r = data[p];
                        const g = data[p + 1];
                        const b = data[p + 2];
                        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                        data[p] = gray;
                        data[p + 1] = gray;
                        data[p + 2] = gray;
                    }
                } else if (pieceEffect === "bright") {
                    for (let p = 0; p < data.length; p += 4) {
                        const r = data[p];
                        const g = data[p + 1];
                        const b = data[p + 2];
                        data[p] = Math.min(r + 50, 255);
                        data[p + 1] = Math.min(g + 50, 255);
                        data[p + 2] = Math.min(b + 50, 255);
                    }
                } else if (pieceEffect === "invert") {
                    for (let p = 0; p < data.length; p += 4) {
                        data[p] = 255 - data[p]; 
                        data[p + 1] = 255 - data[p + 1]; 
                        data[p + 2] = 255 - data[p + 2]; 
                    }
                }

                tctx.putImageData(imgData, 0, 0);
                piece.canvas = tmpCanvas;

                pieces.push(piece);
            }
        }
    }
    
    function startGame() {
        
        gameEnded = false;
        
        hideAllMessages(); 
        
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null; 
        }

        calculatePuzzleDimensions(); 
        buildPieces();

        ctx.clearRect(0, 0, FIXED_CANVAS_WIDTH, FIXED_CANVAS_HEIGHT);

        timer.start(); 
        
        for (const piece of pieces) {
            piece.rotation = Math.floor(Math.random() * 4) * 90; 
            drawPiece(piece);
        }
        const ayudaBtn = document.querySelector('#ayuda');
        if (ayudaBtn) {
            ayudaBtn.removeEventListener('click', useHelp); // <-- MANTENER ESTA LÍNEA
            ayudaBtn.addEventListener('click', useHelp);    // <-- ELIMINAR ESTA LÍNEA
        }
        
        canvas.addEventListener('pointerdown', onPuzzleClick, true);
    }

    function drawPiece(piece) {
        const angle = piece.rotation * Math.PI / 180;
        const centerX = piece.xPos + pieceWidth / 2; 
        const centerY = piece.yPos + pieceHeight / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.translate(-centerX, -centerY);

        if (piece.canvas) {
            ctx.drawImage(
                piece.canvas,
                0, 0, pieceWidth, pieceHeight, 
                piece.xPos, piece.yPos, pieceWidth, pieceHeight 
            );
        } else {
            ctx.drawImage(
                puzzleImage, 
                piece.sx, piece.sy, pieceWidth, pieceHeight, 
                piece.xPos, piece.yPos, pieceWidth, pieceHeight
            );
        }
        
        if (piece.highlighted) {
            ctx.strokeStyle = '#921818ff'; 
            ctx.lineWidth = 5;
            ctx.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight); 
            ctx.lineWidth = 1; 
        }
        
        ctx.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight); 
        ctx.restore();
    }

    function checkPieceClicked() {
        for (const piece of pieces) {
            if (
                mouse.x >= piece.xPos &&
                mouse.x <= piece.xPos + pieceWidth && 
                mouse.y >= piece.yPos &&
                mouse.y <= piece.yPos + pieceHeight 
            ) {
                return piece;
            }
        }
        return null;
    }

    function getMousePosition(e) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    }

    function onPuzzleClick(e) {
        e.preventDefault(); 
        getMousePosition(e);
        const clickedPiece = checkPieceClicked();
        
        if (clickedPiece !== null) {
            if (clickedPiece.locked) return; 

            //boton izq
            if (e.button === 0) {
                clickedPiece.rotation = (clickedPiece.rotation + 90) % 360; 
            //boton der
            } else if (e.button === 2) {
                clickedPiece.rotation = (clickedPiece.rotation - 90 + 360) % 360; 
            }
            resetPuzzleAndCheckWin();
        }
    }

    function resetPuzzleAndCheckWin() {
        if (gameEnded) return;

        ctx.clearRect(0, 0, FIXED_CANVAS_WIDTH, FIXED_CANVAS_HEIGHT);
        let gameWin = true;
        for (const piece of pieces) {
            drawPiece(piece); 
            if (piece.rotation !== 0) {
                gameWin = false;
            }
        }
        
        timer.update(); 
        
        if (gameWin && !gameEnded) {
            winTimeoutId = setTimeout(() => {
                if (!gameEnded) gameOver();
            }, 1500);
        }
    }
    
    function gameOver() {
        gameEnded = true; 

        if (winTimeoutId) {
            clearTimeout(winTimeoutId);
            winTimeoutId = null;
        }
        const elapsed = timer.getElapsed();

        timer.stop(); 
        canvas.removeEventListener('pointerdown', onPuzzleClick, true);
        
        const ayudaBtn = document.querySelector('#ayuda');
        if (ayudaBtn) {
            ayudaBtn.removeEventListener('click', useHelp);
        }
        
        const previewXOffset = Math.floor((FIXED_CANVAS_WIDTH - FIXED_CANVAS_HEIGHT) / 2); 
        const previewYOffset = 0; 
        ctx.clearRect(0, 0, FIXED_CANVAS_WIDTH, FIXED_CANVAS_HEIGHT);
        ctx.drawImage(
            carouselImages[carouselImageIndex], 
            0, 0, carouselImages[carouselImageIndex].width, carouselImages[carouselImageIndex].height,
            previewXOffset, previewYOffset, FIXED_CANVAS_HEIGHT, FIXED_CANVAS_HEIGHT
        );

        pieces = []; 

        const elapsedSec = Math.floor(elapsed / 1000);
        const min = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
        const sec = (elapsedSec % 60).toString().padStart(2, '0');
        
        showEndMessage(`¡GANASTE!\n\nTiempo: ${min}:${sec}`, true); 
        
        if (backToMenuButton) backToMenuButton.addEventListener('click', handleBackToMenu);
        if (nextLevelButton) nextLevelButton.addEventListener('click', handleNextLevel);
    }

    function gameOverTimeLimit(elapsed) {
        gameEnded = true; 

        if (winTimeoutId) {
            clearTimeout(winTimeoutId);
            winTimeoutId = null;
        }
        timer.stop(); 
        canvas.removeEventListener('pointerdown', onPuzzleClick, true);
        
        const ayudaBtn = document.querySelector('#ayuda');
        if (ayudaBtn) {
            ayudaBtn.removeEventListener('click', useHelp);
        }
        
        const limitMs = TIME_LIMITS[difficulty];
        const limitSeconds = Math.floor(limitMs / 1000);
        const limitMinutes = Math.floor(limitSeconds / 60).toString().padStart(2, '0');
        const limitSecs = (limitSeconds % 60).toString().padStart(2, '0');

        ctx.clearRect(0, 0, FIXED_CANVAS_WIDTH, FIXED_CANVAS_HEIGHT);
        for (const piece of pieces) {
            drawPiece(piece);
        }
        timer.update(); 
        
        showEndMessage(`¡PERDISTE! \n\n Límite: ${limitMinutes}:${limitSecs}`, true); 
        pieces = [];
        if (backToMenuButton) backToMenuButton.addEventListener('click', handleBackToMenu);
        if (nextLevelButton) nextLevelButton.addEventListener('click', handleNextLevel);
    }

    function useHelp() {
        if (!pieces || !pieces.length || carouselInterval !== null) return; 

        pieces.forEach(p => p.highlighted = false);

        const candidates = pieces.filter(p => (p.rotation % 360) !== 0 && !p.locked);
        if (!candidates.length) return;

        const chosen = candidates[Math.floor(Math.random() * candidates.length)];

        chosen.rotation = 0;
        chosen.locked = true;
        chosen.highlighted = true; 

        timer.addPenalty(5000); 
        resetPuzzleAndCheckWin(); 
        timer.update(); 

        setTimeout(() => {
            chosen.highlighted = false;
            resetPuzzleAndCheckWin(); 
        }, 1000); 
    } 
    
    function exitGameToMenu() {
        timer.start();
        timer.stop(); 
        currentEffectIndex = 0; 
        pieceEffect = PIECE_EFFECTS_ORDER[currentEffectIndex];
        currentLevel = 1; 
        updateLevelStatsDisplay(); 
        initPuzzle();
    }
    
    function handleBackToMenu() {
        exitGameToMenu();
    }

    function handleNextLevel() {
        const difficulties = Object.keys(DIFFICULTY_CONFIG).map(Number).sort((a, b) => a - b);
        const currentIndex = difficulties.indexOf(difficulty);
        let nextDifficulty = difficulty;
        
        if (currentIndex !== -1 && currentIndex < difficulties.length - 1) {
            nextDifficulty = difficulties[currentIndex + 1];
        } else {
            nextDifficulty = difficulties[0]; 
        }

        rotatePieceEffect(); 

        carouselImageIndex = (carouselImageIndex + 1) % images.length;
        
        currentLevel++;
        updateLevelStatsDisplay();

        difficulty = nextDifficulty;
        updateDifficultyStatsDisplay(); 
        startGame();
    }

    // 1. Botones de Dificultad (solo configuran la variable 'difficulty')
    difficultyStartButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const newDifficulty = e.currentTarget.dataset.difficulty;
            selectDifficulty(newDifficulty);
        });
    });
    
    // 2. Botones de Selección de Imagen (Ya no inician el juego, solo actúan como elementos visuales)
    levelButtons.forEach(btn => {
        btn.removeEventListener('click', handleImageSelect);
        
        btn.addEventListener('click', (e) => {
            if (e.currentTarget.disabled) { 
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });

    // 3. Botones de Control de Menú
    if (exitButton) {
        exitButton.addEventListener('click', exitGameToMenu);
    }
    
    if (backToMenuButton) {
        backToMenuButton.removeEventListener('click', handleBackToMenu);
        backToMenuButton.addEventListener('click', handleBackToMenu);
    }
    
    if (nextLevelButton) {
        nextLevelButton.removeEventListener('click', handleNextLevel);
    }

    // 4. Deshabilitar menú contextual del canvas
    canvas.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });
});