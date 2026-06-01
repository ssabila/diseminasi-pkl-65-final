/**
 * WebStory2.jsx — Halaman Utama Web Story 2: Hasil Pendataan R3P
 *
 * Menggabungkan 4 babak:
 *   1. BabakIntro        — Babak 1: Intro & Skala Dampak
 *   2. BabakInfrastruktur — Babak 2: Infrastruktur (3 scene)
 *   3. BabakKeluarga     — Babak 3: Keluarga (3 scene)
 *   4. BabakKebutuhan    — Babak 4: Kebutuhan & Outro
 *
 * Animasi scroll detail (pinning, zoom) diatur di dalam MASING-MASING komponen babak.
 */

import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
        scrub: true,
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
        background: 'linear-gradient(90deg, var(--green), #8aaf5a)',
        transformOrigin: 'left',
        transform: 'scaleX(0)',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   Navigasi Babak — fixed bottom
───────────────────────────────────────────*/
const BABAK_NAV = [
  { id: 'babak-1', label: 'Intro', color: '#fff' },
  { id: 'babak-2', label: 'Infrastruktur', color: '#4FC3F7' },
  { id: 'babak-3', label: 'Keluarga', color: '#FFB74D' },
  { id: 'babak-4', label: 'Kebutuhan', color: '#FF8A65' },
];

function BabakNav({ active }) {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav style={{
      position: 'fixed',
      bottom: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '0.5rem',
      background: 'rgba(10,11,31,0.85)',
      backdropFilter: 'blur(12px)',
      padding: '0.6rem 1rem',
      borderRadius: 40,
      border: '1px solid rgba(255,255,255,0.1)',
      zIndex: 9998,
    }}>
      {BABAK_NAV.map(b => (
        <button
          key={b.id}
          onClick={() => scrollTo(b.id)}
          title={b.label}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 20,
            border: 'none',
            background: active === b.id ? `${b.color}22` : 'transparent',
            color: active === b.id ? b.color : 'rgba(255,255,255,0.4)',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-content)',
            fontWeight: active === b.id ? 700 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.04em',
            borderBottom: active === b.id ? `2px solid ${b.color}` : '2px solid transparent',
          }}
        >
          {b.label}
        </button>
      ))}
    </nav>
  );
}

/* ─────────────────────────────────────────
   Komponen Utama: WebStory2
───────────────────────────────────────────*/
const WebStory2 = () => {
  const container = useRef(null);
  const [activeBabak, setActiveBabak] = React.useState('babak-1');

  // Deteksi Babak aktif saat di-scroll
  React.useEffect(() => {
    const sections = BABAK_NAV.map(b => document.getElementById(b.id));
    const handleScroll = () => {
      const scrollY = window.scrollY + window.innerHeight * 0.4;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i];
        if (el && el.offsetTop <= scrollY) {
          setActiveBabak(BABAK_NAV[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={container}
      style={{
        backgroundColor: 'var(--navy)', // Menggunakan warna tema global
        color: 'var(--beige)',
        minHeight: '100vh',
        fontFamily: 'var(--font-content)',
        overflowX: 'hidden', // Mencegah horizontal scroll bocor
      }}
    >
      <ScrollProgress />

      {/* Header Navigasi Atas */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 9990,
        padding: '0.75rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(21, 23, 61, 0.5)', // Warna var(--navy) transparan
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span className="playfair-display" style={{ fontSize: '0.9rem', letterSpacing: '0.1em', color: 'var(--green)' }}>
          Web Story · R3P
        </span>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>
          ← Beranda
        </Link>
      </div>

      {/* 
         Setiap babak dibungkus minHeight 100vh agar memenuhi layar.
         Animasi GSAP ditaruh di DALAM komponen masing-masing, bukan di pembungkus ini. 
      */}
      <div id="babak-1" style={{ minHeight: '100vh', position: 'relative' }}>
        <BabakIntro />
      </div>

      <div id="babak-2" style={{ minHeight: '100vh', position: 'relative' }}>
        <BabakInfrastruktur />
      </div>

      <div id="babak-3" style={{ minHeight: '100vh', position: 'relative' }}>
        <BabakKeluarga />
      </div>

      <div id="babak-4" style={{ minHeight: '100vh', position: 'relative' }}>
        <BabakKebutuhan />
      </div>

      <BabakNav active={activeBabak} />
    </div>
  );
};

export default WebStory2;