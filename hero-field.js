// HERO OBSERVATION FIELD v4 — luminous motes over a breathing atmosphere
//
// Two layers, one attention brain:
//   · WebGL atmosphere (stage): silk aurora, violet depth, drifting mist
//     that parts where the attention point looks. Optional enhancement —
//     if WebGL fails, the CSS aurora stays and the motes run alone.
//   · 2D mote canvas (the visible, interactive body): layered dream
//     matter that brightens and gathers around the attention point.
//
// Attention brain: wanders on its own · hesitates 500ms · follows the
// cursor with underwater lag · loses interest after 3.5s of stillness.
//
// Presets: ?field=subtle | signature | strong   (default: signature)
// Debug:   ?fielddebug=1
(function () {
    'use strict';

    const hero = document.getElementById('welcome');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // --- Presets -------------------------------------------------------------
    const PRESETS = {
        whisper: {
            DENSITY: 0.75, ALPHA: 1.0,  GATHER: 0.09, BRIGHTEN: 2.2, R_ATT: 190,
            MIST: 0.55, CLEARING: 0.75, STRUCT: 0.7,
            COMPANIONS: 16, SWARM_R: 60, HALO: 0.05, TRAIL_ALPHA: 0.06
        },
        signature: {
            DENSITY: 1.0,  ALPHA: 1.25, GATHER: 0.12, BRIGHTEN: 3.1, R_ATT: 210,
            MIST: 0.6,  CLEARING: 0.88, STRUCT: 1.0,
            COMPANIONS: 20, SWARM_R: 66, HALO: 0.11, TRAIL_ALPHA: 0.10
        },
        theatrical: {
            DENSITY: 1.15, ALPHA: 1.4,  GATHER: 0.18, BRIGHTEN: 3.6, R_ATT: 240,
            MIST: 0.68, CLEARING: 1.0, STRUCT: 1.3,
            COMPANIONS: 24, SWARM_R: 80, HALO: 0.15, TRAIL_ALPHA: 0.22
        }
    };
    const presetName = (location.search.match(/field=(\w+)/) || [])[1] || 'signature';
    const P = PRESETS[presetName] || PRESETS.signature;

    const DPR_CAP = 1.5;
    const BREATH_PERIOD = 9.0;

    let W = 0, H = 0;

    // =========================================================================
    // ATTENTION BRAIN (shared by both layers)
    // =========================================================================
    const attention = {
        x: 0.62, y: 0.40,           // fractions of hero
        mode: 'wander',
        seedA: Math.random() * 100,
        seedB: Math.random() * 100
    };
    let mouseFx = null, mouseFy = null;
    let lastMove = -1e9, noticeAt = -1e9;
    let energy = 0.6;

    // Inside the hero, the cursor steps back — the swarm is the protagonist
    const cursorEl = document.querySelector('.cursor');
    hero.addEventListener('mouseenter', () => cursorEl && cursorEl.classList.add('dimmed'));
    hero.addEventListener('mouseleave', () => cursorEl && cursorEl.classList.remove('dimmed'));

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        mouseFx = (e.clientX - rect.left) / Math.max(1, W);
        mouseFy = (e.clientY - rect.top) / Math.max(1, H);
        const now = performance.now();
        // any movement while wandering arms the notice (unless one is
        // already pending) — the 500ms hesitation itself is preserved
        if (attention.mode === 'wander' && noticeAt < now) {
            noticeAt = now + 500;
        }
        lastMove = now;
    });

    function updateAttention(t, now) {
        const wx = 0.62 + 0.28 * Math.sin(t * 0.052 + attention.seedA) * Math.sin(t * 0.031 + 1.7);
        const wy = 0.52 + 0.28 * Math.sin(t * 0.043 + attention.seedB) * Math.cos(t * 0.027 + 0.6);

        if (attention.mode === 'wander') {
            if (mouseFx !== null && now >= noticeAt && noticeAt > 0 && now - lastMove < 2500) {
                attention.mode = 'approach';
            }
            attention.x += (wx - attention.x) * 0.006;
            attention.y += (wy - attention.y) * 0.006;
        } else {
            attention.x += (mouseFx - attention.x) * 0.022;   // underwater lag
            attention.y += (mouseFy - attention.y) * 0.022;
            if (now - lastMove > 3500) {
                attention.mode = 'wander';
                noticeAt = -1e9;
            }
        }
        energy += ((attention.mode === 'approach' ? 1.0 : 0.65) - energy) * 0.02;
    }

    // Derived render state: wander / hesitate / approach / engaged / fading
    let prevMode = 'wander';
    let fadeUntil = -1e9;
    function renderState(now) {
        if (attention.mode !== prevMode) {
            if (prevMode === 'approach') fadeUntil = now + 2000;  // losing interest
            prevMode = attention.mode;
        }
        if (attention.mode === 'approach') {
            const dx = (mouseFx - attention.x) * W;
            const dy = (mouseFy - attention.y) * H;
            return (dx * dx + dy * dy < 60 * 60) ? 'engaged' : 'approach';
        }
        if (noticeAt > 0 && now < noticeAt && now - lastMove < 2500) return 'hesitate';
        if (now < fadeUntil) return 'fading';
        return 'wander';
    }

    // =========================================================================
    // LAYER 1 — WebGL ATMOSPHERE (optional stage)
    // =========================================================================
    const glCanvas = document.createElement('canvas');
    glCanvas.className = 'hero-field';
    glCanvas.setAttribute('aria-hidden', 'true');

    let gl = null;
    try {
        gl = glCanvas.getContext('webgl', {
            alpha: false, antialias: false, depth: false, stencil: false,
            powerPreference: 'low-power'
        });
    } catch (e) { gl = null; }

    const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_lens;
