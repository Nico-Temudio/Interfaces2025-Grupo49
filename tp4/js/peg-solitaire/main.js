document.addEventListener('DOMContentLoaded', () => {

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
    const solitarioContainer = document.querySelector('.solitario-container');

    // Elementos del mensaje final (creados dinámicamente)
    const mensajeOverlay = crearMensajeOverlay(solitarioContainer); 
    const mensajeTexto = document.getElementById('mensaje-texto');
    const mensajeSubTexto = document.getElementById('mensaje-subtexto');
    const mensajeBoton = document.getElementById('mensaje-btn');
    
    // Array de mensajes para el estado final 
    const mensajesJuego = {
        GANADO: {
            titulo: '🎉 ¡VICTORIA! 🎉',
            clase: 'mensaje-ganado'
        },
        PERDIDO: {
            titulo: '😩 ¡JUEGO TERMINADO, NO PUDISTE COMPLETARLO! 😩',
            clase: 'mensaje-perdido'
        },
        TIEMPO_AGOTADO: {
            titulo: '⏰ ¡TIEMPO AGOTADO! ⏰',
            clase: 'mensaje-tiempo'
        }
    };

    const opcionesFicha = document.querySelectorAll('.ficha-opcion'); 

    // Asumiendo que Tablero está definido
    let ctx = canvas.getContext('2d');
    const temaInicial = document.querySelector('.ficha-opcion.activo')?.dataset.value;
    const tablero = new Tablero(ctx, canvas.width, canvas.height, temaInicial);
    
    let timerInterval = null;
    let remainingSeconds = 0;
    let movimientos = 0; 
    let lastClickedFicha = null;
    let isMouseDown = false;
    let dragStartCell = null;
    let dragOffsetX = 0; 
    let dragOffsetY = 0; 
    let validTargetsDuringDrag = []; 

    let animStart = performance.now();
    function loop(ts){
        const elapsed = ts - animStart;
        
        ctx.clearRect(0,0,canvas.width,canvas.height);
        tablero.draw();

        if(validTargetsDuringDrag.length > 0){
            drawHints(ctx, validTargetsDuringDrag, (elapsed/1000));
        }

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop); 

    // Función principal del bucle de animación para dibujar el estado del juego
    function drawHints(ctx, cells, t){
        for(const cell of cells){
            if(cell.valid){
                const cx = cell.x; 
                const cy = cell.y - 30 ; 
                ctx.save();
                const pulse = Math.sin(t*6 + (cell.r+cell.c)) * 6;
                ctx.globalAlpha = 0.9 - (Math.abs(Math.sin(t*3))/2);
                ctx.beginPath();
                ctx.moveTo(cx, cy + 18 - pulse); 
                ctx.lineTo(cx - 14, cy - 6 - pulse); 
                ctx.lineTo(cx + 14, cy - 6 - pulse); 
                ctx.closePath();
                
                const theme = tablero.theme; 
                if(theme === 'ficha1') ctx.fillStyle = 'rgba(230, 43, 36, 1)'; 
                else if(theme === 'ficha2') ctx.fillStyle = 'rgba(76, 224, 76, 1)'; 
                else if(theme === 'ficha3') ctx.fillStyle = 'rgba(0, 0, 200, 1)'; 
                else if(theme === 'ficha4') ctx.fillStyle = 'rgba(221, 231, 73, 1)'; 
                else ctx.fillStyle = 'rgba(255,240,120, 0.7)'; 
                ctx.fill();

                ctx.beginPath();
                ctx.arc(cx, cell.y, cell.size / 2.5 + Math.abs(Math.sin(t*4))*3, 0, Math.PI*2);
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 4;
                ctx.stroke();

                ctx.restore();
            }
        }
    }

    // Calcula y retorna un array de celdas a las que la ficha puede moverse
    function getValidTargets(fromCelda) {
    // prevalida la existencia de la celda y la ficha
        const targets = [];
        if (!fromCelda || !fromCelda.ficha) 
            return targets;
        const deltas = [[2,0],[-2,0],[0,2],[0,-2]]; // matriz de definicion
        // busqueda y validacion de limites del tablero
        for (const d of deltas) {
            const nr = fromCelda.r + d[0];
            const nc = fromCelda.c + d[1];
            if (nr >= 0 && nr < tablero.ROWS && nc >= 0 && nc < tablero.COLS) {
                const target = tablero.celdas[nr][nc];
                if (tablero.isValidMove(fromCelda, target)) {
                    targets.push(target);
                }
            }
        }
        return targets;
    }
    
    //ESTADO INICIAL
    const inicializarEstado = () => {
        // Mostrar elementos de la vista de inicio
        playBtn.style.display = 'block';
        preview.style.display = 'block';

        // Ocultar todos los demás elementos
        menuConfig.style.display = 'none';
        canvas.style.display = 'none';
        timer.style.display = 'none';
        btnSalir.style.display = 'none';
        btnConfig.style.display = 'none';
        movimientosDisplay.style.display = 'none'; 
        movimientosDisplay.textContent = 'Movimientos: 0';
        mensajeOverlay.style.display = 'none';
    };

    inicializarEstado();

    // EVENTOS DE TRANSICIÓN ---
    playBtn.addEventListener('click', () => {
        // Transición de inicio
        playBtn.style.display = 'none';
        preview.style.display = 'none';
        menuConfig.style.display = 'flex';
    });

    btnIniciar.addEventListener('click', () => {
        // Transición de configuración
        const boardType = document.getElementById('dificultad').value;
        const tiempoElegido = tiempoLimiteSelect.value;
        menuConfig.style.display = 'none';
        
        // Mostrar elementos de la interfaz de juego
        canvas.style.display = 'block';
        timer.style.display = 'block';
        btnSalir.style.display = 'block';
        btnConfig.style.display = 'block';
        movimientosDisplay.style.display = 'block';

        iniciarJuego(tiempoElegido, boardType);
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

    // FUNCIONES DE VISTA Y JUEGO
    
    function iniciarJuego(tiempoElegido, boardType) {
        mensajeOverlay.style.display = 'none';
        movimientos = 0;
        tablero.setBoardType(boardType);
        tablero.initPieces(true); // Reinicia el tablero
        actualizarMovimientos();
        iniciarTimer(tiempoElegido);
        
        // Asegura que los elementos del juego estén visibles
        canvas.style.display = 'block';
        timer.style.display = 'block';
        btnSalir.style.display = 'block';
        btnConfig.style.display = 'block';
        movimientosDisplay.style.display = 'block';
    }
    
    // Vuelve de la pantalla de Juego/Mensaje al menu de Configuración
    function volverAConfiguracion() {
        if (timerInterval) clearInterval(timerInterval);
        inicializarEstado();
        playBtn.style.display = 'none';
        preview.style.display = 'none';
        menuConfig.style.display = 'flex'; 
    }
    
    // Vuelve de cualquier pantalla al menu Principal (Botón Jugar visible)
    function volverAMenuPrincipal() {
        if (timerInterval) clearInterval(timerInterval);
        inicializarEstado();
    }


    // Muestra el overlay de mensaje final sobre el tablero
    function mostrarMensajeFinal(estado, fichasRestantes) {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null; 
        
        const mensaje = mensajesJuego[estado];
        
        mensajeTexto.textContent = mensaje.titulo;
        mensajeOverlay.className = 'mensaje-overlay'; 
        mensajeOverlay.classList.add(mensaje.clase); 
        
        let subtexto = '';
        if (estado === 'GANADO') {
            subtexto = `¡Lo lograste en ${movimientos} movimientos!`;
            // Ajustar texto del botón
            mensajeBoton.textContent = 'Volver al menú de Configuración'; 
        } else if (estado === 'PERDIDO') {
            subtexto = `Quedaron un total de ${fichasRestantes} fichas restantes y tus movimientos fueron ${movimientos}.`;
            // Ajustar texto del botón
            mensajeBoton.textContent = 'Volver al menú de Configuración';
        } else if (estado === 'TIEMPO_AGOTADO') {
            subtexto = `Quedaron un total de ${fichasRestantes} fichas restantes y tus movimientos fueron ${movimientos}.`;
            // Ajustar texto del botón
            mensajeBoton.textContent = 'Volver al menú de Configuración';
        }
        mensajeSubTexto.textContent = subtexto;
        
        // Muestra el canvas y superpone el mensaje
        canvas.style.display = 'block';
        timer.style.display = 'none';
        btnSalir.style.display = 'none';
        btnConfig.style.display = 'none';
        movimientosDisplay.style.display = 'none';

        mensajeOverlay.style.display = 'flex';
    }
    
    // El botón del mensaje final ahora vuelve al panel de configuración
    mensajeBoton.addEventListener('click', volverAConfiguracion);

    function getMousePos(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    canvas.addEventListener('mousedown', (e) => {
        if (!timerInterval) return; 

        const { x, y } = getMousePos(e);
        const cell = tablero.cellAt(x, y);

        if (cell && cell.ficha) {
            lastClickedFicha = cell.ficha;
            dragStartCell = cell;
            isMouseDown = true;
            lastClickedFicha.isDragging = true;
            
            dragOffsetX = x - lastClickedFicha.celda.x;
            dragOffsetY = y - lastClickedFicha.celda.y;

            validTargetsDuringDrag = getValidTargets(dragStartCell);
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isMouseDown || !lastClickedFicha) return;

        const { x, y } = getMousePos(e);
        
        lastClickedFicha.offsetX = x - lastClickedFicha.celda.x - dragOffsetX;
        lastClickedFicha.offsetY = y - lastClickedFicha.celda.y - dragOffsetY;
    });

    canvas.addEventListener('mouseup', (e) => {
        if (!isMouseDown || !lastClickedFicha) return;

        isMouseDown = false;
        lastClickedFicha.isDragging = false;
        lastClickedFicha.offsetX = 0;
        lastClickedFicha.offsetY = 0;

        const { x, y } = getMousePos(e);
        const targetCell = tablero.cellAt(x, y);

        let success = false;
        if (targetCell) {
            success = tablero.performMove(dragStartCell, targetCell);
            if (success) {
                incrementarMovimientos();
            }
        }
        
        lastClickedFicha = null;
        dragStartCell = null;
        dragOffsetX = 0;
        dragOffsetY = 0;
        validTargetsDuringDrag = []; 

        if (success) {
             setTimeout(() => {  
                const fichasRestantes = tablero.fichas.length;
                const tieneMovimientos = tablero.hasAnyMoves();

                if (fichasRestantes === 1 && !tieneMovimientos) {
                    mostrarMensajeFinal('GANADO', fichasRestantes);
                } else if (fichasRestantes > 1 && !tieneMovimientos) {
                    mostrarMensajeFinal('PERDIDO', fichasRestantes);
                }
             },0 );
        }
    });

    // Inicializa y comienza la cuenta regresiva del temporizador
    function iniciarTimer(tiempoElegido) {
        if (timerInterval) clearInterval(timerInterval);
        
        remainingSeconds = tiempoElegido === "10m" ? 10 * 60 : 5 * 60; 
        
        actualizarDisplayTimer();

        timerInterval = setInterval(() => {
            remainingSeconds--;
            actualizarDisplayTimer();

            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                timerInterval = null; 
                finDelJuego();
            }
        }, 1000);
    }

    // Actualiza el elemento del DOM que muestra el tiempo restante
    function actualizarDisplayTimer() {
        const min = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
        const sec = String(remainingSeconds % 60).padStart(2, '0');
        timer.textContent = `${min}:${sec}`;
    }

    // Finaliza juego
    function finDelJuego() {
        mostrarMensajeFinal('TIEMPO_AGOTADO', tablero.fichas.length);
    }

    // Aumenta el contador de movimientos y actualiza la vista
    function incrementarMovimientos() {
        movimientos++;
        actualizarMovimientos();
    }

    // Actualiza el elemento del DOM que muestra el número de movimientos
    function actualizarMovimientos() {
        movimientosDisplay.textContent = `Movimientos: ${movimientos}`;
    }

    btnConfig.addEventListener('click', volverAConfiguracion); 

    btnSalir.addEventListener('click', () => {
        iniciarJuego(tiempoLimiteSelect.value);
    });
    
    // Crea y añade al DOM el elemento overlay para los mensajes finales
    function crearMensajeOverlay(container) {
        const overlay = document.createElement('div');
        overlay.id = 'mensaje-overlay';
        overlay.classList.add('mensaje-overlay');
        overlay.style.display = 'none'; 

        overlay.innerHTML = `
            <div class="mensaje-contenido">
                <h2 id="mensaje-texto"></h2>
                <p id="mensaje-subtexto"></p>
                <button id="mensaje-btn">Acción</button> 
            </div>
        `;

        container.appendChild(overlay); 
        return overlay;
    }

});