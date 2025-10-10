const puzzleImage = new Image();
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext('2d'); 

// Variables.

let difficulty = 3; 
let pieces;
let puzzleSize; // El tamano (ancho y alto) total del rompecabezas cuadrado
let pieceSize; // El tamano (ancho y alto) de una pieza cuadrada
let mouse;

// Temporizador
let startTime = null;
let timerInterval = null;

// Efecto aplicado a las piezas: "grayscale" | "bright" | "invert"
let pieceEffect = "grayscale";

// Previene el comportamiento por defecto del menú contextual.

canvas.addEventListener('contextmenu', function(event) {
  event.preventDefault();});

// Carga la imagen.
const images = [
    //"img/hokage_naruto_uzumaki_hd_naruto-1920x1080.jpg",
   "img/img1.png"
  //elegir mas imagenes tamaños iguales a 1920x1080
];
// Selecciona una imagen al azar y la carga
const chosenIndex = Math.floor(Math.random() * images.length);
puzzleImage.src = images[chosenIndex]; 

// Selecciona un efecto al azar al iniciar: 0 = grayscale, 1 = bright, 2 = invert
{
    const r = Math.floor(Math.random() * 3);
    if (r === 0) pieceEffect = "grayscale";
    else if (r === 1) pieceEffect = "bright";
    else pieceEffect = "invert";
    console.log("Efecto de piezas elegido:", pieceEffect);
}

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

function createTitle(msg) {
    const buttonWidth = 240; // Nuevo ancho reducido
    const buttonHeight = 40; // Alto sin cambios
    const offset = 3;        // Desplazamiento para el efecto 3D

    // Cálculo de la posición centrada (Horizontalmente)
    const x = (puzzleSize / 2) - (buttonWidth / 2); // Centrado
    const y = puzzleSize - 50;                     // Posición vertical (un poco más arriba)
    const textX = puzzleSize / 2;                  // Centro horizontal
    const textY = y + (buttonHeight / 2);          // Centro vertical del botón

    // 1. Dibuja la "Sombra" o Borde Inferior (Tono Oscuro)
    ctx.fillStyle = "#3a3a3a"; // Gris muy oscuro
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0; 
    ctx.shadowColor = 'transparent'; // Limpiamos la sombra
    ctx.fillRect(x, y, buttonWidth, buttonHeight);
    
    // 2. Dibuja el Cuerpo del Botón (Tono Claro)
    ctx.fillStyle = "#6699ff"; // Azul medio brillante
    ctx.globalAlpha = 1;
    ctx.fillRect(x, y, buttonWidth, buttonHeight - offset); 

    // 3. Borde Sólido
    ctx.strokeStyle = "#111111"; // Negro para un borde definido
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, buttonWidth, buttonHeight);

    // 4. Texto del Botón (Centrado)
    ctx.fillStyle = "#FFFFFF"; // Texto blanco
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 16px Arial"; 
    
    // Mueve el texto ligeramente hacia arriba para que coincida con el cuerpo del botón
    ctx.fillText(msg, textX, textY - offset / 2); 

    // **Limpieza Final**
    ctx.globalAlpha = 1; 
}

// Dibuja la imagen completa inicial para mostrar el mensaje de inicio.

