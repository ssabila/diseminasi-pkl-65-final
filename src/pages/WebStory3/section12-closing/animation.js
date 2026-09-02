import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Animasi Section 12 — Foto hover + quotes penutup
 * Dipanggil dari animations.js (orchestrator) di root WebStory3
 *
 * @param {React.RefObject} containerRef - ref ke elemen section
 * @returns {gsap.core.Timeline}
 */
export function animateClosing(containerRef) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: containerRef.current,
      start: 'top top',
      end: '+=300%',
      scrub: true,
      pin: true,
    },
  });

  // Animation is handled internally by the component's useGSAP hook
  // This function is kept for orchestrator compatibility

  return tl;
}
