// 1. SYSTEM WAKE UP (Boot Sequence)
document.addEventListener('DOMContentLoaded', () => {
    const loaderText = document.querySelector('.loader-text');
    const loaderSub = document.querySelector('.loader-sub-text');
    const loadingScreen = document.querySelector('.loading-screen');
    
    const aurora = document.querySelector('.aurora-container');
    const header = document.querySelector('header');
    const nameWrapper = document.querySelector('.name-wrapper');
    const titleContainer = document.querySelector('.title-container');
    const heroFooter = document.querySelector('.hero-footer');
    const heroRings = document.querySelector('.hero-rings-container');
    
    // Check if URL has a hash (e.g., #projects) - skip animation if so
    const hasHash = window.location.hash && window.location.hash !== '#welcome';
    
    if (hasHash) {
        // Skip animation, show content immediately
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (aurora) aurora.style.opacity = '1';
        if (heroRings) heroRings.classList.add('visible');
        if (nameWrapper) nameWrapper.classList.add('visible');
        if (header) header.classList.add('visible');
        if (titleContainer) titleContainer.classList.add('visible');
        if (heroFooter) heroFooter.style.opacity = '1';
        
        // Scroll to hash after a brief delay to ensure content is rendered
        setTimeout(() => {
            const targetId = window.location.hash.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
        return; // Exit early, don't run animation
    }
    
    // Typewriter Helper
    const typeText = (text, element, speed = 40, callback) => {
        if (!element) return;
        element.textContent = "";
        let i = 0;
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                if (callback) setTimeout(callback, 300);
            }
        }
        type();
    };

    // Progress bar element
    const bootLine = document.querySelector('.boot-line');
    
    // Update progress bar instantly
    const updateProgress = (percent) => {
        if (bootLine) {
            bootLine.style.width = percent + '%';
        }
    };
    
    // Animate progress bar over time (synchronized with typing)
    const animateProgress = (fromPercent, toPercent, duration) => {
        if (!bootLine) return;
        const startTime = Date.now();
        const startPercent = fromPercent;
        const diff = toPercent - fromPercent;
        
        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentPercent = startPercent + (diff * progress);
            bootLine.style.width = currentPercent + '%';
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                bootLine.style.width = toPercent + '%';
            }
        }
        update();
    };

    // SEQUENCE: SYSTEM BOOT
    setTimeout(() => {
        if(loaderSub) loaderSub.textContent = "SYSTEM_WAKE";
        
        // Step 1: INITIALIZING (0-25%)
        updateProgress(0);
        const initDuration = "INITIALIZING...".length * 20; // ~260ms
        animateProgress(0, 25, initDuration);
        typeText("INITIALIZING...", loaderText, 20, () => {
            
            // Step 2-3: Continuous progress 25-85% while typing ALIGNING ORBIT and ready
            // Start continuous animation immediately
            const continuousDuration = 800; // Total time for 25-85% (60% of progress)
            animateProgress(25, 85, continuousDuration);
            
            // Trigger scan effect at the start of continuous progress
            const bootScan = document.querySelector('.boot-scan');
            if (bootScan) {
                bootScan.style.animation = 'scanOnce 0.6s ease-out';
            }
            
            // Step 2: ALIGNING ORBIT (text appears during continuous progress)
            setTimeout(() => {
                typeText("ALIGNING ORBIT...", loaderText, 20, () => {
                    
                    // Step 3: ready (text appears during continuous progress)
                    setTimeout(() => {
                        typeText("ready.", loaderText, 20, () => {
                            
                            // Step 4: WELCOME (85-100%)
                            setTimeout(() => {
                                if(loaderSub) loaderSub.textContent = "GLORIA ZHU // INTERACTION DESIGNER";
                                const welcomeDuration = "WELCOME :)".length * 25; // ~225ms
                                animateProgress(85, 100, welcomeDuration);
                                typeText("WELCOME :)", loaderText, 25, () => {
                                    // Remove unstable blinking, make stable
                                    if(loaderText) {
                                        loaderText.classList.add('stable');
                                    }
                                    
                                    const loaderTextContainer = document.querySelector('.loader-text-container');
                                    
                                    // Wait 120ms, then brighten progress bar
                                    setTimeout(() => {
                                        if (bootLine) {
                                            bootLine.classList.add('brighten');
                                            
                                            // After brighten, fade out entire text container and move sub-text up (200-260ms, using 230ms)
                                            setTimeout(() => {
                                                if(loaderTextContainer) {
                                                    loaderTextContainer.classList.add('fade-out');
                                                    
                                                    // Simultaneously move sub-text up
                                                    const loaderSubText = document.querySelector('.loader-sub-text');
                                                    if(loaderSubText) {
                                                        loaderSubText.classList.add('move-up');
                                                    }
                                                    
                                                    // Then continue with existing fade in/out
                                                    setTimeout(finishIntro, 500);
                                                }
                                            }, 230);
                                        }
                                    }, 120);
                                });
                            }, 250);
                        });
                    }, 250);
                });
            }, 250);
        });
    }, 400); // Initial delay

    function finishIntro() {
        if(loadingScreen) loadingScreen.classList.add('hidden');
        
        // Reveal Aurora (The Self) - Slight delay for drama
        setTimeout(() => {
            if (aurora) aurora.style.opacity = '1';
        }, 300);
        
        // Reveal Rings (The Interface)
        setTimeout(() => {
            if (heroRings) heroRings.classList.add('visible');
        }, 500);
        
        // Reveal Text Content
        setTimeout(() => {
            if(nameWrapper) nameWrapper.classList.add('visible');
            if(header) header.classList.add('visible');
        }, 800);

        setTimeout(() => {
            if(titleContainer) titleContainer.classList.add('visible');
        }, 1100);
        
        setTimeout(() => {
            if(heroFooter) heroFooter.style.opacity = '1';
        }, 1300);
    }
});

