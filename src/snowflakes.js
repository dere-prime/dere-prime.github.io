const snowContainer = document.getElementById('snow-container');
const numberOfSnowflakes = 25; // Cambia a la cantidad que desees

for (let i = 0; i < numberOfSnowflakes; i++) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.innerText = '❄'; // Puedes usar un carácter de copo de nieve

    // Posición inicial
    snowflake.style.left = Math.random() * window.innerWidth + 'px';
    snowflake.style.fontSize = Math.random() * 10 + 10 + 'px'; // Tamaño aleatorio

    // Duración aleatoria de la animación
    const duration = Math.random() * 5 + 5; // Duración entre 5 y 10 segundos
    snowflake.style.animationDuration = `${duration}s`; // Asigna la duración

    snowContainer.appendChild(snowflake);
}