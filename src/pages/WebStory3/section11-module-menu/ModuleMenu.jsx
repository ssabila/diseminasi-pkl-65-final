import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ModuleMenu.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * SVG icon paths for each module (Lucide-style, matching reference design).
 */
const MODULE_ICONS = {
  1: (<><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /><circle cx="12" cy="12" r="4" /><path d="m15 9-6 6" /></>), // terrain/globe
  2: (<><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M16 14v6" /><path d="M8 14v6" /><path d="M12 16v6" /></>), // cloud-rain
  3: (<><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /></>), // waves
  4: (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></>), // users
  5: (<><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></>), // boxes
  6: (<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>), // target
  7: (<><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></>), // history
  8: (<><path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3" /><path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4" /><path d="M5 21h14" /></>), // sprout
};

/**
 * Data 8 modul sesuai PDF rancangan.
 */
const MODULES = [
  {
    id: 1,
    title: 'Karakteristik Fisik & Kondisi Lingkungan',
    type: 'Dashboard',
    desc: 'Menyediakan konteks medan wilayah sebelum bencana terjadi. Modul ini bersifat statis/semi-statis dan berfungsi sebagai latar belakang analisis, menjelaskan mengapa suatu wilayah lebih rentan secara fisik dibanding wilayah lain.',
    accent: 'linear-gradient(135deg, rgba(30,58,95,0.85), rgba(59,130,246,0.3))',
  },
  {
    id: 2,
    title: 'Monitoring Potensi Bahaya',
    type: 'Dashboard',
    desc: 'Menangkap pemicu bencana banjir dan longsor secara near real-time.',
    accent: 'linear-gradient(135deg, rgba(95,30,30,0.85), rgba(239,68,68,0.3))',
  },
  {
    id: 3,
    title: 'Lokasi & Estimasi Skala Genangan',
    type: 'Dashboard',
    desc: 'Menghasilkan peta lokasi dan skala genangan banjir.',
    accent: 'linear-gradient(135deg, rgba(14,74,90,0.85), rgba(6,182,212,0.3))',
  },
  {
    id: 4,
    title: 'Kerentanan Wilayah',
    type: 'Dashboard',
    desc: 'Mengidentifikasi siapa yang tinggal di area terdampak dan seberapa rentan mereka.',
    accent: 'linear-gradient(135deg, rgba(90,46,14,0.85), rgba(249,115,22,0.3))',
  },
  {
    id: 5,
    title: 'Analisis Dampak & Logistik',
    type: 'Webstory',
    desc: 'Mengkuantifikasi apa yang rusak dan menganalisis bagaimana bantuan bisa mencapai korban.',
    accent: 'linear-gradient(135deg, rgba(46,26,90,0.85), rgba(139,92,246,0.3))',
  },
  {
    id: 6,
    title: 'Prioritas Wilayah Penanganan',
    type: 'Dashboard',
    desc: 'Menyatukan seluruh informasi dari modul sebelumnya menjadi satu skor prioritas.',
    accent: 'linear-gradient(135deg, rgba(14,58,30,0.85), rgba(34,197,94,0.3))',
  },
  {
    id: 7,
    title: 'Kronologi & Perbandingan Lintas Kejadian',
    type: 'Webstory',
    desc: 'Menyajikan dimensi waktu dari kejadian bencana, dari sinyal awal, fase aktif, hingga surut, dan memungkinkan perbandingan lintas kejadian historis.',
    accent: 'linear-gradient(135deg, rgba(90,74,14,0.85), rgba(234,179,8,0.3))',
  },
  {
    id: 8,
    title: 'Pemantauan Pemulihan Pasca-Bencana',
    type: 'Webstory',
    desc: 'Memantau sejauh mana wilayah terdampak telah pulih pasca-bencana, dari sisi ekosistem, ekonomi, dan infrastruktur.',
    accent: 'linear-gradient(135deg, rgba(10,58,52,0.85), rgba(20,184,166,0.3))',
  },
];

/**
 * Section 11 — Slider Overview 8 Modul
 *
 * Scroll-driven horizontal slider showcasing all 8 modules.
 * Each module card appears from left, holds, then exits to the right.
 * Design matches reference: webstorydesign.lovable.app
 */
export default function ModuleMenu() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useGSAP(() => {
    const s = sectionRef.current;
    if (!s) return;

    const cards = cardsRef.current.filter(Boolean);
    if (cards.length === 0) return;

    // Set all cards initially off-screen to the left
    gsap.set(cards, { xPercent: -15, opacity: 0, scale: 0.9, filter: 'blur(0px)' });
    // Show the title first
    gsap.set(s.querySelector('.module-section-header'), { opacity: 0, y: 40 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: s,
        start: 'top top',
        end: '+=900%',
        scrub: 0.6,
        pin: true,
      },
    });

    // Fade in section header
    tl.to(s.querySelector('.module-section-header'), {
      opacity: 1, y: 0, duration: 0.06, ease: 'power2.out',
    }, 0);

    // Fade out section header before cards start
    tl.to(s.querySelector('.module-section-header'), {
      opacity: 0, y: -30, duration: 0.04, ease: 'power2.in',
    }, 0.08);

    const cardDuration = 0.9 / cards.length;

    cards.forEach((card, i) => {
      const startTime = 0.1 + i * cardDuration;

      // Enter from left
      tl.to(card, {
        xPercent: 0,
        opacity: 1,
        scale: 1,
        duration: cardDuration * 0.35,
        ease: 'power2.out',
      }, startTime);

      // Exit to right (fade out + scale down + slide right) — except last card
      if (i < cards.length - 1) {
        tl.to(card, {
          xPercent: 15,
          opacity: 0,
          scale: 0.9,
          duration: cardDuration * 0.35,
          ease: 'power2.in',
        }, startTime + cardDuration * 0.65);
      }
    });

    // Hold last card briefly then fade
    const lastStart = 0.1 + (cards.length - 1) * cardDuration;
    tl.to(cards[cards.length - 1], {
      opacity: 0,
      scale: 0.9,
      duration: 0.05,
      ease: 'power2.in',
    }, lastStart + cardDuration * 0.85);

  }, []);

  return (
    <section ref={sectionRef} id="section11-modulemenu" className="section section-modulemenu">
      {/* Starfield background */}
      <div className="starfield">
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} className="star" style={{
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            '--dur': `${2 + Math.random() * 4}s`, '--delay': `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* Ambient background glow */}
      <div className="module-bg-glow" />

      {/* Section header (appears briefly before cards) */}
      <div className="module-section-header">
        <span className="module-section-label">Eksplorasi</span>
        <h2 className="module-section-title">
          Overview <span className="module-accent">8 Modul</span>
        </h2>
        <p className="module-section-hint">Scroll perlahan untuk meninjau setiap modul</p>
      </div>

      {/* Module cards (stacked, animated via GSAP) */}
      <div className="module-cards-viewport">
        {MODULES.map((mod, i) => (
          <div
            key={mod.id}
            ref={el => cardsRef.current[i] = el}
            className="module-card"
          >
            <div className="module-card-grid">
              {/* Left: Visual placeholder (7 cols) */}
              <div className="module-card-visual" style={{ background: mod.accent }}>
                {/* SVG icon (Lucide style, matching reference) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                  className="module-card-svg-icon">
                  {MODULE_ICONS[mod.id]}
                </svg>
                {/* Decorative grid overlay */}
                <div className="module-card-grid-overlay" />
                {/* Decorative dots top-left */}
                <div className="module-card-dots">
                  <span className="dot-ember" />
                  <span className="dot-leaf" />
                  <span className="dot-sand" />
                </div>
                {/* Module number bottom-right */}
                <div className="module-card-num">modul {String(mod.id).padStart(2, '0')}</div>
              </div>

              {/* Right: Info (5 cols) */}
              <div className="module-card-info">
                <p className="module-card-counter">
                  MODUL {String(mod.id).padStart(2, '0')} / 08
                </p>
                <h3 className="module-card-title">{mod.type} {mod.title}</h3>
                <p className="module-card-desc">{mod.desc}</p>
                <button className="module-card-btn">
                  <span>Lihat Modul</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
