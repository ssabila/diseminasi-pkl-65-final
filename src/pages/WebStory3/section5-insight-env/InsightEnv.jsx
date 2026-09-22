import React, { useLayoutEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import mapboxgl from 'mapbox-gl';
import './InsightEnv.css';
import { useSharedMap } from '../MapContext';

// Import Mascot & Custom Factor Icons
import gundatala5 from '../../../assets/Grand Design/Gundatala_5.png';
import iconGunung from './assets/gunung.png';
import iconAir from './assets/air.png';
import iconHujan from './assets/hujan.png';
import iconLongsor from './assets/longsor.png';
import iconBanjir from './assets/banjir.png';

// Import Outline GeoJSON
import sumatraOutlineUrl from '../geojson-data/sumatra_outline.geojson?url';
import sumatraFillUrl from '../geojson-data/bigdata_kabupaten_combined.geojson?url';

gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   PENEMPATAN GAMBAR DI ATAS PETA (GEO-ANCHORED)
   ---------------------------------------------------------
   - lat / lng  : koordinat asli di dunia nyata.
   - anchor     : titik pada gambar (0–1) yang menancap tepat di koordinat,
                  dihitung dari ISI gambar (bukan kotak PNG):
                    gunung  → pusat dasar kerucut
                    hujan   → dasar hujan (hujan jatuh di titik lokasi)
                    lainnya → pusat bentuk
   - width      : lebar gambar (px) pada zoom REF_ZOOM. Ukuran ikut mengikuti
                  zoom peta, jadi gambar tetap menutup area geografis yang sama.
   - gunung     : lebar dihitung dari ketinggian (elevation × MOUNTAIN_PX_PER_M),
                  jadi gunung yang lebih tinggi tampil lebih besar secara proporsional.
   ========================================================= */
const REF_ZOOM = 6.4; // zoom kamera di Section 5
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const MOUNTAIN_PX_PER_M = 0.02; // 2.451 mdpl (Sinabung) → ±49px. Ubah angka ini untuk memperbesar/memperkecil SEMUA gunung.

const TYPE_STYLE = {
  gunung: { icon: iconGunung, tag: 'Gunung Api', anchor: [0.5, 0.7], ground: true },
  danau: { icon: iconAir, tag: 'Danau / DAS', anchor: [0.5, 0.54], width: 24 },
  hujan: { icon: iconHujan, tag: 'Curah Hujan Tinggi', anchor: [0.5, 0.85], width: 52, floating: true },
  longsor: { icon: iconLongsor, tag: 'Rawan Longsor', anchor: [0.5, 0.5], width: 44 },
  banjir: { icon: iconBanjir, tag: 'Rawan Banjir', anchor: [0.5, 0.5], width: 48 },
};

// Urutan array = urutan muncul saat scroll (gunung → danau → hujan → longsor → banjir)
const RAW_POINTS = [
  // ---------- GUNUNG ----------
  // Aceh
  { type: 'gunung', name: 'Gunung Seulawah Agam', region: 'Aceh Besar', lat: 5.4480, lng: 95.6580, elevation: 1810 },
  { type: 'gunung', name: 'Gunung Bur Ni Telong', region: 'Aceh Tengah', lat: 4.7690, lng: 96.8210, elevation: 2623 },
  { type: 'gunung', name: 'Gunung Peut Sague', region: 'Pidie', lat: 4.9140, lng: 96.3290, elevation: 2801 },
  { type: 'gunung', name: 'Gunung Abong-Abong', region: 'Nagan Raya / Aceh Tengah', lat: 4.2416, lng: 96.7950, elevation: 2985 },
  // Sumatera Utara
  { type: 'gunung', name: 'Gunung Sibuatan', region: 'Karo & Dairi', lat: 2.9180, lng: 98.4233, elevation: 2457 },
  { type: 'gunung', name: 'Gunung Sinabung', region: 'Karo', lat: 3.1700, lng: 98.3920, elevation: 2451 },
  { type: 'gunung', name: 'Gunung Sibayak', region: 'Karo', lat: 3.2478, lng: 98.5011, elevation: 2212 },
  { type: 'gunung', name: 'Gunung Sorik Marapi', region: 'Mandailing Natal', lat: 0.6860, lng: 99.5390, elevation: 2145 },
  { type: 'gunung', name: 'Gunung Pusuk Buhit', region: 'Samosir', lat: 2.6011, lng: 98.6547, elevation: 1982 },

  // ---------- DANAU ----------
  // Ukuran danau kecil sengaja dilebihkan sedikit agar tetap terbaca; Toba mendekati skala asli (±78 km).
  { type: 'danau', name: 'Danau Laut Tawar', region: 'Aceh Tengah', lat: 4.6119, lng: 96.9236, width: 30 },
  // ⚠ Bujur Danau Bungara belum ada di data. 97.83 hanyalah PERKIRAAN (Kec. Kota Baharu, batas utara ±97.79–97.87 BT). Ganti dengan koordinat pasti.
  { type: 'danau', name: 'Danau Bungara', region: 'Aceh Singkil', lat: 2.4930, lng: 97.8300, width: 20 },
  { type: 'danau', name: 'Danau Toba', region: 'Sumatera Utara', lat: 2.6845, lng: 98.8756, width: 84 },
  { type: 'danau', name: 'Danau Lau Kawar', region: 'Karo', lat: 3.2001, lng: 98.3844, width: 16 },
  { type: 'danau', name: 'Danau Sidihoni', region: 'Samosir', lat: 2.5639, lng: 98.7077, width: 18 },
  { type: 'danau', name: 'Danau Siais', region: 'Tapanuli Selatan', lat: 1.2721, lng: 99.0768, width: 24 },
  { type: 'danau', name: 'Danau Maninjau', region: 'Agam, Sumbar', lat: -0.3170, lng: 100.2000, width: 28 },

  // ---------- CURAH HUJAN ----------
  { type: 'hujan', name: 'Aceh Barat Daya (Blangpidie)', region: 'Aceh', lat: 3.7500, lng: 96.8500 },
  { type: 'hujan', name: 'Aceh Selatan (Tapaktuan)', region: 'Aceh', lat: 3.2580, lng: 97.1800 },
  { type: 'hujan', name: 'Aceh Jaya (Calang)', region: 'Aceh', lat: 4.6240, lng: 95.6168 },
  { type: 'hujan', name: 'Aceh Barat (Meulaboh)', region: 'Aceh', lat: 4.1450, lng: 96.1265 },
  { type: 'hujan', name: 'Tapanuli Tengah (Pandan)', region: 'Sumut', lat: 1.6881, lng: 98.8461 },
  { type: 'hujan', name: 'Kota Sibolga', region: 'Sumut', lat: 1.7433, lng: 98.7751 },
  { type: 'hujan', name: 'Kepulauan Nias (Gunungsitoli)', region: 'Sumut', lat: 1.2824, lng: 97.6156 },
  { type: 'hujan', name: 'Lereng Barat Bukit Barisan (Sopotinjak)', region: 'Mandailing Natal', lat: 0.7049, lng: 99.4988 },

  // ---------- LONGSOR ----------
  { type: 'longsor', name: 'Dataran Tinggi Gayo (Aceh Tengah)', region: 'Aceh', lat: 4.5200, lng: 96.8500 },
  { type: 'longsor', name: 'Pantan Cuaca (Gayo Lues)', region: 'Aceh', lat: 4.0811, lng: 97.2341 },
  { type: 'longsor', name: 'Lintas Medan–Berastagi (Sibolangit)', region: 'Sumut', lat: 3.3142, lng: 98.5714 },
  { type: 'longsor', name: 'Lintas Perbatasan Pangkalan', region: 'Lima Puluh Kota, Sumbar', lat: 0.0712, lng: 100.6581 },

  // ---------- BANJIR ----------
  // Aceh
  { type: 'banjir', name: 'Lhoksukon', region: 'Aceh Utara', lat: 5.0447, lng: 97.3197 },
  { type: 'banjir', name: 'Tamiang Hulu & Seruway', region: 'Aceh Tamiang', lat: 4.1611, lng: 98.0336 },
  { type: 'banjir', name: 'Singkil & Kota Baharu', region: 'Aceh Singkil', lat: 2.2858, lng: 97.7942 },
  { type: 'banjir', name: 'Lembah Alas (Kutacane)', region: 'Aceh Tenggara', lat: 3.4862, lng: 97.8105 },
  { type: 'banjir', name: 'Blangpidie & Jeumpa', region: 'Aceh Barat Daya', lat: 3.7483, lng: 96.8436 },
  // Sumatera Barat
  { type: 'banjir', name: 'Ulakan Tapakis', region: 'Padang Pariaman', lat: -0.6928, lng: 100.2076 },
  { type: 'banjir', name: 'Koto Tangah (Lubuk Buaya)', region: 'Kota Padang', lat: -0.8252, lng: 100.3421 },
  { type: 'banjir', name: 'Kuranji (Gunung Sarik)', region: 'Kota Padang', lat: -0.8988, lng: 100.4132 },
  { type: 'banjir', name: 'Hilir Batang Lembang', region: 'Solok', lat: -0.7925, lng: 100.6558 },
  { type: 'banjir', name: 'Alahan Panjang', region: 'Kabupaten Solok', lat: -1.0664, lng: 100.7761 },
  { type: 'banjir', name: 'Surantih, Sutera', region: 'Pesisir Selatan', lat: -1.4921, lng: 100.6272 },
  // Sumatera Utara
  { type: 'banjir', name: 'Tapian Nauli', region: 'Tapanuli Tengah', lat: 1.7825, lng: 98.7844 },
  { type: 'banjir', name: 'DAS Wampu (Stabat)', region: 'Langkat', lat: 3.7380, lng: 98.4116 },
  { type: 'banjir', name: 'Sungai Belawan & Deli', region: 'Kota Medan', lat: 3.5952, lng: 98.6722 },
  { type: 'banjir', name: 'Hilir DAS Asahan (Kisaran)', region: 'Asahan', lat: 2.9902, lng: 99.6242 },
  { type: 'banjir', name: 'Pesisir Teluk Sibolga', region: 'Sibolga', lat: 1.7314, lng: 98.7891 },
];

const ENV_IMAGE_POINTS = RAW_POINTS.map((p, i) => {
  const style = TYPE_STYLE[p.type];
  const width = p.type === 'gunung'
    ? Math.round(p.elevation * MOUNTAIN_PX_PER_M)
    : (p.width ?? style.width);
  return { id: `${p.type}-${i}`, title: p.name, ...style, ...p, width };
});

export default function InsightEnv() {
  const sectionRef = useRef(null);
  const { map, mapReady } = useSharedMap();
  const markersRef = useRef([]);

  // Inisialisasi Image Overlays & Outline Layer
  // Pakai useLayoutEffect (dideklarasikan SEBELUM useGSAP) supaya marker sudah
  // ada saat timeline GSAP dibuat.
  useLayoutEffect(() => {
    if (!mapReady || !map) return;

    // Bersihkan DEM kontur jika ada
    try {
      if (map.setTerrain) map.setTerrain(null);
      if (map.getLayer('hillshading')) map.removeLayer('hillshading');
    } catch (e) {
      console.warn('Map terrain reset info:', e);
    }

    // Pastikan source Sumatra Outline tersedia
    if (!map.getSource('sumatra-outline-source')) {
      map.addSource('sumatra-outline-source', {
        type: 'geojson',
        data: sumatraOutlineUrl,
        lineMetrics: true
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
          'fill-color': '#e5d9b6',
          'fill-opacity': 0
        }
      });
    }

    if (!map.getLayer('sumatra-outline-glow')) {
      map.addLayer({
        id: 'sumatra-outline-glow',
        type: 'line',
        source: 'sumatra-outline-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#e5d9b6',
          'line-width': 6,
          'line-blur': 4,
          'line-opacity': 0,
          'line-trim-offset': [0, 1]
        }
      });
    }

    if (!map.getLayer('sumatra-outline-layer')) {
      map.addLayer({
        id: 'sumatra-outline-layer',
        type: 'line',
        source: 'sumatra-outline-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#e5d9b6',
          'line-width': 2,
          'line-opacity': 0,
          'line-trim-offset': [0, 1]
        }
      });
    }

    // Buat elemen gambar lanskap di atas peta.
    //
    // Struktur DOM (tiap lapis punya satu tugas, supaya tidak saling menimpa):
    //   root  .env-terrain-feature → di-transform OLEH MAPBOX (posisi lng/lat). Jangan disentuh GSAP.
    //    └ .env-terrain-scale     → skala mengikuti zoom peta (applyZoomScale)
    //       └ .env-terrain-pop    → animasi muncul/hilang GSAP (opacity + scale)
    //          ├ .env-ground      → bayangan kontak di dasar (khusus gunung)
    //          └ img              → ukuran, titik anchor, efek hover (CSS)
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    ENV_IMAGE_POINTS.forEach((item) => {
      const [ax, ay] = item.anchor;

      const el = document.createElement('div');
      el.className = `env-terrain-feature section5-terrain-feature${item.floating ? ' env-floating' : ''}`;
      el.setAttribute('data-id', item.id);
      el.style.display = 'none'; // Awalnya disembunyikan sampai Section 5 aktif
      el.style.setProperty('--env-w', `${item.width}px`);
      el.style.setProperty('--ax', String(ax));
      el.style.setProperty('--ay', String(ay));
      // Lebih selatan = lebih di depan (kesan kedalaman pada peta miring)
      el.style.setProperty('--z', String(100 + Math.round((10 - item.lat) * 10)));

      el.innerHTML = `
        <div class="env-terrain-scale">
          <div class="env-terrain-pop">
            ${item.ground ? '<span class="env-ground"></span>' : ''}
            <img
              src="${item.icon}"
              alt="${item.title}"
              title="${item.title} — ${item.region}"
              class="env-terrain-img"
              draggable="false"
            />
          </div>
        </div>
      `;

      const scaleEl = el.querySelector('.env-terrain-scale');
      const popEl = el.querySelector('.env-terrain-pop');

      // Root 0×0 px berada persis di [lng, lat]; anchor gambar diatur lewat CSS.
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([item.lng, item.lat])
        .addTo(map);

      markersRef.current.push({ el, scaleEl, popEl, marker, id: item.id });
    });

    // Skala gambar mengikuti zoom peta → ukuran gambar terikat ke ukuran geografis
    const applyZoomScale = () => {
      const raw = Math.pow(2, map.getZoom() - REF_ZOOM);
      const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, raw));
      markersRef.current.forEach(({ scaleEl }) => {
        scaleEl.style.transform = `scale(${s})`;
      });
    };
    map.on('zoom', applyZoomScale);
    applyZoomScale();

    return () => {
      map.off('zoom', applyZoomScale);
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current = [];
    };
  }, [mapReady, map]);

  // Helper Visibilitas Image Card & Outline
  const toggleSection5Visibility = (visible) => {
    const displayVal = visible ? 'block' : 'none';

    markersRef.current.forEach(({ el }) => {
      el.style.display = displayVal;
    });

    if (map) {
      if (visible) {
        if (map.getLayer('sumatra-outline-layer')) {
          map.setPaintProperty('sumatra-outline-layer', 'line-trim-offset', [1, 1]);
          map.setPaintProperty('sumatra-outline-layer', 'line-opacity', 1);
        }
        if (map.getLayer('sumatra-outline-glow')) {
          map.setPaintProperty('sumatra-outline-glow', 'line-trim-offset', [1, 1]);
          map.setPaintProperty('sumatra-outline-glow', 'line-opacity', 0.6);
        }
        if (map.getLayer('sumatra-outline-fill')) {
          map.setPaintProperty('sumatra-outline-fill', 'fill-opacity', 0.12);
        }
      }
    }
  };

  // ScrollTrigger Animation: Pinned section + camera focus + reverse outline when leaving
  useGSAP(() => {
    if (!map || !mapReady) return;

    const s = sectionRef.current;
    const outlineProxy = { progress: 1 };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: s,
        start: 'top top',
        end: '+=140%',
        scrub: 0.8,
        pin: true,
        refreshPriority: 80,
        onEnter: () => toggleSection5Visibility(true),
        onEnterBack: () => toggleSection5Visibility(true),
        onLeave: () => {
          // Ketika meninggalkan section 5 menuju section 6, pastikan border sepenuhnya hilang
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
          toggleSection5Visibility(false);
        },
        onLeaveBack: () => {
          // Ketika scroll balik ke atas menuju Section 4
          toggleSection5Visibility(false);
        },
      },
    });

    // 1. Kamera selaras 100% dengan akhir Section 4 (posisi stabil dan konsisten tanpa jumping)
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 992;
    const initialCamera = isMobile
      ? { zoom: 4.8, lng: 98.6, lat: 1.2, pitch: 25, bearing: 0 }
      : { zoom: 6.0, lng: 99.4, lat: 2.0, pitch: 35, bearing: -14 };

    const camera = { ...initialCamera };
    const applyCamera = () => {
      map.easeTo({
        center: [camera.lng, camera.lat],
        zoom: camera.zoom,
        pitch: camera.pitch,
        bearing: camera.bearing,
        padding: { top: 0, left: 0, right: 0, bottom: 0 },
        duration: 0,
      });
    };

    // Pastikan posisi kamera konsisten saat scroll masuk ke Section 5
    tl.to(camera, {
      ...initialCamera,
      duration: 0.1,
      onUpdate: applyCamera,
    }, 0);

    // 2. Fade-in Narasi & Elemen Sidebar di awal Section 5
    tl.fromTo(s.querySelector('.insight-title'),
      { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.2 }, 0.08)
      .fromTo(s.querySelector('.insight-narrative'),
        { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.2 }, 0.15)
      .fromTo(s.querySelector('.card-insight-container'),
        { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.2 }, 0.25);

    // Staggered reveal of Map Image Cards
    // PENTING 1: yang dianimasikan adalah popEl, BUKAN el (root marker) — root dipakai Mapbox untuk posisi.
    // PENTING 2: jendela reveal dibatasi 0.32–0.60 dan dibagi rata ke semua marker. Dengan
    //            jumlah marker banyak, offset tetap per-item akan melewati akhir timeline
    //            dan merusak pemetaan scroll.
    const REVEAL_START = 0.32;
    const REVEAL_SPAN = 0.28;
    const total = markersRef.current.length;
    markersRef.current.forEach(({ popEl }, i) => {
      tl.fromTo(popEl,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.15, ease: 'back.out(1.6)' },
        REVEAL_START + (i / Math.max(total, 1)) * REVEAL_SPAN
      );
    });

    // Target camera untuk transisi halus langsung menuju awal Section 6 (InsightDamage Stage 1)
    const targetSec6Camera = isMobile
      ? { zoom: 5.0, lng: 98.6, lat: 1.5, pitch: 25, bearing: 0 }
      : { zoom: 6.2, lng: 98.2, lat: 1.8, pitch: 30, bearing: -5 };

    // 3. EXIT ANIMATION KE SECTION 6 (Mulai halus dari progress 0.60 hingga 1.00)
    // A. Kamera meluncur mulus tanpa patah ke posisi awal Section 6
    tl.to(camera, {
      ...targetSec6Camera,
      padRight: 0,
      padBottom: 0,
      duration: 0.40,
      ease: 'sine.inOut',
      onUpdate: applyCamera,
    }, 0.60);

    // B. Reverse border pulau Sumatera mundur secara elegan
    tl.to(outlineProxy, {
      progress: 0,
      duration: 0.35,
      ease: 'power1.inOut',
      onUpdate: () => {
        const offset = [outlineProxy.progress, 1];
        if (map.getLayer('sumatra-outline-layer')) {
          map.setPaintProperty('sumatra-outline-layer', 'line-trim-offset', offset);
          map.setPaintProperty('sumatra-outline-layer', 'line-opacity', outlineProxy.progress);
        }
        if (map.getLayer('sumatra-outline-glow')) {
          map.setPaintProperty('sumatra-outline-glow', 'line-trim-offset', offset);
          map.setPaintProperty('sumatra-outline-glow', 'line-opacity', outlineProxy.progress * 0.6);
        }
        if (map.getLayer('sumatra-outline-fill')) {
          map.setPaintProperty('sumatra-outline-fill', 'fill-opacity', outlineProxy.progress * 0.12);
        }
      }
    }, 0.62);

    // C. Fade out terrain popups halus sebelum keluar section
    tl.to(markersRef.current.map(({ popEl }) => popEl), {
      opacity: 0,
      scale: 0.75,
      duration: 0.28,
      ease: 'power1.in',
    }, 0.64);

    // D. Fade out narrative card Section 5 ke atas secara halus
    const cardEl = s.querySelector('.env-glass-card');
    if (cardEl) {
      tl.to(cardEl, {
        opacity: 0,
        y: -35,
        duration: 0.30,
        ease: 'power1.in',
      }, 0.65);
    }

  }, { dependencies: [map, mapReady], scope: sectionRef });

  // Smooth scroll ke section berikutnya saat prompt scroll diklik
  const handleScrollNext = () => {
    const nextSec = document.querySelector('#section6-insightdamage') || document.querySelector('#section6-insight-damage');
    if (nextSec) {
      nextSec.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight * 1.5, behavior: 'smooth' });
    }
  };

  return (
    <section ref={sectionRef} id="section5-insightenv" className="section section-insightenv">
      <div className="insight-layout">

        {/* Panel Kanan: Kartu Narasi Bersih */}
        <div className="insight-content glass-card env-glass-card">

          <h2 className="insight-title">Membaca Bahasa Alam</h2>
          <p className="insight-narrative">
            Kondisi fisik suatu wilayah memberikan informasi awal mengenai potensi kerentanan terhadap bencana.
            Topografi terjal, busur gunung api aktif, badan air, hingga dataran rendah banjir—semuanya
            saling berinteraksi membentuk lanskap risiko bencana di Pulau Sumatera.
          </p>

          {/* Actionable Insight Box dengan Maskot Gundatala 5 & Speech Bubble berisi Legend */}
          <div className="card-insight-container">
            <div className="insight-mascot-wrapper">
              <span className="mascot-question-mark mark-left" aria-hidden="true">?</span>
              <span className="mascot-question-mark mark-right" aria-hidden="true">?</span>
              <img
                src={gundatala5}
                alt="Gundatala Karakteristik Alam"
                className="insight-mascot-img"
              />
            </div>
            <div className="card-insight-speech-bubble">
              <div className="card-insight-text">
                <div className="card-legend-grid">
                  <div className="legend-item">
                    <div className="legend-icon-wrap">
                      <img src={iconGunung} alt="Gunung Api" className="legend-icon" />
                    </div>
                    <span>Gunung Api</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-icon-wrap">
                      <img src={iconHujan} alt="Curah Hujan" className="legend-icon" />
                    </div>
                    <span>Curah Hujan</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-icon-wrap">
                      <img src={iconAir} alt="Danau / DAS" className="legend-icon" />
                    </div>
                    <span>Danau</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-icon-wrap">
                      <img src={iconLongsor} alt="Rawan Longsor" className="legend-icon" />
                    </div>
                    <span>Rawan Longsor</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-icon-wrap">
                      <img src={iconBanjir} alt="Rawan Banjir" className="legend-icon" />
                    </div>
                    <span>Rawan Banjir</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}