document.addEventListener("DOMContentLoaded", function() {
    "use strict"
    
    
    let percent = document.querySelector("#porcentaje");
    let counter =0;
    setInterval(()=>{
        if(counter == 100){
            clearInterval;
        }else{
            counter +=1;
            percent.innerHTML=`${counter}` + '%'
        }
    
    },40);
    
    window.addEventListener('load', ()=>{
        
        const contenedor_loader = document.querySelector("#contenedor-loader");
        contenedor_loader.style.visibility="hidden";
        
    })
    });