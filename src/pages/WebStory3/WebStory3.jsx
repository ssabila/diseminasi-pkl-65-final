import React, { useEffect, useRef, useState, useCallback, Component } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './WebStory3.css';

import Opening from './section1-opening/Opening';
import Urgency from './section2-urgency/Urgency';
import BigDataAnswers from './section3-bigdata-answers/BigDataAnswers';
import GlobeTransition from './section4-globe-transition/GlobeTransition';
import InsightEnv from './section5-insight-env/InsightEnv';
import InsightDamage from './section6-insight-damage/InsightDamage';
import InsightNTL from './section7-insight-ntl/InsightNTL';
import InsightVulnerability from './section8-insight-vulnerability/InsightVulnerability';
import InsightTimeline from './section9-insight-timeline/InsightTimeline';
import InsightRecovery from './section10-insight-recovery/InsightRecovery';
import ModuleMenu from './section11-module-menu/ModuleMenu';
import Closing from './section12-closing/Closing';
import MapBackground from './components/MapBackground';
import { MapContext } from './MapContext';
import { animateWebStory3 } from './animations';
import { useGSAP } from '@gsap/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true, error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#333', color: 'white', height: '100vh', overflow: 'auto' }}>
          <h2>React Crashed!</h2>
          <details open style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

