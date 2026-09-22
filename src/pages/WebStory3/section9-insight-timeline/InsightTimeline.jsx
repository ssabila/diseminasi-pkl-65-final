import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import mapboxgl from 'mapbox-gl';
import './InsightTimeline.css';

// Data asli terintegrasi dari Assets (R3P-Kab + Modul 1, 3, 4, 6)
import timelineKabupatenData from '../geojson-data/timeline_kabupaten_data.geojson?url';
import { useSharedMap } from '../MapContext';

// Maskot Gundatala Grand Design
import gundatalaImg from '../../../assets/Grand Design/Gundatala_7.png';
import gundatalaTooltipImg from '../../../assets/Grand Design/Gundatala_8.png';

gsap.registerPlugin(ScrollTrigger);

/**
 * 5 Tahapan Perkembangan Bencana Berdasarkan Data Riil PKL 65
 */
const TIMELINE_STAGES = [
  {
    id: 'sebelum',
    title: 'Sebelum Bencana',
    desc: 'Kondisi lingkungan dan aktivitas masyarakat masih berada dalam kondisi normal.',
    color: '#38bdf8',
    layerId: 'tl-sebelum-layer',
    fillColor: [
      'interpolate', ['linear'], ['get', 'stage_sebelum'],
      0.5, 'rgba(56, 189, 248, 0.25)',
      0.7, 'rgba(34, 197, 94, 0.4)',
      0.85, 'rgba(21, 128, 61, 0.65)'
    ]
  },
  {
    id: 'sinyal',
    title: 'Sinyal Awal',
    desc: 'Perubahan kondisi mulai terdeteksi melalui indikator lingkungan dan faktor pemicu.',
    color: '#eab308',
    layerId: 'tl-sinyal-layer',
    fillColor: [
      'interpolate', ['linear'], ['get', 'stage_sinyal'],
      0.0, 'rgba(34, 197, 94, 0.15)',
      0.35, 'rgba(250, 204, 21, 0.48)',
      0.65, 'rgba(245, 158, 11, 0.75)',
      0.9, 'rgba(234, 88, 12, 0.88)'
    ]
  },
  {
    id: 'puncak',
    title: 'Puncak Bencana',
    desc: 'Genangan dan longsor mencapai kondisi terluas atau paling intens.',
    color: '#ef4444',
    layerId: 'tl-puncak-layer',
    fillColor: [
      'interpolate', ['linear'], ['get', 'stage_puncak'],
      0.0, 'rgba(254, 240, 138, 0.12)',
      0.15, 'rgba(249, 115, 22, 0.55)',
      0.35, 'rgba(239, 68, 68, 0.8)',
      0.7, 'rgba(185, 28, 28, 0.95)'
    ]
  },
  {
    id: 'surut',
    title: 'Mulai Surut',
    desc: 'Dampak mulai berkurang dan sebagian akses mulai kembali terbuka.',
    color: '#f97316',
    layerId: 'tl-surut-layer',
    fillColor: [
      'interpolate', ['linear'], ['get', 'stage_surut'],
      0.0, 'rgba(34, 197, 94, 0.15)',
      0.15, 'rgba(251, 146, 60, 0.5)',
      0.35, 'rgba(249, 115, 22, 0.75)',
      0.7, 'rgba(220, 38, 38, 0.88)'
    ]
  },
  {
    id: 'pemulihan',
    title: 'Pemulihan',
    desc: 'Aktivitas masyarakat dan kondisi lingkungan mulai menunjukkan tanda-tanda pemulihan.',
    color: '#22c55e',
    layerId: 'tl-pemulihan-layer',
    fillColor: [
      'interpolate', ['linear'], ['get', 'stage_pemulihan'],
      0.5, 'rgba(234, 179, 8, 0.25)',
      0.7, 'rgba(74, 222, 128, 0.55)',
      0.85, 'rgba(22, 163, 74, 0.85)'
    ]
  }
];

