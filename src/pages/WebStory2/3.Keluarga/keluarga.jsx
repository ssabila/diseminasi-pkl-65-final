/**
 * keluarga.jsx — Babak 3: Keluarga
 *
 * Scene 1: Sudut Desa — "Detail Hingga Sudut Desa: Kehilangan Tempat Bernaung"
 * Kartu kabupaten dengan % kerusakan bangunan (fokus rumah, bukan fasilitas)
 *
 * Scene 2: Potret Hunian Narasi — "Rumah yang Masih Berdiri, Kehidupan yang Belum Pulih"
 * Split bar status bangunan + kartu kondisi (air, listrik, sanitasi, KRT perempuan)
 *
 * Scene 3: Potret Hunian Visual — "Bertahan di Titik Nadir Keterbatasan"
 * Status hunian sementara (Huntara/Fasum/Pengungsian) dari rumah_tangga.status_hunian
 *
 * Scene 4: Individu & Keluarga — "Kondisi Individu & Keluarga"
 * Donut kelompok umur, donut bantuan, keluhan kesehatan, kelompok rentan
 *
 * Transisi 3→4: "Ada Kehilangan yang Tak Bisa Dibangun Kembali"
 * Full-screen gelap, angka besar, narasi singkat emosional
 *
 * Data: insight.json → keluarga, individu, kebutuhan, rumah_tangga
 */

