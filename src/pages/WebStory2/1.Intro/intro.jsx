/**
 * intro.jsx — Babak 1: Intro (Mapbox 3D Globe Scrollytelling)
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import insights from '../insight.json';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import Particles from './Particles';
import ScrollReveal from './ScrollReveal';
import TextType from './TextType';
import imgPendataan from './assets/pendataan.jpeg';

gsap.registerPlugin(ScrollTrigger);

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;


/* ─────────────────────────────────────────
   Koordinat Kabupaten/Kota per Provinsi
───────────────────────────────────────────*/
const KAB_POINTS = {
  ACEH: [
    { lat: 5.548, lng: 95.323, name: 'Banda Aceh' },
    { lat: 4.694, lng: 96.749, name: 'Bener Meriah' },
    { lat: 4.321, lng: 96.923, name: 'Aceh Tengah' },
    { lat: 3.591, lng: 97.083, name: 'Aceh Tenggara' },
    { lat: 4.843, lng: 95.317, name: 'Aceh Besar' },
    { lat: 3.865, lng: 97.378, name: 'Aceh Selatan' },
    { lat: 4.112, lng: 97.937, name: 'Gayo Lues' },
    { lat: 5.179, lng: 96.926, name: 'Aceh Utara' },
    { lat: 5.314, lng: 97.079, name: 'Bireuen' },
    { lat: 5.215, lng: 95.851, name: 'Pidie' },
    { lat: 4.023, lng: 96.130, name: 'Nagan Raya' },
    { lat: 3.786, lng: 96.785, name: 'Aceh Barat Daya' },
    { lat: 4.614, lng: 95.603, name: 'Aceh Jaya' },
    { lat: 4.005, lng: 95.294, name: 'Aceh Barat' },
    { lat: 4.526, lng: 97.884, name: 'Aceh Timur' },
    { lat: 3.980, lng: 97.802, name: 'Subulussalam' },
    { lat: 4.450, lng: 98.168, name: 'Aceh Singkil' },
    { lat: 4.906, lng: 98.437, name: 'Langsa' },
  ],
  SUMUT: [
    { lat: 3.588, lng: 98.674, name: 'Medan' },
    { lat: 3.347, lng: 99.146, name: 'Deli Serdang' },
    { lat: 3.116, lng: 99.038, name: 'Serdang Bedagai' },
    { lat: 3.652, lng: 98.460, name: 'Langkat' },
    { lat: 2.961, lng: 99.393, name: 'Batu Bara' },
    { lat: 3.008, lng: 99.659, name: 'Asahan' },
    { lat: 2.673, lng: 99.033, name: 'Tebing Tinggi' },
    { lat: 2.589, lng: 99.856, name: 'Tanjungbalai' },
    { lat: 2.346, lng: 99.075, name: 'Simalungun' },
    { lat: 2.606, lng: 98.987, name: 'Pematangsiantar' },
    { lat: 2.312, lng: 98.674, name: 'Karo' },
    { lat: 2.157, lng: 98.849, name: 'Dairi' },
    { lat: 2.555, lng: 98.455, name: 'Samosir' },
    { lat: 2.788, lng: 98.790, name: 'Toba' },
    { lat: 2.060, lng: 99.327, name: 'Labuhanbatu' },
    { lat: 1.820, lng: 99.069, name: 'Padangsidimpuan' },
    { lat: 1.570, lng: 99.279, name: 'Tapanuli Selatan' },
    { lat: 1.843, lng: 98.741, name: 'Tapanuli Utara' },
    { lat: 1.313, lng: 98.677, name: 'Nias Selatan' },
  ],
  SUMBAR: [
    { lat: -0.950, lng: 100.354, name: 'Padang' },
    { lat: -0.307, lng: 100.369, name: 'Padang Pariaman' },
    { lat: 0.301, lng: 100.374, name: 'Agam' },
    { lat: 0.179, lng: 100.166, name: 'Bukittinggi' },
    { lat: -0.446, lng: 101.392, name: 'Solok' },
    { lat: -1.350, lng: 101.197, name: 'Solok Selatan' },
    { lat: 0.927, lng: 99.962, name: 'Pasaman' },
    { lat: 0.084, lng: 99.851, name: 'Pasaman Barat' },
    { lat: -0.949, lng: 100.658, name: 'Pariaman' },
    { lat: -1.558, lng: 101.451, name: 'Sijunjung' },
    { lat: -0.702, lng: 100.220, name: 'Pesisir Selatan' },
  ],
};

const PROV_CONFIG = {
  ACEH: { color: '#ffffffff', label: 'Aceh', lat: 4.5, lng: 96.5, zoom: 6.5, pitch: 30 },
  SUMUT: { color: '#ffffffff', label: 'Sumatera Utara', lat: 2.5, lng: 98.8, zoom: 6.5, pitch: 30 },
  SUMBAR: { color: '#ffffffff', label: 'Sumatera Barat', lat: -0.5, lng: 100.4, zoom: 6.5, pitch: 30 },
};

