document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const bar = document.querySelector(".progress-bar");
    const percent = document.querySelector("#porcentaje1");
    const contenedor_loader = document.querySelector("#contenedor-load");

    // Evitar scroll mientras el loader está visible
    document.body.classList.add('loading-active');

    let counter = 0;
    const speed = 40;

    const interval = setInterval(() => {
        counter++;
        if (bar) bar.style.width = counter + "%";
        if (percent) percent.textContent = counter + "%";

        if (counter >= 100) {
            clearInterval(interval);

            // Desvanecer y ocultar
            if (contenedor_loader) {
                contenedor_loader.style.opacity = "0";
                setTimeout(() => {
                    contenedor_loader.style.display = "none";
                    // permitir scroll otra vez
                    document.body.classList.remove('loading-active');
                }, 400); // coincide con transition de CSS
            } else {
                document.body.classList.remove('loading-active');
            }
        }
    }, speed);
});