uniform float u_lensEnergy;
uniform vec2  u_aperture;
uniform float u_apertureR;
uniform float u_breath;
uniform float u_px;

const vec3 BASE   = vec3(0.945, 0.958, 0.972);
const vec3 LILAC  = vec3(0.858, 0.800, 1.000);
const vec3 BLUE   = vec3(0.745, 0.890, 1.000);
const vec3 PINK   = vec3(1.000, 0.845, 0.895);
const vec3 VIOLET = vec3(0.795, 0.780, 0.905);
const vec3 MISTC  = vec3(1.000, 0.998, 1.000);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i),                  hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.0, 9.2); a *= 0.5; }
    return v;
}
float gauss(vec2 uv, vec2 c, float r) {
    vec2 d = uv - c;
    d.x *= u_res.x / u_res.y;
    return exp(-dot(d, d) / (r * r));
}

void main() {
    vec2 frag = gl_FragCoord.xy;
    vec2 uv = frag / u_res;
    float t = u_time;

    // --- lens pool: a soft optical mass in the lower-right ---
    // (elliptical, off-center; deepens color, swirls mist, pearl rim)
    vec2 pd = uv - vec2(0.67, 0.40);
    pd.x *= (u_res.x / u_res.y) * 0.62;
    pd.y *= 1.25;
    float pool = exp(-dot(pd, pd) / (0.25 * 0.25));

    // atmosphere: asymmetric silk light + violet depth
    vec3 col = mix(BASE, vec3(0.970, 0.976, 0.992), uv.y);
    col = mix(col, VIOLET, gauss(uv, vec2(0.90 + 0.04 * sin(t * 0.020), 0.84), 0.52) * 0.26);
    col = mix(col, VIOLET, gauss(uv, vec2(0.08, 0.20 + 0.05 * cos(t * 0.017)), 0.48) * 0.21);
    vec2 c1 = vec2(0.74 + 0.06 * sin(t * 0.031), 0.76 + 0.05 * cos(t * 0.023));
    vec2 c2 = vec2(0.20 + 0.05 * sin(t * 0.019 + 2.0), 0.52 + 0.06 * sin(t * 0.027));
    vec2 c3 = vec2(0.32 + 0.05 * cos(t * 0.017), 0.14 + 0.04 * sin(t * 0.021 + 1.2));
    vec2 c4 = vec2(0.82 + 0.05 * sin(t * 0.024 + 4.0), 0.26 + 0.05 * cos(t * 0.015));
    col = mix(col, LILAC, gauss(uv, c1, 0.50) * 0.72);
    col = mix(col, BLUE,  gauss(uv, c2, 0.52) * 0.62);
    col = mix(col, PINK,  gauss(uv, c3, 0.44) * 0.38);
    col = mix(col, BLUE,  gauss(uv, c4, 0.46) * 0.48);
    col = mix(col, vec3(1.0), gauss(uv, vec2(0.70 + 0.03 * sin(t * 0.026), 0.42), 0.28) * 0.50);
    col = mix(col, vec3(1.0), gauss(uv, vec2(0.30, 0.70), 0.36) * 0.22);

    // pool deepens the silk colors into a visible mass
    vec3 deep = mix(vec3(0.72, 0.70, 0.98), vec3(0.66, 0.80, 0.99),
                    0.5 + 0.5 * sin(t * 0.04));
    col = mix(col, deep, pool * 0.35);

    // drifting mist, slowly swirling around the pool
    float asp = u_res.x / u_res.y;
    vec2 p = uv * vec2(asp, 1.0) * 1.9;
    p += vec2(-pd.y, pd.x) * pool * 0.40 * (0.6 + 0.4 * sin(t * 0.02));
    float ts = t * 1.35;
    vec2 q = vec2(fbm(p + ts * vec2(0.042, 0.011)),
                  fbm(p + vec2(5.2, 1.3) - ts * vec2(0.027, 0.016)));
    float m = smoothstep(0.36, 0.72, fbm(p + 1.6 * q + vec2(ts * 0.046, ts * 0.012)));
    m *= 1.0 - pool * 0.18;   // clearer air inside the pool

    // the mist parts where the attention point looks
    float r = distance(frag, u_lens);
    float sigma = 122.0 * u_px;
    float fall = exp(-(r * r) / (2.0 * sigma * sigma));
    float thin = 1.0 - fall * ${P.CLEARING.toFixed(3)} * u_lensEnergy;

    // title aperture: thinning, never a hole
    float da = distance(frag, u_aperture);
    float ap = smoothstep(u_apertureR * 1.9, u_apertureR * 0.45, da);
    thin *= mix(1.0, 0.45, ap * (1.0 - 0.12 * u_breath));

    // volumetric edge shading, then the fog itself
    col = mix(col, VIOLET, m * (1.0 - m) * 4.0 * 0.10 * thin);
    col = mix(col, MISTC, m * (${P.MIST.toFixed(3)} + 0.06 * u_breath) * thin);

    // gentle clarity where attention rests
    col = mix(col, (col - 0.5) * 1.06 + 0.5, fall * 0.7 * u_lensEnergy);

    // pool rim: barely-there pearl breath at the optical edge
    float prim = pool * (1.0 - pool) * 4.0;
    col = mix(col, vec3(1.0), prim * 0.035);
    col += (LILAC - col) * prim * 0.02;

    col = mix(col, BASE, smoothstep(150.0 * u_px, 0.0, frag.y) * 0.6);
    col += (hash(frag + fract(t) * 61.7) - 0.5) * 0.014;
    gl_FragColor = vec4(col, 1.0);
}
`;

    let glOk = false, glU = null, glPX = 1;
    if (gl) {
        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                console.warn('hero-field shader:', gl.getShaderInfoLog(s));
                return null;
            }
            return s;
        };
        const vs = compile(gl.VERTEX_SHADER, 'attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.,1.);}');
        const fs = compile(gl.FRAGMENT_SHADER, FRAG);
        if (vs && fs) {
            const prog = gl.createProgram();
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                gl.useProgram(prog);
                const quad = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, quad);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
                const aPos = gl.getAttribLocation(prog, 'a_pos');
                gl.enableVertexAttribArray(aPos);
                gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
                glU = {};
                ['u_res', 'u_time', 'u_lens', 'u_lensEnergy', 'u_aperture', 'u_apertureR', 'u_breath', 'u_px']
                    .forEach(n => { glU[n] = gl.getUniformLocation(prog, n); });
                glOk = true;
            }
        }
    }

    // =========================================================================
    // LAYER 2 — LUMINOUS MOTES (the interactive body, 2D canvas)
    // =========================================================================
    const mCanvas = document.createElement('canvas');
    mCanvas.className = 'hero-field hero-motes';
    mCanvas.setAttribute('aria-hidden', 'true');
    const mctx = mCanvas.getContext('2d');
    let mPX = 1;

    // Sprites: luminous dust — small bright core + very soft tinted halo.
    // Nothing opaque, nothing dark. Halos are pale so alpha never goes muddy.
    const HALOS = [
        { rgb: [222, 220, 252], w: 0.50 },   // pearl white (faint lilac cast)
        { rgb: [118, 126, 255], w: 0.28 },   // periwinkle (deeper)
        { rgb: [178, 152, 255], w: 0.18 },   // pale lilac (deeper)
        { rgb: [140, 200, 255], w: 0.04 }    // cool cyan highlight (rare)
    ];
    function pickHaloIndex() {
        let r = Math.random();
        for (let i = 0; i < HALOS.length; i++) { if ((r -= HALOS[i].w) <= 0) return i; }
        return 0;
    }
    function makeSprite(rgb) {
        const s = document.createElement('canvas');
        s.width = s.height = 48;
        const c = s.getContext('2d');
        c.translate(24, 24);
        const g = c.createRadialGradient(0, 0, 0, 0, 0, 22);
        g.addColorStop(0.0,  'rgba(255,255,255,0.95)');
        g.addColorStop(0.18, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.62)`);
        g.addColorStop(0.55, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.26)`);
        g.addColorStop(1.0,  `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
        c.fillStyle = g;
        c.fillRect(-24, -24, 48, 48);
        return s;
    }
    // round motes per halo color (streak sprites removed — motion is
    // revealed only by the attention swarm's short trails)
    const SPRITES_ROUND = HALOS.map(h => makeSprite(h.rgb));
    function makeHeroSprite(rgb) {
        const s = document.createElement('canvas');
        s.width = s.height = 48;
        const c = s.getContext('2d');
        const g = c.createRadialGradient(24, 24, 0, 24, 24, 22);
        g.addColorStop(0.0,  'rgba(255,255,255,0.95)');
        g.addColorStop(0.25, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.40)`);
        g.addColorStop(1.0,  `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
        c.fillStyle = g;
        c.fillRect(0, 0, 48, 48);
        return s;
    }
    const HERO_SPRITES = [makeHeroSprite(HALOS[1].rgb), makeHeroSprite(HALOS[2].rgb)];

    let motes = [];

    // The dissolved-lens geometry, shared by the structure layer and the
    // arc-condensed motes: two incomplete, off-center, squashed arc bands.
    function lensArcs(cx, cy, baseR) {
        // Poster layout: the dissolved lens lives in the right negative space
        return [
            { cx: W * 0.68, cy: H * 0.56, r: baseR * 0.34, a0: -0.6, a1: 1.35, squash: 0.92 },
            { cx: W * 0.72, cy: H * 0.62, r: baseR * 0.55, a0: 1.85, a1: 3.35, squash: 0.90 }
        ];
    }
    function arcHome(arcs) {
        const arc = arcs[Math.random() < 0.6 ? 0 : 1];
        const th = arc.a0 + Math.random() * (arc.a1 - arc.a0);
        // gaussian-ish spread across the band width
        const spread = (Math.random() + Math.random() - 1) * arc.r * 0.10;
        const rr = arc.r + spread;
        return {
            x: arc.cx + Math.cos(th) * rr,
            y: arc.cy + Math.sin(th) * rr * arc.squash
        };
    }

    function nearTitle(x, y) {
        const dx = x - apertureCss.x, dy = y - apertureCss.y;
        const rq = apertureCss.r * 1.25;
        return dx * dx + dy * dy < rq * rq;
    }

    function addMote(hx, hy, layer, alphaScale) {
        let size, alpha;
        if (layer === 0)      { size = 1 + Math.random() * 1.2; alpha = 0.10 + Math.random() * 0.10; }
        else if (layer === 1) { size = 3 + Math.random() * 3.5; alpha = 0.32 + Math.random() * 0.28; }
        else                  { size = 5 + Math.random() * 3;   alpha = 0.13 + Math.random() * 0.12; }
        motes.push({
            hx, hy, layer, size,
            alpha: alpha * alphaScale * P.ALPHA,
            sprite: SPRITES_ROUND[pickHaloIndex()],
            hero: false,
            p1: Math.random() * Math.PI * 2,
            p2: Math.random() * Math.PI * 2,
            s1: (0.06 + Math.random() * 0.14) * (layer === 2 ? 0.5 : 1),
            s2: (0.05 + Math.random() * 0.11) * (layer === 2 ? 0.5 : 1),
            amp: (10 + Math.random() * 18) * (layer === 0 ? 0.7 : 1)
        });
    }

    function populate() {
        motes = [];
        const areaScale = Math.min(1, (W * H) / (1440 * 800)) * P.DENSITY;
        const cx = W / 2, cy = H / 2;
        const baseR = Math.min(W, H);
        const arcs = lensArcs(cx, cy, baseR);

        // 1) far grain: extremely faint fine texture, everywhere but the title
        for (let i = 0; i < Math.round(190 * areaScale); i++) {
            const x = Math.random() * W, y = Math.random() * H;
            if (nearTitle(x, y)) continue;
            addMote(x, y, 0, 1);
        }
        // 2) arc condensation: motes gather inside the dissolved-lens bands
        for (let i = 0; i < Math.round(205 * areaScale); i++) {
            const h = arcHome(arcs);
            if (nearTitle(h.x, h.y)) continue;
            addMote(h.x, h.y, 1, 0.95);
        }
        // 3) the attention's usual path: slightly denser wandering territory
        for (let i = 0; i < Math.round(75 * areaScale); i++) {
            const x = W * (0.62 + (Math.random() + Math.random() - 1) * 0.30);
            const y = H * (0.52 + (Math.random() + Math.random() - 1) * 0.28);
            if (nearTitle(x, y)) continue;
            addMote(x, y, 1, 0.9);
        }
        // 4) open areas: sparse readable motes only
        for (let i = 0; i < Math.round(70 * areaScale); i++) {
            const x = Math.random() * W, y = Math.random() * H;
            if (nearTitle(x, y)) continue;
            addMote(x, y, 1, 1);
        }
        // 5) foreground: very rare pearl motes
        for (let i = 0; i < Math.round(12 * areaScale); i++) {
            const x = Math.random() * W, y = Math.random() * H;
            if (nearTitle(x, y)) continue;
            addMote(x, y, 2, 1);
        }

        // hero motes: rare and delicate — small white core, soft halo
        for (let i = 0; i < 7; i++) {
            const h = arcHome(arcs);
            motes.push({
                hx: h.x, hy: h.y, layer: 1,
                size: 4 + Math.random() * 3,
                alpha: (0.45 + Math.random() * 0.2) * P.ALPHA,
                sprite: HERO_SPRITES[i % HERO_SPRITES.length],
                hero: true,
                p1: Math.random() * Math.PI * 2,
                p2: Math.random() * Math.PI * 2,
                s1: 0.08 + Math.random() * 0.1,
                s2: 0.06 + Math.random() * 0.09,
                amp: 12 + Math.random() * 14
            });
        }
    }

    // --- Structure layer: pre-rendered dissolved lens ------------------------
    // Painted small and upscaled (free softness, no canvas filter needed):
    // two broad translucent arc bands + one diagonal pearl cloud band.
    let structCanvas = null;
    const STRUCT_SCALE = 0.35;
    function buildStructure() {
        structCanvas = document.createElement('canvas');
        const sw = Math.max(2, Math.round(W * STRUCT_SCALE));
        const sh = Math.max(2, Math.round(H * STRUCT_SCALE));
        structCanvas.width = sw;
        structCanvas.height = sh;
        const c = structCanvas.getContext('2d');
        const k = STRUCT_SCALE;
        const arcs = lensArcs(W / 2, H / 2, Math.min(W, H));

        // arc bands: layered wide strokes fake a soft blur
        arcs.forEach((arc, idx) => {
            const band = (idx === 0 ? 95 : 125) * k;
            const tint = idx === 0 ? '196,186,255' : '182,204,255';
            for (let pass = 0; pass < 6; pass++) {
                c.strokeStyle = `rgba(${tint},${(0.024 * P.STRUCT).toFixed(4)})`;
                c.lineWidth = band * (1 - pass * 0.13);
                c.beginPath();
                c.save();
                c.translate(arc.cx * k, arc.cy * k);
                c.scale(1, arc.squash);
                c.arc(0, 0, arc.r * k, arc.a0, arc.a1);
                c.restore();
                c.stroke();
            }
        });

        // diagonal pearl cloud band (right-center toward lower-right)
        const g = c.createLinearGradient(0, sh, sw * 0.7, sh * 0.2);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.5, `rgba(240,238,255,${(0.09 * P.STRUCT).toFixed(3)})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g;
        c.save();
        c.translate(sw * 0.64, sh * 0.60);
        c.rotate(-0.5);
        c.fillRect(-sw * 0.8, -sh * 0.20, sw * 1.6, sh * 0.40);
        c.restore();
    }

    // --- The attention swarm: a soft condensation that IS the visible body ---
    // Loose spring-followers with varied stiffness; the center stays empty.
    let companions = [];
    function initCompanions() {
        companions = [];
        for (let i = 0; i < P.COMPANIONS; i++) {
            const bright = i < 4;   // a few brighter motes, visible when engaged
            companions.push({
                x: attention.x * W, y: attention.y * H,
                vx: 0, vy: 0,
                k: 0.012 + Math.random() * 0.03,      // varied spring stiffness
                damp: 0.86 + Math.random() * 0.06,
                seedA: Math.random() * Math.PI * 2,
                seedB: Math.random() * Math.PI * 2,
                sA: 0.15 + Math.random() * 0.3,        // offset wander speeds
                sB: 0.12 + Math.random() * 0.25,
                rBase: 0.35 + Math.random() * 0.65,    // fraction of swarm radius
                size: bright ? 4 + Math.random() * 2.5 : 2.5 + Math.random() * 2.5,
                alpha: bright ? 0.52 : 0.27 + Math.random() * 0.17,
                sprite: bright
                    ? HERO_SPRITES[i % HERO_SPRITES.length]
                    : SPRITES_ROUND[pickHaloIndex()],
                bright,
                px: 0, py: 0
            });
        }
    }

    // =========================================================================
    // SIZING
    // =========================================================================
    // Title letters: cached centers so the attention can pass across them
    let letters = [];
    function cacheLetters() {
        letters = [];
        const hr = hero.getBoundingClientRect();
        document.querySelectorAll('.brand-name .bl').forEach(el => {
            const r = el.getBoundingClientRect();
            letters.push({
                el,
                cx: r.left - hr.left + r.width / 2,
                cy: r.top - hr.top + r.height / 2,
                b: 0, clean: true
            });
        });
    }

    const apertureCss = { x: 0, y: 0, r: 220 };
    function measureAperture() {
        const nw = document.querySelector('.name-wrapper');
        if (!nw) return;
        const hr = hero.getBoundingClientRect();
        const r = nw.getBoundingClientRect();
        apertureCss.x = r.left - hr.left + r.width / 2;
        apertureCss.y = r.top - hr.top + r.height / 2;
        // name block is now wide and rectangular — quiet zone follows its
        // height so the field's right territory stays alive
        apertureCss.r = r.height * 0.72;
    }

    function resize() {
        W = hero.clientWidth;
        H = hero.clientHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
        if (glOk) {
            glPX = dpr * 0.75;
            glCanvas.width = Math.max(2, Math.round(W * glPX));
            glCanvas.height = Math.max(2, Math.round(H * glPX));
            glCanvas.style.width = W + 'px';
            glCanvas.style.height = H + 'px';
            gl.viewport(0, 0, glCanvas.width, glCanvas.height);
        }
        mPX = dpr;
        mCanvas.width = Math.max(2, Math.round(W * mPX));
        mCanvas.height = Math.max(2, Math.round(H * mPX));
        mCanvas.style.width = W + 'px';
        mCanvas.style.height = H + 'px';
        mctx.setTransform(mPX, 0, 0, mPX, 0, 0);
        measureAperture();
        cacheLetters();
        populate();
        initCompanions();
        buildStructure();
    }
    // re-measure once the display font has actually loaded
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { measureAperture(); cacheLetters(); });
    }

    // =========================================================================
    // RENDER LOOP
    // =========================================================================
    let running = true, rafId = null, firstFrameOk = false;
    let frames = 0, lastFpsT = 0;
    let swarmTight = 1.0, haloA = 0;
    const debug = /fielddebug/.test(location.search);
    let fpsEl = null;
    if (debug) {
        fpsEl = document.createElement('div');
        fpsEl.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:99999;' +
            'font:12px monospace;background:#0008;color:#fff;padding:4px 8px;border-radius:4px;';
        document.body.appendChild(fpsEl);
    }

    function frame(nowMs) {
        if (!running) { rafId = null; return; }
        const t = nowMs * 0.001;

        updateAttention(t, nowMs);
        const ax = attention.x * W;
        const ay = attention.y * H;
        const breath = Math.sin(t * Math.PI * 2 / BREATH_PERIOD);

        // --- atmosphere pass ---
        if (glOk) {
            gl.uniform2f(glU.u_res, glCanvas.width, glCanvas.height);
            gl.uniform1f(glU.u_time, t);
            gl.uniform1f(glU.u_px, glPX);
            gl.uniform2f(glU.u_lens, ax * glPX, (H - ay) * glPX);
            gl.uniform1f(glU.u_lensEnergy, energy);
            gl.uniform2f(glU.u_aperture, apertureCss.x * glPX, (H - apertureCss.y) * glPX);
            gl.uniform1f(glU.u_apertureR, apertureCss.r * glPX);
            gl.uniform1f(glU.u_breath, breath);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        // --- motes pass ---
        mctx.clearRect(0, 0, W, H);
        const globalBreath = 0.86 + 0.14 * breath;
        const R = P.R_ATT, R2 = R * R;

        // dissolved-lens structure: slow drift + breathing
        if (structCanvas) {
            mctx.globalAlpha = 0.8 + 0.2 * breath;
            mctx.drawImage(structCanvas,
                6 * Math.sin(t * 0.05), 4 * Math.cos(t * 0.041), W, H);
            mctx.globalAlpha = 1;
        }

        // Derived state drives the attention body's look
        const state = renderState(nowMs);
        let tTight, tHalo, trailsOn;
        if (state === 'engaged')       { tTight = 0.62; tHalo = P.HALO;        trailsOn = true; }
        else if (state === 'approach') { tTight = 0.90; tHalo = P.HALO * 0.9;  trailsOn = true; }
        else if (state === 'hesitate') { tTight = 1.00; tHalo = P.HALO * 0.8;  trailsOn = false; }
        else if (state === 'fading')   { tTight = 1.25; tHalo = P.HALO * 0.5;  trailsOn = true; }
        else                           { tTight = 1.00; tHalo = P.HALO * 0.55; trailsOn = false; }
        swarmTight += (tTight - swarmTight) * 0.06;
        haloA += (tHalo - haloA) * 0.05;

        // hesitation: one subtle inhale during the 500ms pause
        let pulse = 0;
        if (state === 'hesitate') {
            const ph = Math.min(1, Math.max(0, 1 - (noticeAt - nowMs) / 500));
            pulse = Math.sin(ph * Math.PI);
        }
        const tight = swarmTight * (1 - 0.20 * pulse);
        const haloNow = haloA * (1 + 0.9 * pulse);

        // condensation halo — breath on glass, drawn beneath everything
        const haloR = 120 * (0.9 + 0.1 * breath);
        const hg = mctx.createRadialGradient(ax, ay, 0, ax, ay, haloR);
        hg.addColorStop(0, `rgba(255,255,255,${haloNow.toFixed(3)})`);
        hg.addColorStop(0.55, `rgba(226,220,255,${(haloNow * 0.5).toFixed(3)})`);
        hg.addColorStop(1, 'rgba(226,220,255,0)');
        mctx.fillStyle = hg;
        mctx.fillRect(ax - haloR, ay - haloR, haloR * 2, haloR * 2);

        for (let i = 0; i < motes.length; i++) {
            const p = motes[i];
            let x = p.hx + Math.sin(t * p.s1 + p.p1) * p.amp;
            let y = p.hy + Math.cos(t * p.s2 + p.p2) * p.amp * 0.8;

            const dx = ax - x, dy = ay - y;
            const d2 = dx * dx + dy * dy;
            let a = p.alpha * globalBreath;
            let sz = p.size;
            if (d2 < R2) {
                const f = 1 - Math.sqrt(d2) / R;
                x += dx * f * P.GATHER;             // gather toward the attention
                y += dy * f * P.GATHER;
                const boost = p.hero ? P.BRIGHTEN * 1.4 : P.BRIGHTEN;
                a = Math.min(0.95, a * (1 + f * boost * energy));
                sz *= 1 + f * 0.5;
            }

            mctx.globalAlpha = a;
            mctx.drawImage(p.sprite, x - sz / 2, y - sz / 2, sz, sz);
        }

        // --- the attention swarm: soft condensation, empty center ---
        const glowLvl = state === 'engaged' ? 1 : (state === 'approach' ? 0.6 : 0.35);
        for (let i = 0; i < companions.length; i++) {
            const c = companions[i];
            // each offset target wanders inside the swarm disc — no hard orbit
            const offR = P.SWARM_R * tight * c.rBase * (0.85 + 0.3 * Math.sin(t * c.sA + c.seedA));
            const offA = c.seedB + t * c.sB * 0.6 + Math.sin(t * c.sA * 0.7 + c.seedA) * 1.2;
            const txp = ax + Math.cos(offA) * offR;
            const typ = ay + Math.sin(offA) * offR * 0.9;
            c.px = c.x; c.py = c.y;
            c.vx = (c.vx + (txp - c.x) * c.k) * c.damp;
            c.vy = (c.vy + (typ - c.y) * c.k) * c.damp;
            c.x += c.vx; c.y += c.vy;

            // delicate direction-revealing trail (approach/engaged/fading only)
            if (trailsOn) {
                const sp = Math.hypot(c.x - c.px, c.y - c.py);
                if (sp > 1.2) {
                    mctx.globalAlpha = Math.min(1, sp / 8) * P.TRAIL_ALPHA;
                    mctx.strokeStyle = 'rgba(190,180,255,1)';
                    mctx.lineWidth = 1;
                    mctx.beginPath();
                    mctx.moveTo(c.px, c.py);
                    mctx.lineTo(c.x, c.y);
                    mctx.stroke();
                }
            }

            let a = c.alpha * globalBreath * (c.bright ? glowLvl + 0.25 : 1);
            if (state === 'wander' || state === 'fading') a *= 0.75;
            mctx.globalAlpha = Math.min(0.9, a);
            const sz = c.size * (c.bright && state === 'engaged' ? 1.35 : 1);
            mctx.drawImage(c.sprite, c.x - sz / 2, c.y - sz / 2, sz, sz);
        }
        mctx.globalAlpha = 1;

        // --- title letters: light passes across the carved name ---
        const RT = 260, RT2 = RT * RT;
        for (let i = 0; i < letters.length; i++) {
            const L = letters[i];
            const dx = ax - L.cx, dy = ay - L.cy;
            const d2 = dx * dx + dy * dy;
            const target = d2 < RT2 ? (1 - Math.sqrt(d2) / RT) * energy : 0;
            L.b += (target - L.b) * 0.08;
            if (L.b > 0.005) {
                L.el.style.filter = `brightness(${(1 + L.b * 0.08).toFixed(4)})`;
                L.el.style.transform = `translateY(${(-2 * L.b).toFixed(2)}px)`;
                L.clean = false;
            } else if (!L.clean) {
                L.el.style.filter = '';
                L.el.style.transform = '';
                L.clean = true;
            }
        }

        if (!firstFrameOk) {
            if (!glOk || gl.getError() === gl.NO_ERROR) {
                firstFrameOk = true;
                document.body.classList.add('field-active');
                // the field is alive (defocused) beneath the loader veil
                glCanvas.classList.add('underveil');
                mCanvas.classList.add('underveil');
                revealWhenReady();
            }
        }

        if (debug) {
            frames++;
            if (nowMs - lastFpsT > 1000) {
                fpsEl.textContent = `field ${frames}fps · ${presetName} · ` +
                    `${motes.length} motes · gl:${glOk} · ${renderState(nowMs)}`;
                frames = 0; lastFpsT = nowMs;
            }
        }
        rafId = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            running = entry.isIntersecting && !document.hidden;
            if (running && rafId === null) rafId = requestAnimationFrame(frame);
        });
    }, { threshold: 0 });
    io.observe(hero);
    document.addEventListener('visibilitychange', () => {
        running = !document.hidden;
        if (running && rafId === null) rafId = requestAnimationFrame(frame);
    });

    glCanvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        glOk = false;
        glCanvas.remove();   // motes keep running over the CSS aurora
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 200);
    });

    function revealWhenReady() {
        const ls = document.querySelector('.loading-screen');
        const gone = !ls || ls.classList.contains('hidden') ||
                     getComputedStyle(ls).display === 'none';
        if (gone) {
            // focus pull: veil lifts while the field sharpens
            setTimeout(() => {
                glCanvas.classList.remove('underveil');
                mCanvas.classList.remove('underveil');
                glCanvas.classList.add('visible');
                mCanvas.classList.add('visible');
            }, 100);
        } else {
            setTimeout(revealWhenReady, 150);
        }
    }

    // --- Go -------------------------------------------------------------------
    const spot = hero.querySelector('.hero-spotlight');
    if (glOk) hero.insertBefore(glCanvas, spot);
    hero.insertBefore(mCanvas, spot);
    resize();
    rafId = requestAnimationFrame(frame);
})();
