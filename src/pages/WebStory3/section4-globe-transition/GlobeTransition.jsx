import React, { useRef, useEffect, useState } from 'react';
import { useSharedMap } from '../MapContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import sumatraOutlineUrl from '../geojson-data/sumatra_outline.geojson?url';
import sumatraFillUrl from '../geojson-data/bigdata_kabupaten_combined.geojson?url';
import './GlobeTransition.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * Section 4 — Globe + satelit → flyTo Sumatera
 */
export default function GlobeTransition() {
  const sectionRef = useRef(null);
  const { map, mapReady } = useSharedMap();
  const [sourceLoaded, setSourceLoaded] = useState(false);

  useEffect(() => {
    if (!mapReady || !map) return;

    if (!map.getSource('sumatra-outline-source')) {
      map.addSource('sumatra-outline-source', {
        type: 'geojson',
        data: sumatraOutlineUrl,
        lineMetrics: true // Wajib untuk mengaktifkan animasi line-trim-offset
      });
    }

    if (!map.getSource('sumatra-fill-source')) {
      map.addSource('sumatra-fill-source', {
        type: 'geojson',
        data: sumatraFillUrl
      });
    }

    if (!map.getLayer('sumatra-outline-fill')) {
      map.addLayer({
        id: 'sumatra-outline-fill',
        type: 'fill',
        source: 'sumatra-fill-source',
        paint: {
          'fill-color': '#f2c94c',
          'fill-opacity': 0 // Awalnya sembunyi
        }
      });
    }

    if (!map.getLayer('sumatra-outline-layer')) {
      map.addLayer({
        id: 'sumatra-outline-layer',
        type: 'line',
        source: 'sumatra-outline-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#f2c94c', // Kuning terang
          'line-width': 2, // Pertipis garis
          'line-opacity': 1, // Visibilitas 100%, dikontrol oleh trim
          'line-trim-offset': [0, 1] // Awalnya terpotong 100% (tidak terlihat)
        }
      });
    }
    setSourceLoaded(true);
  }, [map, mapReady]);

  useGSAP(() => {
    if (!map || !sourceLoaded) return;

    const animProxy = { progress: 0, fillOpacity: 0 };
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5 // Kembali pakai scrub untuk dikendalikan penuh oleh scroll
      }
    });

    // 0.1 to 0.7: Draw line from 0 to 1 (Syncs with Narasi 1)
    tl.to(animProxy, {
      progress: 1,
      duration: 0.6,
      ease: 'none',
      onUpdate: () => {
        if (map.getLayer('sumatra-outline-layer')) {
          map.setPaintProperty('sumatra-outline-layer', 'line-trim-offset', [animProxy.progress, 1]);
        }
      }
    }, 0.1);

    // 0.7 to 1.1: Fill area with soft opacity (Syncs with Narasi 2)
    tl.to(animProxy, {
      fillOpacity: 0.25, // Dipertebal sedikit dari 0.2
      duration: 0.4,
      ease: 'none',
      onUpdate: () => {
        if (map.getLayer('sumatra-outline-fill')) {
          map.setPaintProperty('sumatra-outline-fill', 'fill-opacity', animProxy.fillOpacity);
        }
      }
    }, 0.7);

    // 1.8 to 2.0: Erase line backwards and remove fill (Syncs with leaving section 4)
    tl.to(animProxy, {
      progress: 0,
      fillOpacity: 0,
      duration: 0.2,
      ease: 'none',
      onUpdate: () => {
        if (map.getLayer('sumatra-outline-layer')) {
          map.setPaintProperty('sumatra-outline-layer', 'line-trim-offset', [animProxy.progress, 1]);
        }
        if (map.getLayer('sumatra-outline-fill')) {
          map.setPaintProperty('sumatra-outline-fill', 'fill-opacity', animProxy.fillOpacity);
        }
      }
    }, 1.8);

  }, { dependencies: [map, sourceLoaded], scope: sectionRef });

  return (
    <section ref={sectionRef} id="section4-globetransition" className="section section-globetransition">
      <div className="globetransition-content-area">
        <div className="globetransition-panel-pinned">
          
          <div className="globe-card globe-card-1">
            <span className="globe-badge">&#10033; NARASI 1</span>
            <p className="globe-narrative">
              Saat bencana terjadi, kondisi suatu wilayah dapat berubah dengan cepat. Citra satelit membantu merekam perubahan tersebut secara berkala dan dalam cakupan yang luas.
            </p>
          </div>

          <div className="globe-card globe-card-2">
            <span className="globe-badge">&#10033; NARASI 2</span>
            <h2 className="globe-title">Melihat Wilayah dari<br/>Perspektif yang Lebih Luas</h2>
            <p className="globe-narrative">
              Melalui berbagai sumber data geospasial, kita dapat mengamati kondisi lingkungan, aktivitas manusia, hingga perubahan wilayah tanpa harus berada langsung di lokasi.
            </p>
          </div>

          <div className="globe-card globe-card-3">
            <span className="globe-badge">&#10033; Bencana Sumatera</span>
            <h2 className="globe-title">Apa yang Dapat<br/>Kita Pelajari?</h2>
            <p className="globe-narrative">
              Dengan data yang terus diperbarui dari waktu ke waktu, berbagai pola dan perubahan wilayah dapat ditelusuri. Lalu, apa yang dapat kita pelajari dari Bencana Sumatera?
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
