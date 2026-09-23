import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './InsightRecovery.css';
import { useSharedMap } from '../MapContext';

// Gunakan batas wilayah kabupaten asli dengan data NDVI bawaan
import kabupatenGeoJSON from '../geojson-data/bigdata_kabupaten_combined.geojson?url';

gsap.registerPlugin(ScrollTrigger);

/**
 * Section 10 — Jejak Pemulihan / NDVI — Modul 8
 *
 * Visualisasi pemulihan vegetasi pasca-bencana menggunakan data NDVI.
 * Data recovery_index.geojson ditampilkan langsung di peta Mapbox sebagai
 * fill layer polygon per kabupaten, diwarnai gradien hijau berdasarkan recovery_pct.
 * Card narasi kanan berfungsi sebagai legenda & konteks.
 */

// Kamera desktop: fokus Sumatera tengah
const RECOVERY_CAMERA = { lng: 98.6, lat: 2.0, zoom: 6.5, pitch: 38, bearing: -5 };
// Kamera mobile: zoom out lebih jauh agar semua kabupaten (3 provinsi) terlihat
const RECOVERY_CAMERA_MOBILE = { lng: 98.8, lat: 1.0, zoom: 5.2, pitch: 25, bearing: 0 };
// Posisi globe Section 1 — digunakan saat exit ke Section 11
const GLOBE_EXIT_CAMERA = { lng: 100.0, lat: -1.0, zoom: 2.5, pitch: 0, bearing: 0 };

