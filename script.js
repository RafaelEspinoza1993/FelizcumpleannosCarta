// =================================================================================================
// CONFIGURACIÓN GENERAL DE LA INVITACIÓN
// Modifica los valores en esta sección para personalizar la invitación.
// =================================================================================================
const config = {
    // Detalles del evento
    evento: {
        nombre: "el Cumpleaños de Miranda",
        fecha: "15 de Diciembre, 2024",
        hora: "19:00 hrs",
        lugar: "Calle Principal #123",
        contacto: "555-0123"
    },

    // Elementos de diseño y tema
    tema: {
        // Imagen principal de la invitación que se muestra al abrir el sobre.
        // Reemplaza 'img/INVITACION-MIRANDA.png' por la ruta a tu imagen.
        imagenPrincipal: 'img/INVITACION-MIRANDA.png',

        // Elementos para el fondo animado. Puedes agregar más elementos.
        // Tipos de elementos disponibles: 'lampara', 'mickey', 'globo'
        elementosDeFondo: [
            { tipo: 'lampara', cantidad: 5 },
            { tipo: 'mickey', cantidad: 5 },
            { tipo: 'globo', cantidad: 10 }
        ],

        // Configuración de la explosión de confeti al abrir la carta.
        explosion: {
            // Colores del confeti. Agrega o cambia colores aquí.
            colores: ['#FFD700', '#FF69B4', '#00CFFF', '#FF6347', '#32CD32', '#FFF', '#FF0'],

            // Define una imagen para usar como partícula en la explosión.
            // Puede ser un SVG o una ruta a una imagen.
            imagenParticula: `
                <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="60" r="30" fill="black"/>
                  <circle cx="25" cy="30" r="18" fill="black"/>
                  <circle cx="75" cy="30" r="18" fill="black"/>
                </svg>
            `,
            // Probabilidad de que aparezca la imagen como partícula (0.0 a 1.0)
            probabilidadImagen: 0.3
        }
    },

    // Configuración de audio
    audio: {
        // Ruta al archivo de audio que se reproduce al abrir la invitación.
        src: 'https://assets.mixkit.co/sfx/preview/mixkit-magical-coin-win-1936.mp3',
        volume: 0.5
    }
};

// =================================================================================================
// FIN DE LA CONFIGURACIÓN
// No es necesario modificar el código debajo de esta línea.
// =================================================================================================

// Configuración de Paper.js para el fondo de partículas
paper.install(window);
window.onload = function() {
    paper.setup('particles');
    
    // Crear partículas
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = new Path.Circle({
            center: new Point(
                Math.random() * paper.view.size.width,
                Math.random() * paper.view.size.height
            ),
            radius: Math.random() * 3 + 1,
            fillColor: new Color(1, 1, 1, Math.random() * 0.5)
        });
        particles.push({
            path: particle,
            speed: Math.random() * 2 + 1,
            direction: Math.random() * 360
        });
    }
    
    // Animación de partículas
    paper.view.onFrame = function() {
        particles.forEach(particle => {
            particle.path.position.x += Math.cos(particle.direction) * particle.speed;
            particle.path.position.y += Math.sin(particle.direction) * particle.speed;
            
            // Rebotar en los bordes
            if (particle.path.position.x < 0) particle.path.position.x = paper.view.size.width;
            if (particle.path.position.x > paper.view.size.width) particle.path.position.x = 0;
            if (particle.path.position.y < 0) particle.path.position.y = paper.view.size.height;
            if (particle.path.position.y > paper.view.size.height) particle.path.position.y = 0;
        });
    };

    alimentarBackground();
};

// Configuración de sonido
const sound = new Howl({
    src: [config.audio.src],
    volume: config.audio.volume
});

// Animación de la carta
const envelope = document.querySelector('.envelope');
const letter = document.querySelector('.letter');
const lockContainer = document.querySelector('.lock-container');
let isOpen = false;

// Explosión de partículas
const explosionCanvas = document.getElementById('explosion-canvas');
const ctx = explosionCanvas.getContext('2d');
let particles = [];

// Imagen de partícula para la explosión
const particleImg = new window.Image();
if (config.tema.explosion.imagenParticula.trim().startsWith('<svg')) {
    const svg64 = btoa(config.tema.explosion.imagenParticula);
    particleImg.src = 'data:image/svg+xml;base64,' + svg64;
} else {
    particleImg.src = config.tema.explosion.imagenParticula;
}

