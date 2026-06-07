import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Animasi Section 7 — Saat Cahaya Meredup — Modul 4 & 5
 * Dipanggil dari animations.js (orchestrator) di root WebStory3
 *
 * @param {React.RefObject} containerRef - ref ke elemen section
 * @returns {gsap.core.Timeline}
 */
export function animateInsightNTL(containerRef) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: containerRef.current,
      start: 'top top',
      end: '+=100%',
      scrub: true,
      pin: true,
    },
  });

  // TODO: tambahkan animasi GSAP di sini
  // Contoh:
  // tl.fromTo('.section-insightntl .judul', { opacity: 0, y: 60 }, { opacity: 1, y: 0 });

  return tl;
}
