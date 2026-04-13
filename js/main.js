/* js/main.js */

// Smooth scroll (Lenis)
const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
(function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(performance.now());

// State Management
let currentTab = 'engineering';

// Renderers keyed by tab name
const tabRenderers = {
    engineering: () => Render.engineering(PORTFOLIO),
    exploits:    () => Render.exploits(PORTFOLIO),
    renders:     () => Render.renders(PORTFOLIO)
};

// ─── Theme Toggle ───

function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const icon = btn.querySelector('i');

    // Dark is default (applied by inline script in HTML).
    // If user explicitly chose light, revert.
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        document.body.classList.remove('dark-mode');
        icon.classList.replace('fa-sun', 'fa-moon');
    } else if (!saved) {
        localStorage.setItem('theme', 'dark');
    }

    btn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        icon.classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();

    document.querySelector('.title-bar').innerHTML = Render.header(PORTFOLIO);
    document.querySelector('.mobile-nav').innerHTML = Render.mobileNav(PORTFOLIO);

    loadTab('engineering');
});

function getYouTubeVideoId(url) {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace('www.', '');

        if (host === 'youtu.be') return parsed.pathname.slice(1).split('/')[0];
        if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/')[2] || '';
        return parsed.searchParams.get('v') || '';
    } catch {
        return '';
    }
}

function getYouTubeThumbnail(url, quality = 'hqdefault') {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return '';
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

function hydrateYouTubeCovers(root = document) {
    const containers = root.querySelectorAll('.video-container[data-youtube-url]');

    containers.forEach(container => {
        const videoUrl = container.dataset.youtubeUrl || '';
        const videoTitle = container.dataset.videoTitle || 'Video';
        const thumbnailUrl = getYouTubeThumbnail(videoUrl);

        if (thumbnailUrl) {
            container.innerHTML = `<img src="${thumbnailUrl}" alt="${videoTitle} cover" class="video-cover" loading="lazy">`;
        } else {
            container.innerHTML = '<div class="video-cover video-cover-fallback">Preview Unavailable</div>';
        }
    });
}

// Core Tab Switching Logic
function loadTab(tabName) {
    const container = document.getElementById('main-content');
    const glCanvas = document.getElementById('renders-gl-canvas');

    // Cleanup previous tab's WebGL
    if (currentTab === 'renders' && typeof RendersGL !== 'undefined') {
        RendersGL.stop();
        container.removeEventListener('mousemove', RendersGL.onMouseMove);
        if (window._rendersScrollHandler) {
            window.removeEventListener('scroll', window._rendersScrollHandler);
            window._rendersScrollHandler = null;
        }
    }

    currentTab = tabName;

    // 1. UI Updates
    document.querySelectorAll('.nav-item').forEach(el => {
        if (el.dataset.tab === tabName) el.classList.add('active');
        else el.classList.remove('active');
    });

    // 2. Content Injection (data-driven, no fetch needed)
    const renderer = tabRenderers[tabName];

    if (renderer) {
        container.innerHTML = renderer();
    } else {
        container.innerHTML = `<div class="brutal-box"><h3>Error</h3><p>Unknown tab: ${tabName}</p></div>`;
    }

    hydrateYouTubeCovers(container);
    observeReveals(container);

    // 3. Handle WebGL Visibility
    if (tabName === 'renders') {
        glCanvas.style.opacity = '1';

        requestAnimationFrame(() => {
            if (typeof RendersGL !== 'undefined') {
                RendersGL.start();
                container.addEventListener('mousemove', RendersGL.onMouseMove);
            }
        });

        // Scroll → Saturn zoom + blur: feed scroll progress to WebGL, blur when content overlaps
        window._rendersScrollHandler = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                const progress = scrollTop / docHeight;
                if (typeof RendersGL !== 'undefined') RendersGL.setScroll(progress);
                // Blur fades from max at top (content overlapping) to 0 at bottom (saturn alone)
                const blur = Math.max(0, (1 - progress) * 6);
                glCanvas.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : 'none';
            }
        };
        window._rendersScrollHandler(); // set initial blur
        window.addEventListener('scroll', window._rendersScrollHandler, { passive: true });
    } else {
        glCanvas.style.opacity = '0';
        glCanvas.style.filter = 'none';
        // Remove scroll handler when leaving renders tab
        if (window._rendersScrollHandler) {
            window.removeEventListener('scroll', window._rendersScrollHandler);
            window._rendersScrollHandler = null;
        }
    }
    
    lenis.scrollTo(0, { immediate: true });
}

// Global scope for HTML onclick
window.switchTab = function(tabName) {
    loadTab(tabName);
}

// Lightweight reveal: IntersectionObserver for .reveal elements
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });

function observeReveals(root) {
    root.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}
