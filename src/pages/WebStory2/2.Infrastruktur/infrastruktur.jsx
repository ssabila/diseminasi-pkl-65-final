/**
 * infrastruktur.jsx — Babak 2: Infrastruktur
 *
 * Scene 1: Kelumpuhan Kota — "Jejak Infrastruktur: Ruang Publik yang Lumpuh"
 * Peta Interaktif (Leaflet), Bar chart (Recharts), & Scrollytelling Galeri Gambar
 *
 * Scene 2: Kelumpuhan Desa — "Detail Hingga Sudut Desa"
 * Kartu desa per provinsi (Aceh → Sumut → Sumbar) dengan gradasi warna kerusakan
 *
 * Scene 3: Narasi Layanan Dasar — "Saat Kota Kehilangan Denyutnya"
 * Ikon animasi layanan dasar: listrik, air, sanitasi
 *
 * Scene 4: Zona Prioritas — "Menentukan Zona Prioritas Pemulihan"
 * Top 15 kabupaten terparah (horizontal bar + badge)
 *
 * Transisi 2→3 — "Aceh, Sumatera Utara, Sumatera Barat: Siapa Paling Terdampak?"
 * 3 kartu provinsi dengan angka kunci
 *
 * Data: insight.json → fasilitas_infrastruktur, keluarga, ringkasan_dataset
 */

import React, { useEffect, useRef, useState } from 'react';
import insights from '../insight.json';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────
   Warna kondisi fasilitas
───────────────────────────────────────────*/
const KONDISI_COLOR = {
  'Baik':          '#81C784',
  'Rusak Ringan':  '#FFD54F',
  'Rusak Sedang':  '#FFB74D',
  'Rusak Berat':   '#e74c3c',
};

const KAT_COLOR = {
  'Pendidikan':   '#4FC3F7',
  'Kesehatan':    '#81C784',
  'Ekonomi':      '#FFB74D',
  'Sosial/Ibadah':'#CE93D8',
};

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
   Utility Peta: Menggerakkan Kamera Peta (FlyTo)
───────────────────────────────────────────*/
function MapFlyToUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [center, zoom, map]);
  return null;
}