function initPuzzle() {
    mouse = { x: 0, y: 0 };
    
    ctx.drawImage(
        puzzleImage,
        0, 0, puzzleSize, puzzleSize, 
        0, 0, puzzleSize, puzzleSize
    );
    createTitle("¡HAZ CLICK PARA EMPEZAR!");
    buildPieces();
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
                // alpha se mantiene
            }
        } else if (pieceEffect === "bright") {
    // Aumenta el brillo sin pasarse de 255
            for (let p = 0; p < data.length; p += 4) {
                const r = data[p];
                const g = data[p + 1];
                const b = data[p + 2];
                data[p]     = Math.min(r + 30, 255);
                data[p + 1] = Math.min(g + 30, 255);
                data[p + 2] = Math.min(b + 30, 255);
            }

        } else if (pieceEffect === "invert") {
            for (let p = 0; p < data.length; p += 4) {
                data[p]     = 255 - data[p];     // r
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
    document.onpointerdown = startRotationPuzzle;
}

// Función que desordena solamente la posición de la imagen en vuelta.


function startRotationPuzzle() {
    ctx.clearRect(0, 0, puzzleSize, puzzleSize);
     // Iniciar temporizador al empezar el rompecabezas
    startTimer();
    
    
    for (const piece of pieces) {
        // Rotación inicial aleatoria, pero la posición (xPos, yPos) es fija
        piece.rotation = Math.floor(Math.random() * 4) * 90; 
        
        drawPiece(piece);
    }
    document.onpointerdown = onPuzzleClick;
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
     if (e.layerX || e.layerX === 0) {
        mouse.x = e.layerX - canvas.offsetLeft;
        mouse.y = e.layerY - canvas.offsetTop;
    } else if (e.offsetX || e.offsetX === 0) {
        mouse.x = e.offsetX - canvas.offsetLeft;
        mouse.y = e.offsetY - canvas.offsetTop;
    }
}

function onPuzzleClick(e) {
    e.preventDefault(); 
    getMousePosition(e);
    const clickedPiece = checkPieceClicked();
    
    if (clickedPiece !== null) {
        if (e.button === 0) { // Clic izquierdo
            clickedPiece.rotation = (clickedPiece.rotation + 90) % 360; // Rota a la derecha
        } else if (e.button === 2) { // Clic derecho
            // Rota a la izquierda: (rotación - 90 + 360) % 360 para manejar valores negativos
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
    
    if (gameWin) {
        setTimeout(gameOver, 500);
    }
}


function updateTimer() {
    if (!startTime) return;
    const elapsed = Date.now() - startTime;
    drawTimer(elapsed);
}
function drawTimer(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const text = `${minutes}:${seconds}`;

    // Área pequeña arriba a la izquierda
    const boxW = 70;
    const boxH = 30;
    const x = 0;
    const y = 0;
    const offset = 2; // Desplazamiento para el efecto 3D (un poco menor que el botón)
    
    // Colores del Estilo Relieve
    const highlightColor = "#6699ff"; // Azul medio brillante (Cuerpo)
    const textColor = "#FFFFFF";     // Texto blanco

    ctx.save();
    
    // 1. Limpieza y Sombra de la Caja (Base)
    ctx.clearRect(x, y, boxW + 4, boxH + 4); 

    // Dibuja la base completa.
    ctx.fillRect(x + 2, y + 2, boxW, boxH);

    // 2. Cuerpo Principal de la Caja (Relieve)
    ctx.fillStyle = highlightColor;
    ctx.globalAlpha = 1;
    
    ctx.fillRect(x + 2, y + 2, boxW - offset, boxH - offset); 

    // 4. Texto del Reloj
    ctx.fillStyle = textColor;
    ctx.font = 'bold 16px Arial'; // Un poco más audaz para que resalte
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Ajusta la posición del texto para que coincida con el cuerpo del relieve
    ctx.fillText(text, 2 + boxW / 2 - offset / 2, 2 + boxH / 2 - offset / 2);

    ctx.restore();
}

function startTimer() {
    startTime = Date.now();
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
    document.onpointerdown = null;
    document.onpointermove = null; 
    document.onpointerup = null;

    // Mostrar imagen completa a color (escalada al puzzleSize)
    ctx.clearRect(0, 0, puzzleSize, puzzleSize);
    ctx.drawImage(
        puzzleImage,
        0, 0, puzzleImage.width, puzzleImage.height,
        0, 0, puzzleSize, puzzleSize
    );

    // Mostrar tiempo final
    const elapsed = startTime ? Date.now() - startTime : 0;
    const totalSeconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    createTitle(`¡GANASTE! Tiempo: ${minutes}:${seconds}`);

    // Evitar que el timer siga activo si se llamara accidentalmente
    startTime = null;

    // Reiniciar el puzzle después de unos segundos
    setTimeout(initPuzzle, 5000);
}