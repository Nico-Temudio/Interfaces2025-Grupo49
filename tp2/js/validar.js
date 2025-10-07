document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const btn = document.querySelector("#enviar");

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    btn.classList.toggle("is_active");
    
    // Redirige después de 900 ms
    setTimeout(() => {
      location.href = "index.html";
    }, 900);
  });
});