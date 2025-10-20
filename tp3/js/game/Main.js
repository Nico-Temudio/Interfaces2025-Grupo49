document.addEventListener('DOMContentLoaded', function() {

    const puzzleImage = new Image();
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext('2d');

    let carouselImageIndex = 0; // Índice de la imagen actual en el carrusel
    let carouselInterval = null; // ID del intervalo para el carrusel
    const carouselImages = []; // Array para precargar las imágenes

    let difficulty = 4;
    let pieces;
    let puzzleSize; 
    let pieceSize; 
    let mouse;
    let winTimeoutId = null;
    let gameEnded = false;

    const TIME_LIMITS = {
        4: 25 * 1000,
        6: 60 * 1000,
        8: 120 * 1000, 
    };

    let pieceEffect = "grayscale";
    
    const timer = new Timer(ctx, () => difficulty, (elapsed) => gameOverTimeLimit(elapsed), TIME_LIMITS);


    // Referencias a los botones de dificultad y ayuda
    const difficultyToggleBtn = document.querySelector('#difficultyToggle');
    const difficultyOptionsDiv = document.querySelector('.difficulty-options');
    const difficultyOptionButtons = document.querySelectorAll('.difficulty-option');

    // Lógica para Mostrar/Ocultar el menú de dificultad
    if (difficultyToggleBtn) {
        difficultyToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation(); 
            difficultyOptionsDiv.classList.toggle('show');
        });
    }

    // Manejar la selección de dificultad (4, 6, 8)
    difficultyOptionButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            changeValue(e); 
            difficultyOptionsDiv.classList.remove('show'); 
        });
    });

    // Ocultar el menú si se hace clic en cualquier otro lugar
    document.addEventListener('click', function(e) {
        if (difficultyOptionsDiv && difficultyOptionsDiv.classList.contains('show') && 
            !difficultyToggleBtn.contains(e.target) && !difficultyOptionsDiv.contains(e.target)) {
            difficultyOptionsDiv.classList.remove('show');
        }
    });


    function changeValue(e) {
        const raw = (e.currentTarget && e.currentTarget.value) || e.target.value;
        const val = parseInt(raw, 10);
        if (Number.isNaN(val) || val < 1) return;

        difficulty = val;
        
        timer.stop();
        pieces = []; 
        
        if(carouselImages.length > 0) {
            const minDimension = Math.min(carouselImages[0].width, carouselImages[0].height);
            pieceSize = Math.floor(minDimension / difficulty);
            puzzleSize = pieceSize * difficulty;
            setCanvas();
        }

        initPuzzle();
    }


    const images = [
        "img/game/bomberman.png",
        "img/game/zelda1.jpg",
        "img/game/pacman.jpeg",
        "img/game/StreetFighter.png",
        "img/game/TMNT.png",
        "img/game/cronoTrigger.png"
    ];
    
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
        const minDimension = Math.min(carouselImages[0].width, carouselImages[0].height);
        pieceSize = Math.floor(minDimension / difficulty);
        puzzleSize = pieceSize * difficulty;

        setCanvas();
        initPuzzle();
    }
    
    preloadCarouselImages();
    
    function setCanvas() {
        canvas.width = puzzleSize;
        canvas.height = puzzleSize;
        canvas.style.border = "1px solid black";
    }

    function drawDifficulty() {
        const text = `Dificultad: ${difficulty}x${difficulty}`;
        const x = puzzleSize - 5; 
        const y = 20;

        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'right';
        ctx.fillStyle = 'black';
        ctx.fillText(text, x + 1, y + 1);

        ctx.fillStyle = "#636363ff";
        ctx.fillText(text, x, y);
    }

    function createTitle(msg) {
        const buttonWidth = 240;
        const buttonHeight = 40; 
        const offset = 3; 

        const x = (puzzleSize / 2) - (buttonWidth / 2);
        const y = puzzleSize - 50; 
        const textX = puzzleSize / 2;
        const textY = y + (buttonHeight / 2);
        
        ctx.fillStyle = "#ff9e66ff";
        ctx.globalAlpha = 1;
        ctx.fillRect(x, y, buttonWidth, buttonHeight - offset); 

        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = 1;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 16px Arial"; 
        
        ctx.fillText(msg, textX, textY - offset / 2); 

        ctx.globalAlpha = 1; 
    }

    function drawCarouselImage() {
        ctx.clearRect(0, 0, puzzleSize, puzzleSize);

        if (carouselImages.length > 0 && carouselImages[carouselImageIndex]) {
            ctx.drawImage(
                carouselImages[carouselImageIndex],
                0, 0, carouselImages[carouselImageIndex].width, carouselImages[carouselImageIndex].height,
                0, 0, puzzleSize, puzzleSize
            );
        }
        createTitle("¡HAZ CLICK PARA EMPEZAR!");
        drawDifficulty();
    }


    function initPuzzle() {
        mouse = { x: 0, y: 0 };
        
        if (carouselInterval) clearInterval(carouselInterval);

        drawCarouselImage(); 
        carouselInterval = setInterval(() => {
            carouselImageIndex = (carouselImageIndex + 1) % images.length;
            drawCarouselImage();
        }, 1000); 

        // Registro/re-registro del botón de ayuda 
        const ayudaBtn = document.querySelector('#ayuda');
        if (ayudaBtn) {
            ayudaBtn.removeEventListener('click', useHelp); 
            ayudaBtn.addEventListener('click', useHelp);
        }

        canvas.removeEventListener('pointerdown', onPuzzleClick, true); 
        canvas.removeEventListener('pointerdown', startRotationPuzzle, true); 
        canvas.addEventListener('pointerdown', startRotationPuzzle, true);
    }


    function buildPieces() {
        pieces = [];
        let xPos = 0;
        let yPos = 0;

        puzzleImage.src = images[carouselImageIndex]; 
        const gameImage = carouselImages[carouselImageIndex]; 
    
        const r = Math.floor(Math.random() * 3);
        if (r === 0) pieceEffect = "grayscale";
        else if (r === 1) pieceEffect = "bright";
        else pieceEffect = "invert";

        for (let i = 0; i < difficulty * difficulty; i++) {
            const piece = {};
            piece.sx = xPos; 
            piece.sy = yPos;
            piece.xPos = xPos;
            piece.yPos = yPos;
            piece.rotation = 0;
            piece.locked = false; 

            const tmpCanvas = document.createElement('canvas');
            tmpCanvas.width = pieceSize;
            tmpCanvas.height = pieceSize;
            const tctx = tmpCanvas.getContext('2d');
            
            tctx.drawImage(
                gameImage, 
                piece.sx,
                piece.sy,
                pieceSize,
                pieceSize,
                0,
                0,
                pieceSize,
                pieceSize
            );

            const imgData = tctx.getImageData(0, 0, pieceSize, pieceSize);
            const data = imgData.data;
            
            // Aplicar efecto
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
            
            xPos += pieceSize;
            if (xPos >= puzzleSize) {
                xPos = 0;
                yPos += pieceSize;
            }
        }
    }

    function startRotationPuzzle(e) {
        if (e && e.currentTarget !== canvas) return;
        gameEnded = false;
        
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null; 
        }

        buildPieces();

        ctx.clearRect(0, 0, puzzleSize, puzzleSize);

        timer.start();
        
        for (const piece of pieces) {
            piece.rotation = Math.floor(Math.random() * 4) * 90; 
            drawPiece(piece);
        }
        
        drawDifficulty();

        canvas.removeEventListener('pointerdown', startRotationPuzzle, true);
        canvas.addEventListener('pointerdown', onPuzzleClick, true);
    }


