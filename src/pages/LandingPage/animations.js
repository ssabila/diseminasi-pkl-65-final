import gsap from '../../utils/gsapConfig';

function revealOnScroll(root) {
    const items = root.querySelectorAll('[data-reveal]');
    items.forEach((el) => {
        const from = el.dataset.from || 'bottom';
        const delay = parseFloat(el.dataset.delay || '0');
        const offset =
            from === 'left' ? { x: -28 } : from === 'right' ? { x: 28 } : { y: 28 };

        gsap.fromTo(
            el,
            { autoAlpha: 0, ...offset },
            {
                autoAlpha: 1,
                x: 0,
                y: 0,
                duration: 0.9,
                delay,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    once: true,
                },
            }
        );
    });
}

/* ── Section 1: Hero ─────────────────────────────────────────── */
export const heroSectionAnimation = (element, tl = gsap.timeline(), onStateChange) => {
    if (!element) return tl;
    const ctx = gsap.context(() => {
        tl.fromTo('.hero-topbar', { opacity: 0, duration: 1 }, { opacity: 1, duration: 1, x: 0 }, '>0.2')
            .fromTo('.hero-kicker', { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.9 }, '<0.2')
            .fromTo('.hero-title', { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.9 }, '<0.18')
            .fromTo('.hero-subtitle', { autoAlpha: 0, y: 24 }, { autoAlpha: 0.85, y: 0, duration: 0.9 }, '<0.17')
            .fromTo('.hero-details', { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.9 }, '<0.15')
            .fromTo('.hero-cta', { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.9 }, '<0.2')
            .fromTo('.hero-map', { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.9 }, '<-0.5')
            .fromTo('.hero-scroll-cue', { autoAlpha: 0 }, { autoAlpha: 0.38, duration: 1 }, '>');

        // 2. Responsive Check: Animasi Scroll-Expand HANYA aktif di layar Desktop (min-width: 1024px)
        const mm = gsap.matchMedia();

        mm.add('(min-width: 1024px)', () => {
            const scrollTl = gsap.timeline({
                scrollTrigger: {
                    trigger: element,
                    start: 'top top',
                    end: '+=200%',        // Jarak scroll untuk menyelesaikan pelebaran peta
                    scrub: 1,            // Animasi mengikuti gerakan scroll mouse secara halus
                    pin: true,           // Pin section1 selama animasi berlangsung
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        const isExpanded = self.progress >= 0.7;

                        if (onStateChange) {
                            onStateChange(isExpanded);
                        }
                    }
                },

            });

            const topBarTl = gsap.timeline({
                scrollTrigger: {
                    trigger: '.hero-topbar',
                    start: '5% top',
                    end: '90vh top',
                    scrub: 1,
                    // Tambahkan invalidateOnRefresh agar posisi kalkulasi ulang dengan benar saat reload
                    invalidateOnRefresh: true,
                }
            })
            topBarTl.to('.hero-topbar', {
                autoAlpha: 0,
                y: -20,
                ease: 'none'
            }, 0);

            scrollTl
                // A. Fade out & geser konten teks ke kiri
                .to('.hero-content-left', { autoAlpha: 0, x: -60, duration: 1.5, ease: 'none' }, 0)

                // B. Hilangkan gradien overlay hitam di atas peta
                .to('.hero-map-gradient', { opacity: 0, duration: 0.8 }, 0)

                // C. Melebarkan peta dari 55vw ke 100vw
                .to('.hero-map', {
                    width: '100vw',
                    duration: 1.5,
                    ease: 'power2.inOut'
                }, 0)
                .to('.hero-map-canvas', { scale: 1.3, y: 10, translateX: 200 }, '>-0.2')
                .to({}, { duration: 0.3 })
                .fromTo(
                    '.hero-map-title',
                    { opacity: 0, display: 'block' },
                    { opacity: 1, duration: 0.1 },
                    "-=0.6"
                )
                .fromTo(
                    ['.hero-map-title h2', '.hero-map-title span'],
                    { opacity: 0, y: -25, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1.1,
                        stagger: 1,
                        ease: "power3.out"
                    },
                    "<" // Dimulai bersamaan saat container aktif
                )

        });

    }, element)

    return () => ctx.revert();
};

