// 1. LOADER: focus pull (first visit per session only, skippable)
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');

    const aurora = document.querySelector('.aurora-container');
    const header = document.querySelector('header');
    const nameWrapper = document.querySelector('.name-wrapper');
    const titleContainer = document.querySelector('.title-container');
    const heroFooter = document.querySelector('.hero-footer');
    const heroRings = document.querySelector('.hero-rings-container');

    const hasHash = window.location.hash && window.location.hash !== '#welcome';
    let alreadyVisited = false;
    try { alreadyVisited = sessionStorage.getItem('gz-visited') === '1'; } catch (e) {}

    // Skip entirely for return visits (this session), deep links, or reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (hasHash || alreadyVisited || prefersReducedMotion) {
        document.body.classList.add('membrane-skip-intro');
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (aurora) aurora.style.opacity = '1';
        if (heroRings) heroRings.classList.add('visible');
        if (nameWrapper) nameWrapper.classList.add('visible');
        if (header) header.classList.add('visible');
        if (titleContainer) titleContainer.classList.add('visible');
        if (heroFooter) heroFooter.style.opacity = '1';

        if (hasHash) {
            setTimeout(() => {
                const targetElement = document.getElementById(window.location.hash.substring(1));
                if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
        return;
    }
    try { sessionStorage.setItem('gz-visited', '1'); } catch (e) {}

    let finished = false;
    function finishIntro() {
        if (finished) return;
        finished = true;
        document.removeEventListener('keydown', finishIntro);
        if (loadingScreen) loadingScreen.classList.add('hidden');
        setTimeout(() => { if (aurora) aurora.style.opacity = '1'; }, 200);
        setTimeout(() => { if (heroRings) heroRings.classList.add('visible'); }, 350);
        setTimeout(() => {
            if (nameWrapper) nameWrapper.classList.add('visible');
            if (header) header.classList.add('visible');
        }, 550);
        setTimeout(() => { if (titleContainer) titleContainer.classList.add('visible'); }, 750);
        setTimeout(() => { if (heroFooter) heroFooter.style.opacity = '1'; }, 900);
    }

    // Skippable: click anywhere or press any key
    if (loadingScreen) loadingScreen.addEventListener('click', finishIntro);
    document.addEventListener('keydown', finishIntro);

    // Focus pull: hold the defocused world long enough to register
    // (~1.5s with the line), then the sharpening becomes the reveal
    const loaderLine = document.querySelector('.loader-line');
    setTimeout(() => { if (loaderLine) loaderLine.classList.add('show'); }, 300);
    setTimeout(finishIntro, 1600);
});

// 2. PARALLAX FOR RING LAYERS (Enhanced with Perspective & Subtle Rotation)
const groupPrimary = document.querySelector('.ring-group-primary');
const groupSecondary = document.querySelector('.ring-group-secondary');
let mouseX = 0, mouseY = 0;
let currentX = 0, currentY = 0;
let currentRotateX = 0, currentRotateY = 0;
let isHeroVisible = true; // Performance flag
let parallaxRAF = null;

// Pause parallax AND aurora when hero is scrolled out of view
const heroSection = document.querySelector('#welcome');
const auroraContainer = document.querySelector('.aurora-container');
if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isHeroVisible = entry.isIntersecting;
            // Header dissolves into the poster while the hero is on screen
            const headerEl = document.querySelector('header');
            if (headerEl) {
                headerEl.classList.toggle('in-hero', entry.isIntersecting);
                const logo = headerEl.querySelector('.logo');
                if (logo) logo.tabIndex = entry.isIntersecting ? -1 : 0;
            }
            // Resume parallax loop when hero becomes visible again
            if ((groupPrimary || groupSecondary) && isHeroVisible && !parallaxRAF) {
                parallaxRAF = requestAnimationFrame(animateParallax);
            }
            // Pause/resume aurora CSS animations (aurora is position:fixed, can't observe it directly)
            if (auroraContainer) {
                const layers = auroraContainer.querySelectorAll('.aurora-layer');
                layers.forEach(layer => {
                    layer.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
                });
            }
        });
    }, { threshold: 0 });
    heroObserver.observe(heroSection);
}

