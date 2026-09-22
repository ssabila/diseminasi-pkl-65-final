import React, { useRef, useEffect, useState } from 'react';
import { useSharedMap } from '../MapContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import sumatraOutlineUrl from '../geojson-data/sumatra_outline.geojson?url';
import sumatraFillUrl from '../geojson-data/bigdata_kabupaten_combined.geojson?url';

// Official Grand Design Assets
import gundatalaOrbit from '../../../assets/Grand Design/Gundatala_3.png';
import gundatalaExplore from '../../../assets/Grand Design/Gundatala_5.png';
import gundatalaLearn from '../../../assets/Grand Design/Gundatala_7.png';
import patternWatermark from '../../../assets/Grand Design/Pattern.png';

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
          'fill-color': '#e5d9b6', // Palette cream Figma
          'fill-opacity': 0 // Sembunyi saat awal load
        }
      });
    }

    // Lapisan pendaran luar (Glow effect)
    // line-trim-offset [0, 1] = 100% dipangkas/tersembunyi saat awal load di Section 1-3
    if (!map.getLayer('sumatra-outline-glow')) {
      map.addLayer({
        id: 'sumatra-outline-glow',
        type: 'line',
        source: 'sumatra-outline-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#e5d9b6',
          'line-width': 6,
          'line-blur': 4,
          'line-opacity': 0,
          'line-trim-offset': [0, 1]
        }
      });
    }

    // Lapisan garis inti tajam
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
          'line-color': '#e5d9b6', // Cream solid
          'line-width': 2,
          'line-opacity': 0,
          'line-trim-offset': [0, 1]
        }
      });
    }
    setSourceLoaded(true);
  }, [map, mapReady]);

  useGSAP(() => {
    if (!map || !sourceLoaded) return;

    const animProxy = { progress: 0, opacity: 0, fillOpacity: 0 };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        refreshPriority: 86,
        onEnter: () => {
          if (map) {
            if (map.getLayer('sumatra-outline-layer')) {
              map.setPaintProperty('sumatra-outline-layer', 'line-opacity', 1);
            }
            if (map.getLayer('sumatra-outline-glow')) {
              map.setPaintProperty('sumatra-outline-glow', 'line-opacity', 0.6);
            }
          }
        },
        onLeaveBack: () => {
          // Ketika user scroll kembali ke Section 3, sembunyikan total garis pulau
          if (map) {
            if (map.getLayer('sumatra-outline-layer')) {
              map.setPaintProperty('sumatra-outline-layer', 'line-trim-offset', [0, 1]);
              map.setPaintProperty('sumatra-outline-layer', 'line-opacity', 0);
            }
            if (map.getLayer('sumatra-outline-glow')) {
              map.setPaintProperty('sumatra-outline-glow', 'line-trim-offset', [0, 1]);
              map.setPaintProperty('sumatra-outline-glow', 'line-opacity', 0);
            }
            if (map.getLayer('sumatra-outline-fill')) {
              map.setPaintProperty('sumatra-outline-fill', 'fill-opacity', 0);
            }
          }
        }
      }
    });

    // 0.0 to 0.1: Fade in line opacity
    tl.to(animProxy, {
      opacity: 1,
      duration: 0.1,
      ease: 'none',
      onUpdate: () => {
        if (map.getLayer('sumatra-outline-layer')) {
          map.setPaintProperty('sumatra-outline-layer', 'line-opacity', animProxy.opacity);
        }
        if (map.getLayer('sumatra-outline-glow')) {
          map.setPaintProperty('sumatra-outline-glow', 'line-opacity', animProxy.opacity * 0.6);
        }
      }
    }, 0);

    // 0.05 to 0.70: Menggambar garis tepi pulau Sumatera secara progresif
    // line-trim-offset [animProxy.progress, 1] memangkas dari progress s/d 1,
    // sehingga garis dari 0 s/d progress tergambar indah melingkari pulau
    tl.to(animProxy, {
      progress: 1,
      duration: 0.65,
      ease: 'power1.inOut',
      onUpdate: () => {
        const offset = [animProxy.progress, 1];
        if (map.getLayer('sumatra-outline-layer')) {
          map.setPaintProperty('sumatra-outline-layer', 'line-trim-offset', offset);
        }
        if (map.getLayer('sumatra-outline-glow')) {
          map.setPaintProperty('sumatra-outline-glow', 'line-trim-offset', offset);
        }
      }
    }, 0.05);

    // 0.65 to 1.1: Isi area pulau dengan warna cream transparan lembut
    tl.to(animProxy, {
      fillOpacity: 0.22,
      duration: 0.45,
      ease: 'sine.out',
      onUpdate: () => {
        if (map.getLayer('sumatra-outline-fill')) {
          map.setPaintProperty('sumatra-outline-fill', 'fill-opacity', animProxy.fillOpacity);
        }
      }
    }, 0.65);

    // 1.4 to 1.9: Transisi halus menuju Section 5 (garis tetap utuh 100%)
    tl.to(animProxy, {
      fillOpacity: 0.12,
      duration: 0.4,
      ease: 'sine.inOut',
      onUpdate: () => {
        if (map.getLayer('sumatra-outline-fill')) {
          map.setPaintProperty('sumatra-outline-fill', 'fill-opacity', animProxy.fillOpacity);
        }
      }
    }, 1.4);

  }, { dependencies: [map, sourceLoaded], scope: sectionRef });

  return (
    <section ref={sectionRef} id="section4-globetransition" className="section section-globetransition">
      <div className="globetransition-content-area">
        <div className="globetransition-panel-pinned">

          {/* Kartu 1 — Kiri Atas */}
          <div className="globe-card globe-card-1">
            <img src={patternWatermark} alt="" className="globe-card-watermark" aria-hidden="true" />

            <h2 className="globe-title">Dari Orbit ke Permukaan Bumi</h2>

            <p className="globe-narrative">
              Saat bencana terjadi, kondisi suatu wilayah dapat berubah dengan cepat. Citra satelit membantu merekam perubahan tersebut secara berkala dan dalam cakupan yang luas.
            </p>

          </div>

          {/* Kartu 2 — Kanan Bawah */}
          <div className="globe-card globe-card-2">
            <img src={patternWatermark} alt="" className="globe-card-watermark" aria-hidden="true" />

            <h2 className="globe-title">Melihat Wilayah dari Perspektif yang Lebih Luas</h2>

            <p className="globe-narrative">
              Melalui berbagai sumber data geospasial, kita dapat mengamati kondisi lingkungan, aktivitas manusia, hingga perubahan wilayah tanpa harus berada langsung di lokasi.
            </p>

          </div>

          {/* Kartu 3 — Kiri Bawah */}
          <div className="globe-card globe-card-3">
            <img src={patternWatermark} alt="" className="globe-card-watermark" aria-hidden="true" />

            <h2 className="globe-title">Apa yang Dapat Kita Pelajari?</h2>

            <p className="globe-narrative">
              Dengan data yang terus diperbarui dari waktu ke waktu, berbagai pola dan perubahan wilayah dapat ditelusuri. Mari telusuri jejak bencana dan dinamika pemulihan di Pulau Sumatera.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
