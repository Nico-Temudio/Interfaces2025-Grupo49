document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Obtención de Elementos del DOM ---
    const playBtn = document.querySelector('.play');
    const menuConfig = document.getElementById('menu-config');
    const canvas = document.getElementById('canvas');
    const preview = document.querySelector('.solitario-container img');
    const btnIniciar = document.getElementById('btnIniciar');
    const timer = document.getElementById('timer');
    const btnConfig = document.getElementById('config-game');
    const btnSalir = document.getElementById('exit-game');
    const tiempoLimiteSelect = document.getElementById('tiempolimite');
    const movimientosDisplay = document.getElementById('movimientos');

    const opcionesFicha = document.querySelectorAll('.ficha-opcion'); 

    let ctx = canvas.getContext('2d');
    const temaInicial = document.querySelector('.ficha-opcion.activo')?.dataset.value || 'classic';
    const tablero = new Tablero(ctx, canvas.width, canvas.height, temaInicial);
    
    let timerInterval = null;
    let remainingSeconds = 0;
    let movimientos = 0; // contador de movimientos

    let lastClickedFicha = null; // La ficha que se está arrastrando
    let isMouseDown = false;
    let dragStartCell = null; // Celda de donde comenzó el arrastre
    let dragOffsetX = 0; // Desplazamiento inicial X del ratón respecto al centro de la ficha
    let dragOffsetY = 0; // Desplazamiento inicial Y del ratón respecto al centro de la ficha

    // --- 2. ESTADO INICIAL ---
    const inicializarEstado = () => {
        playBtn.style.display = 'block';
        preview.style.display = 'block';

        menuConfig.style.display = 'none';
        canvas.style.display = 'none';
        timer.style.display = 'none';
        btnSalir.style.display = 'none';
        btnConfig.style.display = 'none';
        movimientosDisplay.style.display = 'none'; // ocultar al inicio
        movimientosDisplay.textContent = 'Movimientos: 0';
    };

    inicializarEstado();

    // --- 3. EVENTOS DE TRANSICIÓN ---
    playBtn.addEventListener('click', () => {
        playBtn.style.display = 'none';
        preview.style.display = 'none';
        menuConfig.style.display = 'flex';
    });

    btnIniciar.addEventListener('click', () => {
        const dificultad = document.getElementById('dificultad').value;
        const tiempoElegido = tiempoLimiteSelect.value;

        console.log("Iniciando juego con:", { temaActual: tablero.theme, dificultad, tiempoElegido });

        menuConfig.style.display = 'none';
        canvas.style.display = 'block';
        timer.style.display = 'block';
        btnSalir.style.display = 'block';
        btnConfig.style.display = 'block';
        movimientosDisplay.style.display = 'block';

        iniciarJuego(tiempoElegido);
    });

    // CONFIGURACIÓN DEL TEMA DE FICHA
    opcionesFicha.forEach(opcion => {
        opcion.addEventListener('click', (e) => {
            opcionesFicha.forEach(o => o.classList.remove('activo'));
            e.currentTarget.classList.add('activo');
            const nuevoTema = e.currentTarget.dataset.value;
            tablero.setTheme(nuevoTema);
        });
    });

    // --- 4. FUNCIONES DEL JUEGO ---
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    function iniciarJuego(tiempoElegido) {
        console.log("Reiniciando/Empezando juego...");
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        movimientos = 0;
        tablero.initPieces(true);
        tablero.draw();
        actualizarMovimientos();
        iniciarTimer(tiempoElegido);
    }

    // --- 5. LÓGICA DE DRAG AND DROP ---

    /** Convierte coordenadas de la ventana a coordenadas relativas al canvas. */
    function getMousePos(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    // 🖱️ MOUSE DOWN: Intentar seleccionar una ficha para arrastrar
    canvas.addEventListener('mousedown', (e) => {
        const { x, y } = getMousePos(e);
        const cell = tablero.cellAt(x, y);

        if (cell && cell.ficha) {
            lastClickedFicha = cell.ficha;
            dragStartCell = cell;
            isMouseDown = true;
            lastClickedFicha.isDragging = true;
            
            // Calcula el offset inicial del ratón respecto al centro de la ficha
            dragOffsetX = x - lastClickedFicha.celda.x;
            dragOffsetY = y - lastClickedFicha.celda.y;

            // Dibuja de nuevo para poner la ficha arrastrada en la capa superior
            tablero.draw(); 
        }
    });

    // 🚚 MOUSE MOVE: Actualizar posición de la ficha arrastrada
    canvas.addEventListener('mousemove', (e) => {
        if (!isMouseDown || !lastClickedFicha) return;

        const { x, y } = getMousePos(e);
        
        // Calcular el desplazamiento de la ficha basado en el movimiento del ratón
        // y el offset inicial guardado.
        lastClickedFicha.offsetX = x - lastClickedFicha.celda.x - dragOffsetX;
        lastClickedFicha.offsetY = y - lastClickedFicha.celda.y - dragOffsetY;

        tablero.draw();
    });

    // 👆 MOUSE UP: Intentar realizar el movimiento y soltar la ficha
    canvas.addEventListener('mouseup', (e) => {
        if (!isMouseDown || !lastClickedFicha) return;

        isMouseDown = false;
        lastClickedFicha.isDragging = false;
        lastClickedFicha.offsetX = 0;
        lastClickedFicha.offsetY = 0;

        const { x, y } = getMousePos(e);
        const targetCell = tablero.cellAt(x, y);

        // 1. Intentar el movimiento
        if (targetCell) {
            const success = tablero.performMove(dragStartCell, targetCell);
            if (success) {
                incrementarMovimientos();
            }
        }
        
        // 2. Limpiar el estado de arrastre
        lastClickedFicha = null;
        dragStartCell = null;
        dragOffsetX = 0;
        dragOffsetY = 0;

        // 3. Redibujar (la ficha vuelve a su posición o a la nueva celda)
        tablero.draw();

        // Opcional: Revisar si el juego terminó
        if (tablero.fichas.length === 1 && !tablero.hasAnyMoves()) {
            alert(`🎉 ¡Ganaste! ¡Solo queda 1 ficha! Movimientos: ${movimientos}`);
            // Podrías reiniciar el juego aquí
            iniciarJuego(tiempoLimiteSelect.value);
        } else if (tablero.fichas.length > 1 && !tablero.hasAnyMoves()) {
            alert(`😩 ¡Juego terminado! Quedaron ${tablero.fichas.length} fichas. Inténtalo de nuevo.`);
            // Podrías reiniciar el juego aquí
            iniciarJuego(tiempoLimiteSelect.value);
        }
    });

    // --- 6. TIMER Y MOVIMIENTOS ---
    function iniciarTimer(tiempoElegido) {
        if (timerInterval) clearInterval(timerInterval);
        remainingSeconds = tiempoElegido === "10m" ? 10 * 60 : 5 * 60;
        actualizarDisplayTimer();

        timerInterval = setInterval(() => {
            remainingSeconds--;
            actualizarDisplayTimer();

            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                finDelJuego();
            }
        }, 1000);
    }

    function actualizarDisplayTimer() {
        const min = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
        const sec = String(remainingSeconds % 60).padStart(2, '0');
        timer.textContent = `${min}:${sec}`;
    }

    function finDelJuego() {
        console.log("⏰ ¡Tiempo agotado!");
        alert("¡Se acabó el tiempo!");
        iniciarJuego(tiempoLimiteSelect.value);
    }

    function incrementarMovimientos() {
        movimientos++;
        actualizarMovimientos();
    }

    function actualizarMovimientos() {
        movimientosDisplay.textContent = `Movimientos: ${movimientos}`;
    }

    // --- 7. BOTONES DURANTE EL JUEGO ---
    btnConfig.addEventListener('click', () => {
        menuConfig.style.display = 'flex';
        canvas.style.display = 'none';
        timer.style.display = 'none';
        btnSalir.style.display = 'none';
        btnConfig.style.display = 'none';
        movimientosDisplay.style.display = 'none';
        if (timerInterval) clearInterval(timerInterval);
    });

    btnSalir.addEventListener('click', () => {
        console.log("Reiniciando juego sin salir...");
        iniciarJuego(tiempoLimiteSelect.value);
    });

});