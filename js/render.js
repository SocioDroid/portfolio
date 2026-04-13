/* js/render.js — Builds HTML from PORTFOLIO data.
   Each function returns an HTML string for its section. */

const Render = (() => {

    // ─── Shared Helpers ───

    function escAttr(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    }

    function talkRow(talk) {
        return `
        <div class="brutal-box reveal" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h3><i class="fas fa-microphone-alt" style="margin-right: 6px; opacity: 0.6;"></i>${talk.title}</h3>
                <div style="font-size: 0.8rem; opacity: 0.7;">${talk.venue} | ${talk.date}</div>
            </div>
            <a href="${escAttr(talk.url)}" class="brutal-btn" target="_blank" rel="noopener noreferrer">LINK ↗</a>
        </div>`;
    }

    function videoCard(item) {
        return `
        <div class="reveal">
            <div class="video-container" data-youtube-url="${escAttr(item.youtubeUrl)}"
                data-video-title="${escAttr(item.title)}"></div>
            <div class="brutal-box" style="margin-top: -3px; border-top: none; margin-bottom: 0;">
                <div class="video-card-head">
                    <h3>${item.title}</h3>
                    <a href="${escAttr(item.youtubeUrl)}" class="brutal-btn video-link-btn" target="_blank"
                        rel="noopener noreferrer">YouTube ↗</a>
                </div>
                ${item.tags ? item.tags.map(t => `<span class="tag">${t}</span>`).join('') : `<span class="tag">${item.venue || ''}</span>`}
            </div>
        </div>`;
    }

    // ─── Header ───

    function header(data) {
        const p = data.personal;
        const s = data.social;

        return `
        <div class="tb-left">
            <div class="tb-name">${p.name}</div>
            <div class="tb-details">
                <span><i class="fas fa-map-marker-alt"></i> ${p.location}</span>
                <span><i class="fas fa-envelope"></i> ${p.email}</span>
            </div>
        </div>

        <div class="nav-tabs">
            ${data.tabs.map(tab => `<div class="nav-item" data-tab="${tab}" onclick="switchTab('${tab}')">${tab.charAt(0).toUpperCase() + tab.slice(1)}</div>`).join('\n            ')}
        </div>

        <div class="tb-right">
            <a href="${escAttr(s.linkedin)}" class="social-mini" target="_blank" rel="noopener noreferrer"><i class="fab fa-linkedin"></i></a>
            <a href="${escAttr(s.twitter)}" class="social-mini" target="_blank" rel="noopener noreferrer"><i class="fab fa-x-twitter"></i></a>
            <a href="${escAttr(s.github)}" class="social-mini" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i></a>
            <!-- <a href="${escAttr(p.resumeUrl)}" download class="brutal-btn resume" target="_blank" rel="noopener noreferrer">RESUME <i class="fas fa-download"></i></a> -->
        </div>`;
    }

    function mobileNav(data) {
        return data.tabs.map(tab =>
            `<div class="nav-item" data-tab="${tab}" onclick="switchTab('${tab}')">${tab.toUpperCase()}</div>`
        ).join('\n        ');
    }

    // ─── Engineering Tab ───

    function engineering(data) {
        const d = data.engineering;
        let html = '';

        // Tech Stack
        const allGroups = [d.techStack.languages, d.techStack.frameworks, d.techStack.tools];
        const iconSections = allGroups.map(group =>
            group.map(t => `<i class="${t.icon} tech-icon" title="${escAttr(t.title)}"></i>`).join('\n            ')
        ).join('\n            <div style="width: 2px; height: 30px; background: var(--divider-color);"></div>\n            ');

        html += `
<div class="brutal-box reveal">
    <h3 style="margin-bottom: 1rem; text-transform: uppercase;">Tech Stack</h3>
    <div class="tech-stack-strip">
        ${iconSections}
    </div>
</div>`;

        // Experience
        html += '\n\n<h2>Experience</h2>';
        d.experience.forEach(exp => {
            html += `
<div class="brutal-box reveal">
    <div class="exp-row">
        <h3>${exp.company}</h3>
        <span class="tag">${exp.period}</span>
    </div>
    <ul>
        ${exp.highlights.map(h => `<li>${h}</li>`).join('\n        ')}
    </ul>
</div>`;
        });

        // Projects
        html += '\n\n<h2>Projects</h2>\n<div class="brutal-box reveal">';
        d.projects.forEach(proj => {
            html += `
    <div class="exp-row">
        <h3><i class="fas fa-code" style="margin-right: 6px; opacity: 0.5;"></i>${proj.name}</h3>
        <a href="${escAttr(proj.url)}" class="brutal-btn"
            style="padding: 2px 8px; font-size: 0.7rem;" target="_blank" rel="noopener noreferrer">LINK ↗</a>
    </div>`;
        });
        html += '\n</div>';

        // Talks
        html += '\n\n<h2>Talks</h2>';
        d.talks.forEach(talk => { html += talkRow(talk); });

        return html;
    }

    // ─── Exploits Tab ───

    function exploits(data) {
        const d = data.exploits;
        let html = '';

        // Platform Profiles
        html += `
<div class="reveal" style="text-align: center; margin-bottom: 3rem;">
    <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
        ${d.profiles.map(p => `<a href="${escAttr(p.url)}" class="brutal-btn" target="_blank" rel="noopener noreferrer">${p.name}${p.icon ? ` <i class="${p.icon}"></i>` : ''}</a>`).join('\n        ')}
    </div>
</div>`;

        // Hall of Fame
        html += '\n<h2>Hall of Fame</h2>';
        html += `
<div class="brutal-box reveal">
    <div class="hof-grid">
        ${d.hallOfFame.map(h => `<a href="${escAttr(h.url)}" target="_blank" rel="noopener noreferrer" class="hof-item">${h.name}</a>`).join('\n        ')}
    </div>
</div>`;

        // Writeups
        html += '\n<h2>Writeups</h2>';
        html += '\n<div class="brutal-box reveal">';
        d.writeups.forEach(w => {
            html += `
    <a href="${escAttr(w.url)}" target="_blank" rel="noopener noreferrer" class="writeup-link">
        <i class="${w.platform}"></i> ${w.title} <span style="float: right;">↗</span>
    </a>`;
        });
        html += '\n</div>';

        // Talks (video)
        html += '\n\n<h2>Talks</h2>\n<div class="youtube-grid">';
        d.talks.forEach(talk => {
            html += videoCard({
                title: talk.title,
                youtubeUrl: talk.youtubeUrl,
                venue: talk.venue
            });
        });
        html += '\n</div>';

        // Highlights
        const hi = d.highlights;
        html += `

<h2 style="margin-top: 2rem;">Highlights</h2>
<div class="brutal-box reveal">
    <p><strong><i class="fab fa-x-twitter"></i> ${hi.handle}</strong></p>
    <div style="margin-top: 10px; background: var(--subtle-bg); padding: 10px; border-left: 4px solid var(--border-color);">
        "${hi.quote}"
        <br><br>
        <a href="${escAttr(hi.profileUrl)}" target="_blank" rel="noopener noreferrer">View on X ↗</a>
    </div>
</div>`;

        return html;
    }

    // ─── Renders Tab ───

    function renders(data) {
        const d = data.renders;
        let html = '';

        // Header
        html += `
<div class="brutal-box reveal renders-header-box">
    <h1 style="text-transform: uppercase;">${d.header.title}</h1>
    <p>${d.header.subtitle}</p>
</div>`;

        // Projects Demo (video grid)
        html += '\n\n<h2>Projects Demo</h2>\n<div class="youtube-grid">';
        d.projects.forEach(proj => { html += videoCard(proj); });
        html += '\n</div>';

        // Talks
        html += '\n\n<h2 style="margin-top: 2rem;">Talks</h2>';
        d.talks.forEach(talk => {
            html += `
<div class="brutal-box reveal" style="display: flex; justify-content: space-between; align-items: center;">
    <div>
        <h3><i class="fas fa-microphone-alt" style="margin-right: 6px; opacity: 0.6;"></i>${talk.title}</h3>
        <div style="font-size: 0.8rem; opacity: 0.7;">${talk.venue} | ${talk.date}</div>
    </div>
    <a href="${escAttr(talk.url)}" class="brutal-btn video-link-btn" target="_blank" rel="noopener noreferrer">LINK ↗</a>
</div>`;
        });

        // Spacer so Saturn is fully visible when scrolled to bottom
        html += '\n<div class="renders-spacer" style="height: 100vh; pointer-events: none;"></div>';

        return html;
    }

    // ─── Public API ───
    return { header, mobileNav, engineering, exploits, renders };

})();