// Data Metadata Legenda Dinamis per Tahap
const STAGE_LEGENDS = [
  {
    title: 'Kondisi Normal (Baseline)',
    sub: 'Tutupan Vegetasi & Lingkungan Awal',
    gradient: 'linear-gradient(to right, #38bdf8, #22c55e, #15803d)',
    min: '0.50 (Sedang)',
    max: '0.85+ (Subur/Aman)',
    status: 'Stabil'
  },
  {
    title: 'Indikator Pemicu Bencana',
    sub: 'Anomali Curah Hujan & Indeks Hazard (CRS)',
    gradient: 'linear-gradient(to right, #22c55e, #facc15, #f59e0b, #ea580c)',
    min: '0.0 (Aman)',
    max: '1.0 (Ekstrem)',
    status: 'Waspada'
  },
  {
    title: 'Intensitas Dampak Bencana',
    sub: 'Akumulasi Kerusakan & Genangan Ekstrem',
    gradient: 'linear-gradient(to right, #fef08a, #f97316, #ef4444, #991b1b)',
    min: 'Ringan',
    max: 'Sangat Kritis',
    status: 'Bencana Puncak'
  },
  {
    title: 'Dinamika Banjir Surut',
    sub: 'Penyusutan Air & Genangan Terlokalisir',
    gradient: 'linear-gradient(to right, #22c55e, #fb923c, #f97316, #dc2626)',
    min: 'Surut Total',
    max: 'Genangan Sisa',
    status: 'Mulai Surut'
  },
  {
    title: 'Jejak Pemulihan Wilayah',
    sub: 'Pertumbuhan Vegetasi Pasca-Bencana (2025)',
    gradient: 'linear-gradient(to right, #eab308, #4ade80, #16a34a)',
    min: '0.55 (Terhambat)',
    max: '0.88 (Pulih Optimal)',
    status: 'Pemulihan'
  }
];

// Episentrum Utama Hotspot Radar Pulse Rings — koordinat riil pusat wilayah/bencana (Dunia Nyata)
const HOTSPOT_EPICENTERS = [
  { id: 'pidie', name: 'Pidie Jaya', prov: 'Aceh', coord: [96.22, 5.20], stages: ['sinyal', 'puncak'] },
  { id: 'nagan', name: 'Nagan Raya', prov: 'Aceh', coord: [96.42, 4.25], stages: ['puncak', 'surut'] },
  { id: 'tengah', name: 'Aceh Tengah', prov: 'Aceh', coord: [96.85, 4.63], stages: ['puncak', 'surut'] },
  { id: 'taput', name: 'Tapanuli Utara', prov: 'Sumut', coord: [98.98, 2.02], stages: ['sinyal', 'puncak'] },
  { id: 'madina', name: 'Mandailing Natal', prov: 'Sumut', coord: [99.56, 0.86], stages: ['puncak'] },
  { id: 'pasaman', name: 'Pasaman Barat', prov: 'Sumbar', coord: [99.81, 0.15], stages: ['puncak'] },
  { id: 'agam', name: 'Agam / Marapi', prov: 'Sumbar', coord: [100.35, -0.32], stages: ['puncak', 'pemulihan'] },
  { id: 'solok', name: 'Solok', prov: 'Sumbar', coord: [100.65, -0.79], stages: ['sinyal', 'puncak', 'pemulihan'] }
];

