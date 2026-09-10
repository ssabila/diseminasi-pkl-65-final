import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Animasi Section 11 — Slider Overview 8 Modul
 * Dipanggil dari animations.js (orchestrator) di root WebStory3
 *
 * NOTE: Animation is handled internally by the ModuleMenu component's
 * useGSAP hook. This function exists for orchestrator compatibility
 * and to provide the correct scroll length hint.
 *
 * @param {React.RefObject} containerRef - ref ke elemen section
 * @returns {gsap.core.Timeline}
 */
export function animateModuleMenu(containerRef) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: containerRef.current,
      start: 'top top',
      end: '+=1000%',
      scrub: true,
      pin: true,
    },
  });

  // Animation is handled internally by the component's useGSAP hook
  // This function is kept for orchestrator compatibility

  return tl;
}
