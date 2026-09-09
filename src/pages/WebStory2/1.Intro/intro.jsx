/**
 * intro.jsx — Babak 1: Intro (Refactored)
 * 
 * Changes:
 * - Smooth panning (no zoom in/out) for map transitions
 * - Single sticky map container with floating text overlay
 * - Crossfade peta→foto transition (blur + opacity)
 * - Blur-to-focus text reveal for bridge text
 * - Asymmetric Bento grid with maskot peeking
 * - ALL icons removed — typography-only design
 * - Color palette: #15173D, #E5D9B6, #628141, #E67E22, #FFFFFF only
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
  spin: { lat: -10, lng: 150, zoom: 1.2, pitch: 0, label: null },
  world: { lat: -2, lng: 118, zoom: 3.8, pitch: 0, label: null },
  sumatera: { lat: 1.5, lng: 99.5, zoom: 5.5, pitch: 45, label: null },
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
   Scene 2 — Data kartu "Skala Besar, Dampak Nyata"
───────────────────────────────────────────*/
const _ds = insights?.ringkasan_dataset || {};
const _kb = insights?.rumah_tangga?.kondisi_bangunan || {};
const _kbTotal = Object.values(_kb).reduce((s, v) => s + (v?.n || 0), 0);
const _kbTidak = Object.entries(_kb).find(([k]) => /tidak terdampak/i.test(k))?.[1]?.n || 0;
const RUMAH_TERDAMPAK = (_kbTotal ? _kbTotal - _kbTidak : 0) || 35849;

const STAT_CARDS = [
  { 
    key: 'wilayah', label: 'Wilayah Terdampak', value: _ds.total_desa_infra || 928, unit: 'desa', 
    color: '#E67E22',
    microcopy: 'Tersebar di 3 Provinsi',
  },
  { 
    key: 'warga', label: 'Warga Terdampak', value: _ds.total_art_keluarga || 188902, unit: 'jiwa', 
    color: '#E5D9B6',
    microcopy: 'Kehilangan akses ke kehidupan normal',
  },
  { 
    key: 'rumah', label: 'Rumah Terdampak', value: RUMAH_TERDAMPAK, unit: 'bangunan', 
    color: '#FFFFFF',
    microcopy: 'Berbagai tingkat kerusakan, tak lagi layak huni',
  },
  { 
    key: 'fasilitas', label: 'Fasilitas Umum', value: _ds.total_fasilitas_gabungan || 2739, unit: 'unit', 
    color: '#628141',
    microcopy: 'Pendidikan, kesehatan, hingga rumah ibadah',
  },
];

const CAKUPAN = {
  kab: Object.values(insights?.cakupan_geografis_infra?.kab_kota_per_provinsi || {}).reduce((s, v) => s + v, 0) || 48,
  keluarga: _ds.total_rt_keluarga || 115462,
};

const SEKTOR_DATA = [
  { key: 'pendidikan', label: 'Pendidikan', value: _ds.total_fasilitas?.pendidikan || 824 },
  { key: 'kesehatan', label: 'Kesehatan', value: _ds.total_fasilitas?.kesehatan || 342 },
  { key: 'ekonomi', label: 'Ekonomi', value: _ds.total_fasilitas?.ekonomi || 591 },
  { key: 'sosial', label: 'Sosial', value: _ds.total_fasilitas?.sosial || 982 },
];

/* ─────────────────────────────────────────
   Choropleth Data
───────────────────────────────────────────*/
const _desaPerProv = insights?.cakupan_geografis_infra?.desa_per_provinsi || {};
const CHORO_TARGETS = {
  'ACEH': { label: 'Aceh', desa: _desaPerProv['Aceh'] || 556, color: '#E67E22', tingkat: 'Rusak Parah' },
  'SUMATERA UTARA': { label: 'Sumatera Utara', desa: _desaPerProv['Sumatera Utara'] || 292, color: '#E5D9B6', tingkat: 'Rusak Sedang' },
  'SUMATERA BARAT': { label: 'Sumatera Barat', desa: _desaPerProv['Sumatera Barat'] || 80, color: '#628141', tingkat: 'Rusak Ringan' },
};

const KAB_GLOW = '#E67E22';

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

const CHORO_LABELS = [
  { key: 'ACEH', lngLat: [96.95, 4.30], appear: [0.10, 0.30] },
  { key: 'SUMATERA UTARA', lngLat: [99.30, 2.10], appear: [0.40, 0.60] },
  { key: 'SUMATERA BARAT', lngLat: [100.60, -0.70], appear: [0.64, 0.84] },
];

const fmtID = (n) => Math.round(n).toLocaleString('id-ID');

const HEADLINE_WORDS = [
  { text: 'Skala', color: '#E5D9B6' },
  { text: 'Besar', color: '#E5D9B6' },
  { text: 'Dampak', color: '#E67E22' },
  { text: 'Nyata', color: '#E67E22' },
];

