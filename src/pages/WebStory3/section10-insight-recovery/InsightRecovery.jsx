import React, { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './InsightRecovery.css';
import { useSharedMap } from '../MapContext';
import recoveryGeoJSONUrl from '../geojson-data/recovery_index.geojson?url';

gsap.registerPlugin(ScrollTrigger);

/**
 * Recovery choropleth legend — maps recovery_pct ranges to colours.
 * Scale: rendah (cokelat) → sedang (kuning-hijau) → tinggi (hijau)
 */
const RECOVERY_INDICATORS = [
  { label: 'Pemulihan Tinggi',  color: '#15803d', desc: 'recovery_pct ≥ 0.60' },
  { label: 'Pemulihan Sedang',  color: '#84cc16', desc: '0.40 – 0.60' },
  { label: 'Pemulihan Rendah',  color: '#eab308', desc: '0.25 – 0.40' },
  { label: 'Belum Pulih',       color: '#92400e', desc: 'recovery_pct < 0.25' },
];



const SOURCE_ID = 'recovery-choropleth-source';
const FILL_ID   = 'recovery-choropleth-fill';
const BORDER_ID = 'recovery-choropleth-border';

/**
 * Section 10 — Jejak Pemulihan / Choropleth — Modul 8
 *
 * Visualisasi pemulihan vegetasi pasca-bencana menggunakan choropleth
 * dari recovery_index.geojson (property: recovery_pct).
 * Layout: peta di kiri (background Mapbox), narasi glass-card di kanan.
 */
export default function InsightRecovery() {
  const sectionRef = useRef(null);
  const { map, mapReady } = useSharedMap();

  /* ── Add / remove choropleth layers on mount/unmount ── */
  useEffect(() => {
    if (!mapReady || !map) return;

    // Safeguard: clean up any stale layers from a previous render
    const cleanup = () => {
      try {
        if (map.getLayer && map.getLayer(BORDER_ID)) map.removeLayer(BORDER_ID);
        if (map.getLayer && map.getLayer(FILL_ID))   map.removeLayer(FILL_ID);
        if (map.getSource && map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch (e) { /* ignore cleanup errors */ }
    };

    cleanup();

    try {
      map.addSource(SOURCE_ID, { type: 'geojson', data: recoveryGeoJSONUrl });

      // Fill layer — colour driven by Mapbox step expression on recovery_pct
      map.addLayer({
        id:     FILL_ID,
        type:   'fill',
        source: SOURCE_ID,
        paint: {
          'fill-color': [
            'step', ['get', 'recovery_pct'],
            '#92400e',  // < 0.25 — belum pulih (cokelat)
            0.25, '#eab308',  // 0.25–0.40 — rendah (kuning)
            0.40, '#84cc16',  // 0.40–0.60 — sedang (kuning-hijau)
            0.60, '#15803d',  // ≥ 0.60  — tinggi (hijau)
          ],
          'fill-opacity': 0.55,
        },
      });

      // Border layer — thin white outline to show boundaries clearly
      map.addLayer({
        id:     BORDER_ID,
        type:   'line',
        source: SOURCE_ID,
        paint: {
          'line-color':   '#ffffff',
          'line-width':   1,
          'line-opacity': 0.5,
        },
      });
    } catch (err) {
      console.warn('InsightRecovery: failed to add choropleth layers', err);
    }

    return cleanup;
  }, [mapReady, map]);

  /* ── GSAP scroll animations (pixel refs removed) ── */
  useGSAP(() => {
    if (!mapReady || !map) return;

    const s  = sectionRef.current;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger:         s,
        start:           'top top',
        end:             '+=200%',
        scrub:           0.8,
        pin:             true,
        refreshPriority: 30,
        onEnter: () => {
          // Reset ke zoom & posisi yang sama dengan Section 6
          // agar seluruh wilayah choropleth terlihat
          if (map && map.flyTo) {
            map.flyTo({
              center:   [99.8, 2.2],
              zoom:     6.1,
              pitch:    30,
              bearing:  -5,
              duration: 800,
              essential: true,
            });
          }
        },
        onEnterBack: () => {
          if (map && map.flyTo) {
            map.flyTo({
              center:   [99.8, 2.2],
              zoom:     6.1,
              pitch:    30,
              bearing:  -5,
              duration: 800,
              essential: true,
            });
          }
        },
      },
    });

    // Fade in section title block
    tl.fromTo(s.querySelector('.recovery-subtitle'),
      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.15 }, 0.05);
    tl.fromTo(s.querySelector('.recovery-title'),
      { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, 0.1);
    tl.fromTo(s.querySelector('.recovery-narrative'),
      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.15 }, 0.18);

    // Reveal indicators
    s.querySelectorAll('.recovery-indicator').forEach((el, i) => {
      tl.fromTo(el, { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.08 }, 0.55 + i * 0.04);
    });

    // Narasi tambahan
    tl.fromTo(s.querySelector('.recovery-narrative-extra'),
      { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.15 }, 0.65);

    // Slide-up exit: all visible content slides up and fades out
    // Creates a smooth transition to section 11 (ModuleMenu)
    const contentElements = [s.querySelector('.recovery-layout')].filter(Boolean);
    if (contentElements.length > 0) {
      tl.to(contentElements, {
        y:        -60,
        opacity:  0,
        duration: 0.12,
        ease:     'power2.in',
        stagger:  0.02,
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
            '--dur':   `${2 + Math.random() * 4}s`,
            '--delay': `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* Narrative card (right) — choropleth renders directly on Mapbox background */}
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
            {RECOVERY_INDICATORS.map((item, i) => (
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
