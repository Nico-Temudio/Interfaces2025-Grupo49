document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtención de Elementos del DOM
    const playBtn = document.querySelector('.play');
    const menuConfig = document.getElementById('menu-config');
    const canvas = document.getElementById('canvas');
    const preview = document.querySelector('.solitario-container img');
    const btnIniciar = document.getElementById('btnIniciar');
    const timer = document.getElementById('timer'); // Añadido
    const bntConfig = document.getElementById('config-game'); // Añadido
    const btnSalir = document.getElementById('exit-game'); // Añadido

    let ctx = canvas.getContext('2d');

    // --- FUNCIONES DE TRANSICIÓN ---

    // 1. Mostrar menú de configuración al apretar Play
    playBtn.addEventListener('click', () => {
        playBtn.style.display = 'none';
        preview.style.display = 'none';
        menuConfig.style.display = 'flex'; // Usamos 'flex' para centrar el menú
    });

    // 2. Iniciar juego con configuración (Oculta menú -> Muestra juego)
    btnIniciar.addEventListener('click', () => {
        const tipoFicha = document.getElementById('tipoFicha').value;
        const dificultad = document.getElementById('dificultad').value;

        console.log("Iniciando con:", { tipoFicha, dificultad });

        // OCULTAR MENÚ
        menuConfig.style.display = 'none';

        // MOSTRAR JUEGO
        canvas.style.display = 'block';
        timer.style.display = 'block'; // Muestra el temporizador
        btnSalir.style.display = 'block'; // Muestra el botón de salir

        // Aquí puedes inicializar tu juego
        // initJuego(tipoFicha, colorFicha, dificultad);
    });

    // 3. Volver al menú (desde el botón de Salir)
    btnSalir.addEventListener('click', () => {
        // OCULTAR JUEGO
        canvas.style.display = 'none';
        timer.style.display = 'none'; // Oculta el temporizador
        btnSalir.style.display = 'none'; // Oculta el botón de salir

        // MOSTRAR MENÚ INICIAL
        playBtn.style.display = 'block';
        preview.style.display = 'block';
        // NOTA: El menú de configuración NO se muestra, solo la imagen previa y Play
        
        console.log("Volviendo al menú inicial.");
    });


let canvasWidth = canvas.width;
let canvasHeight = canvas.height;

let figures = [];
let lastClickedFigure = null;
let isMouseDown = false;



function addFichas(){
    let imgSrc = 'img/ficha.png';
    console.log("Cargando imagen de ficha desde:");
    for(let i=0; i<33; i++){
        let posX = Math.random() * (canvasWidth - 40) + 20;
        let posY = Math.random() * (canvasHeight - 40) + 20;
        let ficha = new Ficha(posX, posY,'red', ctx,25, imgSrc);
        figures.push(ficha);
    }
    drawFigures();

}
addFichas();
function drawFigures(){
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); 
    for(let figura of figures){
        figura.draw();
    }
}
});
