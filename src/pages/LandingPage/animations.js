import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from '../../utils/gsapConfig';

function revealOnScroll(root) {
    const items = Array.from(root.querySelectorAll('[data-reveal]'));
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
        tl
            .fromTo('.hero-kicker', { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.9 }, '<0.2')
            .fromTo('.hero-title', { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.9 }, '<0.18')
            .fromTo('.hero-subtitle', { autoAlpha: 0, y: 24 }, { autoAlpha: 0.85, y: 0, duration: 0.9 }, '<0.17')
            .fromTo('.hero-details', { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.9 }, '<0.15')
            .fromTo('.hero-cta', { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.9 }, '<0.2')
            .fromTo('.hero-map', { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.9 }, '<-0.5')
            .fromTo('.hero-scroll-cue', { autoAlpha: 0 }, { autoAlpha: 0.38, duration: 1 }, '>');

        const mm = gsap.matchMedia();

        mm.add('(min-width: 1024px)', () => {
            const scrollTl = gsap.timeline({
                scrollTrigger: {
                    trigger: element,
                    start: 'top top',
                    end: '+=200%',
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        const isExpanded = self.progress >= 0.7;

                        if (onStateChange) {
                            onStateChange(isExpanded);
                        }
                    }
                },

            });
            gsap.set('.hero-topbar', { autoAlpha: 1, y: -20 });
            const topBarTl = gsap.timeline({
                scrollTrigger: {
                    trigger: '.hero-topbar',
                    start: '5% top',
                    end: '90vh top',
                    scrub: 1,
                    invalidateOnRefresh: true,
                }
            })
            topBarTl
                .to('.hero-topbar', { autoAlpha: 0, y: -20, ease: 'none' }, 0);

            if (!window.matchMedia('(min-width: 1024px)').matches) {
                gsap.fromTo('.hero-topbar', { opacity: 0 }, { opacity: 1, duration: 1 }, '>0.2');
            }
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

    let mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
        revealOnScroll(element);

        mm.add({
            isMobile: "(max-width: 768px)",
            isDesktop: "(min-width: 769px)",
        }, (context) => {
            let { isMobile } = context.conditions;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: element,
                    start: isMobile ? 'top 15%' : 'top 25%',
                    scrub: 1,
                    pin: true,
                    pinSpacing: false,
                    end: isMobile ? '+=150%' : '+=250%',
                    onToggle: (self) => {
                        onStateChange(self.isActive);
                    },
                }
            });

            tl.to(element, {})
                .to(element, {
                    opacity: 0,
                    ease: 'back.out',
                    duration: 0.4,
                }, '>');

            ScrollTrigger.create({
                trigger: element,
                start: isMobile ? 'top 15%' : 'top 75%', // titik toggle sendiri
                end: '+=250%', // samakan end biar durasi "aktif"-nya konsisten dgn pin
                onToggle: (self) => {
                    onStateChange(self.isActive);
                },
            });
        });
    }, element);

    return () => {
        mm.revert();
        ctx.revert();
    };
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
    const mm = gsap.matchMedia()

    const ctx = gsap.context(() => {
        mm.add({
            isMobile: "(max-width: 768px)",
            isDesktop: "(min-width: 769px)",
        }, (context) => {
            let { isMobile } = context.conditions;
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: element,
                    start: 'top 25%',
                    end: isMobile ? '+=150%' : '+=200%',
                    scrub: true,
                    pin: true,
                    pinSpacing: true,
                }
            });

            tl.fromTo('.bg-quotes-title',
                { opacity: 0 },
                { opacity: 1, ease: 'none' }
            )
                .fromTo('.quotes-display', { opacity: 0 }, { opacity: 1, ease: 'none' }, 1)
                .to(element, {})
                .to([element.querySelectorAll('.quote-text, .quote-sub, .quote-meta')], {
                    opacity: 0,
                    ease: 'none'
                }, '<')
        })


    }, element);
    return () => {
        ctx.revert();
        mm.revert();
    };
};

/* ── Section 5: Dashboard portals ────────────────────────────── */
export const portalsSectionAnimation = (element) => {
    if (!element) return () => { };
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
        mm.add({
            isMobile: "(max-width: 768px)",
            isDesktop: "(min-width: 769px)",
        }, (context) => {
            let { isMobile } = context.conditions;
            const tl = gsap.timeline()
            tl.to('.cloudLoader1', {
                translateX: isMobile ? '100px' : '300px',
                duration: 8,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            }, '<')
                .to('.cloudLoader2', {
                    translateX: isMobile ? '100px' : '-300px',
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

        })

    }, element);

    return () => { ctx.revert(); mm.revert() };
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