const PHASE_MAP = {
  // FRAME 1 (Figma Paling Kiri) & FRAME 4 (Paling Kanan): 
  // Globe mengecil dan geser ke pojok kiri bawah layar.
  // Triknya: Kita set titik tengahnya (lng) jauh ke timur (140) supaya buminya terdorong ke kiri.
  spin: { lat: -10, lng: 150, zoom: 1.2, pitch: 0, label: null },

  // FRAME 2 (Figma Tengah Kiri): 
  // Globe membesar dan fokus ke peta Indonesia rata.
  world: { lat: -2, lng: 118, zoom: 3.8, pitch: 0, label: null },

  // FRAME 3 (Figma Tengah Kanan): 
  // Zoom lebih dalam ke Sumatera dan kamera mulai miring 45 derajat (3D effect).
  sumatera: { lat: 1.5, lng: 99.5, zoom: 5.5, pitch: 45, label: null },

  // Masuk ke level Provinsi
  aceh: { lat: 4.5, lng: 96.5, zoom: 6.8, pitch: 30, label: 'Aceh' },
  sumut: { lat: 2.5, lng: 98.8, zoom: 6.8, pitch: 30, label: 'Sumatera Utara' },
  sumbar: { lat: -0.5, lng: 100.4, zoom: 6.8, pitch: 30, label: 'Sumatera Barat' },
  done: { lat: 2.0, lng: 98.5, zoom: 5.5, pitch: 20, label: null },
};

const SCROLL_PHASES = [
  { from: 0.00, to: 0.28, key: 'spin' },
  { from: 0.28, to: 0.38, key: 'world' },
  { from: 0.38, to: 0.50, key: 'sumatera' },
  { from: 0.50, to: 0.65, key: 'aceh' },
  { from: 0.65, to: 0.80, key: 'sumut' },
  { from: 0.80, to: 0.95, key: 'sumbar' },
  { from: 0.95, to: 1.00, key: 'done' },
];

/* ─────────────────────────────────────────
   Utility & Chart Components (Unchanged)
───────────────────────────────────────────*/
function useCountUp(target, duration = 2000, start = false) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!start || !target) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCurrent(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return current;
}

