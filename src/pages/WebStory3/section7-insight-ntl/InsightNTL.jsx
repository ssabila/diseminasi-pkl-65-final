import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './InsightNTL.css';

import ntlSebelumData from '../geojson-data/ntl_sebelum_grid.geojson?url';
import ntlSesudahData from '../geojson-data/ntl_sesudah_grid.geojson?url';
import { useSharedMap } from '../MapContext';

gsap.registerPlugin(ScrollTrigger);

export default function InsightNTL() {
  const sectionRef = useRef(null);
  const { map, mapReady } = useSharedMap();
  const [layersAdded, setLayersAdded] = useState(false);

  useEffect(() => {
    if (!mapReady || !map) return;

    // NTL Grid Sources (Raster Grid mencakup seluruh wilayah fokus)
    if (!map.getSource('ntl-sebelum-source')) {
      map.addSource('ntl-sebelum-source', {
        type: 'geojson',
        data: ntlSebelumData
      });
    }

    if (!map.getSource('ntl-sesudah-source')) {
      map.addSource('ntl-sesudah-source', {
        type: 'geojson',
        data: ntlSesudahData
      });
    }

    // Bersihkan layer lama agar selalu ter-render bersih
    ['ntl-sebelum-heatmap', 'ntl-sesudah-heatmap', 
     'ntl-sebelum-layer', 'ntl-sebelum-outline', 
     'ntl-sesudah-layer', 'ntl-sesudah-outline'].forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
    });

    // ── A. RASTER GRID SEBELUM BENCANA (Cahaya Terang & Hangat Menutupi Seluruh Wilayah Fokus) ──
    map.addLayer({
      id: 'ntl-sebelum-layer',
      type: 'fill',
      source: 'ntl-sebelum-source',
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'ntl_value'],
          0.08, '#b45309', // warm amber
          0.30, '#f59e0b', // glowing amber
          0.60, '#fef08a', // bright yellow
          0.90, '#ffffff'  // blazing white core
        ],
        'fill-opacity': 0,
        'fill-antialias': true
      }
    });

    map.addLayer({
      id: 'ntl-sebelum-outline',
      type: 'line',
      source: 'ntl-sebelum-source',
      paint: {
        'line-color': '#fde047',
        'line-width': 0.4,
        'line-opacity': 0
      }
    });

    // ── B. RASTER GRID SESUDAH BENCANA (Cahaya Meredup Drastis Pascabencana) ──
    map.addLayer({
      id: 'ntl-sesudah-layer',
      type: 'fill',
      source: 'ntl-sesudah-source',
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'ntl_value'],
          0.04, '#451a03', // dark burnt amber
          0.15, '#78350f', // dim ember
          0.35, '#b45309', // muted amber
          0.70, '#d97706'  // faint orange
        ],
        'fill-opacity': 0,
        'fill-antialias': true
      }
    });

    map.addLayer({
      id: 'ntl-sesudah-outline',
      type: 'line',
      source: 'ntl-sesudah-source',
      paint: {
        'line-color': '#92400e',
        'line-width': 0.3,
        'line-opacity': 0
      }
    });

    setLayersAdded(true);

    return () => {
      // Leave layers for smooth crossfading
    };
  }, [mapReady, map]);

  useGSAP(() => {
    if (!layersAdded || !map) return;

    const s = sectionRef.current;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: s,
        start: 'top top',
        end: '+=200%',
        scrub: 0.8,
        pin: true,
        refreshPriority: 50,
      },
    });

    // Kamera bergeser halus memfokuskan wilayah Sumatera
    const camera = { lng: 98.6, lat: 2.0, zoom: 6.3, pitch: 35, bearing: -5 };
    tl.to(camera, {
      lng: 98.4,
      lat: 2.2,
      zoom: 6.4,
      pitch: 36,
      bearing: -8,
      duration: 0.25,
      onUpdate: () => {
        map.easeTo({
          center: [camera.lng, camera.lat],
          zoom: camera.zoom,
          pitch: camera.pitch,
          bearing: camera.bearing,
          duration: 0,
        });
      }
    }, 0);

    // Title & subtitle entrance
    tl.fromTo(s.querySelector('.insight-subtitle'),
      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.15 }, 0.05)
      .fromTo(s.querySelector('.insight-title'),
        { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, 0.1)
      .fromTo(s.querySelector('.ntl-label-before'),
        { opacity: 0 }, { opacity: 1, duration: 0.1, immediateRender: false }, 0.15)
      .fromTo(s.querySelector('.insight-narrative'),
        { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.15 }, 0.22);

    // ── Phase 1: Raster Cahaya Terang Muncul Penuh ──
    const animState = { sebelumOpacity: 0, sesudahOpacity: 0 };
    tl.to(animState, {
      sebelumOpacity: 0.85,
      duration: 0.25,
      onUpdate: () => {
        if (map.getLayer('ntl-sebelum-layer')) {
          map.setPaintProperty('ntl-sebelum-layer', 'fill-opacity', [
            '*',
            ['interpolate', ['linear'], ['get', 'ntl_value'], 0.08, 0.25, 0.90, 0.95],
            animState.sebelumOpacity
          ]);
        }
        if (map.getLayer('ntl-sebelum-outline')) {
          map.setPaintProperty('ntl-sebelum-outline', 'line-opacity', animState.sebelumOpacity * 0.25);
        }
      }
    }, 0.18);

    // ── Phase 2: Cahaya Meredup (Opasitas dikurangi drastis & beralih ke raster redup) ──
    tl.to(s.querySelector('.ntl-label-before'),
      { opacity: 0, duration: 0.08 }, 0.50)
      .fromTo(s.querySelector('.ntl-label-after'),
        { opacity: 0 }, { opacity: 1, duration: 0.1, immediateRender: false }, 0.54);

    tl.to(animState, {
      sebelumOpacity: 0,
      sesudahOpacity: 0.40, // Opasitas dikurangin sesuai instruksi
      duration: 0.28,
      onUpdate: () => {
        if (map.getLayer('ntl-sebelum-layer')) {
          map.setPaintProperty('ntl-sebelum-layer', 'fill-opacity', [
            '*',
            ['interpolate', ['linear'], ['get', 'ntl_value'], 0.08, 0.25, 0.90, 0.95],
            animState.sebelumOpacity
          ]);
        }
        if (map.getLayer('ntl-sebelum-outline')) {
          map.setPaintProperty('ntl-sebelum-outline', 'line-opacity', animState.sebelumOpacity * 0.25);
        }

        if (map.getLayer('ntl-sesudah-layer')) {
          map.setPaintProperty('ntl-sesudah-layer', 'fill-opacity', [
            '*',
            ['interpolate', ['linear'], ['get', 'ntl_value'], 0.04, 0.12, 0.70, 0.55],
            animState.sesudahOpacity
          ]);
        }
        if (map.getLayer('ntl-sesudah-outline')) {
          map.setPaintProperty('ntl-sesudah-outline', 'line-opacity', animState.sesudahOpacity * 0.15);
        }
      }
    }, 0.52);

    // ── Phase 3: Exit Fade-out saat keluar section ──
    tl.to(animState, {
      sesudahOpacity: 0,
      duration: 0.12,
      onUpdate: () => {
        if (map.getLayer('ntl-sesudah-layer')) {
          map.setPaintProperty('ntl-sesudah-layer', 'fill-opacity', 0);
        }
        if (map.getLayer('ntl-sesudah-outline')) {
          map.setPaintProperty('ntl-sesudah-outline', 'line-opacity', 0);
        }
      }
    }, 0.92);

    // Fade out glass card & labels when leaving Section 7
    const card = s.querySelector('.glass-card');
    if (card) {
      tl.to(card, {
        opacity: 0,
        y: -40,
        duration: 0.12,
        ease: 'power2.in',
      }, 0.90);
    }
    tl.to([s.querySelector('.ntl-label-before'), s.querySelector('.ntl-label-after')], {
      opacity: 0,
      duration: 0.1
    }, 0.88);

  }, [layersAdded, map]);

  return (
    <section ref={sectionRef} id="section7-insightntl" className="section section-insightntl" style={{ background: 'transparent' }}>
      <div className="starfield">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="star" style={{
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            '--dur': `${3 + Math.random() * 4}s`, '--delay': `${Math.random() * 3}s`,
            '--min-op': '0.05', '--max-op': '0.25',
          }} />
        ))}
      </div>

      <div className="insight-layout">
        {/* Before / After labels overlay over the global map */}
        <span className="ntl-phase-label ntl-label-before">Kondisi Normal (Sebelum Bencana) • Emisi Cahaya Malam Tinggi</span>
        <span className="ntl-phase-label ntl-label-after">Pascabencana • Intensitas Cahaya Meredup (Blackout)</span>

        <div className="insight-content glass-card">
          <span className="insight-subtitle">Section 6: Modul 4 &amp; 5</span>
          <h2 className="insight-title">Saat Cahaya<br />Meredup</h2>
          <p className="insight-narrative">
            Tidak semua dampak bencana terlihat secara langsung. Perubahan intensitas
            cahaya malam (Nighttime Light) dapat memberikan gambaran mengenai terganggunya aktivitas
            masyarakat pada suatu wilayah setelah bencana terjadi.
          </p>
          <div className="insight-indicators">
            <div className="insight-indicator">
              <span className="dot" style={{ backgroundColor: '#ffd700', boxShadow: '0 0 10px #ffd700' }} />
              Cahaya Terang (Aktivitas Normal)
            </div>
            <div className="insight-indicator">
              <span className="dot" style={{ backgroundColor: '#b45309', boxShadow: '0 0 6px rgba(180, 83, 9, 0.5)' }} />
              Cahaya Redup (Wilayah Terdampak Bencana)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
