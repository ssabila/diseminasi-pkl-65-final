import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import mapboxgl from 'mapbox-gl';
import './InsightDamage.css';

import banjirRasterData from '../geojson-data/banjir_raster_grid.geojson?url';
import titikLongsorData from '../geojson-data/titik_longsor.geojson?url';
import sumateraGeo from '../../../assets/maps/sumatera_provinsi.json';
import { useSharedMap } from '../MapContext';

gsap.registerPlugin(ScrollTrigger);

// ── 15 Titik Longsor Lengkap (Koordinat Daratan Terverifikasi Presisi) ──
const LONGSOR_POINTS = [
  // ACEH
  { id: 'aceh-1', nama: 'Longsor Aceh Tengah', kabupaten: 'Aceh Tengah', prov: 'ACEH', korban: 5, tanggal: '12 Mar 2024', severity: 'Sangat Tinggi', coord: [96.85, 4.62] },
  { id: 'aceh-2', nama: 'Longsor Aceh Selatan', kabupaten: 'Aceh Selatan', prov: 'ACEH', korban: 2, tanggal: '01 Apr 2024', severity: 'Tinggi', coord: [97.35, 3.25] },
  { id: 'aceh-3', nama: 'Longsor Pidie', kabupaten: 'Pidie', prov: 'ACEH', korban: 3, tanggal: '14 Feb 2024', severity: 'Tinggi', coord: [95.95, 5.15] },

  // SUMATERA UTARA
  { id: 'sumut-1', nama: 'Longsor Tapanuli Utara', kabupaten: 'Tapanuli Utara', prov: 'SUMATERA UTARA', korban: 8, tanggal: '20 Feb 2024', severity: 'Sangat Tinggi', coord: [98.98, 2.02] },
  { id: 'sumut-2', nama: 'Longsor Tapanuli Selatan', kabupaten: 'Tapanuli Selatan', prov: 'SUMATERA UTARA', korban: 3, tanggal: '15 Jan 2024', severity: 'Sedang', coord: [99.25, 1.48] },
  { id: 'sumut-3', nama: 'Longsor Karo', kabupaten: 'Karo', prov: 'SUMATERA UTARA', korban: 1, tanggal: '17 Apr 2024', severity: 'Sedang', coord: [98.50, 3.12] },
  { id: 'sumut-4', nama: 'Longsor Dairi', kabupaten: 'Dairi', prov: 'SUMATERA UTARA', korban: 7, tanggal: '05 Mar 2024', severity: 'Tinggi', coord: [98.30, 2.75] },
  { id: 'sumut-5', nama: 'Longsor Langkat', kabupaten: 'Langkat', prov: 'SUMATERA UTARA', korban: 9, tanggal: '22 Mar 2024', severity: 'Sangat Tinggi', coord: [98.35, 3.75] },
  { id: 'sumut-6', nama: 'Longsor Mandailing Natal', kabupaten: 'Mandailing Natal', prov: 'SUMATERA UTARA', korban: 11, tanggal: '20 Jan 2024', severity: 'Sangat Tinggi', coord: [99.56, 0.86] },

  // SUMATERA BARAT
  { id: 'sumbar-1', nama: 'Longsor Padang Pariaman', kabupaten: 'Padang Pariaman', prov: 'SUMATERA BARAT', korban: 12, tanggal: '28 Mar 2024', severity: 'Sangat Tinggi', coord: [100.20, -0.58] },
  { id: 'sumbar-2', nama: 'Longsor Agam', kabupaten: 'Agam', prov: 'SUMATERA BARAT', korban: 6, tanggal: '02 Mei 2024', severity: 'Galodo Marapi', coord: [100.30, -0.25] },
  { id: 'sumbar-3', nama: 'Longsor Solok', kabupaten: 'Solok', prov: 'SUMATERA BARAT', korban: 4, tanggal: '08 Mei 2024', severity: 'Tinggi', coord: [100.65, -0.80] },
  { id: 'sumbar-4', nama: 'Longsor Pasaman Barat', kabupaten: 'Pasaman Barat', prov: 'SUMATERA BARAT', korban: 15, tanggal: '30 Jan 2024', severity: 'Sangat Kritis', coord: [99.85, 0.15] },
  { id: 'sumbar-5', nama: 'Longsor Sijunjung', kabupaten: 'Sijunjung', prov: 'SUMATERA BARAT', korban: 2, tanggal: '08 Apr 2024', severity: 'Sedang', coord: [100.95, -0.70] },
  { id: 'sumbar-6', nama: 'Longsor Solok Selatan', kabupaten: 'Solok Selatan', prov: 'SUMATERA BARAT', korban: 6, tanggal: '28 Feb 2024', severity: 'Tinggi', coord: [101.25, -1.45] },
];