/* ─────────────────────────────────────────
   CulaDataPanel — Minimalist, no icons
───────────────────────────────────────────*/
function CulaDataPanel() {
  const _ds = insights?.ringkasan_dataset || {};
  const totalKK = _ds.total_rt_keluarga || 115462;
  const totalDesa = _ds.total_desa_infra || 928;
  const totalART = _ds.total_art_keluarga || 188902;

  return (
    <div style={{
      width: '100%', maxWidth: '360px', 
      background: 'rgba(21, 23, 61, 0.75)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '16px', border: '1px solid rgba(229, 217, 182, 0.1)',
      padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)', color: '#fff',
      pointerEvents: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="playfair-display" style={{ fontSize: '1.05rem', fontWeight: 600, color: '#E5D9B6', fontStyle: 'italic' }}>
          R3P Data Engine
        </div>
        <div style={{ background: 'rgba(98,129,65,0.2)', color: '#628141', padding: '3px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px' }}>
          LIVE
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="lato-light" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Cakupan Wilayah</span>
        <div className="lato-bold" style={{ fontSize: '0.85rem', color: '#fff' }}>{totalDesa} Desa</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="lato-light" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Keluarga Disurvei</span>
        <div className="lato-bold" style={{ fontSize: '0.85rem', color: '#fff' }}>
          {totalKK.toLocaleString('id-ID')}
        </div>
      </div>

      <div style={{ borderLeft: '2px dashed rgba(229,217,182,0.2)', marginLeft: '1.2rem', paddingLeft: '1.2rem', paddingBottom: '0.2rem', paddingTop: '0.2rem' }}>
        <div className="lato-light" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>Total Jiwa Terdampak</div>
        <div className="lato-bold" style={{ fontSize: '1rem', color: '#E5D9B6' }}>+ {totalART.toLocaleString('id-ID')} Jiwa</div>
      </div>

      <div className="lato-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>
        DATA POINTS COLLECTED
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {[
          { label: 'Sosial/Ibadah', val: '1.106 Unit', color: '#E67E22' },
          { label: 'Pendidikan', val: '785 Unit', color: '#628141' },
          { label: 'Kesehatan', val: '607 Unit', color: '#E5D9B6' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: i < 2 ? '0.4rem' : 0 }}>
            <span className="lato-light" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
            <span className="lato-bold" style={{ background: `${item.color}22`, color: item.color, padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ChoroplethMapbox — full-screen satellite map for Scene 2
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

    const applyReveal = (progress) => {
      const p = Math.max(0, Math.min(1, progress));
      st.lastP = p;
      const m = mapRef.current;
      if (!m || !st.ready) return;

      const litCount = Math.round(p * KAB_TOTAL);
      if (litCount !== st.litCount) {
        st.litCount = litCount;
        const onCore = ['case', ['<', ['get', 'idx'], litCount], 1, 0];
        const onGlow = ['case', ['<', ['get', 'idx'], litCount], 0.6, 0];
        m.setPaintProperty('kab-glow', 'circle-opacity', onGlow);
        m.setPaintProperty('kab-core', 'circle-opacity', onCore);
        m.setPaintProperty('kab-core', 'circle-stroke-opacity', onCore);
      }

      const seg = (lo, hi) => Math.max(0, Math.min(1, (p - lo) / (hi - lo)));
      const FILL = 0.72;
      m.setPaintProperty('prov-fill', 'fill-opacity', [
        'match', ['get', 'name'],
        'ACEH', FILL * seg(0.04, 0.4),
        'SUMATERA UTARA', FILL * seg(0.34, 0.7),
        'SUMATERA BARAT', FILL * seg(0.6, 0.94),
        0,
      ]);

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
          style: 'mapbox://styles/mapbox/dark-v11',
          bounds: CHORO_BOUNDS,
          fitBoundsOptions: { padding: { top: 64, bottom: 64, left: 48, right: 480 } },
          scrollZoom: false, dragPan: false, dragRotate: false, boxZoom: false,
          doubleClickZoom: false, touchZoomRotate: false, touchPitch: false, keyboard: false,
          attributionControl: false,
        });
      } catch (err) {
        console.warn('[ChoroplethMapbox] init gagal:', err?.message || err);
        return;
      }
      mapRef.current = map;

      apiRef.current = {
        reveal: applyReveal,
        resize: () => mapRef.current && mapRef.current.resize(),
      };

      map.on('load', () => {
        map.addSource('sumatera', { type: 'geojson', data: SUMATERA_FC });
        map.addSource('kab', { type: 'geojson', data: KAB_FC });

        map.addLayer({
          id: 'prov-fill', type: 'fill', source: 'sumatera',
          filter: ['==', ['get', 'target'], 1],
          paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0 },
        });
        map.addLayer({
          id: 'prov-line', type: 'line', source: 'sumatera',
          paint: {
            'line-color': 'rgba(229,217,182,0.55)',
            'line-width': ['case', ['==', ['get', 'target'], 1], 1.4, 0.5],
          },
        });
        // Minimalist solid dots — no glow effect
        map.addLayer({
          id: 'kab-glow', type: 'circle', source: 'kab',
          paint: { 'circle-radius': 10, 'circle-color': '#E67E22', 'circle-blur': 0, 'circle-opacity': 0 },
        });
        // Core dots — solid minimalist
        map.addLayer({
          id: 'kab-core', type: 'circle', source: 'kab',
          paint: {
            'circle-radius': 5, 'circle-color': '#E67E22',
            'circle-stroke-color': 'rgba(229,217,182,0.4)', 'circle-stroke-width': 1.5,
            'circle-opacity': 0, 'circle-stroke-opacity': 0,
          },
        });

        labelsRef.current = CHORO_LABELS.map((cfg) => {
          const t = CHORO_TARGETS[cfg.key];
          const el = document.createElement('div');
          el.className = 's2c-prov-label';
          el.style.opacity = '0';
          el.innerHTML = `
            <div style="position: relative; display: flex; align-items: center; pointer-events: none;">
              <div style="width: 14px; height: 14px; background-color: ${t.color}; border-radius: 50%; box-shadow: 0 0 15px ${t.color}, inset 0 0 4px rgba(255,255,255,0.8); z-index: 2; border: 2px solid rgba(255,255,255,0.9);"></div>
              <div style="width: 40px; height: 2px; background-color: rgba(255,255,255,0.7); z-index: 1; margin-left: -2px;"></div>
              <div style="background: rgba(21, 23, 61, 0.85); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(229,217,182,0.15); color: #fff; padding: 6px 14px; border-radius: 6px; font-family: 'Lato', sans-serif; font-size: 11px; box-shadow: 0 4px 15px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 4px; white-space: nowrap;">
                <div style="font-weight: 800; color: ${t.color}; display: flex; align-items: center; gap: 6px;">${t.label.toUpperCase()}</div>
                <div style="font-weight: 300; font-size: 10px; color: rgba(255,255,255,0.7);">${t.tingkat} · ${Number(t.desa).toLocaleString('id-ID')} Desa</div>
              </div>
            </div>
          `;
          const marker = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat(cfg.lngLat).addTo(map);
          return { marker, el, appear: cfg.appear };
        });

        st.ready = true;
        applyReveal(st.lastP);
      });

      map.on('error', (e) => console.warn('[ChoroplethMapbox]', e.error?.message || e));

      ro = new ResizeObserver(() => { if (mapRef.current) mapRef.current.resize(); });
      ro.observe(el);
    };

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

/* ─────────────────────────────────────────
   HuntaraGallery — Horizontal scroll gallery
───────────────────────────────────────────*/
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
      height: '100vh', width: '100%', 
      background: '#15173D',
      overflow: 'hidden', position: 'relative', zIndex: 5
    }}>
      <div ref={trackRef} style={{
        display: 'flex', alignItems: 'center', height: '100%',
        width: 'fit-content', paddingLeft: '5vw', paddingRight: '15vw', gap: '8vw'
      }}>
        <div style={{ width: '35vw', paddingLeft: '5vw', color: '#E5D9B6', flexShrink: 0 }}>
          <h3 className="playfair-display" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.8rem)', fontStyle: 'italic', margin: 0 }}>
            Bencana ini tidak berhenti di satu titik.
          </h3>
          <p className="lato-light" style={{ fontSize: 'clamp(0.95rem, 1.2vw, 1.15rem)', maxWidth: '480px', opacity: 0.6, marginTop: '1.2rem', lineHeight: 1.6 }}>
            Dari jembatan yang terputus hingga bangunan yang rata dengan tanah. Ini bukan sekadar angka, melainkan realitas hilangnya ruang hidup dalam sekejap mata.
          </p>
        </div>

        {HUNTARA_IMAGES.map((item, idx) => (
          <div key={idx} style={{
            width: 'min(70vw, 800px)', height: '65vh', position: 'relative',
            overflow: 'hidden', borderRadius: '12px',
            boxShadow: '0 30px 60px rgba(21, 23, 61, 0.4)'
          }}>
            <img className="huntara-img" src={item.src} alt={item.caption}
              style={{ width: '130%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0 }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(21, 23, 61, 0.9), transparent)',
              padding: '3rem 2rem 1.5rem', color: '#E5D9B6',
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

/* ─────────────────────────────────────────
   SkalaDampakScene — Bento grid with maskot
───────────────────────────────────────────*/
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
    const mm = gsap.matchMedia();

    const buildIntro = () => {
      gsap.timeline({
        scrollTrigger: { trigger: stage, start: 'top 72%', once: true },
        defaults: { ease: 'power3.out' },
      })
        .fromTo(q('.s2-mask-inner'),
          { yPercent: 112 },
          { yPercent: 0, duration: 0.95, ease: 'expo.out', stagger: 0.085 }, 0.12);
    };

    const buildCards = (tl) => {
      STAT_CARDS.forEach((card, i) => {
        const at = 0.15 + i * 0.18;
        const counter = { v: 0 };
        const numEl = () => numRefs.current[i];

        // Fade-blur entrance
        tl.fromTo(q(`.s2-card-${i}`),
          { opacity: 0, y: 50, filter: 'blur(12px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }, at);

        tl.to(counter, {
          v: card.value, duration: 1.2, ease: 'power2.out',
          onUpdate: () => { const el = numEl(); if (el) el.textContent = fmtID(counter.v); },
        }, at + 0.3);
      });

      // Sektor cards
      SEKTOR_DATA.forEach((s, i) => {
        const at = 0.15 + (STAT_CARDS.length + i) * 0.18;
        tl.fromTo(q(`.s2-sektor-${i}`),
          { opacity: 0, y: 50, filter: 'blur(12px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }, at);
      });

      return tl;
    };

    const setup = () => {
      gsap.set(q('.s2-mask-inner'), { yPercent: 112 });

      mm.add(
        {
          isDesktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
          isMobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
          reduced: '(prefers-reduced-motion: reduce)',
        },
        (ctx) => {
          const { isDesktop, reduced } = ctx.conditions;
          if (reduced) return;


          // Cakupan counter
          const cak = gsap.timeline({
            scrollTrigger: { trigger: q('.s2-cakupan')[0], start: 'top 70%', once: true },
            defaults: { ease: 'power3.out' },
          });
          cak.fromTo(q('.s2-cakupan-eyebrow'), { opacity: 0, y: 12, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 })
            .fromTo(q('.s2-cakupan-line'), { opacity: 0, y: 22, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.85, stagger: 0.2 }, 0.12)
            .fromTo(q('.s2-cakupan-gloss'), { opacity: 0, y: 14, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7 }, 0.85);
          const oKab = { v: 0 };
          const oKel = { v: 0 };
          cak.to(oKab, { v: CAKUPAN.kab, duration: 0.4, ease: 'power1.out', onUpdate: () => { if (ckpRefs.current.kab) ckpRefs.current.kab.textContent = fmtID(oKab.v); } }, 0.15);
          cak.to(oKel, { v: CAKUPAN.keluarga, duration: 0.5, ease: 'power1.out', onUpdate: () => { if (ckpRefs.current.kel) ckpRefs.current.kel.textContent = fmtID(oKel.v); } }, 0.3);

          buildIntro();

          // Animate gradient blobs — slow floating yoyo
          gsap.to(q('.s2-blob-1'), { x: 60, y: 40, duration: 12, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          gsap.to(q('.s2-blob-2'), { x: -50, y: -30, duration: 14, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          gsap.to(q('.s2-blob-3'), { x: 30, y: -50, duration: 16, ease: 'sine.inOut', yoyo: true, repeat: -1 });

          if (isDesktop) {
            const tl = gsap.timeline({
              scrollTrigger: { trigger: stage, start: 'top top', end: '+=170%', pin: true, scrub: 1.5, anticipatePin: 1 },
            });
            buildCards(tl);
            tl.to({}, { duration: 0.35 });
          } else {
            const tl = gsap.timeline({
              scrollTrigger: { trigger: q('.s2-cardswrap')[0], start: 'top 80%', once: true },
            });
            buildCards(tl);
          }

          // Choropleth map reveal
          ScrollTrigger.create({
            trigger: q('.s2-choro')[0],
            start: 'top top', end: 'bottom bottom', scrub: 1.5,
            onUpdate: (self) => { mapApiRef.current?.reveal(self.progress * 1.3); },
            onRefresh: (self) => { mapApiRef.current?.reveal(self.progress * 1.3); },
          });

          gsap.timeline({
            scrollTrigger: { trigger: q('.s2-choro')[0], start: 'top 72%', once: true },
            defaults: { ease: 'power3.out' },
          })
            .fromTo(q('.s2c-head'), { opacity: 0, y: 18, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7 })
            .fromTo(q('.s2c-legend'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 0.25);

        }
      );
    };

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(setup); });
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

  const sektorColors = ['#E67E22', '#628141', '#E5D9B6', '#FFFFFF'];

  return (
    <div ref={rootRef} style={{ background: '#15173D' }}>

      {/* Cakupan Pendataan */}
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

        <h3 style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3em' }}>
          <span className="s2-cakupan-line playfair-display" style={{
            fontStyle: 'italic', fontWeight: 500, lineHeight: 1.3,
            fontSize: 'clamp(1.6rem, 3.4vw, 2.7rem)', color: 'rgba(245,245,245,0.92)',
          }}>
            Kami menelusuri{' '}
            <span ref={(el) => { ckpRefs.current.kab = el; }} style={{ color: '#E5D9B6', fontWeight: 600 }}>0</span>
            {' '}kabupaten/kota,
          </span>
          <span className="s2-cakupan-line playfair-display" style={{
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

      {/* ── Carousel: "Bencana ini tidak berhenti di satu titik" ── */}
      <HuntaraGallery />

      {/* Stage: Bento Grid — Asymmetric layout */}
      <section ref={stageRef} className="s2-stage" style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative', zIndex: 2, background: '#15173D',
        padding: '0 clamp(1.25rem, 5vw, 3rem)',
      }}>
        {/* Animated Gradient Blobs — Reactbits-style living background */}
        <div className="s2-blob s2-blob-1" style={{
          position: 'absolute', width: '700px', height: '700px',
          borderRadius: '50%', background: '#E67E22', opacity: 0.12,
          filter: 'blur(140px)', top: '-15%', left: '-10%',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div className="s2-blob s2-blob-2" style={{
          position: 'absolute', width: '600px', height: '600px',
          borderRadius: '50%', background: '#628141', opacity: 0.10,
          filter: 'blur(140px)', bottom: '-10%', right: '-12%',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div className="s2-blob s2-blob-3" style={{
          position: 'absolute', width: '400px', height: '400px',
          borderRadius: '50%', background: '#E5D9B6', opacity: 0.06,
          filter: 'blur(120px)', top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          width: '100%', maxWidth: 1320, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 'clamp(1.6rem, 4vh, 2.6rem)', position: 'relative', zIndex: 5
        }}>
          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="s2-headline playfair-display" style={{
              fontStyle: 'italic', fontWeight: 600, textAlign: 'center', lineHeight: 1.12,
              fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', margin: 0,
              display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.32em',
            }}>
              {HEADLINE_WORDS.map((w, i) => (
                <span key={i} className="s2-mask" style={{ display: 'inline-block', overflow: 'hidden', padding: '0.08em 0.05em' }}>
                  <span className="s2-mask-inner" style={{ display: 'inline-block', color: w.color }}>
                    {w.text}
                  </span>
                </span>
              ))}
            </h2>

          </div>

          {/* Bento Grid — 2-column asymmetric per reference */}
          <div className="s2-cardswrap" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div className="s2-bento-grid">
              {/* Card 1 (Left) — Hero: Warga Terdampak — spans 2 rows */}
              <div className={`s2-bento-card s2-card-0 s2-bento-hero`} style={{
                '--accent': STAT_CARDS[1].color,
                gridColumn: '1 / 2', gridRow: '1 / 3',
                position: 'relative', minHeight: '380px',
              }}>
                <div className="s2-bento-content">
                  <span className="lato-bold" style={{ fontSize: '0.95rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(229,217,182,0.55)' }}>{STAT_CARDS[1].label}</span>
                  <div ref={el => numRefs.current[1] = el} className="playfair-display" style={{ fontSize: 'clamp(3.5rem, 7vw, 5.5rem)', fontStyle: 'italic', fontWeight: 700, color: '#E5D9B6', lineHeight: 1, margin: '0.3rem 0' }}>0</div>
                  <span className="lato-light" style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)' }}>{STAT_CARDS[1].unit}</span>
                  <p className="lato-light" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.8rem', lineHeight: 1.6, maxWidth: 280 }}>{STAT_CARDS[1].microcopy}</p>
                </div>
                {/* Maskot peeking — large */}
                <img src={maskotImg} alt="" style={{
                  position: 'absolute', bottom: -10, right: 20,
                  height: '200px', width: 'auto',
                  opacity: 0.9, zIndex: 2, pointerEvents: 'none',
                }} />
              </div>

              {/* Card 2 (Right Top Left) — Wilayah */}
              <div className={`s2-bento-card s2-card-1`} style={{ '--accent': STAT_CARDS[0].color, gridColumn: '2 / 3', gridRow: '1 / 2' }}>
                <div className="s2-bento-content">
                  <span className="lato-bold" style={{ fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(229,217,182,0.55)' }}>{STAT_CARDS[0].label}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.3rem 0' }}>
                    <div ref={el => numRefs.current[0] = el} className="playfair-display" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontStyle: 'italic', fontWeight: 700, color: '#E67E22', lineHeight: 1 }}>0</div>
                    <span className="lato-light" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)' }}>{STAT_CARDS[0].unit}</span>
                  </div>
                  <p className="lato-light" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{STAT_CARDS[0].microcopy}</p>
                </div>
              </div>

              {/* Card 3 (Right Top Right) — Rumah */}
              <div className={`s2-bento-card s2-card-2`} style={{ '--accent': STAT_CARDS[2].color, gridColumn: '3 / 4', gridRow: '1 / 2' }}>
                <div className="s2-bento-content">
                  <span className="lato-bold" style={{ fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(229,217,182,0.55)' }}>{STAT_CARDS[2].label}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.3rem 0' }}>
                    <div ref={el => numRefs.current[2] = el} className="playfair-display" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontStyle: 'italic', fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>0</div>
                    <span className="lato-light" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)' }}>{STAT_CARDS[2].unit}</span>
                  </div>
                  <p className="lato-light" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{STAT_CARDS[2].microcopy}</p>
                </div>
              </div>

              {/* Card 4 (Right Bottom) — Fasilitas Umum + Sektor breakdown */}
              <div className={`s2-bento-card s2-card-3`} style={{ '--accent': STAT_CARDS[3].color, gridColumn: '2 / 4', gridRow: '2 / 3' }}>
                <div className="s2-bento-content" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div>
                    <span className="lato-bold" style={{ fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(229,217,182,0.55)' }}>{STAT_CARDS[3].label}</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.3rem 0' }}>
                      <div ref={el => numRefs.current[3] = el} className="playfair-display" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontStyle: 'italic', fontWeight: 700, color: '#628141', lineHeight: 1 }}>0</div>
                      <span className="lato-light" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)' }}>{STAT_CARDS[3].unit}</span>
                    </div>
                    <p className="lato-light" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{STAT_CARDS[3].microcopy}</p>
                  </div>
                  {/* Sector breakdown — colorful typography */}
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {SEKTOR_DATA.map((s, idx) => (
                      <div key={s.key} className={`s2-sektor-${idx}`} style={{ textAlign: 'center' }}>
                        <div className="playfair-display" style={{ fontSize: '1.4rem', fontStyle: 'italic', fontWeight: 700, color: sektorColors[idx], lineHeight: 1 }}>{fmtID(s.value)}</div>
                        <div className="lato-light" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SVG Wave Divider — organic transition from Navy to Map */}
      <div style={{ position: 'relative', zIndex: 3, background: '#15173D', marginBottom: '-2px' }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '80px' }}>
          <path d="M0,0 L0,60 Q360,120 720,60 Q1080,0 1440,60 L1440,0 Z" fill="#15173D" />
        </svg>
      </div>
      {/* Pattern border */}
      <div style={{
        width: '100%', height: '40px',
        backgroundImage: `url(${patternImg})`, backgroundRepeat: 'repeat-x',
        backgroundSize: 'auto 100%', backgroundColor: '#15173D',
        position: 'relative', zIndex: 4,
      }} />

      {/* Choropleth Map — dark vector style */}
      <section className="s2-choro" style={{ marginTop: '-1px' }}>
        <div className="s2c-sticky">
          <ChoroplethMapbox apiRef={mapApiRef} />
          {/* Province labels appear as cinematic text during panning — no dashboard panel */}
        </div>
      </section>

      {/* Flow section removed — clean editorial end */}
    </div>
  );
}

/* ─────────────────────────────────────────
   MapboxGlobe — SMOOTH PANNING (no zoom out/in)
───────────────────────────────────────────*/
function MapboxGlobe({ phase }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const spinRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);

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

      ro = new ResizeObserver(() => { if (mapRef.current) mapRef.current.resize(); });
      ro.observe(mapContainer.current);
    } catch (err) {
      setMapError('Failed to init mapbox-gl: ' + err.message);
    }

    return () => {
      if (ro && mapContainer.current) ro.disconnect();
      if (spinRef.current) cancelAnimationFrame(spinRef.current);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      setMapReady(false);
    };
  }, []);

  /* Spin loop */
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
      return () => { spinning = false; if (spinRef.current) cancelAnimationFrame(spinRef.current); };
    } else {
      if (spinRef.current) cancelAnimationFrame(spinRef.current);
    }
  }, [phase, mapReady]);

  /* SMOOTH PANNING — Use easeTo instead of flyTo for province transitions */
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const cfg = PHASE_MAP[phase];
    if (!cfg || phase === 'spin') return;

    map.stop();

    // For province-to-province transitions, use easeTo for smooth linear panning
    const isProvince = ['aceh', 'sumut', 'sumbar'].includes(phase);
    
    if (isProvince) {
      map.easeTo({
        center: [cfg.lng, cfg.lat],
        zoom: cfg.zoom,
        pitch: cfg.pitch ?? 0,
        bearing: 0,
        duration: 2200,
        easing: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, // easeInOutQuad
        essential: true,
      });
    } else {
      map.flyTo({
        center: [cfg.lng, cfg.lat],
        zoom: cfg.zoom,
        pitch: cfg.pitch ?? 0,
        bearing: 0,
        duration: 2500,
        essential: true,
      });
    }
  }, [phase, mapReady]);

  const markerRef = useRef(null);

  /* Hotspot Marker — larger red dots */
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
    const cfg = PHASE_MAP[phase];

    if (cfg && (phase === 'aceh' || phase === 'sumut' || phase === 'sumbar')) {
      const el = document.createElement('div');
      el.className = 'custom-inversa-marker';
      el.innerHTML = `<div class="inversa-pulse"></div><div class="inversa-dot"></div>`;
      markerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([cfg.lng, cfg.lat]).addTo(map);
    }

    return () => { if (markerRef.current) markerRef.current.remove(); };
  }, [phase, mapReady]);

  return (
    <>
      {mapError && (
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 100, background: '#E67E22', color: 'white', padding: 20, borderRadius: 8, maxWidth: '80%' }}>
          <b>Mapbox Error:</b> {mapError}
        </div>
      )}
      <div ref={mapContainer} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1, filter: 'grayscale(15%) contrast(1.1)' }} />
    </>
  );
}

