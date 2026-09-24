import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSharedMap } from '../MapContext';
import './BigDataAnswers.css';

// Import optimized geojson (Vite ?url query to get file path)
import bigDataGeoJson from '../geojson-data/bigdata_kabupaten_combined.geojson?url';

// Import Gundatala Mascots for each step
import gundatala9 from '../../../assets/Grand Design/Gundatala_9.png';
import gundatala6 from '../../../assets/Grand Design/Gundatala_6.png';
import gundatala10 from '../../../assets/Grand Design/Gundatala_10.png';
import gundatala8 from '../../../assets/Grand Design/Gundatala_8.png';
import gundatala4 from '../../../assets/Grand Design/Gundatala_4.png';

gsap.registerPlugin(ScrollTrigger);

/**
 * Section 3 — Big Data Bisa Menjawab (5 Pertanyaan Scroll-Triggered)
 */
export default function BigDataAnswers() {
  const sectionRef = useRef(null);
  const { map, mapReady } = useSharedMap();
  const [layersAdded, setLayersAdded] = useState(false);

  // Target height for the popped-up stack layer (dikurangi agar tidak terlalu tinggi)
  const stackZ = 30000;
  // Ketebalan plat 3D (ditingkatkan agar terlihat tebal seperti balok 3D)
  const thickness = 15000;

  const steps = [
    {
      id: 'step-1',
      question: 'Bagaimana bencana terjadi?',
      description: 'Visualisasi curah hujan sebagai salah satu faktor yang dapat digunakan untuk memahami dan menganalisis pemicu terjadinya bencana.',
      badge: 'Satelit Presipitasi (GPM)',
      mascot: gundatala9,
      mascotAlt: 'Gundatala Explorer',
      flipMascot: true,
      legend: {
        title: 'Curah Hujan (mm/hari)',
        min: '0 mm',
        max: '>100 mm',
        gradient: 'linear-gradient(90deg, #bfdbfe, #93c5fd, #3b82f6, #1d4ed8)',
        labels: ['Ringan', 'Sedang', 'Ekstrem']
      },
      insight: 'Akumulasi curah hujan ekstrem terpusat di wilayah hulu memicu luapan air ke hilir.'
    },
    {
      id: 'step-2',
      question: 'Seberapa luas dampaknya?',
      description: 'Area terdampak bencana, sehingga pengguna dapat melihat cakupan wilayah yang terkena dampak genangan secara presisi.',
      badge: 'Radar SAR Sentinel-1',
      mascot: gundatala6,
      mascotAlt: 'Gundatala Cemas',
      flipMascot: false,
      legend: {
        title: 'Estimasi Area Terdampak (Ha)',
        min: '0 Ha',
        max: '>20.000 Ha',
        gradient: 'linear-gradient(90deg, #fecaca, #fca5a5, #ef4444, #b91c1c)',
        labels: ['Rendah', 'Sedang', 'Tinggi']
      },
      insight: 'Citra radar SAR mampu menembus awan tebal untuk memetakan genangan aktual.'
    },
    {
      id: 'step-3',
      question: 'Siapa yang paling rentan?',
      description: 'Kepadatan penduduk pada wilayah terdampak untuk mengidentifikasi kelompok masyarakat yang memiliki tingkat kerentanan lebih tinggi.',
      badge: 'Gridded Population',
      mascot: gundatala10,
      mascotAlt: 'Gundatala Menunjuk Rentan',
      flipMascot: true,
      legend: {
        title: 'Kepadatan Penduduk (jiwa/km²)',
        min: '0',
        max: '>1.000',
        gradient: 'linear-gradient(90deg, #fed7aa, #fdba74, #f97316, #c2410c)',
        labels: ['Jarang', 'Sedang', 'Padat']
      },
      insight: 'Overlay spasial membantu mengenali kantong populasi padat di zona berisiko.'
    },
    {
      id: 'step-4',
      question: 'Wilayah mana yang harus diprioritaskan?',
      description: 'Peta prioritas penanganan, yang menunjukkan wilayah-wilayah yang memerlukan perhatian dan intervensi darurat lebih cepat.',
      badge: 'Multi-Criteria Spatial Index',
      mascot: gundatala8,
      mascotAlt: 'Gundatala Prioritas',
      flipMascot: true,
      legend: {
        title: 'Tingkat Prioritas Intervensi',
        min: 'Rendah',
        max: 'Sangat Mendesak',
        gradient: 'linear-gradient(90deg, #e9d5ff, #d8b4fe, #a855f7, #7e22ce)',
        labels: ['Normal', 'Siaga', 'Prioritas 1']
      },
      insight: 'Mengarahkan tim evakuasi dan logistik secara terukur pada 48 jam pertama.'
    },
    {
      id: 'step-5',
      question: 'Kapan wilayah mulai pulih?',
      description: 'Recovery timelapse yang memperlihatkan perkembangan kondisi vegetasi dan wilayah pascabencana dari waktu ke waktu.',
      badge: 'Optik Satelit Sentinel-2 (NDVI)',
      mascot: gundatala4,
      mascotAlt: 'Gundatala Pemulihan',
      flipMascot: true,
      legend: {
        title: 'Indeks Kehijauan Vegetasi (NDVI)',
        min: '0.6',
        max: '0.9+',
        gradient: 'linear-gradient(90deg, #bbf7d0, #86efac, #22c55e)',
        labels: ['Mulai Pulih', 'Stabil', 'Optimal']
      },
      insight: 'Pemantauan berkala memastikan ekosistem dan sosial-ekonomi berangsur normal.'
    }
  ];

  useGSAP(() => {
    if (!mapReady || !map || !layersAdded) return;

    const layerIds = ['bd-hujan-layer', 'bd-dampak-layer', 'bd-penduduk-layer', 'bd-prioritas-layer', 'bd-recovery-layer'];

    // Proxy object to hold animation state (z position and opacity)
    const proxy = {
      l0_z: 0, l0_op: 0,
      l1_z: 0, l1_op: 0,
      l2_z: 0, l2_op: 0,
      l3_z: 0, l3_op: 0,
      l4_z: 0, l4_op: 0,
    };

    const updateLayer = (index, z, op) => {
      const layerId = layerIds[index];
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, 'fill-extrusion-base', z);
        map.setPaintProperty(layerId, 'fill-extrusion-height', z + thickness);
        map.setPaintProperty(layerId, 'fill-extrusion-opacity', op);
      }
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        refreshPriority: 90,
        onEnter: () => {
          if (map.getLayer('bd-basemap-mask')) map.setPaintProperty('bd-basemap-mask', 'fill-opacity', 0.95);
        },
        onLeave: () => {
          if (map.getLayer('bd-basemap-mask')) map.setPaintProperty('bd-basemap-mask', 'fill-opacity', 0);
        },
        onEnterBack: () => {
          if (map.getLayer('bd-basemap-mask')) map.setPaintProperty('bd-basemap-mask', 'fill-opacity', 0.95);
        },
        onLeaveBack: () => {
          if (map.getLayer('bd-basemap-mask')) map.setPaintProperty('bd-basemap-mask', 'fill-opacity', 0);
        }
      }
    });

    // We have 5 cards, total timeline duration = 5
    // Sync matches animations.js: Card i fades in from i to i+0.5, fades out from i+0.5 to i+1.0

    // Stage 1 (0-1): Layer 1 pops up quickly at the very start (max opacity 1)
    tl.to(proxy, { l0_z: stackZ, l0_op: 1, duration: 0.5, ease: 'power1.out', onUpdate: () => updateLayer(0, proxy.l0_z, proxy.l0_op) }, 0);

    // Stage 2 (1-2): Layer 1 goes down (0.5 to 1.0), Layer 2 pops up (1.0 to 1.5)
    tl.to(proxy, { l0_z: 0, l0_op: 0, duration: 0.5, ease: 'power1.in', onUpdate: () => updateLayer(0, proxy.l0_z, proxy.l0_op) }, 0.5);
    tl.to(proxy, { l1_z: stackZ, l1_op: 1, duration: 0.5, ease: 'power1.out', onUpdate: () => updateLayer(1, proxy.l1_z, proxy.l1_op) }, 1.0);

    // Stage 3 (2-3): Layer 2 goes down (1.5 to 2.0), Layer 3 pops up (2.0 to 2.5)
    tl.to(proxy, { l1_z: 0, l1_op: 0, duration: 0.5, ease: 'power1.in', onUpdate: () => updateLayer(1, proxy.l1_z, proxy.l1_op) }, 1.5);
    tl.to(proxy, { l2_z: stackZ, l2_op: 1, duration: 0.5, ease: 'power1.out', onUpdate: () => updateLayer(2, proxy.l2_z, proxy.l2_op) }, 2.0);

    // Stage 4 (3-4): Layer 3 goes down (2.5 to 3.0), Layer 4 pops up (3.0 to 3.5)
    tl.to(proxy, { l2_z: 0, l2_op: 0, duration: 0.5, ease: 'power1.in', onUpdate: () => updateLayer(2, proxy.l2_z, proxy.l2_op) }, 2.5);
    tl.to(proxy, { l3_z: stackZ, l3_op: 1, duration: 0.5, ease: 'power1.out', onUpdate: () => updateLayer(3, proxy.l3_z, proxy.l3_op) }, 3.0);

    // Stage 5 (4-5): Layer 4 goes down (3.5 to 4.0), Layer 5 pops up (4.0 to 4.5)
    tl.to(proxy, { l3_z: 0, l3_op: 0, duration: 0.5, ease: 'power1.in', onUpdate: () => updateLayer(3, proxy.l3_z, proxy.l3_op) }, 3.5);
    tl.to(proxy, { l4_z: stackZ, l4_op: 1, duration: 0.5, ease: 'power1.out', onUpdate: () => updateLayer(4, proxy.l4_z, proxy.l4_op) }, 4.0);

    // End: Layer 5 goes down right as we transition to Section 4 (4.8 to 5.0)
    tl.to(proxy, { l4_z: 0, l4_op: 0, duration: 0.2, ease: 'power1.in', onUpdate: () => updateLayer(4, proxy.l4_z, proxy.l4_op) }, 4.8);

  }, { dependencies: [mapReady, map, layersAdded], scope: sectionRef });

  useEffect(() => {
    if (!mapReady || !map) return;

    if (!map.getSource('bigdata-source')) {
      map.addSource('bigdata-source', {
        type: 'geojson',
        data: bigDataGeoJson
      });
    }

    // LAYER 0: Basemap Mask (Menutupi basemap khusus untuk Aceh, Sumut, Sumbar)
    if (!map.getLayer('bd-basemap-mask')) {
      map.addLayer({
        id: 'bd-basemap-mask',
        type: 'fill',
        source: 'bigdata-source',
        paint: {
          'fill-color': 'rgba(207, 208, 209, 0.79)', // Warna gelap menyamai luar angkasa/background
          'fill-opacity': 0, // Akan dianimasikan menjadi 0.95 saat masuk section
          'fill-opacity-transition': { duration: 800 }
        }
      });
    }

    // LAYER 1: Curah Hujan (Biru)
    if (!map.getLayer('bd-hujan-layer')) {
      map.addLayer({
        id: 'bd-hujan-layer',
        type: 'fill-extrusion',
        source: 'bigdata-source',
        paint: {
          'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'curah_hujan'],
            0, '#bfdbfe', // Removed pure white, used lighter blue
            20, '#93c5fd',
            50, '#3b82f6',
            100, '#1d4ed8'
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-height': 0,
          'fill-extrusion-opacity': 0
        }
      });
    }

    // LAYER 2: Area Terdampak (Merah)
    if (!map.getLayer('bd-dampak-layer')) {
      map.addLayer({
        id: 'bd-dampak-layer',
        type: 'fill-extrusion',
        source: 'bigdata-source',
        paint: {
          'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'dampak_banjir'],
            0, '#fecaca', // Lighter red instead of white
            1000, '#fca5a5',
            5000, '#ef4444',
            20000, '#b91c1c'
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-height': 0,
          'fill-extrusion-opacity': 0
        }
      });
    }

    // LAYER 3: Kepadatan Penduduk (Oranye)
    if (!map.getLayer('bd-penduduk-layer')) {
      map.addLayer({
        id: 'bd-penduduk-layer',
        type: 'fill-extrusion',
        source: 'bigdata-source',
        paint: {
          'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'kepadatan_penduduk'],
            0, '#fed7aa', // Lighter orange
            100, '#fdba74',
            500, '#f97316',
            1000, '#c2410c'
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-height': 0,
          'fill-extrusion-opacity': 0
        }
      });
    }

    // LAYER 4: Prioritas Score (Ungu)
    if (!map.getLayer('bd-prioritas-layer')) {
      map.addLayer({
        id: 'bd-prioritas-layer',
        type: 'fill-extrusion',
        source: 'bigdata-source',
        paint: {
          'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'prioritas_score'],
            -1, '#e9d5ff', // Lighter purple
            0, '#d8b4fe',
            0.5, '#a855f7',
            1, '#7e22ce'
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-height': 0,
          'fill-extrusion-opacity': 0
        }
      });
    }

    // LAYER 5: Recovery NDVI (Hijau)
    if (!map.getLayer('bd-recovery-layer')) {
      map.addLayer({
        id: 'bd-recovery-layer',
        type: 'fill-extrusion',
        source: 'bigdata-source',
        paint: {
          'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'recovery_ndvi_2025'],
            0.6, '#bbf7d0', // Lighter green
            0.75, '#86efac',
            0.9, '#22c55e'
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-height': 0,
          'fill-extrusion-opacity': 0
        }
      });
    }

    setLayersAdded(true);

  }, [mapReady, map, bigDataGeoJson]);

  return (
    <section ref={sectionRef} id="section3-bigdataanswers" className="section section-bigdataanswers">
      {/* Panel Pinned dengan Kartu Zig-Zag (Kanan - Kiri Bergantian) */}
      <div className="bigdata-panel-pinned" id="bigdata-panel">
        <div className="bigdata-cards-container">
          {steps.map((step, index) => {
            const isRight = index % 2 === 0;
            return (
              <div
                key={step.id}
                className={`bigdata-card ${isRight ? 'pos-right' : 'pos-left'}`}
                id={`bigdata-card-${index + 1}`}
              >
                {/* Top Meta: Tech Badge */}
                <div className="card-meta-top">
                  <div className="card-tech-badge">{step.badge}</div>
                </div>

                {/* Question & Description */}
                <h2 className="bigdata-question">{step.question}</h2>
                <p className="bigdata-description">{step.description}</p>

                {/* Color Legend Bar */}
                <div className="card-legend-box">
                  <div className="card-legend-title">{step.legend.title}</div>
                  <div
                    className="card-legend-bar"
                    style={{ background: step.legend.gradient }}
                  ></div>
                  <div className="card-legend-labels">
                    <span>{step.legend.min} ({step.legend.labels[0]})</span>
                    <span>{step.legend.labels[1]}</span>
                    <span>{step.legend.max} ({step.legend.labels[2]})</span>
                  </div>
                </div>

                {/* Actionable Insight Box dengan Maskot Berbicara & Tanda Tanya */}
                <div className="card-insight-container">
                  <div className="insight-mascot-wrapper">
                    <span className="mascot-question-mark mark-left" aria-hidden="true">?</span>
                    <span className="mascot-question-mark mark-right" aria-hidden="true">?</span>
                    <img
                      src={step.mascot}
                      alt={step.mascotAlt}
                      className={`insight-mascot-img ${step.flipMascot ? 'flip-mascot' : ''}`}
                    />
                  </div>
                  <div className="card-insight-speech-bubble">
                    {step.insight}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