const TARGET_PROVS = {
  'ACEH': 1,
  'SUMATERA UTARA': 1,
  'SUMATERA BARAT': 1,
};

const SUMATERA_FC = {
  type: 'FeatureCollection',
  features: sumateraGeo.provinces.map((p) => ({
    type: 'Feature',
    properties: {
      name: p.name,
      target: TARGET_PROVS[p.name] ?? 0,
    },
    geometry: { type: 'MultiPolygon', coordinates: p.rings.map((r) => [r]) },
  })),
};

// ── 5 Tahapan Scrollytelling ──
const STORY_STAGES = [
  {
    step: 1,
    tag: 'MODUL 3 • DETEKSI DAMPAK BENCANA',
    title: 'Sebaran Banjir & Titik Longsor',
    narrative:
      'Bencana meninggalkan jejak yang dapat diamati. Area terdampak banjir dan persebaran longsor dapat diidentifikasi untuk memahami kondisi wilayah secara lebih menyeluruh melalui analisis citra satelit multimoda.',
    statLabel: 'Data Teridentifikasi',
    statValue: '15 Titik Longsor Kritis',
    statSub: '300.000+ Piksel Banjir Terpetakan',
    badge: '🛰️ Modul 3 · Citra Satelit',
    activeProv: '',
    camera: { lng: 98.2, lat: 1.8, zoom: 6.2, pitch: 30, bearing: -5 },
  },
  {
    step: 2,
    tag: 'TAHAP 2 • SEBERAPA LUAS DAMPAKNYA?',
    title: 'Estimasi Luasan & Koridor Rawan',
    narrative:
      'Menggunakan citra radar SAR Sentinel-1 dan sensor optik resolusi tinggi, estimasi luasan genangan banjir di dataran rendah pesisir serta runtuhan tebing sepanjang lereng Bukit Barisan dipetakan secara presisi.',
    statLabel: 'Cakupan Deteksi Satelit',
    statValue: '300.000+ Piksel',
    statSub: 'Genangan & Runtuhan Terdeteksi',
    badge: '📡 Sentinel-1 & Landsat-8',
    activeProv: '',
    camera: { lng: 98.0, lat: 2.3, zoom: 6.5, pitch: 35, bearing: -8 },
  },
  {
    step: 3,
    tag: 'TAHAP 3 • HOTSPOT PROVINSI ACEH',
    title: 'Aceh: Guguran Tebing Dataran Gayo',
    narrative:
      'Kelerengan terjal dataran tinggi Gayo di Aceh Tengah dan wilayah Aceh Selatan mencatat tingkat bahaya longsor tertinggi (skor 45.97). Lebih dari 255.000 piksel genangan dan runtuhan tebing memutus jalan lintas vital.',
    statLabel: 'Skor Bahaya Longsor',
    statValue: '45.97 (Sangat Tinggi)',
    statSub: '255.208 Piksel Terindikasi',
    badge: '📍 Aceh Tengah & Selatan',
    activeProv: 'ACEH',
    camera: { lng: 96.6, lat: 4.5, zoom: 7.7, pitch: 42, bearing: -10 },
  },
  {
    step: 4,
    tag: 'TAHAP 4 • HOTSPOT SUMATERA UTARA',
    title: 'Sumut: Koridor Sesar Aktif Semangko',
    narrative:
      'Struktur tanah vulkanis gembur pada kemiringan lereng ekstrem di sekitar Danau Toba dan koridor sesar patahan aktif Semangko (Tapanuli Utara & Karo) runtuh saat jenuh air hujan, mengisolasi desa-desa pedalaman.',
    statLabel: 'Akses Logistik Terisolir',
    statValue: '98.420 Piksel',
    statSub: 'Zona Kerentanan Sesar Semangko',
    badge: '📍 Tapanuli Utara & Karo',
    activeProv: 'SUMATERA UTARA',
    camera: { lng: 98.4, lat: 2.8, zoom: 7.7, pitch: 44, bearing: -10 },
  },
  {
    step: 5,
    tag: 'TAHAP 5 • HOTSPOT SUMATERA BARAT',
    title: 'Sumbar: Banjir Lahar Dingin (Galodo)',
    narrative:
      'Kawasan Lembah Anai dan lereng Gunung Marapi di Kabupaten Agam diterjang banjir lahar dingin (galodo) bercampur material bebatuan vulkanis besar yang menghancurkan badan jalan nasional antarprovinsi.',
    statLabel: 'Dampak Kerusakan Wilayah',
    statValue: '142.150 Piksel',
    statSub: 'Jalan Nasional Lembah Anai Rusak',
    badge: '📍 Agam & Lembah Anai',
    activeProv: 'SUMATERA BARAT',
    camera: { lng: 100.2, lat: -0.6, zoom: 7.8, pitch: 45, bearing: 6 },
  },
];

