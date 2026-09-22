(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('[data-ui-gallery]').forEach((gallery) => {
        const track = gallery.querySelector('[data-ui-track]');
        const slides = Array.from(gallery.querySelectorAll('.gluco-gallery-slide'));
        const dots = Array.from(gallery.querySelectorAll('[data-gallery-dot]'));
        const title = gallery.querySelector('[data-gallery-title]');
        const description = gallery.querySelector('[data-gallery-description]');
        let activeIndex = 0;
        let scrollFrame = 0;
        let dragging = false;
        let dragStartX = 0;
        let dragStartScroll = 0;

        const setActive = (index) => {
            const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
            if (nextIndex === activeIndex && dots[nextIndex]?.getAttribute('aria-current') === 'true') return;

            activeIndex = nextIndex;
            const slide = slides[activeIndex];
            title.textContent = slide.dataset.title;
            description.textContent = slide.dataset.description;

            dots.forEach((dot, dotIndex) => {
                if (dotIndex === activeIndex) dot.setAttribute('aria-current', 'true');
                else dot.removeAttribute('aria-current');
            });
        };

        const nearestSlideIndex = () => {
            const trackCenter = track.scrollLeft + track.clientWidth / 2;
            const firstSlideOffset = slides[0]?.offsetLeft || 0;
            let nearest = 0;
            let distance = Number.POSITIVE_INFINITY;

            slides.forEach((slide, index) => {
                const slideCenter = slide.offsetLeft - firstSlideOffset + slide.offsetWidth / 2;
                const nextDistance = Math.abs(slideCenter - trackCenter);
                if (nextDistance < distance) {
                    distance = nextDistance;
                    nearest = index;
                }
            });

            return nearest;
        };

        const scrollToSlide = (index) => {
            const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
            slides[nextIndex]?.scrollIntoView({
                behavior: reduceMotion ? 'auto' : 'smooth',
                block: 'nearest',
                inline: 'center'
            });
            setActive(nextIndex);
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => scrollToSlide(index));
        });

        track.addEventListener('scroll', () => {
            cancelAnimationFrame(scrollFrame);
            scrollFrame = requestAnimationFrame(() => setActive(nearestSlideIndex()));
        }, { passive: true });

        track.addEventListener('keydown', (event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();

            if (event.key === 'Home') scrollToSlide(0);
            else if (event.key === 'End') scrollToSlide(slides.length - 1);
            else scrollToSlide(activeIndex + (event.key === 'ArrowLeft' ? -1 : 1));
        });

        track.addEventListener('pointerdown', (event) => {
            if (event.pointerType !== 'mouse' || event.button !== 0) return;
            dragging = true;
            dragStartX = event.clientX;
            dragStartScroll = track.scrollLeft;
            track.classList.add('is-dragging');
            track.setPointerCapture(event.pointerId);
        });

        track.addEventListener('pointermove', (event) => {
            if (!dragging) return;
            track.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
        });

        const finishDrag = (event) => {
            if (!dragging) return;
            dragging = false;
            track.classList.remove('is-dragging');
            if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
            scrollToSlide(nearestSlideIndex());
        };

        track.addEventListener('pointerup', finishDrag);
        track.addEventListener('pointercancel', finishDrag);
        track.addEventListener('dragstart', (event) => event.preventDefault());

        setActive(0);
    });
})();
