import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateUrgency } from './section2-urgency/animation';

// 1. DAFTARKAN PLUGIN DI PALING ATAS
gsap.registerPlugin(ScrollTrigger);

export const animateWebStory3 = (container, map) => {
  if (!container || !map) return;

  // 2. MASTER TIMELINE / GLOBAL ANIMATIONS
  // Proxy object to animate Mapbox properties smoothly via GSAP
  const mapProxy = { zoom: map.getZoom(), lng: map.getCenter().lng, lat: map.getCenter().lat };

  // Section 1 to Section 2 Global Transition (Background Map)
  const mapTransitionTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#section2-urgency',
      start: 'top bottom', // Start when Section 2 enters the bottom of the screen
      end: 'top top',      // End when Section 2 hits the top of the screen
      scrub: 1,            // Smooth scrubbing
      onEnter: () => {
        if (map) {
          map.isSpinning = false;
          // Ambil posisi globe tepat saat user mulai scroll agar transisi mulus
          const currentCenter = map.getCenter();
          mapProxy.lng = currentCenter.lng;
          mapProxy.lat = currentCenter.lat;
          mapProxy.zoom = map.getZoom();
          // Invalidate timeline agar GSAP menghitung ulang titik awal animasi dari posisi proxy terbaru
          mapTransitionTl.invalidate();
        }
      },
      onLeaveBack: () => { if (map) map.isSpinning = true; }
    }
  });

  // Animate Globe Container (Move to center and fade opacity)
  mapTransitionTl.to('#global-map-container', {
    right: '50%',
    xPercent: 50,
    yPercent: -50,
    opacity: 0.7,
    duration: 1,
    ease: 'power2.inOut'
  }, 0);

  // Animate Mapbox Camera (Zoom into Indonesia)
  mapTransitionTl.to(mapProxy, {
    zoom: 3.0,
    lng: 113,
    lat: -2,
    duration: 1,
    ease: 'power2.inOut',
    onUpdate: () => {
      if (map && map.jumpTo) {
        map.jumpTo({
          zoom: mapProxy.zoom,
          center: [mapProxy.lng, mapProxy.lat]
        });
      }
    }
  }, 0);

  // 3. DELEGATE SECTION ANIMATIONS
  const section2Node = container.querySelector('#section2-urgency');
  if (section2Node) {
    animateUrgency(section2Node);
  }
}; // Penutup fungsi animateWebStory3 yang benar

// Jika kamu butuh fungsi orchestrator tambahan untuk scope, 
// buat secara terpisah DI LUAR fungsi pertama seperti ini:
export const animateWebStory3Scope = (scope) => {
  // Global effects can be added here jika diperlukan
};