/* ─────────────────────────────────────────
   Scene 1: Kelumpuhan Kota (Interaktif Map + Chart)
───────────────────────────────────────────*/
function SceneKelumpuhanKota() {
  const containerRef = useRef(null);
  const [activeLocation, setActiveLocation] = useState(0);

  // 1. Ekstrak Data untuk Bar Chart Recharts
  const kondisiPerKat = insights?.fasilitas_infrastruktur?.kondisi_per_kategori || {};
  let totalBaik = 0, totalRingan = 0, totalSedang = 0, totalBerat = 0;
  
  Object.values(kondisiPerKat).forEach(kat => {
    totalBaik += kat['Baik']?.n || 0;
    totalRingan += kat['Rusak Ringan']?.n || 0;
    totalSedang += kat['Rusak Sedang']?.n || 0;
    totalBerat += kat['Rusak Berat']?.n || 0;
  });

  const chartData = [
    { name: 'Baik', jumlah: totalBaik, fill: '#81C784' },
    { name: 'Ringan', jumlah: totalRingan, fill: '#FFD54F' },
    { name: 'Sedang', jumlah: totalSedang, fill: '#FFB74D' },
    { name: 'Berat', jumlah: totalBerat, fill: '#e74c3c' },
  ];

  // 2. Data Koordinat Peta (Berurutan sesuai foto)
  const MAP_LOCATIONS = [
    { name: 'Padang Panjang', coords: [-0.4607, 100.4022], zoom: 12, color: '#81C784' }, // Baik
    { name: 'Pidie Jaya', coords: [5.0760, 96.2238], zoom: 12, color: '#FFD54F' },       // Ringan
    { name: 'Sibolga', coords: [1.7348, 98.7845], zoom: 13, color: '#FFB74D' },          // Sedang
    { name: 'Agam', coords: [-0.2646, 100.0210], zoom: 13, color: '#e74c3c' }            // Berat
  ];

  // 3. Pemicu GSAP ScrollTrigger
  useGSAP(() => {
    const steps = gsap.utils.toArray('.scroll-step');
    steps.forEach((step, i) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => setActiveLocation(i),
        onEnterBack: () => setActiveLocation(i),
      });
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} style={{ background: '#15173D', position: 'relative', padding: '4rem 0' }}>
      
      <div style={{ display: 'flex', flexDirection: 'row', padding: '0 2rem', gap: '4rem', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* --- SISI KIRI: STICKY (Map & Chart) --- */}
        <div style={{
          flex: '1',
          position: 'sticky',
          top: '5vh',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <span className="lato-bold" style={{
            fontSize: '0.78rem', letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--green)',
            display: 'block', marginBottom: '1rem',
          }}>
            Babak 2 · Scene 1
          </span>
          <h2 className="playfair-display" style={{ fontSize: '2.5rem', color: '#E5D9B6', marginBottom: '1rem', lineHeight: 1.2 }}>
            Jejak Infrastruktur:<br/>Ruang Publik yang Lumpuh
          </h2>
          <p className="lato-regular" style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Di balik angka besar itu tampak jejak kerusakan yang langsung memukul kehidupan sehari-hari. Gulir layar untuk memantau titik kerusakan dari yang teringan hingga terberat di lapangan.
          </p>

          {/* Peta Interaktif Leaflet */}
          <div style={{ position: 'relative', width: '100%', height: '320px', marginBottom: '1.5rem', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(229, 217, 182, 0.2)', zIndex: 1 }}>
            <MapContainer 
              center={MAP_LOCATIONS[0].coords} 
              zoom={10} 
              zoomControl={false} 
              scrollWheelZoom={false} 
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
                className="grayscale-map"
              />
              <MapFlyToUpdater center={MAP_LOCATIONS[activeLocation].coords} zoom={MAP_LOCATIONS[activeLocation].zoom} />
              
              {MAP_LOCATIONS.map((loc, index) => (
                <CircleMarker 
                  key={index}
                  center={loc.coords}
                  radius={index === activeLocation ? 12 : 6}
                  pathOptions={{ 
                    color: loc.color, 
                    fillColor: loc.color, 
                    fillOpacity: index === activeLocation ? 0.8 : 0.4,
                    weight: index === activeLocation ? 3 : 1
                  }}
                />
              ))}
            </MapContainer>
            
            <style>{`
              .grayscale-map {
                filter: grayscale(100%) contrast(125%) brightness(50%) !important;
              }
            `}</style>
          </div>

          {/* Bar Chart menggunakan Recharts */}
          <div style={{ width: '100%', height: '200px', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(229, 217, 182, 0.1)' }}>
            <h4 className="lato-bold" style={{ color: '#E5D9B6', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>
              Agregat Fasilitas Terdampak
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'Lato' }} width={60} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ background: '#1C1F4A', border: '1px solid rgba(229, 217, 182, 0.2)', borderRadius: '8px', color: '#fff' }} 
                  itemStyle={{ color: '#fff', fontFamily: 'Lato', fontWeight: 'bold' }}
                />
                <Bar dataKey="jumlah" radius={[0, 6, 6, 0]} barSize={16} animationDuration={1500}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- SISI KANAN: SCROLL STEPS (Foto Before-After) --- */}
        <div style={{ flex: '1', paddingBottom: '10vh' }}>
          
          {/* STEP 1: BAIK */}
          <div className="scroll-step" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ background: '#1C1F4A', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(129, 199, 132, 0.3)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(129, 199, 132, 0.2)' }}>
                <h4 className="playfair-display" style={{ color: '#81C784', fontSize: '1.8rem', margin: 0 }}>Fasilitas Kategori Baik</h4>
                <p className="lato-regular" style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>Padang Panjang, Sumatera Barat. Struktur utama selamat, namun akses sekitar terhambat material longsor.</p>
              </div>
              <div style={{ position: 'relative', width: '100%', height: '450px', background: '#000' }}>
                <img src="/assets/pkl2_1.webp" alt="Baik" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>
          </div>

          {/* STEP 2: RUSAK RINGAN */}
          <div className="scroll-step" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ background: '#1C1F4A', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255, 213, 79, 0.3)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 213, 79, 0.2)' }}>
                <h4 className="playfair-display" style={{ color: '#FFD54F', fontSize: '1.8rem', margin: 0 }}>Rusak Ringan</h4>
                <p className="lato-regular" style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>Kabupaten Pidie Jaya, Aceh. Jembatan vital penghubung desa terputus, mengganggu laju logistik.</p>
              </div>
              <div style={{ position: 'relative', width: '100%', height: '450px', background: '#000' }}>
                <img src="/assets/pkl4_1.webp" alt="Rusak Ringan" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>
          </div>

          {/* STEP 3: RUSAK SEDANG */}
          <div className="scroll-step" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ background: '#1C1F4A', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255, 183, 77, 0.3)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 183, 77, 0.2)' }}>
                <h4 className="playfair-display" style={{ color: '#FFB74D', fontSize: '1.8rem', margin: 0 }}>Rusak Sedang</h4>
                <p className="lato-regular" style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>Kota Sibolga, Sumatera Utara. Longsor mulai menyentuh dan merusak sebagian rumah-rumah warga di perbukitan.</p>
              </div>
              <div style={{ position: 'relative', width: '100%', height: '450px', background: '#000' }}>
                <img src="/assets/pkl3_1.webp" alt="Rusak Sedang" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>
          </div>

          {/* STEP 4: RUSAK BERAT */}
          <div className="scroll-step" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ background: '#1C1F4A', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(231, 76, 60, 0.5)', boxShadow: '0 0 25px rgba(231,76,60,0.3)' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(231, 76, 60, 0.2)' }}>
                <h4 className="playfair-display" style={{ color: '#e74c3c', fontSize: '1.8rem', margin: 0, fontWeight: 'bold' }}>Rusak Berat</h4>
                <p className="lato-regular" style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>Palembayan, Agam, Sumatera Barat. Kehancuran total; fasilitas sosial dan pemukiman rata dengan tanah tersapu banjir bandang.</p>
              </div>
              <div style={{ position: 'relative', width: '100%', height: '450px', background: '#000' }}>
                <img src="/assets/pkl1.webp" alt="Rusak Berat" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Scene 2: Kelumpuhan Desa — per provinsi
