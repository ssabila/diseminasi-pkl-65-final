import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Animasi Section 12 — Foto hover + quotes penutup
 * Dipanggil dari animations.js (orchestrator) di root WebStory3
 *
 * Note: Animation is handled internally by the component's useGSAP hook.
 * This function is kept for orchestrator compatibility.
 *
 * @param {React.RefObject} containerRef - ref ke elemen section
 * @returns {gsap.core.Timeline}
 */
export function animateClosing(containerRef) {
  // The Closing component handles its own scroll-driven animations
  // via useGSAP. This stub exists for consistency with the orchestrator
  // pattern used across other sections.
  return gsap.timeline();
}