// 2. PARALLAX FOR RING LAYERS (Enhanced with Perspective & Subtle Rotation)
const groupPrimary = document.querySelector('.ring-group-primary');
const groupSecondary = document.querySelector('.ring-group-secondary');
let mouseX = 0, mouseY = 0;
let currentX = 0, currentY = 0;
let currentRotateX = 0, currentRotateY = 0;

document.addEventListener('mousemove', (e) => {
    // Center point is 0,0. Range is -0.5 to 0.5
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);

    // Custom Cursor
    const cursor = document.querySelector('.cursor');
    if(cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});

function animateParallax() {
    // Respect user motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Smooth LERP - more responsive
    currentX += (mouseX - currentX) * 0.18;
    currentY += (mouseY - currentY) * 0.18;
    currentRotateX += (mouseY * 1.2 - currentRotateX) * 0.1;
    currentRotateY += (mouseX * -1.2 - currentRotateY) * 0.1;

    // Time-based gentle rotation
    const time = performance.now() * 0.001;
    const primaryRotateZ = time * 1.5; // Slightly faster for more life
    const secondaryRotateZ = time * 0.5; 

    // Group 1: Primary (Faster/Closer) - More movement and subtle rotation
    if (groupPrimary) {
        const moveX = currentX * -45;
        const moveY = currentY * -45;
        const rotX = currentRotateX * 1.0;
        const rotY = currentRotateY * 1.0;
        groupPrimary.style.transform = `perspective(1000px) translate3d(${moveX}px, ${moveY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${primaryRotateZ}deg)`;
    }

    // Group 2: Secondary (Slower/Farther) - Less movement, lighter rotation
    if (groupSecondary) {
        const moveX = currentX * -20;
        const moveY = currentY * -20;
        const rotX = currentRotateX * 0.5;
        const rotY = currentRotateY * 0.5;
        groupSecondary.style.transform = `perspective(1000px) translate3d(${moveX}px, ${moveY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${secondaryRotateZ}deg)`;
    }

    requestAnimationFrame(animateParallax);
}
animateParallax();


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

// 4. FILTER & UNDERLINE LOGIC
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.project-card');
const underline = document.querySelector('.filter-underline');

function moveUnderline(targetBtn) {
    if (!underline || !targetBtn) return;
    underline.style.width = `${targetBtn.offsetWidth}px`;
    underline.style.left = `${targetBtn.offsetLeft}px`;
}

const activeBtn = document.querySelector('.filter-btn.active');
if (activeBtn) setTimeout(() => moveUnderline(activeBtn), 100);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        moveUnderline(btn);
        
        const filter = btn.getAttribute('data-filter');
        
        cards.forEach(card => {
            if(filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'grid';
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// 5. HOVER EFFECTS
const hoverTargets = document.querySelectorAll('a, button, .project-card, .logo, .elegant-email, .brand-name, .project-title, .section-title, .fb-title, .media-item, .project-img, .project-img-container, .about-img, .skill-tag, .back-link, .next-project-card, .btn-cta, .resume-button, .project-link');
const cursor = document.querySelector('.cursor');

hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor?.classList.add('is-big'));
    el.addEventListener('mouseleave', () => cursor?.classList.remove('is-big'));
});

// 6. TIME UPDATE
function updateTime() {
    const timeDisplay = document.getElementById('time-display');
    if(timeDisplay) {
        const now = new Date();
        const options = { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false };
        timeDisplay.textContent = now.toLocaleTimeString('en-US', options) + " EST";
    }
}
setInterval(updateTime, 1000);
updateTime();

// 7. MOBILE NAV
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}