// Helper: linear interpolation
function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default function InsightDamage() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const { map, mapReady } = useSharedMap();
  const [layersAdded, setLayersAdded] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const markersRef = useRef([]);
  const floodAnimRef = useRef(null); // rAF id for slow-motion raster flood wave

  // ── 1. Setup Layer Mapbox & Pulsing HTML Markers ──
  useEffect(() => {
    if (!mapReady || !map) return;

    // A. Batas Wilayah Sumatera (GeoJSON Polygon)
    if (!map.getSource('sumatera-provinsi-src')) {
      map.addSource('sumatera-provinsi-src', {
        type: 'geojson',
        data: SUMATERA_FC,
      });
    }

    if (!map.getLayer('sumatera-provinsi-fill')) {
      map.addLayer({
        id: 'sumatera-provinsi-fill',
        type: 'fill',
        source: 'sumatera-provinsi-src',
        paint: {
          'fill-color': 'rgba(245, 158, 11, 0.28)',
          'fill-opacity': 0,
        },
      });
    }

    if (!map.getLayer('sumatera-provinsi-line')) {
      map.addLayer({
        id: 'sumatera-provinsi-line',
        type: 'line',
        source: 'sumatera-provinsi-src',
        paint: {
          'line-color': '#f59e0b',
          'line-width': 1.6,
          'line-opacity': 0,
        },
      });
    }

    // B. Sumber Data Raster Banjir & Titik Longsor
    if (!map.getSource('banjir-raster-source')) {
      map.addSource('banjir-raster-source', {
        type: 'geojson',
        data: banjirRasterData,
      });
    }

    if (!map.getSource('longsor-source')) {
      map.addSource('longsor-source', {
        type: 'geojson',
        data: titikLongsorData,
      });
    }

    // C. Layer Raster Banjir Satelit Multimoda (Glow, Fill Pixel, dan Grid Line)
    if (!map.getLayer('banjir-raster-glow')) {
      map.addLayer({
        id: 'banjir-raster-glow',
        type: 'fill',
        source: 'banjir-raster-source',
        paint: {
          'fill-color': '#0284c7',
          'fill-opacity': 0,
        },
      });
    }

    if (!map.getLayer('banjir-raster-fill')) {
      map.addLayer({
        id: 'banjir-raster-fill',
        type: 'fill',
        source: 'banjir-raster-source',
        paint: {
          'fill-color': [
            'interpolate', ['linear'], ['get', 'depth_m'],
            0.5, 'rgba(56, 189, 248, 0.60)', // pinggiran dangkal (cyan cerah)
            1.8, 'rgba(14, 165, 233, 0.80)', // genangan sedang (biru laut cerah)
            3.2, 'rgba(2, 132, 199, 0.95)',  // banjir dalam (biru pekat)
          ],
          'fill-opacity': 0,
          'fill-antialias': true,
        },
      });
    }

    if (!map.getLayer('banjir-raster-line')) {
      map.addLayer({
        id: 'banjir-raster-line',
        type: 'line',
        source: 'banjir-raster-source',
        paint: {
          'line-color': '#7dd3fc',
          'line-width': 0.75,
          'line-opacity': 0,
        },
      });
    }

    // D. Layer Titik Longsor Mapbox Circle (Halo & Core Glow)
    if (!map.getLayer('longsor-glow')) {
      map.addLayer({
        id: 'longsor-glow',
        type: 'circle',
        source: 'longsor-source',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            5, 18,
            8, 28,
            12, 44
          ],
          'circle-color': '#ef4444',
          'circle-opacity': 0,
          'circle-blur': 0.65,
        },
      });
    }

    if (!map.getLayer('longsor-layer')) {
      map.addLayer({
        id: 'longsor-layer',
        type: 'circle',
        source: 'longsor-source',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            5, 7,
            8, 10,
            12, 14
          ],
          'circle-color': '#ef4444',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0,
          'circle-stroke-opacity': 0,
        },
      });
    }

    // E. Buat 15 HTML Markers dengan Arsitektur Anchor Terisolasi
    // Root element (anchor) tidak diberi CSS transform agar proyeksi Mapbox tidak rusak!
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    LONGSOR_POINTS.forEach((pt) => {
      const anchor = document.createElement('div');
      anchor.className = 'longsor-marker-anchor';
      anchor.dataset.prov = pt.prov;
      anchor.style.display = 'none';

      anchor.innerHTML = `
        <div class="longsor-marker-body">
          <div class="longsor-ping-ring"></div>
          <div class="longsor-ping-ring secondary"></div>
          <div class="longsor-core-dot">
            <span class="longsor-icon">⚠️</span>
          </div>
          <div class="longsor-badge-tag">${pt.kabupaten}</div>
          <div class="longsor-popup-card">
            <div class="popup-title">${pt.nama}</div>
            <div class="popup-row"><span>📅 Tanggal:</span> <b>${pt.tanggal}</b></div>
            <div class="popup-row"><span>🚨 Korban:</span> <b>${pt.korban} jiwa</b></div>
            <div class="popup-row"><span>⚡ Bahaya:</span> <span class="badge-sev">${pt.severity}</span></div>
          </div>
        </div>
      `;

      anchor.addEventListener('click', (e) => {
        e.stopPropagation();
        map.flyTo({
          center: pt.coord,
          zoom: 8.8,
          pitch: 45,
          bearing: -10,
          duration: 1200,
          essential: true,
        });
      });

      const marker = new mapboxgl.Marker({ element: anchor, anchor: 'center' })
        .setLngLat(pt.coord)
        .addTo(map);

      markersRef.current.push(marker);
    });

    setLayersAdded(true);

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (floodAnimRef.current) cancelAnimationFrame(floodAnimRef.current);
    };
  }, [mapReady, map]);

  // ── Slow-motion raster flood wave animation ──
  // Raster cells expand outward from river channels in continuous slow-motion
  const startFloodPulse = useCallback(() => {
    if (!map || floodAnimRef.current) return;

    let t = 0;
    function pulse() {
      t += 0.007; // ultra-smooth slow motion
      // Sine wave between 0.35 and 1.0 representing water inundating outward
      const waveFront = 0.4 + 0.6 * (Math.sin(t * 1.5) * 0.5 + 0.5);
      const pulseGlow = 0.25 + 0.15 * Math.sin(t * 2);

      if (map.getLayer('banjir-raster-fill')) {
        try {
          // Dynamic slow-motion flood expansion filter:
          // Shows raster cells that the flood wave has reached!
          map.setFilter('banjir-raster-fill', ['<=', ['get', 'wave_order'], waveFront]);
          map.setFilter('banjir-raster-line', ['<=', ['get', 'wave_order'], waveFront]);

          const baseOp = map.getPaintProperty('banjir-raster-glow', 'fill-opacity') ?? 0;
          if (baseOp > 0) {
            map.setPaintProperty('banjir-raster-glow', 'fill-opacity', pulseGlow);
          }
        } catch (e) { /* ignore */ }
      }

      floodAnimRef.current = requestAnimationFrame(pulse);
    }
    pulse();
  }, [map]);

  const stopFloodPulse = useCallback(() => {
    if (floodAnimRef.current) {
      cancelAnimationFrame(floodAnimRef.current);
      floodAnimRef.current = null;
    }
  }, []);

  // ── Helper: reveal flood raster progressively based on scroll progress ──
  const updateFloodReveal = useCallback((progress) => {
    if (!map) return;
    const eased = Math.min(1, Math.max(0, progress * 2));
    const fillOp = 0.85 * (eased * eased * (3 - 2 * eased));
    const lineOp = 0.65 * (eased * eased * (3 - 2 * eased));

    if (map.getLayer('banjir-raster-fill')) {
      map.setPaintProperty('banjir-raster-fill', 'fill-opacity', fillOp);
    }
    if (map.getLayer('banjir-raster-line')) {
      map.setPaintProperty('banjir-raster-line', 'line-opacity', lineOp);
    }
    if (map.getLayer('banjir-raster-glow')) {
      map.setPaintProperty('banjir-raster-glow', 'fill-opacity', fillOp * 0.35);
    }
  }, [map]);

  // ── 2. Smooth Camera + Card transitions ──
  const applyStageVisuals = useCallback(
    (stageIndex, stageProgress = 0) => {
      if (!map || !layersAdded) return;
      const stage = STORY_STAGES[stageIndex];
      if (!stage) return;

      setCurrentStageIndex(stageIndex);

      // Smooth camera interpolation between current and next stage
      const nextStage = STORY_STAGES[Math.min(stageIndex + 1, STORY_STAGES.length - 1)];
      const cam = stage.camera;
      const nextCam = nextStage.camera;

      const interpLng = lerp(cam.lng, nextCam.lng, stageProgress);
      const interpLat = lerp(cam.lat, nextCam.lat, stageProgress);
      const interpZoom = lerp(cam.zoom, nextCam.zoom, stageProgress);
      const interpPitch = lerp(cam.pitch, nextCam.pitch, stageProgress);
      const interpBearing = lerp(cam.bearing, nextCam.bearing, stageProgress);

      map.easeTo({
        center: [interpLng, interpLat],
        zoom: interpZoom,
        pitch: interpPitch,
        bearing: interpBearing,
        duration: 0, // instant when scrubbed by scroll
        essential: true,
      });

      // Province boundary highlight
      if (map.getLayer('sumatera-provinsi-fill')) {
        map.setPaintProperty('sumatera-provinsi-fill', 'fill-color', [
          'case',
          ['==', ['get', 'name'], stage.activeProv],
          'rgba(245, 158, 11, 0.35)',
          ['==', ['get', 'target'], 1],
          'rgba(229, 217, 182, 0.08)',
          'rgba(0,0,0,0)',
        ]);
        map.setPaintProperty(
          'sumatera-provinsi-fill',
          'fill-opacity',
          stage.activeProv ? 1 : 0.4
        );
        map.setPaintProperty('sumatera-provinsi-line', 'line-opacity', 0.8);
      }

      if (map.getLayer('sumatera-provinsi-line')) {
        map.setPaintProperty('sumatera-provinsi-line', 'line-color', [
          'case',
          ['==', ['get', 'name'], stage.activeProv],
          '#f59e0b',
          ['==', ['get', 'target'], 1],
          '#E5D9B6',
          'rgba(255, 255, 255, 0.25)',
        ]);
        map.setPaintProperty('sumatera-provinsi-line', 'line-width', [
          'case',
          ['==', ['get', 'name'], stage.activeProv],
          2.6,
          ['==', ['get', 'target'], 1],
          1.5,
          0.6,
        ]);
      }

      // Flood raster styling based on active province
      if (map.getLayer('banjir-raster-fill')) {
        if (stage.activeProv) {
          map.setPaintProperty('banjir-raster-fill', 'fill-color', [
            'case',
            ['==', ['get', 'prov'], stage.activeProv],
            [
              'interpolate', ['linear'], ['get', 'depth_m'],
              0.5, 'rgba(56, 189, 248, 0.75)',
              1.8, 'rgba(14, 165, 233, 0.90)',
              3.2, 'rgba(2, 132, 199, 1.0)',
            ],
            'rgba(14, 165, 233, 0.18)'
          ]);
        } else {
          map.setPaintProperty('banjir-raster-fill', 'fill-color', [
            'interpolate', ['linear'], ['get', 'depth_m'],
            0.5, 'rgba(56, 189, 248, 0.60)',
            1.8, 'rgba(14, 165, 233, 0.80)',
            3.2, 'rgba(2, 132, 199, 0.95)',
          ]);
        }
      }

      // Longsor circles opacity
      if (map.getLayer('longsor-layer')) {
        map.setPaintProperty('longsor-layer', 'circle-opacity', 1.0);
        map.setPaintProperty('longsor-layer', 'circle-stroke-opacity', 1.0);
        map.setPaintProperty('longsor-glow', 'circle-opacity', 0.55);
      }

      // HTML markers: filter by province with smooth opacity and scale on body
      markersRef.current.forEach((m) => {
        const anchor = m.getElement();
        if (anchor) {
          anchor.style.display = 'block';
          const body = anchor.querySelector('.longsor-marker-body');
          if (body) {
            if (stage.activeProv && anchor.dataset.prov !== stage.activeProv) {
              body.style.opacity = '0.2';
              body.style.transform = 'translate(-50%, -50%) scale(0.65)';
            } else {
              body.style.opacity = '1';
              body.style.transform = 'translate(-50%, -50%) scale(1)';
            }
          }
        }
      });
    },
    [map, layersAdded]
  );

  // Smooth stage change when user clicks a dot or button
  const handleStageSelect = useCallback((stageIdx) => {
    const stage = STORY_STAGES[stageIdx];
    if (!stage || !map) return;
    setCurrentStageIndex(stageIdx);

    map.flyTo({
      center: [stage.camera.lng, stage.camera.lat],
      zoom: stage.camera.zoom,
      pitch: stage.camera.pitch,
      bearing: stage.camera.bearing,
      duration: 1200,
      essential: true,
    });

    applyStageVisuals(stageIdx, 0);
  }, [map, applyStageVisuals]);

  // ── 3. ScrollTrigger Scrollytelling ──
  useGSAP(() => {
    if (!layersAdded || !map) return;

    const s = sectionRef.current;
    const card = cardRef.current;

    ScrollTrigger.create({
      trigger: s,
      start: 'top top',
      end: '+=500%',
      pin: true,
      scrub: 0.3,
      refreshPriority: 60,
      onUpdate: (self) => {
        const progress = self.progress;

        const stageCount = STORY_STAGES.length;
        const rawIdx = progress * stageCount;
        const idx = Math.min(Math.floor(rawIdx), stageCount - 1);
        const stageProgress = rawIdx - idx;

        applyStageVisuals(idx, Math.min(stageProgress, 0.99));
        updateFloodReveal(progress);
      },
      onEnter: () => {
        markersRef.current.forEach((m) => {
          if (m.getElement()) m.getElement().style.display = 'block';
        });
        applyStageVisuals(0, 0);
        updateFloodReveal(0);
        startFloodPulse();

        if (card) {
          gsap.fromTo(card, 
            { opacity: 0, x: 60, pointerEvents: 'none' }, 
            { opacity: 1, x: 0, pointerEvents: 'auto', duration: 0.8, ease: 'power2.out' }
          );
        }
      },
      onEnterBack: () => {
        markersRef.current.forEach((m) => {
          if (m.getElement()) m.getElement().style.display = 'block';
        });
        startFloodPulse();
        if (card) gsap.to(card, { opacity: 1, x: 0, pointerEvents: 'auto', duration: 0.5 });
      },
      onLeave: () => {
        hideAllLayers();
        stopFloodPulse();
        if (card) gsap.to(card, { opacity: 0, x: 60, pointerEvents: 'none', duration: 0.4 });
      },
      onLeaveBack: () => {
        hideAllLayers();
        stopFloodPulse();
        if (card) gsap.to(card, { opacity: 0, x: -60, pointerEvents: 'none', duration: 0.4 });
      },
    });
  }, [layersAdded, map, applyStageVisuals, updateFloodReveal, startFloodPulse, stopFloodPulse]);

  // ── Helper: hide all layers when leaving section ──
  const hideAllLayers = useCallback(() => {
    if (!map) return;

    markersRef.current.forEach((m) => {
      if (m.getElement()) m.getElement().style.display = 'none';
    });

    if (map.getLayer('banjir-raster-fill')) {
      map.setPaintProperty('banjir-raster-fill', 'fill-opacity', 0);
    }
    if (map.getLayer('banjir-raster-line')) {
      map.setPaintProperty('banjir-raster-line', 'line-opacity', 0);
    }
    if (map.getLayer('banjir-raster-glow')) {
      map.setPaintProperty('banjir-raster-glow', 'fill-opacity', 0);
    }

    if (map.getLayer('longsor-layer')) {
      map.setPaintProperty('longsor-layer', 'circle-opacity', 0);
      map.setPaintProperty('longsor-layer', 'circle-stroke-opacity', 0);
      map.setPaintProperty('longsor-glow', 'circle-opacity', 0);
    }

    if (map.getLayer('sumatera-provinsi-fill')) {
      map.setPaintProperty('sumatera-provinsi-fill', 'fill-opacity', 0);
      map.setPaintProperty('sumatera-provinsi-line', 'line-opacity', 0);
    }
  }, [map]);

  const currentStage = STORY_STAGES[currentStageIndex];

  return (
    <section
      ref={sectionRef}
      id="section6-insightdamage"
      className="section section-insightdamage"
    >
      {/* ── Ambient Vignette ── */}
      <div className="dmg-vignette" />

      {/* ── HUD Section Label (top-left) ── */}
      <div className="dmg-section-hud">
        <span className="dmg-hud-label">Modul 3 · Deteksi Dampak</span>
        <span className="dmg-hud-title">Seberapa Luas Dampaknya?</span>
        <span className="dmg-hud-sub">Citra Satelit SAR &amp; Optik · Pulau Sumatera</span>
      </div>

      {/* ── Legend Pills (top-center) ── */}
      <div className="dmg-legend">
        <div className="legend-pill">
          <span className="legend-dot banjir" />
          Raster Genangan Banjir (SAR)
        </div>
        <div className="legend-pill">
          <span className="legend-dot longsor" />
          Titik Longsor (15 Lokasi)
        </div>
      </div>

      {/* ── RIGHT-SIDE Glassmorphism Card ── */}
      <div className="dmg-card" ref={cardRef}>
        {/* Top Bar: step tag + badge */}
        <div className="dmg-topbar">
          <span className="dmg-step-tag">{currentStage.tag}</span>
          <span className="dmg-badge">{currentStage.badge}</span>
        </div>

        {/* Gradient Title */}
        <h2 className="dmg-title" key={`title-${currentStageIndex}`}>{currentStage.title}</h2>

        {/* Narrative */}
        <p className="dmg-narrative" key={`narr-${currentStageIndex}`}>{currentStage.narrative}</p>

        {/* Quick Hotspot Filter Buttons (Smooth Camera FlyTo) */}
        <div className="dmg-filters">
          <button
            type="button"
            className={`dmg-filter-btn ${currentStageIndex <= 1 ? 'active' : ''}`}
            onClick={() => handleStageSelect(0)}
          >
            <span className="dmg-filter-name">Semua</span>
            <span className="dmg-filter-count">15 Titik</span>
          </button>
          <button
            type="button"
            className={`dmg-filter-btn ${currentStageIndex === 2 ? 'active' : ''}`}
            onClick={() => handleStageSelect(2)}
          >
            <span className="dmg-filter-name">Aceh</span>
            <span className="dmg-filter-count">3 Titik</span>
          </button>
          <button
            type="button"
            className={`dmg-filter-btn ${currentStageIndex === 3 ? 'active' : ''}`}
            onClick={() => handleStageSelect(3)}
          >
            <span className="dmg-filter-name">Sumut</span>
            <span className="dmg-filter-count">6 Titik</span>
          </button>
          <button
            type="button"
            className={`dmg-filter-btn ${currentStageIndex === 4 ? 'active' : ''}`}
            onClick={() => handleStageSelect(4)}
          >
            <span className="dmg-filter-name">Sumbar</span>
            <span className="dmg-filter-count">6 Titik</span>
          </button>
        </div>

        {/* Stat Highlight Box */}
        <div className="dmg-stat-box">
          <div className="dmg-stat-header">
            <span className="dmg-stat-label">{currentStage.statLabel}</span>
            <span className="dmg-stat-sub">{currentStage.statSub}</span>
          </div>
          <div className="dmg-stat-value">{currentStage.statValue}</div>
        </div>

        <div className="dmg-divider" />

        {/* Footer: step dots + scroll hint */}
        <div className="dmg-footer">
          <div className="dmg-dots">
            {STORY_STAGES.map((st, i) => (
              <button
                key={st.step}
                type="button"
                className={`dmg-dot ${i === currentStageIndex ? 'active' : ''}`}
                onClick={() => handleStageSelect(i)}
                title={st.title}
              >
                <span>{st.step}</span>
              </button>
            ))}
          </div>
          <span className="dmg-scroll-hint">Scroll ↓</span>
        </div>
      </div>
    </section>
  );
}