export default function InsightRecovery() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const { map, mapReady } = useSharedMap();
  const [layersAdded, setLayersAdded] = useState(false);

  // ── 1. Tambahkan layer NDVI recovery ke Mapbox ──
  useEffect(() => {
    if (!mapReady || !map) return;

    // Source: batas kabupaten asli dengan field recovery_ndvi_2025 bawaan
    if (!map.getSource('recovery-src')) {
      map.addSource('recovery-src', {
        type: 'geojson',
        data: kabupatenGeoJSON,
      });
    }

    // Fill layer — warna gradien NDVI berdasarkan recovery_ndvi_2025
    if (!map.getLayer('recovery-fill')) {
      map.addLayer({
        id: 'recovery-fill',
        type: 'fill',
        source: 'recovery-src',
        paint: {
          'fill-color': [
            'interpolate', ['linear'], ['get', 'recovery_ndvi_2025'],
            0.0, '#7f1d1d', // merah gelap
            0.35, '#dc2626', // merah
            0.45, '#eab308', // kuning
            0.60, '#65a30d', // hijau muda
            0.80, '#15803d', // hijau lebat
          ],
          'fill-opacity': 0,
        },
      });
    }

    // Outline layer
    if (!map.getLayer('recovery-line')) {
      map.addLayer({
        id: 'recovery-line',
        type: 'line',
        source: 'recovery-src',
        paint: {
          'line-color': 'rgba(255,255,255,0.2)',
          'line-width': 0.6,
          'line-opacity': 0,
        },
      });
    }

    // Label: nama kabupaten + nilai NDVI 2025
    if (!map.getLayer('recovery-label')) {
      map.addLayer({
        id: 'recovery-label',
        type: 'symbol',
        source: 'recovery-src',
        layout: {
          'text-field': [
            'concat',
            ['get', 'nmkab'],
            '\n',
            ['concat',
              ['to-string', ['round', ['*', ['get', 'recovery_ndvi_2025'], 100]]],
              '%'
            ]
          ],
          'text-size': 10,
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-anchor': 'center',
          'text-max-width': 8,
          'symbol-placement': 'point',
          'text-allow-overlap': false,
          'text-ignore-placement': false,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(0,0,0,0.7)',
          'text-halo-width': 1.5,
          'text-opacity': 0,
        },
      });
    }

    setLayersAdded(true);

    return () => {
      ['recovery-fill', 'recovery-line', 'recovery-label'].forEach(id => {
        try {
          if (map.getLayer(id)) {
            if (id === 'recovery-label') {
              map.setPaintProperty(id, 'text-opacity', 0);
            } else if (id === 'recovery-line') {
              map.setPaintProperty(id, 'line-opacity', 0);
            } else {
              map.setPaintProperty(id, 'fill-opacity', 0);
            }
          }
        } catch (e) { /* ignore */ }
      });
    };
  }, [mapReady, map]);

  // ── Helper: show / hide NDVI layers ──
  const showLayers = useCallback((opacity = 1) => {
    if (!map) return;
    try {
      if (map.getLayer('recovery-fill')) map.setPaintProperty('recovery-fill', 'fill-opacity', opacity * 0.82);
      if (map.getLayer('recovery-line')) map.setPaintProperty('recovery-line', 'line-opacity', opacity * 0.7);
      if (map.getLayer('recovery-label')) map.setPaintProperty('recovery-label', 'text-opacity', opacity);
    } catch (e) { /* ignore */ }
  }, [map]);

  const hideLayers = useCallback(() => {
    if (!map) return;
    try {
      if (map.getLayer('recovery-fill')) map.setPaintProperty('recovery-fill', 'fill-opacity', 0);
      if (map.getLayer('recovery-line')) map.setPaintProperty('recovery-line', 'line-opacity', 0);
      if (map.getLayer('recovery-label')) map.setPaintProperty('recovery-label', 'text-opacity', 0);
    } catch (e) { /* ignore */ }
  }, [map]);

  // ── 2. ScrollTrigger: kamera + layer + card ──
  useGSAP(() => {
    if (!layersAdded || !map) return;

    const s = sectionRef.current;
    const card = cardRef.current;

    ScrollTrigger.create({
      trigger: s,
      start: 'top top',
      end: '+=200%',
      pin: true,
      scrub: 0.8,
      refreshPriority: 30,

      onEnter: () => {
        const isMobile = window.innerWidth <= 900;
        const cam = isMobile ? RECOVERY_CAMERA_MOBILE : RECOVERY_CAMERA;

        // Desktop: beri padding kanan sebesar lebar card (~480px) agar
        // peta secara otomatis di-offset ke kiri — data tidak tertutup card
        const rightPad = isMobile ? 0 : Math.min(520, window.innerWidth * 0.38);
        map.setPadding({ left: 0, top: 0, right: rightPad, bottom: 0 });

        map.easeTo({
          center: [cam.lng, cam.lat],
          zoom: cam.zoom,
          pitch: cam.pitch,
          bearing: cam.bearing,
          duration: 1200,
          essential: true,
        });
        showLayers(1);
        if (card) gsap.fromTo(card,
          { opacity: 0, x: isMobile ? 0 : 60, y: isMobile ? 40 : 0 },
          { opacity: 1, x: 0, y: 0, duration: 0.8, ease: 'power2.out' }
        );
      },

      onEnterBack: () => {
        const isMobile = window.innerWidth <= 900;
        const cam = isMobile ? RECOVERY_CAMERA_MOBILE : RECOVERY_CAMERA;
        const rightPad = isMobile ? 0 : Math.min(520, window.innerWidth * 0.38);
        map.setPadding({ left: 0, top: 0, right: rightPad, bottom: 0 });
        map.easeTo({
          center: [cam.lng, cam.lat],
          zoom: cam.zoom,
          pitch: cam.pitch,
          bearing: cam.bearing,
          duration: 800,
          essential: true,
        });
        showLayers(1);
        if (card) gsap.to(card, { opacity: 1, x: 0, y: 0, duration: 0.5 });
      },

      // onUpdate: transisi exit yang scrub-driven dan mulus
      // Saat progress > 0.75 → mulai fade card & zoom-out kamera secara bertahap
      onUpdate: (self) => {
        const p = self.progress;
        if (p < 0.75) return; // tidak ada apa-apa di 75% pertama scroll

        // t: 0 saat progress=0.75, 1 saat progress=1.0
        const t = (p - 0.75) / 0.25;
        const eased = t * t * (3 - 2 * t); // smoothstep

        // Fade card
        if (card) gsap.set(card, { opacity: 1 - eased });

        // Fade peta layers
        try {
          const layerOp = (1 - eased) * 0.82;
          if (map.getLayer('recovery-fill'))  map.setPaintProperty('recovery-fill',  'fill-opacity',  layerOp);
          if (map.getLayer('recovery-line'))  map.setPaintProperty('recovery-line',  'line-opacity',  layerOp * 0.85);
          if (map.getLayer('recovery-label')) map.setPaintProperty('recovery-label', 'text-opacity',  1 - eased);
        } catch (_) { /* ignore */ }

        // Interpolasi kamera dari posisi saat ini menuju globe
        const isMobile = window.innerWidth <= 900;
        const cam = isMobile ? RECOVERY_CAMERA_MOBILE : RECOVERY_CAMERA;
        const lerpVal = (a, b, t) => a + (b - a) * t;
        map.setPadding({ left: 0, top: 0, right: Math.round(lerpVal(isMobile ? 0 : Math.min(520, window.innerWidth * 0.38), 0, eased)), bottom: 0 });
        map.jumpTo({
          center: [
            lerpVal(cam.lng, GLOBE_EXIT_CAMERA.lng, eased),
            lerpVal(cam.lat, GLOBE_EXIT_CAMERA.lat, eased),
          ],
          zoom:    lerpVal(cam.zoom,    GLOBE_EXIT_CAMERA.zoom,    eased),
          pitch:   lerpVal(cam.pitch,   GLOBE_EXIT_CAMERA.pitch,   eased),
          bearing: lerpVal(cam.bearing, GLOBE_EXIT_CAMERA.bearing, eased),
        });
      },

      onLeave: () => {
        // Pastikan semua tersembunyi penuh saat benar-benar keluar
        hideLayers();
        if (card) gsap.set(card, { opacity: 0 });
        map.setPadding({ left: 0, top: 0, right: 0, bottom: 0 });
      },

      onLeaveBack: () => {
        hideLayers();
        const isMobile = window.innerWidth <= 900;
        if (card) gsap.to(card, {
          opacity: 0,
          x: isMobile ? 0 : -60,
          y: isMobile ? -40 : 0,
          duration: 0.4,
        });
      },
    });

  }, [layersAdded, map, showLayers, hideLayers]);

  return (
    <section
      ref={sectionRef}
      id="section10-insightrecovery"
      className="section section-insightrecovery"
      style={{ background: 'transparent' }}
    >
      {/* Starfield */}
      <div className="starfield">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="star" style={{
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            '--dur': `${2 + Math.random() * 4}s`, '--delay': `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* ── Narrative card ── */}
      <div className="recovery-layout">
        <div className="recovery-card" ref={cardRef} style={{ opacity: 0 }}>
          <h2 className="insight-title recovery-title">Jejak Pemulihan</h2>
          <p className="insight-narrative recovery-narrative">
            Pemulihan tidak selalu terlihat secara langsung. Perubahan kondisi vegetasi
            dapat menjadi salah satu indikator untuk mengamati bagaimana suatu wilayah
            berangsur pulih setelah terdampak bencana.
          </p>

          <div className="recovery-indicators">
            {[
              { status: 'baik', label: 'Pemulihan Baik', desc: 'NDVI > 0.55', color: '#22c55e' },
              { status: 'sedang', label: 'Vegetasi Sedang', desc: '0.40 – 0.55', color: '#eab308' },
              { status: 'kritis', label: 'Pemulihan Lambat', desc: 'NDVI < 0.40', color: '#dc2626' },
            ].map((item) => (
              <div key={item.status} className="recovery-indicator">
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
