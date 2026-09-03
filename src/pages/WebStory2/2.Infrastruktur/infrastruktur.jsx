/**
 * infrastruktur.jsx — Babak 2: Infrastruktur
 * REVISI DESAIN: editorial data-storytelling, palet navy (#12143A) / cream (#F7F1E3)
 * bergantian per-section, transisi wave/gradient halus, tipografi sebagai hierarchy
 * utama (tanpa border tebal, outline, atau neon). Playfair Display Italic (display)
 * + Lato (body). Seluruh data, import, asset, dan animasi dari versi sebelumnya
 * dipertahankan.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import insights from '../insight.json';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────
   GLOBAL STYLES — DESIGN TOKENS
   Navy (dasar gelap) dan Cream (dasar terang) bergantian per section.
   Aksen warna dilembutkan (tanpa neon) agar terasa editorial & premium.
───────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,700&family=Lato:wght@300;400;700&display=swap');

  :root {
    --navy:        #12143A;
    --navy-deep:   #0A0B22;
    --navy-mid:    #1B1D4B;
    --cream:       #F7F1E3;
    --cream-mid:   #EFE6D0;
    --cream-warm:  #FBF5E8;
    --cream-cool:  #EEE8DA;
    --ink:         #15173D;
    --ink-soft:    rgba(21,23,61,0.6);
    --ink-faint:   rgba(21,23,61,0.34);
    --cream-text:  #EFE6D0;
    --cream-text-soft: rgba(239,230,208,0.62);
    --cream-text-faint: rgba(239,230,208,0.34);
    --gold:  #B8874A;
    --rust:  #A8503F;
    --slate: #45618C;
    --sage:  #5C7A5E;
    --line-on-cream: rgba(21,23,61,0.09);
    --line-on-navy:  rgba(239,230,208,0.10);
  }

  * { box-sizing: border-box; }
  html { overflow-x: hidden; }

  .t-display {
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic;
    line-height: 1.16;
  }
  .t-body {
    font-family: 'Lato', sans-serif;
    font-weight: 300;
    line-height: 1.7;
  }
  .t-eyebrow {
    font-family: 'Lato', sans-serif;
    font-weight: 700;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .t-label {
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    font-size: 0.78rem;
  }

  .infra-section { position: relative; overflow: hidden; }

  /* ── Decorative grain texture overlay ── */
  .infra-grain::after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.028;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 200px 200px;
    z-index: 1;
  }

  /* ── Unique section background variants ── */
  .infra-bg-navy-warm {
    background:
      radial-gradient(ellipse at 22% 12%, rgba(184,135,74,0.07) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 85%, rgba(92,122,94,0.05) 0%, transparent 45%),
      linear-gradient(175deg, #151740 0%, #12143A 35%, #0E1030 70%, #12143A 100%);
  }
  .infra-bg-navy-cool {
    background:
      radial-gradient(ellipse at 70% 20%, rgba(69,97,140,0.09) 0%, transparent 55%),
      radial-gradient(ellipse at 15% 80%, rgba(168,80,63,0.04) 0%, transparent 40%),
      linear-gradient(195deg, #10123A 0%, #141648 40%, #0D0F2E 75%, #12143A 100%);
  }
  .infra-bg-navy-glow {
    background:
      radial-gradient(ellipse at 50% 0%, rgba(239,230,208,0.06) 0%, transparent 55%),
      radial-gradient(ellipse at 50% 100%, rgba(184,135,74,0.04) 0%, transparent 40%),
      linear-gradient(180deg, #14163E 0%, #0F1132 50%, #12143A 100%);
  }
  .infra-bg-cream-warm {
    background:
      radial-gradient(ellipse at 20% 30%, rgba(184,135,74,0.06) 0%, transparent 55%),
      radial-gradient(ellipse at 80% 70%, rgba(168,80,63,0.03) 0%, transparent 50%),
      linear-gradient(170deg, #FBF5E8 0%, #F7F1E3 40%, #F3ECD8 70%, #F7F1E3 100%);
  }
  .infra-bg-cream-cool {
    background:
      radial-gradient(ellipse at 75% 20%, rgba(69,97,140,0.04) 0%, transparent 50%),
      radial-gradient(ellipse at 25% 80%, rgba(92,122,94,0.04) 0%, transparent 50%),
      linear-gradient(185deg, #F5EFE0 0%, #F7F1E3 35%, #FAF4E6 65%, #F2ECDD 100%);
  }
  .infra-bg-cream-golden {
    background:
      radial-gradient(ellipse at 50% 10%, rgba(184,135,74,0.05) 0%, transparent 60%),
      radial-gradient(ellipse at 50% 90%, rgba(239,230,208,0.5) 0%, transparent 45%),
      linear-gradient(180deg, #F9F3E5 0%, #F7F1E3 50%, #F4EDDA 100%);
  }

  /* Leaflet basemap + minimal, unobtrusive attribution (wajib secara lisensi) */
  .leaflet-container { background: #E9E2CF !important; font-family: 'Lato', sans-serif !important; }
  .leaflet-control-attribution {
    background: rgba(247,241,227,0.82) !important;
    color: rgba(21,23,61,0.55) !important;
    font-size: 0.58rem !important;
    padding: 1px 6px !important;
    border-radius: 6px 0 0 0 !important;
  }
  .leaflet-control-attribution a { color: rgba(21,23,61,0.65) !important; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--navy); }
  ::-webkit-scrollbar-thumb { background: rgba(239,230,208,0.2); border-radius: 4px; }

  @keyframes pulseNeon {
    0%   { transform: scale(0.6); opacity: 1; box-shadow: 0 0 0 0 rgba(168,80,63,0.7); }
    65%  { transform: scale(2.4); opacity: 0; box-shadow: 0 0 0 14px rgba(168,80,63,0); }
    100% { transform: scale(0.6); opacity: 0; }
  }
  @keyframes glowIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes flashDark {
    0%,18%   { opacity:1; filter:drop-shadow(0 0 14px rgba(184,135,74,0.5)); }
    19%,24%  { opacity:0.08; filter:none; }
    25%,32%  { opacity:1; filter:drop-shadow(0 0 8px rgba(184,135,74,0.4)); }
    33%      { opacity:0.08; filter:none; }
    34%,100% { opacity:0.18; filter:grayscale(1) brightness(0.5); }
  }
  @keyframes dryWater {
    0%,20%   { transform:scale(1) translateY(0); opacity:1; }
    60%      { transform:scale(0.6) translateY(18px); opacity:0.14; }
    61%,100% { transform:scale(0.6) translateY(18px); opacity:0; }
  }
  @keyframes breakSanit {
    0%,28%   { transform:rotate(0deg) scale(1); opacity:1; }
    35%,100% { transform:rotate(-22deg) scale(0.9); opacity:0.4; }
  }
  @keyframes shimmerLine {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }

  .priority-tooltip {
    background: rgba(21,23,61,0.94) !important;
    border: none !important;
    color: #EFE6D0 !important;
    font-family: 'Lato', sans-serif !important;
    font-size: 0.74rem !important;
    border-radius: 8px !important;
    font-weight: 300 !important;
    box-shadow: 0 8px 24px rgba(10,11,34,0.35) !important;
  }
  .priority-tooltip::before { display:none !important; }

  .anim-power  { animation: flashDark 4.5s ease infinite; }
  .anim-water  { animation: dryWater 4.5s ease infinite; }
  .anim-sanit  { animation: breakSanit 4.5s ease infinite; }

  /* ── Decorative shimmer line between sections ── */
  .infra-shimmer {
    position: relative;
    overflow: hidden;
  }
  .infra-shimmer::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 40%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(184,135,74,0.35), transparent);
    animation: shimmerLine 4s ease-in-out infinite;
  }

  /* ── Responsive grids (media queries tidak bisa via inline style) ── */
  .infra-grid-photo-chart {
    display: grid;
    grid-template-columns: 4.5fr 7.5fr;
    gap: 0;
    align-items: stretch;
    min-height: 720px;
    max-width: 1440px;
    margin: 0 auto;
  }
  .infra-scene2-row { display: flex; flex-wrap: wrap; }
  .infra-scene2-narasi { flex: 1 1 480px; max-width: 620px; min-width: 0; }
  .infra-scene2-map { flex: 1 1 420px; min-width: 0; }
  .infra-map-sticky {
    position: sticky; top: 6vh; height: calc(100vh - 6vh);
    display: flex; flex-direction: column; justify-content: center; gap: 0.75rem;
  }
  .infra-stat3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.65rem; }
  .infra-layanan-row { display: flex; justify-content: center; gap: 1.25rem; flex-wrap: wrap; }
  .infra-trans-row { display: flex; gap: 1.25rem; flex-wrap: wrap; justify-content: center; }
  .infra-bignum-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; }
  .infra-zona-row { display: flex; flex-wrap: wrap; gap: 2rem; }
  .infra-zona-map { flex: 1 1 460px; min-width: 0; }
  .infra-zona-list { flex: 1 1 360px; min-width: 0; display:flex; flex-direction:column; gap:0.6rem; }

  .infra-data-table {
    display: grid;
    grid-template-columns: 260px 1fr 1fr 1fr 1fr;
    gap: 1.5rem;
    align-items: center;
    padding-bottom: 2.5rem;
    border-bottom: 1px solid rgba(21,23,61,0.06);
  }
  .infra-data-table:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .infra-data-header {
    display: grid;
    grid-template-columns: 260px 1fr 1fr 1fr 1fr;
    gap: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(21,23,61,0.15);
    margin-bottom: 1rem;
  }
  .infra-data-metrics { display: contents; }
  .infra-mobile-metric-label { display: none; }

  @media (max-width: 900px) {
    .infra-data-table {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    .infra-data-header { display: none; }
    .infra-data-metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      width: 100%;
    }
    .infra-mobile-metric-label { display: block; }
    .infra-grid-photo-chart { grid-template-columns: 1fr; min-height: auto; }
    .infra-map-sticky { position: static; height: auto; min-height: 60vh; padding-bottom: 1rem; }
    .infra-bignum-grid { grid-template-columns: 1fr; gap: 2.5rem; }
    .infra-zona-map { position: static !important; height: 420px !important; }
  }
  @media (max-width: 780px) {
    .infra-prov-cards { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 560px) {
    .infra-stat3 { grid-template-columns: 1fr 1fr; }
    .infra-stat3 > div:last-child { grid-column: 1 / -1; }
  }
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
    </svg>
  ),
  School: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Hospital: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/>
    </svg>
  ),
  Store: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2H18L21 8H3L6 2z"/><path d="M3 8v13a1 1 0 001 1h16a1 1 0 001-1V8"/><path d="M9 21V13h6v8"/>
    </svg>
  ),
  Mosque: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V9.5a2 2 0 011.03-1.75L12 3l7.97 4.75A2 2 0 0121 9.5V21"/><path d="M9 21V15h6v6"/><path d="M12 3v5"/>
    </svg>
  ),
  MapPin: ({ size=16, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  ArrowDown: ({ size=14, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12l7 7 7-7"/>
    </svg>
  ),
  Zap: ({ size=28, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Droplet: ({ size=28, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
    </svg>
  ),
  AlertTriangle: ({ size=28, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Camera: ({ size=12, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  ChevronDown: ({ size=14, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Users: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Lock: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ),
  Road: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l3-16 6 2 6-2 3 16"/><path d="M12 7v14"/>
    </svg>
  ),
  Heart: ({ size=20, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  Target: ({ size=16, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
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
   SECTION DIVIDER — transisi wave/gradient halus antar navy ↔ cream
───────────────────────────────────────────────────────────────── */
function SectionDivider({ from, to, height = 240 }) {
  return (
    <div className="infra-grain" aria-hidden="true" style={{ 
      position: 'relative', 
      height, 
      width: '100%',
      background: `linear-gradient(to bottom, ${from} 0%, ${to} 100%)`,
    }} />
  );
}

/* ─────────────────────────────────────────────────────────────────
   RISK LEVELS (dipakai bersama Scene 2 & legenda peta)
───────────────────────────────────────────────────────────────── */
const RISK_LEVELS = [
  { label:'>70%',   desc:'Kritis', color:'var(--rust)' },
  { label:'40–70%', desc:'Berat',  color:'var(--gold)' },
  { label:'20–40%', desc:'Sedang', color:'var(--slate)' },
  { label:'<20%',   desc:'Ringan', color:'var(--sage)' },
];

/* ─────────────────────────────────────────────────────────────────
   TYPOGRAPHY OBJECTS
───────────────────────────────────────────────────────────────── */
const T = {
  eyebrow: { fontFamily: 'Lato, sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase' },
  display: { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', lineHeight: 1.16 },
  body:    { fontFamily: 'Lato, sans-serif', fontWeight: 300, lineHeight: 1.7 },
};

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  SCENE 1 — KELUMPUHAN KOTA  (NAVY)                           ║
   ║  Vertical split: documentary photo left, data right           ║
   ╚═══════════════════════════════════════════════════════════════╝ */
function SceneKelumpuhanKota() {
  const [ref, inView] = useInView(0.15);
  
  const [activeSlide, setActiveSlide] = useState(0);
  const autoRef = useRef(null);

  const SLIDES = [
    { id: '1', img: '/assets/pkl1.webp' },
    { id: '2', img: '/assets/pkl2_1.webp' },
    { id: '3', img: '/assets/pkl3_1.webp' },
  ];

  const startAuto = useCallback(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setActiveSlide((p) => (p + 1) % SLIDES.length), 5500);
  }, [SLIDES.length]);

  useEffect(() => { startAuto(); return () => clearInterval(autoRef.current); }, [startAuto]);

  const kondisiPerKat = insights?.fasilitas_infrastruktur?.kondisi_per_kategori || {};

  const chartDataByKat = ['Pendidikan', 'Kesehatan', 'Ekonomi'].map((key) => {
    const kat = kondisiPerKat[key] || {};
    const baik   = kat['Baik']?.n        || 0;
    const ringan = kat['Rusak Ringan']?.n || 0;
    const sedang = kat['Rusak Sedang']?.n || 0;
    const berat  = kat['Rusak Berat']?.n  || 0;
    const total  = baik + ringan + sedang + berat;
    return { name: key, baik, ringan, sedang, berat, total };
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

  const topFasilitasRaw = insights?.fasilitas_infrastruktur?.top_15_jenis || {};
  const topFasilitas = Object.entries(topFasilitasRaw).slice(0, 5).map(([nama, jumlah]) => ({
    nama: nama.replace(/^B\.\s*/, ''),
    jumlah
  }));
  const maxTopFasilitas = Math.max(...topFasilitas.map(f => f.jumlah), 1);



  /* Severity palette — darker = worse */
  const SEV = {
    berat:  { label: 'Rusak Berat',  color: '#A8503F' },
    sedang: { label: 'Rusak Sedang', color: '#C08A55' },
    ringan: { label: 'Rusak Ringan', color: '#B8874A' },
    baik:   { label: 'Baik',         color: 'rgba(239,230,208,0.15)' },
  };

  const maxSectorTotal = Math.max(...chartDataByKat.map(k => k.total), 1);

  return (
    <section className="infra-section infra-bg-navy-warm infra-grain" style={{ padding: 0, overflow: 'hidden' }}>

      <div ref={ref} className="infra-grid-photo-chart">

        {/* ═══════ LEFT: Framed Documentary Photo ═══════ */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(2rem,5vw,4rem) clamp(1.5rem,4vw,3rem)',
          height: '100%',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <div style={{
            position: 'relative',
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid rgba(239,230,208,0.12)',
            boxShadow: '0 16px 48px rgba(5,5,20,0.4)',
            background: '#080918',
            width: '100%',
            height: '100%',
          }}>
            {SLIDES.map((slide, idx) => {
              const isActive = idx === activeSlide;
              return (
                <div key={slide.id} style={{
                  position: 'absolute', inset: 0,
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 1s ease-in-out',
                  zIndex: isActive ? 1 : 0,
                }}>
                  <img
                    src={slide.img}
                    alt=""
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'contain', objectPosition: 'center',
                      display: 'block',
                      filter: 'grayscale(0.3) brightness(0.65) saturate(0.7)',
                    }}
                  />
                </div>
              );
            })}
            
            {/* Slide Indicators */}
            <div style={{
              position: 'absolute', top: '1rem', right: '1rem',
              display: 'flex', gap: '0.35rem', zIndex: 10,
            }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveSlide(i); startAuto(); }}
                  style={{
                    width: activeSlide === i ? 16 : 6, height: 6, borderRadius: 6,
                    background: activeSlide === i ? 'var(--cream-text)' : 'rgba(239,230,208,0.25)',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)'
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ═══════ RIGHT: Data & Visualization ═══════ */}
        <div style={{
          padding: 'clamp(3rem,5vw,5rem) clamp(2rem,4vw,4rem) clamp(3rem,5vw,5rem) clamp(1rem,2vw,2rem)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          position: 'relative',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s',
        }}>

          {/* Section header */}
          <div style={{ marginBottom: 'clamp(2rem,3.5vw,3rem)' }}>
            <h2 className="t-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', margin: 0, color: 'var(--cream-text)' }}>
              Kerusakan Infrastruktur Publik
            </h2>
          </div>

          {/* Key figures */}
          <div style={{ display: 'flex', gap: 'clamp(2rem,4vw,3.5rem)', marginBottom: 'clamp(2.5rem,4vw,3.5rem)', flexWrap: 'wrap' }}>
            <div>
              <div className="t-display" style={{ fontSize: 'clamp(2.4rem,4vw,3.4rem)', fontWeight: 700, color: 'var(--cream-text)', lineHeight: 1 }}>
                <AnimatedCounter value={totalFas} duration={2.5} />
              </div>
              <div className="t-eyebrow" style={{ color: 'var(--cream-text-faint)', fontSize: '0.62rem', marginTop: '0.55rem', letterSpacing: '0.16em' }}>
                Total Fasilitas Terdata
              </div>
            </div>
            <div style={{ width: 1, background: 'rgba(239,230,208,0.1)', alignSelf: 'stretch', flexShrink: 0 }} />
            <div>
              <div className="t-display" style={{ fontSize: 'clamp(2.4rem,4vw,3.4rem)', fontWeight: 700, color: 'var(--rust)', lineHeight: 1 }}>
                {pctBerat}<span style={{ fontSize: '0.55em' }}>%</span>
              </div>
              <div className="t-eyebrow" style={{ color: 'var(--cream-text-faint)', fontSize: '0.62rem', marginTop: '0.55rem', letterSpacing: '0.16em' }}>
                Rusak Berat
              </div>
            </div>
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: 'rgba(239,230,208,0.08)', marginBottom: 'clamp(1.5rem,2.5vw,2rem)' }} />

          {/* Chart header + legend */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(1.2rem,2vw,1.6rem)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div className="t-eyebrow" style={{ color: 'var(--cream-text-soft)', fontSize: '0.62rem' }}>Kondisi per Sektor</div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[SEV.berat, SEV.sedang, SEV.ringan, { label: 'Baik', color: 'rgba(239,230,208,0.3)' }].map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--cream-text-faint)', fontFamily: 'Lato, sans-serif', fontWeight: 300 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stacked horizontal bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.25rem,2vw,1.75rem)' }}>
            {chartDataByKat.map((kat, ki) => {
              const segments = [
                { key: 'berat',  val: kat.berat,  ...SEV.berat },
                { key: 'sedang', val: kat.sedang, ...SEV.sedang },
                { key: 'ringan', val: kat.ringan, ...SEV.ringan },
                { key: 'baik',   val: kat.baik,   ...SEV.baik },
              ];
              const barScale = kat.total > 0 ? (kat.total / maxSectorTotal) * 100 : 0;

              return (
                <div key={kat.name}>
                  {/* Label row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.45rem' }}>
                    <span className="t-body" style={{ fontSize: '0.88rem', color: 'var(--cream-text)', fontWeight: 400 }}>
                      {kat.name}
                    </span>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'Lato, sans-serif', color: 'var(--cream-text-faint)', fontWeight: 300 }}>
                      {kat.total.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Bar */}
                  <div style={{
                    width: inView ? `${Math.max(barScale, 12)}%` : '0%',
                    transition: `width 1.1s cubic-bezier(0.22, 0.61, 0.36, 1) ${ki * 0.15}s`,
                    display: 'flex', height: 24, borderRadius: 3, overflow: 'hidden',
                  }}>
                    {segments.map((seg, si) => {
                      if (seg.val === 0) return null;
                      const segPct = (seg.val / kat.total) * 100;
                      const showNum = segPct > 10;
                      return (
                        <div key={seg.key} title={`${seg.label}: ${seg.val.toLocaleString('id-ID')}`} style={{
                          width: `${segPct}%`,
                          background: seg.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: `width 0.8s ease ${ki * 0.15 + si * 0.05}s`,
                          minWidth: seg.val > 0 ? 2 : 0,
                        }}>
                          {showNum && (
                            <span style={{
                              fontSize: '0.58rem', fontFamily: 'Lato, sans-serif', fontWeight: 700,
                              color: seg.key === 'baik' ? 'var(--cream-text-faint)' : 'rgba(255,255,255,0.88)',
                              whiteSpace: 'nowrap',
                            }}>
                              {seg.val.toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Percentage breakdown */}
                  <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                    {segments.filter(s => s.val > 0).map((seg) => {
                      const pct = kat.total > 0 ? ((seg.val / kat.total) * 100).toFixed(1) : 0;
                      return (
                        <span key={seg.key} style={{
                          fontSize: '0.58rem', fontFamily: 'Lato, sans-serif', fontWeight: 300,
                          color: 'var(--cream-text-faint)',
                        }}>
                          <span style={{ color: seg.key === 'baik' ? 'var(--cream-text-faint)' : seg.color, fontWeight: 600 }}>{pct}%</span> {seg.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  SCENE 2 — KELUMPUHAN DESA  (CREAM)                          ║
   ║  Interactive Leaflet map + click-to-zoom province cards       ║
   ╚═══════════════════════════════════════════════════════════════╝ */

/* Province marker component for Scene 2 map */
function Scene2ProvinceMarker({ lat, lng, label, color, isActive, onClick }) {
  const map = useMap();
  useEffect(() => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
    const size = isActive ? 22 : 14;
    const icon = L.divIcon({
      className: '',
      html: `
        <div style="
          position:relative;width:${size}px;height:${size}px;
          border-radius:50%;
          background:${color};
          box-shadow:0 0 0 ${isActive ? '6' : '3'}px ${color}33, 0 2px 12px rgba(21,23,61,0.3);
          transition: all 0.4s ease;
          ${isActive ? 'animation:pulseNeon 2.2s ease-out infinite;' : ''}
        "></div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
    const marker = L.marker([lat, lng], { icon }).addTo(map);
    marker.on('click', onClick);
    if (label) marker.bindTooltip(label, {
      permanent: isActive,
      direction: 'top',
      className: 'priority-tooltip',
      offset: [0, -size / 2 - 4],
    });
    return () => { map.removeLayer(marker); };
  }, [map, lat, lng, label, color, isActive, onClick]);
  return null;
}

function SceneKelumpuhanDesa() {
  const [ref, inView] = useInView(0.12);
  const [activeProv, setActiveProv] = useState(null);
  const [cardsInView, setCardsInView] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const cardsRef = useRef(null);

  /* Default overview of the 3 provinces */
  const DEFAULT_CENTER = [2.0, 98.5];
  const DEFAULT_ZOOM = 6;

  const PROVINSI = [
    {
      key: 'Aceh', title: 'Aceh',
      tagline: 'Wilayah terisolir — akses jalan putus total.',
      color: '#B8874A',
      lat: 4.6951, lng: 96.7494, zoom: 9,
    },
    {
      key: 'Sumatera Utara', title: 'Sumatera Utara',
      tagline: 'Episenter bencana — korban jiwa terbanyak.',
      color: '#A8503F',
      lat: 2.1154, lng: 98.9451, zoom: 9,
    },
    {
      key: 'Sumatera Barat', title: 'Sumatera Barat',
      tagline: 'Jalur ekonomi Padang–Bukittinggi lumpuh.',
      color: '#45618C',
      lat: -0.7390, lng: 100.8000, zoom: 9,
    },
  ];

  const mapCenter = activeProv !== null
    ? [PROVINSI[activeProv].lat, PROVINSI[activeProv].lng]
    : DEFAULT_CENTER;
  const mapZoom = activeProv !== null
    ? PROVINSI[activeProv].zoom
    : DEFAULT_ZOOM;

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setCardsInView(true); },
      { threshold: 0.15 },
    );
    if (cardsRef.current) obs.observe(cardsRef.current);
    return () => obs.disconnect();
  }, []);

  const handleCardClick = useCallback((index) => {
    setActiveProv((prev) => prev === index ? null : index);
  }, []);

  return (
    <section id={SCENE2_ANCHOR_ID} className="infra-section infra-bg-cream-warm infra-grain" style={{ padding: 'clamp(5rem,8vw,7rem) 0' }}>

      {/* ── Header ── */}
      <div ref={ref} style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.25rem, 3vw, 2.5rem)' }}>
        <div style={{ 
          textAlign: 'center', marginBottom: 'clamp(2.5rem, 4vw, 3.5rem)',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <h2 className="t-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', margin: 0, color: 'var(--ink)' }}>
            Cakupan Wilayah Terdampak
          </h2>
        </div>
      </div>

      {/* ── Full-width Leaflet Map ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        marginBottom: 'clamp(2.5rem, 4vw, 3.5rem)',
        boxShadow: '0 20px 60px rgba(21,23,61,0.10)',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.98)',
        transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s',
      }}>
        {/* top + bottom soft vignette */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 500, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(251,245,232,0.5) 0%, transparent 8%, transparent 92%, rgba(251,245,232,0.5) 100%)',
        }} />

        <div style={{ width: '100%', height: 'clamp(420px, 50vw, 620px)' }}>
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            zoomControl={false}
            scrollWheelZoom={false}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              maxZoom={19}
            />
            <MapFlyToUpdater center={mapCenter} zoom={mapZoom} />

            {/* Province markers */}
            {PROVINSI.map((prov, i) => (
              <Scene2ProvinceMarker
                key={prov.key}
                lat={prov.lat}
                lng={prov.lng}
                label={prov.title}
                color={prov.color}
                isActive={activeProv === i}
                onClick={() => handleCardClick(i)}
              />
            ))}
          </MapContainer>
        </div>

        {/* Active province label overlay */}
        <div style={{
          position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 600, display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.5rem 1.2rem',
          background: 'rgba(21,23,61,0.88)', backdropFilter: 'blur(12px)',
          borderRadius: 28,
          transition: 'all 0.4s ease',
        }}>
          <Icons.MapPin size={14} color={activeProv !== null ? PROVINSI[activeProv].color : 'var(--cream-text-soft)'} />
          <span className="t-eyebrow" style={{
            color: activeProv !== null ? PROVINSI[activeProv].color : 'var(--cream-text-soft)',
            fontSize: '0.62rem', transition: 'color 0.3s ease',
          }}>
            {activeProv !== null ? PROVINSI[activeProv].title : 'Klik provinsi untuk zoom'}
          </span>
          {activeProv !== null && (
            <button
              onClick={() => setActiveProv(null)}
              style={{
                background: 'rgba(239,230,208,0.12)',
                border: 'none', borderRadius: 14,
                padding: '0.15rem 0.6rem',
                cursor: 'pointer',
                fontFamily: 'Lato, sans-serif',
                fontSize: '0.58rem',
                fontWeight: 700,
                color: 'var(--cream-text-soft)',
                transition: 'all 0.25s ease',
                letterSpacing: '0.05em',
              }}
            >
              Reset
            </button>
          )}
        </div>

        {/* Map legend */}
        <div style={{
          position: 'absolute', bottom: '1rem', left: '1rem',
          background: 'rgba(21,23,61,0.90)', backdropFilter: 'blur(8px)',
          padding: '0.5rem 0.9rem', borderRadius: 16, zIndex: 600,
          display: 'flex', flexDirection: 'column', gap: '0.3rem',
        }}>
          {PROVINSI.map((prov) => (
            <div key={prov.key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: prov.color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Lato, sans-serif', fontSize: '0.6rem', color: 'var(--cream-text-soft)', fontWeight: 300 }}>
                {prov.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Province Cards — three compact stat cards ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.25rem, 3vw, 2.5rem)' }}>
        <div ref={cardsRef} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
        }} className="infra-prov-cards">
          {PROVINSI.map((prov, i) => {
            const jumlahDesa = insights?.cakupan_geografis_infra?.desa_per_provinsi?.[prov.key] || 0;
            const fasPerProv = insights?.fasilitas_infrastruktur?.jumlah_per_provinsi_per_kategori?.[prov.key] || {};
            const totalFasProv = Object.values(fasPerProv).reduce((a, v) => a + v, 0);
            const korban = insights?.anggota_keluarga?.korban_kritis_per_provinsi?.[prov.key] || {};
            const isActive = activeProv === i;
            const isHovered = hoveredCard === i;
            const meninggal = korban.meninggal_bencana ?? '—';

            return (
              <div
                key={prov.key}
                onClick={() => handleCardClick(i)}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  padding: 'clamp(1.4rem, 2.5vw, 2rem)',
                  borderRadius: 16,
                  cursor: 'pointer',
                  background: isActive
                    ? 'rgba(255,255,255,0.92)'
                    : isHovered
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(255,255,255,0.35)',
                  boxShadow: isActive
                    ? `0 16px 40px rgba(21,23,61,0.09), inset 0 0 0 2px ${prov.color}44`
                    : '0 4px 16px rgba(21,23,61,0.03)',
                  transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                  transform: isActive ? 'translateY(-4px)' : isHovered ? 'translateY(-1px)' : 'translateY(0)',
                  opacity: cardsInView ? 1 : 0,
                  ...(cardsInView ? {} : { transform: 'translateY(20px)' }),
                  transitionDelay: `${i * 0.1}s`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Active indicator stripe */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: isActive ? prov.color : 'transparent',
                  transition: 'background 0.3s ease',
                  borderRadius: '16px 16px 0 0',
                }} />

                {/* Zoom hint badge */}
                <div style={{
                  position: 'absolute', top: '0.75rem', right: '0.75rem',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.15rem 0.5rem',
                  background: isActive ? `${prov.color}18` : 'rgba(21,23,61,0.04)',
                  borderRadius: 12,
                  transition: 'all 0.3s ease',
                }}>
                  <Icons.MapPin size={10} color={isActive ? prov.color : 'var(--ink-faint)'} />
                  <span style={{
                    fontFamily: 'Lato, sans-serif', fontSize: '0.55rem', fontWeight: 600,
                    color: isActive ? prov.color : 'var(--ink-faint)',
                    letterSpacing: '0.04em',
                  }}>
                    {isActive ? 'Viewing' : 'Zoom'}
                  </span>
                </div>

                {/* Region name + tagline */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 className="t-display" style={{
                    fontSize: 'clamp(1.15rem, 1.8vw, 1.4rem)',
                    color: 'var(--ink)',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                    lineHeight: 1.2,
                  }}>
                    {prov.title}
                  </h3>
                  <p className="t-body" style={{
                    fontSize: '0.78rem',
                    color: 'var(--ink-soft)',
                    margin: 0,
                    lineHeight: 1.5,
                  }}>
                    {prov.tagline}
                  </p>
                </div>

                {/* Key numbers — large display */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem 1rem',
                  marginBottom: Object.keys(fasPerProv).length > 0 ? '1.1rem' : 0,
                }}>
                  <div>
                    <div className="t-display" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.75rem)', color: prov.color, fontWeight: 700, lineHeight: 1 }}>
                      {jumlahDesa.toLocaleString('id-ID')}
                    </div>
                    <div className="t-eyebrow" style={{ color: 'var(--ink-faint)', fontSize: '0.52rem', marginTop: '0.28rem' }}>Desa</div>
                  </div>
                  <div>
                    <div className="t-display" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.75rem)', color: 'var(--ink)', fontWeight: 700, lineHeight: 1 }}>
                      {totalFasProv.toLocaleString('id-ID')}
                    </div>
                    <div className="t-eyebrow" style={{ color: 'var(--ink-faint)', fontSize: '0.52rem', marginTop: '0.28rem' }}>Fasilitas</div>
                  </div>
                  <div>
                    <div className="t-display" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.75rem)', color: 'var(--rust)', fontWeight: 700, lineHeight: 1 }}>
                      {meninggal}
                    </div>
                    <div className="t-eyebrow" style={{ color: 'var(--ink-faint)', fontSize: '0.52rem', marginTop: '0.28rem' }}>Korban Jiwa</div>
                  </div>
                  {(() => {
                    const kabPerProv = insights?.cakupan_geografis_infra?.kab_kota_per_provinsi?.[prov.key];
                    return kabPerProv ? (
                      <div>
                        <div className="t-display" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.75rem)', color: 'var(--ink)', fontWeight: 700, lineHeight: 1 }}>
                          {kabPerProv}
                        </div>
                        <div className="t-eyebrow" style={{ color: 'var(--ink-faint)', fontSize: '0.52rem', marginTop: '0.28rem' }}>Kab/Kota</div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Sector breakdown — horizontal bar chart */}
                {Object.keys(fasPerProv).length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ 
                      display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: '0.65rem',
                      opacity: cardsInView ? 1 : 0, 
                      transform: cardsInView ? 'scaleX(1)' : 'scaleX(0)', 
                      transformOrigin: 'left', 
                      transition: `all 1s cubic-bezier(0.2, 0.8, 0.2, 1) ${0.4 + i * 0.15}s` 
                    }}>
                      {Object.entries(fasPerProv).map(([kat, jml]) => {
                        const pct = (jml / totalFasProv) * 100;
                        const bgColor = kat === 'Pendidikan' ? 'var(--sage)' : kat === 'Kesehatan' ? 'var(--slate)' : kat === 'Ekonomi' ? 'var(--gold)' : 'var(--rust)';
                        return (
                          <div key={kat} style={{ width: `${pct}%`, height: '100%', background: bgColor }} title={`${kat}: ${jml}`} />
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {Object.entries(fasPerProv).map(([kat, jml]) => {
                        const bgColor = kat === 'Pendidikan' ? 'var(--sage)' : kat === 'Kesehatan' ? 'var(--slate)' : kat === 'Ekonomi' ? 'var(--gold)' : 'var(--rust)';
                        return (
                          <span key={kat} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', fontFamily: 'Lato, sans-serif', fontWeight: 300, color: 'var(--ink-soft)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: bgColor }} />
                            {kat} <strong style={{ fontWeight: 700, color: 'var(--ink)' }}>{jml}</strong>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  SCENE 3 — NARASI LAYANAN DASAR  (NAVY)                      ║
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

  const STATS_PCT = [
    { label: 'Listrik Padam', val: listrikPct, color: 'var(--gold)' },
    { label: 'Krisis Air Bersih', val: airPct, color: 'var(--slate)' },
    { label: 'Sanitasi Lumpuh', val: sanitasiPct, color: 'var(--sage)' },
  ];

  return (
    <section className="infra-section infra-bg-navy-cool infra-grain" style={{ padding:'clamp(6rem, 10vw, 9rem) 1.5rem' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }} ref={ref}>
        <div style={{ 
          marginBottom: '4.5rem',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <h2 className="t-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', margin: 0, color: 'var(--cream-text)' }}>
            Krisis Layanan Dasar
          </h2>
        </div>

        {/* 3 Percentages Data Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem', 
          marginBottom: '5.5rem' 
        }}>
          {STATS_PCT.map((stat, i) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(239,230,208,0.08)',
              borderRadius: 16,
              padding: 'clamp(2rem, 3vw, 2.5rem)',
              textAlign: 'left',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(24px)',
              transition: `all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 0.15}s`,
            }}>
              <div className="t-eyebrow" style={{ color: 'var(--cream-text-soft)', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
                {stat.label}
              </div>
              <div className="t-display" style={{ fontSize: 'clamp(4rem, 6vw, 5rem)', fontWeight: 700, color: stat.color, lineHeight: 1, marginBottom: '2rem' }}>
                {stat.val}<span style={{ fontSize: '0.5em', color: 'var(--cream-text-faint)' }}>%</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(239,230,208,0.08)' }}>
                {stat.label === 'Listrik Padam' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="t-body" style={{ fontSize: '0.8rem', color: 'var(--cream-text-soft)' }}>Menggunakan Genset</span>
                      <span className="t-body" style={{ fontSize: '0.85rem', color: 'var(--cream-text)', fontWeight: 700 }}>38.2%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="t-body" style={{ fontSize: '0.8rem', color: 'var(--cream-text-soft)' }}>Tanpa Akses Sama Sekali</span>
                      <span className="t-body" style={{ fontSize: '0.85rem', color: 'var(--cream-text)', fontWeight: 700 }}>18.4%</span>
                    </div>
                  </>
                )}
                {stat.label === 'Krisis Air Bersih' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="t-body" style={{ fontSize: '0.8rem', color: 'var(--cream-text-soft)' }}>Sumber Tak Terlindung</span>
                      <span className="t-body" style={{ fontSize: '0.85rem', color: 'var(--cream-text)', fontWeight: 700 }}>15.6%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="t-body" style={{ fontSize: '0.8rem', color: 'var(--cream-text-soft)' }}>Bergantung Bantuan Air</span>
                      <span className="t-body" style={{ fontSize: '0.85rem', color: 'var(--cream-text)', fontWeight: 700 }}>12.4%</span>
                    </div>
                  </>
                )}
                {stat.label === 'Sanitasi Lumpuh' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="t-body" style={{ fontSize: '0.8rem', color: 'var(--cream-text-soft)' }}>Fasilitas MCK Hancur</span>
                      <span className="t-body" style={{ fontSize: '0.85rem', color: 'var(--cream-text)', fontWeight: 700 }}>22.1%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="t-body" style={{ fontSize: '0.8rem', color: 'var(--cream-text-soft)' }}>MCK Darurat / Terbuka</span>
                      <span className="t-body" style={{ fontSize: '0.85rem', color: 'var(--cream-text)', fontWeight: 700 }}>30.2%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Absolute Numbers */}
        {(pengungsian > 0 || huntara > 0) && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 'clamp(3.5rem, 8vw, 8rem)', 
            flexWrap: 'wrap',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s ease 0.6s, transform 0.7s ease 0.6s',
          }}>
            {huntara > 0 && (
              <div>
                <div className="t-display" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 700, color: 'var(--rust)', lineHeight: 1, marginBottom: '1rem' }}>
                  <AnimatedCounter value={huntara} />
                </div>
                <div className="t-eyebrow" style={{ color: 'var(--cream-text-soft)', fontSize: '0.8rem' }}>KK di Huntara</div>
              </div>
            )}
            {pengungsian > 0 && (
              <div>
                <div className="t-display" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 700, color: 'var(--gold)', lineHeight: 1, marginBottom: '1rem' }}>
                  <AnimatedCounter value={pengungsian} />
                </div>
                <div className="t-eyebrow" style={{ color: 'var(--cream-text-soft)', fontSize: '0.8rem' }}>KK di Pengungsian</div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  SCENE 4 — ZONA PRIORITAS  (CREAM)                           ║
   ╚═══════════════════════════════════════════════════════════════╝ */
/* ╔═══════════════════════════════════════════════════════════════╗
   ║  SCENE 4 — ZONA PRIORITAS  (CREAM)                           ║
   ╚═══════════════════════════════════════════════════════════════╝ */
function CustomPulsingDot({ lat, lng, score, label }) {
  const map = useMap();
  useEffect(() => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
    const size = score > 90 ? 32 : score > 80 ? 24 : 16;
    const color = score > 90 ? '#A8503F' : score > 80 ? '#B8874A' : '#45618C';
    const icon = L.divIcon({
      className: '',
      html: `<div style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 0 0 4px ${color}33, 0 4px 12px rgba(21,23,61,0.2);animation:pulseNeon 2.5s ease-out infinite;"></div>`,
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
        provinsi: prov,
        persen: +(total / maxTotal * 100).toFixed(1),
        totalFasilitas: total,
        ...coords,
      };
    })
    .sort((a, b) => b.persen - a.persen);

  return (
    <section className="infra-section infra-bg-cream-cool infra-grain" style={{ padding:'clamp(6rem, 10vw, 9rem) 1.5rem' }}>
      <div ref={ref} style={{ maxWidth: 1240, margin: '0 auto' }}>

        <div style={{ 
          textAlign: 'center', marginBottom: '4.5rem',
          opacity: started ? 1 : 0,
          transform: started ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <h2 className="t-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', margin: 0, color: 'var(--ink)' }}>
            Indeks Prioritas Wilayah
          </h2>
        </div>

        <div className="infra-zona-row" style={{ alignItems: 'center', gap: '4rem' }}>
          
          {/* Map Section */}
          <div className="infra-zona-map" style={{ 
            height: 'clamp(450px, 50vw, 650px)', 
            borderRadius: 24, 
            overflow: 'hidden', 
            boxShadow: '0 32px 64px rgba(21,23,61,0.08)',
            opacity: started ? 1 : 0,
            transform: started ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.98)',
            transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s',
          }}>
            <MapContainer 
              center={[1.5, 98.5]} 
              zoom={6} 
              zoomControl={false} 
              scrollWheelZoom={false} 
              attributionControl={false} 
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
              {peringkat.map((item, i) => (
                <CustomPulsingDot key={i} lat={item.lat} lng={item.lng} score={item.persen} label={item.provinsi} />
              ))}
            </MapContainer>
          </div>

          {/* Ranking Section */}
          <div className="infra-zona-list" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {peringkat.map((item, i) => {
              const isTop = i === 0;
              const color = isTop ? 'var(--rust)' : i === 1 ? 'var(--gold)' : 'var(--slate)';
              return (
                <div key={item.provinsi} style={{
                  opacity: started ? 1 : 0,
                  transform: started ? 'translateX(0)' : 'translateX(24px)',
                  transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="t-eyebrow" style={{ color: 'var(--ink-faint)', fontSize: '0.85rem', width: '24px' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="t-display" style={{ fontSize: '1.5rem', color: 'var(--ink)', fontWeight: 700, lineHeight: 1.2 }}>
                          {item.provinsi}
                        </div>
                        <div className="t-body" style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: '0.2rem' }}>
                          <strong style={{ fontWeight: 700 }}>{item.totalFasilitas.toLocaleString('id-ID')}</strong> Fasilitas
                        </div>
                      </div>
                    </div>
                    <span className="t-display" style={{ fontSize: '2rem', color: color, fontWeight: 700, lineHeight: 1 }}>
                      {item.persen.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: 'rgba(21,23,61,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: started ? `${item.persen}%` : '0%',
                      background: color,
                      borderRadius: 2,
                      transition: `width 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${0.3 + i * 0.15}s`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  SCENE 5 — SOROTAN ANGKA  (NAVY)                             ║
   ╚═══════════════════════════════════════════════════════════════╝ */
function SceneSorotanAngka() {
  const [ref, inView] = useInView(0.25);

  const stats = insights?.fasilitas_infrastruktur?.statistik_per_desa || {};
  const sosMax = stats.sosial?.max || 0;
  const sosDesa = stats.sosial?.desa_max_fasilitas || '';
  const pendMax = stats.pendidikan?.max || 0;
  const pendDesa = stats.pendidikan?.desa_max_fasilitas || '';
  const kesMax = stats.kesehatan?.max || 0;
  const kesDesa = stats.kesehatan?.desa_max_fasilitas || '';

  return (
    <section ref={ref} className="infra-section infra-bg-navy-glow infra-grain" style={{ padding:'clamp(6rem, 10vw, 9rem) 1.5rem' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        
        <div style={{ 
          textAlign: 'center', marginBottom: '5rem',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <h2 className="t-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', margin: 0, color: 'var(--cream-text)' }}>
            Titik Kerusakan Terparah
          </h2>
          <p className="t-body" style={{ color: 'var(--cream-text-soft)', marginTop: '1rem', maxWidth: 600, margin: '1rem auto 0' }}>
            Data di tingkat desa menunjukkan anomali kerusakan yang sangat terpusat pada beberapa wilayah tertentu.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem', 
        }}>
          
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,230,208,0.08)', borderRadius: 16, padding: '2.5rem',
            opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s ease 0.1s'
          }}>
            <div className="t-eyebrow" style={{ color: 'var(--rust)', fontSize: '0.8rem', marginBottom: '1rem' }}>Fasilitas Sosial Terbanyak</div>
            <div className="t-display" style={{ fontSize: '4.5rem', fontWeight: 700, color: 'var(--cream-text)', lineHeight: 1, marginBottom: '0.5rem' }}>
              {sosMax} <span style={{ fontSize: '1rem', fontFamily: 'Lato', color: 'var(--cream-text-soft)', fontWeight: 400 }}>Unit</span>
            </div>
            <div className="t-body" style={{ color: 'var(--cream-text-faint)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Hancur di <strong>Desa {sosDesa}</strong>. Mayoritas adalah tempat ibadah dan balai warga.
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,230,208,0.08)', borderRadius: 16, padding: '2.5rem',
            opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s ease 0.2s'
          }}>
            <div className="t-eyebrow" style={{ color: 'var(--sage)', fontSize: '0.8rem', marginBottom: '1rem' }}>Fasilitas Pendidikan</div>
            <div className="t-display" style={{ fontSize: '4.5rem', fontWeight: 700, color: 'var(--cream-text)', lineHeight: 1, marginBottom: '0.5rem' }}>
              {pendMax} <span style={{ fontSize: '1rem', fontFamily: 'Lato', color: 'var(--cream-text-soft)', fontWeight: 400 }}>Unit</span>
            </div>
            <div className="t-body" style={{ color: 'var(--cream-text-faint)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Hancur di <strong>Desa {pendDesa}</strong>, melumpuhkan total aktivitas belajar mengajar.
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,230,208,0.08)', borderRadius: 16, padding: '2.5rem',
            opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s ease 0.3s'
          }}>
            <div className="t-eyebrow" style={{ color: 'var(--slate)', fontSize: '0.8rem', marginBottom: '1rem' }}>Fasilitas Kesehatan</div>
            <div className="t-display" style={{ fontSize: '4.5rem', fontWeight: 700, color: 'var(--cream-text)', lineHeight: 1, marginBottom: '0.5rem' }}>
              {kesMax} <span style={{ fontSize: '1rem', fontFamily: 'Lato', color: 'var(--cream-text-soft)', fontWeight: 400 }}>Unit</span>
            </div>
            <div className="t-body" style={{ color: 'var(--cream-text-faint)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Terdampak di <strong>Desa {kesDesa}</strong>, termasuk puskesmas pembantu dan posyandu.
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  TRANSISI BABAK 2 → 3  (CREAM)                               ║
   ╚═══════════════════════════════════════════════════════════════╝ */
function TransisiBabak23() {
  const [ref, visible] = useInView(0.12);

  const fasPerProv = insights?.fasilitas_infrastruktur?.jumlah_per_provinsi_per_kategori || {};
  const acehFas = Object.values(fasPerProv['Aceh'] || {}).reduce((a,b)=>a+b,0);
  const sumutFas = Object.values(fasPerProv['Sumatera Utara'] || {}).reduce((a,b)=>a+b,0);
  const sumbarFas = Object.values(fasPerProv['Sumatera Barat'] || {}).reduce((a,b)=>a+b,0);
  const maxFas = Math.max(acehFas, sumutFas, sumbarFas);

  const PROV_DATA = [
    {
      key: 'Sumatera Utara', title: 'Sumatera Utara', color: 'var(--rust)',
      metrics: [
        { label: 'Korban Jiwa', val: 54, max: 54, emph: true },
        { label: 'Fasilitas Publik', val: sumutFas, max: maxFas, emph: false },
        { label: 'Desa Terdampak', val: 292, max: 556, emph: false },
        { label: 'Kab / Kota', val: 19, max: 19, emph: false },
      ]
    },
    {
      key: 'Aceh', title: 'Aceh', color: 'var(--gold)',
      metrics: [
        { label: 'Korban Jiwa', val: 44, max: 54, emph: false },
        { label: 'Fasilitas Publik', val: acehFas, max: maxFas, emph: true },
        { label: 'Desa Terdampak', val: 556, max: 556, emph: true },
        { label: 'Kab / Kota', val: 18, max: 19, emph: false },
      ]
    },
    {
      key: 'Sumatera Barat', title: 'Sumatera Barat', color: 'var(--slate)',
      metrics: [
        { label: 'Korban Jiwa', val: 4, max: 54, emph: false },
        { label: 'Fasilitas Publik', val: sumbarFas, max: maxFas, emph: false },
        { label: 'Desa Terdampak', val: 80, max: 556, emph: false },
        { label: 'Kab / Kota', val: 11, max: 19, emph: true },
      ]
    }
  ];

  return (
    <section className="infra-section infra-bg-cream-golden infra-grain" style={{
      padding: 'clamp(5rem,9vw,8rem) 1.5rem',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{ position:'absolute', top:'0', left:'50%', transform:'translateX(-50%)', width:'80vw', height:'50vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(184,135,74,0.05) 0%, transparent 60%)', pointerEvents:'none', filter:'blur(80px)', zIndex:0 }} />
      <div ref={ref} style={{ maxWidth: 1240, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>

        <div style={{ 
          textAlign:'center', marginBottom:'4.5rem',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <h2 className="t-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', margin: '0 auto', maxWidth: 720, color: 'var(--ink)' }}>
            Perbandingan Lintas Provinsi
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Header Row (Desktop Only) */}
          <div className="infra-data-header">
            <div />
            <div className="t-eyebrow" style={{ color: 'var(--ink-faint)', fontSize: '0.65rem' }}>Korban Jiwa</div>
            <div className="t-eyebrow" style={{ color: 'var(--ink-faint)', fontSize: '0.65rem' }}>Fasilitas Publik</div>
            <div className="t-eyebrow" style={{ color: 'var(--ink-faint)', fontSize: '0.65rem' }}>Desa Terdampak</div>
            <div className="t-eyebrow" style={{ color: 'var(--ink-faint)', fontSize: '0.65rem' }}>Kab/Kota Terdampak</div>
          </div>

          {/* Data Rows */}
          {PROV_DATA.map((prov, idx) => (
            <div key={prov.key} className="infra-data-table" style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.6s ease ${idx * 0.15}s`
            }}>
              {/* Narrative Column */}
              <div>
                <h3 className="t-display" style={{ fontSize: '1.6rem', color: 'var(--ink)', fontWeight: 700, margin: 0 }}>{prov.title}</h3>
              </div>

              {/* Metrics Columns */}
              <div className="infra-data-metrics">
                {prov.metrics.map((m, mIdx) => (
                  <div key={m.label} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="infra-mobile-metric-label t-eyebrow" style={{ color: 'var(--ink-faint)', marginBottom: '0.4rem', fontSize: '0.6rem' }}>{m.label}</div>
                    <div className="t-display" style={{ 
                      fontSize: m.emph ? '2.4rem' : '1.4rem', 
                      color: m.emph ? prov.color : 'var(--ink-soft)', 
                      fontWeight: 700, 
                      lineHeight: 1,
                      marginBottom: '0.6rem',
                      transition: 'color 0.4s ease'
                    }}>
                      <AnimatedCounter value={m.val} duration={2 + mIdx * 0.2} />
                    </div>
                    <div style={{ width: '100%', maxWidth: '140px', height: m.emph ? 6 : 2, background: 'rgba(21,23,61,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ 
                        width: visible ? `${(m.val / m.max) * 100}%` : '0%', 
                        height: '100%', 
                        background: m.emph ? prov.color : 'rgba(21,23,61,0.15)',
                        borderRadius: 3,
                        transition: `width 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${0.4 + idx * 0.1}s`
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Elegant Transition to Chapter 3 */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '7rem',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.8s ease 0.6s'
        }}>
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
      <SectionDivider from="#151740" to="#FBF5E8" variant="wave" />
      <SceneKelumpuhanDesa />
      <SectionDivider from="#F7F1E3" to="#10123A" variant="soft" />
      <SceneLayananDasar />
      <SectionDivider from="#141648" to="#F5EFE0" variant="steep" />
      <SceneZonaPrioritas />
      <SectionDivider from="#F7F1E3" to="#14163E" variant="wave" />
      <SceneSorotanAngka />
      <SectionDivider from="#0F1132" to="#F9F3E5" variant="soft" />
      <TransisiBabak23 />
    </>
  );
}