───────────────────────────────────────────*/
const PROVINSI_TARGET = [
  { key: 'Aceh',          label: 'Aceh: Dampak Bencana Hingga Tingkat Desa', color: '#e74c3c' },
  { key: 'Sumatera Utara', label: 'Sumatera Utara: Dampak Bencana Hingga Tingkat Desa', color: '#f39c12' },
  { key: 'Sumatera Barat', label: 'Sumatera Barat: Dampak Bencana Hingga Tingkat Desa', color: '#2ecc71' },
];

function DesaCard({ desa, pct, kecamatan, color, delay, show }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (show) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [show, delay]);

  return (
    <div style={{
      padding: '1rem 1.2rem',
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${color}2a`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 10,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 0.4s ease, transform 0.4s ease`,
    }}>
      <div className="lato-bold" style={{ fontSize: '0.84rem', color: '#fff', marginBottom: '0.2rem' }}>
        {desa}
      </div>
      <div className="lato-regular" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.7rem' }}>
        {kecamatan}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: visible ? `${Math.min(pct, 100)}%` : '0%',
            background: color,
            borderRadius: 3,
            transition: 'width 0.8s ease 0.2s',
          }} />
        </div>
        <span className="lato-bold" style={{ fontSize: '0.78rem', color, whiteSpace: 'nowrap' }}>
          {pct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function ProvinsiSection({ prov, data }) {
  const [ref, visible] = useInView(0.1);
  const desaList = (data || [])
    .sort((a, b) => (b.pct_bangunan_rusak || 0) - (a.pct_bangunan_rusak || 0))
    .slice(0, 9);

  return (
    <div ref={ref} style={{ marginBottom: '4rem' }}>
      {/* Header provinsi */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        marginBottom: '0.75rem',
      }}>
        <div style={{
          width: 4, height: 32,
          background: prov.color,
          borderRadius: 2,
          boxShadow: `0 0 8px ${prov.color}88`,
        }} />
        <h3 className="playfair-display" style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
          color: '#fff',
          margin: 0,
        }}>
          {prov.label}
        </h3>
      </div>

      {desaList.length === 0 ? (
        <div className="lato-regular" style={{
          fontSize: '0.88rem',
          color: 'rgba(255,255,255,0.3)',
          padding: '1rem 1.5rem',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10,
        }}>
          Data desa akan tersedia setelah insight.json dihasilkan.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.75rem',
        }}>
          {desaList.map((d, i) => {
            const pct = d.pct_bangunan_rusak || 0;
            const color = pct > 60 ? '#e74c3c' : pct > 30 ? '#FFB74D' : '#81C784';
            return (
              <DesaCard
                key={`${d.kecamatan}-${d.desa}`}
                desa={d.desa}
                kecamatan={d.kecamatan}
                pct={pct}
                color={color}
                delay={i * 80}
                show={visible}
              />
            );
          })}
        </div>
      )}

      {/* Teks jembatan */}
      <div className="lato-regular-italic" style={{
        marginTop: '1.5rem',
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.35)',
        textAlign: 'right',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: '1rem',
      }}>
        "Cerita serupa juga terjadi di provinsi lain."
      </div>
    </div>
  );
}