document.addEventListener('mousemove', (e) => {
    // Only track parallax mouse data when hero is visible
    if (!isHeroVisible || (!groupPrimary && !groupSecondary)) return;
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
});

function animateParallax() {
    // Respect user motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Rings are hidden while the observation field is live — skip their loop
    if (document.body.classList.contains('field-active')) { parallaxRAF = null; return; }

    // Stop the loop entirely when hero is not visible (saves CPU)
    if (!isHeroVisible) {
        parallaxRAF = null;
        return; // Don't schedule next frame
    }

    // Smooth LERP - more responsive
    currentX += (mouseX - currentX) * 0.18;
    currentY += (mouseY - currentY) * 0.18;
    currentRotateX += (mouseY * 1.2 - currentRotateX) * 0.1;
    currentRotateY += (mouseX * -1.2 - currentRotateY) * 0.1;

    // Time-based gentle rotation
    const time = performance.now() * 0.001;
    const primaryRotateZ = time * 1.5;
    const secondaryRotateZ = time * 0.5; 

    // Group 1: Primary (Faster/Closer)
    if (groupPrimary) {
        const moveX = currentX * -45;
        const moveY = currentY * -45;
        const rotX = currentRotateX * 1.0;
        const rotY = currentRotateY * 1.0;
        groupPrimary.style.transform = `perspective(1000px) translate3d(${moveX}px, ${moveY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${primaryRotateZ}deg)`;
    }

    // Group 2: Secondary (Slower/Farther)
    if (groupSecondary) {
        const moveX = currentX * -20;
        const moveY = currentY * -20;
        const rotX = currentRotateX * 0.5;
        const rotY = currentRotateY * 0.5;
        groupSecondary.style.transform = `perspective(1000px) translate3d(${moveX}px, ${moveY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${secondaryRotateZ}deg)`;
    }

    parallaxRAF = requestAnimationFrame(animateParallax);
}
if (groupPrimary || groupSecondary) parallaxRAF = requestAnimationFrame(animateParallax);


// 3. WHISPERS
document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('.whisper');
    if (!el) return;

    const lines = [
        'A gentle selection of recent projects',
        'Glad you\'re here',
        'Experiments with steady intention',
        'Please enjoy :)'
    ];
    let i = 0;

    // Initial fade-in
    setTimeout(() => {
        el.classList.add('fade-in');
    }, 100);
    
    // Start switching after initial fade-in
    setTimeout(() => {
        setInterval(() => {
            // Fade out (like slide transition)
            el.classList.remove('fade-in');
            el.classList.add('fade-out');
            
            setTimeout(() => {
                // Change text while invisible
                i = (i + 1) % lines.length;
                el.textContent = lines[i];
                
                // Fade in (like slide transition)
                el.classList.remove('fade-out');
                el.classList.add('fade-in');
            }, 510); // Wait for fade-out transition to complete (faster by ~15%)
        }, 4000); 
    }, 800); // Wait for initial fade-in
});

// 4. MODE SYSTEM (Projects / Art / Research)
const modeSection = document.getElementById('projects');
const modeTitle = document.getElementById('mode-title');
const modeSublabel = document.getElementById('mode-sublabel');

const MODE_INFO = {
    projects: { title: 'Featured', sub: 'MODE 01 — EVIDENCE' },
    art:      { title: 'Experiments', sub: 'MODE 02 — DREAMING' },
    research: { title: 'Field Notes', sub: 'MODE 03 — AN ARCHIVE IN DEVELOPMENT' }
};
let currentMode = 'projects';
let modeSwitching = false;

function moveModeUnderline(mode) {
    const underline = document.querySelector('.mode-underline');
    if (!underline) return;
    const btn = document.querySelector(`.mode-tab[data-mode="${mode}"]`);
    if (btn) {
        underline.style.width = `${btn.offsetWidth}px`;
        underline.style.left = `${btn.offsetLeft}px`;
        underline.style.opacity = '1';
    } else {
        // Research has no in-section tab — hide the underline
        underline.style.opacity = '0';
    }
}

