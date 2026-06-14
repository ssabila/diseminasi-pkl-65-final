import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateUrgency } from './section2-urgency/animation';

gsap.registerPlugin(ScrollTrigger);

export const animateWebStory3 = (container, map) => {
  if (!container || !map) return;

  // 1. MASTER TIMELINE / GLOBAL ANIMATIONS
  // Proxy object to animate Mapbox properties smoothly via GSAP
  // Start values will be dynamically updated in onEnter
  const mapProxy = { zoom: map.getZoom(), lng: map.getCenter().lng, lat: map.getCenter().lat, pitch: map.getPitch() || 0, bearing: map.getBearing() || 0 };

  // Padding proxy: nilai right = seberapa jauh globe digeser ke kiri agar terlihat di kanan
  // Nilai besar = globe lebih ke kanan (Section 1), nilai 0 = globe di tengah (Section 2+)
  const paddingProxy = { right: 0 };

  // Konstanta posisi globe Section 1 — ubah satu nilai ini untuk menggeser globe
  const SECTION1_PADDING_RATIO = 0.65;

  // Set padding awal Section 1: globe di sisi kanan layar
  map.setPadding({ left: window.innerWidth * SECTION1_PADDING_RATIO, top: 0, right: 0, bottom: 0 });

  // Section 1 to Section 2 Global Transition (Background Map)
  const mapTransitionTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#section2-urgency',
      start: 'top bottom',
      end: 'top top',
      scrub: 1,
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

  // Geser padding dari kanan layar ke tengah seiring scroll ke Section 2
  mapTransitionTl.to(paddingProxy, {
    right: 0,
    duration: 1,
    ease: 'power2.inOut',
    onUpdate: () => {
      const progress = mapTransitionTl.scrollTrigger?.progress ?? 0;
      const leftPad = Math.round(window.innerWidth * SECTION1_PADDING_RATIO * (1 - progress));
      map.setPadding({ left: leftPad, top: 0, right: 0, bottom: 0 });
    },
    onComplete: () => {
      map.setPadding({ left: 0, top: 0, right: 0, bottom: 0 });
    }
  }, 0);

  // Animate Mapbox Camera (Zoom into Indonesia)
  mapTransitionTl.to(mapProxy, {
    zoom: 3.0, // Sedikit diperkecil agar Indonesia terlihat penuh
    lng: 113,  // Digeser ke barat (Kalimantan) agar Sumatera lebih ke tengah dan terlihat
    lat: -2,
    duration: 1,
    ease: 'power2.inOut',
    onUpdate: () => {
      if (map && map.jumpTo) {
        map.jumpTo({
          zoom: mapProxy.zoom,
          center: [mapProxy.lng, mapProxy.lat],
          pitch: mapProxy.pitch,
          bearing: mapProxy.bearing
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
      start: 'top bottom',
      end: 'top top',
      scrub: 1,
      onEnter: () => {
        if (map) {
          const currentCenter = map.getCenter();
          mapProxy.lng = currentCenter.lng;
          mapProxy.lat = currentCenter.lat;
          mapProxy.zoom = map.getZoom();
          mapProxy.pitch = map.getPitch() || 0;
          mapProxy.bearing = map.getBearing() || 0;
          bigDataTransitionTl.invalidate();
        }
      }
    }
  });

  // Zoom into Sumatra
  bigDataTransitionTl.to(mapProxy, {
    zoom: 5.5,
    lng: 102,
    lat: -0.5,
    duration: 1,
    ease: 'power2.inOut',
    onUpdate: () => {
      if (map && map.jumpTo) {
        map.jumpTo({
          zoom: mapProxy.zoom,
          center: [mapProxy.lng, mapProxy.lat],
          pitch: mapProxy.pitch,
          bearing: mapProxy.bearing
        });
      }
    }
  }, 0);

  // ----------------------------------------------------
  // SECTION 3: 5 Pertanyaan Scroll (Cards) + Transisi C
  // ----------------------------------------------------
  const cards = container.querySelectorAll('.bigdata-card');
  const section3 = container.querySelector('#section3-bigdataanswers');
  const panelPinned = container.querySelector('.bigdata-panel-pinned');

  if (cards.length === 5 && section3 && panelPinned) {
    // Set initial state via GSAP
    gsap.set(Array.from(cards), { opacity: 0, y: 40, zIndex: 0 });
    gsap.set(cards[0], { opacity: 1, y: 0, zIndex: 1 });

    // Pin the right panel so it stays on screen during the 500vh scroll
    ScrollTrigger.create({
      trigger: panelPinned,
      start: 'top top',
      endTrigger: section3,
      end: 'bottom bottom',
      pin: true,
      pinSpacing: false,
    });

    // Scrubbed timeline: each card gets 1 unit, transition at 0.7
    const cardTl = gsap.timeline({
      scrollTrigger: {
        trigger: section3,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      }
    });

    for (let i = 0; i < 4; i++) {
      const transStart = i + 0.7;

      cardTl.to(cards[i], {
        opacity: 0,
        y: -40,
        zIndex: 0,
        duration: 0.3,
        ease: 'power2.in',
      }, transStart);

      cardTl.fromTo(cards[i + 1],
        { opacity: 0, y: 40, zIndex: 0 },
        {
          opacity: 1, y: 0, zIndex: 1,
          duration: 0.3,
          ease: 'power2.out',
          immediateRender: false,
        },
        transStart
      );
    }

    // Hold last card until end
    cardTl.to({}, { duration: 1 });

  }

  // ----------------------------------------------------
  // SECTION 4: Globe Transition
  // Animates map to match Section 5 (SharedMapProvider)
  // center: [99.8, 2.2], zoom: 6.1, pitch: 30, bearing: -5
  // and fades in the narrative cards.
  // ----------------------------------------------------
  const section4 = container.querySelector('#section4-globetransition');
  const panelPinned4 = container.querySelector('.globetransition-panel-pinned');
  const globeCards = container.querySelectorAll('.globe-card');

  if (section4 && panelPinned4 && globeCards.length === 2) {
    gsap.set(globeCards, { opacity: 0 });

    ScrollTrigger.create({
      trigger: panelPinned4,
      start: 'top top',
      endTrigger: section4,
      end: 'bottom bottom',
      pin: true,
      pinSpacing: false,
    });

    const sec4Tl = gsap.timeline({
      scrollTrigger: {
        trigger: section4,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onEnter: () => {
          if (map) {
            const currentCenter = map.getCenter();
            mapProxy.lng = currentCenter.lng;
            mapProxy.lat = currentCenter.lat;
            mapProxy.zoom = map.getZoom();
            mapProxy.pitch = map.getPitch() || 0;
            mapProxy.bearing = map.getBearing() || 0;
            sec4Tl.invalidate();
          }
        }
      }
    });

    // Animate map to target coordinates
    sec4Tl.to(mapProxy, {
      zoom: 6.1,
      lng: 99.8,
      lat: 2.2,
      pitch: 30,
      bearing: -5,
      duration: 1,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (map && map.jumpTo) {
          map.jumpTo({
            zoom: mapProxy.zoom,
            center: [mapProxy.lng, mapProxy.lat],
            pitch: mapProxy.pitch,
            bearing: mapProxy.bearing
          });
        }
      }
    }, 0);

    // Cards fade in at different scroll progress points
    sec4Tl.to(globeCards[0], { opacity: 1, duration: 0.2 }, 0.15)
      .to(globeCards[1], { opacity: 1, duration: 0.2 }, 0.55);
  }

  // 2. DELEGATE SECTION ANIMATIONS
  // Panggil animasi spesifik untuk masing-masing section
  const section2Node = container.querySelector('#section2-urgency');
  if (section2Node) {
    animateUrgency(section2Node);
  }
};