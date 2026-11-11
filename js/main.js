/* js/main.js — Theme, tab routing, reveal animations and the lazy-loaded
   WebGL backdrop. Content comes from js/data.js via js/render.js. */

(() => {
    const root = document.documentElement;
    const main = document.getElementById('main');
    const glCanvas = document.getElementById('renders-gl-canvas');
    const tabs = PORTFOLIO.tabs;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentTab = null;

    // ─── Theme ───

    function applyTheme(theme, persist) {
        root.dataset.theme = theme;
        if (persist) {
            try { localStorage.setItem('theme', theme); } catch { /* private mode */ }
        }
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = theme === 'dark' ? '#0b0c0e' : '#fafaf9';
        document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
            btn.setAttribute('aria-pressed', String(theme === 'dark'));
        });
    }

    function initTheme() {
        applyTheme(root.dataset.theme || 'dark', false);

        document.addEventListener('click', e => {
            if (!e.target.closest('[data-theme-toggle]')) return;
            applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
        });

        // Follow the system setting until the visitor makes an explicit choice
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
            let saved = null;
            try { saved = localStorage.getItem('theme'); } catch { /* ignore */ }
            if (!saved) applyTheme(e.matches ? 'light' : 'dark', false);
        });
    }

    // ─── Reveal on scroll ───

    const revealObserver = 'IntersectionObserver' in window && !reducedMotion
        ? new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' })
        : null;

    function observeReveals(scope) {
        scope.querySelectorAll('.reveal').forEach(el => {
            if (revealObserver) revealObserver.observe(el);
            else el.classList.add('visible');
        });
    }

    // ─── WebGL backdrop (Renders tab only; scripts are fetched on first use) ───

    let glScripts = null;
    let scrollTicking = false;

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    function loadGL() {
        glScripts = glScripts || loadScript('js/vendor/gl-matrix-min.js')
            .then(() => loadScript('js/renders-webgl.js'));
        return glScripts;
    }

    // Scroll → Saturn zoom, plus a blur that fades out as the content scrolls away
    function updateScroll() {
        scrollTicking = false;
        if (currentTab !== 'renders' || typeof RendersGL === 'undefined') return;
        const range = root.scrollHeight - window.innerHeight;
        const progress = range > 0 ? Math.min(1, window.scrollY / range) : 0;
        RendersGL.setScroll(progress);
        const blur = (1 - progress) * 6;
        glCanvas.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : 'none';
    }

    function onScroll() {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(updateScroll);
    }

    function onMouseMove(e) {
        if (typeof RendersGL !== 'undefined') RendersGL.onMouseMove(e);
    }

    function startGL() {
        loadGL().then(() => {
            if (currentTab !== 'renders' || document.hidden) return;
            RendersGL.start();
            glCanvas.classList.add('is-active');
            updateScroll();
        }).catch(() => { /* backdrop is decorative; the page works without it */ });

        main.addEventListener('mousemove', onMouseMove);
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    function stopGL() {
        if (typeof RendersGL !== 'undefined') RendersGL.stop();
        glCanvas.classList.remove('is-active');
        glCanvas.style.filter = 'none';
        main.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('scroll', onScroll);
    }

    // Don't burn GPU while the tab is in the background
    document.addEventListener('visibilitychange', () => {
        if (currentTab !== 'renders' || typeof RendersGL === 'undefined') return;
        if (document.hidden) RendersGL.stop();
        else RendersGL.start();
    });

    // ─── Tabs (hash-routed, so each section is linkable) ───

    function tabFromHash() {
        const name = location.hash.slice(1).toLowerCase();
        return tabs.includes(name) ? name : tabs[0];
    }

    function loadTab(name) {
        if (name === currentTab) return;
        if (currentTab === 'renders') stopGL();

        const isFirstLoad = currentTab === null;
        currentTab = name;
        document.body.dataset.tab = name;

        document.querySelectorAll('[data-tab]').forEach(el => {
            if (el.dataset.tab === name) el.setAttribute('aria-current', 'page');
            else el.removeAttribute('aria-current');
        });

        main.innerHTML = Render[name](PORTFOLIO);
        observeReveals(main);

        const label = name.charAt(0).toUpperCase() + name.slice(1);
        document.title = name === tabs[0]
            ? PORTFOLIO.personal.pageTitle
            : `${label} | ${PORTFOLIO.personal.name}`;

        if (name === 'renders') startGL();

        if (!isFirstLoad) {
            window.scrollTo(0, 0);
            main.focus({ preventScroll: true });
        }
    }

    // Hide thumbnails that fail to load (the card keeps its neutral placeholder)
    main.addEventListener('error', e => {
        if (e.target.tagName === 'IMG') e.target.remove();
    }, true);

    // ─── Init ───

    document.querySelector('.site-header').innerHTML = Render.header(PORTFOLIO);
    document.querySelector('.mobile-nav').innerHTML = Render.mobileNav(PORTFOLIO);
    document.querySelector('.site-footer').innerHTML = Render.footer(PORTFOLIO);

    initTheme();
    loadTab(tabFromHash());
    window.addEventListener('hashchange', () => loadTab(tabFromHash()));
})();