import React, { useEffect, useRef, useState } from 'react';
import insights from '../insight.json';
import {
  MapContainer,
  GeoJSON,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import imgAir from '../../../assets/images/huntara-03.webp';
import imgListrik from '../../../assets/images/huntara-08.webp';
import imgSanitasi from '../../../assets/images/huntara-11.webp';
import imgAset from '../../../assets/images/huntara-14.webp';
import imgTekstur from '../../../assets/images/huntara-05.webp';
import maskotAktif from '../../../assets/Grand Design/Gundatala_1.png';
import maskotDiam from '../../../assets/Grand Design/Gundatala_2.png';

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import desaData from "../scene1_desa_terdampak.json";
import useInView from "../shared/useInView";
import BarTrack from "../shared/BarTrack";
import BgSeam from "../shared/BgSeam";
import { SUMATERA_FC } from "../shared/sumateraGeo";
import { WS2 } from "../ws2-tokens";
import {
  pctRT, fmtPct, fmtN, CAPTION_RT, CAPTION_RANK,
  BANGUNAN_MASIH, BANGUNAN_PERLU_PERBAIKAN, BANGUNAN_HILANG_TOTAL,
  AIR_TAK_LAYAK, LISTRIK_NON_PLN, MCK_TIDAK_ADA,
} from "../shared/rtStats";

/* ─────────────────────────────────────────
   Utility: IntersectionObserver hook
───────────────────────────────────────────*/

/* ─────────────────────────────────────────
   Donut Chart — pure SVG
───────────────────────────────────────────*/
function DonutChart({ segments, size = 180, thickness = 36, title }) {
  const total = segments.reduce((s, seg) => s + (seg.value || 0), 0);
  if (!total) return (
    <div style={{ textAlign: 'center', color: 'var(--ws2-text-4)', fontSize: '0.85rem' }}>
      Menunggu data…
    </div>
  );

  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Sudut awal tiap segmen dihitung dari akumulasi sebelumnya, bukan dengan
  // memutasi variabel di luar map (React Compiler menolak reassign saat render).
  const offsets = segments.reduce((acc, seg) => {
    acc.push(acc[acc.length - 1] + seg.value / total);
    return acc;
  }, [0]);
  // Versi pie lama memperlihatkan cincin selebar thickness/2; nilai ini
  // menjaga tampilannya tetap sama setelah pindah ke stroke.
  const ringWidth = thickness / 2;
  const rRing = r - thickness / 4;
  const kelilingRing = 2 * Math.PI * rRing;

  const paths = segments.map((seg, idx) => {
    const fraction = seg.value / total;
    const startAngle = -Math.PI / 2 + offsets[idx] * 2 * Math.PI;
    const endAngle   = startAngle + fraction * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = fraction > 0.5 ? 1 : 0;
    return {
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: seg.color,
      label: seg.label,
      value: seg.value,
      pct: (fraction * 100).toFixed(1),
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      {title && (
        <div style={{
          fontFamily: "'Lato', sans-serif", fontWeight: 700,
          fontSize: '0.78rem', letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'var(--ws2-text-3)',
          marginBottom: '0.2rem',
        }}>
          {title}
        </div>
      )}
      {/* Cincin digambar sebagai stroke, bukan pie + lingkaran penutup.
          Dulu penutupnya di-hardcode #0a0b1f — warna yang tidak sama dengan
          permukaan kartu, sehingga lubang donut terbaca sebagai piringan
          gelap yang mengambang. Sekarang lubangnya transparan dan otomatis
          mengikuti permukaan apa pun di belakangnya. */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths.map((p, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={rRing}
            fill="none"
            stroke={p.color}
            strokeWidth={ringWidth}
            strokeDasharray={`${(p.value / total) * kelilingRing} ${kelilingRing}`}
            strokeDashoffset={-offsets[i] * kelilingRing}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
        {paths.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: p.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.78rem', color: 'var(--ws2-text-2)', flex: 1 }}>
              {p.label}
            </span>
            <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: '0.78rem', color: p.color }}>
              {p.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Utility Component: Map Instance Collector
───────────────────────────────────────────*/
function MapController({ setMap }) {
  const map = useMap();
  useEffect(() => {
    if (map) setMap(map);
  }, [map, setMap]);
  return null;
}

/* ─────────────────────────────────────────
   Scene 1: Detail Hingga Sudut Desa (Zoom)
───────────────────────────────────────────*/
const SUMATRA_CENTER = [-0.5, 102.5];
const INITIAL_ZOOM = 6.5;
const LNG_OFFSET = 0.08;

function SceneSudutDesa() {
  const [map, setMap] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [activeProvIndex, setActiveProvIndex] = useState(0); 
  
  const trackRef = useRef(null); 
  const quote1Ref = useRef(null);
  const quote2Ref = useRef(null);
  const textLineRefs = useRef([]);

  // KOREKSI GLOBAL DATA JSON
  const dataDesaKoreksi = React.useMemo(() => {
    return desaData.map((d) => {
      if (d.provinsi === "SUMATERA BARAT" && d.desa === "Pasie Laweh Lubuak Aluang") {
        return { ...d, lat: -0.5900, lng: 100.2900 }; 
      }
      return d;
    });
  }, []);

  const provinsiStory = React.useMemo(() => {
    return [
      "ACEH",
      "SUMATERA UTARA",
      "SUMATERA BARAT",
    ].map((provinsi) => {
      return dataDesaKoreksi
        .filter((d) => d.provinsi === provinsi)
        .sort((a, b) => b.persen_rusak - a.persen_rusak)[0];
    });
  }, [dataDesaKoreksi]);

  const labelProvinsi = [
    { nama: "ACEH", lat: 4.2256, lng: 96.8294 },
    { nama: "SUMATERA<br/>UTARA", lat: 2.1154, lng: 99.5451 },
    { nama: "SUMATERA<br/>BARAT", lat: -0.7390, lng: 100.8000 }
  ];


  /* Dulu urutannya 6,5 -> 12 -> 6,5 -> 12 -> 6,5 -> 12: setiap kali selesai
     dengan satu provinsi kamera ditarik mundur ke seluruh Sumatera, lalu
     menukik lagi. Itulah "zoom in terus zoom out" yang dikeluhkan.

     Sekarang zoom dikunci di satu nilai sepanjang ketiga provinsi, dan step
     jembatan tidak lagi menarik kamera mundur — justru di situlah kamera
     MENGGESER ke provinsi berikutnya, sementara teks jembatan muncul.
     Kamera meluncur turun menyusuri Sumatera dalam satu gerakan.

     CAM_ZOOM 9,5 (bukan 11): pada 11, jarak Sumut -> Sumbar sekitar 4.400 px
     sehingga gesernya terbaca sebagai blur, bukan perjalanan. */
  const CAM_ZOOM = 9.5;

  const stepsData = React.useMemo(() => {
    const desa = (i) => [provinsiStory[i].lat, provinsiStory[i].lng + LNG_OFFSET];
    return [
      { id: "#intro-step", target: SUMATRA_CENTER, zoom: INITIAL_ZOOM, type: "intro" },
      { id: "#aceh-step", target: desa(0), zoom: CAM_ZOOM, type: "desa", provIndex: 0, duration: 2.4 },
      { id: "#bridge-1-step", target: desa(1), zoom: CAM_ZOOM, type: "bridge", duration: 3.2 },
      { id: "#sumut-step", target: desa(1), zoom: CAM_ZOOM, type: "desa", provIndex: 1, duration: 0.6 },
      { id: "#bridge-2-step", target: desa(2), zoom: CAM_ZOOM, type: "bridge", duration: 3.6 },
      { id: "#sumbar-step", target: desa(2), zoom: CAM_ZOOM, type: "desa", provIndex: 2, duration: 0.6 },
    ];
  }, [provinsiStory]);

  // ==========================================
  // ANIMASI OPENING & SCROLL "FILM STRIP"
  // ==========================================
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo([quote1Ref.current, quote2Ref.current],
      { opacity: 0, scale: 0.5 },
      { opacity: 0.15, scale: 1, duration: 1.5, ease: "power3.out" } 
    )
    .fromTo(textLineRefs.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.3, ease: "power2.out" },
      "-=1"
    );

    const strip = gsap.to(trackRef.current, {
      x: "-100vw",
      ease: "none",
      scrollTrigger: {
        trigger: "#slide-step",
        start: "top top",
        end: "bottom top",
        scrub: 1.5
      }
    });

    return () => {
      tl.kill();
      strip.scrollTrigger?.kill();
      strip.kill();
    };
  }, []);

  // ==========================================
  // ANIMASI KAMERA PETA & TRIGGER SCROLL
  // ==========================================
  useEffect(() => {
    if (!map) return undefined;

    const gerakKamera = (step) => {
      try {
        // Leaflet menghitung jalur kamera dari ukuran container. Bila container
        // belum punya tinggi (sticky wrapper sesaat setelah mount), pembagiannya
        // menghasilkan NaN dan Leaflet melempar "Invalid LatLng object".
        if (!map._loaded) return;
        const size = map.getSize();
        if (!size || size.x === 0 || size.y === 0) return;
        if (!Number.isFinite(step.target[0]) || !Number.isFinite(step.target[1])) return;
        const zoomSekarang = map.getZoom();
        if (!Number.isFinite(zoomSekarang)) return;

        if (Math.abs(zoomSekarang - step.zoom) > 0.01) {
          // Hanya di sini zoom benar-benar berubah (overview -> provinsi pertama).
          map.flyTo(step.target, step.zoom, { animate: true, duration: 2.2 });
          return;
        }

        // Zoom sama: WAJIB panTo. flyTo Leaflet selalu melengkung — kamera
        // naik dulu lalu turun — meski zoom awal dan akhir identik.
        map.panTo(step.target, {
          animate: true,
          duration: step.duration ?? 2.6,
          easeLinearity: 0.25,
        });
      } catch {
        // Leaflet sesekali melempar saat pane belum terposisi; abaikan,
        // step berikutnya akan mengoreksi posisi kamera.
      }
    };

    // Simpan trigger milik sendiri. Dulu cleanup memanggil
    // ScrollTrigger.getAll().kill(), yang membunuh SELURUH trigger halaman —
    // termasuk progress bar, pergantian warna latar, dan pin di Babak 1.
    const triggers = stepsData.map((s, index) => ScrollTrigger.create({
      trigger: s.id,
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        setStepIndex(index);
        if (s.type === "desa") setActiveProvIndex(s.provIndex);
        gerakKamera(s);
      },
      onEnterBack: () => {
        setStepIndex(index);
        if (s.type === "desa") setActiveProvIndex(s.provIndex);
        gerakKamera(s);
      },
    }));

    return () => triggers.forEach((t) => t.kill());
  }, [map, stepsData]);

  const currentStep = stepsData[stepIndex] || stepsData[0];
  const isBridge = currentStep.type === "bridge";
  const isIntro = currentStep.type === "intro";

  /* Titik lokasi diganti maskot Gundatala. Yang aktif memakai Gundatala_1
     (tangan terangkat, seolah menunjuk desanya), yang diam memakai
     Gundatala_2 dan diredupkan supaya tidak ikut berebut perhatian.

     Maskot berdiri DI ATAS satu titik kecil dan bayangan elips; tanpa itu
     posisinya jadi ambigu — sebuah gambar tidak menunjuk koordinat setegas
     sebuah titik. */
  const createCustomIcon = (isActive) => {
    const w = isActive ? 52 : 36;
    const h = isActive ? 74 : 52;
    const src = isActive ? maskotAktif : maskotDiam;
    const htmlString = `
      <div class="maskot-pin ${isActive ? 'maskot-pin--aktif' : ''}" style="width:${w}px;height:${h}px;">
        ${isActive ? '<div class="maskot-radar"></div>' : ''}
        <img src="${src}" alt="" style="width:${w}px;height:${h - 10}px;object-fit:contain;object-position:50% 100%;display:block;" />
        <div class="maskot-bayangan"></div>
        <div class="maskot-titik"></div>
      </div>
    `;
    return L.divIcon({
      className: "transparent-div-icon",
      html: htmlString,
      iconSize: [w, h],
      iconAnchor: [w / 2, h],
      popupAnchor: [0, -h],
    });
  };

  const createLabelIcon = (nama) => {
    return L.divIcon({ className: "transparent-div-icon", html: `<div class="province-label-text">${nama}</div>`, iconSize: [120, 40], iconAnchor: [60, 20] });
  };

  return (
    <>
      <section className="sudut-desa" style={{ position: "relative", background: "transparent", minHeight: "700vh" }}>
        
        <div style={{ position: "sticky", top: 0, height: "100vh", width: "100vw", overflow: "hidden" }}>
          
          <style>{`
            .sudut-desa .leaflet-tile-pane {
              filter: saturate(0.65) brightness(0.7) contrast(1.2);
            }
            .sudut-desa .leaflet-container {
              background: var(--ws2-bg-navy);
            }
            .transparent-div-icon { background: transparent; border: none; }
            .province-label-text {
              color: rgba(229, 217, 182, 0.6);
              font-family: 'Playfair Display', serif;
              font-size: 0.95rem; font-style: italic; font-weight: 700;
              letter-spacing: 0.25em; text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
              pointer-events: none; text-align: center; line-height: 1.3;
            }
            .maskot-pin {
              position: relative;
              display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
              transition: transform 0.35s ease, filter 0.35s ease;
              filter: drop-shadow(0 4px 8px rgba(10, 12, 30, 0.55));
            }
            .maskot-pin img { opacity: 0.72; transition: opacity 0.35s ease; }
            .maskot-pin--aktif { z-index: 1000 !important; }
            .maskot-pin--aktif img { opacity: 1; }
            .maskot-bayangan {
              position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
              width: 70%; height: 7px; border-radius: 50%;
              background: radial-gradient(ellipse, rgba(10,12,30,0.55), transparent 70%);
              pointer-events: none;
            }
            .maskot-titik {
              position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
              width: 7px; height: 7px; border-radius: 50%;
              background: #E67E22; border: 1.5px solid #E5D9B6;
              box-shadow: 0 0 10px 2px rgba(230,126,34,0.7);
              pointer-events: none; z-index: 3;
            }
            .maskot-radar {
              position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
              width: 72px; height: 72px; border-radius: 50%;
              border: 2px solid rgba(230,126,34,0.9);
              animation: radarPulse 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
              pointer-events: none;
            }
            @keyframes radarPulse {
              0% { transform: translateX(-50%) scale(0.1); opacity: 1; border-width: 3px; }
              100% { transform: translateX(-50%) scale(1.5); opacity: 0; border-width: 0px; }
            }
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            /* Animasi Mengetik Teks Bridge Menggunakan Clip-Path */
            @keyframes typingBridge {
              0%   { clip-path: inset(0 100% 0 0); opacity: 1; }
              100% { clip-path: inset(0 0 0 0); opacity: 1; }
            }
          `}</style>

          <div ref={trackRef} style={{ display: "flex", width: "200vw", height: "100vh", position: "relative" }}>
            
            {/* ====================================================
                PANEL 1: OPENING (Lebar 100vw)
                ==================================================== */}
            <div style={{ 
              width: "100vw", height: "100vh", 
              background: "linear-gradient(to right, #15173D 0%, #15173D 100%)", 
              display: "flex", justifyContent: "center", alignItems: "center", 
              position: "relative", zIndex: 50 
            }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "80vw", height: "80vw", background: "radial-gradient(circle, rgba(229,217,182,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 2, maxWidth: "1000px", textAlign: "center", padding: "0 2rem" }}>
                <div ref={quote1Ref} style={{ fontSize: "8rem", lineHeight: 0.5, textAlign: "left", fontFamily: "'Playfair Display', serif", color: "#E5D9B6" }}>“</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 2.5vw, 3.2rem)", fontStyle: "italic", fontWeight: 500, color: "#E5D9B6", lineHeight: 1.3, margin: "1.5rem auto", maxWidth: "850px" }}>
                  <div ref={el => textLineRefs.current[0] = el}>Dari tingkat desa hingga provinsi, setiap angka</div>
                  <div ref={el => textLineRefs.current[1] = el} style={{ color: "#E67E22", fontSize: "1.05em", margin: "0.5rem 0 1rem" }}>adalah cerminan ruang hidup yang terdampak.</div>
                  <div ref={el => textLineRefs.current[2] = el}>Kami memetakan agregasi wilayah untuk</div>
                  <div ref={el => textLineRefs.current[3] = el}>memastikan tidak ada jengkal tanah</div>
                  <div ref={el => textLineRefs.current[4] = el} style={{ color: "#E67E22", fontSize: "1.05em", marginTop: "0.5rem" }}>yang terlewatkan dalam rencana pemulihan.</div>
                </h2>
                <div ref={quote2Ref} style={{ fontSize: "8rem", lineHeight: 0.5, textAlign: "right", fontFamily: "'Playfair Display', serif", color: "#E5D9B6" }}>”</div>
              </div>
            </div>

            {/* ====================================================
                PANEL 2: PETA (Lebar 100vw)
                ==================================================== */}
            <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#15173D" }}>
              
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "20vw", background: "linear-gradient(to right, #15173D 0%, transparent 100%)", zIndex: 996, pointerEvents: "none" }} />

              <MapContainer
                center={[-0.5, 102.5]} zoom={6.5} zoomSnap={0}         
                zoomControl={false} scrollWheelZoom={false} dragging={false} doubleClickZoom={false} touchZoom={false}
                style={{ width: "100%", height: "100%", background: "#15173D", zIndex: 1 }}
              >
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                <MapController setMap={setMap} />
                
                {/* Poligon provinsi. Tiga provinsi target diberi isian oranye
                    sangat tipis supaya areanya terbaca tanpa mendominasi;
                    provinsi lain hanya garis konteks. */}
                <GeoJSON
                  data={SUMATERA_FC}
                  interactive={false}
                  style={(f) => (f.properties.target
                    ? { color: 'var(--ws2-text-4)', weight: 1.2, fillColor: WS2.accent, fillOpacity: 0.06 }
                    : { color: 'var(--ws2-line-2)', weight: 0.8, fill: false })}
                />

                {labelProvinsi.map((prov, idx) => (
                  <Marker key={`label-${idx}`} position={[prov.lat, prov.lng]} icon={createLabelIcon(prov.nama)} interactive={false} />
                ))}

                {provinsiStory.map((desa, idx) => {
                  if (!desa) return null;
                  const penandaAktif = !isBridge && currentStep.type === "desa" && currentStep.provIndex === idx;
                  return (
                    <Marker key={`pin-${idx}`} position={[desa.lat, desa.lng]} icon={createCustomIcon(penandaAktif)}>
                      <Popup><strong>{desa.desa}</strong><br />{desa.kecamatan}, {desa.kabupaten}<br />{desa.persen_rusak}% Rumah Terdampak</Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* OVERLAY BRIDGE (RADIAL BLUR & TEKS PUTIH DRAMATIS) */}
              <div style={{
                position: "absolute", inset: 0,
                pointerEvents: "none", zIndex: 998,
                display: "flex", justifyContent: "center", alignItems: "center"
              }}>
                <div style={{
                  padding: "6rem 12rem",
                  display: "flex", justifyContent: "center", alignItems: "center",
                  background: isBridge ? "radial-gradient(ellipse, rgba(21,23,61,0.7) 0%, transparent 70%)" : "transparent",
                  backdropFilter: isBridge ? "blur(12px)" : "blur(0px)",
                  WebkitBackdropFilter: isBridge ? "blur(12px)" : "blur(0px)",
                  maskImage: "radial-gradient(ellipse, black 40%, transparent 70%)",
                  WebkitMaskImage: "radial-gradient(ellipse, black 40%, transparent 70%)",
                  opacity: isBridge ? 1 : 0,
                  transition: "all 1s ease", 
                }}>
                  {/* Animasi Ketik (Typewriter) saat Bridge Aktif */}
                  <h2 
                    key={`bridge-text-${stepIndex}`} // Memaksa animasi reset setiap kali step berpindah
                    style={{
                      fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                      fontSize: "clamp(2rem, 4vw, 3.5rem)", 
                      color: "#FFFFFF",
                      textAlign: "center", 
                      textShadow: "0 4px 12px rgba(0,0,0,0.9)",
                      opacity: isBridge ? 1 : 0,
                      // Animasi clip-path berjalan jika isBridge true, memotong dari 100% (hilang) ke 0% (muncul huruf-perhuruf)
                      clipPath: "inset(0 100% 0 0)",
                      animation: isBridge ? "typingBridge 3.5s steps(45, end) 1s forwards" : "none",
                      transition: isBridge ? "none" : "opacity 0.4s ease"
                    }}
                  >
                    "Cerita serupa juga terjadi di provinsi lain."
                  </h2>
                </div>
              </div>

              {/* GRADIENT KANAN (Hanya muncul saat bukan bridge) */}
              <div style={{ 
                position: "absolute", right: 0, top: 0, bottom: 0, width: "60vw", 
                background: "linear-gradient(to left, rgba(21,23,61,0.98) 0%, rgba(21,23,61,0.85) 50%, transparent 100%)", 
                opacity: isBridge ? 0 : 1, transition: "opacity 1s ease",
                pointerEvents: "none", zIndex: 997 
              }} />

              {/* PANEL NARASI */}
              <div style={{ 
                position: "absolute", right: "8%", top: "50%", transform: "translateY(-50%)", 
                width: "450px", zIndex: 1000,
                opacity: isBridge ? 0 : 1, transition: "opacity 0.8s ease" 
              }}>
                {isIntro ? (
                  <div style={{ animation: "fadeInUp 0.6s ease forwards" }}>
                    <div style={{ color: "#E67E22", letterSpacing: ".25em", textTransform: "uppercase", fontSize: ".85rem", marginBottom: "1rem", fontFamily: "Lato", fontWeight: 700 }}>
                      Garis Depan Dampak Bencana
                    </div>
                    <h2 style={{ color: "#E5D9B6", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2.8rem", lineHeight: 1.2, marginBottom: "1.5rem" }}>
                      Detail Hingga Sudut Desa: Kehilangan Tempat Bernaung
                    </h2>
                    <p style={{ color: "rgba(255,255,255,.75)", lineHeight: 1.9, fontSize: "1.05rem", fontFamily: "Lato", fontWeight: 300 }}>
                      "Dari level provinsi, mari melihat lebih dekat. Titik-titik ini adalah cerminan atap yang runtuh dan dinding yang rubuh di kawasan paling rentan."
                    </p>
                  </div>
                ) : (
                  <div key={activeProvIndex} style={{ animation: "fadeInUp 0.6s ease forwards" }}>
                    <div style={{ color: "#E67E22", letterSpacing: ".25em", textTransform: "uppercase", fontSize: ".85rem", marginBottom: "1rem", fontFamily: "Lato", fontWeight: 700 }}>
                      {provinsiStory[activeProvIndex]?.provinsi}
                    </div>
                    <h2 style={{ color: "#E5D9B6", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "3rem", lineHeight: 1.1, marginBottom: "1rem" }}>
                      {provinsiStory[activeProvIndex]?.desa}
                    </h2>
                    <p style={{ color: "rgba(255,255,255,.85)", lineHeight: 1.9, fontSize: "1.05rem", fontFamily: "Lato", fontWeight: 300 }}>
                      Kamera membawa kita menyusuri koordinat kehancuran. Di Desa <strong>{provinsiStory[activeProvIndex]?.desa}</strong>, 
                      Kecamatan {provinsiStory[activeProvIndex]?.kecamatan}, ruang hidup komunal terancam parah. Sebanyak <strong>{provinsiStory[activeProvIndex]?.persen_rusak}%</strong> rumah warga tercatat hancur atau tidak lagi aman untuk dijadikan tempat bernaung.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* SCROLL TRIGGER ANCHORS (7 Buah) */}
        <div style={{ position: "relative", zIndex: -1, marginTop: "-100vh" }}>
          <div id="slide-step" style={{ height: "100vh" }} /> 
          <div id="intro-step" style={{ height: "100vh" }} />
          <div id="aceh-step" style={{ height: "100vh" }} />
          <div id="bridge-1-step" style={{ height: "100vh" }} />
          <div id="sumut-step" style={{ height: "100vh" }} />
          <div id="bridge-2-step" style={{ height: "100vh" }} />
          <div id="sumbar-step" style={{ height: "100vh" }} />
        </div>
        
      </section>
    </>
  );
}

/* ─────────────────────────────────────────
   Utility Component: Animasi Hitung Angka Cepat
───────────────────────────────────────────*/
function AnimatedCounter({ target, duration = 1.5, visible }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      // Animasi melambat di akhir (easeOutExpo) agar terlihat dramatis
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * target));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration, visible]);

  return <>{count.toLocaleString('id-ID')}</>;
}

/* ─────────────────────────────────────────
   Scene 2: Potret Hunian Narasi
   "Rumah yang Masih Berdiri, Kehidupan yang Belum Pulih"
───────────────────────────────────────────*/
/* ── Kartu kondisi hunian ────────────────────────────────────────────────
   Meta dipindah ke konstanta modul supaya identitasnya stabil; dulu array
   ini dibangun ulang setiap render sehingga gsap.context ikut dibongkar-
   pasang berkali-kali.

   Foto dipilih agar menjelaskan angkanya, bukan sekadar hiasan:
   huntara-03 dua anak menyeberangi sungai berbatu (air permukaan),
   huntara-08 tenda pengungsian dengan satu lampu (listrik),
   huntara-11 jemuran di rumah berlumpur (sanitasi),
   huntara-14 rumah kayu masih berdiri terkubur sedimen (aset rumah). */
const HUNIAN_CARDS = [
  {
    key: 'air',
    label: 'Sumber Air Tak Layak',
    desc: 'Mengandalkan sumur tak terlindung, mata air tak terlindung, air permukaan, atau air hujan.',
    image: imgAir,
    objectPosition: 'center 58%',
  },
  {
    key: 'listrik',
    label: 'Tanpa Listrik PLN',
    desc: 'Bergantung pada listrik non-PLN, atau sama sekali tidak memiliki penerangan listrik.',
    image: imgListrik,
    objectPosition: 'center 62%',
  },
  {
    key: 'sanitasi',
    label: 'Tanpa MCK Sama Sekali',
    desc: 'Tidak memiliki fasilitas buang air sendiri maupun bersama, membuat kelompok rentan terancam wabah.',
    image: imgSanitasi,
    objectPosition: 'center 55%',
  },
  {
    key: 'aset',
    label: 'Kehilangan Kepemilikan Lahan',
    desc: 'Rumah tangga yang memiliki lahan turun dari 90,7% sebelum bencana menjadi 81,8% sesudahnya.',
    image: imgAset,
    objectPosition: 'center 45%',
  },
];

function ScenePotretHunianNarasi() {
  const [ref, visible] = useInView(0.2);
  const containerRef = useRef(null);

  /* Semua angka lewat rtStats. Field `pct` bawaan JSON dihitung dari 115.462
     RT TERDAFTAR, padahal yang benar-benar diwawancarai 50.887. Dulu blok ini
     juga membaca `sumber_air_minum` dan `sumber_penerangan_utama` — dua kunci
     yang tidak ada di insight.json — sehingga "Krisis Air Bersih 0,0%" dan
     "Tanpa Listrik 0,00%" benar-benar tercetak di halaman. */
  const pctMasih = pctRT(BANGUNAN_MASIH);
  const pctRusak = pctRT(BANGUNAN_PERLU_PERBAIKAN);
  const pctHilang = pctRT(BANGUNAN_HILANG_TOTAL);
  const totalEvaluasi = BANGUNAN_MASIH + BANGUNAN_PERLU_PERBAIKAN + BANGUNAN_HILANG_TOTAL;

  /* Kartu keempat dulu berbunyi "KRT Perempuan — N/A" karena datanya memang
     tidak ada. Diganti kepemilikan lahan, yang terdata dan tidak mengulang
     angka split bar di kolom kiri. Ini SELISIH POIN PERSEN antara sebelum dan
     sesudah bencana, bukan porsi rumah tangga — labelnya dibedakan supaya
     tidak terbaca sebagai persentase yang sejenis dengan tiga kartu lain. */
  const lahan = insights?.rumah_tangga?.kepemilikan_aset_perbandingan_bencana?.lahan || {};
  const lahanSebelum = lahan.pct_memiliki_sebelum_bencana ?? 0;
  const lahanSesudah = lahan.pct_memiliki_sesudah_bencana ?? 0;
  const kehilanganLahan = Math.max(0, lahanSebelum - lahanSesudah);

  const nilai = {
    air: { pct: pctRT(AIR_TAK_LAYAK), n: AIR_TAK_LAYAK },
    listrik: { pct: pctRT(LISTRIK_NON_PLN), n: LISTRIK_NON_PLN },
    sanitasi: { pct: pctRT(MCK_TIDAK_ADA), n: MCK_TIDAK_ADA },
    aset: { pct: kehilanganLahan, n: null, satuan: ' poin persen' },
  };

  /* Reveal gambar: tirai naik (clip-path) + teks fade-up. toggleActions,
     bukan scrub — dan scrub:false ditulis eksplisit supaya tidak bergantung
     pada ScrollTrigger.defaults global yang sudah dihapus. */
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const blocks = gsap.utils.toArray('.hunian-block', containerRef.current);
      blocks.forEach((el) => {
        const fig = el.querySelector('.hunian-figure img');
        const txt = el.querySelector('.hunian-text');

        if (fig) {
          gsap.fromTo(fig,
            { clipPath: 'inset(0 0 100% 0)', scale: 1.04 },
            {
              clipPath: 'inset(0 0 0% 0)',
              scale: 1,
              duration: 1.1,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 78%', scrub: false, toggleActions: 'play none none reverse' },
            });
        }
        if (txt) {
          gsap.fromTo(txt,
            { opacity: 0, y: 36 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 72%', scrub: false, toggleActions: 'play none none reverse' },
            });
        }
      });
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.hunian-figure img, .hunian-text', { clipPath: 'none', opacity: 1, y: 0, scale: 1 });
    });

    return () => mm.revert();
  }, { scope: containerRef, dependencies: [] });

  return (
    <section ref={containerRef} style={{
      position: 'relative',
      background: 'transparent',
      minHeight: '100vh',
      display: 'flex',
      zIndex: 10,
    }}>
      <div className="hunian-grid">

        {/* KOLOM KIRI (STICKY) */}
        <div className="hunian-kiri">
          <div ref={ref} className="hunian-sticky">
            <div style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1.5s ease, transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(2.5rem, 4.5vw, 4.2rem)',
                lineHeight: 1.15,
                marginBottom: '1.5rem',
              }}>
                <span style={{ color: 'var(--ws2-text-1)' }}>Rumah yang Masih Berdiri,</span><br />
                <span style={{ color: 'var(--ws2-accent)' }}>Kehidupan yang Belum Pulih</span>
              </h2>

              <p className="lato-light" style={{
                fontSize: '1.15rem',
                lineHeight: 1.8,
                color: 'var(--ws2-text-2)',
                maxWidth: 540,
                marginBottom: '4rem',
              }}>
                Dinding yang tersisa bukan berarti penderitaan telah usai. Satu dari tiga
                rumah tangga menempati bangunan yang terdampak dan masih menunggu perbaikan,
                sementara layanan dasar di sekitarnya belum sepenuhnya kembali.
              </p>
            </div>

            {/* SPLIT BAR BANGUNAN */}
            <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 0.3s' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem',
              }}>
                <div className="lato-bold" style={{
                  fontSize: '0.85rem',
                  color: 'var(--ws2-text-1)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}>
                  Kondisi Bangunan Terdampak
                </div>
                <div className="lato-light" style={{ fontSize: '0.85rem', color: 'var(--ws2-text-3)' }}>
                  Total dievaluasi:
                  <span style={{ color: 'var(--ws2-hero)', fontWeight: 700, fontSize: '1rem', margin: '0 0.3rem' }}>
                    <AnimatedCounter target={totalEvaluasi} duration={1.2} visible={visible} />
                  </span>
                  rumah tangga
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <BarTrack
                  surface="navy"
                  visible={visible}
                  height={10}
                  segments={[
                    { key: 'masih', pct: pctMasih, tone: 'neutral' },
                    { key: 'rusak', pct: pctRusak, tone: 'accent-2' },
                    { key: 'hilang', pct: pctHilang, tone: 'accent' },
                  ]}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { pct: pctMasih, tone: 'var(--ws2-sev-1)', outline: true, label: 'Masih ada (utuh / tidak perlu perbaikan)', n: BANGUNAN_MASIH },
                  { pct: pctRusak, tone: 'var(--ws2-sev-3)', outline: false, label: 'Terdampak, perlu perbaikan', n: BANGUNAN_PERLU_PERBAIKAN },
                  { pct: pctHilang, tone: 'var(--ws2-sev-4)', outline: false, label: 'Rusak total / hilang', n: BANGUNAN_HILANG_TOTAL },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span className="ws2-swatch" style={{
                      background: item.tone,
                      boxShadow: item.outline ? 'inset 0 0 0 1px var(--ws2-sev-1-line)' : 'none',
                    }} />
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
                      <div className="lato-bold" style={{ fontSize: '1rem', color: 'var(--ws2-text-1)' }}>
                        {fmtPct(item.pct)}%
                        <span style={{ fontWeight: 300, color: 'var(--ws2-text-4)', marginLeft: '4px' }}>({fmtN(item.n)})</span>
                      </div>
                      <div className="lato-light" style={{ fontSize: '0.85rem', color: 'var(--ws2-text-3)' }}>
                        {item.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="lato-light" style={{
                marginTop: '1.4rem', fontSize: '0.72rem',
                color: 'var(--ws2-text-4)', lineHeight: 1.6, maxWidth: 460,
              }}>
                {CAPTION_RT}
              </p>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN — foto memenuhi setengah layar sampai tepi kanan,
            teks menumpang di atasnya. Supaya teks tidak "mati" tertelan foto:
            tiga lapis perlakuan — foto diredupkan & didesaturasi, lalu scrim
            gradien navy dari bawah, lalu pelat kaca tipis di belakang teks.
            Kaca di sini sah karena benar-benar ada gambar hidup di belakangnya. */}
        <div className="hunian-kanan">
          {HUNIAN_CARDS.map((card) => (
            <article key={card.key} className="hunian-block">
              <figure className="hunian-figure">
                <img
                  src={card.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: card.objectPosition }}
                />
                <div aria-hidden="true" className="hunian-scrim" />
              </figure>

              <div className="hunian-text">
                <div className="playfair-display" style={{
                  fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                  color: card.key === 'aset' ? 'var(--ws2-accent)' : 'var(--ws2-text-1)',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  lineHeight: 1,
                  marginBottom: '0.6rem',
                }}>
                  {fmtPct(nilai[card.key].pct)}
                  <span style={{ fontSize: '0.34em', fontStyle: 'normal', marginLeft: '0.15em' }}>
                    {nilai[card.key].satuan ?? '%'}
                  </span>
                </div>
                <div className="lato-bold" style={{
                  fontSize: '0.85rem',
                  color: 'var(--ws2-text-1)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}>
                  {card.label}
                </div>
                {nilai[card.key].n !== null && (
                  <div className="lato-light" style={{ fontSize: '0.85rem', color: 'var(--ws2-text-2)', marginBottom: '0.6rem' }}>
                    {fmtN(nilai[card.key].n)} rumah tangga
                  </div>
                )}
                <div className="lato-light" style={{ fontSize: '0.95rem', color: 'var(--ws2-text-2)', lineHeight: 1.6 }}>
                  {card.desc}
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>

      <style>{`
        .hunian-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          position: relative;
          z-index: 2;
          /* WAJIB stretch. Dengan align-items:start kolom kiri menciut
             setinggi isinya, sehingga position:sticky di dalamnya hanya punya
             ruang jelajah beberapa ratus piksel — teksnya langsung terlepas
             dan hanyut, padahal kolom kanan masih ~400vh lagi. */
          align-items: stretch;
        }
        /* Kolom kiri tetap sejajar container 1320px; kolom kanan sengaja
           dibiarkan menempel tepi kanan layar. */
        .hunian-kiri {
          padding: 0 clamp(2rem, 4vw, 4rem) 0 max(1.5rem, calc((100vw - 1320px) / 2));
          position: relative;
        }
        /* Kotak sticky dibuat setinggi viewport dan isinya dipusatkan. Kalau
           tingginya mengikuti isi (742px), ia terlepas 742px sebelum kolom
           kanan habis — teks kiri sudah hanyut padahal foto terakhir masih
           di layar. Dengan 100vh, pelepasannya jatuh tepat di ujung kolom. */
        .hunian-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4vh 0;
        }
        .hunian-kanan { padding: 12vh 0 12vh 0; }

        .hunian-block {
          position: relative;
          min-height: 86vh;
          display: flex;
          align-items: flex-end;
          margin-bottom: 14vh;
          overflow: hidden;
          border-radius: var(--ws2-r-md) 0 0 var(--ws2-r-md);
        }
        .hunian-block:last-child { margin-bottom: 0; }

        .hunian-figure {
          position: absolute;
          inset: 0;
          margin: 0;
          overflow: hidden;
          background: var(--ws2-bg-navy);
        }
        .hunian-figure img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          /* Foto diredupkan supaya teks di atasnya tetap menang. */
          filter: grayscale(0.6) contrast(0.9) brightness(0.55);
          will-change: clip-path;
        }
        .hunian-scrim {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(to top, rgba(21,23,61,0.94) 0%, rgba(21,23,61,0.55) 38%, rgba(21,23,61,0.12) 72%),
            linear-gradient(to right, rgba(21,23,61,0.75) 0%, transparent 45%);
        }

        .hunian-text {
          position: relative;
          z-index: 2;
          margin: 0 clamp(1.5rem, 3vw, 3rem) clamp(2rem, 4vw, 3.5rem);
          max-width: 460px;
          padding: clamp(1.25rem, 2vw, 1.75rem);
          border-radius: var(--ws2-r-md);
          background: rgba(21, 23, 61, 0.42);
          border: 1px solid var(--ws2-line-1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        @media (max-width: 860px) {
          .hunian-grid { grid-template-columns: 1fr; }
          .hunian-kiri { padding: 4rem 1.25rem 3rem; }
          .hunian-kanan { padding: 0 0 4rem; }
          /* Di satu kolom, sticky tidak relevan lagi — dan tinggi 100vh akan
             menyisakan kotak kosong setinggi layar. */
          .hunian-grid .hunian-sticky {
            position: relative !important;
            top: 0 !important;
            height: auto !important;
            padding: 0 !important;
          }
          .hunian-block {
            min-height: 70vh;
            margin-bottom: 8vh;
            border-radius: 0;
          }
          .hunian-text { max-width: none; }
        }
      `}</style>
    </section>
  );
}


/* Empat kategori hunian sementara. Warna dijatah dari palet: oranye hanya
   untuk Huntara (kategori yang paling dirujuk narasi), sisanya krem/hijau. */
const STATUS_HUNIAN_TARGET = [
  { key: '3. Pengungsian', label: 'Pengungsian', color: 'var(--ws2-text-1)' },
  { key: '4. Rumah Tumpangan', label: 'Rumah Tumpangan', color: 'var(--ws2-text-3)' },
  { key: '6. Huntara', label: 'Huntara', color: 'var(--ws2-accent)' },
  { key: '5. Fasilitas Umum', label: 'Fasilitas Umum', color: 'var(--ws2-green)' },
];

function ScenePotretHunianVisual() {
  const [ref, visible] = useInView(0.15);

  const statusHunian = insights?.rumah_tangga?.status_hunian || {};

  /* Lebar bar dulu memakai `pct` langsung dari JSON, yaitu porsi dari SELURUH
     115.462 RT terdaftar: 1,53% / 0,81% / 0,25% / 0,10%. Di atas track selebar
     80% hasilnya empat sliver yang praktis tak terlihat — inilah "bar nya
     belum bener" yang paling kentara.

     Keempat kategori ini berdiri sendiri (bukan bagian dari satu keseluruhan
     yang dinamai), jadi bar dinormalkan ke kategori terbanyak — sementara
     angka absolut dan persentase jujurnya tetap dicetak. */
  const rows = STATUS_HUNIAN_TARGET
    .map((status) => ({ ...status, n: statusHunian[status.key]?.n ?? 0 }))
    .filter((r) => r.n > 0)
    .sort((a, b) => b.n - a.n);
  const maxN = Math.max(...rows.map((r) => r.n), 1);

  return (
    <section style={{
      background: 'transparent',
      padding: '7rem 2rem',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          color: 'var(--ws2-text-1)',
          lineHeight: 1.2,
          marginBottom: '1rem',
        }}>
          Bertahan di Titik Nadir Keterbatasan
        </h2>
        <p className="lato-light" style={{
          fontSize: '1.05rem',
          lineHeight: 1.88,
          color: 'var(--ws2-text-2)',
          maxWidth: 640,
          marginBottom: '3.5rem',
        }}>
          Kehilangan rumah bukan sekadar hilangnya tempat bernaung, melainkan tercerabutnya
          rasa aman dan martabat dasar. Ribuan keluarga kini berdesakan di hunian sementara,
          fasilitas umum, dan tenda pengungsian, menanti kepastian untuk kembali menata hidup.
        </p>

        <div ref={ref} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.2rem',
          marginBottom: '1.2rem',
        }}>
          {rows.map((status, i) => (
            <div
              key={status.key}
              className="ws2-card"
              style={{
                textAlign: 'left',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 0.8s var(--ws2-reveal-ease) ${i * 0.12}s, transform 0.8s var(--ws2-reveal-ease) ${i * 0.12}s`,
              }}
            >
              {/* Dulu di sini ada huruf awal label ("P", "R", "H", "F") sebagai
                  pengganti ikon — terbaca sebagai bug, bukan desain. Dihapus. */}
              <div className="playfair-display" style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                color: status.color,
                fontStyle: 'italic',
                fontWeight: 700,
                lineHeight: 1,
                marginBottom: '0.3rem',
              }}>
                {fmtN(status.n)}
              </div>
              <div className="lato-bold" style={{
                fontSize: '0.72rem',
                color: 'var(--ws2-text-3)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '0.9rem',
              }}>
                {status.label}
              </div>

              <BarTrack
                mode="rank"
                value={(status.n / maxN) * 100}
                surface="navy"
                visible={visible}
                delay={i * 0.1}
                color={status.color}
              />

              <div className="lato-light" style={{
                marginTop: '0.6rem',
                fontSize: '0.8rem',
                color: 'var(--ws2-text-4)',
              }}>
                {fmtPct(pctRT(status.n))}% rumah tangga
              </div>
            </div>
          ))}
        </div>

        <p className="lato-light" style={{
          fontSize: '0.72rem',
          color: 'var(--ws2-text-4)',
          lineHeight: 1.6,
          marginBottom: '3rem',
        }}>
          {CAPTION_RANK}; {CAPTION_RT}
        </p>

        <div className="ws2-quote">
          <p className="lato-light" style={{
            fontSize: '1rem',
            lineHeight: 1.85,
            color: 'var(--ws2-text-2)',
            margin: 0,
          }}>
            Status hunian sementara menunjukkan betapa mendesaknya kebutuhan pemulihan.
            Mereka yang kini tinggal di huntara, fasilitas umum, dan pengungsian adalah
            prioritas utama dalam program rehabilitasi perumahan.
          </p>
        </div>
      </div>
    </section>
  );
}



/* ─────────────────────────────────────────
   Scene 4: Kondisi Individu & Keluarga
───────────────────────────────────────────*/
function SceneIndividu() {
  const [ref, visible] = useInView(0.2);

  const jenisKelamin = insights?.anggota_keluarga?.distribusi_jenis_kelamin || {};
  const keluhanKesehatan = insights?.anggota_keluarga?.keluhan_kesehatan || {};
  const disabilitas = insights?.anggota_keluarga?.disabilitas || {};
  const bantuanDiterima = insights?.rumah_tangga?.bantuan_diterima || {};

  const genderSegments = Object.entries(jenisKelamin).map(([key, val], i) => ({
    label: key.replace(/[0-9.]/g, '').trim(),
    value: val.n,
    color: i === 0 ? WS2.green : WS2.cream,
  }));

  /* Bantuan dulu digambar sebagai donut. Itu tidak sah secara statistik:
     `bantuan_diterima` adalah pertanyaan multi-jawab — satu rumah tangga bisa
     menerima beberapa jenis — sehingga menjumlahkan n_menerima sebagai total
     donut menghitung ganda dan membuat Makanan tampil 45,6% padahal angka
     sebenarnya 41,35%. Diganti daftar bar yang memakai `pct` JSON apa adanya. */
  const bantuanRows = Object.entries(bantuanDiterima)
    .map(([key, val]) => ({
      key,
      label: key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()),
      n: val.n_menerima ?? 0,
      pct: val.pct ?? 0,
    }))
    .sort((a, b) => b.pct - a.pct);

  const topKeluhan = Object.entries(keluhanKesehatan)
    .map(([key, val]) => ({ label: key.replace(/_/g, ' '), n: val.n_ya, pct: val.pct ?? 0 }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 7);
  const maxKeluhan = topKeluhan[0]?.n || 1;

  /* Dulu Ibu Hamil / Lansia / Balita di-hardcode 0, sehingga kartunya selalu
     menampilkan tiga strip. Diganti disabilitas, yang benar-benar ada. */
  const topDisabilitas = Object.entries(disabilitas)
    .map(([key, val]) => ({
      label: key.replace(/disabilitas_/, '').replace(/_/g, ' '),
      n: val.n_ya ?? 0,
      pct: val.pct ?? 0,
    }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 3);
  const maxDisabilitas = topDisabilitas[0]?.n || 1;

  const eyebrow = {
    fontFamily: "'Lato', sans-serif",
    fontWeight: 700,
    fontSize: '0.78rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--ws2-text-3)',
    marginBottom: '1.5rem',
  };

  return (
    <section style={{ background: 'transparent', padding: '7rem 2rem', position: 'relative' }}>
      {/* Latar dulu polos tembus ke navy tanpa tekstur apa pun. Satu lapis foto
          yang sangat redup memberi kedalaman tanpa menarik perhatian dari data. */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `url(${imgTekstur})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'grayscale(1) contrast(0.9)',
        opacity: 0.1,
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, var(--ws2-bg-navy) 0%, rgba(21,23,61,0.82) 50%, var(--ws2-bg-navy) 100%)',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          color: 'var(--ws2-text-1)',
          lineHeight: 1.2,
          marginBottom: '1rem',
        }}>
          Kondisi Individu &{' '}
          <span style={{ color: 'var(--ws2-accent)' }}>Keluarga</span>
        </h2>
        <p className="lato-light" style={{
          fontSize: '1.05rem',
          lineHeight: 1.88,
          color: 'var(--ws2-text-2)',
          maxWidth: 640,
          marginBottom: '3rem',
        }}>
          Setiap angka merepresentasikan nyawa dan cerita. Pemetaan keluhan kesehatan,
          persebaran kelompok rentan, dan riwayat penerimaan bantuan menjadi kompas utama
          untuk memastikan tidak ada satu pun yang terabaikan.
        </p>

        <div ref={ref} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>

          {/* Donut gender */}
          <div className="ws2-card">
            <DonutChart segments={genderSegments} title="Distribusi Gender" size={160} thickness={30} />
          </div>

          {/* Disabilitas */}
          <div className="ws2-card">
            <div style={eyebrow}>Penyandang Disabilitas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topDisabilitas.map((item, i) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem', gap: '0.6rem' }}>
                    <span className="lato-light" style={{ fontSize: '0.85rem', color: 'var(--ws2-text-2)', textTransform: 'capitalize' }}>
                      {item.label}
                    </span>
                    <span className="lato-bold" style={{ fontSize: '0.8rem', color: 'var(--ws2-text-1)', whiteSpace: 'nowrap' }}>
                      {fmtN(item.n)}
                      <span style={{ fontWeight: 300, color: 'var(--ws2-text-4)', marginLeft: '0.35rem' }}>
                        {fmtPct(item.pct)}%
                      </span>
                    </span>
                  </div>
                  <BarTrack
                    mode="rank"
                    value={(item.n / maxDisabilitas) * 100}
                    surface="navy"
                    tone="positive"
                    visible={visible}
                    delay={i * 0.1}
                  />
                </div>
              ))}
            </div>
            <p className="lato-light" style={{ marginTop: '1.2rem', fontSize: '0.7rem', color: 'var(--ws2-text-4)' }}>
              {CAPTION_RANK}; persentase dari jiwa terdata.
            </p>
          </div>

          {/* Bantuan diterima */}
          <div className="ws2-card" style={{ gridColumn: '1 / -1' }}>
            <div style={eyebrow}>Bantuan yang Diterima Rumah Tangga</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {bantuanRows.map((item, i) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span className="lato-light" style={{ flex: '0 0 170px', fontSize: '0.85rem', color: 'var(--ws2-text-2)' }}>
                    {item.label}
                  </span>
                  <div style={{ flex: 1 }}>
                    <BarTrack
                      mode="share"
                      value={item.pct}
                      surface="navy"
                      tone="accent"
                      visible={visible}
                      delay={i * 0.1}
                    />
                  </div>
                  <span className="lato-bold" style={{ fontSize: '0.8rem', color: 'var(--ws2-text-1)', width: 120, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {fmtPct(item.pct)}%
                    <span style={{ fontWeight: 300, color: 'var(--ws2-text-4)', marginLeft: '0.35rem' }}>
                      {fmtN(item.n)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <p className="lato-light" style={{ marginTop: '1.2rem', fontSize: '0.7rem', color: 'var(--ws2-text-4)', lineHeight: 1.6 }}>
              Persentase rumah tangga penerima tiap jenis bantuan. Satu rumah tangga dapat
              menerima lebih dari satu jenis, sehingga jumlahnya tidak 100%.
              Perbaikan rumah baru diterima {fmtPct(bantuanRows.find((b) => b.key === 'perbaikan_rumah')?.pct ?? 0)}% rumah tangga,
              sementara {fmtPct(pctRT(BANGUNAN_PERLU_PERBAIKAN))}% rumah perlu diperbaiki.
            </p>
          </div>

          {/* Keluhan kesehatan */}
          <div className="ws2-card" style={{ gridColumn: '1 / -1' }}>
            <div style={eyebrow}>Keluhan Kesehatan Terbanyak</div>
            {topKeluhan.length === 0 ? (
              <span className="lato-light" style={{ fontSize: '0.85rem', color: 'var(--ws2-text-4)' }}>Menunggu data…</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {topKeluhan.map((item, i) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span className="lato-bold" style={{ color: 'var(--ws2-text-4)', fontSize: '0.8rem', width: 20, textAlign: 'right' }}>
                      {i + 1}
                    </span>
                    <span className="lato-light" style={{ flex: '0 0 160px', fontSize: '0.85rem', color: 'var(--ws2-text-2)', textTransform: 'capitalize' }}>
                      {item.label}
                    </span>
                    <div style={{ flex: 1 }}>
                      <BarTrack
                        mode="rank"
                        value={(item.n / maxKeluhan) * 100}
                        surface="navy"
                        tone="accent"
                        visible={visible}
                        delay={i * 0.1}
                      />
                    </div>
                    <span className="lato-bold" style={{ fontSize: '0.8rem', color: 'var(--ws2-text-1)', width: 120, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {fmtN(item.n)}
                      <span style={{ fontWeight: 300, color: 'var(--ws2-text-4)', marginLeft: '0.35rem' }}>
                        {fmtPct(item.pct)}%
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="lato-light" style={{ marginTop: '1.2rem', fontSize: '0.7rem', color: 'var(--ws2-text-4)' }}>
              {CAPTION_RANK}; persentase dari jiwa terdata.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}



/* ─────────────────────────────────────────
   Transisi Babak 3→4 — versi diperbaiki
   Fix: animasi tidak terpotong, ada bridge
   ke Babak Kebutuhan
───────────────────────────────────────────*/
function TransisiBabak34() {
  // Gunakan threshold lebih rendah agar trigger lebih awal
  const [refAngka, visibleAngka] = useInView(0.05);
  const [refJudul, visibleJudul] = useInView(0.1);
  const [refBridge, visibleBridge] = useInView(0.15);

  const meninggal = insights?.rumah_tangga?.hasil_cek?.['3. Seluruh anggota keluarga meninggal --> STOP']?.n || 0;

  return (
    <>
      {/* ── PANEL 1: Emotional Beat ─────────────────── */}
      <section style={{
        backgroundColor: 'transparent',
        // minHeight 100vh agar konten tidak terpotong scroll
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8rem 2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow merah di belakang — subtle */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(21,23,61,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div ref={refAngka} style={{ textAlign: 'center', maxWidth: 700, position: 'relative', zIndex: 2 }}>
          {/* Garis dekoratif atas */}
          <div style={{
            width: visibleAngka ? 60 : 0,
            height: 1,
            background: 'var(--ws2-line-c2)',
            margin: '0 auto 2.5rem',
            transition: 'width 1s ease',
          }} />

          {/* Angka besar */}
          {meninggal > 0 && (
            <div className="playfair-display" style={{
              fontSize: 'clamp(5rem, 13vw, 10rem)',
              fontWeight: 700,
              fontStyle: 'italic',
              color: 'var(--ws2-ink-1)',
              lineHeight: 1,
              marginBottom: '0.5rem',
              // Gunakan opacity bukan color transparent — lebih smooth & tidak terpotong
              opacity: visibleAngka ? 1 : 0,
              transform: visibleAngka ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1.5s ease, transform 1.5s ease',
              textShadow: 'none',
            }}>
              {meninggal.toLocaleString('id-ID')}
            </div>
          )}

          <div className="lato-bold" style={{
            fontSize: '0.78rem', letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--ws2-ink-3)',
            marginBottom: '3rem',
            opacity: visibleAngka ? 1 : 0,
            transition: 'opacity 1.5s ease 0.4s',
          }}>
            keluarga meninggal dunia
          </div>

          <h2 ref={refJudul} className="playfair-display" style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            color: 'var(--ws2-ink-1)',
            lineHeight: 1.3,
            marginBottom: '1.5rem',
            // Pakai opacity + translateY, bukan color transparent
            opacity: visibleJudul ? 1 : 0,
            transform: visibleJudul ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 1.2s ease, transform 1.2s ease',
          }}>
            Ada Kehilangan yang Tak Bisa<br />
            <span style={{ color: 'var(--ws2-ink-1)', fontStyle: 'italic' }}>Dibangun Kembali</span>
          </h2>

          <p className="lato-regular" style={{
            fontSize: '1.05rem',
            lineHeight: 1.85,
            color: 'var(--ws2-ink-2)',
            maxWidth: 520,
            margin: '0 auto 3.5rem',
            opacity: visibleJudul ? 1 : 0,
            transition: 'opacity 1.5s ease 0.5s',
          }}>
            Tidak semua kehilangan dapat digantikan melalui proses pemulihan fisik.
            Di balik statistik rekonstruksi, ada duka yang tidak bisa diukur.
          </p>

          {/* Garis dekoratif bawah */}
          <div style={{
            width: visibleJudul ? 60 : 0,
            height: 1,
            background: 'var(--ws2-line-c2)',
            margin: '0 auto',
            transition: 'width 1.2s ease 0.8s',
          }} />
        </div>
      </section>

      {/* ── PANEL 2: Bridge ke Babak Kebutuhan ──────── */}
      <section ref={refBridge} style={{
      backgroundColor: 'transparent',
      // Kurangi dari 60vh → 40vh, hilangkan padding berlebih
      minHeight: '40vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      textAlign: 'center',
      position: 'relative',
      }}>

      {/* Dipadatkan: dulu tiga kalimat panjang dengan <br/> di tengah, lalu
          satu paragraf di bawahnya yang mengulang "di tengah duka yang belum
          usai" — total jadi enam-tujuh baris patah. Sekarang satu kalimat
          pernyataan dan satu kalimat pertanyaan, dengan maxWidth lebih lebar
          dan line-height lebih rapat supaya tidak banyak pindah baris. */}
      <h3 className="playfair-display" style={{
        fontSize: 'clamp(1.4rem, 2.6vw, 2.1rem)',
        color: 'var(--ws2-ink-1)',
        lineHeight: 1.4,
        maxWidth: 940,
        textAlign: 'center',
        margin: 0,
        opacity: visibleBridge ? 1 : 0,
        transform: visibleBridge ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 1.2s ease 0.4s, transform 1.2s ease 0.4s',
      }}>
        Infrastruktur dapat direkonstruksi, tetapi nyawa yang hilang meninggalkan duka yang permanen.
      </h3>

      <p className="playfair-display" style={{
        fontSize: 'clamp(1.15rem, 2vw, 1.6rem)',
        fontStyle: 'italic',
        lineHeight: 1.45,
        color: 'var(--ws2-ink-2)',
        maxWidth: 760,
        marginTop: '1.4rem',
        textAlign: 'center',
        opacity: visibleBridge ? 1 : 0,
        transition: 'opacity 1.2s ease 0.7s',
      }}>
        Lantas, apa yang paling mereka butuhkan sekarang?
      </p>
      </section>
    </>
  );
}

/* ─────────────────────────────────────────
   Komponen Utama: BabakKeluarga
───────────────────────────────────────────*/
export default function BabakKeluarga() {
  return (
    <>
      <SceneSudutDesa />
      <ScenePotretHunianNarasi />
      <ScenePotretHunianVisual />
      <SceneIndividu />
      {/* Momen paling sunyi di seluruh cerita dibuat satu-satunya panel terang
          di Babak 3 — sekaligus mewujudkan "selang-seling warna latar". */}
      <BgSeam from="navy" to="cream" />
      <TransisiBabak34 />
    </>
  );
}