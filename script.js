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
};

// Configuración de sonido
const sound = new Howl({
    src: ['https://assets.mixkit.co/sfx/preview/mixkit-magical-coin-win-1936.mp3'],
    volume: 0.5
});

// Animación de la carta
const envelope = document.querySelector('.envelope');
let isOpen = false;

// Explosión de partículas
const explosionCanvas = document.getElementById('explosion-canvas');
const ctx = explosionCanvas.getContext('2d');
let particles = [];

function resizeExplosionCanvas() {
    explosionCanvas.width = explosionCanvas.offsetWidth;
    explosionCanvas.height = explosionCanvas.offsetHeight;
}
window.addEventListener('resize', resizeExplosionCanvas);
resizeExplosionCanvas();

function createExplosion() {
    particles = [];
    const colors = ['#FFD700', '#FF69B4', '#00CFFF', '#FF6347', '#32CD32', '#FFF', '#FF0'];
    const centerX = explosionCanvas.width / 2;
    const centerY = explosionCanvas.height / 2;
    for (let i = 0; i < 40; i++) {
        const angle = (Math.PI * 2) * (i / 40);
        const speed = Math.random() * 6 + 4;
        particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1
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
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
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
    if (!isOpen) {
        sound.play();
        envelope.classList.add('open');
        createExplosion();
        animateExplosion();
    } else {
        envelope.classList.remove('open');
    }
    isOpen = !isOpen;
});

// Personalización de la invitación
document.getElementById('fecha').textContent = '15 de Diciembre, 2024';
document.getElementById('hora').textContent = '19:00 hrs';
document.getElementById('lugar').textContent = 'Calle Principal #123';
document.getElementById('contacto').textContent = '555-0123';

// Animación inicial
gsap.from('.envelope', {
    duration: 1.5,
    y: 100,
    opacity: 0,
    ease: 'elastic.out(1, 0.5)'
}); 