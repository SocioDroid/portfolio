/* js/main.js */

// State Management
let currentTab = 'engineering';
const contentCache = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTab('engineering');
    initParticles();
    animate();
});

// Core Tab Switching Logic
async function loadTab(tabName) {
    // 1. UI Updates
    document.querySelectorAll('.nav-item').forEach(el => {
        if (el.dataset.tab === tabName) el.classList.add('active');
        else el.classList.remove('active');
    });

    // 2. Content Injection
    const container = document.getElementById('main-content');
    
    // Check Cache first
    if (contentCache[tabName]) {
        container.innerHTML = contentCache[tabName];
    } else {
        try {
            container.innerHTML = '<div style="text-align:center; padding:2rem;">Loading...</div>';
            const response = await fetch(`sections/${tabName}.html`);
            if (!response.ok) throw new Error('Failed to load section');
            const html = await response.text();
            contentCache[tabName] = html;
            container.innerHTML = html;
        } catch (error) {
            container.innerHTML = `<div class="brutal-box"><h3>Error</h3><p>Could not load content. Please ensure you are running this on a local server (CORS).</p></div>`;
            console.error(error);
        }
    }

    // 3. Handle Animation Visibility
    const canvas = document.getElementById('render-canvas');
    if (tabName === 'renders') {
        canvas.style.opacity = '1';
        animationRunning = true;
    } else {
        canvas.style.opacity = '0';
        // We keep animationRunning true to avoid restarting glitch, 
        // but css handles visibility.
    }
    
    window.scrollTo(0, 0);
}

// Global scope for HTML onclick
window.switchTab = function(tabName) {
    loadTab(tabName);
}


// --- Canvas Animation Logic ---
const canvas = document.getElementById('render-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
let animationRunning = true;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 50; i++) particles.push(new Particle());
}

function animate() {
    requestAnimationFrame(animate);
    
    // Performance optimization: only draw if visible
    if(canvas.style.opacity === '0') return;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i < particles.length; i++) {
        let p1 = particles[i];
        p1.update();
        p1.draw();
        for (let j = i + 1; j < particles.length; j++) {
            let p2 = particles[j];
            let dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 150) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
}