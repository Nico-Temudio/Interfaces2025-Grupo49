document.addEventListener('DOMContentLoaded', function() {

const puzzleImage = new Image();
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext('2d'); 

let difficulty = 3; 
let pieces;
let puzzleSize; // El tamano (ancho y alto) total del rompecabezas cuadrado
let pieceSize; // El tamano (ancho y alto) de una pieza cuadrada
let mouse;

// Temporizador
let startTime = null;
let timerInterval = null;
let penaltyMs = 0; // acumulador de penalizaciones (ms)

// Objeto con los límites de tiempo en milisegundos (ms)
// Dificultad: Tiempo Límite (en ms)
const TIME_LIMITS = {
    3: 10 * 1000, // 3x3: 10 segundos
    4: 30 * 1000, // 4x4: 30 segundos
    6: 60 * 1000, // 6x6: 1 minuto (60 segundos)
    // Puedes añadir más si lo necesitas, por ejemplo:
    // 5: 45 * 1000, // 5x5: 45 segundos
};

// Efecto aplicado a las piezas: "grayscale" | "bright" | "invert"
let pieceEffect = "grayscale";




// Registra los botones de dificultad
const difficultyButtons = document.querySelectorAll('button#difficulty');
difficultyButtons.forEach(btn => {
    // solo enlaza botones que tengan un value numérico
    btn.addEventListener('click', changeValue);
});




function changeValue(e) {
    const raw = (e.currentTarget && e.currentTarget.value) || e.target.value;
    const val = parseInt(raw, 10);
    if (Number.isNaN(val) || val < 1) return;

    // Asigna la nueva dificultad
    difficulty = val;
    stopTimer();
    pieces = []; // Limpia las piezas para evitar interacciones posteriores
    // Cambia la imagen al azar cuando el usuario toca un botón de dificultad
    setRandomImage();
    // onImage() se ejecutará cuando la nueva imagen termine de cargar
}





// Carga la imagen.
const images = [
    "img/game/mario.jpeg",
    "img/game/zelda.jpeg",
    "img/game/pacman.jpeg",
];

// elige y asigna una imagen aleatoria
function setRandomImage() {
    const idx = Math.floor(Math.random() * images.length);
    puzzleImage.src = images[idx];
    return idx;
}

// Selecciona una imagen al azar y la carga inicialmente
setRandomImage();

puzzleImage.addEventListener("load", onImage, false);

// Calcula el tamano del lado cuadrado basado en la dimensión más pequena de la imagen.
function onImage() {
    const minDimension = Math.min(puzzleImage.width, puzzleImage.height);
    pieceSize = Math.floor(minDimension / difficulty);
    puzzleSize = pieceSize * difficulty;

    setCanvas();
    initPuzzle();
}

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

function initPuzzle() {
    mouse = { x: 0, y: 0 };
    
    // Asegura que el tamano y canvas se establezcan con la dificultad por defecto/actual
    const minDimension = Math.min(puzzleImage.width, puzzleImage.height);
    pieceSize = Math.floor(minDimension / difficulty);
    puzzleSize = pieceSize * difficulty;
    setCanvas();
    
    ctx.drawImage(
        puzzleImage,
        0, 0, puzzleSize, puzzleSize, 
        0, 0, puzzleSize, puzzleSize
    );
    createTitle("¡HAZ CLICK PARA EMPEZAR!");
    drawDifficulty();
    
    // Asigna el manejador al CANVAS para iniciar el juego con el primer clic
    canvas.removeEventListener('pointerdown', onPuzzleClick, true); 
    canvas.removeEventListener('pointerdown', startRotationPuzzle, true); 
    canvas.addEventListener('pointerdown', startRotationPuzzle, true);
}


function buildPieces() {
    pieces = [];
    let xPos = 0;
    let yPos = 0;
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
            puzzleImage,
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
    
    // Detenemos cualquier timer en caso de que se haya reiniciado la dificultad
    stopTimer(); 
    
    // Construir las piezas con la dificultad elegida (pre-carga de las piezas rotadas)
    buildPieces();

    ctx.clearRect(0, 0, puzzleSize, puzzleSize);

    // Iniciar temporizador AL EMPEZAR el rompecabezas
    startTimer();
    
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
    updateTimer();
    
    if (gameWin) {
        setTimeout(gameOver, 500);
    }
}

function updateTimer() {
    if (!startTime) return;
    const elapsed = Date.now() - startTime + (penaltyMs || 0);
    
    drawTimer(elapsed);
    
    // ******* LÓGICA DEL TIEMPO LÍMITE AÑADIDA *******
    const limit = TIME_LIMITS[difficulty];
    if (limit && elapsed >= limit) {
        // Si hay límite para esta dificultad y se excedió el tiempo, terminar el juego
        gameOverTimeLimit(elapsed);
        return;
    }
    // ***********************************************
}

function drawTimer(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const text = `${minutes}:${seconds}`;

    // ******* INDICADOR DE TIEMPO LÍMITE AÑADIDO *******
    let highlightColor = "#6699ff"; // Azul por defecto
    const limit = TIME_LIMITS[difficulty];
    if (limit) {
        // Ponerlo en amarillo si queda poco tiempo (ej: últimos 5 segundos)
        if (ms >= limit - 5000 && ms < limit) {
            highlightColor = "#ffcc00"; // Amarillo
        } 
        // Ponerlo en rojo si ha pasado el tiempo límite (aunque esto no debería ocurrir si se llama gameOverTimeLimit)
        else if (ms >= limit) { 
            highlightColor = "#cc0000"; // Rojo
        }
    }
    // ***********************************************

    const boxW = 70;
    const boxH = 30;
    const x = 0;
    const y = 0;
    const offset = 2;
    
    // Colores del Estilo Relieve
    const textColor = "#FFFFFF";

    ctx.save();
    
    // Solo limpiamos donde se dibuja el timer para no borrar el resto del canvas
    ctx.clearRect(x, y, boxW + 4, boxH + 4); 

    // Dibuja la base completa.
    ctx.fillRect(x + 2, y + 2, boxW, boxH);

    // Cuerpo Principal de la Caja (Relieve)
    ctx.fillStyle = highlightColor;
    ctx.globalAlpha = 1;
    
    ctx.fillRect(x + 2, y + 2, boxW - offset, boxH - offset); 

    // Texto del Reloj
    ctx.fillStyle = textColor;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Ajusta la posición del texto para que coincida con el cuerpo del relieve
    ctx.fillText(text, 2 + boxW / 2 - offset / 2, 2 + boxH / 2 - offset / 2);

    ctx.restore();
}

function startTimer() {
    startTime = Date.now();
    penaltyMs = 0; // reset penalizaciones al iniciar
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 200);
    updateTimer();
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function gameOver() {
    // Detener temporizador y desactivar entrada
    stopTimer();
    canvas.removeEventListener('pointerdown', startRotationPuzzle, true);
    canvas.removeEventListener('pointerdown', onPuzzleClick, true);

    // Mostrar imagen completa a color (escalada al puzzleSize)
    ctx.clearRect(0, 0, puzzleSize, puzzleSize);
    ctx.drawImage(
        puzzleImage,
        0, 0, puzzleImage.width, puzzleImage.height,
        0, 0, puzzleSize, puzzleSize
    );

    pieces = []; // Limpia las piezas para evitar interacciones posteriores

    // Tiempo final INCLUYENDO penalizaciones
    const elapsed = startTime ? Date.now() - startTime + (penaltyMs || 0) : (penaltyMs || 0);
    const totalSeconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    createTitle(`¡GANASTE! Tiempo: ${minutes}:${seconds}`);

    // Evitar que el timer siga activo si se llamara accidentalmente
    startTime = null;

    // Después de mostrar la imagen ganadora brevemente, cambia la imagen al azar
    setTimeout(() => {
        setRandomImage();
        // onImage() volverá a inicializar el puzzle cuando la nueva imagen cargue
    }, 3000);
}

// ******* NUEVA FUNCIÓN DE DERROTA POR TIEMPO LÍMITE *******
function gameOverTimeLimit(elapsed) {
    // Detener temporizador y desactivar entrada
    stopTimer();
    canvas.removeEventListener('pointerdown', startRotationPuzzle, true);
    canvas.removeEventListener('pointerdown', onPuzzleClick, true);

    // Tiempo final
    const totalSeconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');

    // Muestra la imagen desordenada y el mensaje de derrota
    ctx.clearRect(0, 0, puzzleSize, puzzleSize);
    for (const piece of pieces) {
        drawPiece(piece);
    }
    drawTimer(elapsed);
    
    // Obtener el tiempo límite para mostrarlo en el mensaje
    const limitMs = TIME_LIMITS[difficulty];
    const limitSeconds = Math.floor(limitMs / 1000);
    const limitMinutes = Math.floor(limitSeconds / 60).toString().padStart(2, '0');
    const limitSecs = (limitSeconds % 60).toString().padStart(2, '0');

    createTitle(`¡SE ACABÓ EL TIEMPO! Límite: ${limitMinutes}:${limitSecs}`);

    startTime = null;

    // Reinicia el juego después de mostrar el mensaje de derrota
    setTimeout(() => {
        setRandomImage();
    }, 3000);
}
// *************************************************************

// registrar botón de ayuda
const ayudaBtn = document.querySelector('#ayuda');
if (ayudaBtn) ayudaBtn.addEventListener('click', useHelp);

function useHelp() {
    // Solo si ya existen piezas (juego iniciado)
    if (!pieces || !pieces.length) return;

    // Busca piezas no resueltas y no bloqueadas
    const candidates = pieces.filter(p => (p.rotation % 360) !== 0 && !p.locked);
    if (!candidates.length) return;

    // Elegir una al azar
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    // Colocar correctamente y bloquearla
    chosen.rotation = 0;
    chosen.locked = true;

    // Sumar 5 segundos (5000 ms) de penalización
    penaltyMs += 5000;

    // Redibujar y actualizar timer (y chequear posible victoria)
    resetPuzzleAndCheckWin();
    updateTimer();
}

// Evitar rotar piezas "locked"
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


// Previene el comportamiento por defecto del menú contextual.
canvas.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});
});