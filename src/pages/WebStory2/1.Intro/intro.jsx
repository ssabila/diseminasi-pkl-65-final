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
  { key: 'wilayah', label: 'Jumlah Wilayah Terdampak', value: _ds.total_desa_infra || 928, unit: 'desa', h: 100 },
  { key: 'warga', label: 'Warga Terdampak', value: _ds.total_art_keluarga || 188902, unit: 'jiwa', h: 92 },
  { key: 'rumah', label: 'Rumah Terdampak', value: RUMAH_TERDAMPAK, unit: 'bangunan', h: 84 },
  { key: 'fasilitas', label: 'Fasilitas Umum Terdampak', value: _ds.total_fasilitas_gabungan || 2739, unit: 'unit', h: 76 },
];

// Cakupan pendataan (materi storyline: total keluarga disurvei + kab/kota ditelusuri)
const CAKUPAN = {
  kab: Object.values(insights?.cakupan_geografis_infra?.kab_kota_per_provinsi || {}).reduce((s, v) => s + v, 0) || 48,
  keluarga: _ds.total_rt_keluarga || 115462,
};

// Sektor infrastruktur yang didata
const SEKTOR_DATA = [
  { key: 'pendidikan', label: 'Pendidikan' },
  { key: 'kesehatan', label: 'Kesehatan' },
  { key: 'ekonomi', label: 'Ekonomi' },
  { key: 'sosial', label: 'Sosial' },
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
          fitBoundsOptions: { padding: { top: 64, bottom: 64, left: 48, right: 48 } },
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
            <div class="s2c-prov-name">${t.label}</div>
            <div class="s2c-prov-row"><span class="s2c-prov-dot" style="background:${t.color}"></span>${t.tingkat}</div>
            <div class="s2c-prov-desa">${Number(t.desa).toLocaleString('id-ID')} desa terdampak</div>`;
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
      gsap.set(q('.s2-fill'), { scaleY: 1 });
      gsap.set(q('.s2-body--solid'), { opacity: 1 });
      gsap.set(q('.s2-body--ghost'), { opacity: 0 });
      gsap.set(q('.s2-baseline'), { scaleX: 1 });
      gsap.set(q('.s2-mask-inner'), { yPercent: 0 });
      gsap.set(q('.s2-pill, .s2-sub, .s2-sektor-head, .s2-sektor-label'), { opacity: 1, y: 0 });
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
      tl.fromTo(q('.s2-baseline'),
        { scaleX: 0, transformOrigin: '0% 50%' },
        { scaleX: 1, duration: 0.5, ease: 'power1.inOut' }, 0);

      STAT_CARDS.forEach((card, i) => {
        const at = 0.22 + i * 0.52;
        const counter = { v: 0 };
        const numEl = () => numRefs.current[i];

        tl.fromTo(q(`.s2-fill-${i}`),
          { scaleY: 0, transformOrigin: '50% 100%' },
          { scaleY: 1, duration: 0.6, ease: 'power1.inOut' }, at);

        tl.fromTo(q(`.s2-body-ghost-${i}`), { opacity: 1 }, { opacity: 0, duration: 0.28, ease: 'none' }, at + 0.3);
        tl.fromTo(q(`.s2-body-solid-${i}`), { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' }, at + 0.34);

        tl.to(counter, {
          v: card.value, duration: 0.75, ease: 'power1.out',
          onUpdate: () => { const el = numEl(); if (el) el.textContent = fmtID(counter.v); },
        }, at + 0.16);
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
              scrollTrigger: { trigger: q('.s2-bridge')[0], start: 'center 62%', end: 'bottom 30%', scrub: true },
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
            v: CAKUPAN.kab, duration: 0.9, ease: 'power1.out',
            onUpdate: () => { if (ckpRefs.current.kab) ckpRefs.current.kab.textContent = fmtID(oKab.v); },
          }, 0.25);
          cak.to(oKel, {
            v: CAKUPAN.keluarga, duration: 1.5, ease: 'power1.out',
            onUpdate: () => { if (ckpRefs.current.kel) ckpRefs.current.kel.textContent = fmtID(oKel.v); },
          }, 0.5);

          buildIntro();

          if (isDesktop) {
            // Stage di-pin; kartu terisi mengikuti scroll (scrub halus, bisa mundur)
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: stage, start: 'top top', end: '+=170%',
                pin: true, scrub: 0.65, anticipatePin: 1,
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

          // Sektor: lingkaran menggambar stroke → terisi oranye → label naik
          gsap.set(q('.s2-sektor-circle'), { strokeDasharray: circ, strokeDashoffset: circ });
          gsap.timeline({
            scrollTrigger: { trigger: q('.s2-sektor')[0], start: 'top 78%', once: true },
          })
            .fromTo(q('.s2-sektor-head'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
            .to(q('.s2-sektor-circle'), { strokeDashoffset: 0, duration: 0.9, stagger: 0.14, ease: 'power2.inOut' }, 0.15)
            .fromTo(q('.s2-sektor-fill'),
              { scale: 0.55, opacity: 0, transformOrigin: '50% 50%' },
              { scale: 1, opacity: 0.92, duration: 0.55, stagger: 0.14, ease: 'power2.out' }, 0.6)
            .fromTo(q('.s2-sektor-label'),
              { opacity: 0, y: 8 },
              { opacity: 1, y: 0, duration: 0.5, stagger: 0.14, ease: 'power2.out' }, 0.75);

          // ── Peta Choropleth Mapbox: titik kab/kota menyala bertahap + tint provinsi ──
          // Reveal di-drive imperatif ke layer Mapbox (mulus, tanpa re-render React).
          // progress di-skala 1.3 agar semua titik menyala sebelum peta beranjak keluar.
          ScrollTrigger.create({
            trigger: q('.s2-choro')[0],
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
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

      {/* ── Stage: pill + headline + 4 kartu (pinned di desktop) ── */}
      <section ref={stageRef} className="s2-stage" style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative', zIndex: 2, background: '#15173D',
        padding: '0 clamp(1.25rem, 5vw, 3rem)',
      }}>
        <div style={{
          width: '100%', maxWidth: 1080, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 'clamp(1.6rem, 4vh, 2.6rem)',
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

          <div className="s2-cardswrap" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="s2-cards" style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              gap: 'clamp(0.9rem, 2.4vw, 1.7rem)', width: '100%',
            }}>
              {STAT_CARDS.map((card, i) => (
                <div key={card.key} className="s2-card" style={{ '--h': card.h / 100 }}>
                  <div className={`s2-fill s2-fill-${i}`} />

                  {/* Teks keadaan "kosong" (kartu masih kelabu) */}
                  <div className={`s2-body s2-body--ghost s2-body-ghost-${i}`}>
                    <span className="playfair-display" style={{
                      fontStyle: 'italic', fontSize: 'clamp(0.82rem, 1.05vw, 0.98rem)',
                      lineHeight: 1.3, color: 'rgba(245,245,245,0.38)',
                    }}>
                      {card.label}
                    </span>
                  </div>

                  {/* Teks keadaan terisi (beige, angka navy) */}
                  <div className={`s2-body s2-body--solid s2-body-solid-${i}`} style={{ opacity: 0 }}>
                    <span
                      ref={(el) => { numRefs.current[i] = el; }}
                      className="playfair-display"
                      style={{
                        fontStyle: 'italic', fontWeight: 600, lineHeight: 1,
                        fontSize: 'clamp(1.7rem, 3.1vw, 2.7rem)', color: '#15173D',
                      }}
                    >
                      0
                    </span>
                    <span className="playfair-display" style={{
                      fontStyle: 'italic', fontSize: 'clamp(0.82rem, 1.05vw, 0.98rem)',
                      lineHeight: 1.3, color: 'rgba(21,23,61,0.82)',
                    }}>
                      {card.label}
                    </span>
                    <span className="lato-light" style={{
                      fontSize: '0.66rem', letterSpacing: '0.16em', textTransform: 'uppercase',
                      color: 'rgba(21,23,61,0.55)',
                    }}>
                      {card.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="s2-baseline" style={{
              width: '100%', maxWidth: 1020, height: 1, marginTop: 0,
              background: 'rgba(229,217,182,0.22)', transform: 'scaleX(0)',
            }} />
          </div>
        </div>
      </section>

      {/* ── Sektor Infrastruktur ── */}
      <section className="s2-sektor" style={{
        minHeight: '64vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '14vh clamp(1.25rem, 5vw, 3rem) 11vh',
      }}>
        <div className="s2-sektor-head" style={{ textAlign: 'center', marginBottom: '3rem', opacity: 0 }}>
          <h3 className="playfair-display" style={{
            fontStyle: 'italic', fontWeight: 600, color: '#E5D9B6',
            fontSize: 'clamp(1.3rem, 2.5vw, 2rem)', margin: 0,
          }}>
            Sektor Infrastruktur
          </h3>
          <p className="lato-light" style={{
            margin: '0.6rem 0 0', fontSize: '0.92rem',
            color: 'rgba(245,245,245,0.55)', fontStyle: 'italic',
          }}>
            Pendidikan, Kesehatan, Ekonomi, dan Sosial
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(1.6rem, 5vw, 3.4rem)', justifyContent: 'center' }}>
          {SEKTOR_DATA.map((s) => (
            <div key={s.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem' }}>
              <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden>
                <circle className="s2-sektor-fill" cx="42" cy="42" r="25" fill="#EF8722" opacity="0" />
                <circle
                  className="s2-sektor-circle"
                  cx="42" cy="42" r={SEKTOR_R_STROKE}
                  fill="none" stroke="#EF8722" strokeWidth="1.4" strokeLinecap="round"
                  transform="rotate(-90 42 42)"
                />
              </svg>
              <span className="s2-sektor-label lato-light" style={{
                fontSize: '0.82rem', color: 'rgba(245,245,245,0.75)',
                letterSpacing: '0.05em', opacity: 0,
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Peta Sebaran Kerusakan (Mapbox satelit muted, FULL-SCREEN) ── */}
      <section className="s2-choro">
        <div className="s2c-sticky">
          {/* Peta full-screen (mengisi seluruh viewport, seperti Scene 1) */}
          <ChoroplethMapbox apiRef={mapApiRef} />

          {/* Judul overlay di atas peta */}
          <div className="s2c-head">
            <h3 className="playfair-display">Peta Sebaran Kerusakan</h3>
          </div>

          {/* Legend "Tingkat Kerusakan" + makna titik */}
          <div className="s2c-legend">
            <span className="s2c-legend-title playfair-display">Tingkat Kerusakan</span>
            {[
              { label: 'Rusak Parah', color: '#EF8722' },
              { label: 'Rusak Sedang', color: '#E5D9B6' },
              { label: 'Rusak Ringan', color: '#628141' },
            ].map((row) => (
              <div key={row.label} className="s2c-legend-row">
                <span className="s2c-legend-dot" style={{ background: row.color }} />
                <span className="lato-light">{row.label}</span>
              </div>
            ))}
            <div className="s2c-legend-sep" />
            <div className="s2c-legend-row">
              <span className="s2c-legend-point" />
              <span className="lato-light">Titik pendataan kab/kota</span>
            </div>
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
  const [phase, setPhase] = useState('spin');
  const [scrollProgress, setScrollProgress] = useState(0);

  const wrapperRef = useRef(null);

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

        {/* Teks Narasi di Sisi KANAN (Beat 0) */}
        <div ref={s2TextRef} style={{
          position: 'absolute', bottom: '15%', right: '8%',
          width: 'min(450px, 86vw)', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 10
        }}>

          <h2 className="playfair-display" style={{ fontSize: 'clamp(2.5rem, 3vw, 3.5rem)', fontWeight: 400, fontStyle: 'italic', color: '#E5D9B6', lineHeight: 1.1, margin: 0 }}>
            Memetakan yang hilang
          </h2>

          <p className="lato-light" style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontWeight: 300, margin: 0 }}>
            Sebelum bicara pemulihan, kami harus tahu seberapa luas yang hancur. Maka kami turun ke lapangan.
          </p>
        </div>
      </div>

      {/* ════════ SCENE 2 — SKALA BESAR, DAMPAK NYATA ════════
          Bridge narasi → stage pinned (kartu terisi mengikuti scroll) → Sektor */}
      <SkalaDampakScene />

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
        /* ── Scene 2: "Skala Besar, Dampak Nyata" ── */
        .s2-bridge-wrap { margin: 0; max-width: 760px; }
        .s2-bridge-text {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 500;
          font-size: clamp(1.7rem, 3.6vw, 2.7rem);
          line-height: 1.35;
          color: #F5F5F5;
          text-align: center;
          margin: 0;
        }
        .s2-cards { --s2-cardmax: clamp(280px, 44vh, 420px); }
        .s2-card {
          position: relative;
          width: clamp(150px, 21vw, 238px);
          height: calc(var(--s2-cardmax) * var(--h));
          flex-shrink: 0;
          border-radius: 18px;
          background: rgba(255,255,255,0.07);
          overflow: hidden;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (hover: hover) {
          .s2-card:hover { transform: translateY(-6px); }
        }
        .s2-fill {
          position: absolute; inset: 0;
          background: #E5D9B6;
          transform: scaleY(0);
          will-change: transform;
        }
        .s2-body {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 0.55rem; padding: 1.4rem 0.9rem;
          text-align: center; pointer-events: none;
        }

        /* ── Scene 2: Peta Sebaran Kerusakan (Mapbox satelit, FULL-SCREEN) ── */
        .s2-choro { position: relative; height: 240vh; }
        .s2c-sticky {
          position: sticky; top: 0; height: 100vh; width: 100%;
          overflow: hidden; background: #0a0b1d;
        }
        /* Peta mengisi seluruh viewport */
        .s2c-map-shell { position: absolute; inset: 0; z-index: 1; }
        .s2c-map {
          position: absolute; inset: 0;
          filter: grayscale(40%) brightness(0.72) contrast(1.04) saturate(0.98);
        }
        .s2c-map-grade {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse at center, transparent 52%, rgba(10,11,29,0.58) 100%),
            linear-gradient(180deg, rgba(21,23,61,0.16), rgba(10,11,29,0.3));
        }
        .s2c-map-grad-edge {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(180deg, rgba(10,11,29,0.66) 0%, transparent 26%, transparent 82%, rgba(10,11,29,0.42) 100%);
        }
        /* Judul overlay di atas peta */
        .s2c-head {
          position: absolute; top: clamp(3.5rem, 8vh, 6rem); left: 50%;
          transform: translateX(-50%); width: min(680px, 88vw); text-align: center;
          z-index: 5; opacity: 0; pointer-events: none;
        }
        .s2c-head h3 {
          font-style: italic; font-weight: 600; color: #E5D9B6;
          font-size: clamp(1.7rem, 3.4vw, 2.7rem); margin: 0; line-height: 1.14;
          text-shadow: 0 4px 20px rgba(0,0,0,0.7);
        }
        .s2c-head p {
          margin: 0.7rem 0 0; font-size: clamp(0.9rem, 1.3vw, 1.05rem);
          color: rgba(245,245,245,0.82); line-height: 1.6;
          text-shadow: 0 2px 12px rgba(0,0,0,0.8);
        }
        /* Legend overlay */
        .s2c-legend {
          position: absolute; top: 16px; right: 16px; z-index: 5;
          display: flex; flex-direction: column; gap: 0.5rem;
          padding: 0.9rem 1.05rem; border-radius: 12px;
          background: rgba(13,15,38,0.72); backdrop-filter: blur(6px);
          border: 1px solid rgba(229,217,182,0.2); opacity: 0; pointer-events: none;
        }
        .s2c-legend-title { font-style: italic; font-size: 1rem; color: #E5D9B6; margin-bottom: 0.15rem; }
        .s2c-legend-row { display: flex; align-items: center; gap: 0.55rem; font-size: 0.8rem; color: rgba(245,245,245,0.82); }
        .s2c-legend-dot { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
        .s2c-legend-point {
          width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
          background: #FFEAC6; box-shadow: 0 0 8px 2px rgba(230,126,34,0.95);
        }
        .s2c-legend-sep { height: 1px; background: rgba(229,217,182,0.18); margin: 0.15rem 0; }
        /* Label provinsi (auto-muncul saat scroll) — Marker HTML di atas peta */
        .s2c-prov-label {
          pointer-events: none; white-space: nowrap;
          padding: 0.5rem 0.85rem; border-radius: 11px; text-align: left;
          background: rgba(13,15,38,0.7); backdrop-filter: blur(3px);
          border: 1px solid rgba(229,217,182,0.24);
          box-shadow: 0 12px 34px rgba(0,0,0,0.5);
        }
        .s2c-prov-name { font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.1rem; color: #E5D9B6; line-height: 1.1; }
        .s2c-prov-row { display: flex; align-items: center; gap: 0.42rem; margin-top: 0.28rem; font-size: 0.8rem; color: rgba(245,245,245,0.92); }
        .s2c-prov-dot { width: 11px; height: 11px; border-radius: 3px; flex-shrink: 0; }
        .s2c-prov-desa { font-size: 0.72rem; color: rgba(229,217,182,0.82); margin-top: 0.18rem; }

        /* ── Scene 2: Penutup alur data (shine kiri→kanan) ── */
        .s2-flow {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 1.3rem; padding: 10vh clamp(1.25rem, 5vw, 3rem) 14vh; text-align: center;
        }
        .s2-flow-track {
          position: relative; display: flex; align-items: center; flex-wrap: wrap;
          justify-content: center; gap: clamp(0.6rem, 2vw, 1.4rem); overflow: hidden; padding: 0.4rem 0.2rem;
        }
        .s2-flow-step {
          font-size: clamp(0.85rem, 1.6vw, 1.1rem); letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(245,245,245,0.78); padding: 0.5rem 1rem; border-radius: 999px;
          border: 1px solid rgba(229,217,182,0.28); background: rgba(229,217,182,0.05); opacity: 0;
        }
        .s2-flow-arrow { color: #E67E22; font-size: 1.2rem; opacity: 0; }
        .s2-flow-shine {
          position: absolute; top: 0; bottom: 0; width: 26%; pointer-events: none; opacity: 0;
          background: linear-gradient(90deg, transparent, rgba(230,126,34,0.18) 45%, rgba(255,224,181,0.32) 50%, rgba(230,126,34,0.18) 55%, transparent);
          filter: blur(2px);
        }
        .s2-flow-cap {
          margin: 0; max-width: 560px; font-style: italic;
          font-size: clamp(0.9rem, 1.3vw, 1.05rem); color: rgba(245,245,245,0.55); line-height: 1.7;
        }

        @media (max-width: 767px) {
          .s2-cards { flex-wrap: wrap; gap: 0.8rem !important; }
          .s2-card { width: calc(50% - 0.4rem); height: 168px; }
          .s2-baseline { display: none; }
          .s2-stage { height: auto !important; padding-top: 14vh !important; padding-bottom: 12vh !important; }
          .s2-choro { height: 210vh; }
          .s2c-head { top: 2.4rem; width: 92vw; }
          .s2c-legend { top: auto; bottom: 14px; right: 10px; padding: 0.6rem 0.75rem; gap: 0.35rem; }
          .s2c-legend-title { font-size: 0.85rem; }
          .s2c-legend-row { font-size: 0.7rem; }
          .s2c-prov-label { padding: 0.4rem 0.65rem; }
          .s2c-prov-name { font-size: 0.95rem; }
          .s2c-prov-row { font-size: 0.72rem; }
        }
      `}</style>
    </>
  );
}