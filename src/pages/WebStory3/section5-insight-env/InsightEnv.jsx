import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import mapboxgl from 'mapbox-gl';
import './InsightEnv.css';
import { useSharedMap } from '../SharedMapProvider';

gsap.registerPlugin(ScrollTrigger);

const ENV_ITEMS = [
  { lng: 98.39, lat: 3.17, label: 'Gunung Api', color: '#ef4444' },     // Mt. Sinabung
  { lng: 99.0,  lat: 2.5,  label: 'Curah Hujan', color: '#3b82f6' },     // Toba Rainfall
  { lng: 98.7,  lat: 2.7,  label: 'Badan Air', color: '#06b6d4' },       // Lake Toba
  { lng: 97.8,  lat: 3.8,  label: 'Topografi', color: '#a3a3a3' },       // Highlands
  { lng: 96.2,  lat: 5.0,  label: 'Rawan Banjir', color: '#2563eb' },     // Pidie Jaya
  { lng: 100.6, lat: -0.8, label: 'Rawan Longsor', color: '#f97316' },    // Solok
];

export default function InsightEnv() {
  const sectionRef = useRef(null);
  const { map, mapReady } = useSharedMap();
  const [layersAdded, setLayersAdded] = useState(false);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapReady || !map) return;

    // We only want to add these markers once.
    if (markersRef.current.length === 0) {
      ENV_ITEMS.forEach((item) => {
        const el = document.createElement('div');
        el.className = 'env-marker';
        el.style.color = item.color;
        // Start hidden for GSAP scroll entrance
        el.style.opacity = '0';
        el.style.transform = 'scale(0)';

        el.innerHTML = `
          <div class="env-pulse" style="background-color: ${item.color}18; border-color: ${item.color}"></div>
          <div class="env-core" style="background-color: ${item.color}"></div>
        `;

        new mapboxgl.Marker({ element: el })
          .setLngLat([item.lng, item.lat])
          .addTo(map);

        markersRef.current.push(el);
      });
    }

    setLayersAdded(true);

    return () => {
      // Leave markers for crossfading
    };
  }, [mapReady, map]);

  useGSAP(() => {
    if (!layersAdded || !map) return;

    const s = sectionRef.current;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: s,
        start: 'top top',
        end: '+=150%',
        scrub: 0.8,
        pin: true,
      },
    });

    // Ease camera to InsightEnv's preferred view (Sumatra shifted left)
    const camera = { lng: 99.8, lat: 2.2, zoom: 6.1, pitch: 30, bearing: -5 };
    tl.to(camera, {
      lng: 99.4,
      lat: 3.0,
      zoom: 6.4,
      pitch: 35,
      bearing: -15,
      duration: 0.2,
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

    tl.fromTo(s.querySelector('.insight-subtitle'),
      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.2 }, 0.1)
    .fromTo(s.querySelector('.insight-title'),
      { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25 }, 0.15)
    .fromTo(s.querySelector('.insight-narrative'),
      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.2 }, 0.25);

    // Staggered reveal of Mapbox markers
    markersRef.current.forEach((el, i) => {
      tl.to(el, {
        opacity: 1,
        scale: 1,
        duration: 0.15,
        ease: 'back.out(2)',
      }, 0.35 + i * 0.08);
    });

    // Reveal legends/indicators in sidebar
    s.querySelectorAll('.insight-indicator').forEach((el, i) => {
      tl.fromTo(el, { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.08 }, 0.55 + i * 0.04);
    });

    // Fade markers out when leaving section so they don't leak into InsightDamage
    markersRef.current.forEach((el) => {
      tl.to(el, {
        opacity: 0,
        scale: 0,
        duration: 0.15,
      }, 0.9);
    });

    // Also ease camera back to default for InsightDamage
    tl.to(camera, {
      lng: 99.8,
      lat: 2.2,
      zoom: 6.1,
      pitch: 30,
      bearing: -5,
      duration: 0.15,
      onUpdate: () => {
        map.easeTo({
          center: [camera.lng, camera.lat],
          zoom: camera.zoom,
          pitch: camera.pitch,
          bearing: camera.bearing,
          duration: 0,
        });
      }
    }, 0.9);

  }, [layersAdded, map]);

  return (
    <section ref={sectionRef} id="section5-insightenv" className="section section-insightenv" style={{ background: 'transparent' }}>
      <div className="starfield">
        {Array.from({ length: 25 }).map((_, i) => (
          <span key={i} className="star" style={{
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            '--dur': `${2 + Math.random() * 4}s`, '--delay': `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      <div className="insight-layout">
        <div className="insight-content glass-card">
          <span className="insight-subtitle">Section 4: Modul 1 &amp; 2</span>
          <h2 className="insight-title">Membaca<br />Bahasa Alam</h2>
          <p className="insight-narrative">
            Kondisi fisik suatu wilayah dapat memberikan informasi awal mengenai potensi
            kerentanan terhadap bencana. Topografi, curah hujan, tutupan lahan, hingga
            keberadaan gunung api aktif — semuanya saling berinteraksi membentuk risiko bencana.
          </p>
          <div className="insight-indicators">
            {ENV_ITEMS.map((item, i) => (
              <div key={i} className="insight-indicator">
                <span className="dot" style={{ backgroundColor: item.color }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
