# portfolio

Personal portfolio for [aishkendle.dev](https://aishkendle.dev) — a static, dependency-free site (no build step).

- `js/data.js` — all content. Edit this file to update the portfolio.
- `js/render.js` — turns the data into HTML (Engineering, Exploits, Renders tabs).
- `js/main.js` — theme toggle, hash-based tab routing, reveal animations.
- `js/renders-webgl.js` + `js/vendor/gl-matrix-min.js` — the WebGL Saturn backdrop, loaded only when the Renders tab is opened.
- `css/style.css` — design tokens (light/dark) and all styles.

Preview locally with any static server, e.g. `python3 -m http.server`.