function setMode(mode, instant = false) {
    if (!MODE_INFO[mode] || mode === currentMode || modeSwitching) return;
    const oldPanel = document.getElementById('panel-' + currentMode);
    const newPanel = document.getElementById('panel-' + mode);
    if (!oldPanel || !newPanel) return;
    currentMode = mode;

    document.querySelectorAll('.mode-tab').forEach(t => {
        const active = t.dataset.mode === mode;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active);
    });
    moveModeUnderline(mode);
    if (modeSection) modeSection.dataset.mode = mode;
    if (modeTitle) modeTitle.textContent = MODE_INFO[mode].title;
    if (modeSublabel) modeSublabel.textContent = MODE_INFO[mode].sub;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (instant || reduced) {
        oldPanel.hidden = true;
        newPanel.hidden = false;
        return;
    }

    // Exhale the current panel, then condense the next one in
    modeSwitching = true;
    oldPanel.classList.add('exhale');
    setTimeout(() => {
        oldPanel.classList.remove('exhale');
        oldPanel.hidden = true;
        newPanel.classList.add('condense-start');
        newPanel.hidden = false;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                newPanel.classList.remove('condense-start');
                newPanel.classList.add('condense');
                setTimeout(() => {
                    newPanel.classList.remove('condense');
                    modeSwitching = false;
                }, 480);
            });
        });
    }, 320);
}

document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        if (mode === currentMode) return;
        setMode(mode);
        history.replaceState(null, '', '#' + mode);
    });
});

// Deep links and navigation activate the original three work modes.
function applyHashMode(scroll) {
    const h = window.location.hash.replace('#', '');
    if (h !== 'projects' && h !== 'art' && h !== 'research') return;
    setMode(h, true);
    const targetSection = modeSection;
    if (scroll && targetSection) targetSection.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
window.addEventListener('hashchange', () => applyHashMode(true));
document.addEventListener('DOMContentLoaded', () => {
    applyHashMode(true);
    moveModeUnderline(currentMode);
});

// 6. TIME UPDATE
function updateTime() {
    const now = new Date();
    const timeDisplay = document.getElementById('time-display');
    if(timeDisplay) {
        const options = { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false };
        timeDisplay.textContent = now.toLocaleTimeString('en-US', options) + " EST";
    }
    const heroTime = document.getElementById('hero-time');
    if (heroTime) {
        heroTime.textContent = now.toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
    }
}
setInterval(updateTime, 1000);
updateTime();

// 7. MOBILE NAV
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    const closeMenu = () => {
        hamburger.classList.remove('active'); navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    };
    hamburger.addEventListener('click', () => {
        const open = hamburger.classList.toggle('active');
        navLinks.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && hamburger.classList.contains('active')) { closeMenu(); hamburger.focus(); } });
}

// 8. EVIDENCE CONDENSATION WIPE
// The pearl veil over each project image clears around the cursor.
document.querySelectorAll('#panel-projects .project-card').forEach(card => {
    const img = card.querySelector('.project-img-container');
    if (!img) return;
    card.addEventListener('pointermove', (e) => {
        const r = img.getBoundingClientRect();
        if (!r.width) return;
        img.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%');
        img.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%');
    });
});

// 9. TITLE GRADIENT CONTINUITY
// The name is split into per-letter spans; each span carries the same
// gradient, offset so the letters reassemble one continuous sweep.
function syncTitleGradient() {
    document.querySelectorAll('.brand-name').forEach(h1 => {
        const w = h1.offsetWidth;
        if (!w) return;
        h1.querySelectorAll('.bl').forEach(sp => {
            sp.style.backgroundSize = w + 'px 100%';
            sp.style.backgroundPosition = (h1.offsetLeft - sp.offsetLeft) + 'px 0';
        });
    });
}
if (document.querySelector('.brand-name .bl')) {
    syncTitleGradient();
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(syncTitleGradient);
    }
    let tgTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(tgTimer);
        tgTimer = setTimeout(syncTitleGradient, 200);
    });
}
