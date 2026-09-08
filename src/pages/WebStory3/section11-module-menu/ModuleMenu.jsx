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
  1: (<><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /><circle cx="12" cy="12" r="4" /><path d="m15 9-6 6" /></>),
  2: (<><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M16 14v6" /><path d="M8 14v6" /><path d="M12 16v6" /></>),
  3: (<><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /></>),
  4: (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></>),
  5: (<><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></>),
  6: (<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>),
  7: (<><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></>),
  8: (<><path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3" /><path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4" /><path d="M5 21h14" /></>),
};

/**
 * Data 8 modul sesuai rancangan.
 */
const MODULES = [
  {
    id: 1,
    title: 'Karakteristik Fisik & Kondisi Lingkungan',
    type: 'Dashboard',
    desc: 'Menyediakan konteks medan wilayah sebelum bencana terjadi. Modul ini bersifat statis/semi-statis dan berfungsi sebagai latar belakang analisis, menjelaskan mengapa suatu wilayah lebih rentan secara fisik dibanding wilayah lain.',
  },
  {
    id: 2,
    title: 'Monitoring Potensi Bahaya (Pemicu Bencana)',
    type: 'Dashboard',
    desc: 'Menangkap pemicu bencana banjir dan longsor secara near real-time.',
  },
  {
    id: 3,
    title: 'Lokasi & Estimasi Skala Genangan',
    type: 'Dashboard',
    desc: 'Menghasilkan peta lokasi dan skala genangan banjir.',
  },
  {
    id: 4,
    title: 'Kerentanan Wilayah',
    type: 'Dashboard',
    desc: 'Mengidentifikasi siapa yang tinggal di area terdampak dan seberapa rentan mereka.',
  },
  {
    id: 5,
    title: 'Analisis Dampak & Logistik',
    type: 'Webstory',
    desc: 'Mengkuantifikasi apa yang rusak dan menganalisis bagaimana bantuan bisa mencapai korban.',
  },
  {
    id: 6,
    title: 'Prioritas Wilayah Penanganan',
    type: 'Dashboard',
    desc: 'Menyatukan seluruh informasi dari modul sebelumnya menjadi satu skor prioritas.',
  },
  {
    id: 7,
    title: 'Kronologi & Perbandingan Lintas Kejadian',
    type: 'Webstory',
    desc: 'Menyajikan dimensi waktu dari kejadian bencana, dari sinyal awal, fase aktif, hingga surut, dan memungkinkan perbandingan lintas kejadian historis.',
  },
  {
    id: 8,
    title: 'Pemantauan Pemulihan Pasca-Bencana',
    type: 'Webstory',
    desc: 'Memantau sejauh mana wilayah terdampak telah pulih pasca-bencana, dari sisi ekosistem, ekonomi, dan infrastruktur.',
  },
];

/**
 * Section 11 — Slider Overview 8 Modul
 *
 * Scroll-driven horizontal slider showcasing all 8 modules.
 * Each module card enters from the left, holds centre, then exits to the right
 * with a combined slide-right + fade-out + scale-down transition.
 *
 * Design matches reference: webstorydesign.lovable.app
 */
