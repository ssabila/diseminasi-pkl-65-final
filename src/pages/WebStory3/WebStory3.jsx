import React, { useEffect, useRef, useState, Component } from 'react';
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
  const suppressDownScrollUntilRef = useRef(0);

  useEffect(() => {
    const target = location.state?.scrollTarget ?? 'top';
    let raf2 = null;

    const scrollToTarget = () => {
      if (target === 'bottom') {
        window.scrollTo({ top: document.documentElement.scrollHeight, left: 0, behavior: 'auto' });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    };

    const raf1 = requestAnimationFrame(() => {
      scrollToTarget();
      raf2 = requestAnimationFrame(scrollToTarget);
    });

    const timeoutId = window.setTimeout(scrollToTarget, 150);

    if (target === 'top') {
      suppressDownScrollUntilRef.current = performance.now() + 700;
    }

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      window.clearTimeout(timeoutId);
    };
  }, [location.key, location.state]);

  useEffect(() => {
    let touchStartY = 0;

    const isSuppressed = () => performance.now() < suppressDownScrollUntilRef.current;

    const onWheelCapture = (event) => {
      if (!isSuppressed()) return;
      if (event.deltaY > 0) {
        event.preventDefault();
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    };

    const onKeyDownCapture = (event) => {
      if (!isSuppressed()) return;
      const downKeys = ['ArrowDown', 'PageDown', ' ', 'End'];
      if (downKeys.includes(event.key)) {
        event.preventDefault();
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
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
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
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
  }, []);

  useEffect(() => {
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    const tickerFn = (time) => { lenis.raf(time * 1000); };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
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