const WebStory3 = () => {
  const container = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigatingRef = useRef(false);
  const lenisRef = useRef(null);

  // Kunci minimum (menghindari flicker di koneksi cepat) & kunci maksimum
  // (safety valve kalau map gagal load, misalnya token Mapbox hilang).
  const minLockUntilRef = useRef(0);
  const hardCapUntilRef = useRef(0);
  const mapReadyRef = useRef(false);

  // Semua reset posisi scroll harus lewat sini, bukan window.scrollTo() langsung —
  // Lenis punya targetScroll/animatedScroll sendiri yang di-drive oleh gsap.ticker
  // tiap frame. Kalau cuma window.scrollTo() yang dipanggil, Lenis tidak tahu
  // targetnya berubah dan akan "menimpa balik" ke posisi lamanya di frame berikutnya.
  const hardScrollTo = useCallback((top) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(top, { immediate: true, force: true });
    }
    window.scrollTo({ top, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    mapReadyRef.current = mapReady;
  }, [mapReady]);

  useEffect(() => {
    const target = location.state?.scrollTarget ?? 'top';
    let raf2 = null;

    const scrollToTarget = () => {
      if (target === 'bottom') {
        hardScrollTo(document.documentElement.scrollHeight);
      } else {
        hardScrollTo(0);
      }
    };

    const raf1 = requestAnimationFrame(() => {
      scrollToTarget();
      raf2 = requestAnimationFrame(scrollToTarget);
    });

    const timeoutId = window.setTimeout(scrollToTarget, 150);

    if (target === 'top') {
      const now = performance.now();
      minLockUntilRef.current = now + 700;
      // Jangan pernah mengunci lebih lama dari 4s — kalau map gagal load,
      // user tetap harus bisa scroll normal.
      hardCapUntilRef.current = now + 4000;
    } else {
      minLockUntilRef.current = 0;
      hardCapUntilRef.current = 0;
    }

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      window.clearTimeout(timeoutId);
    };
  }, [location.key, location.state, hardScrollTo]);

  // Begitu map selesai load, animateWebStory3() (lihat useGSAP di bawah) baru
  // menyisipkan pin-spacer besar untuk section 3 & 4 — di titik inilah tinggi
  // dokumen benar-benar final. rAF di sini dijadwalkan SETELAH semua efek pada
  // commit yang sama (termasuk useGSAP) selesai dieksekusi, jadi urutan aman.
  useEffect(() => {
    if (!mapReady) return;
    const target = location.state?.scrollTarget ?? 'top';
    if (target !== 'top') return;

    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      hardScrollTo(0);
    });

    return () => cancelAnimationFrame(raf);
  }, [mapReady, location.key, location.state, hardScrollTo]);

  useEffect(() => {
    let touchStartY = 0;

    const isSuppressed = () => {
      const now = performance.now();
      if (hardCapUntilRef.current === 0) return false; // target bukan 'top'
      if (now < minLockUntilRef.current) return true; // kunci minimum
      if (now > hardCapUntilRef.current) return false; // safety valve
      return !mapReadyRef.current; // tetap kunci sampai map (dan pin section) siap
    };

    const onWheelCapture = (event) => {
      if (!isSuppressed()) return;
      if (event.deltaY > 0) {
        event.preventDefault();
        hardScrollTo(0);
      }
    };

    const onKeyDownCapture = (event) => {
      if (!isSuppressed()) return;
      const downKeys = ['ArrowDown', 'PageDown', ' ', 'End'];
      if (downKeys.includes(event.key)) {
        event.preventDefault();
        hardScrollTo(0);
      }
    };

    const onTouchStartCapture = (event) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMoveCapture = (event) => {
      if (!isSuppressed()) return;
      const currentY = event.touches[0]?.clientY ?? touchStartY;
      const swipeDelta = touchStartY - currentY;
      if (swipeDelta > 0) {
        event.preventDefault();
        hardScrollTo(0);
      }
    };

    window.addEventListener('wheel', onWheelCapture, { passive: false });
    window.addEventListener('keydown', onKeyDownCapture);
    window.addEventListener('touchstart', onTouchStartCapture, { passive: true });
    window.addEventListener('touchmove', onTouchMoveCapture, { passive: false });

    return () => {
      window.removeEventListener('wheel', onWheelCapture);
      window.removeEventListener('keydown', onKeyDownCapture);
      window.removeEventListener('touchstart', onTouchStartCapture);
      window.removeEventListener('touchmove', onTouchMoveCapture);
    };
  }, [hardScrollTo]);

  useEffect(() => {
    const lenis = new Lenis();
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tickerFn = (time) => { lenis.raf(time * 1000); };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenisRef.current = null;
      lenis.destroy();
      gsap.ticker.remove(tickerFn);
      ScrollTrigger.getAll()
        .filter(st => container.current?.contains(st.trigger))
        .forEach(st => st.kill());
    };
  }, []);

  const handleMapLoad = (map) => {
    setMapInstance(map);
    setMapReady(true);
  };

  useGSAP(() => {
    if (!mapInstance) return;
    animateWebStory3(container.current, mapInstance);
    // Pin-spacer section 3 & 4 baru disisipkan di baris di atas — refresh
    // di sini supaya ScrollTrigger & Lenis langsung tahu tinggi dokumen final,
    // bukan menunggu resize/scroll event berikutnya.
    ScrollTrigger.refresh();
  }, { scope: container, dependencies: [mapInstance] });

  useEffect(() => {
    const threshold = 24;
    let touchStartY = 0;

    const isAtTop = () => window.scrollY <= threshold;

    const goToPreviousStory = () => {
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;
      navigate('/web-story-2', { state: { scrollTarget: 'bottom' } });
    };

    const onWheel = (event) => {
      if (event.deltaY < 0 && isAtTop()) goToPreviousStory();
    };

    const onKeyDown = (event) => {
      const upKeys = ['ArrowUp', 'PageUp', 'Home'];
      if (upKeys.includes(event.key) && isAtTop()) goToPreviousStory();
    };

    const onTouchStart = (event) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchEnd = (event) => {
      const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY;
      const swipeDelta = touchStartY - touchEndY;
      if (swipeDelta < -20 && isAtTop()) goToPreviousStory();
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [navigate]);

  return (
    <ErrorBoundary>
      <div ref={container} className="webstory3-container webstory3" style={{ position: 'relative' }}>
        {/* Satu Mapbox instance untuk seluruh WebStory */}
        <MapBackground onMapLoad={handleMapLoad} />

        {/* Sediakan map instance ke semua section via Context */}
        <MapContext.Provider value={{ map: mapInstance, mapReady }}>
          <div className="webstory3-sections" style={{ position: 'relative', zIndex: 10 }}>
            <Opening />
            <Urgency />
            <BigDataAnswers />
            <GlobeTransition />
            <InsightEnv />
            <InsightDamage />
            <InsightNTL />
            <InsightVulnerability />
            <InsightTimeline />
            <InsightRecovery />
            <ModuleMenu />
            <Closing />

            {/* Tombol kembali sementara untuk navigasi */}
            <div style={{ position: 'relative', zIndex: 99, padding: '2rem', textAlign: 'center', height: '50vh' }}>
              <Link to="/" style={{ color: 'var(--off-white)', textDecoration: 'underline' }}>
                Kembali ke Landing Page
              </Link>
            </div>
          </div>
        </MapContext.Provider>
      </div>
    </ErrorBoundary>
  );
};

export default WebStory3;