/**
 * infrastruktur.jsx — Babak 2: Infrastruktur
 * REVISED: Palette #15173D/#E5D9B6, Playfair Display Italic headings, Lato Light body,
 *          muted/desaturated photos, grayscale satellite map, neon data accents,
 *          SVG icons (no emoji), compact Scene 2 layout, natural narrative prose.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import insights from '../insight.json';
// (recharts no longer used in this file)
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────
   GLOBAL STYLES
   Primary: #15173D (deep navy-indigo)  Secondary: #E5D9B6 (warm parchment)
   Typography: Playfair Display Italic (display) · Lato Light 300 (body)
───────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&family=Lato:wght@300;400;700&display=swap');

  :root {
    --navy:       #15173D;
    --navy-dark:  #0d0e28;
    --navy-light: #1e2050;
    --parchment:  #E5D9B6;
    --parchment-dim: rgba(229,217,182,0.55);
    --rust:       #c0392b;
    --amber:      #c77d29;
    --straw:      #c9a94a;
    --sage:       #5a8a5e;
    --slate:      #4a6fa5;
    --neon-red:   #ff3b2e;
    --neon-amber: #ffa726;
    --neon-teal:  #26c6da;
    --card-bg:    rgba(255,255,255,0.03);
    --card-border:rgba(229,217,182,0.08);
    --muted-text: rgba(229,217,182,0.52);
  }

  /* Typography helpers */
  .t-display {
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic;
    line-height: 1.18;
  }
  .t-body {
    font-family: 'Lato', sans-serif;
    font-weight: 300;
    line-height: 1.82;
  }
  .t-eyebrow {
    font-family: 'Lato', sans-serif;
    font-weight: 700;
    font-size: 0.7rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }
  .t-label {
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    font-size: 0.78rem;
  }

  /* Leaflet labeled basemap — full color, no filter */
  .leaflet-container { background: #0d0e28 !important; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #15173D; }
  ::-webkit-scrollbar-thumb { background: rgba(229,217,182,0.2); border-radius: 4px; }

  /* Pulse animations */
  @keyframes pulseNeon {
    0%   { transform: scale(0.6); opacity: 1; box-shadow: 0 0 0 0 rgba(255,59,46,0.85); }
    65%  { transform: scale(2.6); opacity: 0; box-shadow: 0 0 0 16px rgba(255,59,46,0); }
    100% { transform: scale(0.6); opacity: 0; }
  }
  @keyframes pulseNeonAmber {
    0%   { transform: scale(0.6); opacity: 1; box-shadow: 0 0 0 0 rgba(255,167,38,0.85); }
    65%  { transform: scale(2.4); opacity: 0; box-shadow: 0 0 0 14px rgba(255,167,38,0); }
    100% { transform: scale(0.6); opacity: 0; }
  }
  @keyframes glowIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes flashDark {
    0%,18%   { opacity:1; filter:drop-shadow(0 0 20px #c9a94a); }
    19%,24%  { opacity:0.06; filter:none; }
    25%,32%  { opacity:1; filter:drop-shadow(0 0 10px #c9a94a); }
    33%      { opacity:0.06; filter:none; }
    34%,100% { opacity:0.12; filter:grayscale(1) brightness(0.35); }
  }
  @keyframes dryWater {
    0%,20%   { transform:scale(1) translateY(0); opacity:1; }
    60%      { transform:scale(0.58) translateY(20px); opacity:0.12; }
    61%,100% { transform:scale(0.58) translateY(20px); opacity:0; }
  }
  @keyframes breakSanit {
    0%,28%   { transform:rotate(0deg) scale(1); opacity:1; }
    35%,100% { transform:rotate(-26deg) scale(0.88); opacity:0.38; filter:sepia(1) hue-rotate(-55deg) saturate(4); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  /* Priority tooltip */
  .priority-tooltip {
    background: rgba(13,14,40,0.95) !important;
    border: 1px solid rgba(255,59,46,0.4) !important;
    color: #E5D9B6 !important;
    font-family: 'Lato', sans-serif !important;
    font-size: 0.76rem !important;
    border-radius: 8px !important;
    font-weight: 300 !important;
  }
  .priority-tooltip::before { display:none !important; }

  /* Scene 3 icon animations */
  .anim-power  { animation: flashDark 4.5s ease infinite; }
  .anim-water  { animation: dryWater 4.5s ease infinite; }
  .anim-sanit  { animation: breakSanit 4.5s ease infinite; }
`;

if (typeof document !== 'undefined' && !document.getElementById('infra-global-style')) {
  const style = document.createElement('style');
  style.id = 'infra-global-style';
  style.textContent = GLOBAL_CSS;
  document.head.appendChild(style);
}

/* ─────────────────────────────────────────────────────────────────
   SVG ICON LIBRARY  (no emoji)
───────────────────────────────────────────────────────────────── */
const Icons = {
  Building: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
    </svg>
  ),
  School: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Hospital: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/>
    </svg>
  ),
  Store: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2H18L21 8H3L6 2z"/><path d="M3 8v13a1 1 0 001 1h16a1 1 0 001-1V8"/><path d="M9 21V13h6v8"/>
    </svg>
  ),
  Mosque: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V9.5a2 2 0 011.03-1.75L12 3l7.97 4.75A2 2 0 0121 9.5V21"/><path d="M9 21V15h6v6"/><path d="M12 3v5"/>
    </svg>
  ),
  MapPin: ({ size=16, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  ArrowDown: ({ size=14, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12l7 7 7-7"/>
    </svg>
  ),
  Zap: ({ size=28, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Droplet: ({ size=28, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
    </svg>
  ),
  AlertTriangle: ({ size=28, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Camera: ({ size=12, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  ChevronDown: ({ size=14, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Users: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Lock: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ),
  Road: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l3-16 6 2 6-2 3 16"/><path d="M12 7v14"/>
    </svg>
  ),
  Heart: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  Target: ({ size=16, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
};

/* ─────────────────────────────────────────────────────────────────
   UTILITY HOOKS
───────────────────────────────────────────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─────────────────────────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────────────────────────── */
function AnimatedCounter({ value, duration = 2.5, suffix = '' }) {
  const spanRef = useRef(null);
  const [containerRef, inView] = useInView(0.1);
  const setRefs = useCallback((el) => {
    containerRef.current = el;
    spanRef.current = el;
  }, [containerRef]);
  useEffect(() => {
    if (!inView || !spanRef.current) return;
    const end = parseFloat(String(value).replace(/[^\d.]/g, ''));
    if (isNaN(end)) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: end, duration, ease: 'power2.out',
      onUpdate: () => {
        if (spanRef.current)
          spanRef.current.innerHTML = Math.round(obj.val).toLocaleString('id-ID') + suffix;
      },
    });
  }, [inView, value, duration, suffix]);
  return <span ref={setRefs}>0{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────────────
   MAP FLY-TO
───────────────────────────────────────────────────────────────── */
function MapFlyToUpdater({ center, zoom }) {
  const map = useMap();
  const centerKey = center ? `${center[0]},${center[1]}` : '';
  useEffect(() => {
    if (!centerKey || !map) return;
    const [lat, lng] = centerKey.split(',').map(Number);
    if (!isNaN(lat) && !isNaN(lng)) {
      try { map.flyTo([lat, lng], zoom, { duration: 1.5, easeLinearity: 0.25 }); }
      catch (_) {}
    }
  }, [centerKey, zoom]);
  return null;
}

const SCENE2_ANCHOR_ID = 'scene2-kelumpuhan-desa';

/* ─────────────────────────────────────────────────────────────────
   TYPOGRAPHY OBJECTS
───────────────────────────────────────────────────────────────── */
const T = {
  eyebrow: { fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase' },
  display: { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', lineHeight: 1.18 },
  body:    { fontFamily: 'Lato, sans-serif', fontWeight: 300, lineHeight: 1.82 },
};

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  SCENE 1 — KELUMPUHAN KOTA                                   ║
   ║  Foto before-after + Barchart full-width (NO MAP)            ║
   ╚═══════════════════════════════════════════════════════════════╝ */
function SceneKelumpuhanKota() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [hoveredSlide, setHoveredSlide] = useState(null);
  const [chartInView, setChartInView] = useState(false);
  const chartRef = useRef(null);
  const autoRef  = useRef(null);

  const kondisiPerKat = insights?.fasilitas_infrastruktur?.kondisi_per_kategori || {};

  const KATEGORI_META = [
    { key: 'Pendidikan', Icon: Icons.School,   color: '#4a6fa5' },
    { key: 'Kesehatan',  Icon: Icons.Hospital,  color: '#5a8a5e' },
    { key: 'Ekonomi',    Icon: Icons.Store,     color: '#c9a94a' },
    { key: 'Sosial',     Icon: Icons.Mosque,    color: '#c77d29' },
  ];

  const chartDataByKat = KATEGORI_META.map(({ key, Icon, color }) => {
    const kat = kondisiPerKat[key] || {};
    const baik   = kat['Baik']?.n        || 0;
    const ringan = kat['Rusak Ringan']?.n || 0;
    const sedang = kat['Rusak Sedang']?.n || 0;
    const berat  = kat['Rusak Berat']?.n  || 0;
    const total  = baik + ringan + sedang + berat;
    return { name: key, Icon, baik, ringan, sedang, berat, total, color };
  });

  let totals = { Baik: 0, Ringan: 0, Sedang: 0, Berat: 0 };
  Object.values(kondisiPerKat).forEach((kat) => {
    totals.Baik   += kat['Baik']?.n         || 0;
    totals.Ringan += kat['Rusak Ringan']?.n  || 0;
    totals.Sedang += kat['Rusak Sedang']?.n  || 0;
    totals.Berat  += kat['Rusak Berat']?.n   || 0;
  });
  const totalFas = totals.Baik + totals.Ringan + totals.Sedang + totals.Berat;
  const pctBerat = totalFas > 0 ? ((totals.Berat / totalFas) * 100).toFixed(1) : 0;

  /* Before-After slides */
  const SLIDES = [
    {
      id: 'Baik',
      label: 'Kondisi Baik',
      title: 'Berdiri, Namun Terkepung',
      desc: 'Padang Panjang, Sumatera Barat. Struktur bangunan masih utuh — tapi lumpur tebal dan material longsor mengepung setiap akses masuk. Sekolah terbuka, tapi tak ada yang bisa masuk.',
      img: '/assets/pkl2_1.webp',
      color: '#5a8a5e',
    },
    {
      id: 'Rusak Ringan',
      label: 'Rusak Ringan',
      title: 'Jembatan Satu-Satunya Terputus',
      desc: 'Pidie Jaya, Aceh. Bukan gedung yang roboh — melainkan jembatan penghubung satu-satunya yang ambruk. Logistik berhenti. Warga terisolir dari fasilitas kesehatan dan pasar.',
      img: '/assets/pkl4_1.webp',
      color: '#c9a94a',
    },
    {
      id: 'Rusak Sedang',
      label: 'Rusak Sedang',
      title: 'Longsor Turun ke Pemukiman',
      desc: 'Sibolga, Sumatera Utara. Bukit yang selama ini jinak mendadak bergerak. Longsor menghantam sisi pemukiman dan menutup akses jalan utama — kerusakan meluas lebih jauh dari yang terlihat.',
      img: '/assets/pkl3_1.webp',
      color: '#c77d29',
    },
    {
      id: 'Rusak Berat',
      label: 'Rusak Berat',
      title: 'Tersapu Banjir Bandang',
      desc: 'Palembayan, Agam, Sumatera Barat. Tidak ada yang tersisa. Masjid, fasilitas sosial, rumah warga — rata dengan tanah dalam hitungan menit saat banjir bandang datang tanpa peringatan malam itu.',
      img: '/assets/pkl1.webp',
      color: '#c0392b',
    },
  ];

  const startAuto = useCallback(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setActiveSlide((p) => (p + 1) % SLIDES.length), 6500);
  }, [SLIDES.length]);

  useEffect(() => { startAuto(); return () => clearInterval(autoRef.current); }, [startAuto]);

  const scrollToScene2 = () => {
    const el = document.getElementById(SCENE2_ANCHOR_ID);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setChartInView(true); }, { threshold: 0.2 });
    if (chartRef.current) obs.observe(chartRef.current);
    return () => obs.disconnect();
  }, []);

  const active = SLIDES[activeSlide];

  return (
    <section style={{
      background: 'linear-gradient(175deg,#15173D 0%,#0f1030 55%,#0d0e28 100%)',
      padding: '7rem 2rem 5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle ambient texture */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(ellipse at 25% 15%,rgba(229,217,182,0.03) 0%,transparent 55%),radial-gradient(ellipse at 75% 85%,rgba(192,57,43,0.04) 0%,transparent 55%)', pointerEvents:'none' }} />

      <div style={{ maxWidth: 1340, margin: '0 auto', position: 'relative' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <span className="t-eyebrow" style={{ color:'rgba(229,217,182,0.35)', display:'block', marginBottom:'0.9rem' }}>Babak 2 · Scene 1</span>
          <h2 className="t-display" style={{ fontSize:'clamp(2rem,4vw,3rem)', color:'#E5D9B6', marginBottom:'1rem', fontWeight:700 }}>
            Jejak Infrastruktur:
            <br />
            <span style={{ color:'rgba(229,217,182,0.45)' }}>Ruang Publik yang Lumpuh</span>
          </h2>
          <p className="t-body" style={{ fontSize:'1rem', color:'var(--muted-text)', maxWidth:680, margin:'0 auto' }}>
            Di balik setiap angka, ada gedung sekolah yang tutup, jembatan yang runtuh, pasar yang sepi. Pendataan lapangan memetakan 
            lebih dari seribu titik fasilitas rusak — agar bantuan tidak salah alamat.
          </p>
        </div>

        {/* Layout: Foto (kiri) + Barchart (kanan) — proporsi seimbang */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.35fr)',
          gap: '2rem',
          alignItems: 'start',
        }}>

          {/* ── Kolom Kiri: Foto Carousel ── */}
          <div style={{
            position: 'relative',
            borderRadius: 20,
            border: '1px solid rgba(229,217,182,0.08)',
            background: 'rgba(229,217,182,0.02)',
            overflow: 'hidden',
            boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
          }}>
            {SLIDES.map((slide, idx) => {
              const isAct = idx === activeSlide;
              return (
                <div key={slide.id} style={{
                  position: isAct ? 'relative' : 'absolute',
                  inset: 0,
                  opacity: isAct ? 1 : 0,
                  visibility: isAct ? 'visible' : 'hidden',
                  transition: 'opacity 0.6s ease-in-out',
                  zIndex: isAct ? 10 : 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {/* Foto — full image visible, blurred same-image backdrop fills gaps seamlessly */}
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16/10',
                    background: '#080918',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    {/* Backdrop: same image, scaled & blurred, fills entire frame so no black bars show */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url(${slide.img})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'grayscale(0.55) brightness(0.55) saturate(0.6) blur(28px)',
                      transform: 'scale(1.15)',
                    }} />
                    {/* Foreground: full image, never cropped */}
                    <img
                      src={slide.img}
                      alt={slide.title}
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center',
                        filter: 'grayscale(0.55) brightness(0.82) saturate(0.6)',
                        display: 'block',
                      }}
                    />
                    {/* gradient overlay for text legibility */}
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(13,14,40,0.92) 0%,rgba(13,14,40,0.2) 55%,transparent 100%)' }} />
                    {/* Foto credit */}
                    <div style={{
                      position: 'absolute', bottom:'0.7rem', left:'0.7rem',
                      display:'flex', alignItems:'center', gap:'0.4rem',
                      background: 'rgba(13,14,40,0.75)', backdropFilter:'blur(8px)',
                      border: '1px solid rgba(229,217,182,0.1)',
                      padding: '0.22rem 0.6rem', borderRadius:20,
                      color: 'rgba(229,217,182,0.45)', fontSize:'0.62rem', fontFamily:'Lato',
                    }}>
                      <Icons.Camera size={11} color="rgba(229,217,182,0.45)" />
                      <span>Dokumentasi Tim R3P</span>
                    </div>
                    {/* Slide counter */}
                    <div style={{
                      position:'absolute', bottom:'0.7rem', right:'0.7rem',
                      fontFamily:'Lato', fontWeight:700, fontSize:'0.65rem',
                      color: slide.color, letterSpacing:'0.06em',
                    }}>
                      {String(idx+1).padStart(2,'0')}<span style={{color:'rgba(229,217,182,0.25)'}}> / {SLIDES.length}</span>
                    </div>
                  </div>

                  {/* Narasi */}
                  <div style={{
                    padding: '1.5rem 1.75rem 2.2rem',
                    borderLeft: `3px solid ${slide.color}55`,
                    marginLeft: 0,
                    flex: 1,
                  }}>
                    <h3 className="t-display" style={{ fontSize:'clamp(1rem,1.8vw,1.32rem)', color:'#E5D9B6', marginBottom:'0.65rem', fontWeight:700 }}>
                      {slide.title}
                    </h3>
                    <p className="t-body" style={{ fontSize:'0.88rem', color:'rgba(229,217,182,0.6)', margin:'0 0 1.25rem', lineHeight:1.75 }}>
                      {slide.desc}
                    </p>
                    <button
                      onClick={scrollToScene2}
                      onMouseEnter={() => setHoveredSlide(idx)}
                      onMouseLeave={() => setHoveredSlide(null)}
                      style={{
                        display: 'inline-flex', alignItems:'center', gap:'0.45rem',
                        padding: '0.45rem 1.1rem',
                        background: hoveredSlide===idx ? `${slide.color}18` : 'rgba(229,217,182,0.04)',
                        border: `1px solid ${hoveredSlide===idx ? slide.color : 'rgba(229,217,182,0.14)'}`,
                        borderRadius: 24, cursor: 'pointer',
                        transition: 'all 0.28s ease',
                        color: hoveredSlide===idx ? slide.color : 'rgba(229,217,182,0.45)',
                        fontSize: '0.7rem', fontFamily:'Lato', fontWeight:700,
                        letterSpacing: '0.07em', textTransform:'uppercase',
                      }}
                    >
                      <Icons.MapPin size={13} color={hoveredSlide===idx ? slide.color : 'rgba(229,217,182,0.45)'} />
                      <span>Lihat Detail Lokasi</span>
                      <span style={{ transform:hoveredSlide===idx?'translateY(3px)':'none', transition:'transform 0.28s', display:'inline-block' }}>
                        <Icons.ChevronDown size={12} color={hoveredSlide===idx ? slide.color : 'rgba(229,217,182,0.45)'} />
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Dots nav */}
            <div style={{ position:'absolute', bottom:'0.85rem', right:'1.9rem', display:'flex', justifyContent:'flex-end', gap:'0.5rem', zIndex:20 }}>
              {SLIDES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveSlide(i); startAuto(); }}
                  style={{
                    width: activeSlide===i ? 22 : 7, height: 7, borderRadius: 7,
                    background: activeSlide===i ? s.color : 'rgba(229,217,182,0.18)',
                    border: 'none', cursor: 'pointer',
                    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)', padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── Kolom Kanan: Chart ── */}
          <div ref={chartRef} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* Stat highlights */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              {[
                { label:'Total Fasilitas Terdata', val: totalFas.toLocaleString('id-ID'), color:'#4a6fa5', Icon: Icons.Building },
                { label:'Rusak Berat', val: `${pctBerat}%`, color:'#c0392b', Icon: Icons.AlertTriangle },
              ].map((s) => (
                <div key={s.label} style={{
                  padding: '1.1rem 1.3rem',
                  background: 'rgba(229,217,182,0.025)',
                  borderRadius: 14,
                  border: `1px solid ${s.color}22`,
                  boxShadow: `0 4px 18px rgba(0,0,0,0.3),0 0 0 1px ${s.color}10`,
                }}>
                  <s.Icon size={18} color={s.color} />
                  <div className="t-display" style={{ fontSize:'1.75rem', color:s.color, fontWeight:700, lineHeight:1, marginTop:'0.6rem' }}>{s.val}</div>
                  <div className="t-eyebrow" style={{ color:'rgba(229,217,182,0.32)', fontSize:'0.58rem', marginTop:'0.4rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Stacked bar per kategori */}
            <div style={{
              background: 'rgba(229,217,182,0.018)',
              borderRadius: 18,
              border: '1px solid rgba(229,217,182,0.06)',
              padding: '1.5rem',
              boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', gap:'0.5rem', flexWrap:'wrap' }}>
                <span className="t-eyebrow" style={{ color:'rgba(229,217,182,0.5)', fontSize:'0.66rem' }}>Kondisi Fasilitas per Sektor</span>
                <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
                  {[
                    { label:'Rusak Berat', fill:'#c0392b' },
                    { label:'Rusak Sedang', fill:'#c77d29' },
                    { label:'Rusak Ringan', fill:'#c9a94a' },
                    { label:'Baik', fill:'#5a8a5e' },
                  ].map((l) => (
                    <div key={l.label} style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:l.fill }} />
                      <span style={{ fontSize:'0.62rem', color:'rgba(229,217,182,0.36)', fontFamily:'Lato', fontWeight:300 }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {chartDataByKat.map((kat, ki) => {
                const maxVal = Math.max(...chartDataByKat.map((k) => k.total), 1);
                const segments = [
                  { val: kat.berat,  fill:'#c0392b' },
                  { val: kat.sedang, fill:'#c77d29' },
                  { val: kat.ringan, fill:'#c9a94a' },
                  { val: kat.baik,   fill:'#5a8a5e' },
                ];
                return (
                  <div key={kat.name} style={{ marginBottom: ki < chartDataByKat.length-1 ? '1.1rem' : 0 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.38rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <kat.Icon size={14} color={kat.color} />
                        <span className="t-label" style={{ color:'rgba(229,217,182,0.75)', fontWeight:400 }}>{kat.name}</span>
                      </div>
                      <span className="t-label" style={{ color:'rgba(229,217,182,0.35)', fontSize:'0.72rem' }}>{kat.total.toLocaleString('id-ID')} unit</span>
                    </div>
                    <div style={{ height:14, borderRadius:7, background:'rgba(229,217,182,0.05)', overflow:'hidden', display:'flex', gap:1 }}>
                      {segments.map((seg, si) => (
                        <div key={si} style={{
                          height: '100%',
                          width: chartInView ? `${(seg.val / maxVal) * 100}%` : '0%',
                          background: seg.fill,
                          transition: `width 1.0s ease ${ki*0.12 + si*0.05}s`,
                          borderRadius: si===0?'7px 0 0 7px': si===segments.length-1?'0 7px 7px 0':'0',
                          flexShrink: 0,
                        }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  SCENE 2 — KELUMPUHAN DESA                                   ║
   ║  Layout 50/50: narasi kiri scroll + peta sticky kanan        ║
   ║  Peta: grayscale satellite, neon marker accents              ║
   ╚═══════════════════════════════════════════════════════════════╝ */
function SceneKelumpuhanDesa() {
  const [activeProv, setActiveProv] = useState(0);
  const sectionRefsContainer = useRef([]);
  const setSectionRef = (el, i) => { sectionRefsContainer.current[i] = el; };

  const PROVINSI = [
    { key:'Aceh',           title:'Aceh',           subtitle:'Wilayah Terisolir',       center:[4.6951,96.7494],   zoom:8, color:'#c77d29', neon:'#ffa726' },
    { key:'Sumatera Utara', title:'Sumatera Utara',  subtitle:'Episenter Bencana',        center:[2.1154,98.5451],   zoom:8, color:'#c0392b', neon:'#ff3b2e' },
    { key:'Sumatera Barat', title:'Sumatera Barat',  subtitle:'Infrastruktur Terputus',   center:[-0.7390,100.8000], zoom:8, color:'#4a6fa5', neon:'#26c6da' },
  ];

  /* Narasi per provinsi — lebih natural dan kontekstual */
  const NARASI = {
    Aceh: 'Aceh mencatat sebaran kerusakan yang paling luas secara geografis. Banyak desa yang belum terjangkau jalan beraspal kini benar-benar terisolir — akses satu-satunya putus. Distribusi logistik terhenti, dan warga bergantung pada jalur darurat helikopter yang tidak bisa menanggung kebutuhan sehari-hari.',
    'Sumatera Utara': 'Sumatera Utara menanggung korban jiwa terbanyak. Bukan karena bencana ini paling kuat di sini, melainkan karena kepadatan pemukiman yang tinggi di lereng-lereng bukit tanpa sistem peringatan dini yang memadai. Setiap desa yang terdata menyimpan nama-nama yang hilang.',
    'Sumatera Barat': 'Jalur Padang–Bukittinggi — nadi perekonomian Sumbar — putus di beberapa titik sekaligus. Fasilitas umum yang rusak bukan hanya berhenti berfungsi; mereka memutus koneksi antar komunitas yang selama ini bergantung satu sama lain untuk bertahan hidup.',
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          const i = parseInt(e.target.dataset.idx, 10);
          if (!isNaN(i)) setActiveProv(i);
        }
      }),
      { threshold: 0.45 },
    );
    sectionRefsContainer.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const getMarkerColor = (pct) => {
    if (pct > 70) return '#ff3b2e';
    if (pct > 40) return '#ffa726';
    if (pct > 20) return '#c9a94a';
    return '#26c6da';
  };

  const currentProv = PROVINSI[activeProv];

  return (
    <section id={SCENE2_ANCHOR_ID} style={{ background:'#0d0e28', position:'relative' }}>
      {/* Top divider gradient */}
      <div style={{ height:2, background:'linear-gradient(90deg,transparent 0%,rgba(229,217,182,0.12) 30%,rgba(229,217,182,0.12) 70%,transparent 100%)' }} />

      <div style={{ display:'flex', flexWrap:'wrap' }}>

        {/* ── Kolom Kiri: Narasi Scroll ── */}
        <div style={{ flex:'1 1 480px', padding:'clamp(2.5rem,5vw,5rem) clamp(1.5rem,3.5vw,3.5rem)', zIndex:10, maxWidth:620 }}>

          {/* Scene header */}
          <div style={{ marginBottom:'3.5rem' }}>
            <span className="t-eyebrow" style={{ color:'rgba(229,217,182,0.3)', display:'block', marginBottom:'0.7rem' }}>Babak 2 · Scene 2</span>
            <h2 className="t-display" style={{ fontSize:'clamp(1.8rem,3vw,2.8rem)', color:'#E5D9B6', marginTop:'0.5rem', fontWeight:700, marginBottom:'1rem' }}>
              Sampai ke Sudut
              <br />
              <span style={{ color:'rgba(229,217,182,0.4)' }}>Desa yang Paling Jauh</span>
            </h2>
            <p className="t-body" style={{ fontSize:'0.96rem', color:'rgba(229,217,182,0.55)', lineHeight:1.8, maxWidth:460, margin:0 }}>
              Data bencana tidak berhenti di angka provinsi. Pendataan lapangan menelusuri setiap desa — 
              karena di situlah wajah nyata dari kehancuran ini tinggal.
            </p>
            <div style={{ marginTop:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem', color:'rgba(229,217,182,0.3)', fontSize:'0.78rem', fontFamily:'Lato', fontWeight:300 }}>
              <Icons.ArrowDown size={13} color="rgba(229,217,182,0.3)" />
              <span>Scroll untuk menelusuri tiap provinsi</span>
            </div>
          </div>

          {/* Per-provinsi cards */}
          {PROVINSI.map((prov, i) => {
            const jumlahDesa = insights?.cakupan_geografis_infra?.desa_per_provinsi?.[prov.key] || 0;
            const fasPerProv = insights?.fasilitas_infrastruktur?.jumlah_per_provinsi_per_kategori?.[prov.key] || {};
            const totalFasProv = Object.values(fasPerProv).reduce((a, v) => a + v, 0);
            const korban = insights?.anggota_keluarga?.korban_kritis_per_provinsi?.[prov.key] || {};
            const narasiTeks = NARASI[prov.key] || '';
            const isActive = activeProv === i;

            return (
              <div
                key={prov.key}
                ref={(el) => setSectionRef(el, i)}
                data-idx={i}
                style={{ minHeight:'65vh', display:'flex', flexDirection:'column', justifyContent:'center', paddingBottom:'2rem', paddingTop:'1rem' }}
              >
                <div style={{
                  padding: '1.75rem 1.75rem 1.75rem 1.5rem',
                  background: isActive ? `${prov.color}08` : 'rgba(229,217,182,0.015)',
                  borderLeft: `3px solid ${isActive ? prov.color : 'rgba(229,217,182,0.08)'}`,
                  borderRadius: '0 16px 16px 0',
                  transition: 'all 0.4s ease',
                  boxShadow: isActive ? `inset 0 0 0 1px ${prov.color}15` : 'none',
                }}>
                  {/* Provinsi header */}
                  <div style={{ marginBottom:'1rem' }}>
                    <span className="t-eyebrow" style={{ color:prov.color, fontSize:'0.62rem', opacity:0.8 }}>{prov.subtitle}</span>
                    <h3 className="t-display" style={{ fontSize:'clamp(1.3rem,2.2vw,1.8rem)', color:'#E5D9B6', marginTop:'0.3rem', marginBottom:0, fontWeight:700 }}>
                      {prov.title}
                    </h3>
                  </div>

                  {/* Narasi */}
                  <p className="t-body" style={{ color:'rgba(229,217,182,0.62)', fontSize:'0.91rem', margin:'0 0 1.25rem', lineHeight:1.78 }}>
                    {narasiTeks}
                  </p>

                  {/* Stat grid — 3 kolom ringkas */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.75rem', marginBottom: Object.keys(fasPerProv).length > 0 ? '1rem' : 0 }}>
                    <div style={{ padding:'0.85rem 1rem', background:'rgba(0,0,0,0.22)', borderRadius:10, border:`1px solid ${prov.color}1a` }}>
                      <div className="t-display" style={{ fontSize:'1.55rem', color:prov.color, fontWeight:700, lineHeight:1 }}>{jumlahDesa.toLocaleString('id-ID')}</div>
                      <div className="t-eyebrow" style={{ color:'rgba(229,217,182,0.32)', fontSize:'0.56rem', marginTop:'0.38rem' }}>Desa Terdata</div>
                    </div>
                    <div style={{ padding:'0.85rem 1rem', background:'rgba(0,0,0,0.22)', borderRadius:10, border:`1px solid rgba(229,217,182,0.08)` }}>
                      <div className="t-display" style={{ fontSize:'1.55rem', color:'#E5D9B6', fontWeight:700, lineHeight:1 }}>{totalFasProv.toLocaleString('id-ID')}</div>
                      <div className="t-eyebrow" style={{ color:'rgba(229,217,182,0.32)', fontSize:'0.56rem', marginTop:'0.38rem' }}>Fasilitas Terdata</div>
                    </div>
                    {korban.meninggal_bencana !== undefined ? (
                      <div style={{ padding:'0.85rem 1rem', background:'rgba(192,57,43,0.08)', borderRadius:10, border:'1px solid rgba(192,57,43,0.18)' }}>
                        <div className="t-display" style={{ fontSize:'1.55rem', color:'#c0392b', fontWeight:700, lineHeight:1 }}>{korban.meninggal_bencana}</div>
                        <div className="t-eyebrow" style={{ color:'rgba(229,217,182,0.32)', fontSize:'0.56rem', marginTop:'0.38rem' }}>Korban Jiwa</div>
                      </div>
                    ) : (
                      <div style={{ padding:'0.85rem 1rem', background:'rgba(0,0,0,0.22)', borderRadius:10, border:`1px solid rgba(229,217,182,0.08)` }}>
                        <div className="t-display" style={{ fontSize:'1.55rem', color:'rgba(229,217,182,0.3)', fontWeight:700, lineHeight:1 }}>—</div>
                        <div className="t-eyebrow" style={{ color:'rgba(229,217,182,0.2)', fontSize:'0.56rem', marginTop:'0.38rem' }}>Korban Jiwa</div>
                      </div>
                    )}
                  </div>

                  {/* Breakdown per kategori */}
                  {Object.keys(fasPerProv).length > 0 && (
                    <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1rem' }}>
                      {Object.entries(fasPerProv).map(([kat, jml]) => (
                        <div key={kat} style={{
                          padding: '0.28rem 0.65rem',
                          background: `${prov.color}10`,
                          border: `1px solid ${prov.color}20`,
                          borderRadius: 20,
                          fontSize: '0.7rem', fontFamily:'Lato', fontWeight:300,
                          color: 'rgba(229,217,182,0.65)',
                        }}>
                          {kat}: <strong style={{ color:prov.color, fontWeight:700 }}>{jml}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Legend */}
                  <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap', paddingTop:'0.85rem', borderTop:'1px solid rgba(229,217,182,0.06)' }}>
                    {[
                      { label:'> 70%', color:'#ff3b2e', desc:'Kritis' },
                      { label:'40–70%', color:'#ffa726', desc:'Berat' },
                      { label:'20–40%', color:'#c9a94a', desc:'Sedang' },
                      { label:'< 20%', color:'#26c6da', desc:'Ringan' },
                    ].map((l) => (
                      <div key={l.label} style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', background:l.color, boxShadow:`0 0 4px ${l.color}88`, flexShrink:0 }} />
                        <span style={{ fontSize:'0.67rem', color:'rgba(229,217,182,0.4)', fontFamily:'Lato', fontWeight:300 }}>{l.label}</span>
                        <span style={{ fontSize:'0.62rem', color:'rgba(229,217,182,0.22)', fontFamily:'Lato', fontWeight:300 }}>·{l.desc}</span>
                      </div>
                    ))}
                  </div>

                  {i < PROVINSI.length - 1 && (
                    <p style={{ fontStyle:'italic', color:'rgba(229,217,182,0.22)', marginTop:'1.5rem', marginBottom:0, fontSize:'0.84rem', textAlign:'right', fontFamily:'Lato', fontWeight:300 }}>
                      "Cerita yang sama berulang di provinsi berikutnya." ↓
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Kolom Kanan: Peta Sticky ── */}
        <div style={{
          flex: '1 1 420px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          padding: '2rem 2rem 2rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '0.75rem',
        }}>
          {/* Province label overlay */}
          <div style={{
            display:'flex', alignItems:'center', gap:'0.5rem',
            padding:'0.4rem 1rem', background:'rgba(13,14,40,0.85)',
            backdropFilter:'blur(12px)',
            border:`1px solid ${currentProv.neon}30`,
            borderRadius:30, alignSelf:'flex-start', marginBottom:'0.25rem',
          }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:currentProv.neon, boxShadow:`0 0 8px ${currentProv.neon}` }} />
            <span className="t-eyebrow" style={{ color:currentProv.neon, fontSize:'0.65rem' }}>{currentProv.title}</span>
          </div>

          {/* Map container */}
          <div style={{
            flex:1,
            borderRadius: 18,
            overflow: 'hidden',
            border: `1px solid rgba(229,217,182,0.08)`,
            boxShadow: `0 0 40px rgba(0,0,0,0.6),0 0 0 1px ${currentProv.neon}15`,
            position: 'relative',
            minHeight: 0,
          }}>
            {/* Gradient overlay — keterbacaan */}
            <div style={{
              position:'absolute', inset:0, zIndex:10, pointerEvents:'none',
              background:'linear-gradient(to bottom,rgba(13,14,40,0.12) 0%,transparent 20%,transparent 80%,rgba(13,14,40,0.25) 100%)',
            }} />

            <MapContainer
              center={PROVINSI[0].center}
              zoom={PROVINSI[0].zoom}
              zoomControl={false}
              scrollWheelZoom={false}
              style={{ width:'100%', height:'100%', minHeight:360 }}
            >
              {/* Carto Voyager — labeled basemap: provinsi, kabupaten, kecamatan, desa/jalan */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                maxZoom={20}
                subdomains="abcd"
              />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                maxZoom={20}
                subdomains="abcd"
              />
              <MapFlyToUpdater center={currentProv.center} zoom={currentProv.zoom} />
            </MapContainer>
          </div>

          {/* Legend bawah peta — compact */}
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(13,14,40,0.9)',
            backdropFilter: 'blur(14px)',
            borderRadius: 12,
            border: `1px solid ${currentProv.neon}18`,
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
              <span className="t-eyebrow" style={{ color:'rgba(229,217,182,0.3)', fontSize:'0.58rem' }}>Tingkat Kerusakan Desa</span>
              <span className="t-eyebrow" style={{ color:currentProv.neon, fontSize:'0.58rem' }}>● {currentProv.title}</span>
            </div>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
              {[
                { label:'> 70%', color:'#ff3b2e', desc:'Kritis' },
                { label:'40–70%', color:'#ffa726', desc:'Berat' },
                { label:'20–40%', color:'#c9a94a', desc:'Sedang' },
                { label:'< 20%', color:'#26c6da', desc:'Ringan' },
              ].map((l) => (
                <div key={l.label} style={{
                  display:'flex', alignItems:'center', gap:'0.3rem',
                  padding:'0.22rem 0.55rem',
                  background:`${l.color}0e`,
                  borderRadius:16, border:`1px solid ${l.color}25`,
                }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:l.color, boxShadow:`0 0 5px ${l.color}`, flexShrink:0 }} />
                  <span style={{ fontSize:'0.62rem', color:'rgba(229,217,182,0.55)', fontFamily:'Lato', fontWeight:300 }}>{l.label}</span>
                  <span style={{ fontSize:'0.58rem', color:'rgba(229,217,182,0.28)', fontFamily:'Lato', fontWeight:300 }}>{l.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom divider */}
      <div style={{ height:2, background:'linear-gradient(90deg,transparent 0%,rgba(229,217,182,0.1) 30%,rgba(229,217,182,0.1) 70%,transparent 100%)' }} />
    </section>
  );
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  SCENE 3 — NARASI LAYANAN DASAR                              ║
   ╚═══════════════════════════════════════════════════════════════╝ */
function SceneLayananDasar() {
  const [ref, inView] = useInView(0.3);

  const statusHunian = insights?.rumah_tangga?.status_hunian || {};
  const pengungsian  = statusHunian['3. Pengungsian']?.n || 0;
  const huntara      = statusHunian['6. Huntara']?.n     || 0;

  const sumberListrik = insights?.rumah_tangga?.sumber_listrik || {};
  const listrikPct    = +(100 - (sumberListrik['1. Listrik PLN']?.pct || 43.44)).toFixed(1);

  const sumberAir   = insights?.rumah_tangga?.sumber_air || {};
  const airLayakPct =
    (sumberAir['01. Air kemasan bermerek']?.pct || 0) +
    (sumberAir['02. Air isi ulang']?.pct        || 0) +
    (sumberAir['03. Leding']?.pct               || 0) +
    (sumberAir['04. Sumur bor/pompa']?.pct      || 0) +
    (sumberAir['05. Sumur terlindung']?.pct     || 0) +
    (sumberAir['07. Mata air terlindung']?.pct  || 0);
  const airPct = +(100 - airLayakPct).toFixed(1);

  const mck = insights?.rumah_tangga?.fasilitas_mck || {};
  const sanitasiPct = +(
    (mck['5. Tidak ada']?.pct                               || 0) +
    (mck['4. Tidak, di MCK umum/siapapun menggunakan']?.pct || 0) +
    (mck['3. Tidak, di MCK komunal']?.pct                   || 0)
  ).toFixed(1);

  const LAYANAN = [
    {
      Icon: Icons.Zap,
      title: 'Listrik Padam',
      desc: `${listrikPct}% rumah tangga kehilangan akses listrik PLN. Ratusan desa terhenti dalam gelap — pompa air berhenti, komunikasi terputus, rantai dingin logistik rusak.`,
      pct: listrikPct,
      color: '#c9a94a',
      animClass: 'anim-power',
    },
    {
      Icon: Icons.Droplet,
      title: 'Air Bersih Mengering',
      desc: `${airPct}% keluarga kehilangan akses air minum layak. Sumber air dan jalur distribusi terdampak langsung — di banyak titik, warga hanya bisa mengandalkan kiriman tangki darurat.`,
      pct: airPct,
      color: '#4a6fa5',
      animClass: 'anim-water',
    },
    {
      Icon: Icons.AlertTriangle,
      title: 'Sanitasi Lumpuh',
      desc: `${sanitasiPct}% fasilitas MCK rusak atau tidak tersedia. Di kawasan huntara yang padat, ini bukan sekadar ketidaknyamanan — ini risiko wabah penyakit yang nyata.`,
      pct: sanitasiPct,
      color: '#5a8a5e',
      animClass: 'anim-sanit',
    },
  ];

  return (
    <section style={{ background:'linear-gradient(180deg,#0d0e28 0%,#15173D 100%)', padding:'clamp(4rem,8vw,7.5rem) 2rem', overflow:'hidden' }}>
      <div style={{ maxWidth:980, margin:'0 auto', textAlign:'center' }}>
        <span className="t-eyebrow" style={{ color:'rgba(229,217,182,0.3)', display:'block', marginBottom:'0.8rem' }}>Babak 2 · Scene 3</span>
        <h2 className="t-display" style={{ fontSize:'clamp(1.8rem,3.2vw,2.8rem)', color:'#E5D9B6', marginBottom:'0.85rem', fontWeight:700 }}>
          Saat Kota <span style={{ color:'rgba(229,217,182,0.38)' }}>Kehilangan Denyutnya</span>
        </h2>
        <p className="t-body" style={{ fontSize:'0.98rem', color:'rgba(229,217,182,0.5)', maxWidth:580, margin:'0 auto 3.5rem' }}>
          Bencana merobohkan lebih dari bangunan. Ia memutus sistem kehidupan yang selama ini 
          dianggap begitu saja — listrik, air, sanitasi — hingga yang tersisa hanya kerentanan.
        </p>

        <div ref={ref} style={{ display:'flex', justifyContent:'center', gap:'1.25rem', flexWrap:'wrap', marginBottom:'2.75rem' }}>
          {LAYANAN.map((l, i) => (
            <div key={l.title} style={{
              flex: '1 1 240px', maxWidth: 300,
              background: 'rgba(229,217,182,0.02)',
              padding: '2rem 1.6rem',
              borderRadius: 16,
              border: `1px solid ${l.color}20`,
              borderTop: `2px solid ${l.color}`,
              textAlign: 'center',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(22px)',
              transition: `opacity 0.5s ease ${i*0.12}s,transform 0.5s ease ${i*0.12}s`,
            }}>
              <div className={inView ? l.animClass : ''} style={{
                display:'inline-flex', marginBottom:'1.25rem',
                filter:`drop-shadow(0 0 10px ${l.color}55)`,
              }}>
                <l.Icon size={36} color={l.color} />
              </div>
              <h4 className="t-display" style={{ fontSize:'1.1rem', color:'#E5D9B6', marginBottom:'0.6rem', fontWeight:700 }}>{l.title}</h4>
              <div style={{ height:4, background:'rgba(229,217,182,0.07)', borderRadius:3, margin:'0.85rem 0', overflow:'hidden' }}>
                <div style={{
                  height: '100%',
                  width: inView ? `${Math.min(l.pct, 100)}%` : '0%',
                  background: `linear-gradient(90deg,${l.color}88,${l.color})`,
                  borderRadius: 3,
                  transition: `width 1.4s ease ${0.3+i*0.15}s`,
                }} />
              </div>
              <div className="t-display" style={{ fontSize:'1.6rem', color:l.color, fontWeight:700, marginBottom:'0.45rem' }}>{l.pct}%</div>
              <p className="t-body" style={{ color:'rgba(229,217,182,0.48)', fontSize:'0.84rem', margin:0, lineHeight:1.72 }}>{l.desc}</p>
            </div>
          ))}
        </div>

        {(pengungsian > 0 || huntara > 0) && (
          <div style={{
            display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap',
            padding:'1.25rem 2rem',
            background:'rgba(192,57,43,0.05)',
            borderRadius:14, border:'1px solid rgba(192,57,43,0.15)',
          }}>
            <div style={{ textAlign:'center', flex:'0 1 180px' }}>
              <div className="t-display" style={{ fontSize:'2.2rem', color:'#c0392b', fontWeight:700 }}>{huntara.toLocaleString('id-ID')}</div>
              <div className="t-eyebrow" style={{ color:'rgba(229,217,182,0.38)', fontSize:'0.58rem', marginTop:'0.3rem' }}>KK di Huntara</div>
            </div>
            <div style={{ width:1, background:'rgba(229,217,182,0.07)', margin:'0.5rem 0', flexShrink:0 }} />
            <div style={{ textAlign:'center', flex:'0 1 180px' }}>
              <div className="t-display" style={{ fontSize:'2.2rem', color:'#c77d29', fontWeight:700 }}>{pengungsian.toLocaleString('id-ID')}</div>
              <div className="t-eyebrow" style={{ color:'rgba(229,217,182,0.38)', fontSize:'0.58rem', marginTop:'0.3rem' }}>KK di Pengungsian</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  SCENE 4 — ZONA PRIORITAS                                    ║
   ╚═══════════════════════════════════════════════════════════════╝ */
function CustomPulsingDot({ lat, lng, score, label }) {
  const map = useMap();
  useEffect(() => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
    const size = score > 90 ? 38 : score > 80 ? 28 : 20;
    const color = score > 90 ? '#ff3b2e' : score > 80 ? '#ffa726' : '#c9a94a';
    const icon = L.divIcon({
      className: '',
      html: `<div style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:${color}cc;animation:pulseNeon 2s ease-out infinite;box-shadow:0 0 10px ${color},0 0 0 0 ${color}bb;"></div>`,
      iconSize: [size, size], iconAnchor: [size/2, size/2],
    });
    const marker = L.marker([lat, lng], { icon }).addTo(map);
    if (label) marker.bindTooltip(label, { permanent:false, direction:'top', className:'priority-tooltip' });
    return () => { map.removeLayer(marker); };
  }, [map, lat, lng, score, label]);
  return null;
}

function SceneZonaPrioritas() {
  const [ref, started] = useInView(0.12);

  const jumlahPerProv = insights?.fasilitas_infrastruktur?.jumlah_per_provinsi_per_kategori || {};

  const totalsArr = Object.entries(jumlahPerProv).map(([prov, kat]) => ({
    prov,
    total: Object.values(kat).reduce((a, v) => a + v, 0),
  }));
  const maxTotal = Math.max(...totalsArr.map((x) => x.total), 1);

  const peringkat = totalsArr
    .map(({ prov, total }) => {
      const coords = prov === 'Aceh'
        ? { lat: 4.6951, lng: 96.7494 }
        : prov === 'Sumatera Utara'
        ? { lat: 2.1154, lng: 98.5451 }
        : { lat: -0.7390, lng: 100.8000 };
      return {
        kabupaten: prov,
        provinsi: prov,
        persen_kelumpuhan: +(total / maxTotal * 100).toFixed(1),
        ...coords,
      };
    })
    .sort((a, b) => b.persen_kelumpuhan - a.persen_kelumpuhan);

  return (
    <section style={{ background:'linear-gradient(180deg,#15173D 0%,#0d0e28 100%)', padding:'clamp(4rem,8vw,7rem) 2rem' }}>
      <div style={{ maxWidth:1240, margin:'0 auto' }}>

        <div style={{ textAlign:'center', marginBottom:'3.25rem' }}>
          <span className="t-eyebrow" style={{ color:'rgba(229,217,182,0.3)', display:'block', marginBottom:'0.75rem' }}>Babak 2 · Scene 4</span>
          <h2 className="t-display" style={{ fontSize:'clamp(1.8rem,3.2vw,2.8rem)', color:'#E5D9B6', marginBottom:'0.85rem', fontWeight:700 }}>
            Menentukan <span style={{ color:'rgba(229,217,182,0.38)' }}>Zona Prioritas</span>
          </h2>
          <p className="t-body" style={{ fontSize:'0.98rem', color:'rgba(229,217,182,0.5)', maxWidth:580, margin:'0 auto' }}>
            Tidak semua luka sama dalamnya. Di sinilah denyut bantuan harus dipompa paling kencang 
            — setiap keputusan kebijakan yang meleset berarti nyawa yang tidak terselamatkan.
          </p>
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:'2rem' }}>

          {/* Peta */}
          <div style={{
            flex: '1 1 460px', height: 560,
            borderRadius: 20, overflow: 'hidden',
            border: '1px solid rgba(255,59,46,0.18)',
            boxShadow: '0 0 50px rgba(255,59,46,0.08),0 24px 48px rgba(0,0,0,0.55)',
            background: '#09090b', position: 'sticky', top:'8vh',
          }}>
            <MapContainer center={[1.5,98.5]} zoom={6} zoomControl={false} scrollWheelZoom={false} style={{ width:'100%', height:'100%' }}>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri"
                maxZoom={18}
              />
              {peringkat.map((item, i) => (
                <CustomPulsingDot key={i} lat={item.lat} lng={item.lng} score={item.persen_kelumpuhan} label={item.kabupaten} />
              ))}
            </MapContainer>
            {/* Map overlay gradient */}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(13,14,40,0.2) 0%,transparent 25%,transparent 75%,rgba(13,14,40,0.4) 100%)', pointerEvents:'none', zIndex:500 }} />
            <div style={{
              position:'absolute', bottom:'1rem', left:'1rem',
              background:'rgba(13,14,40,0.88)', backdropFilter:'blur(8px)',
              padding:'0.45rem 0.9rem', borderRadius:24,
              border:'1px solid rgba(255,59,46,0.2)', zIndex:600,
              display:'flex', alignItems:'center', gap:'0.5rem',
            }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#ff3b2e', animation:'pulseNeon 2s ease-out infinite', boxShadow:'0 0 8px #ff3b2e' }} />
              <span className="t-eyebrow" style={{ color:'rgba(229,217,182,0.55)', fontSize:'0.58rem' }}>Titik Risiko Tertinggi</span>
            </div>
          </div>

          {/* Ranking list */}
          <div ref={ref} style={{ flex:'1 1 360px', display:'flex', flexDirection:'column', gap:'0.65rem' }}>
            <div className="t-eyebrow" style={{ color:'rgba(229,217,182,0.28)', fontSize:'0.62rem', marginBottom:'0.5rem' }}>Peringkat Provinsi Terdampak</div>
            {peringkat.map((item, i) => {
              const pct      = item.persen_kelumpuhan;
              const isTop    = i === 0;
              const isMid    = i === 1;
              const barColor = isTop ? 'linear-gradient(90deg,#c0392b,#ff3b2e)'
                             : isMid ? 'linear-gradient(90deg,#c77d29,#ffa726)'
                             : 'linear-gradient(90deg,#4a6fa5,#26c6da)';
              const accentColor = isTop ? '#ff3b2e' : isMid ? '#ffa726' : '#26c6da';
              return (
                <div key={item.kabupaten} style={{
                  display:'flex', alignItems:'center', gap:'0.85rem',
                  padding:'0.85rem 1.2rem',
                  background: isTop ? 'rgba(192,57,43,0.06)' : 'rgba(229,217,182,0.02)',
                  borderRadius: 12,
                  border: isTop ? '1px solid rgba(192,57,43,0.2)' : '1px solid rgba(229,217,182,0.05)',
                  opacity: started ? 1 : 0,
                  transform: started ? 'translateX(0)' : 'translateX(-16px)',
                  transition: `opacity 0.45s ease ${i*0.12}s,transform 0.45s ease ${i*0.12}s`,
                }}>
                  <div style={{
                    width: 30, height: 30, flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    borderRadius:'50%',
                    background: isTop ? 'rgba(192,57,43,0.25)' : isMid ? 'rgba(199,125,41,0.25)' : 'rgba(74,111,165,0.2)',
                    fontSize:'0.78rem', color: accentColor, fontWeight:700, fontFamily:'Lato',
                    boxShadow: `0 0 10px ${accentColor}44`,
                  }}>{i+1}</div>
                  <div style={{ flex:'0 0 160px', minWidth:0 }}>
                    <div className="t-label" style={{ fontWeight:700, fontSize:'0.88rem', color:'#E5D9B6' }}>{item.kabupaten}</div>
                    <div style={{ fontFamily:'Lato', fontSize:'0.68rem', color:'rgba(229,217,182,0.3)', fontWeight:300 }}>{item.provinsi}</div>
                  </div>
                  <div style={{ flex:1, height:6, background:'rgba(229,217,182,0.07)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: started ? `${pct}%` : '0%',
                      background: barColor,
                      borderRadius: 3,
                      transition: `width 1.1s ease ${0.2+i*0.12}s`,
                      boxShadow: `0 0 6px ${accentColor}66`,
                    }} />
                  </div>
                  <div style={{
                    fontFamily:'Lato', fontWeight:700, fontSize:'0.8rem',
                    color: accentColor, flexShrink:0, minWidth:44, textAlign:'right',
                  }}>{pct.toFixed(1)}%</div>
                </div>
              );
            })}
            <div style={{ marginTop:'0.4rem', padding:'0.7rem 1rem', background:'rgba(229,217,182,0.02)', borderRadius:10, border:'1px solid rgba(229,217,182,0.05)' }}>
              <p className="t-body" style={{ fontSize:'0.72rem', color:'rgba(229,217,182,0.25)', margin:0, lineHeight:1.6 }}>
                * Skor relatif terhadap jumlah fasilitas terdampak per provinsi. Aceh (1.142 unit) = 100%, Sumut (965) = 84.5%, Sumbar (632) = 55.3%.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  TRANSISI BABAK 2 → 3                                        ║
   ╚═══════════════════════════════════════════════════════════════╝ */
function TransisiBabak23() {
  const [ref, visible] = useInView(0.12);

  const kabPerProv  = insights?.cakupan_geografis_infra?.kab_kota_per_provinsi || {};
  const desaPerProv = insights?.cakupan_geografis_infra?.desa_per_provinsi     || {};
  const korbanProv  = insights?.anggota_keluarga?.korban_kritis_per_provinsi   || {};

  const CARDS = [
    {
      nama: 'Sumatera Utara',
      peran: 'Episenter',
      desc: 'Korban meninggal terbanyak. Pusat bencana berada di sini — 19 kab/kota terdampak, ratusan desa lumpuh serentak di malam yang sama.',
      color: '#c0392b',
      neon: '#ff3b2e',
      Icon: Icons.Heart,
      img: '/assets/pkl3_1.webp',
      stat: { label:'Korban Meninggal', nilai: String(korbanProv['Sumatera Utara']?.meninggal_bencana ?? 54) },
    },
    {
      nama: 'Aceh',
      peran: 'Isolasi Wilayah',
      desc: 'Sejumlah kecamatan mengalami isolasi total. Jalan dan jembatan penghubung putus, memotong komunitas dari dunia luar selama berhari-hari.',
      color: '#c77d29',
      neon: '#ffa726',
      Icon: Icons.Lock,
      img: '/assets/pkl4_1.webp',
      stat: { label:'Korban Meninggal', nilai: String(korbanProv['Aceh']?.meninggal_bencana ?? 44) },
    },
    {
      nama: 'Sumatera Barat',
      peran: 'Infrastruktur Terputus',
      desc: 'Jalur vital Padang–Bukittinggi lumpuh di beberapa titik sekaligus. Jutaan warga terputus dari akses ekonomi dan layanan dasar.',
      color: '#4a6fa5',
      neon: '#26c6da',
      Icon: Icons.Road,
      img: '/assets/pkl2_1.webp',
      stat: { label:'Korban Meninggal', nilai: String(korbanProv['Sumatera Barat']?.meninggal_bencana ?? 4) },
    },
  ];

  return (
    <section style={{
      background: '#0d0e28',
      padding: 'clamp(5rem,9vw,8rem) 2rem',
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 18% 80%,rgba(192,57,43,0.04) 0%,transparent 55%),radial-gradient(circle at 82% 18%,rgba(74,111,165,0.04) 0%,transparent 55%)', pointerEvents:'none' }} />

      <div style={{ maxWidth:1080, margin:'0 auto', width:'100%', position:'relative' }}>

        <div style={{ textAlign:'center', marginBottom:'3rem' }}>
          <div className="t-eyebrow" style={{ color:'rgba(229,217,182,0.2)', marginBottom:'1.1rem' }}>Transisi · Babak 2 → Babak 3</div>
          <h2 className="t-display" style={{ fontSize:'clamp(1.5rem,3.2vw,2.6rem)', color:'#E5D9B6', maxWidth:680, margin:'0 auto 0.75rem', fontWeight:700 }}>
            Aceh, Sumatera Utara, Sumatera Barat:
            <br />
            <span style={{ color:'rgba(229,217,182,0.38)' }}>Siapa Paling Menanggung Beban?</span>
          </h2>
          <p className="t-body" style={{ fontSize:'0.96rem', color:'rgba(229,217,182,0.38)', maxWidth:520, margin:'0.9rem auto 0' }}>
            Tiga provinsi. Tiga cerita yang berbeda, tapi berakhir pada titik yang sama — komunitas yang kehilangan pegangan.
          </p>
        </div>

        <div ref={ref} style={{ display:'flex', gap:'1.25rem', flexWrap:'wrap', justifyContent:'center' }}>
          {CARDS.map((card, i) => (
            <div key={card.nama} style={{
              flex: '1 1 280px', maxWidth: 330,
              borderRadius: 18, overflow:'hidden',
              border: `1px solid ${card.neon}20`,
              borderTop: `2px solid ${card.neon}`,
              position: 'relative',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(28px)',
              transition: `opacity 0.55s ease ${i*0.15}s,transform 0.55s ease ${i*0.15}s`,
              boxShadow: visible ? `0 24px 55px rgba(0,0,0,0.5),0 0 0 1px ${card.neon}12` : 'none',
            }}>
              <div style={{
                position:'absolute', inset:0,
                backgroundImage: `url(${card.img})`,
                backgroundSize:'cover', backgroundPosition:'center',
                filter:'grayscale(0.75) brightness(0.22) saturate(0.5)',
                zIndex:0,
              }} />
              <div style={{
                position:'absolute', inset:0,
                background:`linear-gradient(165deg,${card.neon}14 0%,rgba(13,14,40,0.92) 55%)`,
                zIndex:1,
              }} />
              <div style={{ position:'relative', zIndex:2, padding:'2rem 1.6rem' }}>
                <card.Icon size={20} color={card.neon} />
                <div className="t-eyebrow" style={{ color:card.neon, fontSize:'0.62rem', marginTop:'0.75rem', marginBottom:'0.38rem' }}>{card.peran}</div>
                <div className="t-display" style={{ fontSize:'1.2rem', color:'#E5D9B6', marginBottom:'0.7rem', fontWeight:700 }}>{card.nama}</div>
                <p className="t-body" style={{ fontSize:'0.84rem', color:'rgba(229,217,182,0.55)', margin:'0 0 1.4rem', lineHeight:1.7 }}>{card.desc}</p>
                <div style={{ borderTop:`1px solid ${card.neon}18`, paddingTop:'1.1rem', display:'flex', gap:'1rem', flexWrap:'wrap' }}>
                  <div>
                    <div className="t-display" style={{ fontSize:'1.4rem', color:card.neon, fontWeight:700, lineHeight:1 }}>{card.stat.nilai}</div>
                    <div className="t-eyebrow" style={{ color:'rgba(229,217,182,0.28)', fontSize:'0.56rem', marginTop:'0.28rem' }}>{card.stat.label}</div>
                  </div>
                  {desaPerProv[card.nama] && (
                    <div>
                      <div className="t-display" style={{ fontSize:'1.4rem', color:'#E5D9B6', fontWeight:700, lineHeight:1 }}>
                        <AnimatedCounter value={desaPerProv[card.nama]} duration={2.2} />
                      </div>
                      <div className="t-eyebrow" style={{ color:'rgba(229,217,182,0.28)', fontSize:'0.56rem', marginTop:'0.28rem' }}>Desa Terdata</div>
                    </div>
                  )}
                  {kabPerProv[card.nama] && (
                    <div>
                      <div className="t-display" style={{ fontSize:'1.4rem', color:'#E5D9B6', fontWeight:700, lineHeight:1 }}>
                        <AnimatedCounter value={kabPerProv[card.nama]} duration={1.8} />
                      </div>
                      <div className="t-eyebrow" style={{ color:'rgba(229,217,182,0.28)', fontSize:'0.56rem', marginTop:'0.28rem' }}>Kab / Kota</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          textAlign:'center', marginTop:'3.5rem',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.5s ease 0.55s,transform 0.5s ease 0.55s',
        }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'0.65rem',
            padding:'0.65rem 1.5rem',
            background:'rgba(229,217,182,0.03)',
            border:'1px solid rgba(229,217,182,0.07)',
            borderRadius:36,
          }}>
            <Icons.Users size={15} color="rgba(229,217,182,0.35)" />
            <span className="t-body" style={{ fontSize:'0.88rem', color:'rgba(229,217,182,0.38)' }}>Babak 3: Wajah Kemanusiaan di Balik Data ↓</span>
          </div>
        </div>

      </div>
    </section>
  );
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  EXPORT                                                       ║
   ╚═══════════════════════════════════════════════════════════════╝ */
export default function BabakInfrastruktur() {
  return (
    <>
      <SceneKelumpuhanKota />
      <SceneKelumpuhanDesa />
      <SceneLayananDasar />
      <SceneZonaPrioritas />
      <TransisiBabak23 />
    </>
  );
}