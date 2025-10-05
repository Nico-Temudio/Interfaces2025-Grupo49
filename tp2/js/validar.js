document.addEventListener("DOMContentLoaded", function() {

"use strict"
let btn = document.querySelector("#enviar")
btn.addEventListener("click", activado);
function activado(e){
    e.preventDefault()   
    btn.classList.toggle("is_active")

}
let a=document.getElementById('enviar');
a.addEventListener('click',function (event)  {
  event.preventDefault(); 
  setTimeout(()=> location="index.html",900);
});
});