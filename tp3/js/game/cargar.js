document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const bar = document.querySelector(".progress-bar");
    const percent = document.querySelector("#porcentaje1");
    const contenedor_loader = document.querySelector("#contenedor-load");

    let counter = 0;
    const speed = 40; // cada 40ms → 100 * 40 = 4000ms (4 segundos)

    const interval = setInterval(() => {
        counter++;

        // Actualizar barra y texto
        if (bar) bar.style.width = counter + "%";
        if (percent) percent.textContent = counter + "%";

        // Cuando llega a 100, detener y ocultar
        if (counter >= 100) {
            clearInterval(interval);

            // Desvanecer suavemente
            if (contenedor_loader) {
                // contenedor_loader.style.transition = "opacity 5s ease";
                // contenedor_loader.style.opacity = "0";
                setTimeout(() => {
                    contenedor_loader.style.display = "none";
                }, 1000);
            }
        }
    }, speed);
});