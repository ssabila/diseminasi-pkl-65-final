import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './InsightRecovery.css';
import { useSharedMap } from '../MapContext';

gsap.registerPlugin(ScrollTrigger);

/**
 * NDVI color categories for vegetation recovery visualization.
 * Gradient from barren (brown) → sparse (yellow) → moderate (light green) → dense (deep green)
 */
const NDVI_INDICATORS = [
  { label: 'Vegetasi Lebat', color: '#15803d', desc: 'NDVI > 0.6' },
  { label: 'Vegetasi Sedang', color: '#65a30d', desc: '0.3 – 0.6' },
  { label: 'Vegetasi Jarang', color: '#eab308', desc: '0.1 – 0.3' },
  { label: 'Tanah Terbuka', color: '#a16207', desc: 'NDVI < 0.1' },
];

/**
 * Generate a grid of NDVI-style "pixels" for raster satellite appearance.
 * Each pixel gets a random NDVI color to simulate satellite imagery.
 */
function generateNDVIPixels(rows, cols) {
  const colors = ['#15803d', '#22c55e', '#65a30d', '#a3e635', '#eab308', '#a16207', '#15803d', '#22c55e', '#65a30d'];
  const pixels = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      pixels.push({
        id: `px-${r}-${c}`,
        row: r,
        col: c,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: (r + c) * 0.02,
      });
    }
  }
  return pixels;
}

const PIXELS = generateNDVIPixels(12, 10);

/**
 * Section 10 — Jejak Pemulihan / NDVI — Modul 8
 *
 * Visualisasi pemulihan vegetasi pasca-bencana menggunakan data NDVI.
 * Layout: peta di kiri (background Mapbox), narasi glass-card di kanan.
 */
export default function InsightRecovery() {
  const sectionRef = useRef(null);
  const { map, mapReady } = useSharedMap();

  useGSAP(() => {
    if (!mapReady || !map) return;

    const s = sectionRef.current;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: s,
        start: 'top top',
        end: '+=200%',
        scrub: 0.8,
        pin: true,
      },
    });

    // Fade in section title block
    tl.fromTo(s.querySelector('.recovery-subtitle'),
      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.15 }, 0.05);
    tl.fromTo(s.querySelector('.recovery-title'),
      { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, 0.1);
    tl.fromTo(s.querySelector('.recovery-narrative'),
      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.15 }, 0.18);

    // Stagger NDVI pixels in the map area
    const pixels = s.querySelectorAll('.ndvi-pixel');
    if (pixels.length > 0) {
      tl.fromTo(pixels,
        { opacity: 0, scale: 0 },
        { opacity: 0.8, scale: 1, duration: 0.3, stagger: 0.005, ease: 'power2.out' }, 0.25);
    }

    // Reveal indicators
    s.querySelectorAll('.recovery-indicator').forEach((el, i) => {
      tl.fromTo(el, { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.08 }, 0.55 + i * 0.04);
    });

    // Narasi tambahan
    tl.fromTo(s.querySelector('.recovery-narrative-extra'),
      { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.15 }, 0.65);

    // Fade out pixels when leaving section
    if (pixels.length > 0) {
      tl.to(pixels, { opacity: 0, scale: 0.5, duration: 0.15 }, 0.82);
    }

    // Slide-up exit: all visible content slides up and fades out
    // Creates a smooth transition to section 11 (ModuleMenu)
    const contentElements = [
      s.querySelector('.recovery-layout'),
      s.querySelector('.ndvi-grid-overlay'),
    ].filter(Boolean);

    if (contentElements.length > 0) {
      tl.to(contentElements, {
        y: -60,
        opacity: 0,
        duration: 0.12,
        ease: 'power2.in',
        stagger: 0.02,
      }, 0.88);
    }

  }, [mapReady, map]);

  return (
    <section ref={sectionRef} id="section10-insightrecovery" className="section section-insightrecovery" style={{ background: 'transparent' }}>
      {/* Starfield */}
      <div className="starfield">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="star" style={{
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            '--dur': `${2 + Math.random() * 4}s`, '--delay': `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* NDVI pixel grid overlay (left area, over Mapbox) */}
      <div className="ndvi-grid-overlay">
        <div className="ndvi-grid">
          {PIXELS.map((px) => (
            <div
              key={px.id}
              className="ndvi-pixel"
              style={{
                backgroundColor: px.color,
                gridRow: px.row + 1,
                gridColumn: px.col + 1,
              }}
            />
          ))}
        </div>
        <div className="ndvi-grid-label">NDVI Raster</div>
      </div>

      {/* Narrative card (right) */}
      <div className="insight-layout recovery-layout">
        <div className="insight-content recovery-card">
          <span className="insight-subtitle recovery-subtitle">Section 9: Modul 8</span>
          <h2 className="insight-title recovery-title">Jejak<br />Pemulihan</h2>
          <p className="insight-narrative recovery-narrative">
            Pemulihan tidak selalu terlihat secara langsung. Perubahan kondisi vegetasi
            dapat menjadi salah satu indikator untuk mengamati bagaimana suatu wilayah
            berangsur pulih setelah terdampak bencana.
          </p>

          <div className="recovery-indicators">
            {NDVI_INDICATORS.map((item, i) => (
              <div key={i} className="recovery-indicator">
                <span className="recovery-dot" style={{ backgroundColor: item.color }} />
                <div className="recovery-indicator-text">
                  <span className="recovery-indicator-label">{item.label}</span>
                  <span className="recovery-indicator-desc">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="insight-narrative recovery-narrative-extra">
            Data yang diperbarui secara berkala membantu memantau perkembangan kondisi
            lingkungan dan menunjukkan wilayah yang mulai pulih setelah bencana.
          </p>
        </div>
      </div>
    </section>
  );
}
