/* js/renders-webgl.js — Raw WebGL Saturn with rotating ring + debris.
   Positioned right-of-center on desktop, centered on mobile.
   Simple Lambert diffuse + procedural Saturn banding. */

const RendersGL = (() => {

    let gl, canvas;
    let solidProg, pointProg;
    let animFrameId = null;
    let isRunning = false;
    let mouseX = 0.5, mouseY = 0.5;
    let smoothMouseX = 0.5, smoothMouseY = 0.5;
    let scrollProgress = 0;
    let smoothScroll = 0;
    // Smooth color state for theme transitions
    let curBodyColor = [0.58, 0.50, 0.38];
    let curRingColor = [0.50, 0.44, 0.32];
    let curDebrisColor = [0.85, 0.75, 0.45, 0.7];
    let curAmbient = 0.2;
    let curPtSize = 3.5;
    let startTime = 0;
    let lastFrameTime = 0;
    let sphereGeo, ringGeo, debrisGeo;
    let asteroidMeshes = [];  // 4 unique low-poly rock shapes
    let asteroids = [];       // per-instance state
    const ASTEROID_COUNT = 14;
    const ASTEROID_Z_FAR = -45;
    const ASTEROID_Z_NEAR = 12;

    // ─── GLSL Shaders ───

    const SOLID_VS = `
        attribute vec3 aPosition;
        attribute vec3 aNormal;
        uniform mat4 uMVP;
        uniform mat4 uModel;
        uniform mat3 uNormalMat;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        void main() {
            vec4 world = uModel * vec4(aPosition, 1.0);
            vWorldPos = world.xyz;
            vNormal = normalize(uNormalMat * aNormal);
            gl_Position = uMVP * vec4(aPosition, 1.0);
        }
    `;

    // Simple Lambert + procedural Saturn banding
    const SOLID_FS = `
        precision mediump float;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        uniform vec3 uLightPos;
        uniform vec3 uBaseColor;
        uniform float uAlpha;
        uniform float uBanding;
        uniform float uAmbient;

        void main() {
            vec3 N = normalize(vNormal);
            vec3 L = normalize(uLightPos - vWorldPos);

            float diff = max(dot(N, L), 0.0);

            vec3 baseCol = uBaseColor;

            // Saturn body: horizontal bands (uBanding ~ 1.0)
            float isSphere = step(0.5, uBanding) * (1.0 - step(1.5, uBanding));
            float y = vWorldPos.y;
            float sBand = sin(y * 8.0) * 0.07
                        + sin(y * 18.0 + 0.5) * 0.04
                        + sin(y * 38.0) * 0.02;
            baseCol += isSphere * vec3(sBand, sBand * 0.75, sBand * 0.35);

            // Ring: concentric bands (uBanding ~ 2.0)
            float isRing = step(1.5, uBanding);
            float r = length(vWorldPos.xz);
            float rBand = sin(r * 14.0) * 0.06 + sin(r * 32.0) * 0.025;
            baseCol += isRing * vec3(rBand * 0.5, rBand * 0.45, rBand * 0.3);

            // uAmbient=1.0 → flat (light mode), uAmbient=0.2 → Lambert (dark mode)
            vec3 color = baseCol * (uAmbient + (1.0 - uAmbient) * diff);
            gl_FragColor = vec4(color, uAlpha);
        }
    `;

    const POINT_VS = `
        attribute vec3 aPosition;
        uniform mat4 uMVP;
        uniform float uPointSize;
        void main() {
            gl_Position = uMVP * vec4(aPosition, 1.0);
            gl_PointSize = uPointSize;
        }
    `;

    const POINT_FS = `
        precision mediump float;
        uniform vec4 uColor;
        void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float a = 1.0 - smoothstep(0.15, 0.5, d);
            gl_FragColor = vec4(uColor.rgb, uColor.a * a);
        }
    `;

    // ─── Shader helpers ───

    function compile(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error('Shader:', gl.getShaderInfoLog(s));
            return null;
        }
        return s;
    }

    function link(vs, fs) {
        const p = gl.createProgram();
        gl.attachShader(p, vs);
        gl.attachShader(p, fs);
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
            console.error('Program:', gl.getProgramInfoLog(p));
            return null;
        }
        return p;
    }

    function getU(prog, names) {
        const u = {};
        names.forEach(n => u[n] = gl.getUniformLocation(prog, n));
        return u;
    }

    // ─── Geometry builders ───

    function buildSphere(radius, lat, lon) {
        const pos = [], nrm = [], idx = [];
        for (let i = 0; i <= lat; i++) {
            const theta = i * Math.PI / lat;
            const sT = Math.sin(theta), cT = Math.cos(theta);
            for (let j = 0; j <= lon; j++) {
                const phi = j * 2 * Math.PI / lon;
                const x = Math.cos(phi) * sT, y = cT, z = Math.sin(phi) * sT;
                nrm.push(x, y, z);
                pos.push(x * radius, y * radius, z * radius);
            }
        }
        for (let i = 0; i < lat; i++) {
            for (let j = 0; j < lon; j++) {
                const a = i * (lon + 1) + j, b = a + lon + 1;
                idx.push(a, b, a + 1, b, b + 1, a + 1);
            }
        }
        return uploadIndexed(pos, nrm, idx);
    }

    function buildRing(innerR, outerR, segs) {
        const pos = [], nrm = [], idx = [];
        for (let i = 0; i <= segs; i++) {
            const a = (i / segs) * 2 * Math.PI;
            const c = Math.cos(a), s = Math.sin(a);
            pos.push(c * innerR, 0, s * innerR);
            nrm.push(0, 1, 0);
            pos.push(c * outerR, 0, s * outerR);
            nrm.push(0, 1, 0);
        }
        for (let i = 0; i < segs; i++) {
            const a = i * 2;
            idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
        return uploadIndexed(pos, nrm, idx);
    }

    function buildDebris(innerR, outerR, count) {
        const pos = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const r = innerR + Math.random() * (outerR - innerR);
            pos.push(
                Math.cos(angle) * r,
                (Math.random() - 0.5) * 0.1,
                Math.sin(angle) * r
            );
        }
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
        return { posBuf: buf, count };
    }

    function uploadIndexed(pos, nrm, idx) {
        const pb = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pb);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
        const nb = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nb);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nrm), gl.STATIC_DRAW);
        const ib = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
        return { posBuf: pb, nrmBuf: nb, idxBuf: ib, count: idx.length };
    }

    // ─── Low-poly asteroid builder (icosahedron with vertex displacement) ───

    function seededRandom(seed) {
        let s = seed;
        return function() {
            s = (s * 16807 + 0) % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    function buildAsteroid(seed) {
        const rng = seededRandom(seed);
        const t = (1 + Math.sqrt(5)) / 2;

        // Icosahedron base vertices (normalized to unit sphere)
        const raw = [
            [-1, t,0],[1, t,0],[-1,-t,0],[1,-t,0],
            [0,-1, t],[0,1, t],[0,-1,-t],[0,1,-t],
            [ t,0,-1],[ t,0,1],[-t,0,-1],[-t,0,1]
        ];
        const baseVerts = raw.map(v => {
            const len = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
            return [v[0]/len, v[1]/len, v[2]/len];
        });

        // Displace each vertex radially for rocky shape
        const displaced = baseVerts.map(v => {
            const disp = 0.7 + rng() * 0.6; // 0.7–1.3
            return [v[0]*disp, v[1]*disp, v[2]*disp];
        });

        const faces = [
            [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
            [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
            [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
            [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
        ];

        // Flat shading: each face gets its own 3 vertices with the face normal
        const pos = [], nrm = [], idx = [];
        let vi = 0;
        for (let f = 0; f < faces.length; f++) {
            const [a,b,c] = faces[f];
            const va = displaced[a], vb = displaced[b], vc = displaced[c];
            // face normal
            const e1 = [vb[0]-va[0], vb[1]-va[1], vb[2]-va[2]];
            const e2 = [vc[0]-va[0], vc[1]-va[1], vc[2]-va[2]];
            const nx = e1[1]*e2[2] - e1[2]*e2[1];
            const ny = e1[2]*e2[0] - e1[0]*e2[2];
            const nz = e1[0]*e2[1] - e1[1]*e2[0];
            const nl = Math.sqrt(nx*nx+ny*ny+nz*nz) || 1;
            const fn = [nx/nl, ny/nl, nz/nl];

            pos.push(...va, ...vb, ...vc);
            nrm.push(...fn, ...fn, ...fn);
            idx.push(vi, vi+1, vi+2);
            vi += 3;
        }
        return uploadIndexed(pos, nrm, idx);
    }

    function spawnAsteroid(a, fullRandom) {
        const rng = Math.random;
        a.meshIdx = Math.floor(rng() * asteroidMeshes.length);
        a.x = (rng() - 0.5) * 28;
        a.y = (rng() - 0.5) * 16;
        a.z = fullRandom
            ? ASTEROID_Z_FAR + rng() * (ASTEROID_Z_NEAR - ASTEROID_Z_FAR)
            : ASTEROID_Z_FAR + rng() * 10;
        a.vz = 1.2 + rng() * 2.8;
        a.scale = 0.12 + rng() * 0.35;
        a.rotX = rng() * 6.28;
        a.rotY = rng() * 6.28;
        a.rotZ = rng() * 6.28;
        a.rotSpdX = (rng() - 0.5) * 1.2;
        a.rotSpdY = (rng() - 0.5) * 1.2;
        a.rotSpdZ = (rng() - 0.5) * 0.6;
        // slight color variation per rock
        const shade = 0.35 + rng() * 0.15;
        a.color = [shade, shade * 0.92, shade * 0.82];
        return a;
    }

    function initAsteroids() {
        // Build 4 unique mesh shapes
        asteroidMeshes = [];
        for (let i = 0; i < 4; i++) {
            asteroidMeshes.push(buildAsteroid(12345 + i * 7919));
        }
        // Spawn instances spread across the full z-range
        asteroids = [];
        for (let i = 0; i < ASTEROID_COUNT; i++) {
            asteroids.push(spawnAsteroid({}, true));
        }
    }

    // ─── Init ───

    function init() {
        if (typeof glMatrix === 'undefined') return false;
        canvas = document.getElementById('renders-gl-canvas');
        if (!canvas) return false;

        gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
        if (!gl) return false;

        const svs = compile(gl.VERTEX_SHADER, SOLID_VS);
        const sfs = compile(gl.FRAGMENT_SHADER, SOLID_FS);
        if (!svs || !sfs) return false;
        solidProg = link(svs, sfs);
        if (!solidProg) return false;
        solidProg.u = getU(solidProg, [
            'uMVP', 'uModel', 'uNormalMat', 'uLightPos',
            'uBaseColor', 'uAlpha', 'uBanding', 'uAmbient'
        ]);
        solidProg.aPos = gl.getAttribLocation(solidProg, 'aPosition');
        solidProg.aNrm = gl.getAttribLocation(solidProg, 'aNormal');

        const pvs = compile(gl.VERTEX_SHADER, POINT_VS);
        const pfs = compile(gl.FRAGMENT_SHADER, POINT_FS);
        if (!pvs || !pfs) return false;
        pointProg = link(pvs, pfs);
        if (!pointProg) return false;
        pointProg.u = getU(pointProg, ['uMVP', 'uPointSize', 'uColor']);
        pointProg.aPos = gl.getAttribLocation(pointProg, 'aPosition');

        // Moderate size Saturn
        sphereGeo = buildSphere(1.2, 28, 28);
        ringGeo   = buildRing(1.7, 2.7, 64);
        debrisGeo = buildDebris(1.7, 2.7, 250);

        // Low-poly asteroid field
        initAsteroids();

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);

        startTime = performance.now();
        return true;
    }

    // ─── Resize ───

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(window.innerWidth * dpr);
        const h = Math.round(window.innerHeight * dpr);
        // Force CSS display size to exactly match the viewport (avoids 100vh/dvh quirks)
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            gl.viewport(0, 0, w, h);
        }
    }

    // ─── Draw helpers ───

    function drawSolid(geo, mvp, model, normalMat, baseColor, alpha, banding, ambient) {
        gl.useProgram(solidProg);
        gl.uniformMatrix4fv(solidProg.u.uMVP, false, mvp);
        gl.uniformMatrix4fv(solidProg.u.uModel, false, model);
        gl.uniformMatrix3fv(solidProg.u.uNormalMat, false, normalMat);
        gl.uniform3fv(solidProg.u.uBaseColor, baseColor);
        gl.uniform1f(solidProg.u.uAlpha, alpha);
        gl.uniform1f(solidProg.u.uBanding, banding);
        gl.uniform1f(solidProg.u.uAmbient, ambient);

        gl.bindBuffer(gl.ARRAY_BUFFER, geo.posBuf);
        gl.enableVertexAttribArray(solidProg.aPos);
        gl.vertexAttribPointer(solidProg.aPos, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, geo.nrmBuf);
        gl.enableVertexAttribArray(solidProg.aNrm);
        gl.vertexAttribPointer(solidProg.aNrm, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geo.idxBuf);
        gl.drawElements(gl.TRIANGLES, geo.count, gl.UNSIGNED_SHORT, 0);
        gl.disableVertexAttribArray(solidProg.aNrm);
    }

    function drawPoints(geo, mvp, pointSize, color) {
        gl.useProgram(pointProg);
        gl.uniformMatrix4fv(pointProg.u.uMVP, false, mvp);
        gl.uniform1f(pointProg.u.uPointSize, pointSize);
        gl.uniform4fv(pointProg.u.uColor, color);

        gl.bindBuffer(gl.ARRAY_BUFFER, geo.posBuf);
        gl.enableVertexAttribArray(pointProg.aPos);
        gl.vertexAttribPointer(pointProg.aPos, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, geo.count);
    }

    // ─── Render Loop ───

    function frame() {
        if (!isRunning) return;
        animFrameId = requestAnimationFrame(frame);

        resize();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const { mat4, mat3 } = glMatrix;
        const t = (performance.now() - startTime) * 0.001;
        const isDark = document.body.classList.contains('dark-mode');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const vw = canvas.width / dpr;
        const isMobile = vw < 600;

        // Smooth interpolation for mouse and scroll (removes glitchy jumps)
        const lerp = 0.06;
        smoothMouseX += (mouseX - smoothMouseX) * lerp;
        smoothMouseY += (mouseY - smoothMouseY) * lerp;
        smoothScroll += (scrollProgress - smoothScroll) * lerp;

        // Camera offset LEFT so Saturn appears on the RIGHT
        const fov = isMobile ? Math.PI / 3 : Math.PI / 4.5;
        const baseDist = isMobile ? 8 : 7;
        const zoomAmount = isMobile ? 0.5 : 0.8;
        const camDist = baseDist - smoothScroll * zoomAmount;
        const camOffsetX = isMobile ? 0 : -2.2;
        const eyePos = [camOffsetX, 0.4, camDist];
        const lookAtPt = [0, -0.1, 0];

        const proj = mat4.create();
        mat4.perspective(proj, fov, (canvas.width / canvas.height) || 1, 0.1, 100);
        const view = mat4.create();
        mat4.lookAt(view, eyePos, lookAtPt, [0, 1, 0]);
        const vp = mat4.create();
        mat4.multiply(vp, proj, view);

        // Light at camera + smooth mouse offset — always front-lit
        const lx = eyePos[0] + (smoothMouseX - 0.5) * 5;
        const ly = eyePos[1] + -(smoothMouseY - 0.5) * 5;
        const lightPos = [lx, ly, camDist];

        gl.useProgram(solidProg);
        gl.uniform3fv(solidProg.u.uLightPos, lightPos);

        // Target colors — light mode much lighter/pastel, dark mode warmer
        const tBodyColor = isDark ? [0.58, 0.50, 0.38] : [0.88, 0.82, 0.72];
        const tRingColor = isDark ? [0.50, 0.44, 0.32] : [0.82, 0.76, 0.66];
        const tDebrisCol = isDark ? [0.85, 0.75, 0.45, 0.7] : [0.84, 0.78, 0.68, 0.4];
        const tAmbient   = isDark ? 0.2 : 1.0;
        const tPtSize    = isDark ? 3.5 * dpr : 2.5 * dpr;

        // Lerp all colors for smooth theme transitions
        const cLerp = 0.04;
        for (let i = 0; i < 3; i++) {
            curBodyColor[i] += (tBodyColor[i] - curBodyColor[i]) * cLerp;
            curRingColor[i] += (tRingColor[i] - curRingColor[i]) * cLerp;
        }
        for (let i = 0; i < 4; i++) {
            curDebrisColor[i] += (tDebrisCol[i] - curDebrisColor[i]) * cLerp;
        }
        curAmbient += (tAmbient - curAmbient) * cLerp;
        curPtSize += (tPtSize - curPtSize) * cLerp;

        // ── Saturn body ──
        const bodyModel = mat4.create();
        mat4.rotateY(bodyModel, bodyModel, t * 0.03);
        const bodyMVP = mat4.create();
        mat4.multiply(bodyMVP, vp, bodyModel);
        const bodyNorm = mat3.create();
        mat3.normalFromMat4(bodyNorm, bodyModel);
        drawSolid(sphereGeo, bodyMVP, bodyModel, bodyNorm, curBodyColor, 1.0, 1.0, curAmbient);

        // ── Ring (tilted + slow revolution) ──
        const ringModel = mat4.create();
        mat4.rotateX(ringModel, ringModel, 0.40);
        mat4.rotateY(ringModel, ringModel, t * 0.04);
        const ringMVP = mat4.create();
        mat4.multiply(ringMVP, vp, ringModel);
        const ringNorm = mat3.create();
        mat3.normalFromMat4(ringNorm, ringModel);
        drawSolid(ringGeo, ringMVP, ringModel, ringNorm, curRingColor, 0.75, 2.0, curAmbient);

        // ── Debris ──
        const ptSize = Math.min(curPtSize, isDark ? 7.0 : 5.0);
        drawPoints(debrisGeo, ringMVP, ptSize, curDebrisColor);

        // ── Asteroids (fly from z- to z+) ──
        const now = performance.now() * 0.001;
        const dt = Math.min(now - lastFrameTime, 0.1); // cap to avoid jumps
        lastFrameTime = now;

        for (let i = 0; i < asteroids.length; i++) {
            const a = asteroids[i];
            // Update position
            a.z += a.vz * dt;
            a.rotX += a.rotSpdX * dt;
            a.rotY += a.rotSpdY * dt;
            a.rotZ += a.rotSpdZ * dt;

            // Respawn when past camera
            if (a.z > ASTEROID_Z_NEAR) {
                spawnAsteroid(a, false);
            }

            // Model matrix: translate → rotate → scale
            const m = mat4.create();
            mat4.translate(m, m, [a.x, a.y, a.z]);
            mat4.rotateX(m, m, a.rotX);
            mat4.rotateY(m, m, a.rotY);
            mat4.rotateZ(m, m, a.rotZ);
            mat4.scale(m, m, [a.scale, a.scale, a.scale]);

            const mvp = mat4.create();
            mat4.multiply(mvp, vp, m);
            const nm = mat3.create();
            mat3.normalFromMat4(nm, m);

            // Theme-adapted color: darker base in dark mode, lighter in light
            const ac = a.color;
            const col = isDark
                ? [ac[0] * 0.7, ac[1] * 0.7, ac[2] * 0.7]
                : [ac[0] * 1.4, ac[1] * 1.35, ac[2] * 1.3];

            drawSolid(asteroidMeshes[a.meshIdx], mvp, m, nm, col, 1.0, 0.0, curAmbient);
        }
    }

    // ─── Public API ───

    function start() {
        if (!gl && !init()) return;
        // Reset smooth values to prevent jump on tab switch
        const isDark = document.body.classList.contains('dark-mode');
        scrollProgress = 0;
        smoothScroll = 0;
        mouseX = 0.5; mouseY = 0.5;
        smoothMouseX = 0.5; smoothMouseY = 0.5;
        // Init colors to current theme immediately (no transition on first load)
        curBodyColor = isDark ? [0.58, 0.50, 0.38] : [0.88, 0.82, 0.72];
        curRingColor = isDark ? [0.50, 0.44, 0.32] : [0.82, 0.76, 0.66];
        curDebrisColor = isDark ? [0.85, 0.75, 0.45, 0.7] : [0.84, 0.78, 0.68, 0.4];
        curAmbient = isDark ? 0.2 : 1.0;
        curPtSize = isDark ? 3.5 : 2.5;
        lastFrameTime = performance.now() * 0.001;
        isRunning = true;
        frame();
    }

    function stop() {
        isRunning = false;
        if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    }

    function destroy() {
        stop();
        if (gl) { const e = gl.getExtension('WEBGL_lose_context'); if (e) e.loseContext(); }
        gl = null; canvas = null; solidProg = null; pointProg = null;
    }

    function onMouseMove(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = (e.clientY - rect.top) / rect.height;
    }

    function setScroll(progress) {
        scrollProgress = Math.max(0, Math.min(1, progress));
    }

    return { start, stop, destroy, onMouseMove, setScroll };
})();