export default function InsightTimeline() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const progressFillRef = useRef(null);
  const legendRef = useRef(null);
  const { map, mapReady } = useSharedMap();
  const [layersAdded, setLayersAdded] = useState(false);
  const stagesRef = useRef([]);

  // State untuk milestone aktif (0–4)
  const [activeStageIdx, setActiveStageIdx] = useState(0);

  // State untuk Hover Tooltip
  const [hoverInfo, setHoverInfo] = useState(null);

  // Ref untuk Radar Pulse Markers
  const markersRef = useRef([]);

  // ── 1. Setup Layer Spasial Poligon & Highlight Layer ──
  useEffect(() => {
    if (!mapReady || !map) return;

    // Tambah single source GeoJSON poligon kabupaten
    if (!map.getSource('tl-kab-source')) {
      map.addSource('tl-kab-source', {
        type: 'geojson',
        data: timelineKabupatenData
      });
    }

    // Tambahkan 5 fill layer untuk tiap milestone
    TIMELINE_STAGES.forEach(stage => {
      if (!map.getLayer(stage.layerId)) {
        map.addLayer({
          id: stage.layerId,
          type: 'fill',
          source: 'tl-kab-source',
          paint: {
            'fill-color': stage.fillColor,
            'fill-opacity': 0,
          }
        });
      }
    });

    // Garis batas antar-kabupaten
    if (!map.getLayer('tl-kab-line')) {
      map.addLayer({
        id: 'tl-kab-line',
        type: 'line',
        source: 'tl-kab-source',
        paint: {
          'line-color': 'rgba(255, 255, 255, 0.22)',
          'line-width': 0.8,
          'line-opacity': 0
        }
      });
    }

    // Layer Highlight saat kursor hover di atas kabupaten
    if (!map.getLayer('tl-kab-hover-line')) {
      map.addLayer({
        id: 'tl-kab-hover-line',
        type: 'line',
        source: 'tl-kab-source',
        paint: {
          'line-color': '#ffffff',
          'line-width': 2.2,
          'line-opacity': 0
        },
        filter: ['==', ['get', 'kodekab'], '']
      });
    }

    // Hit-test fill layer (transparan 0.01) agar WebGL buffer selalu memproses queryRenderedFeatures
    if (!map.getLayer('tl-kab-hit-fill')) {
      map.addLayer({
        id: 'tl-kab-hit-fill',
        type: 'fill',
        source: 'tl-kab-source',
        paint: {
          'fill-color': '#ffffff',
          'fill-opacity': 0.01
        }
      });
    }

    setLayersAdded(true);
  }, [mapReady, map]);

  // ── 2. Setup Hotspot Radar Pulse Markers ──
  useEffect(() => {
    if (!mapReady || !map) return;

    const markers = [];
    HOTSPOT_EPICENTERS.forEach(epi => {
      const el = document.createElement('div');
      el.className = `tl-hotspot-marker tl-hotspot-${epi.id}`;
      // Mulai hidden — hanya tampil saat Section 9 aktif
      el.style.display = 'none';
      el.innerHTML = `
        <div class="tl-hotspot-inner">
          <div class="tl-pulse-ring"></div>
          <div class="tl-pulse-core"></div>
          <span class="tl-pulse-label">${epi.name}</span>
        </div>
      `;
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
        rotationAlignment: 'horizon',
        pitchAlignment: 'map'
      })
        .setLngLat(epi.coord)
        .addTo(map);

      markers.push({ epi, marker, element: el });
    });

    markersRef.current = markers;

    return () => {
      markers.forEach(m => m.marker.remove());
      markersRef.current = [];
    };
  }, [mapReady, map]);

  // Tampilkan semua marker (display: flex) saat section masuk viewport
  const showAllMarkers = () => {
    if (!markersRef.current) return;
    markersRef.current.forEach(({ element }) => {
      element.style.display = 'flex';
    });
  };

  // Sembunyikan semua marker (display: none) saat keluar section
  const hideAllMarkers = () => {
    if (!markersRef.current) return;
    markersRef.current.forEach(({ element }) => {
      element.classList.remove('active');
      element.style.display = 'none';
    });
  };

  // Update Hotspot Pulse Markers saat stage aktif berubah
  const updateHotspots = (stageIdx) => {
    const stage = TIMELINE_STAGES[stageIdx];
    if (!stage || !markersRef.current) return;

    // Phase-specific color mapping
    const phaseColors = {
      sebelum: '#38bdf8',
      sinyal: '#eab308',
      puncak: '#ef4444',
      surut: '#f97316',
      pemulihan: '#22c55e',
    };

    markersRef.current.forEach(({ epi, element }) => {
      const isActive = epi.stages.includes(stage.id);
      if (isActive) {
        element.classList.add('active');
        element.style.setProperty('--pulse-color', phaseColors[stage.id] || stage.color);
      } else {
        element.classList.remove('active');
      }
    });
  };

  // Ref untuk track apakah section sedang aktif (agar tooltip hanya muncul di section 9)
  const sectionActiveRef = useRef(false);

  // ── 3. Interaktivitas Hover & Touch Tooltip di Peta ──
  // Map non-interactive (pointer-events:none), jadi kita dengarkan event mouse
  // dan touch pada level document dan konversi koordinat ke canvas Mapbox.
  useEffect(() => {
    if (!mapReady || !map || !layersAdded) return;

    const handlePointer = (clientX, clientY, target) => {
      // Hanya aktif saat section 9 terlihat
      if (!sectionActiveRef.current) {
        if (hoverInfo) setHoverInfo(null);
        return;
      }

      // Abaikan jika kursor/touch berada di atas panel narasi kanan atau mini legend
      if (target && target.closest && (target.closest('.insight-content') || target.closest('.tl-mini-legend'))) {
        setHoverInfo(null);
        if (map.getLayer('tl-kab-hover-line')) {
          map.setPaintProperty('tl-kab-hover-line', 'line-opacity', 0);
        }
        return;
      }

      // Konversi koordinat mouse/touch viewport ke koordinat relatif canvas Mapbox
      const canvas = map.getCanvas();
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      const px = clientX - canvasRect.left;
      const py = clientY - canvasRect.top;

      // Pastikan titik di dalam canvas
      if (px < 0 || py < 0 || px > canvasRect.width || py > canvasRect.height) {
        setHoverInfo(null);
        if (map.getLayer('tl-kab-hover-line')) {
          map.setPaintProperty('tl-kab-hover-line', 'line-opacity', 0);
        }
        return;
      }

      // Query fitur poligon di peta yang berada di bawah posisi kursor
      // Menggunakan layer hit-test khusus 'tl-kab-hit-fill' agar deteksi poligon selalu 100% responsif
      const hitLayers = map.getLayer('tl-kab-hit-fill') ? ['tl-kab-hit-fill'] : TIMELINE_STAGES.map(s => s.layerId).filter(id => map.getLayer(id));
      if (hitLayers.length === 0) return;

      let features;
      try {
        features = map.queryRenderedFeatures([px, py], { layers: hitLayers });
      } catch (err) {
        return;
      }

      if (features && features.length > 0) {
        const f = features[0];

        if (map.getLayer('tl-kab-hover-line')) {
          map.setFilter('tl-kab-hover-line', ['==', ['get', 'kodekab'], f.properties.kodekab]);
          map.setPaintProperty('tl-kab-hover-line', 'line-opacity', 0.95);
        }

        document.body.style.cursor = 'pointer';

        setHoverInfo({
          x: clientX,
          y: clientY,
          props: f.properties
        });
      } else {
        if (map.getLayer('tl-kab-hover-line')) {
          map.setPaintProperty('tl-kab-hover-line', 'line-opacity', 0);
        }
        document.body.style.cursor = '';
        setHoverInfo(null);
      }
    };

    const onMouseMove = (e) => {
      handlePointer(e.clientX, e.clientY, e.target);
    };

    const onTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        handlePointer(e.touches[0].clientX, e.touches[0].clientY, e.target);
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchstart', onTouchStart, { passive: true });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchstart', onTouchStart);
      document.body.style.cursor = '';
    };
  }, [mapReady, map, layersAdded]);

  // ── 4. Animasi ScrollTrigger: Kamera, Crossfade, & Glowing Line ──
  useGSAP(() => {
    if (!layersAdded || !map) return;

    const s = sectionRef.current;
    const isMobile = window.innerWidth <= 900;
    const isSmallMobile = window.innerWidth <= 576;

    // Parameter kamera 3 provinsi (Aceh, Sumut, Sumbar)
    // Pada mobile, berikan bottom padding setara tinggi card agar 3 provinsi terpusat di area atas
    const cardBottomPadding = isSmallMobile
      ? Math.round(window.innerHeight * 0.36)
      : isMobile
      ? Math.round(window.innerHeight * 0.38)
      : 0;

    const OVERVIEW_CAMERA = {
      center: isMobile ? [98.5, 2.1] : [98.6, 1.8],
      zoom: isSmallMobile ? 4.65 : isMobile ? 4.85 : 5.8,
      pitch: isMobile ? 0 : 28,
      bearing: isMobile ? 0 : -5,
      padding: isMobile
        ? { top: 35, right: 0, bottom: cardBottomPadding, left: 0 }
        : { top: 0, right: 460, bottom: 0, left: 0 }
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: s,
        start: 'top top',
        end: '+=400%',
        scrub: 0.5,
        pin: true,
        refreshPriority: 30,
        onEnter: () => {
          sectionActiveRef.current = true;
          // Zoom out perlahan dari Pidie Jaya (Section 8) ke cakupan 3 provinsi
          map.easeTo({
            ...OVERVIEW_CAMERA,
            duration: 1800
          });
          if (map.getLayer('tl-kab-line')) {
            map.setPaintProperty('tl-kab-line', 'line-opacity', 0.8);
          }
          showAllMarkers();
          updateHotspots(0);
        },
        onEnterBack: () => {
          sectionActiveRef.current = true;
          map.easeTo({
            ...OVERVIEW_CAMERA,
            duration: 1400
          });
          if (map.getLayer('tl-kab-line')) {
            map.setPaintProperty('tl-kab-line', 'line-opacity', 0.8);
          }
          showAllMarkers();
          updateHotspots(4);
        },
        onLeave: () => {
          // Bersihkan saat berpindah ke Section 10
          if (map.getLayer('tl-kab-line')) {
            map.setPaintProperty('tl-kab-line', 'line-opacity', 0);
          }
          if (map.getLayer('tl-kab-hover-line')) {
            map.setPaintProperty('tl-kab-hover-line', 'line-opacity', 0);
          }
          TIMELINE_STAGES.forEach(st => {
            if (map.getLayer(st.layerId)) {
              map.setPaintProperty(st.layerId, 'fill-opacity', 0);
            }
          });
          hideAllMarkers();
          sectionActiveRef.current = false;
          setHoverInfo(null);
        },
        onLeaveBack: () => {
          // Bersihkan saat mundur ke Section 8
          if (map.getLayer('tl-kab-line')) {
            map.setPaintProperty('tl-kab-line', 'line-opacity', 0);
          }
          if (map.getLayer('tl-kab-hover-line')) {
            map.setPaintProperty('tl-kab-hover-line', 'line-opacity', 0);
          }
          TIMELINE_STAGES.forEach(st => {
            if (map.getLayer(st.layerId)) {
              map.setPaintProperty(st.layerId, 'fill-opacity', 0);
            }
          });
          hideAllMarkers();
          sectionActiveRef.current = false;
          setHoverInfo(null);
        }
      },
    });

    // Fade IN layer tahap pertama (Sebelum Bencana) & Mini Legenda
    tl.to({}, {
      duration: 0.06,
      onUpdate: function () {
        const progress = this.progress();
        if (map.getLayer('tl-sebelum-layer')) {
          map.setPaintProperty('tl-sebelum-layer', 'fill-opacity', progress * 0.75);
        }
        if (map.getLayer('tl-kab-line')) {
          map.setPaintProperty('tl-kab-line', 'line-opacity', progress * 0.8);
        }
      }
    });

    // Content fade in (Card & Legend)
    if (cardRef.current) {
      tl.fromTo(cardRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' }
      );
    }
    if (legendRef.current) {
      tl.fromTo(legendRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' },
        '<0.02'
      );
    }

    // Iterasi pergantian 5 milestone secara mulus (crossfade layer & indikator)
    const stepDuration = 1 / (TIMELINE_STAGES.length - 1);
    let currentActiveIdx = 0;

    TIMELINE_STAGES.forEach((stage, idx) => {
      if (idx === 0) return;

      const prevStage = TIMELINE_STAGES[idx - 1];

      tl.to({}, {
        duration: stepDuration,
        onUpdate: function () {
          const progress = this.progress();

          // Crossfade antar-layer poligon di peta
          if (map.getLayer(prevStage.layerId)) {
            map.setPaintProperty(prevStage.layerId, 'fill-opacity', (1 - progress) * 0.75);
          }
          if (map.getLayer(stage.layerId)) {
            map.setPaintProperty(stage.layerId, 'fill-opacity', progress * 0.75);
          }

          // Perbarui Glowing Progress Line
          const totalProgress = tl.scrollTrigger ? tl.scrollTrigger.progress : 0;
          if (progressFillRef.current) {
            const fillPct = Math.min(100, Math.max(0, (totalProgress - 0.05) / 0.85 * 100));
            progressFillRef.current.style.height = `${fillPct}%`;
          }

          // Perbarui milestone aktif di DOM & Legend
          const newIdx = progress > 0.5 ? idx : idx - 1;
          if (newIdx !== currentActiveIdx) {
            if (stagesRef.current[currentActiveIdx]) {
              stagesRef.current[currentActiveIdx].classList.remove('active');
            }
            if (stagesRef.current[newIdx]) {
              stagesRef.current[newIdx].classList.add('active');
            }
            currentActiveIdx = newIdx;
            setActiveStageIdx(newIdx);
            updateHotspots(newIdx);
          }
        }
      }, `>-${stepDuration * 0.15}`);
    });

    // Fade OUT layer tahap terakhir saat mendekati akhir section
    tl.to({}, {
      duration: 0.1,
      onUpdate: function () {
        const progress = this.progress();
        const lastStage = TIMELINE_STAGES[TIMELINE_STAGES.length - 1];
        if (map.getLayer(lastStage.layerId)) {
          map.setPaintProperty(lastStage.layerId, 'fill-opacity', (1 - progress) * 0.75);
        }
        if (map.getLayer('tl-kab-line')) {
          map.setPaintProperty('tl-kab-line', 'line-opacity', (1 - progress) * 0.8);
        }
      }
    });

    // Fade OUT card & legend
    const exitElements = [cardRef.current, legendRef.current].filter(Boolean);
    if (exitElements.length > 0) {
      tl.to(exitElements, {
        opacity: 0,
        y: -25,
        duration: 0.12,
        ease: 'power2.in',
      }, '>');
    }

  }, [layersAdded, map]);

  // Helper deskripsi status kabupaten pada fase aktif
  const getStageStatusText = (stageIdx, props) => {
    if (!props) return '-';
    switch (stageIdx) {
      case 0:
        return `Kondisi Normal (NDVI: ${(props.stage_sebelum || 0.8).toFixed(2)})`;
      case 1:
        return (props.stage_sinyal || 0) > 0.6
          ? 'Potensi Bahaya Tinggi (Waspada)'
          : 'Potensi Bahaya Sedang';
      case 2:
        return (props.stage_puncak || 0) > 0.4
          ? 'Dampak Kritis (Bencana Puncak)'
          : 'Terdampak Moderat';
      case 3:
        return (props.stage_surut || 0) > 0.3
          ? 'Sisa Genangan Signifikan'
          : 'Air Berangsur Surut';
      case 4:
        return `NDVI: ${(props.stage_pemulihan || 0.8).toFixed(2)} (Pemulihan Baik)`;
      default:
        return 'Terpantau';
    }
  };

  const currentStage = TIMELINE_STAGES[activeStageIdx] || TIMELINE_STAGES[0];
  const currentLegend = STAGE_LEGENDS[activeStageIdx] || STAGE_LEGENDS[0];

  return (
    <section ref={sectionRef} id="section9-insighttimeline" className="section section-insighttimeline" style={{ background: 'transparent' }}>
      <div className="starfield">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="star" style={{
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            '--dur': `${2 + Math.random() * 4}s`, '--delay': `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* ── Dynamic Mini Legend (Pojok Kiri Bawah) ── */}
      <div className="tl-mini-legend" ref={legendRef} style={{ opacity: 0 }}>
        <div className="tl-legend-header">
          <span className="tl-legend-dot" style={{ backgroundColor: currentStage.color }} />
          <div className="tl-legend-title-group">
            <span className="tl-legend-title">{currentLegend.title}</span>
            <span className="tl-legend-sub">{currentLegend.sub}</span>
          </div>
          <span className="tl-legend-status-badge" style={{ borderColor: currentStage.color, color: currentStage.color }}>
            {currentLegend.status}
          </span>
        </div>
        <div className="tl-legend-bar-container">
          <div className="tl-legend-bar" style={{ background: currentLegend.gradient }} />
          <div className="tl-legend-labels">
            <span>{currentLegend.min}</span>
            <span>{currentLegend.max}</span>
          </div>
        </div>
      </div>

      {/* ── Interactive Hover Tooltip di Peta ── */}
      {hoverInfo && hoverInfo.props && (
        <div
          className="tl-map-tooltip"
          style={{
            left: `${Math.max(12, Math.min(window.innerWidth - (window.innerWidth <= 576 ? 210 : 270), hoverInfo.x + 14))}px`,
            top: `${Math.max(12, Math.min(window.innerHeight - (window.innerWidth <= 576 ? 190 : 240), hoverInfo.y - 60))}px`,
          }}
        >
          <div className="tl-tooltip-top-row">
            <img src={gundatalaTooltipImg} alt="Gundatala" className="tl-tooltip-mascot" />
            <div className="tl-tooltip-header">
              <span className="tl-tooltip-kab">{hoverInfo.props.nmkab || 'Kabupaten'}</span>
              <span className="tl-tooltip-prov">{hoverInfo.props.nmprov || 'Sumatera'}</span>
            </div>
          </div>
          <div className="tl-tooltip-divider" />
          <div className="tl-tooltip-body">
            <div className="tl-tooltip-row">
              <span className="tl-tooltip-label">Fase:</span>
              <span className="tl-tooltip-val" style={{ color: currentStage.color }}>
                {currentStage.title}
              </span>
            </div>
            <div className="tl-tooltip-row">
              <span className="tl-tooltip-label">Status:</span>
              <span className="tl-tooltip-val">
                {getStageStatusText(activeStageIdx, hoverInfo.props)}
              </span>
            </div>
            <div className="tl-tooltip-row">
              <span className="tl-tooltip-label">Kerentanan:</span>
              <span className="tl-tooltip-val">
                {hoverInfo.props.status_kerentanan || '-'}
              </span>
            </div>
            {(hoverInfo.props.sum_dampak_rp > 0) && (
              <div className="tl-tooltip-row">
                <span className="tl-tooltip-label">Est. Kerusakan:</span>
                <span className="tl-tooltip-val tl-tooltip-damage">
                  Rp {Number(hoverInfo.props.sum_dampak_rp).toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>
          <div className="tl-tooltip-phase-indicator" style={{ backgroundColor: currentStage.color }} />
        </div>
      )}

      {/* ── Main Layout (Card Narasi di Kanan) ── */}
      <div className="insight-layout">
        <div className="insight-content tl-content" ref={cardRef} style={{ opacity: 0 }}>
          
          {/* Maskot Gundatala Floating Companion — inside card flow to prevent clipping */}
          <div className="gundatala-inline-companion">
            <img src={gundatalaImg} alt="Gundatala Maskot" className="gundatala-mascot-img" />
            <div className="gundatala-badge">
              <span className="gundatala-badge-pulse" />
              <span className="gundatala-badge-text">Monitoring Big Data</span>
            </div>
          </div>

          <span className="insight-subtitle">Section 9: Modul 7</span>
          <h2 className="insight-title">Perjalanan Sebuah Bencana</h2>
          <p className="insight-narrative tl-narrative">
            Bencana tidak terjadi sekaligus dalam satu waktu. Perubahan kondisi wilayah
            dapat dipantau dari waktu ke waktu melalui data yang diperbarui secara berkala.
          </p>

          <div className="tl-stages-container">
            {/* Glowing Progress Track & Fill Line */}
            <div className="tl-progress-track">
              <div
                className="tl-progress-fill"
                ref={progressFillRef}
                style={{ '--stage-color': currentStage.color }}
              />
            </div>

            {TIMELINE_STAGES.map((stage, idx) => (
              <div
                key={stage.id}
                ref={el => stagesRef.current[idx] = el}
                className={`tl-stage ${idx === 0 ? 'active' : ''}`}
                style={{ '--stage-color': stage.color }}
              >
                <div className="tl-stage-header">
                  <span className="tl-dot" style={{ backgroundColor: stage.color }} />
                  <h3>{stage.title}</h3>
                </div>
                <div className="tl-stage-body">
                  <p>{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

