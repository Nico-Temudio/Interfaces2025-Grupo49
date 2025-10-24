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
    const movimientosDisplay = document.getElementById('movimientos'); // ✅ contador de movimientos
    
    // 👇 NUEVO: Opciones de tipo de ficha
    const opcionesFicha = document.querySelectorAll('.ficha-opcion'); 

    // 👇 MODIFICACIÓN: Obtener el tema inicial de la ficha activa (asumiendo que una tiene la clase 'activo')
    const temaInicial = document.querySelector('.ficha-opcion.activo')?.dataset.value || 'classic';

    let ctx = canvas.getContext('2d');
    // 👇 MODIFICACIÓN: Pasar el tema inicial al constructor de Tablero
    const tablero = new Tablero(ctx, canvas.width, canvas.height, temaInicial);
    
    let timerInterval = null;
    let remainingSeconds = 0;
    let movimientos = 0; // contador de movimientos

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
        const tipoFicha = document.getElementById('tipoFicha')?.value; // Este ID parece no usarse con el nuevo HTML
        const dificultad = document.getElementById('dificultad').value;
        const tiempoElegido = tiempoLimiteSelect.value;

        // El tema ya está actualizado en tablero.theme gracias al evento de clic abajo

        console.log("Iniciando juego con:", { temaActual: tablero.theme, dificultad, tiempoElegido });

        menuConfig.style.display = 'none';
        canvas.style.display = 'block';
        timer.style.display = 'block';
        btnSalir.style.display = 'block';
        btnConfig.style.display = 'block';
        movimientosDisplay.style.display = 'block';

        iniciarJuego(tiempoElegido);
    });

    // 👇 NUEVO: CONFIGURACIÓN DEL TEMA DE FICHA
    opcionesFicha.forEach(opcion => {
        opcion.addEventListener('click', (e) => {
            // 1. Quitar 'activo' de todos
            opcionesFicha.forEach(o => o.classList.remove('activo'));
            
            // 2. Añadir 'activo' al elemento clickeado
            e.currentTarget.classList.add('activo');

            // 3. Cambiar el tema del tablero
            const nuevoTema = e.currentTarget.dataset.value;
            tablero.setTheme(nuevoTema);

            // 4. Actualizar la vista previa (si es visible)
            if (preview.style.display === 'block') {
                 // Asumiendo que la imagen de preview se actualiza con el tema
                 // Esto dependerá de cómo gestiones las rutas en tu HTML/CSS
                 // Por simplicidad, podríamos forzar una actualización si la ruta
                 // de la imagen de preview sigue algún patrón.
                 // Si no, este paso es meramente visual y depende de tu CSS/HTML.
                 // Por ahora, solo actualizamos el tablero (si estuviera visible)
            }
        });
    });

    // --- 4. FUNCIONES DEL JUEGO ---
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    function iniciarJuego(tiempoElegido) {
        console.log("Reiniciando/Empezando juego...");
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        movimientos = 0;
        tablero.initPieces(true); // Esto asegura que las fichas se inicialicen con el tema actual
        tablero.draw();
        actualizarMovimientos();
        iniciarTimer(tiempoElegido);
    }

    // --- 5. TIMER CON LÍMITE ---
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

    // --- 6. CONTADOR DE MOVIMIENTOS ---
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