function SceneKelumpuhanDesa() {
  const perDesa = insights?.keluarga?.per_desa || [];

  // Group by provinsi
  const desaByProv = {};
  PROVINSI_TARGET.forEach(p => {
    desaByProv[p.key] = perDesa.filter(d =>
      d.provinsi?.toLowerCase().includes(p.key.toLowerCase())
    );
  });

  return (
    <section style={{
      background: 'linear-gradient(180deg, #15173d 0%, #0a0b1f 100%)',
      padding: '7rem 2rem',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <span className="lato-bold" style={{
          fontSize: '0.78rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#FFB74D',
          display: 'block', marginBottom: '1rem',
        }}>
          Babak 2 · Scene 2
        </span>
        <h2 className="playfair-display" style={{
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          color: '#fff', lineHeight: 1.2, marginBottom: '1rem',
        }}>
          Detail Hingga{' '}
          <span style={{ color: '#FFB74D' }}>Sudut Desa</span>
        </h2>
        <p className="lato-regular" style={{
          fontSize: '1.05rem', lineHeight: 1.85,
          color: 'var(--beige)', opacity: 0.85,
          maxWidth: 640, marginBottom: '3.5rem',
        }}>
          Kerusakan tidak merata. Setiap desa menanggung luka yang berbeda-beda —
          dari yang sedikit tergores hingga yang rata dengan tanah.
        </p>

        {PROVINSI_TARGET.map(prov => (
          <ProvinsiSection
            key={prov.key}
            prov={prov}
            data={desaByProv[prov.key]}
          />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Scene 3: Narasi Layanan Dasar
───────────────────────────────────────────*/
const LAYANAN_ITEMS = [
  {
    icon: '⚡',
    judul: 'Listrik Padam',
    narasi: 'Jaringan listrik rusak parah. Ratusan desa kehilangan penerangan — aktivitas ekonomi dan pendidikan terhenti dalam gelap.',
    color: '#FFD54F',
    animClass: 'icon-power',
  },
  {
    icon: '💧',
    judul: 'Air Mengering',
    narasi: 'Pipa distribusi dan sumber air terdampak. Warga harus berjalan jauh untuk mendapatkan air bersih yang layak konsumsi.',
    color: '#4FC3F7',
    animClass: 'icon-water',
  },
  {
    icon: '🚽',
    judul: 'Sanitasi Terganggu',
    narasi: 'Fasilitas sanitasi rusak atau tidak dapat diakses. Risiko penyakit menular meningkat di kawasan hunian sementara.',
    color: '#81C784',
    animClass: 'icon-toilet',
  },
];

function LayananCard({ item, delay, show }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (show) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [show, delay]);

  return (
    <div style={{
      display: 'flex',
      gap: '1.5rem',
      alignItems: 'flex-start',
      padding: '2rem',
      background: 'rgba(0,0,0,0.35)',
      borderRadius: 16,
      border: `1px solid ${item.color}22`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-24px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      <div style={{
        width: 64, height: 64,
        flexShrink: 0,
        borderRadius: '50%',
        background: `${item.color}18`,
        border: `2px solid ${item.color}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        animation: visible ? `${item.animClass} 2s ease-in-out infinite` : 'none',
      }}>
        {item.icon}
      </div>
      <div>
        <h3 className="lato-bold" style={{
          fontSize: '1.05rem',
          color: item.color,
          marginBottom: '0.5rem',
        }}>
          {item.judul}
        </h3>
        <p className="lato-regular" style={{
          fontSize: '0.92rem',
          lineHeight: 1.75,
          color: 'var(--beige)',
          opacity: 0.8,
          margin: 0,
        }}>
          {item.narasi}
        </p>
      </div>
    </div>
  );
}

function SceneLayananDasar() {
  const [ref, visible] = useInView(0.15);

  // Data dari insight.json - status pengungsian & kondisi
  const statusHunian = insights?.rumah_tangga?.status_hunian || {};
  const pengungsian = statusHunian['3. Pengungsian']?.n || 0;
  const huntara     = statusHunian['6. Huntara']?.n || 0;

  return (
    <section style={{
      background: '#0a0b1f',
      padding: '7rem 2rem',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <span className="lato-bold" style={{
          fontSize: '0.78rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#4FC3F7',
          display: 'block', marginBottom: '1rem',
        }}>
          Babak 2 · Scene 3
        </span>
        <h2 className="playfair-display" style={{
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          color: '#fff', lineHeight: 1.2, marginBottom: '1rem',
        }}>
          Saat Kota{' '}
          <span style={{ color: '#4FC3F7' }}>Kehilangan Denyutnya</span>
        </h2>
        <p className="lato-regular" style={{
          fontSize: '1.05rem', lineHeight: 1.85,
          color: 'var(--beige)', opacity: 0.85,
          maxWidth: 640, marginBottom: '3.5rem',
        }}>
          Dampak bencana tidak hanya dirasakan oleh rumah tangga.
          Lingkungan yang menopang kehidupan masyarakat pun ikut lumpuh.
        </p>

        <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '3rem' }}>
          {LAYANAN_ITEMS.map((item, i) => (
            <LayananCard key={item.judul} item={item} delay={i * 200} show={visible} />
          ))}
        </div>

        {/* Stat hunian sementara */}
        {(pengungsian > 0 || huntara > 0) && (
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap',
            padding: '1.5rem 2rem',
            background: 'rgba(231,76,60,0.06)',
            borderRadius: 14,
            border: '1px solid rgba(231,76,60,0.2)',
          }}>
            <div style={{ textAlign: 'center', flex: '1 1 120px' }}>
              <div className="playfair-display" style={{ fontSize: '2rem', color: '#e74c3c', fontWeight: 700 }}>
                {huntara.toLocaleString('id-ID')}
              </div>
              <div className="lato-regular" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                KK di Huntara
              </div>
            </div>
            <div style={{ textAlign: 'center', flex: '1 1 120px' }}>
              <div className="playfair-display" style={{ fontSize: '2rem', color: '#FFB74D', fontWeight: 700 }}>
                {pengungsian.toLocaleString('id-ID')}
              </div>
              <div className="lato-regular" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                KK di Pengungsian
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS animations layanan ikon */}
      <style>{`
        @keyframes icon-power {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; filter: grayscale(0.8); }
        }
        @keyframes icon-water {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.85); }
        }
        @keyframes icon-toilet {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-10deg); }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   Scene 4: Zona Prioritas — Top 15 kabupaten
───────────────────────────────────────────*/
function SceneZonaPrioritas() {
  const [ref, started] = useInView(0.15);

  const peringkat = insights?.infrastruktur?.peringkat_kabupaten_terparah || [];

  // Fallback: build ranking dari fasilitas per kategori jika peringkat kosong
  const jumlahPerProv = insights?.fasilitas_infrastruktur?.jumlah_per_provinsi_per_kategori || {};
  const hasRanking = peringkat.length > 0;

  return (
    <section style={{
      background: 'linear-gradient(180deg, #0a0b1f 0%, #0d1a10 100%)',
      padding: '7rem 2rem',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <span className="lato-bold" style={{
          fontSize: '0.78rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#e74c3c',
          display: 'block', marginBottom: '1rem',
        }}>
          Babak 2 · Scene 4
        </span>
        <h2 className="playfair-display" style={{
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          color: '#fff', lineHeight: 1.2,
          marginBottom: '1rem',
        }}>
          Menentukan{' '}
          <span style={{ color: '#e74c3c' }}>Zona Prioritas</span>{' '}
          Pemulihan
        </h2>
        <p className="lato-regular" style={{
          fontSize: '1.05rem', lineHeight: 1.85,
          color: 'var(--beige)', opacity: 0.85,
          maxWidth: 660, marginBottom: '3.5rem',
        }}>
          Tidak semua wilayah menanggung luka yang sama. Melalui pemetaan titik kerusakan,
          kami merumuskan Zona Prioritas Pemulihan — di sinilah denyut nadi bantuan
          harus dipompa paling kencang.
        </p>

        {/* Ranking list */}
        <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {!hasRanking && (
            <div className="lato-regular" style={{
              padding: '1.5rem',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              color: 'rgba(255,255,255,0.35)',
              fontSize: '0.9rem',
            }}>
              💡 Data peringkat kabupaten akan muncul setelah insight.json dihasilkan dengan field{' '}
              <code style={{ color: 'var(--green)' }}>infrastruktur.peringkat_kabupaten_terparah</code>.
            </div>
          )}

          {peringkat.map((item, i) => {
            const barWidth = started
              ? `${Math.min((item.total_hilang / (peringkat[0]?.total_hilang || 1)) * 100, 100)}%`
              : '0%';
            const isTop3 = i < 3;
            return (
              <div key={item.kabupaten} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                background: isTop3
                  ? 'rgba(231,76,60,0.08)'
                  : 'rgba(255,255,255,0.02)',
                borderRadius: 12,
                border: isTop3
                  ? '1px solid rgba(231,76,60,0.25)'
                  : '1px solid rgba(255,255,255,0.05)',
              }}>
                <div className="lato-black" style={{
                  width: 36, height: 36, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%',
                  background: isTop3 ? '#e74c3c' : 'rgba(255,255,255,0.08)',
                  fontSize: '0.85rem',
                  color: '#fff',
                }}>
                  {item.rank}
                </div>
                <div style={{ flex: '0 0 220px', minWidth: 0 }}>
                  <div className="lato-bold" style={{ fontSize: '0.9rem', color: '#fff' }}>
                    {item.kabupaten}
                  </div>
                  <div className="lato-regular" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                    {item.provinsi}
                  </div>
                </div>
                <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: barWidth,
                    background: isTop3
                      ? 'linear-gradient(90deg, #e74c3c, #ff6b6b)'
                      : 'linear-gradient(90deg, #628141, #8aaf5a)',
                    borderRadius: 4,
                    transition: `width 1s ${i * 0.06}s ease`,
                  }} />
                </div>
                <div className="lato-bold" style={{
                  fontSize: '0.85rem',
                  color: isTop3 ? '#e74c3c' : 'var(--green)',
                  flexShrink: 0,
                  minWidth: 52,
                  textAlign: 'right',
                }}>
                  {item.persen_kelumpuhan?.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Transisi Babak 2→3: Siapa Paling Terdampak?
───────────────────────────────────────────*/
const PROVINSI_CARDS = [
  {
    nama: 'Sumatera Utara',
    peran: 'Episenter',
    deskripsi: 'Korban meninggal terbanyak. Pusat gempa berada di wilayah ini.',
    color: '#e74c3c',
    icon: '💔',
  },
  {
    nama: 'Aceh',
    peran: 'Isolasi Wilayah',
    deskripsi: 'Sejumlah wilayah mengalami isolasi akibat putusnya akses jalan dan jembatan.',
    color: '#f39c12',
    icon: '🔒',
  },
  {
    nama: 'Sumatera Barat',
    peran: 'Infrastruktur Terputus',
    deskripsi: 'Fokus kerusakan infrastruktur — jalur Padang–Bukittinggi terputus.',
    color: '#2ecc71',
    icon: '🛣️',
  },
];

function TransisiBabak23() {
  const [ref, visible] = useInView(0.15);

  const kabPerProv = insights?.cakupan_geografis_infra?.kab_kota_per_provinsi || {};
  const desaPerProv = insights?.cakupan_geografis_infra?.desa_per_provinsi || {};

  return (
    <section style={{
      background: '#050510',
      padding: '7rem 2rem',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        <div className="lato-bold" style={{
          fontSize: '0.78rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
          marginBottom: '1.5rem', textAlign: 'center',
        }}>
          Transisi
        </div>
        <h2 className="playfair-display" style={{
          fontSize: 'clamp(1.6rem, 4vw, 3rem)',
          color: '#fff',
          textAlign: 'center',
          lineHeight: 1.3,
          marginBottom: '1rem',
          maxWidth: 780,
          margin: '0 auto 1rem',
        }}>
          Aceh, Sumatera Utara, Sumatera Barat:<br />
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Siapa Paling Terdampak?</span>
        </h2>
        <p className="lato-regular" style={{
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          maxWidth: 560,
          margin: '0 auto 4rem',
          lineHeight: 1.8,
        }}>
          Sumut menjadi episenter dengan korban meninggal terbanyak.
          Aceh mengalami isolasi wilayah. Sumbar fokus kerusakan infrastruktur.
        </p>

        <div ref={ref} style={{
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {PROVINSI_CARDS.map((prov, i) => (
            <div key={prov.nama} style={{
              flex: '1 1 260px',
              maxWidth: 300,
              padding: '2rem',
              background: `${prov.color}0a`,
              border: `1px solid ${prov.color}33`,
              borderTop: `3px solid ${prov.color}`,
              borderRadius: 16,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 0.5s ease ${i * 0.15}s, transform 0.5s ease ${i * 0.15}s`,
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{prov.icon}</div>
              <div className="lato-bold" style={{
                fontSize: '0.72rem', letterSpacing: '0.18em',
                textTransform: 'uppercase', color: prov.color,
                marginBottom: '0.4rem',
              }}>
                {prov.peran}
              </div>
              <div className="playfair-display" style={{
                fontSize: '1.3rem', color: '#fff', marginBottom: '0.75rem',
              }}>
                {prov.nama}
              </div>
              <p className="lato-regular" style={{
                fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.7, margin: 0,
              }}>
                {prov.deskripsi}
              </p>
              {/* Angka kunci */}
              <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: `1px solid ${prov.color}22` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {desaPerProv[prov.nama] && (
                    <div>
                      <div className="lato-bold" style={{ fontSize: '1.1rem', color: prov.color }}>
                        {desaPerProv[prov.nama].toLocaleString('id-ID')}
                      </div>
                      <div className="lato-regular" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                        Desa Terdata
                      </div>
                    </div>
                  )}
                  {kabPerProv[prov.nama] && (
                    <div>
                      <div className="lato-bold" style={{ fontSize: '1.1rem', color: prov.color }}>
                        {kabPerProv[prov.nama]}
                      </div>
                      <div className="lato-regular" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                        Kab/Kota
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Komponen Utama: BabakInfrastruktur
───────────────────────────────────────────*/
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