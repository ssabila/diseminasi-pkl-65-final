import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './InsightNTL.css';

import ntlSebelumData from '../geojson-data/ntl_sebelum_grid.geojson?url';
import ntlSesudahData from '../geojson-data/ntl_sesudah_grid.geojson?url';
import { useSharedMap } from '../SharedMapProvider';

gsap.registerPlugin(ScrollTrigger);

export default function InsightNTL() {
  const sectionRef = useRef(null);
  const { map, mapReady } = useSharedMap();
  const [layersAdded, setLayersAdded] = useState(false);

  useEffect(() => {
    if (!mapReady || !map) return;

    // Add NTL Sebelum source
    if (!map.getSource('ntl-sebelum-source')) {
      map.addSource('ntl-sebelum-source', {
        type: 'geojson',
        data: ntlSebelumData
      });
    }

    // Add NTL Sesudah source
    if (!map.getSource('ntl-sesudah-source')) {
      map.addSource('ntl-sesudah-source', {
        type: 'geojson',
        data: ntlSesudahData
      });
    }

    // Add Sebelum Layer (glowing grid style)
    if (!map.getLayer('ntl-sebelum-layer')) {
      map.addLayer({
        id: 'ntl-sebelum-layer',
        type: 'fill',
        source: 'ntl-sebelum-source',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'ntl_value'],
            0.05, '#f59e0b', // warm orange
            0.3, '#fef08a',  // bright yellow
            1.0, '#ffffff'   // intense gold-white center
          ],
          'fill-opacity': 0, // Controlled by GSAP
          'fill-antialias': true
        }
      });
    }

    // Add Sebelum Outline Layer (subtle grid boundaries)
    if (!map.getLayer('ntl-sebelum-outline')) {
      map.addLayer({
        id: 'ntl-sebelum-outline',
        type: 'line',
        source: 'ntl-sebelum-source',
        paint: {
          'line-color': '#f59e0b',
          'line-width': 0.5,
          'line-opacity': 0 // Controlled by GSAP
        }
      });
    }

    // Add Sesudah Layer (dimmed/post-disaster grid)
    if (!map.getLayer('ntl-sesudah-layer')) {
      map.addLayer({
        id: 'ntl-sesudah-layer',
        type: 'fill',
        source: 'ntl-sesudah-source',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'ntl_value'],
            0.05, 'rgba(217, 119, 6, 0.1)', // very dim amber
            0.3, '#d97706',                 // muted amber
            1.0, '#f59e0b'                  // only orange/amber, no white/yellow
          ],
          'fill-opacity': 0, // Controlled by GSAP
          'fill-antialias': true
        }
      });
    }

    // Add Sesudah Outline Layer (subtle dimmed grid boundaries)
    if (!map.getLayer('ntl-sesudah-outline')) {
      map.addLayer({
        id: 'ntl-sesudah-outline',
        type: 'line',
        source: 'ntl-sesudah-source',
        paint: {
          'line-color': '#d97706',
          'line-width': 0.5,
          'line-opacity': 0 // Controlled by GSAP
        }
      });
    }

    setLayersAdded(true);

    return () => {
      // Leave layers on the map for smooth crossfading
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
      },
    });

    // Content & title appear (map doesn't fade in here since it's global)
    tl.fromTo(s.querySelector('.insight-subtitle'),
        { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.15 }, 0.05)
      .fromTo(s.querySelector('.insight-title'),
        { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, 0.1)
      .fromTo(s.querySelector('.ntl-label-before'),
        { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.15);

    // Turn all lights on
    const animState = { sebelumOpacity: 0, sesudahOpacity: 0 };
    tl.to(animState, {
      sebelumOpacity: 1.0,
      duration: 0.2,
      onUpdate: () => {
        if (map.getLayer('ntl-sebelum-layer')) {
          map.setPaintProperty('ntl-sebelum-layer', 'fill-opacity', [
            '*',
            ['interpolate', ['linear'], ['get', 'ntl_value'], 0.05, 0.1, 1.0, 0.95],
            animState.sebelumOpacity
          ]);
        }
        if (map.getLayer('ntl-sebelum-outline')) {
          map.setPaintProperty('ntl-sebelum-outline', 'line-opacity', [
            '*',
            ['interpolate', ['linear'], ['get', 'ntl_value'], 0.05, 0.05, 1.0, 0.35],
            animState.sebelumOpacity
          ]);
        }
      }
    }, 0.18);

    tl.fromTo(s.querySelector('.insight-narrative'),
      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.15 }, 0.35);

    /* --- Phase 2: Lights dim (disaster impact) --- */
    tl.fromTo(s.querySelector('.ntl-label-before'),
      { opacity: 1 }, { opacity: 0, duration: 0.08 }, 0.55)
      .fromTo(s.querySelector('.ntl-label-after'),
        { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.58);

    // Crossfade lights to representing power outage
    tl.to(animState, {
      sebelumOpacity: 0,
      sesudahOpacity: 1.0,
      duration: 0.25,
      onUpdate: () => {
        if (map.getLayer('ntl-sebelum-layer')) {
          map.setPaintProperty('ntl-sebelum-layer', 'fill-opacity', [
            '*',
            ['interpolate', ['linear'], ['get', 'ntl_value'], 0.05, 0.1, 1.0, 0.95],
            animState.sebelumOpacity
          ]);
        }
        if (map.getLayer('ntl-sebelum-outline')) {
          map.setPaintProperty('ntl-sebelum-outline', 'line-opacity', [
            '*',
            ['interpolate', ['linear'], ['get', 'ntl_value'], 0.05, 0.05, 1.0, 0.35],
            animState.sebelumOpacity
          ]);
        }
        if (map.getLayer('ntl-sesudah-layer')) {
          map.setPaintProperty('ntl-sesudah-layer', 'fill-opacity', [
            '*',
            ['interpolate', ['linear'], ['get', 'ntl_value'], 0.05, 0.02, 1.0, 0.35],
            animState.sesudahOpacity
          ]);
        }
        if (map.getLayer('ntl-sesudah-outline')) {
          map.setPaintProperty('ntl-sesudah-outline', 'line-opacity', [
            '*',
            ['interpolate', ['linear'], ['get', 'ntl_value'], 0.05, 0.01, 1.0, 0.12],
            animState.sesudahOpacity
          ]);
        }
      }
    }, 0.55);

    // Fade OUT Sesudah lights at the very end when leaving the section!
    tl.to(animState, {
      sesudahOpacity: 0,
      duration: 0.15,
      onUpdate: () => {
        if (map.getLayer('ntl-sesudah-layer')) {
          map.setPaintProperty('ntl-sesudah-layer', 'fill-opacity', [
            '*',
            ['interpolate', ['linear'], ['get', 'ntl_value'], 0.05, 0.02, 1.0, 0.35],
            animState.sesudahOpacity
          ]);
        }
        if (map.getLayer('ntl-sesudah-outline')) {
          map.setPaintProperty('ntl-sesudah-outline', 'line-opacity', [
            '*',
            ['interpolate', ['linear'], ['get', 'ntl_value'], 0.05, 0.01, 1.0, 0.12],
            animState.sesudahOpacity
          ]);
        }
      }
    }, 0.95);

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
        <span className="ntl-phase-label ntl-label-before">Sebelum Bencana</span>
        <span className="ntl-phase-label ntl-label-after">Sesudah Bencana</span>

        <div className="insight-content glass-card">
          <span className="insight-subtitle">Section 6: Modul 4 &amp; 5</span>
          <h2 className="insight-title">Saat Cahaya<br />Meredup</h2>
          <p className="insight-narrative">
            Tidak semua dampak bencana terlihat secara langsung. Perubahan intensitas
            cahaya malam dapat memberikan gambaran mengenai terganggunya aktivitas
            masyarakat pada suatu wilayah setelah bencana terjadi.
          </p>
          <div className="insight-indicators">
            <div className="insight-indicator">
              <span className="dot" style={{ backgroundColor: '#ffd700', boxShadow: '0 0 6px #ffd700' }} />
              Cahaya Terang
            </div>
            <div className="insight-indicator">
              <span className="dot" style={{ backgroundColor: '#665500' }} />
              Cahaya Redup
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
