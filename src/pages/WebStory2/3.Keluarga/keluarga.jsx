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
  CircleMarker,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import dataProvinsiIndo from "../../../assets/maps/Administrasi_Provinsi.json";
import desaData from "../scene1_desa_terdampak.json";

/* ─────────────────────────────────────────
   Utility: IntersectionObserver hook
───────────────────────────────────────────*/
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─────────────────────────────────────────
   Donut Chart — pure SVG
───────────────────────────────────────────*/
function DonutChart({ segments, size = 180, thickness = 36, title }) {
  const total = segments.reduce((s, seg) => s + (seg.value || 0), 0);
  if (!total) return (
    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
      Menunggu data…
    </div>
  );

  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;

  let currentAngle = -Math.PI / 2;
  const paths = segments.map(seg => {
    const fraction = seg.value / total;
    const startAngle = currentAngle;
    const endAngle   = currentAngle + fraction * 2 * Math.PI;
    currentAngle = endAngle;
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
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
          marginBottom: '0.2rem',
        }}>
          {title}
        </div>
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} opacity={0.9} />
        ))}
        <circle cx={cx} cy={cy} r={r - thickness / 2} fill="#0a0b1f" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
        {paths.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: p.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', flex: 1 }}>
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

  const sumatraCenter = [-0.5, 102.5]; 
  const initialZoom = 6.5; 
  const lngOffset = 0.08; 

  const stepsData = React.useMemo(() => [
    { id: "#intro-step", target: sumatraCenter, zoom: initialZoom, type: "intro" },
    { id: "#aceh-step", target: [provinsiStory[0].lat, provinsiStory[0].lng + lngOffset], zoom: 12, type: "desa", provIndex: 0 },
    { id: "#bridge-1-step", target: sumatraCenter, zoom: initialZoom, type: "bridge" }, 
    { id: "#sumut-step", target: [provinsiStory[1].lat, provinsiStory[1].lng + lngOffset], zoom: 12, type: "desa", provIndex: 1 },
    { id: "#bridge-2-step", target: sumatraCenter, zoom: initialZoom, type: "bridge" }, 
    { id: "#sumbar-step", target: [provinsiStory[2].lat, provinsiStory[2].lng + lngOffset], zoom: 12, type: "desa", provIndex: 2 },
  ], [provinsiStory]);

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

    gsap.to(trackRef.current, {
      x: "-100vw",
      ease: "none",
      scrollTrigger: {
        trigger: "#slide-step",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });
  }, []);

  // ==========================================
  // ANIMASI KAMERA PETA & TRIGGER SCROLL
  // ==========================================
  useEffect(() => {
    if (!map) return;

    stepsData.forEach((s, index) => {
      ScrollTrigger.create({
        trigger: s.id,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          setStepIndex(index);
          if (s.type === "desa") setActiveProvIndex(s.provIndex);
          map.flyTo(s.target, s.zoom, { animate: true, duration: 2.5 });
        },
        onEnterBack: () => {
          setStepIndex(index);
          if (s.type === "desa") setActiveProvIndex(s.provIndex);
          map.flyTo(s.target, s.zoom, { animate: true, duration: 2.5 });
        }
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [map, stepsData]);

  const currentStep = stepsData[stepIndex] || stepsData[0];
  const isBridge = currentStep.type === "bridge";
  const isIntro = currentStep.type === "intro";

  const createCustomIcon = (isActive) => {
    const color = "#FF2A2A";
    const htmlString = `
      <div class="custom-pin-wrapper ${isActive ? 'active-pin' : ''}">
        <div class="pin-head" style="background-color: ${color}; box-shadow: 0 0 16px 4px rgba(255,42,42,0.8); border: 2px solid #FFF;"></div>
        <div class="pin-tail" style="border-top-color: ${color}; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5));"></div>
        ${isActive ? `<div class="pin-radar" style="border-color: ${color};"></div>` : ''}
      </div>
    `;
    return L.divIcon({ className: "transparent-div-icon", html: htmlString, iconSize: [24, 36], iconAnchor: [12, 36], popupAnchor: [0, -36] });
  };

  const createLabelIcon = (nama) => {
    return L.divIcon({ className: "transparent-div-icon", html: `<div class="province-label-text">${nama}</div>`, iconSize: [120, 40], iconAnchor: [60, 20] });
  };

  return (
    <>
      <section style={{ position: "relative", background: "#0A111D", minHeight: "700vh" }}>
        
        <div style={{ position: "sticky", top: 0, height: "100vh", width: "100vw", overflow: "hidden" }}>
          
          <style>{`
            .leaflet-tile-pane {
              filter: saturate(0.65) brightness(0.7) contrast(1.2);
            }
            .leaflet-container {
              background: #0A111D !important; 
            }
            .transparent-div-icon { background: transparent; border: none; }
            .province-label-text {
              color: rgba(229, 217, 182, 0.6);
              font-family: 'Playfair Display', serif;
              font-size: 0.95rem; font-style: italic; font-weight: 700;
              letter-spacing: 0.25em; text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
              pointer-events: none; text-align: center; line-height: 1.3;
            }
            .custom-pin-wrapper {
              position: relative; width: 24px; height: 36px;
              display: flex; flex-direction: column; align-items: center;
              transition: transform 0.3s ease;
            }
            .active-pin {
              transform: scale(1.4) translateY(-8px); z-index: 1000 !important;
            }
            .pin-head { width: 16px; height: 16px; border-radius: 50%; z-index: 2; }
            .pin-tail {
              width: 0; height: 0;
              border-left: 6px solid transparent; border-right: 6px solid transparent;
              border-top: 14px solid; margin-top: -4px; z-index: 1;
            }
            .pin-radar {
              position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
              width: 48px; height: 48px; border-radius: 50%; border: 2px solid;
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
              background: "linear-gradient(to right, #15173D 0%, #0A111D 100%)", 
              display: "flex", justifyContent: "center", alignItems: "center", 
              position: "relative", zIndex: 50 
            }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "80vw", height: "80vw", background: "radial-gradient(circle, rgba(229,217,182,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 2, maxWidth: "1000px", textAlign: "center", padding: "0 2rem" }}>
                <div ref={quote1Ref} style={{ fontSize: "8rem", lineHeight: 0.5, textAlign: "left", fontFamily: "'Playfair Display', serif", color: "#E5D9B6" }}>“</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 2.5vw, 3.2rem)", fontStyle: "italic", fontWeight: 500, color: "#E5D9B6", lineHeight: 1.3, margin: "1.5rem auto", maxWidth: "850px" }}>
                  <div ref={el => textLineRefs.current[0] = el}>Dari tingkat desa hingga provinsi, setiap angka</div>
                  <div ref={el => textLineRefs.current[1] = el} style={{ color: "#FFD36E", fontSize: "1.05em", margin: "0.5rem 0 1rem" }}>adalah cerminan ruang hidup yang terdampak.</div>
                  <div ref={el => textLineRefs.current[2] = el}>Kami memetakan agregasi wilayah untuk</div>
                  <div ref={el => textLineRefs.current[3] = el}>memastikan tidak ada jengkal tanah</div>
                  <div ref={el => textLineRefs.current[4] = el} style={{ color: "#FFD36E", fontSize: "1.05em", marginTop: "0.5rem" }}>yang terlewatkan dalam rencana pemulihan.</div>
                </h2>
                <div ref={quote2Ref} style={{ fontSize: "8rem", lineHeight: 0.5, textAlign: "right", fontFamily: "'Playfair Display', serif", color: "#E5D9B6" }}>”</div>
              </div>
            </div>

            {/* ====================================================
                PANEL 2: PETA (Lebar 100vw)
                ==================================================== */}
            <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#0A111D" }}>
              
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "20vw", background: "linear-gradient(to right, #0A111D 0%, transparent 100%)", zIndex: 996, pointerEvents: "none" }} />

              <MapContainer
                center={[-0.5, 102.5]} zoom={6.5} zoomSnap={0.1}         
                zoomControl={false} scrollWheelZoom={false} dragging={false} doubleClickZoom={false} touchZoom={false}
                style={{ width: "100%", height: "100%", background: "#0A111D", zIndex: 1 }}
              >
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                <MapController setMap={setMap} />
                
                {dataProvinsiIndo && (
                  <GeoJSON data={dataProvinsiIndo} style={() => ({ color: "rgba(229, 217, 182, 0.4)", weight: 1.5, fillColor: "#000", fillOpacity: 0.15, dashArray: "4 4" })} />
                )}

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
                  background: isBridge ? "radial-gradient(ellipse, rgba(10,17,29,0.7) 0%, transparent 70%)" : "transparent",
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
                background: "linear-gradient(to left, rgba(10,17,29,0.98) 0%, rgba(10,17,29,0.85) 50%, transparent 100%)", 
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
                    <div style={{ color: "#FFD36E", letterSpacing: ".25em", textTransform: "uppercase", fontSize: ".85rem", marginBottom: "1rem", fontFamily: "Lato", fontWeight: 700 }}>
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
                    <div style={{ color: "#FFD36E", letterSpacing: ".25em", textTransform: "uppercase", fontSize: ".85rem", marginBottom: "1rem", fontFamily: "Lato", fontWeight: 700 }}>
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
function ScenePotretHunianNarasi() {
  const [ref, visible] = useInView(0.15); // Terpicu saat 15% elemen masuk layar

  // ==========================================
  // 1. EKSTRAKSI DATA DARI INSIGHT.JSON
  // ==========================================
  const kondisiBangunan = insights?.rumah_tangga?.kondisi_bangunan || {};
  
  const nMasihAda = (kondisiBangunan['1. Bangunan ada dan tidak terdampak']?.n || 0)
                  + (kondisiBangunan['2. Bangunan ada, terdampak, tetapi tidak perlu perbaikan']?.n || 0);
  const nRusak = (kondisiBangunan['3. Bangunan ada, terdampak, dan perlu perbaikan']?.n || 0);
  const nHilang = (kondisiBangunan['4. Bangunan rusak dan tidak dapat diperbaiki<b> --> Lanjut ke Rincian 10</b>']?.n || 0)
                + (kondisiBangunan['5. Bangunan hilang<b> --> Lanjut ke Rincian 10</b>']?.n || 0);

  const totalEvaluasi = nMasihAda + nRusak + nHilang || 1;
  const pctMasih = (nMasihAda / totalEvaluasi) * 100;
  const pctRusak = (nRusak / totalEvaluasi) * 100;
  const pctHilang = (nHilang / totalEvaluasi) * 100;

  const sumberAir = insights?.rumah_tangga?.sumber_air || {};
  const pctTanpaAir = (sumberAir['09. Air permukaan (sungai/danau/waduk/kolam/irigasi)']?.pct || 0) +
                      (sumberAir['08. Mata air tak terlindung']?.pct || 0) +
                      (sumberAir['06. Sumur tak terlindung']?.pct || 0);

  const sumberListrik = insights?.rumah_tangga?.sumber_listrik || {};
  const pctTanpaListrik = sumberListrik['3. Bukan listrik']?.pct || 0;

  const fasilitasMck = insights?.rumah_tangga?.fasilitas_mck || {};
  const pctTanpaSanitasi = fasilitasMck['5. Tidak ada']?.pct || 0;

  const pctKRTPerempuan = "N/A"; 

  // ==========================================
  // 2. KONFIGURASI KARTU STATISTIK EDITORIAL
  // ==========================================
  const cardsData = [
    { 
      value: `${pctTanpaAir.toFixed(1)}%`, 
      label: 'Krisis Air Bersih', 
      desc: 'Keluarga bertahan hidup menggunakan air permukaan atau sumber yang sama sekali tidak terlindung.',
      accent: '#4FC3F7', 
      delay: 0.2 // Delay untuk animasi berurutan
    },
    { 
      value: `${pctTanpaListrik.toFixed(2)}%`, 
      label: 'Tanpa Listrik', 
      desc: 'Keluarga hidup dalam kegelapan tanpa akses ke jaringan listrik pasca terjadinya bencana.',
      accent: '#FFD36E', 
      delay: 0.4
    },
    { 
      value: `${pctTanpaSanitasi.toFixed(1)}%`, 
      label: 'Tanpa Sanitasi', 
      desc: 'Tidak memiliki akses fasilitas MCK sama sekali, membuat kelompok rentan terancam wabah.',
      accent: '#81C784', 
      delay: 0.6
    },
    { 
      value: pctKRTPerempuan, 
      label: 'KRT Perempuan', 
      desc: 'Keluarga dengan Kepala Rumah Tangga perempuan (Menunggu agregasi data lapangan).',
      accent: '#CE93D8', 
      delay: 0.8
    }
  ];

  return (
    <section style={{
      position: 'relative',
      background: 'linear-gradient(180deg, #0A111D 0%, #0d1222 30%, #15173D 100%)',
      padding: '8rem 2rem 10rem', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      zIndex: 10 
    }}>

      {/* SEAM FIXER (KABUT GRADASI) */}
      <div style={{
        position: 'absolute', top: '-150px', left: 0, width: '100%', height: '150px',
        background: 'linear-gradient(to bottom, transparent 0%, #0A111D 100%)',
        pointerEvents: 'none', zIndex: 1
      }} />

      <div ref={ref} style={{ maxWidth: 1050, margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
        
        {/* ==========================================
            HEADER SECTION (SLOW FADE-IN)
            ========================================== */}
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          // Animasi diperlambat menjadi 2 detik agar muncul perlahan sekaligus yang dramatis
          transition: 'opacity 2s ease, transform 2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontStyle: "italic",
            fontSize: 'clamp(2.5rem, 4.5vw, 4.2rem)', 
            lineHeight: 1.15, marginBottom: '1.5rem',
            textShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            {/* Pemisahan Warna Headline */}
            <span style={{ color: '#E5D9B6' }}>Rumah yang Masih Berdiri,</span><br/>
            <span style={{ color: '#E67E22' }}>Kehidupan yang Belum Pulih</span>
          </h2>
          
          <p style={{
            fontFamily: "'Lato', sans-serif", fontWeight: 300,
            fontSize: '1.15rem', lineHeight: 1.8, color: 'rgba(255, 255, 255, 0.75)',
            maxWidth: 760, marginBottom: '6rem',
          }}>
            Tembok yang tersisa bukan berarti penderitaan usai. Ribuan keluarga bertahan di rumah yang menanti runtuh, terputus dari aliran air, tanpa cahaya, dan kehilangan kebutuhan paling mendasar.
          </p>
        </div>

        {/* ==========================================
            VISUAL 1: SPLIT BAR BANGUNAN (FLEX-WIDTH)
            ========================================== */}
        <div style={{ marginBottom: '6rem', opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 0.3s' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{
              fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#E5D9B6',
              letterSpacing: '0.15em', textTransform: 'uppercase',
            }}>
              Kondisi Bangunan Terdampak
            </div>
            <div style={{
              fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)',
            }}>
              Total Dievaluasi: <span style={{ color: '#FFF', fontWeight: 700, fontSize: '1rem', marginLeft: '0.3rem' }}>
                <AnimatedCounter target={totalEvaluasi} duration={4} visible={visible} /> 
              </span> Rumah
            </div>
          </div>

          {/* Container Split Bar */}
          <div style={{
            display: 'flex', width: '100%', height: '24px', borderRadius: '4px', overflow: 'hidden', 
            background: 'rgba(255,255,255,0.05)', marginBottom: '2rem'
          }}>
            <div style={{
              width: visible ? `${pctMasih}%` : '0%', 
              background: '#3A4B5C', 
              transition: 'width 2s cubic-bezier(0.22, 1, 0.36, 1) 0.4s',
            }} />
            <div style={{
              width: visible ? `${pctRusak}%` : '0%',
              background: '#E67E22', 
              transition: 'width 2s cubic-bezier(0.22, 1, 0.36, 1) 0.5s',
            }} />
            <div style={{
              width: visible ? `${pctHilang}%` : '0%',
              background: '#FF2A2A', 
              transition: 'width 2s cubic-bezier(0.22, 1, 0.36, 1) 0.6s',
            }} />
          </div>

          {/* Legenda Data Editorial */}
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            {[
              { pct: pctMasih, color: '#3A4B5C', label: 'Masih Ada (Utuh/Ringan)', n: nMasihAda },
              { pct: pctRusak, color: '#E67E22', label: 'Rusak (Perlu Perbaikan)', n: nRusak },
              { pct: pctHilang, color: '#FF2A2A', label: 'Hilang / Rusak Total', n: nHilang },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                <span style={{ width: 12, height: 12, borderRadius: '2px', background: item.color, marginTop: '5px' }} />
                <div>
                  <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#FFF' }}>
                    {item.pct.toFixed(1)}% <span style={{ fontWeight: 300, color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>({item.n.toLocaleString('id-ID')})</span>
                  </div>
                  <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================
            VISUAL 2: KARTU DATA (FADE-UP BERURUTAN)
            ========================================== */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem',
        }}>
          {cardsData.map((card, index) => (
            <div key={index} style={{
              background: 'rgba(10, 15, 30, 0.5)', 
              borderRadius: '8px', 
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderLeft: `3px solid ${card.accent}`, 
              padding: '2rem 1.8rem',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(30px)',
              transition: `all 1s cubic-bezier(0.16, 1, 0.3, 1) ${card.delay}s`,
            }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '3.5rem',
                color: card.accent, 
                fontWeight: 700, 
                lineHeight: 1, 
                marginBottom: '1rem',
              }}>
                {card.value}
              </div>
              <div style={{
                fontFamily: "'Lato', sans-serif", fontWeight: 700,
                fontSize: '0.85rem', color: '#E5D9B6',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem',
              }}>
                {card.label}
              </div>
              <div style={{ 
                fontFamily: "'Lato', sans-serif", 
                fontWeight: 300, 
                fontSize: '0.95rem', 
                color: 'rgba(255,255,255,0.5)', 
                lineHeight: 1.6 
              }}>
                {card.desc}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Scene 3: Potret Hunian Visual
───────────────────────────────────────────*/
const STATUS_HUNIAN_TARGET = [
  { key: '6. Huntara',        label: 'Huntara',      color: '#e74c3c', icon: '⛺' },
  { key: '5. Fasilitas Umum', label: 'Fasilitas Umum', color: '#FFB74D', icon: '🏛️' },
  { key: '3. Pengungsian',    label: 'Pengungsian',  color: '#FF8A65', icon: '👥' },
  { key: '4. Rumah Tumpangan',label: 'Rumah Tumpangan', color: '#CE93D8', icon: '🏠' },
];

function ScenePotretHunianVisual() {
  const [ref, visible] = useInView(0.15);

  const statusHunian = insights?.rumah_tangga?.status_hunian || {};

  return (
    <section style={{
      background: 'linear-gradient(180deg, #0d0f28 0%, #070814 100%)',
      padding: '7rem 2rem',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <span style={{
          fontFamily: "'Lato', sans-serif", fontWeight: 700,
          fontSize: '0.78rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#FF8A65',
          display: 'block', marginBottom: '1rem',
        }}>
          Babak 3 · Scene 3
        </span>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontStyle: "italic",
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          color: '#E5D9B6', lineHeight: 1.2, marginBottom: '1rem',
        }}>
          Bertahan di Titik Nadir{' '}
          <span style={{ color: '#FF8A65', fontStyle: 'normal' }}>Keterbatasan</span>
        </h2>
        <p style={{
          fontFamily: "'Lato', sans-serif", fontWeight: 300,
          fontSize: '1.05rem', lineHeight: 1.88,
          color: '#E5D9B6', opacity: 0.85,
          maxWidth: 640, marginBottom: '3.5rem',
        }}>
          Kehilangan rumah berarti kehilangan martabat dasar.
          Ribuan keluarga kini hidup di hunian darurat, terputus dari
          air bersih dan sanitasi layak.
        </p>

        <div ref={ref} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.2rem',
          marginBottom: '3rem',
        }}>
          {STATUS_HUNIAN_TARGET.map((status, i) => {
            const data = statusHunian[status.key] || { n: 0, pct: 0 };
            return (
              <div key={status.key} style={{
                padding: '1.8rem',
                background: `${status.color}0a`,
                borderRadius: 16,
                border: `1px solid ${status.color}33`,
                textAlign: 'center',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`,
              }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.8rem' }}>{status.icon}</div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                  color: status.color, fontWeight: 700, lineHeight: 1, marginBottom: '0.3rem',
                }}>
                  {data.n?.toLocaleString('id-ID') || '—'}
                </div>
                <div style={{
                  fontFamily: "'Lato', sans-serif", fontWeight: 700,
                  fontSize: '0.72rem', color: status.color,
                  letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem',
                }}>
                  {status.label}
                </div>
                {data.pct > 0 && (
                  <div style={{
                    fontFamily: "'Lato', sans-serif", fontWeight: 300,
                    fontSize: '1rem', color: 'rgba(229, 217, 182, 0.6)',
                  }}>
                    {data.pct.toFixed(2)}% dari total KK
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          padding: '2rem',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 14,
          border: '1px solid rgba(229, 217, 182, 0.1)',
          borderLeft: '3px solid #FF8A65',
        }}>
          <p style={{
            fontFamily: "'Lato', sans-serif", fontWeight: 300,
            fontSize: '1rem', lineHeight: 1.85,
            color: '#E5D9B6', opacity: 0.8, margin: 0,
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
  // Binding data disesuaikan dengan struktur insight.json yang sesungguhnya
  const jenisKelamin = insights?.anggota_keluarga?.distribusi_jenis_kelamin || {};
  const keluhanKesehatan = insights?.anggota_keluarga?.keluhan_kesehatan || {};
  const bantuanDiterima = insights?.rumah_tangga?.bantuan_diterima || {};

  // Donut Jenis Kelamin (karena kelompok umur tidak tersedia di JSON)
  const genderSegments = Object.entries(jenisKelamin).map(([key, val], i) => ({
    label: key.replace(/[0-9.]/g, '').trim(),
    value: val.n,
    color: i === 0 ? '#4FC3F7' : '#CE93D8'
  }));

  // Bantuan
  const bantuanSegments = Object.entries(bantuanDiterima).map(([key, val], i) => ({
    label: key.replace(/_/g, ' ').toUpperCase(),
    value: val.n_menerima,
    color: ['#81C784','#4FC3F7','#FFB74D','#e74c3c','#CE93D8','#FF8A65'][i % 6],
  }));

  // Keluhan Kesehatan
  const topKeluhan = Object.entries(keluhanKesehatan)
    .map(([key, val]) => [key.replace(/_/g, ' '), val.n_ya])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);
  const maxKeluhan = topKeluhan[0]?.[1] || 1;

  // Placeholder untuk kelompok rentan (diambil dari data summary jika ada, atau 0)
  const totalBumil = 0; 
  const totalLansia = 0;
  const totalBalita = 0;

  return (
    <section style={{
      background: '#070814',
      padding: '7rem 2rem',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <span style={{
          fontFamily: "'Lato', sans-serif", fontWeight: 700,
          fontSize: '0.78rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#CE93D8',
          display: 'block', marginBottom: '1rem',
        }}>
          Babak 3 · Scene 4
        </span>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontStyle: "italic",
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          color: '#E5D9B6', lineHeight: 1.2, marginBottom: '1rem',
        }}>
          Kondisi Individu &{' '}
          <span style={{ color: '#CE93D8', fontStyle: 'normal' }}>Keluarga</span>
        </h2>
        <p style={{
          fontFamily: "'Lato', sans-serif", fontWeight: 300,
          fontSize: '1.05rem', lineHeight: 1.88,
          color: '#E5D9B6', opacity: 0.85,
          maxWidth: 640, marginBottom: '3rem',
        }}>
          Profil kesehatan, distribusi individu, dan bantuan yang diterima oleh keluarga terdampak.
          Setiap angka adalah wajah nyata dari mereka yang bertahan.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {/* Donut Gender */}
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 16,
            border: '1px solid rgba(229, 217, 182, 0.1)', padding: '2rem',
          }}>
            <DonutChart segments={genderSegments} title="Distribusi Gender" size={160} thickness={30} />
          </div>

          {/* Donut bantuan */}
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 16,
            border: '1px solid rgba(229, 217, 182, 0.1)', padding: '2rem',
          }}>
            <DonutChart segments={bantuanSegments} title="Bantuan Diterima (RT)" size={160} thickness={30} />
          </div>

          {/* Kelompok rentan (Placeholder) */}
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 16,
            border: '1px solid rgba(229, 217, 182, 0.1)', padding: '2rem',
          }}>
            <div style={{
              fontFamily: "'Lato', sans-serif", fontWeight: 700,
              fontSize: '0.78rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem',
            }}>
              Kelompok Rentan
            </div>
            {[
              { label: 'Ibu Hamil', val: totalBumil, color: '#FF8A65', icon: '🤰' },
              { label: 'Lansia',    val: totalLansia, color: '#CE93D8', icon: '👴' },
              { label: 'Balita',    val: totalBalita, color: '#FFD54F', icon: '👶' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.8rem', background: 'rgba(255,255,255,0.03)',
                borderRadius: 10, marginBottom: '0.6rem',
                border: `1px solid ${item.color}18`,
              }}>
                <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#E5D9B6' }}>{item.label}</div>
                </div>
                <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 900, fontSize: '1.2rem', color: item.color }}>
                  {item.val === 0 ? '-' : item.val.toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>

          {/* Keluhan kesehatan */}
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 16,
            border: '1px solid rgba(229, 217, 182, 0.1)', padding: '2rem',
            gridColumn: 'span 2',
          }}>
            <div style={{
              fontFamily: "'Lato', sans-serif", fontWeight: 700,
              fontSize: '0.78rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem',
            }}>
              Keluhan Kesehatan Terbanyak
            </div>
            {topKeluhan.length === 0 ? (
              <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>Menunggu data…</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {topKeluhan.map(([label, cnt], i) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', width: 20, textAlign: 'right' }}>
                      {i + 1}
                    </span>
                    <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, flex: '0 0 160px', fontSize: '0.85rem', color: '#E5D9B6', textTransform: 'capitalize' }}>
                      {label}
                    </span>
                    <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${(cnt / maxKeluhan) * 100}%`,
                        background: 'linear-gradient(90deg, #e74c3c88, #e74c3c)', borderRadius: 4,
                      }} />
                    </div>
                    <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: '0.8rem', color: '#e74c3c', width: 60, textAlign: 'right' }}>
                      {cnt.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
        background: '#020208',
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
          background: 'radial-gradient(circle, rgba(231,76,60,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div ref={refAngka} style={{ textAlign: 'center', maxWidth: 700, position: 'relative', zIndex: 2 }}>
          {/* Garis dekoratif atas */}
          <div style={{
            width: visibleAngka ? 60 : 0,
            height: 1,
            background: 'rgba(231,76,60,0.4)',
            margin: '0 auto 2.5rem',
            transition: 'width 1s ease',
          }} />

          {/* Angka besar */}
          {meninggal > 0 && (
            <div className="playfair-display" style={{
              fontSize: 'clamp(5rem, 13vw, 10rem)',
              fontWeight: 700,
              color: '#e74c3c',
              lineHeight: 1,
              marginBottom: '0.5rem',
              // Gunakan opacity bukan color transparent — lebih smooth & tidak terpotong
              opacity: visibleAngka ? 1 : 0,
              transform: visibleAngka ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1.5s ease, transform 1.5s ease',
              textShadow: '0 0 80px rgba(231,76,60,0.25)',
            }}>
              {meninggal.toLocaleString('id-ID')}
            </div>
          )}

          <div className="lato-bold" style={{
            fontSize: '0.78rem', letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(231,76,60,0.65)',
            marginBottom: '3rem',
            opacity: visibleAngka ? 1 : 0,
            transition: 'opacity 1.5s ease 0.4s',
          }}>
            keluarga meninggal dunia
          </div>

          <h2 ref={refJudul} className="playfair-display" style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            color: '#fff',
            lineHeight: 1.3,
            marginBottom: '1.5rem',
            // Pakai opacity + translateY, bukan color transparent
            opacity: visibleJudul ? 1 : 0,
            transform: visibleJudul ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 1.2s ease, transform 1.2s ease',
          }}>
            Ada Kehilangan yang Tak Bisa<br />
            <span style={{ color: '#e74c3c' }}>Dibangun Kembali</span>
          </h2>

          <p className="lato-regular" style={{
            fontSize: '1.05rem',
            lineHeight: 1.85,
            color: 'var(--beige)',
            maxWidth: 520,
            margin: '0 auto 3.5rem',
            opacity: visibleJudul ? 0.75 : 0,
            transition: 'opacity 1.5s ease 0.5s',
          }}>
            Tidak semua kehilangan dapat digantikan melalui proses pemulihan fisik.
            Di balik statistik rekonstruksi, ada duka yang tidak bisa diukur.
          </p>

          {/* Garis dekoratif bawah */}
          <div style={{
            width: visibleJudul ? 60 : 0,
            height: 1,
            background: 'rgba(231,76,60,0.3)',
            margin: '0 auto',
            transition: 'width 1.2s ease 0.8s',
          }} />
        </div>
      </section>

      {/* ── PANEL 2: Bridge ke Babak Kebutuhan ──────── */}
      <section ref={refBridge} style={{
      background: 'linear-gradient(180deg, #020208 0%, #0d0f2b 40%, #15173D 100%)',
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

      <h3 className="playfair-display" style={{
        fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 1.35,
        maxWidth: 600,
        opacity: visibleBridge ? 1 : 0,
        transform: visibleBridge ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 1.2s ease 0.4s, transform 1.2s ease 0.4s',
      }}>
        Lalu, apa yang masih<br />
        <span style={{ color: '#E67E22', fontStyle: 'italic' }}>mereka butuhkan?</span>
      </h3>

      <p className="lato-regular" style={{
        fontSize: '1.15rem',
        lineHeight: 1.8,
        color: 'rgba(229,217,182,0.5)',
        maxWidth: 460,
        marginTop: '1rem',
        opacity: visibleBridge ? 0.8 : 0,
        transition: 'opacity 1.2s ease 0.7s',
      }}>
        Di tengah duka yang belum usai, kebutuhan mendesak terus datang.
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
      <TransisiBabak34 />
    </>
  );
}