function BigNumber({ label, value, started, delay = 0 }) {
  const count = useCountUp(value, 2200, started);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (started && value > 0) {
      const t = setTimeout(() => setDone(true), 2400 + delay);
      return () => clearTimeout(t);
    }
  }, [started, value, delay]);
  return (
    <div style={{
      textAlign: 'center', padding: '2.2rem 2.8rem', borderRadius: 20,
      border: done ? '1px solid rgba(98,129,65,0.6)' : '1px solid rgba(255,255,255,0.08)',
      background: done ? 'rgba(98,129,65,0.07)' : 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(8px)', flex: '1 1 200px',
      transition: 'all 0.8s ease',
      boxShadow: done ? '0 0 36px rgba(98,129,65,0.25)' : 'none',
    }}>
      <div className="playfair-display" style={{ fontSize: 'clamp(3rem, 5.5vw, 5rem)', fontWeight: 800, color: done ? '#628141' : '#fff', lineHeight: 1 }}>
        {count.toLocaleString('id-ID')}
      </div>
      <div className="lato-regular" style={{ marginTop: '0.8rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
        {label}
      </div>
    </div>
  );
}

function BarChartProvinsi({ data, show }) {
  // Mencari nilai tertinggi untuk skala persentase tinggi batang
  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      gap: '2.5rem', height: '250px', width: '100%'
    }}>
      {data.map((item, idx) => {
        const heightPct = show ? (item.value / maxVal) * 100 : 0;
        return (
          // PERBAIKAN: height 100% dan flex-end wajib agar batang tumbuh ke atas
          <div key={item.label} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', width: '80px', height: '100%' }}>

            <span className="playfair-display" style={{
              opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(10px)',
              transition: `all 0.5s ease ${idx * 0.2 + 0.5}s`,
              color: '#E5D9B6', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem'
            }}>
              {item.value}
            </span>

            <div style={{
              width: '100%', height: `${heightPct}%`, minHeight: show ? '4px' : '0px',
              backgroundColor: item.color || '#628141',
              borderRadius: '6px 6px 0 0',
              transition: `height 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.2}s`,
              boxShadow: show ? `0 0 20px ${item.color || '#628141'}40` : 'none'
            }} />

            <span className="lato-regular" style={{
              marginTop: '1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center'
            }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const SEKTOR = [
  { icon: '🏫', label: 'Pendidikan', color: '#4FC3F7', key: 'Pendidikan' },
  { icon: '🏥', label: 'Kesehatan', color: '#81C784', key: 'Kesehatan' },
  { icon: '🏪', label: 'Ekonomi', color: '#FFB74D', key: 'Ekonomi' },
  { icon: '🕌', label: 'Sosial/Ibadah', color: '#CE93D8', key: 'Sosial/Ibadah' },
];

function SektorIkon({ sektor, idx, show }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    if (show) {
      const t = setTimeout(() => setVis(true), idx * 180 + 200);
      return () => clearTimeout(t);
    }
  }, [show, idx]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.7rem', flex: '1 1 120px', opacity: vis ? 1 : 0, transform: vis ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.88)', transition: 'all 0.5s ease' }}>
      <div style={{ width: 68, height: 68, borderRadius: '50%', background: `${sektor.color}18`, border: `2px solid ${sektor.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: vis ? `0 0 20px ${sektor.color}33` : 'none' }}>
        {sektor.icon}
      </div>
      <span className="lato-bold" style={{ fontSize: '0.8rem', color: sektor.color, textAlign: 'center' }}>{sektor.label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   MapboxGlobe Component
───────────────────────────────────────────*/
function MapboxGlobe({ phase }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const spinRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);

  /* ─── Init Mapbox ─── */
  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;

    let map;
    let ro;

    try {
      map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        projection: 'globe',
        zoom: 1.5,
        center: [110, 5],
        interactive: false,
        attributionControl: false,
      });

      map.on('load', () => {
        map.setFog({
          color: 'rgb(5, 5, 16)',
          'high-color': 'rgb(10, 11, 31)',
          'horizon-blend': 0.04,
          'space-color': 'rgb(2, 2, 8)',
          'star-intensity': 0.85,
        });
        mapRef.current = map;
        setMapReady(true);
      });

      map.on('error', (e) => {
        console.warn('[Mapbox] error:', e.error?.message || e);
        setMapError(e.error?.message || String(e.error || e));
      });

      ro = new ResizeObserver(() => {
        if (mapRef.current) mapRef.current.resize();
      });
      ro.observe(mapContainer.current);
    } catch (err) {
      setMapError('Failed to init mapbox-gl: ' + err.message);
    }

    return () => {
      if (ro && mapContainer.current) ro.disconnect();
      if (spinRef.current) cancelAnimationFrame(spinRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Spin loop (fase 'spin') ─── */
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;

    if (phase === 'spin') {
      let spinning = true;
      const tick = () => {
        if (!spinning || !mapRef.current) return;
        const c = map.getCenter();
        c.lng += 0.15;
        map.setCenter(c);
        spinRef.current = requestAnimationFrame(tick);
      };
      spinRef.current = requestAnimationFrame(tick);
      return () => {
        spinning = false;
        if (spinRef.current) cancelAnimationFrame(spinRef.current);
      };
    } else {
      if (spinRef.current) cancelAnimationFrame(spinRef.current);
    }
  }, [phase, mapReady]);

  /* ─── FlyTo ─── */
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const cfg = PHASE_MAP[phase];
    if (!cfg || phase === 'spin') return;

    // WAJIB: Hentikan semua animasi yang sedang berjalan sebelum pindah
    map.stop();

    /* Fly */
    map.flyTo({
      center: [cfg.lng, cfg.lat],
      zoom: cfg.zoom,
      pitch: cfg.pitch ?? 0,
      bearing: 0,
      duration: 2500, // Diperlambat sedikit agar lebih halus
      essential: true,
    });

  }, [phase, mapReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const markerRef = useRef(null);

  /* ─── Hotspot Marker ─── */
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    const cfg = PHASE_MAP[phase];

    // Tampilkan marker khusus untuk phase aceh, sumut, dan sumbar
    if (cfg && (phase === 'aceh' || phase === 'sumut' || phase === 'sumbar')) {
      // Struktur DOM khusus Inversa Marker
      const el = document.createElement('div');
      el.className = 'custom-inversa-marker';
      el.innerHTML = `
        <div class="inversa-pulse"></div>
        <div class="inversa-dot"></div>

      `;

      markerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([cfg.lng, cfg.lat])
        .addTo(map);
    }

    return () => {
      if (markerRef.current) markerRef.current.remove();
    };
  }, [phase, mapReady]);

  return (
    <>
      <style>{`
        /* Sembunyikan Logo & Atribusi Mapbox sesuai permintaan */
        .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib {
          display: none !important;
        }
      `}</style>

      {mapError && (
        <div style={{
          position: 'absolute', top: 20, left: 20, zIndex: 100,
          background: 'red', color: 'white', padding: 20, borderRadius: 8,
          maxWidth: '80%', wordBreak: 'break-word'
        }}>
          <b>Mapbox Error:</b> {mapError}
        </div>
      )}

      <div
        ref={mapContainer}
        style={{
          width: '100%', height: '100%',
          position: 'absolute', inset: 0,
          zIndex: 1,
          filter: 'grayscale(15%) contrast(1.1)',
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────
   Label & Progress Components (Unchanged)
───────────────────────────────────────────*/
function PhaseLabel({ phase }) {
  if (phase === 'spin' || phase === 'done') return null;

  // --- 1. TAMPILAN FASE AWAL (WORLD & SUMATERA) ---
  if (phase === 'world' || phase === 'sumatera') {
    const introText = phase === 'world'
      ? 'Di penghujung tahun, saat kehidupan berjalan seperti biasa... alam memiliki skenario berbeda.'
      : 'November 2025. Langit di atas Sumatera tak kunjung henti mencurahkan air. Tiga provinsi tenggelam dalam amarah alam. Ribuan cerita terhenti secara paksa.';

    return (
      <div key={phase} style={{
        position: 'absolute', bottom: '25%', left: '10%', zIndex: 20, pointerEvents: 'none',
        width: '700px', animation: 'fadeSlideUp 0.8s ease both'
      }}>
        <TextType
          text={introText}
          typingSpeed={30}
          showCursor={true}
          className="lato-regular"
          style={{
            fontSize: '1.1rem', color: '#fff',
            textShadow: '0 2px 10px rgba(0,0,0,0.9)', fontWeight: 300, lineHeight: 1.4
          }}
          loop={false}
        />
      </div>
    );
  }

  // --- 2. TAMPILAN FASE PROVINSI (ACEH, SUMUT, SUMBAR) ---
  let title = '';
  let narasi = '';

  if (phase === 'aceh') {
    title = 'Provinsi Aceh';
    narasi = 'Di ujung barat, air bah menyapu hingga ke sudut-sudut desa. Dari pesisir hingga daratan tinggi, ruang hidup lenyap dalam semalam.';
  } else if (phase === 'sumut') {
    title = 'Sumatera Utara';
    narasi = 'Bergerak ke selatan, luapan sungai-sungai besar membelah pemukiman padat. Menghapus jejak infrastruktur, melumpuhkan urat nadi ekonomi.';
  } else if (phase === 'sumbar') {
    title = 'Sumatera Barat';
    narasi = 'Hingga menyentuh kaki bukit barisan, memutus asa mereka yang menggantungkan hidup pada tanah. Ini bukan lagi tentang apa yang rusak, tapi tentang siapa yang bertahan.';
  }

  return (
    <div key={phase} style={{
      position: 'absolute', bottom: '25%', left: '10%', width: '450px',
      zIndex: 20, pointerEvents: 'none', display: 'flex', flexDirection: 'column',
      gap: '1rem', animation: 'fadeSlideUp 0.8s ease both'
    }}>
      <div className="playfair-display" style={{
        fontSize: 'clamp(2.5rem, 3.5vw, 3.5rem)', fontStyle: 'italic', color: '#E5D9B6',
        fontWeight: 400, textShadow: '0 4px 20px rgba(0,0,0,0.8)', letterSpacing: '-0.5px', lineHeight: '1.1'
      }}>
        {title}
      </div>

      <TextType
        text={narasi}
        typingSpeed={20}
        showCursor={true}
        className="lato-light"
        style={{
          fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.9)',
          textShadow: '0 2px 10px rgba(0,0,0,0.9)', fontWeight: 300, lineHeight: 1.6
        }}
        loop={false}
      />
    </div>
  );
}

function ProgressDots({ phase }) {
  // Mengembalikan null agar komponen ini tidak me-render apa-apa,
  // sehingga progress provinsi di kanan hilang tanpa merusak struktur JSX/animasi.
  return null;
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────────*/
export default function BabakIntro() {
  const dataset = insights?.ringkasan_dataset || {};
  const totalKK = dataset.total_rt_keluarga || 115462;
  const totalDesa = dataset.total_desa_infra || 928;
  const kabPerProv = insights?.cakupan_geografis_infra?.kab_kota_per_provinsi || {};
  const totalKab = Object.values(kabPerProv).reduce((s, v) => s + v, 0) || 48;
  const totalART = dataset.total_art_keluarga || 188902;

  const chartDataDesa = [
    { label: 'Aceh', value: insights?.cakupan_geografis_infra?.desa_per_provinsi?.Aceh || 556, color: '#628141' },
    { label: 'Sumut', value: insights?.cakupan_geografis_infra?.desa_per_provinsi?.['Sumatera Utara'] || 292, color: '#8aaf5a' },
    { label: 'Sumbar', value: insights?.cakupan_geografis_infra?.desa_per_provinsi?.['Sumatera Barat'] || 80, color: '#E5D9B6' }
  ];

  const [phase, setPhase] = useState('spin');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [counterStarted, setCounterStarted] = useState(false);

  const wrapperRef = useRef(null);
  const scene2Ref = useRef(null);

  const s2WrapperRef = useRef(null);
  const s2ImageRef = useRef(null);
  const s2ImageInnerRef = useRef(null); // TAMBAHAN BARU
  const s2TextRef = useRef(null);

  const openingRef = useRef(null);
  const closingRef = useRef(null);
  const loadingTextRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ST = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        const found = SCROLL_PHASES.find(ph => p >= ph.from && p < ph.to);
        const key = found ? found.key : SCROLL_PHASES[SCROLL_PHASES.length - 1].key;
        setPhase(key);
        setScrollProgress(p);
      },
    });
    return () => ST.kill();
  }, []);

  useEffect(() => {
    // Helper to generate a jagged sci-fi polygon
    const getJaggedPolygon = (scale) => {
      // Base coordinates around center (50, 50)
      const pts = [
        [40, 40], [35, 40], [35, 45], [25, 45], [25, 55], [35, 55], [35, 60],
        [40, 60], [40, 65], [45, 65], [45, 75], [55, 75], [55, 65], [60, 65],
        [60, 60], [65, 60], [65, 55], [75, 55], [75, 45], [65, 45], [65, 40],
        [60, 40], [60, 35], [55, 35], [55, 25], [45, 25], [45, 35], [40, 35],
        [40, 40]
      ];
      const scaledPts = pts.map(p => {
        const x = (p[0] - 50) * scale + 50;
        const y = (p[1] - 50) * scale + 50;
        return `${x}% ${y}%`;
      });
      // Outer box clockwise, inner hole counter-clockwise
      return `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${scaledPts.join(', ')})`;
    };

    if (openingRef.current) {
      // Start with hole size 0
      openingRef.current.style.clipPath = getJaggedPolygon(0);
    }

    // Fade out LOADING text
    gsap.to(loadingTextRef.current, { opacity: 0, duration: 0.8, delay: 0.5 });

    // Animate opening hole
    const obj = { scale: 0 };
    gsap.to(obj, {
      scale: 15, // Scale hole to cover screen
      duration: 2.5,
      delay: 0.8,
      ease: "power3.inOut",
      onUpdate: () => {
        if (openingRef.current) {
          openingRef.current.style.clipPath = getJaggedPolygon(obj.scale);
        }
      },
      onComplete: () => {
        if (openingRef.current) openingRef.current.style.display = 'none';
      }
    });

    // Efek Dissolve: Map memudar dan blur perlahan untuk menampakkan foto di baliknya
    gsap.to(wrapperRef.current, {
      opacity: 0,
      filter: 'blur(15px) grayscale(100%)', // Efek dramatis saat menghilang
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: 'bottom 150%', // Mulai memudar di sisa scroll terakhir
        end: 'bottom 100%',   // Memudar sempurna tepat saat map selesai
        scrub: true,
      }
    });
  }, []);

  useEffect(() => {
    // Custom cursor setup
    if (cursorRef.current) {
      gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
    }
    const moveCursor = (e) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "none" });
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  useEffect(() => {
    const el = scene2Ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setCounterStarted(true); },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const wrap = s2WrapperRef.current;
    if (!wrap) return;

    // KUNCI UTAMA: Gunakan gsap.context() untuk mencegah bug duplikasi di React 18
    let ctx = gsap.context(() => {

      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: '+=150%',
          scrub: true,
          pin: true,
          anticipatePin: 1
        }
      });

      // 1. Foto muncul perlahan dari gelap (melanjutkan efek dissolve map)
      tl2.fromTo(s2ImageRef.current,
        { opacity: 0, filter: 'brightness(0.2)' },
        { opacity: 1, filter: 'brightness(1)', duration: 0.5, ease: 'power1.inOut' }
      );

      // 2. Efek sinematik Parallax/Zoom pada foto (bersamaan dengan fade in)
      tl2.fromTo(s2ImageInnerRef.current,
        { scale: 1.3 },
        { scale: 1, duration: 1, ease: 'power2.inOut' },
        "<"
      );

      // 3. Teks narasi di kanan muncul dari bawah (aman karena pakai bottom anchor)
      tl2.fromTo(s2TextRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        "-=0.5" // Muncul sedikit lebih awal sebelum zoom selesai
      );

    }, wrap);

    // WAJIB: Membersihkan (revert) seluruh animasi saat komponen di-unmount
    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{`
        .title-text-1 {
          font-family: 'Playfair Display', serif;
          font-size: 60px;
          font-weight: 400;
          font-style: italic;
          text-align: center;
          color: #FFF;
          line-height: normal;
          text-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .title-text-2 {
          font-family: 'Playfair Display', serif;
          font-size: 60px;
          font-weight: 400;
          font-style: italic;
          text-align: center;
          color: #FFF;
          line-height: normal;
          margin-bottom: 2rem;
          text-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
      `}</style>

      {/* Custom Cursor */}
      <div ref={cursorRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 99999, pointerEvents: 'none',
        width: '70px', height: '70px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: scrollProgress < 0.95 ? 1 : 0, transition: 'opacity 0.3s'
      }}>
        <span className="lato-bold" style={{ fontSize: '11px', color: '#fff', letterSpacing: '2px', textTransform: 'uppercase' }}>Scroll</span>
      </div>


      {/* Opening Jagged Overlay */}
      <div ref={openingRef} style={{
        position: 'fixed', inset: 0, zIndex: 99999, background: '#0a0a0a',
        display: 'flex', alignItems: 'flex-end', padding: '40px'
      }}>
        <div ref={loadingTextRef} style={{
          fontFamily: 'monospace', color: '#fff', fontSize: '14px', letterSpacing: '4px', opacity: 1
        }}>
          LOADING...
        </div>
      </div>

      {/* Tactical UI Overlay (Fixed Position) */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none',
        fontFamily: 'sans-serif', color: 'rgba(255,255,255,0.7)', fontSize: '11px',
        letterSpacing: '2px', textTransform: 'uppercase',
        opacity: scrollProgress < 0.95 ? 1 : 0, transition: 'opacity 0.5s ease'
      }}>
        {/* Top Left Logo */}
        <div style={{ position: 'absolute', top: '35px', left: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, color: '#fff' }}> HASIL PENDATAAN R3P </span>
        </div>

        {/* Top Right Menu */}
        <Link to="/" style={{ position: 'absolute', top: '35px', right: '40px', display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit', textDecoration: 'none', pointerEvents: 'auto', cursor: 'pointer' }}>
          <span style={{ fontWeight: 500 }}>BERANDA</span>
          <div style={{ width: '16px', height: '16px', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '3px', height: '3px', background: '#fff', transform: 'translate(-50%, -50%)' }} />
          </div>
        </Link>

        {/* Right Middle Scroll Progress */}
        <div style={{ position: 'absolute', top: '50%', right: '40px', transform: 'translateY(-50%)', height: '200px', width: '1px', background: 'rgba(255,255,255,0.15)' }}>
          <div style={{ width: '100%', background: '#E67E22', height: `${Math.min((scrollProgress / 0.85) * 100, 100)}%`, transition: 'height 0.1s linear' }} />
          <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)' }}>0%</div>
          <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)' }}>100%</div>
        </div>

      </div>

      {/* Tambahkan zIndex: 10 di sini */}
      <div ref={wrapperRef} style={{ height: '400vh', position: 'relative', zIndex: 10 }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', background: '#0a0a11' }}>

          <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: phase === 'spin' ? 1 : 0, transition: 'opacity 1s ease' }}>
            <Particles particleCount={250} particleSpread={12} speed={0.08} particleBaseSize={80} alphaParticles={true} />
          </div>

          {/* Map Container wrapper for cinematic filter */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, filter: 'sepia(40%) saturate(60%) contrast(130%) brightness(85%) hue-rotate(-10deg)' }}>
            <MapboxGlobe phase={phase} />
          </div>

          {/* Military Noise & Grid Overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.6,
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />

          {/* Darkening overlay for text readability */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 4, background: 'rgba(0,0,0,0.65)',
            pointerEvents: 'none', opacity: scrollProgress > 0.02 && scrollProgress < 0.35 ? 1 : 0,
            transition: 'opacity 0.8s ease'
          }} />

          <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(21, 23, 61, 0.8) 100%)', pointerEvents: 'none' }} />
          <PhaseLabel phase={phase} />
          <ProgressDots phase={phase} />

          {/* Scroll Down Indicator
          <div style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', zIndex: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', animation: 'bounceDown 1.8s ease-in-out infinite', opacity: scrollProgress < 0.12 ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            <span className="lato-light" style={{ fontSize: '0.68rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>Scroll untuk menjelajah</span>
            <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }} />
            <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '1rem' }}>↓</span>
          </div> */}
        </div>

        {/* Title Overlay 1 - Natural scrolling to work with ScrollReveal */}
        <div style={{
          position: 'absolute', top: '15vh', left: '10%', right: '10%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 15, pointerEvents: 'none'
        }}>
          <ScrollReveal baseOpacity={0} enableBlur={true} baseRotation={2} blurStrength={10} wordAnimationEnd="center center" textClassName="title-text-1">
            Bencana bukan sekadar deretan angka di atas kertas laporan.
          </ScrollReveal>
        </div>

        {/* Title Overlay 2 */}
        <div style={{
          position: 'absolute', top: '75vh', left: '10%', right: '10%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 15, pointerEvents: 'none'
        }}>
          <ScrollReveal baseOpacity={0} enableBlur={true} baseRotation={2} blurStrength={8} wordAnimationEnd="center center" textClassName="title-text-2">
            Dalam sekejap, realitas ribuan nyawa berganti rupa.
          </ScrollReveal>
          <p className="lato-regular" style={{ fontSize: '30px', fontWeight: 300, textAlign: 'center', color: '#E5D9B6', maxWidth: '800px', lineHeight: 'normal', textShadow: '0 2px 10px rgba(0,0,0,0.5)', margin: '0 auto' }}>
            Ini adalah rekam jejak dari mereka yang bertahan di balik puing-puing kehancuran. Mengungkap fakta di lapangan untuk sebuah upaya pemulihan yang tepat sasaran.
          </p>
        </div>
      </div>

      {/* SCENE 2: CINEMATIC IMAGE REVEAL */}
      {/* Tambahkan marginTop: '-100vh' di sini agar transisi menyambung instan! */}
      <div ref={s2WrapperRef} style={{ height: '100vh', width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#050505', marginTop: '-100vh', zIndex: 1 }}>

        {/* Container Gambar (Posisi Absolut Full Screen tapi akan di-masking oleh GSAP) */}
        <div ref={s2ImageRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <img ref={s2ImageInnerRef} src={imgPendataan} alt="Pendataan Lapangan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

          {/* Overlay gradien gelap agar teks di kanan terbaca */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
        </div>

        {/* Teks Narasi di Sisi KANAN */}
        <div ref={s2TextRef} style={{
          position: 'absolute', bottom: '15%', right: '8%',
          width: '450px', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 10
        }}>

          <h2 className="playfair-display" style={{ fontSize: 'clamp(2.5rem, 3vw, 3.5rem)', fontWeight: 400, fontStyle: 'italic', color: '#E5D9B6', lineHeight: 1.1, margin: 0 }}>
            Memetakan Realitas
          </h2>

          <p className="lato-light" style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontWeight: 300, margin: 0 }}>
            Kami menelusuri 15 Kabupaten/Kota, memetakan ribuan objek terdampak dari ujung Aceh hingga Sumatera Barat. Ratusan ribu jiwa telah memberikan suaranya. Mereka bukan sekadar statistik; mereka adalah saksi hidup dari ruang hidup yang mendadak hilang dalam satu malam.
          </p>
        </div>
      </div>

      {/* LANJUTAN SCENE 2: STATISTIK BIG NUMBERS */}
      {/* LANJUTAN SCENE 2: STATISTIK BIG NUMBERS */}
      <section ref={scene2Ref} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '7rem 2rem', background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>

        {/* Peta Latar Belakang Taktis dengan Titik Koordinat Menyala Bergantian */}
        <div style={{ position: 'absolute', inset: 0, opacity: counterStarted ? 0.25 : 0, transition: 'opacity 1.5s ease', pointerEvents: 'none' }}>
          {/* Garis Grid Militer Ringan */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

          {/* Mockup Titik Koordinat 3 Provinsi dengan Jeda Kedip Berbeda */}
          <div className="bg-coordinate-dot" style={{ top: '25%', left: '30%', animation: 'dotBlink 2s infinite 0.2s' }} />
          <div className="bg-coordinate-dot" style={{ top: '35%', left: '35%', animation: 'dotBlink 2s infinite 0.6s' }} />
          <div className="bg-coordinate-dot" style={{ top: '45%', left: '42%', animation: 'dotBlink 2s infinite 1.1s' }} />
          <div className="bg-coordinate-dot" style={{ top: '55%', left: '48%', animation: 'dotBlink 2s infinite 0.4s' }} />
          <div className="bg-coordinate-dot" style={{ top: '65%', left: '55%', animation: 'dotBlink 2s infinite 1.5s' }} />
          <div className="bg-coordinate-dot" style={{ top: '30%', left: '60%', animation: 'dotBlink 2s infinite 0.8s' }} />
          <div className="bg-coordinate-dot" style={{ top: '50%', left: '65%', animation: 'dotBlink 2s infinite 1.3s' }} />
        </div>

        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(98,129,65,0.05) 0%, transparent 70%)' }} />

        {/* Judul & Narasi Cerita Sesuai Skenario */}
        <div className="lato-bold" style={{ fontSize: '0.78rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#628141', marginBottom: '1.5rem', background: 'rgba(98,129,65,0.1)', padding: '0.4rem 1.2rem', borderRadius: 20, border: '1px solid rgba(98,129,65,0.3)' }}>
          Skala Besar, Dampak Nyata
        </div>

        <h2 className="playfair-display" style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.5rem)', fontWeight: 700, textAlign: 'center', color: '#fff', maxWidth: '780px', marginBottom: '1.2rem', lineHeight: 1.2, fontStyle: 'italic' }}>
          Kami menelusuri <span style={{ color: '#628141' }}>{totalKab} Kabupaten/Kota</span>
        </h2>

        <p className="lato-light" style={{ fontSize: '1.1rem', textAlign: 'center', color: 'rgba(255,255,255,0.68)', maxWidth: '680px', lineHeight: 1.8, marginBottom: '4rem', fontWeight: 300 }}>
          Memetakan ribuan objek terdampak dari ujung Aceh hingga Sumatera Barat. Ratusan ribu jiwa telah memberikan suaranya — mereka bukan sekadar statistik, tapi saksi hidup dari ruang hidup yang mendadak hilang dalam satu malam.
        </p>

        {/* Kotak Statistik Big Numbers */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', justifyContent: 'center', marginBottom: '3rem', width: '100%', maxWidth: '960px', zIndex: 5 }}>
          <BigNumber label="Keluarga Disurvei" value={totalKK} started={counterStarted} delay={0} />
          <BigNumber label="Jiwa Terdampak" value={totalART} started={counterStarted} delay={300} />
          <BigNumber label="Total Desa" value={totalDesa} started={counterStarted} delay={600} />
        </div>

        {/* LAYOUT KIRI-KANAN: DIAGRAM BATANG & PETA */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center', alignItems: 'center',
          width: '100%', maxWidth: '1000px', marginBottom: '4rem', zIndex: 5
        }}>

          {/* KIRI: Bar Chart */}
          <div style={{ flex: '1 1 400px', background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 className="lato-bold" style={{ color: '#E5D9B6', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem', letterSpacing: '2px' }}>SEBARAN DESA TERDAMPAK</h3>
            <BarChartProvinsi data={chartDataDesa} show={counterStarted} />
          </div>

          {/* KANAN: Tempat Peta SVG/Gambar dari Figma */}
          <div style={{
            flex: '1 1 400px', height: '350px', background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden'
          }}>
            {/* Animasi Radar / Titik Peta */}
            <div className="bg-coordinate-dot" style={{ top: '35%', left: '30%', animation: 'dotBlink 2s infinite 0.2s' }} />
            <div className="bg-coordinate-dot" style={{ top: '55%', left: '45%', animation: 'dotBlink 2s infinite 0.6s' }} />
            <div className="bg-coordinate-dot" style={{ top: '40%', left: '70%', animation: 'dotBlink 2s infinite 1.1s' }} />

            <span style={{ color: '#628141', fontFamily: 'monospace', letterSpacing: '2px', opacity: 0.8, zIndex: 2 }}>[ AREA PETA SUMATERA ]</span>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '1rem', maxWidth: '80%', zIndex: 2 }}>
              *Catatan Dev: Silakan export gambar Peta Granular dari Figma (PNG/SVG) lalu masukkan tag img di sini*
            </p>
          </div>

        </div>

        <div style={{ width: '100%', maxWidth: 700, height: 1, background: 'linear-gradient(90deg, transparent, rgba(98,129,65,0.4), transparent)', marginBottom: '3rem' }} />
        <div className="lato-bold" style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>Sektor yang Didata</div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', width: '100%', maxWidth: 620, marginBottom: '3.5rem', zIndex: 5 }}>
          {SEKTOR.map((s, i) => <SektorIkon key={s.key} sektor={s} idx={i} show={counterStarted} />)}
        </div>
      </section>

      <style>{`
        .stars-bg {
          background-image: 
            radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 50px 160px, #ddd, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 160px 120px, #ddd, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: twinkle 4s infinite alternate;
        }
        @keyframes twinkle {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        /* Sembunyikan Logo & Atribusi Mapbox sesuai permintaan */
        .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib {
          display: none !important;
        }

        @keyframes bounceDown { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
        @keyframes fadeSlideUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }

        .custom-inversa-marker {
          width: 0;
          height: 0;
          position: relative;
        }
        .inversa-pulse {
          position: absolute;
          top: -70px;
          left: -70px;
          width: 140px;
          height: 140px;
          background-color: rgba(255, 77, 77, 0.15); /* Merah transparan */
          border-radius: 50%;
          animation: mapboxPulse 2s ease-out infinite;
          pointer-events: none;
        }
        .inversa-dot {
          position: absolute;
          top: -4px;
          left: -4px;
          width: 8px;
          height: 8px;
          background-color: #FF4D4D; /* Merah solid */
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(146, 4, 4, 1);
        }

        @keyframes mapboxPulse {
          0% { transform: scale(0.3); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 0.2; transform: scale(1); filter: drop-shadow(0 0 0px rgba(98,129,65,0)); }
          50% { opacity: 1; transform: scale(1.3); filter: drop-shadow(0 0 8px #628141); }
        }
        .bg-coordinate-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background-color: #628141;
          border-radius: 50%;
        }
      `}</style>
    </>
  );
}