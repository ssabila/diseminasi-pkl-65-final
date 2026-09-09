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
import './intro.css';

import Particles from './Particles';
import ScrollReveal from './ScrollReveal';
import TextType from './TextType';
import imgPendataan from './assets/pendataan.jpeg';
import imgHuntara03 from '../../../assets/images/huntara-03.jpg';
import imgHuntara14 from '../../../assets/images/huntara-14.jpg';
import imgHuntara16 from '../../../assets/images/huntara-16.jpg';
import patternImg from '../../../assets/Grand Design/Pattern.png';
import maskotImg from '../../../assets/Grand Design/Gundatala_1.png';
import sumateraGeo from '../../../assets/maps/sumatera_provinsi.json';

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
   Scene 2 — Data kartu "Skala Besar, Dampak Nyata" (angka NYATA dari insight.json)
───────────────────────────────────────────*/
const _ds = insights?.ringkasan_dataset || {};
// Rumah terdampak = seluruh kondisi_bangunan KECUALI kategori "tidak terdampak"
const _kb = insights?.rumah_tangga?.kondisi_bangunan || {};
const _kbTotal = Object.values(_kb).reduce((s, v) => s + (v?.n || 0), 0);
const _kbTidak = Object.entries(_kb).find(([k]) => /tidak terdampak/i.test(k))?.[1]?.n || 0;
const RUMAH_TERDAMPAK = (_kbTotal ? _kbTotal - _kbTidak : 0) || 35849;

// 4 kartu sesuai mockup referensi (tinggi 'h' menurun untuk irama bar)
const STAT_CARDS = [
  { 
    key: 'wilayah', label: 'Wilayah Terdampak', value: _ds.total_desa_infra || 928, unit: 'desa', h: 100, 
    color: '#EF8722', // Orange
    microcopy: 'Tersebar di 3 Provinsi',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  },
  { 
    key: 'warga', label: 'Warga Terdampak', value: _ds.total_art_keluarga || 188902, unit: 'jiwa', h: 92, 
    color: '#E74C3C', // Red
    microcopy: 'Kehilangan akses ke kehidupan normal',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  },
  { 
    key: 'rumah', label: 'Rumah Terdampak', value: RUMAH_TERDAMPAK, unit: 'bangunan', h: 84, 
    color: '#4FC3F7', // Blue
    microcopy: 'Berbagai tingkat kerusakan, tak lagi layak huni',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  },
  { 
    key: 'fasilitas', label: 'Fasilitas Umum', value: _ds.total_fasilitas_gabungan || 2739, unit: 'unit', h: 76, 
    color: '#628141', // Green
    microcopy: 'Pendidikan, kesehatan, hingga rumah ibadah',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16"/><path d="M4 18h16"/><path d="M14 2h-4a2 2 0 0 0-2 2v14h8V4a2 2 0 0 0-2-2Z"/><path d="M8 2h8"/><path d="M9 18V6"/><path d="M15 18V6"/><path d="M12 18V6"/></svg>
  },
];

// Cakupan pendataan (materi storyline: total keluarga disurvei + kab/kota ditelusuri)
const CAKUPAN = {
  kab: Object.values(insights?.cakupan_geografis_infra?.kab_kota_per_provinsi || {}).reduce((s, v) => s + v, 0) || 48,
  keluarga: _ds.total_rt_keluarga || 115462,
};

