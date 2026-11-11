/* js/render.js — Builds HTML from PORTFOLIO data.
   Each public function returns an HTML string for one region of the page. */

const Render = (() => {

    // ─── Icons (inline SVG: no icon-font download) ───

    const STROKE = {
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
        moon: '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/>',
        arrow: '<path d="M7 17 17 7M8 7h9v9"/>',
        pin: '<path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
        mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
        mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>',
        file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
        code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
        shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        orbit: '<circle cx="12" cy="12" r="5"/><ellipse cx="12" cy="12" rx="11" ry="3.6" transform="rotate(-20 12 12)"/>',
        trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'
    };

    const FILL = {
        play: '<path d="M8 5.5v13a.6.6 0 0 0 .92.5l10.2-6.5a.6.6 0 0 0 0-1L8.92 5a.6.6 0 0 0-.92.5z"/>',
        github: '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
        linkedin: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
        x: '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>',
        medium: '<path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>'
    };

    function icon(name) {
        if (STROKE[name]) {
            return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${STROKE[name]}</svg>`;
        }
        if (FILL[name]) {
            return `<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${FILL[name]}</svg>`;
        }
        return '';
    }

    // ─── Shared helpers ───

    const TAB_ICONS = { engineering: 'code', exploits: 'shield', renders: 'orbit' };

    function esc(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /** External link attributes. */
    function ext(url) {
        return `href="${esc(url)}" target="_blank" rel="noopener noreferrer"`;
    }

    function section(title, body, meta = '') {
        return `
<section class="section">
    <div class="section-head">
        <h2>${esc(title)}</h2>
        ${meta ? `<span class="section-meta">${esc(meta)}</span>` : ''}
    </div>
    ${body}
</section>`;
    }

    function pageHead({ eyebrow, title, subtitle, extra = '', className = '' }) {
        return `
<div class="page-head reveal ${className}">
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h1>${esc(title)}</h1>
    ${subtitle ? `<p class="lede">${esc(subtitle)}</p>` : ''}
    ${extra}
</div>`;
    }

    function talkList(talks) {
        return `
<ul class="row-list card reveal">
    ${talks.map(t => `
    <li>
        <a class="row" ${ext(t.url)}>
            <span class="row-icon">${icon('mic')}</span>
            <span class="row-main">
                <span class="row-title">${esc(t.title)}</span>
                <span class="row-sub">${esc([t.venue, t.date].filter(Boolean).join(' · '))}</span>
            </span>
            <span class="row-arrow">${icon('arrow')}</span>
        </a>
    </li>`).join('')}
</ul>`;
    }

    function youTubeId(url) {
        try {
            const u = new URL(url);
            if (u.hostname.replace('www.', '') === 'youtu.be') return u.pathname.slice(1).split('/')[0];
            if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || '';
            return u.searchParams.get('v') || '';
        } catch {
            return '';
        }
    }

    function videoCard(item) {
        const id = youTubeId(item.youtubeUrl);
        const tags = item.tags || (item.venue ? [item.venue] : []);
        const cover = id
            ? `<img src="https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg" alt="" width="480" height="360" loading="lazy" decoding="async">`
            : '';

        return `
<a class="video-card card reveal" ${ext(item.youtubeUrl)} aria-label="${esc(item.title)} — watch on YouTube">
    <span class="video-thumb">
        ${cover}
        <span class="video-play">${icon('play')}</span>
    </span>
    <span class="video-body">
        <span class="video-title">${esc(item.title)}</span>
        <span class="tags">${tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</span>
    </span>
</a>`;
    }

    function socialLinks(s) {
        return [
            ['linkedin', 'LinkedIn', s.linkedin],
            ['x', 'X (Twitter)', s.twitter],
            ['github', 'GitHub', s.github]
        ].filter(([, , url]) => url).map(([name, label, url]) =>
            `<a class="icon-btn" ${ext(url)} aria-label="${label}" title="${label}">${icon(name)}</a>`
        ).join('');
    }

    // ─── Header, mobile nav, footer ───

    function header(data) {
        return `
<div class="header-inner">
    <a class="brand" href="#${data.tabs[0]}">${esc(data.personal.name)}</a>

    <nav class="tabs" aria-label="Sections">
        ${data.tabs.map(tab => `<a class="tab" href="#${tab}" data-tab="${tab}">${capitalize(tab)}</a>`).join('')}
    </nav>

    <div class="header-actions">
        ${socialLinks(data.social)}
        <button class="icon-btn theme-toggle" type="button" data-theme-toggle aria-label="Toggle dark mode" title="Toggle theme">
            <span class="theme-icon-sun">${icon('sun')}</span>
            <span class="theme-icon-moon">${icon('moon')}</span>
        </button>
    </div>
</div>`;
    }

    function mobileNav(data) {
        return data.tabs.map(tab => `
<a class="mobile-tab" href="#${tab}" data-tab="${tab}">
    ${icon(TAB_ICONS[tab] || 'code')}
    <span>${capitalize(tab)}</span>
</a>`).join('');
    }

    function footer(data) {
        return `
<div class="footer-inner">
    <span>© ${new Date().getFullYear()} ${esc(data.personal.name)}</span>
    <a href="mailto:${esc(data.personal.email)}">${esc(data.personal.email)}</a>
</div>`;
    }

    // ─── Engineering tab ───

    function engineering(data) {
        const p = data.personal;
        const d = data.engineering;

        let html = pageHead({
            eyebrow: p.pageTitle.split('|').pop().trim(),
            title: p.name,
            subtitle: p.tagline,
            className: 'hero',
            extra: `
    <div class="hero-meta">
        <span class="meta-item">${icon('pin')}${esc(p.location)}</span>
        <a class="meta-item" href="mailto:${esc(p.email)}">${icon('mail')}${esc(p.email)}</a>
    </div>
    <div class="btn-row">
        <a class="btn btn-primary" href="mailto:${esc(p.email)}">Get in touch</a>
        <a class="btn" ${ext(data.social.linkedin)}>${icon('linkedin')}LinkedIn</a>
        <a class="btn" ${ext(data.social.github)}>${icon('github')}GitHub</a>
        ${p.resumeUrl ? `<a class="btn" ${ext(p.resumeUrl)}>Résumé</a>` : ''}
    </div>`
        });

        // Tech stack
        const groups = [
            ['Languages', d.techStack.languages],
            ['Frameworks', d.techStack.frameworks],
            ['Tools', d.techStack.tools]
        ];
        html += section('Tech Stack', `
    <div class="card stack reveal">
        ${groups.map(([label, items]) => `
        <div class="stack-group">
            <span class="stack-label">${label}</span>
            <div class="chips">${items.map(t => `<span class="chip">${esc(t.title)}</span>`).join('')}</div>
        </div>`).join('')}
    </div>`);

        // Experience (highlights may contain trusted inline HTML such as <strong>)
        html += section('Experience', `
    <ol class="timeline">
        ${d.experience.map((exp, i) => `
        <li class="timeline-item reveal${i === 0 ? ' is-current' : ''}">
            <div class="card">
                <div class="exp-head">
                    <div>
                        <h3>${esc(exp.company)}</h3>
                        ${exp.role ? `<p class="exp-role">${esc(exp.role)}</p>` : ''}
                    </div>
                    ${exp.period ? `<span class="period">${esc(exp.period)}</span>` : ''}
                </div>
                <ul class="bullets">
                    ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
                </ul>
            </div>
        </li>`).join('')}
    </ol>`);

        // Projects
        html += section('Projects', `
    <ul class="row-list card reveal">
        ${d.projects.map(proj => `
        <li>
            <a class="row" ${ext(proj.url)}>
                <span class="row-icon">${icon('code')}</span>
                <span class="row-main"><span class="row-title">${esc(proj.name)}</span></span>
                <span class="row-arrow">${icon('arrow')}</span>
            </a>
        </li>`).join('')}
    </ul>`);

        html += section('Talks', talkList(d.talks));

        return html;
    }

    // ─── Exploits tab ───

    function exploits(data) {
        const d = data.exploits;

        let html = pageHead({
            eyebrow: 'Exploits',
            title: d.header.title,
            subtitle: d.header.subtitle,
            extra: `
    <div class="btn-row">
        ${d.profiles.map(p => `<a class="btn" ${ext(p.url)}>${esc(p.name)}${icon('arrow')}</a>`).join('')}
    </div>`
        });

        // Hall of Fame (entries without a URL render as plain, non-clickable items)
        html += section('Hall of Fame', `
    <div class="hof-grid reveal">
        ${d.hallOfFame.map(h => h.url
            ? `<a class="hof-item" ${ext(h.url)}>${esc(h.name)}${icon('arrow')}</a>`
            : `<span class="hof-item">${esc(h.name)}</span>`).join('')}
    </div>`, `${d.hallOfFame.length} acknowledgements`);

        // Writeups
        html += section('Writeups', `
    <ul class="row-list card reveal">
        ${d.writeups.map(w => `
        <li>
            <a class="row" ${ext(w.url)}>
                <span class="row-icon">${icon(w.platform === 'medium' ? 'medium' : 'file')}</span>
                <span class="row-main"><span class="row-title">${esc(w.title)}</span></span>
                <span class="row-arrow">${icon('arrow')}</span>
            </a>
        </li>`).join('')}
    </ul>`);

        // Talks (video)
        html += section('Talks', `
    <div class="video-grid">
        ${d.talks.map(videoCard).join('')}
    </div>`);

        // Highlights
        const hi = d.highlights;
        html += section('Highlights', `
    <figure class="card quote reveal">
        <blockquote>“${esc(hi.quote)}”</blockquote>
        <figcaption>
            <a ${ext(hi.profileUrl)}>${icon('x')}${esc(hi.handle)}${icon('arrow')}</a>
        </figcaption>
    </figure>`);

        return html;
    }

    // ─── Renders tab ───

    function renders(data) {
        const d = data.renders;

        let html = pageHead({
            eyebrow: 'Renders',
            title: d.header.title,
            subtitle: d.header.subtitle
        });

        html += section('Projects Demo', `
    <div class="video-grid">
        ${d.projects.map(videoCard).join('')}
    </div>`);

        html += section('Talks', talkList(d.talks));

        // Spacer so Saturn is fully visible when scrolled to the bottom
        html += '\n<div class="renders-spacer" aria-hidden="true"></div>';

        return html;
    }

    // ─── Public API ───
    return { header, mobileNav, footer, engineering, exploits, renders };

})();
