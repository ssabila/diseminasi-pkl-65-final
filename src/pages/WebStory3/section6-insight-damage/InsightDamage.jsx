import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './InsightDamage.css';

import areaBanjirData from '../geojson-data/area_banjir.geojson?url';
import titikLongsorData from '../geojson-data/titik_longsor.geojson?url';
import { useSharedMap } from '../SharedMapProvider';

gsap.registerPlugin(ScrollTrigger);

export default function InsightDamage() {
  const sectionRef = useRef(null);
  const { map, mapReady } = useSharedMap();
  const [layersAdded, setLayersAdded] = useState(false);

  useEffect(() => {
    if (!mapReady || !map) return;

    // Add Banjir source (Polygon)
    if (!map.getSource('banjir-source')) {
      map.addSource('banjir-source', {
        type: 'geojson',
        data: areaBanjirData
      });
    }

    // Add Longsor source (Points)
    if (!map.getSource('longsor-source')) {
      map.addSource('longsor-source', {
        type: 'geojson',
        data: titikLongsorData
      });
    }

    // Add Banjir Layer
    if (!map.getLayer('banjir-layer')) {
      map.addLayer({
        id: 'banjir-layer',
        type: 'fill',
        source: 'banjir-source',
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0 // Start hidden
        }
      });
    }

    // Add Banjir Outline
    if (!map.getLayer('banjir-outline')) {
      map.addLayer({
        id: 'banjir-outline',
        type: 'line',
        source: 'banjir-source',
        paint: {
          'line-color': '#93c5fd',
          'line-width': 1.5,
          'line-opacity': 0
        }
      });
    }

    // Add Longsor Glow Layer
    if (!map.getLayer('longsor-glow')) {
      map.addLayer({
        id: 'longsor-glow',
        type: 'circle',
        source: 'longsor-source',
        paint: {
          'circle-radius': 14,
          'circle-color': '#ef4444',
          'circle-opacity': 0,
          'circle-blur': 0.8
        }
      });
    }
    
    // Add Longsor Layer
    if (!map.getLayer('longsor-layer')) {
      map.addLayer({
        id: 'longsor-layer',
        type: 'circle',
        source: 'longsor-source',
        paint: {
          'circle-radius': 5,
          'circle-color': '#ef4444',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0, // Start hidden
          'circle-stroke-opacity': 0
        }
      });
    }

    setLayersAdded(true);

    return () => {
      // We do not remove layers here so they smoothly crossfade into the next section
      // if the next section controls them, but for hygiene we could remove them.
      // Actually, since the map is shared, it's safer to keep them or remove carefully.
      // Let's leave them on the map.
    };
  }, [mapReady, map]);

  useGSAP(() => {
    if (!layersAdded || !map) return;

    const s = sectionRef.current;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: s,
        start: 'top top',
        end: '+=180%',
        scrub: 0.8,
        pin: true,
      },
    });

    // Content fade-in (no map to fade in anymore, it's global)
    tl.fromTo(s.querySelector('.insight-title'),
        { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, 0.1)
      .fromTo(s.querySelector('.insight-subtitle'),
        { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.15 }, 0.12);

    // Create an object to tween for Longsor
    const longsorAnim = { opacity: 0 };
    tl.to(longsorAnim, {
      opacity: 1,
      duration: 0.2,
      onUpdate: () => {
        if (map.getLayer('longsor-layer')) {
          map.setPaintProperty('longsor-layer', 'circle-opacity', longsorAnim.opacity);
          map.setPaintProperty('longsor-layer', 'circle-stroke-opacity', longsorAnim.opacity);
          map.setPaintProperty('longsor-glow', 'circle-opacity', longsorAnim.opacity * 0.4);
        }
      }
    }, 0.3);

    // Create an object to tween for Banjir
    const banjirAnim = { opacity: 0 };
    tl.to(banjirAnim, {
      opacity: 0.65,
      duration: 0.2,
      onUpdate: () => {
        if (map.getLayer('banjir-layer')) {
          map.setPaintProperty('banjir-layer', 'fill-opacity', banjirAnim.opacity);
          map.setPaintProperty('banjir-outline', 'line-opacity', banjirAnim.opacity * 1.5);
        }
      }
    }, 0.6);

    // Fade OUT layers when exiting the section so they don't persist into InsightNTL
    tl.to(longsorAnim, {
      opacity: 0,
      duration: 0.2,
      onUpdate: () => {
        if (map.getLayer('longsor-layer')) {
          map.setPaintProperty('longsor-layer', 'circle-opacity', longsorAnim.opacity);
          map.setPaintProperty('longsor-layer', 'circle-stroke-opacity', longsorAnim.opacity);
          map.setPaintProperty('longsor-glow', 'circle-opacity', longsorAnim.opacity * 0.4);
        }
      }
    }, 0.95);

    tl.to(banjirAnim, {
      opacity: 0,
      duration: 0.2,
      onUpdate: () => {
        if (map.getLayer('banjir-layer')) {
          map.setPaintProperty('banjir-layer', 'fill-opacity', banjirAnim.opacity);
          map.setPaintProperty('banjir-outline', 'line-opacity', banjirAnim.opacity * 1.5);
        }
      }
    }, 0.95);

    // Content narration and indicators fade-in
    tl.fromTo(s.querySelector('.insight-narrative'),
      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.2 }, 0.75);

    s.querySelectorAll('.insight-indicator').forEach((el, i) => {
      tl.fromTo(el, { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.08 }, 0.9 + i * 0.05);
    });
  }, [layersAdded, map]);

  return (
    <section ref={sectionRef} id="section6-insightdamage" className="section section-insightdamage" style={{ background: 'transparent' }}>
      <div className="starfield">
        {Array.from({ length: 25 }).map((_, i) => (
          <span key={i} className="star" style={{
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            '--dur': `${2 + Math.random() * 4}s`, '--delay': `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      <div className="insight-layout">
        {/* We REMOVED the insight-map div so the background MapProvider map shows through! */}
        
        <div className="insight-content">
          <span className="insight-subtitle">Section 5: Modul 3</span>
          <h2 className="insight-title">Seberapa Luas<br />Dampaknya?</h2>
          <p className="insight-narrative">
            Bencana meninggalkan jejak yang dapat diamati. Area terdampak banjir dan
            persebaran longsor dapat diidentifikasi untuk memahami kondisi wilayah secara lebih menyeluruh.
          </p>
          <div className="insight-indicators">
            <div className="insight-indicator">
              <span className="dot" style={{ backgroundColor: '#f97316' }} />
              Titik Longsor
            </div>
            <div className="insight-indicator">
              <span className="dot" style={{ backgroundColor: '#3b82f6' }} />
              Area Banjir (Estimasi Citra Satelit)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