// Sektor infrastruktur yang didata
const SEKTOR_DATA = [
  { key: 'pendidikan', label: 'Pendidikan', value: _ds.total_fasilitas?.pendidikan || 824, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg> },
  { key: 'kesehatan', label: 'Kesehatan', value: _ds.total_fasilitas?.kesehatan || 342, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> },
  { key: 'ekonomi', label: 'Ekonomi', value: _ds.total_fasilitas?.ekonomi || 591, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { key: 'sosial', label: 'Sosial', value: _ds.total_fasilitas?.sosial || 982, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
];

/* ─────────────────────────────────────────
   Peta Choropleth Kerusakan (Mapbox) — geometri dari GeoJSON BPS
   (sumatera_provinsi.json). Tingkat kerusakan diturunkan dari jumlah desa
   terdampak per provinsi. Dasar peta = satelit muted + titik kab/kota neon
   yang menyala bertahap (mandat guideline: SATELLITE + grayscale + glow).
───────────────────────────────────────────*/
const _desaPerProv = insights?.cakupan_geografis_infra?.desa_per_provinsi || {};
const CHORO_TARGETS = {
  'ACEH': { label: 'Aceh', desa: _desaPerProv['Aceh'] || 556, color: '#EF8722', tingkat: 'Rusak Parah' },
  'SUMATERA UTARA': { label: 'Sumatera Utara', desa: _desaPerProv['Sumatera Utara'] || 292, color: '#E5D9B6', tingkat: 'Rusak Sedang' },
  'SUMATERA BARAT': { label: 'Sumatera Barat', desa: _desaPerProv['Sumatera Barat'] || 80, color: '#628141', tingkat: 'Rusak Ringan' },
};
const CHORO_ORDER = ['ACEH', 'SUMATERA UTARA', 'SUMATERA BARAT'];

// Titik data neon (Safety Orange) — guideline hal. 9
const KAB_GLOW = '#E67E22';

// FeatureCollection provinsi Sumatera untuk layer fill tint Mapbox.
// Tiap provinsi → MultiPolygon (tiap ring jadi polygon terpisah; data sudah didecimasi tanpa hole).
const SUMATERA_FC = {
  type: 'FeatureCollection',
  features: sumateraGeo.provinces.map((p) => ({
    type: 'Feature',
    properties: {
      name: p.name,
      target: CHORO_TARGETS[p.name] ? 1 : 0,
      color: CHORO_TARGETS[p.name]?.color || '#3a3f63',
    },
    geometry: { type: 'MultiPolygon', coordinates: p.rings.map((r) => [r]) },
  })),
};

// Titik kab/kota, diurutkan Aceh → Sumut → Sumbar agar bisa "menyala satu per satu".
const _GROUP_TO_PROV = { ACEH: 'ACEH', SUMUT: 'SUMATERA UTARA', SUMBAR: 'SUMATERA BARAT' };
const KAB_FEATURES = (() => {
  const feats = [];
  let idx = 0;
  for (const group of ['ACEH', 'SUMUT', 'SUMBAR']) {
    const t = CHORO_TARGETS[_GROUP_TO_PROV[group]];
    for (const k of KAB_POINTS[group]) {
      feats.push({
        type: 'Feature',
        properties: { idx, name: k.name, prov: t.label, tingkat: t.tingkat, desa: t.desa, color: t.color },
        geometry: { type: 'Point', coordinates: [k.lng, k.lat] },
      });
      idx += 1;
    }
  }
  return feats;
})();
const KAB_FC = { type: 'FeatureCollection', features: KAB_FEATURES };
const KAB_TOTAL = KAB_FEATURES.length;

// Bounds 3 provinsi target untuk fitBounds kamera (statis — user tidak memilih "kamera terbang").
const CHORO_BOUNDS = (() => {
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const p of sumateraGeo.provinces) {
    if (!CHORO_TARGETS[p.name]) continue;
    for (const ring of p.rings) for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return [[minLon, minLat], [maxLon, maxLat]];
})();

// Label provinsi yang muncul OTOMATIS saat scroll (bukan klik). `appear` = ambang
// progress [mulai, selesai] kemunculan label, selaras dengan urutan titik menyala.
const CHORO_LABELS = [
  { key: 'ACEH', lngLat: [96.95, 4.30], appear: [0.10, 0.30] },
  { key: 'SUMATERA UTARA', lngLat: [99.30, 2.10], appear: [0.40, 0.60] },
  { key: 'SUMATERA BARAT', lngLat: [100.60, -0.70], appear: [0.64, 0.84] },
];

/* ─────────────────────────────────────────
   SCENE 2 — "Skala Besar, Dampak Nyata"
   Bridge narasi (ScrollReveal) → stage pinned: 4 kartu terisi beige
   mengikuti scroll (scrub) → Sektor Infrastruktur (SVG stroke-draw).
   Semua motion transform/opacity-only; pin hanya di desktop.
───────────────────────────────────────────*/
const fmtID = (n) => Math.round(n).toLocaleString('id-ID');

const HEADLINE_WORDS = [
  { text: 'Skala', color: '#E5D9B6' },
  { text: 'Besar', color: '#E5D9B6' },
  { text: 'Dampak', color: '#EF8722' },
  { text: 'Nyata', color: '#EF8722' },
];

const SEKTOR_R_STROKE = 30; // radius lingkaran stroke SVG sektor

/* ─────────────────────────────────────────
   Cula.tech Style Data Engine Panel
───────────────────────────────────────────*/
function CulaDataPanel() {
  const _ds = insights?.ringkasan_dataset || {};
  const totalKK = _ds.total_rt_keluarga || 115462;
  const totalDesa = _ds.total_desa_infra || 928;
  const totalART = _ds.total_art_keluarga || 188902;

  return (
    <div style={{
      width: '100%', maxWidth: '360px', background: 'rgba(15, 20, 25, 0.65)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)', color: '#fff',
      pointerEvents: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#E5D9B6', fontFamily: 'sans-serif' }}>
          R3P Data Engine
        </div>
        <div style={{ background: 'rgba(98,129,65,0.2)', color: '#8aaf5a', padding: '3px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px' }}>
          LIVE
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span className="lato-regular" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Cakupan Wilayah</span>
        </div>
        <div className="lato-bold" style={{ fontSize: '0.85rem', color: '#fff' }}>{totalDesa} Desa</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <span className="lato-regular" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Keluarga Disurvei</span>
        </div>
        <div className="lato-bold" style={{ fontSize: '0.85rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {totalKK.toLocaleString('id-ID')}
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
      </div>

      <div style={{ borderLeft: '2px dashed rgba(255,255,255,0.2)', marginLeft: '1.2rem', paddingLeft: '1.2rem', paddingBottom: '0.2rem', paddingTop: '0.2rem' }}>
        <div className="lato-light" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>Total Jiwa Terdampak</div>
        <div className="lato-bold" style={{ fontSize: '1rem', color: '#E5D9B6' }}>+ {totalART.toLocaleString('id-ID')} Jiwa</div>
      </div>

      <div className="lato-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>
        DATA POINTS COLLECTED
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
          <span className="lato-regular" style={{ color: 'rgba(255,255,255,0.7)' }}>✓ Sosial/Ibadah</span>
          <span className="lato-bold" style={{ background: 'rgba(239, 135, 34, 0.15)', color: '#EF8722', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>1.106 Unit</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
          <span className="lato-regular" style={{ color: 'rgba(255,255,255,0.7)' }}>✓ Pendidikan</span>
          <span className="lato-bold" style={{ background: 'rgba(98, 129, 65, 0.15)', color: '#628141', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>785 Unit</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span className="lato-regular" style={{ color: 'rgba(255,255,255,0.7)' }}>✓ Kesehatan</span>
          <span className="lato-bold" style={{ background: 'rgba(79, 195, 247, 0.15)', color: '#4FC3F7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>607 Unit</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ChoroplethMapbox — peta Mapbox satelit (muted) FULL-SCREEN untuk Scene 2.
   • Provinsi target di-tint warna tingkat kerusakan (fill-opacity 0→penuh saat scroll).
   • Titik kab/kota neon (halo + core) menyala satu per satu mengikuti progress.
   • Label tiap provinsi (nama + tingkat + jumlah desa) muncul OTOMATIS saat scroll
     (tanpa klik), mengikuti urutan titik menyala.
   Di-drive imperatif lewat `apiRef.current.reveal(progress)` agar mulus saat scrub
   (tanpa re-render React). Map di-init lazy saat section mendekati viewport.
───────────────────────────────────────────*/
function ChoroplethMapbox({ apiRef }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const labelsRef = useRef(null);
  const stateRef = useRef({ ready: false, lastP: 0, litCount: -1 });

  useEffect(() => {
    const el = mapContainer.current;
    if (!el) return undefined;

    let map = null;
    let ro = null;
    const st = stateRef.current;

    // Terapkan progress reveal ke layer (dipanggil GSAP tiap frame scrub)
    const applyReveal = (progress) => {
      const p = Math.max(0, Math.min(1, progress));
      st.lastP = p;
      const m = mapRef.current;
      if (!m || !st.ready) return;

      // Titik menyala bertahap: idx 0..litCount-1
      const litCount = Math.round(p * KAB_TOTAL);
      if (litCount !== st.litCount) {
        st.litCount = litCount;
        const onCore = ['case', ['<', ['get', 'idx'], litCount], 1, 0];
        const onGlow = ['case', ['<', ['get', 'idx'], litCount], 0.6, 0];
        m.setPaintProperty('kab-glow', 'circle-opacity', onGlow);
        m.setPaintProperty('kab-core', 'circle-opacity', onCore);
        m.setPaintProperty('kab-core', 'circle-stroke-opacity', onCore);
      }

      // Tint provinsi "tumbuh" bertahap: Aceh dulu → Sumut → Sumbar
      const seg = (lo, hi) => Math.max(0, Math.min(1, (p - lo) / (hi - lo)));
      const FILL = 0.72;
      m.setPaintProperty('prov-fill', 'fill-opacity', [
        'match', ['get', 'name'],
        'ACEH', FILL * seg(0.04, 0.4),
        'SUMATERA UTARA', FILL * seg(0.34, 0.7),
        'SUMATERA BARAT', FILL * seg(0.6, 0.94),
        0,
      ]);

      // Label provinsi muncul otomatis (fade) mengikuti progress — bukan klik
      const labels = labelsRef.current;
      if (labels) {
        for (const lb of labels) {
          lb.el.style.opacity = String(seg(lb.appear[0], lb.appear[1]));
        }
      }
    };

    const initMap = () => {
      if (mapRef.current) return;
      try {
        map = new mapboxgl.Map({
          container: el,
          style: 'mapbox://styles/mapbox/satellite-v9',
          projection: 'mercator',
          bounds: CHORO_BOUNDS,
          fitBoundsOptions: { padding: { top: 64, bottom: 64, left: 48, right: 480 } },
          // Statis: matikan semua interaksi kamera agar tidak membajak scroll halaman.
          scrollZoom: false, dragPan: false, dragRotate: false, boxZoom: false,
          doubleClickZoom: false, touchZoomRotate: false, touchPitch: false, keyboard: false,
          attributionControl: false,
        });
      } catch (err) {
        console.warn('[ChoroplethMapbox] init gagal:', err?.message || err);
        return;
      }
      mapRef.current = map;

      // API imperatif diekspos lebih awal supaya progress sebelum 'load' tak hilang.
      apiRef.current = {
        reveal: applyReveal,
        resize: () => mapRef.current && mapRef.current.resize(),
      };

      map.on('load', () => {
        map.addSource('sumatera', { type: 'geojson', data: SUMATERA_FC });
        map.addSource('kab', { type: 'geojson', data: KAB_FC });

        // Tint provinsi target (di atas satelit)
        map.addLayer({
          id: 'prov-fill', type: 'fill', source: 'sumatera',
          filter: ['==', ['get', 'target'], 1],
          paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0 },
        });
        // Garis batas provinsi (target tebal, konteks tipis)
        map.addLayer({
          id: 'prov-line', type: 'line', source: 'sumatera',
          paint: {
            'line-color': 'rgba(229,217,182,0.55)',
            'line-width': ['case', ['==', ['get', 'target'], 1], 1.4, 0.5],
          },
        });
        // Halo glow titik (lebih tebal agar jelas)
        map.addLayer({
          id: 'kab-glow', type: 'circle', source: 'kab',
          paint: { 'circle-radius': 19, 'circle-color': KAB_GLOW, 'circle-blur': 0.85, 'circle-opacity': 0 },
        });
        // Core titik
        map.addLayer({
          id: 'kab-core', type: 'circle', source: 'kab',
          paint: {
            'circle-radius': 5.5, 'circle-color': '#FFEAC6',
            'circle-stroke-color': KAB_GLOW, 'circle-stroke-width': 2,
            'circle-opacity': 0, 'circle-stroke-opacity': 0,
          },
        });

        // Label provinsi (nama + tingkat + jumlah desa) muncul OTOMATIS saat scroll.
        // Pakai Marker HTML (pointer-events: none) supaya tracking ke koordinat & tak menghalangi.
        labelsRef.current = CHORO_LABELS.map((cfg) => {
          const t = CHORO_TARGETS[cfg.key];
          const el = document.createElement('div');
          el.className = 's2c-prov-label';
          el.style.opacity = '0';
          el.innerHTML = `
            <div style="position: relative; display: flex; align-items: center; pointer-events: none;">
              <div style="width: 14px; height: 14px; background-color: ${t.color}; border-radius: 50%; box-shadow: 0 0 15px ${t.color}, inset 0 0 4px rgba(255,255,255,0.8); z-index: 2; border: 2px solid rgba(255,255,255,0.9);"></div>
              <div style="width: 40px; height: 2px; background-color: rgba(255,255,255,0.7); z-index: 1; margin-left: -2px;"></div>
              <div style="background: rgba(15, 20, 25, 0.85); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 6px 14px; border-radius: 6px; font-family: 'Lato', sans-serif; font-size: 11px; box-shadow: 0 4px 15px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 4px; white-space: nowrap;">
                <div style="font-weight: 800; color: ${t.color}; display: flex; align-items: center; gap: 6px;"><span style="font-size: 14px;">✓</span> ${t.label.toUpperCase()}</div>
                <div style="font-weight: 300; font-size: 10px; color: rgba(255,255,255,0.7);">${t.tingkat} • ${Number(t.desa).toLocaleString('id-ID')} Desa</div>
              </div>
            </div>
          `;
          const marker = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat(cfg.lngLat).addTo(map);
          return { marker, el, appear: cfg.appear };
        });

        st.ready = true;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        applyReveal(reduce ? 1 : st.lastP);
      });

      map.on('error', (e) => console.warn('[ChoroplethMapbox]', e.error?.message || e));

      ro = new ResizeObserver(() => { if (mapRef.current) mapRef.current.resize(); });
      ro.observe(el);
    };

    // Lazy-init: baru buat peta saat section mendekati viewport (hemat WebGL context kedua).
    const io = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) {
        io.disconnect();
        initMap();
      }
    }, { rootMargin: '500px 0px' });
    io.observe(el);

    return () => {
      io.disconnect();
      if (ro) ro.disconnect();
      if (labelsRef.current) { labelsRef.current.forEach((l) => l.marker?.remove()); labelsRef.current = null; }
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      apiRef.current = null;
      st.ready = false;
    };
  }, [apiRef]);

  return (
    <div className="s2c-map-shell">
      <div ref={mapContainer} className="s2c-map" />
      <div className="s2c-map-grade" />
      <div className="s2c-map-grad-edge" />
    </div>
  );
}

const HUNTARA_IMAGES = [
  { src: imgHuntara03, caption: "Sisa-sisa bangunan yang tersapu oleh derasnya aliran sungai." },
  { src: imgHuntara14, caption: "Fasilitas umum dan bangunan warga hancur tak bersisa." },
  { src: imgHuntara16, caption: "Puing-puing berserakan menjadi saksi bisu kekuatan bencana." }
];

function HuntaraGallery() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const track = trackRef.current;
      
      const totalWidth = track.scrollWidth;
      const amountToScroll = totalWidth - window.innerWidth;

      gsap.to(track, {
        x: -amountToScroll,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${amountToScroll}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1
        }
      });

      // Parallax effect for images
      gsap.utils.toArray('.huntara-img').forEach((img) => {
        gsap.fromTo(img, 
          { x: '-15%' },
          {
            x: '15%',
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: `+=${amountToScroll}`,
              scrub: 1
            }
          }
        );
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} style={{ 
      height: '100vh', 
      width: '100%', 
      background: 'linear-gradient(135deg, #E5D9B6 0%, #D4C59D 100%)', // Beige textured background
      overflow: 'hidden',
      position: 'relative',
      zIndex: 5
    }}>
      {/* Texture overlay to break monotony */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none',
        backgroundImage: `radial-gradient(#15173D 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }} />

      <div ref={trackRef} style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        width: 'fit-content',
        paddingLeft: '5vw',
        paddingRight: '15vw',
        gap: '8vw'
      }}>
        <div style={{
          width: '35vw',
          paddingLeft: '5vw',
          color: '#15173D', 
          flexShrink: 0
        }}>
          <h3 className="playfair-display" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.8rem)', fontStyle: 'italic', margin: 0, opacity: 0.9 }}>
            Bencana ini tidak berhenti di satu titik.
          </h3>
          <p className="lato-regular" style={{ fontSize: 'clamp(0.95rem, 1.2vw, 1.15rem)', maxWidth: '480px', opacity: 0.8, marginTop: '1.2rem', lineHeight: 1.6 }}>
            Dari jembatan yang terputus hingga bangunan yang rata dengan tanah. Ini bukan sekadar angka, melainkan realitas hilangnya ruang hidup dalam sekejap mata.
          </p>
        </div>

        {HUNTARA_IMAGES.map((item, idx) => (
          <div key={idx} style={{
            width: 'min(70vw, 800px)',
            height: '65vh',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '12px',
            boxShadow: '0 30px 60px rgba(21, 23, 61, 0.4)'
          }}>
            <img 
              className="huntara-img"
              src={item.src} 
              alt={item.caption}
              style={{
                width: '130%', // Make it wider for parallax
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0
              }}
            />
            {/* Caption overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(21, 23, 61, 0.9), transparent)',
              padding: '3rem 2rem 1.5rem',
              color: '#E5D9B6',
            }}>
              <p className="lato-light" style={{ margin: 0, fontSize: 'clamp(0.95rem, 1.2vw, 1.15rem)', letterSpacing: '0.5px' }}>
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SkalaDampakScene() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const numRefs = useRef([]);
  const ckpRefs = useRef({ kab: null, kel: null });
  const mapApiRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const q = gsap.utils.selector(root);
    const circ = 2 * Math.PI * SEKTOR_R_STROKE;
    const mm = gsap.matchMedia();

    // Keadaan akhir tanpa animasi (prefers-reduced-motion)
    const setFinalState = () => {
      gsap.set(q('.s2-baseline'), { scaleX: 1 });
      gsap.set(q('.s2-mask-inner'), { yPercent: 0 });
      gsap.set(q('.s2-pill, .s2-sub, .s2-sektor-head, .s2-sektor-label'), { opacity: 1, y: 0 });
      gsap.set(q('.s2-card'), { opacity: 1, y: 0, filter: 'blur(0px)' });
      gsap.set(q('.s2-card-icon, .s2-card-num, .s2-card-desc'), { opacity: 1, y: 0 });
      gsap.set(q('.s2-sektor-circle'), { strokeDasharray: circ, strokeDashoffset: 0 });
      gsap.set(q('.s2-sektor-fill'), { opacity: 0.92, scale: 1, transformOrigin: '50% 50%' });
      gsap.set(q('.s2-cakupan-eyebrow, .s2-cakupan-line, .s2-cakupan-gloss'), { opacity: 1, y: 0 });
      gsap.set(q('.s2c-head, .s2c-legend'), { opacity: 1, y: 0 });
      gsap.set(q('.s2-flow-step, .s2-flow-arrow'), { opacity: 1, y: 0 });
      numRefs.current.forEach((el, i) => { if (el) el.textContent = fmtID(STAT_CARDS[i].value); });
      if (ckpRefs.current.kab) ckpRefs.current.kab.textContent = fmtID(CAKUPAN.kab);
      if (ckpRefs.current.kel) ckpRefs.current.kel.textContent = fmtID(CAKUPAN.keluarga);
      mapApiRef.current?.reveal(1);
    };

    // Pill + headline (mask per kata) + subteks — sekali jalan, bukan scrub
    const buildIntro = () => {
      gsap.timeline({
        scrollTrigger: { trigger: stage, start: 'top 72%', once: true },
        defaults: { ease: 'power3.out' },
      })
        .fromTo(q('.s2-pill'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 })
        .fromTo(q('.s2-mask-inner'),
          { yPercent: 112 },
          { yPercent: 0, duration: 0.95, ease: 'expo.out', stagger: 0.085 }, 0.12)
        .fromTo(q('.s2-sub'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7 }, 0.55);
    };

    // Koreografi kartu: baseline → fill naik → angka & teks menyusul (per kartu)
    const buildCards = (tl) => {
      // Hilangkan baseline scaleX jika tidak diperlukan lagi di Bento Grid, 
      // tetapi biarkan jika masih ada elemen visual pemisah.
      tl.fromTo(q('.s2-baseline'),
        { scaleX: 0, transformOrigin: '0% 50%' },
        { scaleX: 1, duration: 0.5, ease: 'power1.inOut' }, 0);

      STAT_CARDS.forEach((card, i) => {
        const at = 0.22 + i * 0.15; // Lebih rapat jarak stagger antar kartu
        const counter = { v: 0 };
        const numEl = () => numRefs.current[i];

        // 1. Entry animasi kartu: Fade In, Slide Up 20px, Blur to Focus
        tl.fromTo(q(`.s2-card-${i}`),
          { opacity: 0, y: 40, filter: 'blur(10px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }, at);

        // 2. Konten dalam kartu muncul berurutan perlahan
        tl.fromTo(q(`.s2-card-icon-${i}`), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, at + 0.3);
        tl.fromTo(q(`.s2-card-num-${i}`), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, at + 0.45);
        tl.fromTo(q(`.s2-card-desc-${i}`), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, at + 0.6);

        // Counter updates along with the number slide up
        tl.to(counter, {
          v: card.value, duration: 0.9, ease: 'power2.out',
          onUpdate: () => { const el = numEl(); if (el) el.textContent = fmtID(counter.v); },
        }, at + 0.45);
      });
      return tl;
    };

    // Tunda pembuatan trigger sampai SEMUA pin di atasnya sudah ada — pin foto
    // s2Wrapper dibuat oleh efek parent yang berjalan SETELAH efek child ini,
    // dan pin-spacer-nya menggeser layout ±150vh; trigger yang dibuat lebih
    // awal akan menyimpan posisi start yang basi.
    const setup = () => {
      // Posisi awal kata headline DIATUR GSAP (bukan CSS/inline) — translateY
      // persen dari CSS di-bake jadi px oleh GSAP dan merusak animasi yPercent.
      gsap.set(q('.s2-mask-inner'), { yPercent: 112 });

      mm.add(
        {
          isDesktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
          isMobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
          reduced: '(prefers-reduced-motion: reduce)',
        },
        (ctx) => {
          const { isDesktop, reduced } = ctx.conditions;
          if (reduced) { setFinalState(); return; }

          // Hairline penunjuk arah di bridge — menggambar turun mengikuti scroll
          gsap.fromTo(q('.s2-bridge-line'),
            { scaleY: 0, transformOrigin: '50% 0%' },
            {
              scaleY: 1, ease: 'none',
              scrollTrigger: { trigger: q('.s2-bridge')[0], start: 'center 62%', end: 'bottom 30%', scrub: 1.5 },
            });

          // ── Cakupan Pendataan: 48 kab/kota + 115.462 keluarga (counter sekali jalan) ──
          const cak = gsap.timeline({
            scrollTrigger: { trigger: q('.s2-cakupan')[0], start: 'top 70%', once: true },
            defaults: { ease: 'power3.out' },
          });
          cak.fromTo(q('.s2-cakupan-eyebrow'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 })
            .fromTo(q('.s2-cakupan-line'), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.85, stagger: 0.2 }, 0.12)
            .fromTo(q('.s2-cakupan-gloss'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, 0.85);
          const oKab = { v: 0 };
          const oKel = { v: 0 };
          cak.to(oKab, {
            v: CAKUPAN.kab, duration: 0.4, ease: 'power1.out',
            onUpdate: () => { if (ckpRefs.current.kab) ckpRefs.current.kab.textContent = fmtID(oKab.v); },
          }, 0.15);
          cak.to(oKel, {
            v: CAKUPAN.keluarga, duration: 0.5, ease: 'power1.out',
            onUpdate: () => { if (ckpRefs.current.kel) ckpRefs.current.kel.textContent = fmtID(oKel.v); },
          }, 0.3);

          buildIntro();

          if (isDesktop) {
            // Stage di-pin; kartu terisi mengikuti scroll (scrub halus, bisa mundur)
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: stage, start: 'top top', end: '+=170%',
                pin: true, scrub: 1.5, anticipatePin: 1,
              },
            });
            buildCards(tl);
            tl.to({}, { duration: 0.35 }); // ruang napas sebelum unpin
          } else {
            // Mobile: tanpa pin — timeline berbasis waktu saat kartu masuk viewport
            const tl = gsap.timeline({
              scrollTrigger: { trigger: q('.s2-cardswrap')[0], start: 'top 80%', once: true },
            });
            buildCards(tl);
          }

          // (Sektor GSAP animation removed as it is now part of Bento Box)

          // ── Peta Choropleth Mapbox: titik kab/kota menyala bertahap + tint provinsi ──
          // Reveal di-drive imperatif ke layer Mapbox (mulus, tanpa re-render React).
          // progress di-skala 1.3 agar semua titik menyala sebelum peta beranjak keluar.
          ScrollTrigger.create({
            trigger: q('.s2-choro')[0],
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
            onUpdate: (self) => { mapApiRef.current?.reveal(self.progress * 1.3); },
            onRefresh: (self) => { mapApiRef.current?.reveal(self.progress * 1.3); },
          });
          // Head + legend + hint + caption muncul sekali saat peta masuk viewport
          gsap.timeline({
            scrollTrigger: { trigger: q('.s2-choro')[0], start: 'top 72%', once: true },
            defaults: { ease: 'power3.out' },
          })
            .fromTo(q('.s2c-head'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 })
            .fromTo(q('.s2c-legend'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 0.25);

          // ── Penutup: alur data Desa → … → Provinsi dengan sapuan shine kiri→kanan ──
          gsap.timeline({
            scrollTrigger: { trigger: q('.s2-flow')[0], start: 'top 82%', once: true },
            defaults: { ease: 'power3.out' },
          })
            .fromTo(q('.s2-flow-step'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 })
            .fromTo(q('.s2-flow-arrow'), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.12 }, 0.15)
            .fromTo(q('.s2-flow-shine'),
              { xPercent: -130, opacity: 0 },
              { xPercent: 240, opacity: 1, duration: 1.15, ease: 'power2.inOut' }, 0.35);
        }
      );
    };

    // Double-rAF: setup berjalan setelah seluruh efek commit ini (termasuk
    // pin parent) selesai dan layout final ter-paint.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(setup); });

    // Jaring pengaman: ukur ulang setelah font & resource berat settle.
    const refresh = () => ScrollTrigger.refresh();
    const tid = setTimeout(refresh, 900);
    const tid2 = setTimeout(refresh, 2600);
    window.addEventListener('load', refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => { });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(tid);
      clearTimeout(tid2);
      window.removeEventListener('load', refresh);
      mm.revert();
    };
  }, []);

  return (
    <div ref={rootRef} style={{ background: '#15173D' }}>

      {/* ── Cakupan Pendataan: seberapa luas kami mendata (48 kab/kota · 115.462 keluarga) ── */}
      <section className="s2-cakupan" style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: 'clamp(6rem, 13vh, 9rem) clamp(1.25rem, 6vw, 3rem) clamp(4.5rem, 10vh, 7rem)',
      }}>
        <span className="s2-cakupan-eyebrow lato-light" style={{
          fontSize: '0.7rem', letterSpacing: '0.34em', textTransform: 'uppercase',
          color: 'rgba(229,217,182,0.5)', marginBottom: '1.8rem',
        }}>
          Dari Catatan Lapangan
        </span>

        <h3
          aria-label={`Kami menelusuri ${fmtID(CAKUPAN.kab)} kabupaten/kota, mendengar suara ${fmtID(CAKUPAN.keluarga)} keluarga.`}
          style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3em' }}
        >
          <span className="s2-cakupan-line playfair-display" aria-hidden style={{
            fontStyle: 'italic', fontWeight: 500, lineHeight: 1.3,
            fontSize: 'clamp(1.6rem, 3.4vw, 2.7rem)', color: 'rgba(245,245,245,0.92)',
          }}>
            Kami menelusuri{' '}
            <span ref={(el) => { ckpRefs.current.kab = el; }} style={{ color: '#E5D9B6', fontWeight: 600 }}>0</span>
            {' '}kabupaten/kota,
          </span>
          <span className="s2-cakupan-line playfair-display" aria-hidden style={{
            fontStyle: 'italic', fontWeight: 500, lineHeight: 1.3,
            fontSize: 'clamp(1.6rem, 3.4vw, 2.7rem)', color: 'rgba(245,245,245,0.92)',
          }}>
            mendengar suara{' '}
            <span ref={(el) => { ckpRefs.current.kel = el; }} style={{ color: '#E5D9B6', fontWeight: 600 }}>0</span>
            {' '}keluarga.
          </span>
        </h3>

        <p className="s2-cakupan-gloss lato-light" style={{
          marginTop: '1.7rem', maxWidth: 580, lineHeight: 1.75,
          fontSize: 'clamp(0.95rem, 1.3vw, 1.08rem)', color: 'rgba(245,245,245,0.6)',
        }}>
          Dari ujung Aceh hingga Sumatera Barat — mereka bukan sekadar statistik,
          melainkan saksi hidup dari ruang hidup yang mendadak hilang dalam satu malam.
        </p>
      </section>

      {/* ── Bridge: pivot dari usaha survei → temuan ── */}
      <section className="s2-bridge" style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: 'clamp(4rem, 9vh, 6.5rem) clamp(1.25rem, 6vw, 3rem) clamp(3.5rem, 8vh, 6rem)',
        position: 'relative',
      }}>
        <ScrollReveal
          baseOpacity={0} enableBlur={true} baseRotation={1.5} blurStrength={6}
          wordAnimationEnd="center center"
          containerClassName="s2-bridge-wrap" textClassName="s2-bridge-text"
        >
          Bencana ini tidak berhenti di satu titik.
        </ScrollReveal>
        <div className="s2-bridge-line" style={{
          width: 1, height: 'clamp(40px, 7vh, 64px)', marginTop: '2.2rem',
          background: 'linear-gradient(to bottom, rgba(229,217,182,0.45), rgba(229,217,182,0.05))',
        }} />
      </section>

      <HuntaraGallery />

      {/* PATTERN SEPARATOR AFTER CAROUSEL */}
      <div style={{
        width: '100%',
        height: '40px',
        backgroundImage: `url(${patternImg})`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'auto 100%',
        backgroundColor: '#15173D',
        position: 'relative',
        zIndex: 12
      }} />

      {/* ── Stage: pill + headline + 4 kartu (pinned di desktop) ── */}
      <section ref={stageRef} className="s2-stage" style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative', zIndex: 2, background: '#15173D',
        padding: '0 clamp(1.25rem, 5vw, 3rem)',
      }}>
        {/* Ambient Background Blobs */}
        <div className="s2-ambient-blob" style={{ background: '#EF8722', width: '700px', height: '700px', top: '-10%', left: '-10%' }} />
        <div className="s2-ambient-blob" style={{ background: '#4FC3F7', width: '600px', height: '600px', bottom: '-5%', right: '-10%', opacity: 0.15 }} />

        <div style={{
          width: '100%', maxWidth: 1320, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 'clamp(1.6rem, 4vh, 2.6rem)', position: 'relative', zIndex: 5
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <h2 className="s2-headline playfair-display" aria-label="Skala Besar Dampak Nyata" style={{
              fontStyle: 'italic', fontWeight: 600, textAlign: 'center', lineHeight: 1.12,
              fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', margin: 0,
              display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.32em',
            }}>
              {HEADLINE_WORDS.map((w, i) => (
                <span key={i} className="s2-mask" aria-hidden style={{ display: 'inline-block', overflow: 'hidden', padding: '0.08em 0.05em' }}>
                  <span className="s2-mask-inner" style={{ display: 'inline-block', color: w.color }}>
                    {w.text}
                  </span>
                </span>
              ))}
            </h2>

            <p className="s2-sub lato-light" style={{
              marginTop: '1.1rem', maxWidth: 560, textAlign: 'center', lineHeight: 1.7,
              fontSize: 'clamp(0.92rem, 1.3vw, 1.05rem)', color: 'rgba(245,245,245,0.6)', opacity: 0,
            }}>
              Empat angka dari lapangan yang merangkum luasnya kehancuran.
            </p>
          </div>

      {/* ── Cards Grid Masonry ── */}
      <div className="s2-cardswrap" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div className="s2-cards" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: '220px',
          gap: '24px',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}>
          {/* Primary Data Cards */}
          {STAT_CARDS.map((card, i) => {
            const isHero = i === 0; // Warga Terdampak is first
            // Determine grid span based on key
            let spanStyle = {};
            if (card.key === 'warga') spanStyle = { gridColumn: 'span 2', gridRow: 'span 2' };
            else if (card.key === 'wilayah') spanStyle = { gridColumn: 'span 1', gridRow: 'span 2' };
            else if (card.key === 'rumah') spanStyle = { gridColumn: 'span 1', gridRow: 'span 2' };
            return (
              <div
                key={card.key}
                className={`s2-card ${isHero ? 's2-card-hero' : ''}`}
                style={{
                  '--accent': card.color,
                  ...spanStyle,
                  background: "linear-gradient(to bottom, rgba(15,20,25,0.3) 0%, rgba(15,20,25,0.9) 100%), url('/src/assets/images/huntara-01.JPG') center/cover no-repeat",
                  color: '#fff',
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                }}
              >
                {/* Tag */}
                <div className="s2-tag" style={{
                  position: 'absolute', top: '24px', left: '24px', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, color: '#E5D9B6', zIndex: 2,
                }}>{card.label}</div>
                {/* Maskot for Hero */}
                {isHero && (
                  <img src={maskotImg} alt="Maskot" style={{ position: 'absolute', bottom: 0, right: 0, width: '80px', height: 'auto', zIndex: 2 }} />
                )}
                {/* Content */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  padding: '24px',
                  position: 'relative',
                  zIndex: 2,
                }}>
                  {/* Number */}
                  <div className="s2-number" style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: isHero ? 'clamp(3rem,5vw,5rem)' : 'clamp(2rem,4vw,3rem)',
                    fontStyle: 'italic',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}>
                    {fmtID(card.value)} <span className="lato-light" style={{ fontSize: '0.6em', fontWeight: 400 }}>{card.unit}</span>
                  </div>
                  {/* Bottom */}
                  <div>
                    <div className="s2-title" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{card.label}</div>
                    <div className="s2-pill" style={{
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(6px)',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#333',
                      display: 'inline-block',
                      marginTop: '4px',
                    }}>{card.microcopy}</div>
                  </div>
                </div>
              </div>
            );
          })}
          {/* Sector Cards Integrated */}
          {SEKTOR_DATA.map((s, idx) => {
            const colors = ['#E74C3C', '#F1C40F', '#3498DB', '#2ECC71'];
            const color = colors[idx % colors.length];
            return (
              <div
                key={s.key}
                className="s2-card"
                style={{
                  '--accent': color,
                  background: "linear-gradient(to bottom, rgba(15,20,25,0.3) 0%, rgba(15,20,25,0.9) 100%), url('/src/assets/images/huntara-01.JPG') center/cover no-repeat",
                  color: '#fff',
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                }}
              >
                <div className="s2-tag" style={{
                  position: 'absolute', top: '24px', left: '24px', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, color: '#E5D9B6', zIndex: 2,
                }}>{s.label}</div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  padding: '24px',
                  position: 'relative',
                  zIndex: 2,
                }}>
                  <div className="s2-number" style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(2rem,4vw,3rem)',
                    fontStyle: 'italic',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}>
                    {fmtID(s.value)} <span className="lato-light" style={{ fontSize: '0.6em', fontWeight: 400 }}>unit</span>
                  </div>
                  <div>
                    <div className="s2-title" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{s.label}</div>
                    <div className="s2-pill" style={{
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(6px)',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#333',
                      display: 'inline-block',
                      marginTop: '4px',
                    }}>Sector</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* End of Masonry Grid */}
            <div className="s2-baseline" style={{
              width: '100%', maxWidth: 1020, height: 1, marginTop: 0,
              background: 'rgba(229,217,182,0.22)', transform: 'scaleX(0)',
            }} />
          </div>
      </section>

      {/* ── Peta Sebaran Kerusakan (Mapbox satelit muted, FULL-SCREEN) ── */}
      <section className="s2-choro">
        <div className="s2c-sticky">
          <ChoroplethMapbox apiRef={mapApiRef} />

          {/* Panel Data Cula.tech — Posisi Kanan Atas (Area Lautan Kosong) */}
          <div className="s2c-head" style={{
            position: 'absolute',
            top: '12%',         // Taruh di atas
            right: '5%',        // Taruh di kanan (Area Selat Malaka yang kosong)
            bottom: 'auto',     // WAJIB: Matikan CSS bawaan
            left: 'auto',       // WAJIB: Matikan CSS bawaan
            transform: 'none',  // WAJIB: Matikan efek center dari CSS bawaan
            width: 'auto',      // WAJIB: Cegah elemen melebar 100%
            zIndex: 20,
            textAlign: 'left'
          }}>
            <CulaDataPanel />
          </div>
        </div>
      </section>

      {/* ── Penutup: alur data dari desa ke provinsi (efek shine kiri→kanan) ── */}
      <section className="s2-flow">
        <div className="s2-flow-track">
          {['Desa', 'Kecamatan', 'Kab/Kota', 'Provinsi'].map((label, i) => (
            <React.Fragment key={label}>
              <span className="s2-flow-step lato-light">{label}</span>
              {i < 3 && <span className="s2-flow-arrow">→</span>}
            </React.Fragment>
          ))}
          <div className="s2-flow-shine" />
        </div>
        <p className="s2-flow-cap lato-light">
          Dari titik terkecil di lapangan hingga gambaran utuh tiga provinsi.
        </p>
      </section>
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
  const [phase, setPhase] = useState('spin');
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollProgressRef = useRef(0);

  const wrapperRef = useRef(null);

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
        scrollProgressRef.current = p;
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
        scrub: 1.5,
      }
    });
  }, []);

  useEffect(() => {
    // Custom cursor setup
    if (cursorRef.current) {
      gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
    }
    const moveCursor = (e) => {
      if (cursorRef.current && scrollProgressRef.current < 0.95) {
        gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "none" });
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <>
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
        <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', backgroundColor: 'transparent' }}>

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

      {/* SCENE 2: FOTO & TEKS (Tanpa zoom/pin) */}
      <div style={{ height: '100vh', width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#15173D', zIndex: 11 }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <img src={imgPendataan} alt="Pendataan Lapangan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #15173D 0%, transparent 15%)' }} />
        </div>

        <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: '450px', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 10 }}>
          <h2 className="playfair-display" style={{ fontSize: 'clamp(2.5rem, 3vw, 3.5rem)', color: '#E5D9B6', margin: 0, fontStyle: 'italic', lineHeight: 1.1 }}>
            Memetakan yang hilang
          </h2>
          <p className="lato-light" style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, margin: 0 }}>
            Sebelum bicara pemulihan, kami harus tahu seberapa luas yang hancur. Maka kami turun ke lapangan.
          </p>
        </div>
      </div>

      {/* PATTERN SEPARATOR */}
      <div style={{
        width: '100%',
        height: '40px',
        backgroundImage: `url(${patternImg})`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'auto 100%',
        backgroundColor: '#15173D',
        position: 'relative',
        zIndex: 12
      }} />

      <SkalaDampakScene />
    </>
  );
}