document.addEventListener('DOMContentLoaded', function() {

    const puzzleImage = new Image();
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext('2d');
    
    // =========================================================================
    // <<< NUEVAS VARIABLES PARA EL CARRUSEL EN PANTALLA DE INICIO >>>
    // =========================================================================
    let carouselImageIndex = 0; // Índice de la imagen actual en el carrusel
    let carouselInterval = null; // ID del intervalo para el carrusel
    const carouselImages = []; // Array para precargar las imágenes

    let difficulty = 4; // Dificultad del juego.
    let pieces;
    let puzzleSize; // El tamano (ancho y alto) total del rompecabezas cuadrado
    let pieceSize; // El tamano (ancho y alto) de una pieza cuadrada
    let mouse;

    // Configuración de tiempo y dificultad.
    const TIME_LIMITS = {
        4: 25 * 1000, // 3x3: 10 segundos
        6: 60 * 1000, // 4x4: 30 segundos
        8: 120 * 1000, // 6x6: 1 minuto (60 segundos)

    };

    // Efecto aplicado a las piezas: "grayscale" | "bright" | "invert"
    let pieceEffect = "grayscale";

    // Instancia del temporizador (usa TIME_LIMITS definido más abajo)
    const timer = new Timer(ctx, () => difficulty, (elapsed) => gameOverTimeLimit(elapsed), TIME_LIMITS);


    // Registra los botones de dificultad
    const difficultyButtons = document.querySelectorAll('button#difficulty');
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', changeValue);
    });


    function changeValue(e) {
        const raw = (e.currentTarget && e.currentTarget.value) || e.target.value;
        const val = parseInt(raw, 10);
        if (Number.isNaN(val) || val < 1) return;

        // Asigna la nueva dificultad
        difficulty = val;
        // detener timer si estaba corriendo
        timer.stop();
        pieces = []; // Limpia las piezas para evitar interacciones posteriores
        
        // <<< MODIFICADO: Solo ajusta el tamaño y vuelve a la pantalla inicial >>>
        const minDimension = Math.min(carouselImages[0].width, carouselImages[0].height);
        pieceSize = Math.floor(minDimension / difficulty);
        puzzleSize = pieceSize * difficulty;
        setCanvas();
        initPuzzle();
    }


    // Carga la imagen.
    const images = [
        "img/game/bomberman.png",
        "img/game/zelda1.jpg",
        "img/game/pacman.jpeg",
        "img/game/StreetFighter.png",
        "img/game/TMNT.png",
        "img/game/cronoTrigger.png"
    ];
    
    
    // =========================================================================
    // <<< NUEVAS FUNCIONES Y PROCESO DE INICIO >>>
    // =========================================================================

    // Función para precargar todas las imágenes del carrusel
    function preloadCarouselImages() {
        let imagesLoadedCount = 0;
        images.forEach((src) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                imagesLoadedCount++;
                if (imagesLoadedCount === images.length) {
                    // Una vez cargadas, podemos inicializar el canvas
                    onImageLoaded(); 
                }
            };
            carouselImages.push(img);
        });
    }

    // Esta función reemplaza a setRandomImage y se llama al inicio para precargar
    function onImageLoaded() {
        // Usa la primera imagen cargada para determinar los tamaños iniciales
        const minDimension = Math.min(carouselImages[0].width, carouselImages[0].height);
        pieceSize = Math.floor(minDimension / difficulty);
        puzzleSize = pieceSize * difficulty;

        setCanvas();
        initPuzzle();
    }
    
    // Iniciar el proceso de precarga de imágenes
    preloadCarouselImages();
    // Ya no necesitamos setRandomImage ni puzzleImage.addEventListener("load", onImage, false);
    // El proceso comienza con preloadCarouselImages -> onImageLoaded -> initPuzzle
    
    
    function setCanvas() {
        canvas.width = puzzleSize;
        canvas.height = puzzleSize;
        canvas.style.border = "1px solid black";
    }

    function drawDifficulty() {
        const text = `Dificultad: ${difficulty}x${difficulty}`;
        const x = puzzleSize - 5; // Cerca del borde derecho
        const y = 20;

        // Sombra para el texto
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'right';
        ctx.fillStyle = 'black';
        ctx.fillText(text, x + 1, y + 1);

        // Texto principal
        ctx.fillStyle = '#6699ff'; // Azul
        ctx.fillText(text, x, y);
    }

    function createTitle(msg) {
        const buttonWidth = 240;
        const buttonHeight = 40; 
        const offset = 3; 

        // Cálculo de la posición centrada (Horizontalmente)
        const x = (puzzleSize / 2) - (buttonWidth / 2);
        const y = puzzleSize - 50; 
        const textX = puzzleSize / 2;
        const textY = y + (buttonHeight / 2);

        // Dibuja la "Sombra" o Borde Inferior (Tono Oscuro)
        ctx.fillStyle = "#3a3a3a";
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0; 
        ctx.shadowColor = 'transparent';
        ctx.fillRect(x, y, buttonWidth, buttonHeight);
        
        // Dibuja el Cuerpo del Botón (Tono Claro)
        ctx.fillStyle = "#6699ff";
        ctx.globalAlpha = 1;
        ctx.fillRect(x, y, buttonWidth, buttonHeight - offset); 

        // Borde Sólido
        ctx.strokeStyle = "#111111"; 
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, buttonWidth, buttonHeight);

        // Texto del Botón (Centrado)
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = 1;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 16px Arial"; 
        
        // Mueve el texto ligeramente hacia arriba para que coincida con el cuerpo del botón
        ctx.fillText(msg, textX, textY - offset / 2); 

        // Limpieza Final
        ctx.globalAlpha = 1; 
    }

    // <<< NUEVA FUNCIÓN: Dibuja la imagen actual del carrusel >>>
    function drawCarouselImage() {
        ctx.clearRect(0, 0, puzzleSize, puzzleSize);

        // Dibuja la imagen actual del carrusel
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
        
        // Detener cualquier carrusel anterior antes de iniciar uno nuevo
        if (carouselInterval) clearInterval(carouselInterval);

        // <<< MODIFICADO: Iniciar carrusel de imágenes en la pantalla de inicio >>>
        drawCarouselImage(); // Dibuja la primera imagen
        carouselInterval = setInterval(() => {
            carouselImageIndex = (carouselImageIndex + 1) % images.length;
            drawCarouselImage();
        }, 2000); // Cambia de imagen cada 2 segundos

        // =======================================================
        // <<< MODIFICADO: Asegura que el botón de ayuda esté activo al inicio de cada ciclo de juego >>>
        // =======================================================
        const ayudaBtn = document.querySelector('#ayuda');
        if (ayudaBtn) {
            // Se remueve y se vuelve a añadir para evitar que se dupliquen listeners si initPuzzle se llama varias veces, 
            // y para asegurar que esté activo si fue removido en gameOverTimeLimit.
            ayudaBtn.removeEventListener('click', useHelp); 
            ayudaBtn.addEventListener('click', useHelp);
        }
        // =======================================================


        // Asigna el manejador al CANVAS para iniciar el juego con el primer clic
        canvas.removeEventListener('pointerdown', onPuzzleClick, true); 
        canvas.removeEventListener('pointerdown', startRotationPuzzle, true); 
        canvas.addEventListener('pointerdown', startRotationPuzzle, true);
    }


    function buildPieces() {
        pieces = [];
        let xPos = 0;
        let yPos = 0;

        // Establece puzzleImage a la imagen que estaba en el carrusel al momento de empezar
        // La imagen ya está cargada en carouselImages, solo copiamos la referencia
        puzzleImage.src = images[carouselImageIndex]; // Esto solo actualiza el src
        const gameImage = carouselImages[carouselImageIndex]; // Usar el objeto ya cargado

        // Definir el efecto de pieza basado en el índice de la imagen seleccionada
        if (carouselImageIndex % 3 === 0) pieceEffect = "grayscale";
        else if (carouselImageIndex % 3 === 1) pieceEffect = "bright";
        else pieceEffect = "invert";
        console.log("Efecto de piezas elegido para el juego:", pieceEffect);

        for (let i = 0; i < difficulty * difficulty; i++) {
            const piece = {};
            // sx y sy son la posición de origen en la imagen (la posición 'correcta')
            piece.sx = xPos; 
            piece.sy = yPos;
            // xPos y yPos son la posición de destino en el canvas (la posición 'fija')
            piece.xPos = xPos;
            piece.yPos = yPos;
            piece.rotation = 0;
            piece.locked = false; // nueva propiedad: true si la pieza fue fijada por "ayudita"

            // Crear canvas offscreen para la pieza y aplicar el efecto seleccionado
            const tmpCanvas = document.createElement('canvas');
            tmpCanvas.width = pieceSize;
            tmpCanvas.height = pieceSize;
            const tctx = tmpCanvas.getContext('2d');
            // Dibujar la porción original en el canvas temporal
            tctx.drawImage(
                gameImage, // <<< USAR EL OBJETO YA CARGADO
                piece.sx,
                piece.sy,
                pieceSize,
                pieceSize,
                0,
                0,
                pieceSize,
                pieceSize
            );

            // Obtener pixels y aplicar efecto
            const imgData = tctx.getImageData(0, 0, pieceSize, pieceSize);
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
                    data[p] = 255 - data[p]; // r
                    data[p + 1] = 255 - data[p + 1]; // g
                    data[p + 2] = 255 - data[p + 2]; // b
                }
            }

            tctx.putImageData(imgData, 0, 0);

            // Guardar canvas procesado en la pieza
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
        // Si el evento no viene del canvas, ignóralo para evitar inicio por clic en el botón
        if (e && e.currentTarget !== canvas) return;
        
        // <<< MODIFICADO: Detener el carrusel de la pantalla de inicio >>>
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null;
        }

        // Construir las piezas con la dificultad elegida (pre-carga de las piezas rotadas)
        buildPieces();

        ctx.clearRect(0, 0, puzzleSize, puzzleSize);

        // Iniciar temporizador AL EMPEZAR el rompecabezas
        timer.start();
        
        // Dibujar las piezas rotadas aleatoriamente
        for (const piece of pieces) {
            // Rotación inicial aleatoria, pero la posición (xPos, yPos) es fija
            piece.rotation = Math.floor(Math.random() * 4) * 90; 
            
            drawPiece(piece);
        }
        
        // Dibujar la dificultad (se mantiene visible)
        drawDifficulty();

        // Cambiar el manejador para que el siguiente clic rote piezas
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
                0,
                0,
                pieceSize,
                pieceSize,
                piece.xPos, 
                piece.yPos, 
                pieceSize,
                pieceSize
            );
        } else {
            ctx.drawImage(
                puzzleImage, 
                piece.sx, 
                piece.sy, 
                pieceSize,
                pieceSize,
                piece.xPos, 
                piece.yPos, 
                pieceSize,
                pieceSize
            );
        }
        
        ctx.strokeRect(piece.xPos, piece.yPos, pieceSize, pieceSize);
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
            if (clickedPiece.locked) return; // no rotar piezas fijadas por la ayudita
            if (e.button === 0) { // Clic izquierdo
                clickedPiece.rotation = (clickedPiece.rotation + 90) % 360; // Rota a la derecha
            } else if (e.button === 2) { // Clic derecho
                // Rota a la izquierda
                clickedPiece.rotation = (clickedPiece.rotation - 90 + 360) % 360; 
            }
            resetPuzzleAndCheckWin();
        }
    }

    function resetPuzzleAndCheckWin() {
        ctx.clearRect(0, 0, puzzleSize, puzzleSize);
        let gameWin = true;
        for (const piece of pieces) {
            drawPiece(piece);
            
            // Condición de victoria: todas las rotaciones deben ser 0
            if (piece.rotation !== 0) {
                gameWin = false;
            }
        }
        
        // Redibujar la dificultad y el tiempo
        drawDifficulty();
        timer.update();
        
        if (gameWin) {
            setTimeout(gameOver, 500);
        }
    }
    function gameOver() {
        // Obtener tiempo final INCLUYENDO penalizaciones antes de detener el timer
        const elapsed = timer.getElapsed();

        // Detener temporizador y desactivar entrada
        timer.stop();
        canvas.removeEventListener('pointerdown', startRotationPuzzle, true);
        canvas.removeEventListener('pointerdown', onPuzzleClick, true);
        
        // Desactivar botón de ayuda al ganar
        const ayudaBtn = document.querySelector('#ayuda');
        if (ayudaBtn) {
            ayudaBtn.removeEventListener('click', useHelp);
        }

        // Mostrar imagen completa a color (escalada al puzzleSize)
        ctx.clearRect(0, 0, puzzleSize, puzzleSize);
        ctx.drawImage(
            carouselImages[carouselImageIndex], 
            0, 0, carouselImages[carouselImageIndex].width, carouselImages[carouselImageIndex].height,
            0, 0, puzzleSize, puzzleSize
        );

        pieces = []; // Limpia las piezas para evitar interacciones posteriores

        // Formatear y mostrar tiempo final usando el elapsed obtenido arriba
        const totalSeconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        createTitle(`¡GANASTE! Tiempo: ${minutes}:${seconds}`);

        // Reiniciar la pantalla de inicio después de mostrar la imagen ganadora
        setTimeout(() => {
            initPuzzle();
        }, 3000);
    }

    // ******* NUEVA FUNCIÓN DE DERROTA POR TIEMPO LÍMITE *******
    function gameOverTimeLimit(elapsed) {
        // Detener temporizador y desactivar entrada
        timer.stop();
        canvas.removeEventListener('pointerdown', startRotationPuzzle, true);
        canvas.removeEventListener('pointerdown', onPuzzleClick, true);
        
        // =======================================================
        // <<< CÓDIGO SOLICITADO: Desactiva el botón de ayuda al terminar el tiempo >>>
        // =======================================================
        const ayudaBtn = document.querySelector('#ayuda');
        if (ayudaBtn) {
            ayudaBtn.removeEventListener('click', useHelp);
        }
        // =======================================================

        // Tiempo final
        const totalSeconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');

        // Muestra la imagen desordenada y el mensaje de derrota
        ctx.clearRect(0, 0, puzzleSize, puzzleSize);
        for (const piece of pieces) {
            drawPiece(piece);
        }
        timer.draw(elapsed);
        
        // Obtener el tiempo límite para mostrarlo en el mensaje
        const limitMs = TIME_LIMITS[difficulty];
        const limitSeconds = Math.floor(limitMs / 1000);
        const limitMinutes = Math.floor(limitSeconds / 60).toString().padStart(2, '0');
        const limitSecs = (limitSeconds % 60).toString().padStart(2, '0');

        createTitle(`¡PERDISTES! Límite: ${limitMinutes}:${limitSecs}`);
        pieces = [];

        // Reinicia el juego después de mostrar el mensaje de derrota
        setTimeout(() => {
            initPuzzle();
        }, 3000);
    }
    // *************************************************************

    // registrar botón de ayuda (QUITAMOS EL REGISTRO INICIAL, LO MOVEMOS A initPuzzle)
    // const ayudaBtn = document.querySelector('#ayuda');
    // if (ayudaBtn) ayudaBtn.addEventListener('click', useHelp);

    function useHelp() {
        // Solo si ya existen piezas (juego iniciado)
        if (!pieces || !pieces.length || timer.getElapsed() === 0) return; // Solo si el temporizador está activo

        // Busca piezas no resueltas y no bloqueadas
        const candidates = pieces.filter(p => (p.rotation % 360) !== 0 && !p.locked);
        if (!candidates.length) return;

        // Elegir una al azar
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];

        // Colocar correctamente y bloquearla
        chosen.rotation = 0;
        chosen.locked = true;

        // Sumar 5 segundos (5000 ms) de penalización usando el objeto Timer
        timer.addPenalty(5000);

        // Redibujar y actualizar timer (y chequear posible victoria)
        resetPuzzleAndCheckWin();
        timer.update();
    }

    // Previene el comportamiento por defecto del menú contextual.
    canvas.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });
});