let startTime;
let timerInterval;

// Declarar variables globales para que sean accesibles en todo el script
let timerDisplay;
let btnIniciar;
let menuConfig;
let playButton;

// Función para formatear segundos a MM:SS
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const displayMinutes = String(minutes).padStart(2, '0');
    const displaySeconds = String(seconds).padStart(2, '0');
    
    return `${displayMinutes}:${displaySeconds}`;
}

// Función principal para iniciar el temporizador
function startTimer() {
    // Esconde el menú y el botón de play, muestra el canvas y el timer
    if (menuConfig) menuConfig.style.display = 'none';
    if (playButton) playButton.style.display = 'none'; 
    if (timerDisplay) {
        timerDisplay.style.display = 'block'; // ESTO HACE QUE EL TIMER SEA VISIBLE
        timerDisplay.classList.add('running'); // Para el efecto de pulso CSS
    }

    // Inicializa el tiempo
    startTime = Date.now();
    
    // Función que se ejecuta cada segundo
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const totalSeconds = Math.floor(elapsedTime / 1000);
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(totalSeconds);
        }
    }, 1000);
}

// Función para detener y resetear el temporizador
function stopTimer() {
    clearInterval(timerInterval);
    if (timerDisplay) {
        timerDisplay.classList.remove('running');
    }
}

// ------------------------------------------------------------------
// NUEVO: Ejecuta todo el código DOM-dependiente solo cuando el HTML está listo
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Buscar elementos DENTRO del listener para asegurar que existan
    timerDisplay = document.getElementById('timer');
    btnIniciar = document.getElementById('btnIniciar');
    menuConfig = document.getElementById('menu-config');
    playButton = document.querySelector('.play');

    // VERIFICACIÓN DE CARGA: Si ves este mensaje en la Consola del navegador (F12), 
    // significa que el script se cargó correctamente.
    console.log("Script 'Logica del Temporizador' cargado y elementos buscados.");
    
    if (!timerDisplay) console.error("Error: No se encontró el elemento #timer.");
    if (!btnIniciar) console.error("Error: No se encontró el botón #btnIniciar.");

    // Inicializa el display a 00:00 al cargar (solo si el elemento existe)
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(0);
    }

    // Evento para iniciar el juego/timer (solo si el botón existe)
    if (btnIniciar) {
        btnIniciar.addEventListener('click', () => {
            // Si el temporizador ya está corriendo, lo detenemos y reiniciamos (depende de tu lógica de juego)
            if (timerInterval) {
                stopTimer();
            }
            
            startTimer();
            console.log("Juego iniciado y temporizador en marcha.");
            // Aquí iría el resto de la lógica para iniciar el juego en el canvas
        });
    }
});


// EXTRAS: Si quieres detener el temporizador en algún momento (ej: al ganar)
// Ejemplo de uso:
// function gameOver() {
//     stopTimer();
//     const finalTime = timerDisplay.textContent;
//     console.log(`¡Juego terminado! Tu tiempo fue: ${finalTime}`);
//     // Mostrar pantalla de victoria/derrota
// }
