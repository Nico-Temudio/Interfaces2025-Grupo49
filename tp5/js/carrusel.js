document.addEventListener("DOMContentLoaded", function() {
    "use strict";

    // Selecciona todos los botones y contenedores
    let buttonsRight = document.querySelectorAll('#slideRight');
    let buttonsLeft = document.querySelectorAll('#slideLeft');
    let containers = document.querySelectorAll('#container');

   // Tiempo estimado de la animación (ms). Se usa para quitar la clase is-scrolling luego.
    const ANIM_MS = 700;

    // Función auxiliar para desplazar de forma suave y marcar estado de scroll
    function smoothScrollContainer(container, delta) {
        if (!container) return;
        // Añadir clase que activa estilos de animación
        container.classList.add('is-scrolling');
        // Realiza el desplazamiento suave
        container.scrollBy({ left: delta, behavior: 'smooth' });
        // Quitar la clase después de un timeout basado en ANIM_MS
        // También escuchamos el evento scroll para manejar interacción manual
        clearTimeout(container._scrollTimeout);
        container._scrollTimeout = setTimeout(() => {
            container.classList.remove('is-scrolling');
        }, ANIM_MS + 50);
    }

    // Asume que cada par de botones controla el siguiente container
    buttonsRight.forEach((btn, i) => {
        btn.onclick = function () {
            // mueve hacia la derecha 1200px suavemente
            smoothScrollContainer(containers[i], 900);
        };
    });

    buttonsLeft.forEach((btn, i) => {
        btn.onclick = function () {
            // mueve hacia la izquierda 1200px suavemente
            smoothScrollContainer(containers[i], -900);
        };
    });

    

   fetch('https://vj.interfaces.jima.com.ar/api/v2')
    .then(response => response.json())
    .then(games => {
        // Carruseles principales
        const containers = document.querySelectorAll('#container');
        containers.forEach((container, i) => {
            container.innerHTML = '';
            const start = i * 12;
            const end = start + 12;
            games.slice(start, end).forEach(game => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_88_548)">
                        <path d="M22.5117 7.32913C22.5117 14.8873 12 22.5368 12 22.5368C12 22.5368 1.48828 14.8873 1.48828 7.32913C1.48828 3.04429 4.79906 1.46366 6.54 1.46366C10.1798 1.46366 12 4.54429 12 4.54429C12 4.54429 13.8202 1.4632 17.46 1.4632C19.2009 1.46366 22.5117 3.04382 22.5117 7.32913Z" fill="white" fill-opacity="0.4" stroke="#0A0717"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_88_548">
                        <rect width="24" height="24" fill="white"/>
                        </clipPath>
                        </defs>
                    </svg>
                    <img src="${game.background_image_low_res}" alt="${game.name}">
                    <div class="overlay">
                        <div class="info">
                            <div class="texto"><p>${game.name}</p></div>
                        </div>
                        <button class="btn-play">Jugar Ahora</button>
                    </div>
                `;
                container.appendChild(card);
            });
        });

        // Carrusel destacado
        document.querySelectorAll('.card svg').forEach(svg => {
            svg.addEventListener('click', function() {
            this.classList.toggle('active');
                });
    });
    })
    .catch(error => {
        console.error('Error al obtener los juegos:', error);
    });

    

    const listas = document.querySelectorAll('.footer-li');

    // Asumimos 2 columnas → cada fila tiene 2 <ul>
    const filas = [
        [listas[0], listas[1]], // Fila 1
        [listas[2], listas[3]]  // Fila 2
    ];

    filas.forEach((fila) => {
        fila.forEach((ul) => {
        const titulo = ul.querySelector('h3');
        titulo.addEventListener('click', () => {
            // Oculta todas las filas
            filas.forEach((f) => f.forEach((item) => item.classList.remove('active')));

            // Activa la fila clickeada
            fila.forEach((item) => item.classList.add('active'));
        });
        });
    });


/* =========================================
       LOGICA DEL CARRUSEL 3D (CORREGIDA)
       ========================================= */
    
    const items = document.querySelectorAll('.c3d-item');
    const dots = document.querySelectorAll('.dot');
    
    // Solo ejecutamos si existen los elementos para evitar errores en otras páginas
    if(items.length > 0 && dots.length > 0) {
        
        let currentIndex = 0;
        let autoSlideInterval;

        // Función principal que asigna las clases CSS
        function updateCarousel() {
            items.forEach((item, index) => {
                // Limpiar clases anteriores
                item.classList.remove('active', 'prev', 'next', 'hidden');

                // Lógica circular para determinar posición
                if (index === currentIndex) {
                    item.classList.add('active');
                } else if (index === (currentIndex + 1) % 4) {
                    item.classList.add('next');
                } else if (index === (currentIndex + 3) % 4) { // (currentIndex - 1) circular
                    item.classList.add('prev');
                } else {
                    item.classList.add('hidden');
                }
            });

            // Actualizar puntos (Dots)
            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Función para avanzar
        function nextSlide() {
            currentIndex = (currentIndex + 1) % 4; 
            updateCarousel();
        }

        // Función para ir a una slide específica
        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
            resetTimer();
        }

        // Temporizador automático
        function startTimer() {
            autoSlideInterval = setInterval(nextSlide, 3000); 
        }

        function resetTimer() {
            clearInterval(autoSlideInterval);
            startTimer();
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        // 1. Eventos para los Dots (Clicks)
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
            });
        });

        // 2. Eventos para las Cards (Detener al hacer click o pasar mouse)
        items.forEach((item) => {
            item.addEventListener('click', stopAutoSlide);
            item.addEventListener('mouseenter', stopAutoSlide); // Pausa al pasar el mouse
            item.addEventListener('mouseleave', startTimer);   // Reanuda al sacar el mouse
        });

        // Iniciar el carrusel
        updateCarousel();
        startTimer();
    }

});