/* ── Section 2: Stat row ─────────────────────────────────────── */
export const statsSectionAnimation = (element, onStateChange) => {
    if (!element) return () => { };
    const ctx = gsap.context(() => {
        revealOnScroll(element);
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: element,
                start: 'top 10%',
                scrub: true,
                pin: true,
                pinSpacing: false,
                end: '+=150%',
                onToggle: (self) => {
                    onStateChange(self.isActive);
                },
            }
        })
        tl
            .to(element, {}, 0.3)
            .to(element, {
                opacity: 0,
                ease: 'back.out',
            },'<')
    }, element);
    return () => ctx.revert();
};

/* ── Section 3: Mandate ──────────────────────────────────────── */
export const mandateSectionAnimation = (element) => {
    if (!element) return () => { };
    const ctx = gsap.context(() => {
        revealOnScroll(element);
    }, element);
    return () => ctx.revert();
};

/* ── Section 4: Editorial pull quote ─────────────────────────── */
export const quoteSectionAnimation = (element) => {
    if (!element) return () => { };
    const ctx = gsap.context(() => {
        revealOnScroll(element);
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: element,
                start: 'top 25%',       // Mulai pin saat elemen berada di 25% viewport
                end: '+=200%',          // Total durasi scroll yang panjang (2x tinggi layar)
                scrub: true,            // Animasi mengikuti gerakan scroll
                pin: true,              // Kunci posisi elemen
                pinSpacing: true,
            }
        });

        tl.fromTo(element,
            { opacity: 0 },
            { opacity: 1, ease: 'none', duration: 0.5 }
        )
            .to({}, { duration: 1.5 });

    }, element);
    return () => ctx.revert();
};

/* ── Section 5: Dashboard portals ────────────────────────────── */
export const portalsSectionAnimation = (element) => {
    if (!element) return () => { };
    const ctx = gsap.context(() => {
        const tl = gsap.timeline()
        tl.to('.cloudLoader1', {
            x: '300px',
            duration: 8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
        }, '<')
            .to('.cloudLoader2', {
                x: '-300px',
                duration: 10,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            }, '<')
            .to('.plane', {
                y: '-40px',
                rotation: '5deg',
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
            }, 0)
            .to('.plane', {
                x: '-20px',
                rotation: '5deg',
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
            }, 0)
            .to('.plane', {
                y: '0px',
                rotation: '5deg',
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
            }, 0)

        revealOnScroll(element);

    }, element);

    return () => ctx.revert();
};

/* ── Section 6: Footer ───────────────────────────────────────── */
export const footerSectionAnimation = (element) => {
    if (!element) return () => { };
    const ctx = gsap.context(() => {
        revealOnScroll(element);
    }, element);
    return () => ctx.revert();
};
export const cloudLoadingAnimation = (element, tl = gsap.timeline()) => {
    const ctx = gsap.context(() => {
        if (!element) return tl;

        gsap.set('.cloudLoader1', { opacity: 0, translateX: '10vw', translateY: '0vh' });
        gsap.set('.cloudLoader2', { opacity: 0, translateX: '-10vw', translateY: '0vh' });

        tl.to('.cloudLoader1', { opacity: 1, duration: 1, ease: 'power1.inOut' }, 0)
            .to('.cloudLoader2', { opacity: 1, duration: 1, ease: 'power1.inOut' }, 0)
            .to('.cloudLoader1', { translateX: '-30vw', duration: 3, ease: 'power1.inOut' }, 0)
            .to('.cloudLoader2', { translateX: '30vw', duration: 3, ease: 'power1.inOut' }, 0)
            .to('.cloudLoader1', { translateX: '-50vw', translateY: '50vh', duration: 2, ease: 'power1.inOut' }, '>')
            .to('.cloudLoader2', { translateX: '50vw', translateY: '-50vh', duration: 2, ease: 'power1.inOut' }, '<')
            .to(['.cloudLoader1', '.cloudLoader2', '.cloudLoaderBG'], { opacity: 0, duration: 1, ease: 'power1.out', display: 'none' }, '<');
    }, element)
    return () => ctx.revert();

};