function resizeExplosionCanvas() {
    explosionCanvas.width = explosionCanvas.offsetWidth;
    explosionCanvas.height = explosionCanvas.offsetHeight;
}
window.addEventListener('resize', resizeExplosionCanvas);
resizeExplosionCanvas();

function createExplosion() {
    particles = [];
    const colors = config.tema.explosion.colores;
    const centerX = explosionCanvas.width / 2;
    const centerY = explosionCanvas.height / 2;
    for (let i = 0; i < 40; i++) {
        const angle = (Math.PI * 2) * (i / 40);
        const speed = Math.random() * 6 + 10;
        const useImage = Math.random() < config.tema.explosion.probabilidadImagen;
        particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            useImage: useImage
        });
    }
}

function animateExplosion() {
    ctx.clearRect(0, 0, explosionCanvas.width, explosionCanvas.height);
    let active = false;
    for (const p of particles) {
        if (p.alpha > 0.05) {
            active = true;
            ctx.globalAlpha = p.alpha;
            if (p.useImage && particleImg.complete) {
                ctx.drawImage(particleImg, p.x - 20, p.y - 20, 40, 40);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.alpha *= 0.96;
        }
    }
    ctx.globalAlpha = 1;
    if (active) {
        requestAnimationFrame(animateExplosion);
    }
}

envelope.addEventListener('click', () => {
    if (!envelope.classList.contains('open')) {
        // Animar la llave
        if (lockContainer) {
            lockContainer.classList.add('animate-key');
            setTimeout(() => {
                envelope.classList.add('open');
                lockContainer.classList.remove('animate-key');
                if (typeof sound !== 'undefined') sound.play();
                if (typeof createExplosion === 'function') createExplosion();
                if (typeof animateExplosion === 'function') animateExplosion();
            }, 700); // igual que el transition de la llave
        } else {
            envelope.classList.add('open');
            if (typeof sound !== 'undefined') sound.play();
            if (typeof createExplosion === 'function') createExplosion();
            if (typeof animateExplosion === 'function') animateExplosion();
        }
    } else {
        envelope.classList.remove('open');
    }
});

// Personalización de la invitación
function personalizarInvitacion() {
    document.getElementById('event-name').textContent = config.evento.nombre;
    document.getElementById('event-date').textContent = config.evento.fecha;
    document.getElementById('event-time').textContent = config.evento.hora;
    document.getElementById('event-location').textContent = config.evento.lugar;
    document.getElementById('event-contact').textContent = config.evento.contacto;

    const letter = document.querySelector('.letter');
    if (letter) {
        letter.style.setProperty('--invitation-image', `url('${config.tema.imagenPrincipal}')`);
    }
}

// Animación inicial
gsap.from('.envelope', {
    duration: 3.5,
    y: 100,
    opacity: 0,
    ease: 'elastic.out(1, 0.5)'
});

// Generador de elementos de fondo
function alimentarBackground() {
    const background = document.querySelector('.background-balloons');
    if (!background) return;

    let elements = [];
    config.tema.elementosDeFondo.forEach(item => {
        for (let i = 0; i < item.cantidad; i++) {
            elements.push(item.tipo);
        }
    });

    // Mezclar elementos para aleatoriedad
    elements.sort(() => 0.5 - Math.random());

    let html = '';
    elements.forEach(tipo => {
        html += obtenerHtmlElemento(tipo);
    });

    background.innerHTML = html;
}

function obtenerHtmlElemento(tipo) {
    switch (tipo) {
        case 'lampara':
            return `
                <div class="lamparaIcon">
                    <div class="star"></div><div class="star"></div><div class="star"></div><div class="star"></div>
                    <div class="container">
                        <div class="lamp-container">
                            <div class="magical-glow"></div>
                            <img src="lampara_-_transp.png" alt="Lámpara mágica" class="lampara-img">
                            <div class="smoke"><div class="smoke-trail"></div><div class="smoke-trail"></div><div class="smoke-trail"></div><div class="smoke-trail"></div></div>
                            <div class="magic-particles"><div class="particle"></div><div class="particle"></div><div class="particle"></div><div class="particle"></div><div class="particle"></div><div class="particle"></div></div>
                        </div>
                    </div>
                </div>`;
        case 'mickey':
            return `
                <div class="mickey">
                    <div class="ear-left"></div>
                    <div class="ear-right"></div>
                </div>`;
        case 'globo':
            const color = '#' + Math.floor(Math.random()*16777215).toString(16);
            return `<div class="balloon" style="background-color: ${color};"></div>`;
        default:
            return '<div></div>';
    }
}

// Llamadas iniciales
personalizarInvitacion();