function drawPiece(piece) {
        const angle = piece.rotation * Math.PI / 180;
        const centerX = piece.xPos + pieceSize / 2;
        const centerY = piece.yPos + pieceSize / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.translate(-centerX, -centerY);

        if (piece.canvas) {
            ctx.drawImage(
                piece.canvas,
                0, 0, pieceSize, pieceSize,
                piece.xPos, piece.yPos, pieceSize, pieceSize
            );
        } else {
            ctx.drawImage(
                puzzleImage, 
                piece.sx, piece.sy, pieceSize, pieceSize,
                piece.xPos, piece.yPos, pieceSize, pieceSize
            );
        }
        
        
        if (piece.highlighted) {
            ctx.strokeStyle = '#FFD700'; 
            ctx.lineWidth = 5;
            ctx.strokeRect(piece.xPos, piece.yPos, pieceSize, pieceSize);
            ctx.lineWidth = 1; 
        }
        
        ctx.strokeRect(piece.xPos, piece.yPos, pieceSize, pieceSize); // Dibuja el borde normal
        ctx.restore();
    }
    function checkPieceClicked() {
        for (const piece of pieces) {
            if (
                mouse.x >= piece.xPos &&
                mouse.x <= piece.xPos + pieceSize &&
                mouse.y >= piece.yPos &&
                mouse.y <= piece.yPos + pieceSize
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
            if (e.button === 0) {
                clickedPiece.rotation = (clickedPiece.rotation + 90) % 360; 
            } else if (e.button === 2) {
                clickedPiece.rotation = (clickedPiece.rotation - 90 + 360) % 360; 
            }
            resetPuzzleAndCheckWin();
        }
    }

    function resetPuzzleAndCheckWin() {
    if (gameEnded) return; // No seguir si el juego ya terminó

    ctx.clearRect(0, 0, puzzleSize, puzzleSize);
    let gameWin = true;
    for (const piece of pieces) {
        drawPiece(piece);
        if (piece.rotation !== 0) {
            gameWin = false;
        }
    }
    
    drawDifficulty();
    timer.update();
    
    if (gameWin && !gameEnded) {
        winTimeoutId = setTimeout(() => {
            if (!gameEnded) gameOver();
        }, 500);
    }
}
    
    function gameOver() {
    gameEnded = true; // Marca que el juego terminó

    if (winTimeoutId) {
        clearTimeout(winTimeoutId);
        winTimeoutId = null;
    }
    const elapsed = timer.getElapsed();

    timer.stop();
    canvas.removeEventListener('pointerdown', startRotationPuzzle, true);
    canvas.removeEventListener('pointerdown', onPuzzleClick, true);
    
    const ayudaBtn = document.querySelector('#ayuda');
    if (ayudaBtn) {
        ayudaBtn.removeEventListener('click', useHelp);
    }

    ctx.clearRect(0, 0, puzzleSize, puzzleSize);
    ctx.drawImage(
        carouselImages[carouselImageIndex], 
        0, 0, carouselImages[carouselImageIndex].width, carouselImages[carouselImageIndex].height,
        0, 0, puzzleSize, puzzleSize
    );

    pieces = []; 

    const elapsedSec = Math.floor(elapsed / 1000);
    const min = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
    const sec = (elapsedSec % 60).toString().padStart(2, '0');
    createTitle(`¡GANASTE! Tiempo: ${min}:${sec}`);

    setTimeout(() => {
        initPuzzle();
    }, 3000);
}

function gameOverTimeLimit(elapsed) {
    gameEnded = true; // Marca que el juego terminó

    if (winTimeoutId) {
        clearTimeout(winTimeoutId);
        winTimeoutId = null;
    }
    timer.stop();
    canvas.removeEventListener('pointerdown', startRotationPuzzle, true);
    canvas.removeEventListener('pointerdown', onPuzzleClick, true);
    
    const ayudaBtn = document.querySelector('#ayuda');
    if (ayudaBtn) {
        ayudaBtn.removeEventListener('click', useHelp);
    }

    const totalSeconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');

    ctx.clearRect(0, 0, puzzleSize, puzzleSize);
    for (const piece of pieces) {
        drawPiece(piece);
    }
    timer.draw(elapsed);
    
    const limitMs = TIME_LIMITS[difficulty];
    const limitSeconds = Math.floor(limitMs / 1000);
    const limitMinutes = Math.floor(limitSeconds / 60).toString().padStart(2, '0');
    const limitSecs = (limitSeconds % 60).toString().padStart(2, '0');

    createTitle(`¡PERDISTE! Límite: ${limitMinutes}:${limitSecs}`);
    pieces = [];

    setTimeout(() => {
        initPuzzle();
    }, 3000);
}

function useHelp() {
        // La ayuda está disponible solo si hay piezas y el carrusel *no* está corriendo (juego activo).
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
            resetPuzzleAndCheckWin(); // Redibujar para quitar el resaltado
        }, 1000); 
    }

    canvas.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });
});