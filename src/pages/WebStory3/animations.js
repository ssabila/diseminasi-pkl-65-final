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

  // Zoom into Sumatra (Di Desktop geser sedikit ke kiri untuk Card 1, di Mobile dinaikkan ke area atas)
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 992;
  const initialSection3Camera = isMobile
    ? { zoom: 4.65, lng: 98.8, lat: 0.0, pitch: 28, bearing: 0 }
    : { zoom: 5.4, lng: 99.8, lat: 1.8, pitch: 38, bearing: 0 };

  bigDataTransitionTl.to(mapProxy, {
    ...initialSection3Camera,
    duration: 1,
    ease: 'sine.inOut',
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

  // Fade-in kartu pertama secara mulus saat masuk Section 3
  const cards = container.querySelectorAll('.bigdata-card');
  const section3 = container.querySelector('#section3-bigdataanswers');
  const panelPinned = container.querySelector('.bigdata-panel-pinned');

  if (cards.length === 5 && section3 && panelPinned) {
    // Awalnya semua kartu (termasuk kartu 0) tersembunyi
    gsap.set(Array.from(cards), { opacity: 0, y: 35, zIndex: 0 });

    // Kartu 0 fade-in saat mendekati posisi pin Section 3 (dari 0.6 ke 1.0 transisi masuk)
    bigDataTransitionTl.to(cards[0], {
      opacity: 1,
      y: 0,
      zIndex: 1,
      duration: 0.4,
      ease: 'power1.out',
    }, 0.6);

    // Pin panel selama scroll Section 3
    ScrollTrigger.create({
      trigger: panelPinned,
      start: 'top top',
      endTrigger: section3,
      end: 'bottom bottom',
      pin: true,
      pinSpacing: false,
      refreshPriority: 95,
    });

    // Scrubbed timeline: scrub 0.8 memberikan inersia halus & elegan
    const cardTl = gsap.timeline({
      scrollTrigger: {
        trigger: section3,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        refreshPriority: 95,
      }
    });

    for (let i = 0; i < 4; i++) {
      // transStart di 0.60 memberikan jeda membaca yang nyaman sebelum berganti
      const transStart = i + 0.60;
      const nextIsRight = (i + 1) % 2 === 0;

      // Hanya geser lateral kamera di Desktop; di Mobile kamera tetap stabil di tengah
      if (!isMobile) {
        const targetLng = nextIsRight ? 99.8 : 97.6;
        cardTl.to(mapProxy, {
          lng: targetLng,
          lat: 1.8,
          zoom: 5.4,
          pitch: 38,
          bearing: 0,
          duration: 0.38,
          ease: 'sine.inOut',
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
        }, transStart);
      }

      // Card i fade out halus ke atas dengan pergeseran kecil
      cardTl.to(cards[i], {
        opacity: 0,
        y: -30,
        zIndex: 0,
        duration: 0.26,
        ease: 'power1.in',
      }, transStart);

      // Card i+1 fade in anggun di posisinya (kanan/kiri di desktop, bawah di mobile)
      cardTl.fromTo(cards[i + 1],
        { opacity: 0, y: 30, zIndex: 0 },
        {
          opacity: 1,
          y: 0,
          zIndex: 1,
          duration: 0.28,
          ease: 'power1.out',
          immediateRender: false,
        },
        transStart + 0.08
      );
    }

    // Slide out kartu terakhir menjelang akhir Section 3 agar bersih saat masuk Section 4
    cardTl.to(cards[4], {
      opacity: 0,
      y: -30,
      duration: 0.25,
      ease: 'power1.in',
    }, 4.75);
  }

  // ----------------------------------------------------
  // SECTION 4: Globe Transition
  // Animates map to match Section 5 (SharedMapProvider)
  // ----------------------------------------------------
  const section4 = container.querySelector('#section4-globetransition');
  const panelPinned4 = container.querySelector('.globetransition-panel-pinned');
  const globeCards = container.querySelectorAll('.globe-card');

  if (section4 && panelPinned4 && globeCards.length > 0) {
    gsap.set(globeCards, { opacity: 0 });

    ScrollTrigger.create({
      trigger: panelPinned4,
      start: 'top top',
      endTrigger: section4,
      end: 'bottom bottom',
      pin: true,
      pinSpacing: false,
      refreshPriority: 85,
    });

    const sec4Tl = gsap.timeline({
      scrollTrigger: {
        trigger: section4,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        refreshPriority: 85,
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
        },
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
      }
    });

    // Transisi kamera map yang proporsional di desktop & mobile
    const sec4TargetCamera = isMobile
      ? { zoom: 4.8, lng: 98.6, lat: 1.2, pitch: 25, bearing: 0 }
      : { zoom: 6.0, lng: 99.4, lat: 2.0, pitch: 35, bearing: -14 };

    sec4Tl.to(mapProxy, {
      ...sec4TargetCamera,
      duration: 1.0,
      ease: 'sine.inOut'
    }, 0);

    // Function to animate card content in
    const animateCardIn = (card, startTime) => {
      const badge = card.querySelector('.globe-badge');
      const title = card.querySelector('.globe-title');
      const narrative = card.querySelector('.globe-narrative');
      const footer = card.querySelector('.globe-card-footer');

      // Make card container visible
      sec4Tl.fromTo(card, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power1.out' }, startTime);

      // Stagger internal elements in
      if (badge) sec4Tl.fromTo(badge, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.2 }, startTime + 0.05);
      if (title) sec4Tl.fromTo(title, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.22 }, startTime + 0.1);
      if (narrative) sec4Tl.fromTo(narrative, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.2 }, startTime + 0.15);
      if (footer) sec4Tl.fromTo(footer, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.2 }, startTime + 0.2);
    };

    // Function to animate card out (sliding up like it's scrolling away)
    const animateCardOut = (card, startTime) => {
      sec4Tl.to(card, { opacity: 0, y: -40, duration: 0.25, ease: 'power1.in' }, startTime);
    };

    // Sequence the cards seamlessly across the 250vh height
    if (globeCards[0]) {
      animateCardIn(globeCards[0], 0.05);
      animateCardOut(globeCards[0], 0.85);
    }

    if (globeCards[1]) {
      animateCardIn(globeCards[1], 0.7);
      animateCardOut(globeCards[1], 1.55);
    }

    if (globeCards[2]) {
      animateCardIn(globeCards[2], 1.4);
      animateCardOut(globeCards[2], 2.3);
    }
  }

  // 2. DELEGATE SECTION ANIMATIONS
  // Panggil animasi spesifik untuk masing-masing section
  const section2Node = container.querySelector('#section2-urgency');
  if (section2Node) {
    animateUrgency(section2Node);
  }
};