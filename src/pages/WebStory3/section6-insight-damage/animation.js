import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Animasi Section 6 — Seberapa Luas Dampaknya? — Modul 3
 * Dipanggil dari animations.js (orchestrator) di root WebStory3
 *
 * @param {React.RefObject} containerRef - ref ke elemen section
 * @returns {gsap.core.Timeline}
 */
export function animateInsightDamage(containerRef) {
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
  // tl.fromTo('.section-insightdamage .judul', { opacity: 0, y: 60 }, { opacity: 1, y: 0 });

  return tl;
}
