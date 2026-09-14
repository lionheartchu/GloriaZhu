/* ============================================
   OTHER WORKS — JS
   Cursor · Scroll Reveal · Header · Mobile Nav
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── 2. SCROLL REVEAL ──────────────────────────────────
    const reveals = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px'
        });

        reveals.forEach(el => observer.observe(el));
    } else {
        // Fallback: show all immediately
        reveals.forEach(el => el.classList.add('visible'));
    }


    // ── 3. HEADER HIDE / SHOW ON SCROLL ──────────────────
    const header = document.querySelector('header');
    let lastScrollY = 0;
    let ticking = false;

    const handleScroll = () => {
        const currentY = window.scrollY;

        if (currentY > lastScrollY && currentY > 80) {
            // Scrolling down — hide
            header.classList.add('hide');
        } else {
            // Scrolling up — show
            header.classList.remove('hide');
        }

        lastScrollY = currentY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });


    // ── 4. MOBILE HAMBURGER ───────────────────────────────
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            const isOpen = mobileNav.classList.toggle('open');
            mobileNav.setAttribute('aria-hidden', String(!isOpen));
            // Animate bars into X
            const bars = hamburger.querySelectorAll('.bar');
            if (isOpen) {
                bars[0].style.transform = 'translateY(7px) rotate(45deg)';
                bars[1].style.transform = 'translateY(-1px) rotate(-45deg)';
            } else {
                bars[0].style.transform = '';
                bars[1].style.transform = '';
            }
        });

        // Close mobile nav on link click
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                mobileNav.setAttribute('aria-hidden', 'true');
                hamburger.querySelectorAll('.bar').forEach(b => { b.style.transform = ''; });
            });
        });
    }

});
