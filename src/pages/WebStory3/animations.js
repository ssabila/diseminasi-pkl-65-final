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

  // ----------------------------------------------------
  // TRANSISI B: Section 2a (Urgency) -> Section 3 (Big Data)
  // Collapse layers, Mapbox fly to Sumatra
  // ----------------------------------------------------
  const bigDataTransitionTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#section3-bigdataanswers',
      start: 'top bottom', // When Section 3 starts coming in from bottom
      end: 'top top',      // Until it hits the top
      scrub: 1,
      onEnter: () => {
        if (map) {
          const currentCenter = map.getCenter();
          mapProxy.lng = currentCenter.lng;
          mapProxy.lat = currentCenter.lat;
          mapProxy.zoom = map.getZoom();
          bigDataTransitionTl.invalidate();
        }
      }
    }
  });

  // Collapse PNG Layers from Section 2a
  const urgencyLayers = container.querySelectorAll('.urgency-stack-container img');
  if (urgencyLayers.length > 0) {
    bigDataTransitionTl.to(urgencyLayers, {
      top: '50%',
      left: '50%',
      opacity: 0,
      scale: 0.5,
      stagger: 0.05,
      duration: 1,
      ease: 'power2.inOut'
    }, 0);
  }

  // Zoom into Sumatra
  bigDataTransitionTl.to(mapProxy, {
    zoom: 5.5,
    lng: 102,
    lat: -0.5,
    duration: 1,
    ease: 'power2.inOut',
    onUpdate: () => {
      if (map && map.jumpTo) {
        map.jumpTo({ zoom: mapProxy.zoom, center: [mapProxy.lng, mapProxy.lat] });
      }
    }
  }, 0);

  // ----------------------------------------------------
  // SECTION 3: 5 Pertanyaan Scroll (Cards) + Transisi C
  // Menggunakan scrubbed timeline + GSAP pin
  // (CSS sticky broken oleh overflow-x:hidden di body/html)
  // ----------------------------------------------------
  const cards = container.querySelectorAll('.bigdata-card');
  const section3 = container.querySelector('#section3-bigdataanswers');
  const panelPinned = container.querySelector('.bigdata-panel-pinned');

  if (cards.length === 5 && section3 && panelPinned) {
    // Set initial state via GSAP (bukan CSS)
    gsap.set(Array.from(cards), { opacity: 0, y: 40, zIndex: 0 });
    gsap.set(cards[0], { opacity: 1, y: 0, zIndex: 1 });

    // Pin panel kanan agar tetap terlihat saat scroll section 500vh
    ScrollTrigger.create({
      trigger: panelPinned,
      start: 'top top',
      endTrigger: section3,
      end: 'bottom bottom',
      pin: true,
      pinSpacing: false, // Jangan tambah tinggi — section sudah 500vh
    });

    // Scrubbed timeline: scroll position langsung mengontrol posisi animasi
    const cardTl = gsap.timeline({
      scrollTrigger: {
        trigger: section3,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      }
    });

    // Timeline structure (total duration = 5 units, masing-masing card 1 unit):
    // 0.0 – 0.7: card 0 hold (terlihat)
    // 0.7 – 1.0: card 0 fade out + card 1 fade in
    // 1.0 – 1.7: card 1 hold
    // 1.7 – 2.0: card 1 fade out + card 2 fade in
    // ... dst
    for (let i = 0; i < 4; i++) {
      const transStart = i + 0.7; // mulai transisi

      // Card saat ini: fade out
      cardTl.to(cards[i], {
        opacity: 0,
        y: -40,
        zIndex: 0,
        duration: 0.3,
        ease: 'power2.in',
      }, transStart);

      // Card berikutnya: fade in
      cardTl.fromTo(cards[i + 1],
        { opacity: 0, y: 40, zIndex: 0 },
        {
          opacity: 1, y: 0, zIndex: 1,
          duration: 0.3,
          ease: 'power2.out',
          immediateRender: false, // Jangan render "from" state langsung
        },
        transStart
      );
    }

    // Hold terakhir card 4 sampai akhir (4.0 – 5.0)
    cardTl.to({}, { duration: 1 });

    // TRANSISI C: Zoom map ke Aceh pada 80-100% scroll section 3
    ScrollTrigger.create({
      trigger: section3,
      start: '80% top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        if (map && map.jumpTo) {
          const p = self.progress;
          map.jumpTo({
            zoom: 5.5 + p * 2.0,
            center: [
              102 + p * (96.9 - 102),
              -0.5 + p * (4.6 - (-0.5))
            ]
          });
        }
      }
    });
  }

  // 3. DELEGATE SECTION ANIMATIONS
  // Panggil animasi spesifik untuk masing-masing section
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