export default function ModuleMenu() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const headerRef = useRef(null);

  useGSAP(() => {
    const s = sectionRef.current;
    if (!s) return;

    const cards = cardsRef.current.filter(Boolean);
    if (cards.length === 0) return;

    const header = headerRef.current;

    /* ── Initial states ── */
    // All cards: off-screen left, invisible, scaled down
    gsap.set(cards, {
      xPercent: -20,
      opacity: 0,
      scale: 0.88,
    });

    // Header: hidden initially
    if (header) {
      gsap.set(header, { opacity: 0, y: 30 });
    }

    /* ── Master timeline (pinned, scroll-driven) ── */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: s,
        start: 'top top',
        // 8 modules × ~120vh each = long enough for slow, deliberate scroll
        end: '+=1000%',
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
      },
    });

    /* ── Phase 0: Slide-up entry + header fade in ── */
    // The section itself slides up smoothly from below (handled by CSS initial
    // transform and this timeline intro). Header appears first.
    if (header) {
      tl.to(header, {
        opacity: 1,
        y: 0,
        duration: 0.04,
        ease: 'power2.out',
      }, 0);
    }

    /* ── Phase 1–8: Module cards ── */
    const totalCardPhase = 0.92; // 92% of timeline for cards
    const cardDuration = totalCardPhase / cards.length;
    const cardStartOffset = 0.05; // after header fade-in

    cards.forEach((card, i) => {
      const startTime = cardStartOffset + i * cardDuration;

      // Enter from left → center
      tl.to(card, {
        xPercent: 0,
        opacity: 1,
        scale: 1,
        duration: cardDuration * 0.30,
        ease: 'power2.out',
      }, startTime);

      // Hold in center (natural hold — gap between enter end and exit start)

      // Exit: slide right + fade out + scale down (except last card)
      if (i < cards.length - 1) {
        tl.to(card, {
          xPercent: 20,
          opacity: 0,
          scale: 0.85,
          duration: cardDuration * 0.30,
          ease: 'power2.in',
        }, startTime + cardDuration * 0.70);
      }
    });

    /* ── Phase 9: Last card fade out ── */
    const lastStart = cardStartOffset + (cards.length - 1) * cardDuration;
    tl.to(cards[cards.length - 1], {
      opacity: 0,
      scale: 0.85,
      xPercent: 10,
      duration: 0.04,
      ease: 'power2.in',
    }, lastStart + cardDuration * 0.85);

    /* ── Phase 10: Header fade out at very end ── */
    if (header) {
      tl.to(header, {
        opacity: 0,
        y: -20,
        duration: 0.03,
        ease: 'power2.in',
      }, 0.97);
    }

  }, []);

  return (
    <section
      ref={sectionRef}
      id="section11-modulemenu"
      className="section section-modulemenu"
    >
      {/* Starfield background */}
      <div className="starfield">
        {Array.from({ length: 35 }).map((_, i) => (
          <span key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            '--dur': `${2 + Math.random() * 4}s`,
            '--delay': `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* Ambient background glow */}
      <div className="module-bg-glow" />

      {/* Subtle background grid */}
      <div className="module-bg-grid" />

      {/* ── Section Header (persistent during scroll) ── */}
      <div ref={headerRef} className="module-section-header">
        <div className="module-header-left">
          <span className="module-section-label">Bagian 02</span>
          <h2 className="module-section-title">
            <em>Overview</em> <span className="module-accent">8 Modul</span>
          </h2>
        </div>
        <p className="module-section-hint">
          <em>scroll perlahan untuk meninjau setiap modul</em>
        </p>
      </div>

      {/* ── Module cards (stacked, animated via GSAP) ── */}
      <div className="module-cards-viewport">
        {MODULES.map((mod, i) => (
          <div
            key={mod.id}
            ref={el => cardsRef.current[i] = el}
            className="module-card"
          >
            <div className="module-card-grid">
              {/* Left: Visual card */}
              <div className="module-card-visual">
                {/* SVG icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="module-card-svg-icon"
                >
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
                <div className="module-card-num">
                  modul {String(mod.id).padStart(2, '0')}
                </div>
              </div>

              {/* Right: Info */}
              <div className="module-card-info">
                <p className="module-card-counter">
                  MODUL {String(mod.id).padStart(2, '0')} / 08
                </p>
                <h3 className="module-card-title">
                  {mod.type} {mod.title}
                </h3>
                <p className="module-card-desc">{mod.desc}</p>
                <button className="module-card-btn">
                  <span>Lihat Modul</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16" height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom decorative line */}
      <div className="module-bottom-line" />
    </section>
  );
}