/* ─────────────────────────────────────────
   PhaseLabel — Province labels (no icons)
───────────────────────────────────────────*/
function PhaseLabel({ phase }) {
  if (phase === 'spin' || phase === 'done') return null;

  if (phase === 'world' || phase === 'sumatera') {
    const introText = phase === 'world'
      ? 'Di penghujung tahun, saat kehidupan berjalan seperti biasa... alam memiliki skenario berbeda.'
      : 'November 2025. Langit di atas Sumatera tak kunjung henti mencurahkan air. Tiga provinsi tenggelam dalam amarah alam. Ribuan cerita terhenti secara paksa.';

    return (
      <div key={phase} style={{
        position: 'absolute', bottom: '25%', left: '10%', zIndex: 20, pointerEvents: 'none',
        width: '700px', animation: 'fadeSlideUp 0.8s ease both'
      }}>
        <TextType text={introText} typingSpeed={30} showCursor={true} className="lato-light"
          style={{ fontSize: '1.1rem', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.9)', fontWeight: 300, lineHeight: 1.4 }}
          loop={false}
        />
      </div>
    );
  }

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

      <TextType text={narasi} typingSpeed={20} showCursor={true} className="lato-light"
        style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.9)', textShadow: '0 2px 10px rgba(0,0,0,0.9)', fontWeight: 300, lineHeight: 1.6 }}
        loop={false}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Component: BabakIntro
───────────────────────────────────────────*/
export default function BabakIntro() {
  const [phase, setPhase] = useState('spin');
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollProgressRef = useRef(0);

  const wrapperRef = useRef(null);
  const openingRef = useRef(null);
  const loadingTextRef = useRef(null);
  const cursorRef = useRef(null);
  const photoRef = useRef(null);

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
    const getJaggedPolygon = (scale) => {
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
      return `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${scaledPts.join(', ')})`;
    };

    if (openingRef.current) openingRef.current.style.clipPath = getJaggedPolygon(0);
    gsap.to(loadingTextRef.current, { opacity: 0, duration: 0.8, delay: 0.5 });

    const obj = { scale: 0 };
    gsap.to(obj, {
      scale: 15, duration: 2.5, delay: 0.8, ease: "power3.inOut",
      onUpdate: () => { if (openingRef.current) openingRef.current.style.clipPath = getJaggedPolygon(obj.scale); },
      onComplete: () => { if (openingRef.current) openingRef.current.style.display = 'none'; }
    });

    // CROSSFADE: Map blurs + fades, photo fades in simultaneously
    gsap.to(wrapperRef.current, {
      opacity: 0,
      filter: 'blur(20px)',
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: 'bottom 150%',
        end: 'bottom 100%',
        scrub: 1.5,
      }
    });
  }, []);

  useEffect(() => {
    if (cursorRef.current) gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
    const moveCursor = (e) => {
      if (cursorRef.current && scrollProgressRef.current < 0.95) {
        gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "none" });
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  // Photo crossfade entrance animation
  useEffect(() => {
    if (!photoRef.current) return;
    gsap.fromTo(photoRef.current,
      { scale: 1.15, opacity: 0, filter: 'blur(10px)' },
      {
        scale: 1, opacity: 1, filter: 'blur(0px)',
        scrollTrigger: {
          trigger: photoRef.current,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1.5,
        }
      }
    );
  }, []);

  return (
    <>
      {/* Custom Cursor */}
      <div ref={cursorRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 99999, pointerEvents: 'none',
        width: '70px', height: '70px', borderRadius: '50%', border: '1px solid rgba(229,217,182,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: scrollProgress < 0.95 ? 1 : 0, transition: 'opacity 0.3s'
      }}>
        <span className="lato-bold" style={{ fontSize: '11px', color: '#fff', letterSpacing: '2px', textTransform: 'uppercase' }}>Scroll</span>
      </div>

      {/* Opening Overlay */}
      <div ref={openingRef} style={{
        position: 'fixed', inset: 0, zIndex: 99999, background: '#0a0a0a',
        display: 'flex', alignItems: 'flex-end', padding: '40px'
      }}>
        <div ref={loadingTextRef} style={{ fontFamily: 'monospace', color: '#E5D9B6', fontSize: '14px', letterSpacing: '4px', opacity: 1 }}>
          LOADING...
        </div>
      </div>

      {/* Tactical UI Overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none',
        fontFamily: 'var(--font-content)', color: 'rgba(229,217,182,0.7)', fontSize: '11px',
        letterSpacing: '2px', textTransform: 'uppercase',
        opacity: scrollProgress < 0.95 ? 1 : 0, transition: 'opacity 0.5s ease'
      }}>
        <div style={{ position: 'absolute', top: '35px', left: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="lato-bold" style={{ fontWeight: 600, color: '#E5D9B6' }}>HASIL PENDATAAN R3P</span>
        </div>
        <Link to="/" style={{ position: 'absolute', top: '35px', right: '40px', display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit', textDecoration: 'none', pointerEvents: 'auto', cursor: 'pointer' }}>
          <span className="lato-light" style={{ fontWeight: 500 }}>BERANDA</span>
        </Link>
        <div style={{ position: 'absolute', top: '50%', right: '40px', transform: 'translateY(-50%)', height: '200px', width: '1px', background: 'rgba(229,217,182,0.15)' }}>
          <div style={{ width: '100%', background: '#E67E22', height: `${Math.min((scrollProgress / 0.85) * 100, 100)}%`, transition: 'height 0.1s linear' }} />
        </div>
      </div>

      {/* Sticky Map Wrapper */}
      <div ref={wrapperRef} style={{ height: '400vh', position: 'relative', zIndex: 10 }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', backgroundColor: 'transparent' }}>

          <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: phase === 'spin' ? 1 : 0, transition: 'opacity 1s ease' }}>
            <Particles particleCount={250} particleSpread={12} speed={0.08} particleBaseSize={80} alphaParticles={true} />
          </div>

          <div style={{ position: 'absolute', inset: 0, zIndex: 1, filter: 'sepia(40%) saturate(60%) contrast(130%) brightness(85%) hue-rotate(-10deg)' }}>
            <MapboxGlobe phase={phase} />
          </div>

          {/* Subtle grid overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.4,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

          <div style={{
            position: 'absolute', inset: 0, zIndex: 4, background: 'rgba(0,0,0,0.65)',
            pointerEvents: 'none', opacity: scrollProgress > 0.02 && scrollProgress < 0.35 ? 1 : 0,
            transition: 'opacity 0.8s ease'
          }} />

          <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(21, 23, 61, 0.8) 100%)', pointerEvents: 'none' }} />
          <PhaseLabel phase={phase} />
        </div>

        {/* Floating narrative text over sticky map */}
        <div style={{
          position: 'absolute', top: '15vh', left: '10%', right: '10%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 15, pointerEvents: 'none'
        }}>
          <ScrollReveal baseOpacity={0} enableBlur={true} baseRotation={2} blurStrength={10} wordAnimationEnd="center center" textClassName="title-text-1">
            Bencana bukan sekadar deretan angka di atas kertas laporan.
          </ScrollReveal>
        </div>

        <div style={{
          position: 'absolute', top: '75vh', left: '10%', right: '10%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 15, pointerEvents: 'none'
        }}>
          <ScrollReveal baseOpacity={0} enableBlur={true} baseRotation={2} blurStrength={8} wordAnimationEnd="center center" textClassName="title-text-2">
            Dalam sekejap, realitas ribuan nyawa berganti rupa.
          </ScrollReveal>
          <p className="lato-light" style={{ fontSize: '30px', fontWeight: 300, textAlign: 'center', color: '#E5D9B6', maxWidth: '800px', lineHeight: 'normal', textShadow: '0 2px 10px rgba(0,0,0,0.5)', margin: '0 auto' }}>
            Ini adalah rekam jejak dari mereka yang bertahan di balik puing-puing kehancuran. Mengungkap fakta di lapangan untuk sebuah upaya pemulihan yang tepat sasaran.
          </p>
        </div>
      </div>

      {/* FOTO CROSSFADE — smooth transition from map */}
      <div ref={photoRef} style={{ height: '100vh', width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#15173D', zIndex: 11 }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <img src={imgPendataan} alt="Pendataan Lapangan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(21,23,61,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
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

      <div style={{ width: '100%', height: '40px', backgroundImage: `url(${patternImg})`, backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%', backgroundColor: '#15173D', position: 'relative', zIndex: 12 }} />

      <SkalaDampakScene />
    </>
  );
}
