// Shared case-page navigation; homepage keeps its existing hero/header states.
(() => {
    const header = document.querySelector('header');
    const button = document.querySelector('[data-project-menu]');
    const links = document.querySelector('#primary-nav');
    if (header && button && links) {
        const nav = links.closest('nav');
        const anchor = document.createComment('Desktop navigation position');
        nav.before(anchor);
        const mobile = window.matchMedia('(max-width: 900px)');
        const setOpen = open => {
            button.classList.toggle('active', open);
            links.classList.toggle('active', open);
            button.setAttribute('aria-expanded', String(open));
            document.documentElement.classList.toggle('project-menu-open', open);
            links.inert = mobile.matches && !open;
        };
        const syncViewport = () => {
            setOpen(false);
            // A filtered header is a containing block for fixed descendants.
            // Keep the mobile overlay at the document root so inset: 0 covers the viewport.
            if (mobile.matches) document.body.append(nav);
            else anchor.after(nav);
        };
        syncViewport();
        mobile.addEventListener('change', syncViewport);
        button.addEventListener('click', () => {
            const open = button.getAttribute('aria-expanded') !== 'true';
            setOpen(open);
            if (open) links.querySelector('a')?.focus();
            else button.focus();
        });
        links.addEventListener('click', event => {
            if (event.target.closest('a')) setOpen(false);
        });
        document.addEventListener('keydown', event => {
            if (!mobile.matches || button.getAttribute('aria-expanded') !== 'true') return;
            if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false);
                button.focus();
            } else if (event.key === 'Tab') {
                const stops = [button, ...links.querySelectorAll('a[href]')];
                const i = stops.indexOf(document.activeElement);
                event.preventDefault();
                stops[(i + (event.shiftKey ? -1 : 1) + stops.length) % stops.length].focus();
            }
        });
        const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
        window.addEventListener('scroll', syncHeader, { passive: true });
        syncHeader();
    }
    // A failed asset should not trigger another external request or an error loop.
    document.querySelectorAll('img').forEach(img => {
        const showMissing = () => {
            const note = document.createElement('p');
            note.className = 'media-unavailable';
            note.textContent = `Image unavailable${img.alt ? ': ' + img.alt : '.'}`;
            img.replaceWith(note);
        };
        if (img.complete && img.naturalWidth === 0) showMissing();
        else img.addEventListener('error', showMissing, { once: true });
    });
})();
