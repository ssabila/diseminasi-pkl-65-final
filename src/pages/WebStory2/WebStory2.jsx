import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLocation, useNavigate } from 'react-router-dom';

import BabakIntro from './1.Intro/intro';
import BabakInfrastruktur from './2.Infrastruktur/infrastruktur';
import BabakKeluarga from './3.Keluarga/keluarga';
import BabakKebutuhan from './4.Kebutuhan/kebutuhan';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────
   Progress bar indicator scroll
───────────────────────────────────────────*/
function ScrollProgress() {
  const barRef = useRef(null);
  useGSAP(() => {
    gsap.to(barRef.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
      },
    });
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: 3,
      background: 'rgba(255,255,255,0.08)',
      zIndex: 9999,
    }}>
      <div ref={barRef} style={{
        height: '100%',
        background: 'linear-gradient(90deg, #628141, #E67E22)',
        transformOrigin: 'left',
        transform: 'scaleX(0)',
      }} />
    </div>
  );
}

/* BabakNav removed per user request */

/* ─────────────────────────────────────────
   Komponen Utama: WebStory2
───────────────────────────────────────────*/
const WebStory2 = () => {
  const container = useRef(null);
  const [activeBabak, setActiveBabak] = React.useState('babak-1');
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigatingRef = useRef(false);

  React.useEffect(() => {
    const target = location.state?.scrollTarget ?? 'top';
    const scrollToTarget = () => {
      if (target === 'bottom') {
        window.scrollTo({ top: document.documentElement.scrollHeight, left: 0, behavior: 'auto' });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    };

    const raf1 = requestAnimationFrame(() => {
      scrollToTarget();
      requestAnimationFrame(scrollToTarget);
    });

    return () => cancelAnimationFrame(raf1);
  }, [location.key, location.state]);

  useGSAP(() => {
    const sections = gsap.utils.toArray('.babak-section');
    sections.forEach((section) => {
      const color = section.getAttribute('data-color');
      if (color) {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 45%',
          end: 'bottom 45%',
          onEnter: () => gsap.to(container.current, { backgroundColor: color, duration: 1.4, ease: 'power2.out' }),
          onEnterBack: () => gsap.to(container.current, { backgroundColor: color, duration: 1.4, ease: 'power2.out' }),
        });
      }
    });
  }, { scope: container });

  React.useEffect(() => {
    const threshold = 24;
    let touchStartY = 0;

    const isAtTop = () => window.scrollY <= threshold;
    const isAtBottom = () => (
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold
    );

    const goToNextStory = () => {
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;
      navigate('/web-story-3', { state: { scrollTarget: 'top' } });
    };

    const goToPreviousStory = () => {
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;
      navigate('/web-story-1', { state: { scrollTarget: 'bottom' } });
    };

    const onWheel = (event) => {
      if (event.deltaY > 0 && isAtBottom()) goToNextStory();
      if (event.deltaY < 0 && isAtTop()) goToPreviousStory();
    };

    const onKeyDown = (event) => {
      const downKeys = ['ArrowDown', 'PageDown', ' ', 'End'];
      const upKeys = ['ArrowUp', 'PageUp', 'Home'];
      if (downKeys.includes(event.key) && isAtBottom()) goToNextStory();
      if (upKeys.includes(event.key) && isAtTop()) goToPreviousStory();
    };

    const onTouchStart = (event) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchEnd = (event) => {
      const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY;
      const swipeDelta = touchStartY - touchEndY;
      if (swipeDelta > 20 && isAtBottom()) goToNextStory();
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
    <div
      ref={container}
      style={{
        backgroundColor: '#15173D', // Initial color as requested
        color: '#fff',
        fontFamily: 'var(--font-content)',
        transition: 'background-color 0s', // Let GSAP handle transition
      }}
    >
      <ScrollProgress />



      {/* 
         Setiap babak dibungkus minHeight 100vh agar memenuhi layar.
         Animasi GSAP ditaruh di DALAM komponen masing-masing, bukan di pembungkus ini. 
      */}
      {/* SVG Wave transition helper — reusable between sections */}
      <div id="babak-1" className="babak-section" data-color="#15173D" style={{ minHeight: '100vh', position: 'relative' }}>
        <BabakIntro />
      </div>

      <div id="babak-2" className="babak-section" data-color="#15173D" style={{ minHeight: '100vh', position: 'relative' }}>
        <BabakInfrastruktur />
      </div>

      <div id="babak-3" className="babak-section" data-color="#15173D" style={{ minHeight: '100vh', position: 'relative' }}>
        <BabakKeluarga />
      </div>

      <div id="babak-4" className="babak-section" data-color="#15173D" style={{ minHeight: '100vh', position: 'relative' }}>
        <BabakKebutuhan />
      </div>
    </div>
  );
};

export default WebStory2;