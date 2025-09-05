// --- SMOOTH SCROLL SETUP ---
const lenis = new Lenis();
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- GSAP & ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);

// --- Glitch Grid Canvas Background ---
const canvas = document.getElementById('glitch-grid-canvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
let points = [];
let mouse = { x: width / 2, y: height / 2, radius: 100 };

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.vx = 0;
        this.vy = 0;
    }
    update() {
        // Mouse repulsion
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 2;
            this.y += (dy / dist) * force * 2;
        }
        // Spring back to origin
        this.x += (this.originalX - this.x) * 0.1;
        this.y += (this.originalY - this.y) * 0.1;

        // Random glitch
        if (Math.random() < 0.005) {
            this.x += (Math.random() - 0.5) * 10;
            this.y += (Math.random() - 0.5) * 10;
        }
    }
}

function initGrid() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    points = [];
    const gridSize = 30;
    for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
            points.push(new Point(x, y));
        }
    }
}

function animateGrid() {
    ctx.clearRect(0, 0, width, height);
    points.forEach(p => {
        p.update();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const intensity = Math.max(0, 1 - dist / 200);

        if (intensity > 0.5 && Math.random() < 0.1) {
            ctx.fillStyle = `rgba(255, 0, 51, ${intensity})`; // Accent Red
        } else {
            ctx.fillStyle = `rgba(163, 163, 163, ${0.2 + intensity * 0.5})`; // Grey
        }
        ctx.fill();
    });
    requestAnimationFrame(animateGrid);
}
initGrid();
animateGrid();
window.addEventListener('resize', initGrid);
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});


// --- Custom Cursor ---
const cursor = document.querySelector('.cursor');
if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener('mousemove', e => {
        gsap.to(cursor, { duration: 0.3, x: e.clientX, y: e.clientY, ease: 'power2.out' });
    });
} else {
    cursor.style.display = 'none';
}

// --- Magnetic Elements ---
document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - rect.left - rect.width / 2) * 0.3, y: (e.clientY - rect.top - rect.height / 2) * 0.3, duration: 0.5, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
});

// --- Dot Nav Active State on Scroll ---
gsap.utils.toArray('section').forEach(section => {
    ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onToggle: self => {
            const link = document.querySelector(`.dot-link[href="#${section.id}"]`);
            if (link) {
                document.querySelectorAll('.dot-link').forEach(l => l.classList.remove('active'));
                if (self.isActive) {
                    link.classList.add('active');
                }
            }
        }
    });
});

// --- Music Galaxy: "Sonic Galaxy" ---
const galaxy = document.getElementById('music-galaxy');
const canvasContainer = document.querySelector('.galaxy-canvas');
const tooltip = document.querySelector('.song-tooltip');

async function setupGalaxy() {
    try {
        const response = await fetch('songs.json');
        if (!response.ok) { // Check if response is not ok
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const songs = await response.json();
        
        songs.forEach(song => {
            const orb = document.createElement('div');
            orb.className = 'song-orb';
            orb.style.left = `${Math.random() * 95}%`;
            orb.style.top = `${Math.random() * 95}%`;
            
            orb.addEventListener('mouseenter', (e) => {
                tooltip.querySelector('img').src = song.coverArtUrl;
                tooltip.querySelector('h3').textContent = song.title;
                gsap.to(tooltip, { opacity: 1, duration: 0.3 });
            });
            orb.addEventListener('mouseleave', () => {
                gsap.to(tooltip, { opacity: 0, duration: 0.3 });
            });
            
            canvasContainer.appendChild(orb);
        });
    } catch (error) {
        console.error("Could not load song catalogue:", error);
        // Display an error message to the user
        const errorMsg = document.createElement('p');
        errorMsg.textContent = 'Error loading music catalogue.';
        errorMsg.style.color = 'var(--color-ui-grey)';
        errorMsg.style.textAlign = 'center';
        galaxy.appendChild(errorMsg);
    }
}

if (galaxy) {
    setupGalaxy();

    // Pan & Zoom Logic
    let isDragging = false, startX, startY, startLeft, startTop;
    galaxy.addEventListener('mousedown', e => { isDragging = true; galaxy.style.cursor = 'grabbing'; startX = e.pageX; startY = e.pageY; startLeft = gsap.getProperty(canvasContainer, "x"); startTop = gsap.getProperty(canvasContainer, "y"); });
    window.addEventListener('mouseup', () => { isDragging = false; galaxy.style.cursor = 'grab'; });
    window.addEventListener('mousemove', e => {
        gsap.to(tooltip, { x: e.clientX + 20, y: e.clientY, duration: 0.5, ease: 'power2.out' });
        if (!isDragging) return;
        const newX = startLeft + (e.pageX - startX);
        const newY = startTop + (e.pageY - startY);
        gsap.to(canvasContainer, { x: newX, y: newY, duration: 1, ease: 'power2.out' });
    });
    galaxy.addEventListener('wheel', e => {
        e.preventDefault();
        let scale = gsap.getProperty(canvasContainer, "scale") || 1;
        scale += e.deltaY * -0.001;
        scale = Math.min(Math.max(0.5, scale), 2);
        gsap.to(canvasContainer, { scale: scale, duration: 0.5, ease: 'power2.out' });
    });
}