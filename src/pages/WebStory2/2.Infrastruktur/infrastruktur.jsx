/* ─────────────────────────────────────────────────────────────────
   Infrastruktur yang Baru (2.0)
───────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState, useCallback } from 'react';
import insights from '../insight.json';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useInView from '../shared/useInView';
import BgSeam from '../shared/BgSeam';
import BarTrack from '../shared/BarTrack';
import { WS2 } from '../ws2-tokens';
import {
  TARGET_FEATURES, CONTEXT_FEATURES, NAME_TO_INDEX, provBounds, targetBounds,
} from '../shared/sumateraGeo';
import {
  pctRT, fmtPct, fmtN, CAPTION_RT,
  LISTRIK_NON_PLN, LISTRIK_NON_PLN_BERLISTRIK, LISTRIK_TIDAK_ADA,
  AIR_TAK_LAYAK, AIR_MATA_AIR_TAK_TERLINDUNG, AIR_PERMUKAAN,
  MCK_TIDAK_ADA, MCK_UMUM_KOMUNAL, MCK_TANPA_AKSES_SENDIRI,
} from '../shared/rtStats';
import './infrastruktur.css';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────
   UTILITY HOOKS
───────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────────────────────────── */
function AnimatedCounter({ value, duration = 2.5, suffix = '' }) {
  const spanRef = useRef(null);
  const [containerRef, inView] = useInView();
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
/* ── Poligon highlight peta Babak 2 (permintaan notula) ─────────────────
   Nama provinsi di kartu ("Aceh") berbeda dari nama di GeoJSON ("ACEH"). */
const PROV_GEO_NAME = {
  Aceh: 'ACEH',
  'Sumatera Utara': 'SUMATERA UTARA',
  'Sumatera Barat': 'SUMATERA BARAT',
};

const TARGET_FEATURES_FC = { type: 'FeatureCollection', features: TARGET_FEATURES };
const CONTEXT_FEATURES_FC = { type: 'FeatureCollection', features: CONTEXT_FEATURES };

/* Kepekatan isian mengikuti jumlah desa terdampak: Aceh 556, Sumut 292,
   Sumbar 80. Rumus 0,14 + 0,36 x (desa / desa terbanyak). */
const FILL_BY_NAME = (() => {
  const desa = insights?.cakupan_geografis_infra?.desa_per_provinsi || {};
  const byGeo = Object.fromEntries(
    Object.entries(PROV_GEO_NAME).map(([kartu, geo]) => [geo, desa[kartu] || 0]),
  );
  const maks = Math.max(...Object.values(byGeo), 1);
  const out = {};
  Object.entries(byGeo).forEach(([geo, n]) => { out[geo] = 0.14 + 0.36 * (n / maks); });
  // Legenda memakai nama kartu, peta memakai nama GeoJSON.
  Object.entries(PROV_GEO_NAME).forEach(([kartu, geo]) => { out[kartu] = out[geo]; });
  return out;
})();

/* Empat kategori fasilitas di permukaan KREM. Empat hue palet yang benar-benar
   berbeda — dulu keduanya berpasangan menjadi hex yang sama. */
const KAT_COLOR = {
  'Sosial/Ibadah': '#15173D',
  Pendidikan: '#628141',
  Kesehatan: '#E67E22',
  Ekonomi: 'rgba(21,23,61,0.35)',
};

/* Menggeser kamera dengan fitBounds, bukan flyTo. Selisih zoom antar provinsi
   di sini kecil, jadi Leaflet menganimasikannya lurus tanpa busur
   zoom-out-lalu-zoom-in. */
function MapFitUpdater({ bounds }) {
  const map = useMap();
  const key = bounds ? JSON.stringify(bounds) : '';
  useEffect(() => {
    if (!map || !bounds) return;
    try {
      map.fitBounds(bounds, { animate: true, duration: 1.2, easeLinearity: 0.3, padding: [32, 32] });
    } catch {
      // Container belum terukur; pemanggilan berikutnya akan mengoreksi.
    }
    // key adalah serialisasi bounds: cukup untuk memicu, dan menghindari
    // tween ulang ketika array bounds identik tetapi identitasnya baru.
  }, [map, key, bounds]);
  return null;
}

const SCENE2_ANCHOR_ID = 'scene2-kelumpuhan-desa';

/* ─────────────────────────────────────────────────────────────────
   RISK LEVELS (dipakai bersama Scene 2 & legenda peta)
───────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────
   TYPOGRAPHY OBJECTS
───────────────────────────────────────────────────────────────── */

/* ╔═══════════════════════════════════════════════════════════════╗
   ║  SCENE 1 — KELUMPUHAN KOTA  (NAVY)                           ║
   ║  Vertical split: documentary photo left, data right           ║
   ╚═══════════════════════════════════════════════════════════════╝ */
/* Urutan kategori fasilitas, dari yang terbanyak. Dipakai bersama oleh kartu
   sektor Scene 1 dan stacked bar per provinsi. */
const KAT_ORDER = ['Sosial/Ibadah', 'Pendidikan', 'Kesehatan', 'Ekonomi'];

/* Severity itu ORDINAL, bukan kategorikal: satu hue, tangga alpha. Dulu
   "Baik" diberi #15173D — persis warna latar — sehingga segmen terbesar di
   tiap kartu (62-80%) sama sekali tidak terlihat. */
const SEV_ITEMS = [
  { key: 'berat',  label: 'Rusak Berat',  tone: 'accent' },
  { key: 'sedang', label: 'Rusak Sedang', tone: 'accent-2' },
  { key: 'ringan', label: 'Rusak Ringan', tone: 'accent-3' },
  { key: 'baik',   label: 'Baik',         tone: 'neutral' },
];
const SEV_SWATCH = {
  accent: 'var(--ws2-sev-4)',
  'accent-2': 'var(--ws2-sev-3)',
  'accent-3': 'var(--ws2-sev-2)',
  neutral: 'var(--ws2-sev-1)',
};

function SceneKelumpuhanKota() {
  const [ref, inView] = useInView();
  
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

  /* Dulu hanya tiga kategori yang di-hardcode di sini, sementara loop totals
     di bawahnya menghitung SEMUA kategori. Akibatnya counter "Total Fasilitas
     Terdata" menulis 2.548 sedangkan tiga kartu di bawahnya hanya menjelaskan
     1.442 — 1.106 unit Sosial/Ibadah, kelompok TERBESAR, menguap. */
  const chartDataByKat = KAT_ORDER.map((key) => {
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



  return (
    <section className="infra-section infra-bg-navy infra-grain" style={{ padding: 0, overflow: 'hidden' }}>

      <div ref={ref} className="infra-grid-photo-chart">

        {/* ═══════ LEFT: Framed Documentary Photo ═══════ */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 0,
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.8s var(--ws2-reveal-ease), transform 0.8s var(--ws2-reveal-ease)',
        }}>
          {/* Bingkai memakai aspect-ratio 0,78 (di antara rasio pkl2 dan pkl3)
              supaya objectFit 'contain' hampir tidak menyisakan bar samping.
              JANGAN diganti 'cover': caption yang terbakar di dalam foto
              akan terpotong — itulah "jangan dibuat cut". */}
          <div className="infra-photo-frame">
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
                      filter: 'grayscale(0.35) brightness(0.8) saturate(0.7)',
                    }}
                  />
                </div>
              );
            })}
            
          </div>

          {/* Indikator dikeluarkan dari bingkai: menumpuk di atas foto membuat
              sudut kanan-atas gambar selalu tertutup. */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '0.9rem',
          }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveSlide(i); startAuto(); }}
                  style={{
                    width: activeSlide === i ? 18 : 6, height: 6,
                    borderRadius: 'var(--ws2-r-pill)',
                    background: activeSlide === i ? 'var(--ws2-text-1)' : 'var(--ws2-text-4)',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'width 0.4s var(--ws2-reveal-ease), background 0.4s ease',
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
            ))}
          </div>
        </div>

        {/* ═══════ RIGHT: Data & Visualization ═══════ */}
        <div style={{
          padding: 'clamp(1.5rem,3vh,2.5rem) 0',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          position: 'relative',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s',
        }}>

          {/* Section header */}
          <div style={{ marginBottom: 'clamp(2rem,3.5vw,3rem)' }}>
            <h2 className="t-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', margin: 0, color: 'var(--ws2-text-1)' }}>
              Kerusakan Infrastruktur Publik
            </h2>
          </div>

          {/* Key figures */}
          <div style={{ display: 'flex', gap: 'clamp(2rem,4vw,3.5rem)', marginBottom: 'clamp(2.5rem,4vw,3.5rem)', flexWrap: 'wrap' }}>
            <div>
              <div className="t-display" style={{ fontSize: 'clamp(2.4rem,4vw,3.4rem)', fontWeight: 700, color: 'var(--ws2-text-1)', lineHeight: 1 }}>
                <AnimatedCounter value={totalFas} duration={2.5} />
              </div>
              <div className="t-eyebrow" style={{ color: 'var(--ws2-text-4)', fontSize: '0.62rem', marginTop: '0.55rem', letterSpacing: '0.16em' }}>
                Total Fasilitas Terdata
              </div>
              <div className="t-body" style={{ fontSize: '0.68rem', color: 'var(--ws2-text-4)', marginTop: '0.4rem', maxWidth: 260, lineHeight: 1.5 }}>
                dari {fmtN(insights?.ringkasan_dataset?.total_fasilitas_gabungan || 0)} fasilitas terdata,
                {' '}{fmtN(totalFas)} di antaranya memiliki catatan kondisi
              </div>
            </div>
            <div style={{ width: 1, background: 'var(--ws2-line-1)', alignSelf: 'stretch', flexShrink: 0 }} />
            <div>
              <div className="t-display" style={{ fontSize: 'clamp(2.4rem,4vw,3.4rem)', fontWeight: 700, color: 'var(--ws2-accent)', lineHeight: 1 }}>
                {pctBerat}<span style={{ fontSize: '0.55em' }}>%</span>
              </div>
              <div className="t-eyebrow" style={{ color: 'var(--ws2-text-4)', fontSize: '0.62rem', marginTop: '0.55rem', letterSpacing: '0.16em' }}>
                Rusak Berat
              </div>
            </div>
          </div>

          {/* ── Editorial Sector Cards with full breakdown ── */}
          <div className="infra-sector-grid">
            {chartDataByKat.map((kat, ki) => {
              const items = SEV_ITEMS.map((sev) => ({ ...sev, val: kat[sev.key] }));

              return (
                <div key={kat.name} className="ws2-card" style={{
                  display: 'flex', flexDirection: 'column',
                  gap: '1rem',
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.8s var(--ws2-reveal-ease) ${ki * 0.12}s, transform 0.8s var(--ws2-reveal-ease) ${ki * 0.12}s`,
                }}>
                  {/* Nama sektor tidak perlu diberi warna sendiri — namanya sudah
                      membedakan, dan warna di sini bertabrakan arti dengan skala
                      severity di bawahnya. */}
                  <div className="t-eyebrow" style={{ color: 'var(--ws2-text-3)', fontSize: '0.72rem' }}>
                    {kat.name.toUpperCase()}
                  </div>

                  {/* Total unit — large Playfair */}
                  <div>
                    <div className="t-display" style={{
                      fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                      fontWeight: 700, color: 'var(--ws2-text-1)',
                      lineHeight: 1,
                    }}>
                      {kat.total.toLocaleString('id-ID')}
                    </div>
                    <div className="t-body" style={{ fontSize: '0.72rem', color: 'var(--ws2-text-4)', marginTop: '0.25rem' }}>
                      unit fasilitas
                    </div>
                  </div>

                  {/* Separator */}
                  <div style={{ height: 1, background: 'rgba(229,217,182,0.08)' }} />

                  {/* Dot + label + progress line for each severity */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {items.filter(s => s.val > 0).map((sev, si) => {
                      const pct = kat.total > 0 ? (sev.val / kat.total) * 100 : 0;
                      return (
                        <div key={sev.key}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span className="ws2-swatch" style={{
                                background: SEV_SWATCH[sev.tone],
                                boxShadow: sev.tone === 'neutral' ? 'inset 0 0 0 1px var(--ws2-sev-1-line)' : 'none',
                              }} />
                              <span className="lato-light" style={{ fontSize: '0.75rem', color: 'var(--ws2-text-3)' }}>{sev.label}</span>
                            </div>
                            <span className="lato-bold" style={{ fontSize: '0.72rem', color: 'var(--ws2-text-1)' }}>
                              {sev.val.toLocaleString('id-ID')} <span style={{ color: 'var(--ws2-text-4)', fontWeight: 300 }}>({pct.toFixed(1)}%)</span>
                            </span>
                          </div>
                          <BarTrack
                            mode="share"
                            value={pct}
                            surface="navy"
                            tone={sev.tone}
                            visible={inView}
                            delay={0.3 + si * 0.1}
                          />
                        </div>
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
/* Titik lokasi provinsi.

   Dulu 14px (22px saat aktif) dan diwarnai per provinsi — Aceh krem di atas
   tile terang, praktis tak terlihat. Kini semuanya oranye + border putih +
   glow, karena ini menandai LOKASI (bukan kategori); pembeda provinsi sudah
   dibawa poligon di bawahnya. Notula: "perjelas dan tegaskan titik lokasi". */
function Scene2ProvinceMarker({ lat, lng, label, isActive, onClick }) {
  const map = useMap();
  useEffect(() => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
    const size = isActive ? 24 : 18;
    const icon = L.divIcon({
      className: '',
      html: `
        <div style="
          position:relative;width:${size}px;height:${size}px;
          border-radius:50%;
          background:${WS2.accent};
          border:2px solid ${WS2.white};
          box-shadow:0 0 0 5px rgba(230,126,34,0.25), 0 0 16px 4px rgba(230,126,34,0.55);
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
      offset: [0, -size / 2 - 6],
    });
    return () => { map.removeLayer(marker); };
  }, [map, lat, lng, label, isActive, onClick]);
  return null;
}

function SceneKelumpuhanDesa() {
  const [ref, inView] = useInView();
  const [activeProv, setActiveProv] = useState(null);
  const [cardsInView, setCardsInView] = useState(false);
  const cardsRef = useRef(null);

  /* Tampilan awal: gabungan bounds ketiga provinsi target, bukan
     center+zoom tebakan. */
  const DEFAULT_CENTER = [2.0, 98.5];
  const DEFAULT_ZOOM = 6;

  const PROVINSI = [
    {
      key: 'Aceh', title: 'Aceh',
      tagline: 'Wilayah terisolir — akses jalan putus total.',
      lat: 4.6951, lng: 96.7494,
    },
    {
      key: 'Sumatera Utara', title: 'Sumatera Utara',
      tagline: 'Episenter bencana — korban jiwa terbanyak.',
      lat: 2.1154, lng: 98.9451,
    },
    {
      key: 'Sumatera Barat', title: 'Sumatera Barat',
      tagline: 'Jalur ekonomi Padang–Bukittinggi lumpuh.',
      lat: -0.7390, lng: 100.8000,
    },
  ];

  const mapBounds = activeProv !== null
    ? provBounds(PROV_GEO_NAME[PROVINSI[activeProv].key])
    : targetBounds();

  /* Sebaran fasilitas: porsi dari total tiga provinsi (share), bukan
     normalisasi ke provinsi terbesar. */
  const jumlahPerProv = insights?.fasilitas_infrastruktur?.jumlah_per_provinsi_per_kategori || {};
  const totalsArr = Object.entries(jumlahPerProv).map(([prov, kat]) => ({
    prov,
    total: Object.values(kat).reduce((a, v) => a + v, 0),
  }));
  const totalSebaran = totalsArr.reduce((a, x) => a + x.total, 0) || 1;
  const sebaran = totalsArr
    .map(({ prov, total }) => ({ provinsi: prov, total, persen: (total / totalSebaran) * 100 }))
    .sort((a, b) => b.total - a.total);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setCardsInView(true); },
      { threshold: 0.15 },
    );
    if (cardsRef.current) obs.observe(cardsRef.current);
    return () => obs.disconnect();
  }, []);

  const handleCardClick = useCallback((index) => {
    setActiveProv((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section id={SCENE2_ANCHOR_ID} className="infra-section infra-bg-cream infra-grain" style={{ padding: 'clamp(5rem,8vw,7rem) 0 0' }}>
      {/* ── Header (rata kiri, satu container dengan sisanya) ── */}
      <div ref={ref} style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.25rem, 3vw, 2.5rem)' }}>
        <div style={{
          marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.8s var(--ws2-reveal-ease), transform 0.8s var(--ws2-reveal-ease)',
        }}>
          <h2 className="t-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', margin: 0, color: 'var(--ws2-ink-1)' }}>
            Cakupan Wilayah Terdampak
          </h2>
        </div>
      </div>

      {/* ── Peta full-bleed; indeks keparahan melayang DI ATAS peta ────────
          Kartu provinsi duduk PENUH di bawah peta, tidak menumpang. */}
      <div style={{
        position: 'relative',
        width: '100%',
        opacity: inView ? 1 : 0,
        transition: 'opacity 0.8s var(--ws2-reveal-ease) 0.15s',
      }}>
        <div style={{ width: '100%', height: 'clamp(460px, 56vw, 680px)', position: 'relative' }}>
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            zoomSnap={0.25}
            zoomControl={false}
            scrollWheelZoom={false}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              maxZoom={19}
            />

            {/* Poligon highlight (permintaan notula). Provinsi non-target
                hanya garis konteks; tiga provinsi target diberi isian yang
                kepekatannya mengikuti jumlah desa terdampak. */}
            <GeoJSON
              key={`ctx-${activeProv}`}
              data={CONTEXT_FEATURES_FC}
              interactive={false}
              style={{ color: 'rgba(229,217,182,0.16)', weight: 0.7, fill: false }}
            />
            <GeoJSON
              key={`hl-${activeProv}`}
              data={TARGET_FEATURES_FC}
              style={(f) => {
                const idx = NAME_TO_INDEX[f.properties.name];
                const aktif = activeProv === idx;
                const lain = activeProv !== null && !aktif;
                return {
                  fillColor: WS2.accent,
                  fillOpacity: aktif ? 0.62 : lain ? 0.1 : FILL_BY_NAME[f.properties.name],
                  color: aktif ? WS2.white : WS2.cream,
                  weight: aktif ? 2.2 : 1.4,
                  opacity: 0.8,
                  lineJoin: 'round',
                };
              }}
              onEachFeature={(f, layer) => {
                const idx = NAME_TO_INDEX[f.properties.name];
                if (idx === undefined) return;
                layer.on('click', () => handleCardClick(idx));
              }}
            />

            <MapFitUpdater bounds={mapBounds} />
            {PROVINSI.map((prov, i) => (
              <Scene2ProvinceMarker
                key={prov.key}
                lat={prov.lat}
                lng={prov.lng}
                label={prov.title}
                isActive={activeProv === i}
                onClick={() => handleCardClick(i)}
              />
            ))}
          </MapContainer>

          {/* Indeks keparahan — melayang di atas peta. Ini satu-satunya panel
              kaca yang diizinkan di WS2, karena memang ada peta hidup di
              belakangnya untuk diburamkan. */}
          <div className="ws2-card ws2-card--overlay" style={{
            position: 'absolute', top: '1.25rem', right: '1.25rem',
            zIndex: 600, width: 'min(300px, 42vw)',
            display: 'flex', flexDirection: 'column', gap: '0.9rem',
          }}>
            <span className="t-eyebrow" style={{ color: 'var(--ws2-text-3)', fontSize: '0.6rem', letterSpacing: '0.18em' }}>
              SEBARAN FASILITAS TERDATA
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sebaran.map((item, i) => (
                <div key={item.provinsi}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem', gap: '0.5rem' }}>
                    <span className="lato-light" style={{ fontSize: '0.76rem', color: 'var(--ws2-text-2)' }}>
                      {item.provinsi}
                    </span>
                    <span className="lato-bold" style={{ fontSize: '0.76rem', color: 'var(--ws2-text-1)', whiteSpace: 'nowrap' }}>
                      {fmtN(item.total)}
                      <span style={{ fontWeight: 300, color: 'var(--ws2-text-4)', marginLeft: '0.35rem' }}>
                        {fmtPct(item.persen)}%
                      </span>
                    </span>
                  </div>
                  {/* mode="share": porsi dari total 2.739 fasilitas. Dulu bar
                      ini dinormalkan ke provinsi terbesar tetapi dicetak
                      sebagai persen absolut, sehingga Aceh selalu 100,0%. */}
                  <BarTrack
                    mode="share"
                    value={item.persen}
                    surface="navy"
                    tone={activeProv !== null && NAME_TO_INDEX[item.provinsi] === activeProv ? 'accent' : 'cream'}
                    visible={inView}
                    delay={i * 0.1}
                  />
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: 'var(--ws2-line-1)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {PROVINSI.map((prov) => (
                <div key={prov.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="ws2-swatch" style={{
                    width: 14, height: 10,
                    background: WS2.accent,
                    opacity: FILL_BY_NAME[prov.key] * 1.6,
                  }} />
                  <span className="lato-light" style={{ fontSize: '0.6rem', color: 'var(--ws2-text-3)' }}>
                    {prov.title}
                  </span>
                </div>
              ))}
            </div>
            <p className="lato-light" style={{ fontSize: '0.58rem', color: 'var(--ws2-text-4)', lineHeight: 1.5, margin: 0 }}>
              Kepekatan warna mengikuti jumlah desa terdampak.
              Klik provinsi atau kartu untuk memperbesar.
            </p>
          </div>

          {/* Peredam tipis supaya tepi bawah peta tidak berakhir sebagai
              garis tajam di atas latar krem. */}
          <div aria-hidden="true" style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 90,
            background: 'linear-gradient(to top, var(--ws2-bg-cream) 0%, transparent 100%)',
            zIndex: 500, pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* ── Kartu provinsi — seluruhnya di bawah peta ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.25rem, 3vw, 2.5rem)', position: 'relative', zIndex: 10 }}>
        <div ref={cardsRef} className="infra-prov-cards" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
          marginTop: 'clamp(1.5rem, 3vw, 2.5rem)',
        }}>
          {PROVINSI.map((prov, i) => {
            const jumlahDesa = insights?.cakupan_geografis_infra?.desa_per_provinsi?.[prov.key] || 0;
            const fasPerProv = insights?.fasilitas_infrastruktur?.jumlah_per_provinsi_per_kategori?.[prov.key] || {};
            const totalFasProv = Object.values(fasPerProv).reduce((a, v) => a + v, 0);
            const korban = insights?.anggota_keluarga?.korban_kritis_per_provinsi?.[prov.key] || {};
            const isActive = activeProv === i;
            const meninggal = korban.meninggal_bencana ?? '—';

            return (
              <div
                key={prov.key}
                onClick={() => handleCardClick(i)}
                className="ws2-card ws2-card--cream ws2-card--clickable"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderColor: isActive ? WS2.accent : undefined,
                  boxShadow: isActive ? 'var(--ws2-shadow-c-active)' : undefined,
                  opacity: cardsInView ? 1 : 0,
                  transform: cardsInView ? 'translateY(0)' : 'translateY(16px)',
                  transition: `border-color .4s ease, box-shadow .4s ease, opacity 0.8s var(--ws2-reveal-ease) ${i * 0.12}s, transform 0.8s var(--ws2-reveal-ease) ${i * 0.12}s`,
                }}
              >
                {/* Stripe aktif dan badge "Zoom/Viewing" dihapus: status aktif
                    sudah ditandai border oranye + shadow, dan stripe radius 16
                    tidak pernah cocok dengan radius kartunya. */}

                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 className="t-display" style={{
                    fontSize: 'clamp(1.15rem, 1.8vw, 1.4rem)',
                    color: 'var(--ws2-ink-1)',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                    lineHeight: 1.2,
                  }}>
                    {prov.title}
                  </h3>
                  <p className="t-body" style={{ fontSize: '0.78rem', color: 'var(--ws2-ink-3)', margin: 0, lineHeight: 1.5 }}>
                    {prov.tagline}
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem 1rem',
                  marginBottom: Object.keys(fasPerProv).length > 0 ? '1.1rem' : 0,
                }}>
                  <div>
                    <div className="t-display" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.75rem)', color: 'var(--ws2-ink-1)', fontWeight: 700, lineHeight: 1 }}>
                      {fmtN(jumlahDesa)}
                    </div>
                    <div className="t-eyebrow" style={{ color: 'var(--ws2-ink-4)', fontSize: '0.52rem', marginTop: '0.28rem' }}>Desa</div>
                  </div>
                  <div>
                    <div className="t-display" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.75rem)', color: 'var(--ws2-ink-1)', fontWeight: 700, lineHeight: 1 }}>
                      {fmtN(totalFasProv)}
                    </div>
                    <div className="t-eyebrow" style={{ color: 'var(--ws2-ink-4)', fontSize: '0.52rem', marginTop: '0.28rem' }}>Fasilitas</div>
                  </div>
                  <div>
                    <div className="t-display" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.75rem)', color: 'var(--ws2-accent)', fontWeight: 700, lineHeight: 1 }}>
                      {meninggal}
                    </div>
                    <div className="t-eyebrow" style={{ color: 'var(--ws2-ink-4)', fontSize: '0.52rem', marginTop: '0.28rem' }}>Korban Jiwa</div>
                  </div>
                  {(() => {
                    const kabPerProv = insights?.cakupan_geografis_infra?.kab_kota_per_provinsi?.[prov.key];
                    return kabPerProv ? (
                      <div>
                        <div className="t-display" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.75rem)', color: 'var(--ws2-ink-1)', fontWeight: 700, lineHeight: 1 }}>
                          {kabPerProv}
                        </div>
                        <div className="t-eyebrow" style={{ color: 'var(--ws2-ink-4)', fontSize: '0.52rem', marginTop: '0.28rem' }}>Kab/Kota</div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Stacked bar sektor. Dulu keempat segmen memetakan ke
                    --sage/--slate/--gold/--rust, padahal di :root lama
                    --slate === --sage dan --gold === --rust: empat kategori
                    tampil sebagai dua warna dan legendanya ikut berbohong. */}
                {Object.keys(fasPerProv).length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{
                      display: 'flex', height: 10, borderRadius: 'var(--ws2-r-xs)', overflow: 'hidden', marginBottom: '0.65rem',
                      background: 'var(--ws2-track-c)',
                    }}>
                      {KAT_ORDER.filter((k) => fasPerProv[k]).map((kat) => (
                        <div
                          key={kat}
                          style={{
                            width: cardsInView ? `${(fasPerProv[kat] / totalFasProv) * 100}%` : '0%',
                            minWidth: fasPerProv[kat] > 0 ? 2 : 0,
                            height: '100%',
                            background: KAT_COLOR[kat],
                            transition: `width 1.2s var(--ws2-bar-ease) ${0.4 + i * 0.12}s`,
                          }}
                          title={`${kat}: ${fasPerProv[kat]}`}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {KAT_ORDER.filter((k) => fasPerProv[k]).map((kat) => (
                        <span key={kat} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', fontFamily: 'Lato, sans-serif', fontWeight: 300, color: 'var(--ws2-ink-3)' }}>
                          <span className="ws2-swatch" style={{ background: KAT_COLOR[kat] }} />
                          {kat} <strong style={{ fontWeight: 700, color: 'var(--ws2-ink-1)' }}>{fasPerProv[kat]}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ paddingBottom: 'clamp(3rem, 5vw, 5rem)' }} />
    </section>
  );
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  SCENE 3 — NARASI LAYANAN DASAR  (NAVY)                      ║
   ╚═══════════════════════════════════════════════════════════════╝ */
function SceneLayananDasar() {
  const [ref, inView] = useInView();

  const statusHunian = insights?.rumah_tangga?.status_hunian || {};
  const pengungsian  = statusHunian['3. Pengungsian']?.n || 0;
  const huntara      = statusHunian['6. Huntara']?.n     || 0;

  /* Dulu angka-angka ini dihitung `100 - pct`, padahal `pct` di insight.json
     adalah porsi dari 115.462 RT TERDAFTAR sementara yang benar-benar
     diwawancarai hanya 50.887 (44,07%). Hasilnya menggelembung jauh:
     "Listrik Padam 56,6%" dan "Krisis Air 62,3%". Sementara "Sanitasi" justru
     dijumlahkan langsung — skala yang sama sekali berbeda dalam satu baris
     kartu yang sama.

     Sekarang ketiganya memakai pctRT() dengan denominator yang sama, dan
     sub-barisnya dibaca dari data — bukan enam literal hasil karangan. */
  const STATS_PCT = [
    {
      label: 'Tanpa Listrik PLN',
      val: pctRT(LISTRIK_NON_PLN),
      n: LISTRIK_NON_PLN,
      rows: [
        { label: 'Listrik non-PLN', n: LISTRIK_NON_PLN_BERLISTRIK },
        { label: 'Bukan listrik', n: LISTRIK_TIDAK_ADA },
      ],
    },
    {
      label: 'Sumber Air Tak Layak',
      val: pctRT(AIR_TAK_LAYAK),
      n: AIR_TAK_LAYAK,
      rows: [
        { label: 'Mata air tak terlindung', n: AIR_MATA_AIR_TAK_TERLINDUNG },
        { label: 'Air permukaan', n: AIR_PERMUKAAN },
      ],
    },
    {
      label: 'Bergantung MCK Umum atau Tidak Punya',
      val: pctRT(MCK_TANPA_AKSES_SENDIRI),
      n: MCK_TANPA_AKSES_SENDIRI,
      rows: [
        { label: 'Tidak ada sama sekali', n: MCK_TIDAK_ADA },
        { label: 'MCK umum / komunal', n: MCK_UMUM_KOMUNAL },
      ],
    },
  ];

  return (
    <section className="infra-section infra-bg-navy infra-grain" style={{ padding:'clamp(6rem, 10vw, 9rem) 1.5rem' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }} ref={ref}>
        <div style={{ 
          marginBottom: '4.5rem',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <h2 className="t-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', margin: 0, color: 'var(--ws2-text-1)' }}>
            Krisis Layanan Dasar
          </h2>
        </div>

        {/* Kartu persentase layanan dasar.

            Glassmorphism dibuang: backdrop-filter blur(16px) di sini duduk di
            atas latar polos tanpa gambar apa pun di belakangnya, jadi efek
            kacanya nol — hanya menambah satu compositing layer. Kartu rata di
            atas navy justru lebih tegas: angka 4-5rem jadi satu-satunya yang
            bercahaya. */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginBottom: '1.2rem',
        }}>
          {STATS_PCT.map((stat, i) => (
            <div key={stat.label} className="ws2-card" style={{
              textAlign: 'left',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity 0.8s var(--ws2-reveal-ease) ${i * 0.12}s, transform 0.8s var(--ws2-reveal-ease) ${i * 0.12}s`,
            }}>
              <div className="t-eyebrow" style={{ color: 'var(--ws2-text-3)', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
                {stat.label}
              </div>
              <div className="t-display" style={{ fontSize: 'clamp(4rem, 6vw, 5rem)', fontWeight: 700, color: 'var(--ws2-text-1)', lineHeight: 1, marginBottom: '0.4rem' }}>
                {fmtPct(stat.val)}<span style={{ fontSize: '0.5em', color: 'var(--ws2-text-4)' }}>%</span>
              </div>
              <div className="t-body" style={{ fontSize: '0.8rem', color: 'var(--ws2-text-4)', marginBottom: '1.6rem' }}>
                {fmtN(stat.n)} rumah tangga
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingTop: '1.5rem', borderTop: '1px solid var(--ws2-line-1)' }}>
                {stat.rows.map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="t-body" style={{ fontSize: '0.8rem', color: 'var(--ws2-text-3)' }}>{row.label}</span>
                    <span className="t-body" style={{ fontSize: '0.85rem', color: 'var(--ws2-text-1)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {fmtPct(pctRT(row.n))}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="t-body" style={{ fontSize: '0.72rem', color: 'var(--ws2-text-4)', marginBottom: '5.5rem', textAlign: 'left' }}>
          {CAPTION_RT}
        </p>


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
                <div className="t-display" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 700, color: 'var(--ws2-accent)', lineHeight: 1, marginBottom: '1rem' }}>
                  <AnimatedCounter value={huntara} />
                </div>
                <div className="t-eyebrow" style={{ color: 'var(--ws2-text-3)', fontSize: '0.8rem' }}>KK di Huntara</div>
              </div>
            )}
            {pengungsian > 0 && (
              <div>
                <div className="t-display" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 700, color: 'var(--ws2-accent)', lineHeight: 1, marginBottom: '1rem' }}>
                  <AnimatedCounter value={pengungsian} />
                </div>
                <div className="t-eyebrow" style={{ color: 'var(--ws2-text-3)', fontSize: '0.8rem' }}>KK di Pengungsian</div>
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
    const color = score > 90 ? '#E67E22' : score > 80 ? '#E5D9B6' : '#628141';
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
  const [ref, started] = useInView();

  const jumlahPerProv = insights?.fasilitas_infrastruktur?.jumlah_per_provinsi_per_kategori || {};

  const totalsArr = Object.entries(jumlahPerProv).map(([prov, kat]) => ({
    prov,
    total: Object.values(kat).reduce((a, v) => a + v, 0),
  }));
  /* Sama seperti panel sebaran di Scene 2: ini porsi dari total tiga
     provinsi, bukan normalisasi ke provinsi terbesar. Versi lama membuat
     provinsi teratas selalu terpaku di 100,0%. */
  const totalSemua = totalsArr.reduce((a, x) => a + x.total, 0) || 1;

  const peringkat = totalsArr
    .map(({ prov, total }) => {
      const coords = prov === 'Aceh'
        ? { lat: 4.6951, lng: 96.7494 }
        : prov === 'Sumatera Utara'
        ? { lat: 2.1154, lng: 98.5451 }
        : { lat: -0.7390, lng: 100.8000 };
      return {
        provinsi: prov,
        persen: (total / totalSemua) * 100,
        totalFasilitas: total,
        ...coords,
      };
    })
    .sort((a, b) => b.persen - a.persen);

  return (
    <section className="infra-section infra-bg-cream infra-grain" style={{ padding:'clamp(6rem, 10vw, 9rem) 1.5rem' }}>
      <div ref={ref} style={{ maxWidth: 1240, margin: '0 auto' }}>

        <div style={{ 
          textAlign: 'center', marginBottom: '4.5rem',
          opacity: started ? 1 : 0,
          transform: started ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <h2 className="t-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', margin: 0, color: 'var(--ws2-ink-1)' }}>
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
              const color = isTop ? 'var(--ws2-accent)' : i === 1 ? 'var(--ws2-accent)' : 'var(--ws2-green)';
              return (
                <div key={item.provinsi} style={{
                  opacity: started ? 1 : 0,
                  transform: started ? 'translateX(0)' : 'translateX(24px)',
                  transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="t-eyebrow" style={{ color: 'var(--ws2-ink-4)', fontSize: '0.85rem', width: '24px' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="t-display" style={{ fontSize: '1.5rem', color: 'var(--ws2-ink-1)', fontWeight: 700, lineHeight: 1.2 }}>
                          {item.provinsi}
                        </div>
                        <div className="t-body" style={{ fontSize: '0.78rem', color: 'var(--ws2-ink-3)', marginTop: '0.2rem' }}>
                          <strong style={{ fontWeight: 700 }}>{item.totalFasilitas.toLocaleString('id-ID')}</strong> Fasilitas
                        </div>
                      </div>
                    </div>
                    <span className="t-display" style={{ fontSize: '2rem', color: color, fontWeight: 700, lineHeight: 1 }}>
                      {fmtPct(item.persen)}%
                    </span>
                  </div>
                  <BarTrack
                    mode="share"
                    value={item.persen}
                    surface="cream"
                    tone={i === 0 ? 'accent' : 'neutral'}
                    visible={started}
                    delay={0.3 + i * 0.12}
                  />
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
  const [ref, inView] = useInView();

  const stats = insights?.fasilitas_infrastruktur?.statistik_per_desa || {};
  const sosMax = stats.sosial?.max || 0;
  const sosDesa = stats.sosial?.desa_max_fasilitas || '';
  const pendMax = stats.pendidikan?.max || 0;
  const pendDesa = stats.pendidikan?.desa_max_fasilitas || '';
  const kesMax = stats.kesehatan?.max || 0;
  const kesDesa = stats.kesehatan?.desa_max_fasilitas || '';

  return (
    <section ref={ref} className="infra-section infra-bg-navy infra-grain" style={{ padding:'clamp(6rem, 10vw, 9rem) 1.5rem' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        
        <div style={{ 
          textAlign: 'center', marginBottom: '5rem',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <h2 className="t-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', margin: 0, color: 'var(--ws2-text-1)' }}>
            Titik Kerusakan Terparah
          </h2>
          <p className="t-body" style={{ color: 'var(--ws2-text-3)', marginTop: '1rem', maxWidth: 600, margin: '1rem auto 0' }}>
            Data di tingkat desa menunjukkan anomali kerusakan yang sangat terpusat pada beberapa wilayah tertentu.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem', 
        }}>
          
          <div style={{
            background: 'var(--ws2-surface-1)', border: '1px solid var(--ws2-line-1)', borderRadius: 16, padding: '2.5rem',
            opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s ease 0.1s'
          }}>
            <div className="t-eyebrow" style={{ color: 'var(--ws2-accent)', fontSize: '0.8rem', marginBottom: '1rem' }}>Fasilitas Sosial Terbanyak</div>
            <div className="t-display" style={{ fontSize: '4.5rem', fontWeight: 700, color: 'var(--ws2-text-1)', lineHeight: 1, marginBottom: '0.5rem' }}>
              {sosMax} <span style={{ fontSize: '1rem', fontFamily: 'Lato', color: 'var(--ws2-text-3)', fontWeight: 400 }}>Unit</span>
            </div>
            <div className="t-body" style={{ color: 'var(--ws2-text-4)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Hancur di <strong>Desa {sosDesa}</strong>. Mayoritas adalah tempat ibadah dan balai warga.
            </div>
          </div>

          <div style={{
            background: 'var(--ws2-surface-1)', border: '1px solid var(--ws2-line-1)', borderRadius: 16, padding: '2.5rem',
            opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s ease 0.2s'
          }}>
            <div className="t-eyebrow" style={{ color: 'var(--ws2-green)', fontSize: '0.8rem', marginBottom: '1rem' }}>Fasilitas Pendidikan</div>
            <div className="t-display" style={{ fontSize: '4.5rem', fontWeight: 700, color: 'var(--ws2-text-1)', lineHeight: 1, marginBottom: '0.5rem' }}>
              {pendMax} <span style={{ fontSize: '1rem', fontFamily: 'Lato', color: 'var(--ws2-text-3)', fontWeight: 400 }}>Unit</span>
            </div>
            <div className="t-body" style={{ color: 'var(--ws2-text-4)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Hancur di <strong>Desa {pendDesa}</strong>, melumpuhkan total aktivitas belajar mengajar.
            </div>
          </div>

          <div style={{
            background: 'var(--ws2-surface-1)', border: '1px solid var(--ws2-line-1)', borderRadius: 16, padding: '2.5rem',
            opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s ease 0.3s'
          }}>
            <div className="t-eyebrow" style={{ color: 'var(--ws2-green)', fontSize: '0.8rem', marginBottom: '1rem' }}>Fasilitas Kesehatan</div>
            <div className="t-display" style={{ fontSize: '4.5rem', fontWeight: 700, color: 'var(--ws2-text-1)', lineHeight: 1, marginBottom: '0.5rem' }}>
              {kesMax} <span style={{ fontSize: '1rem', fontFamily: 'Lato', color: 'var(--ws2-text-3)', fontWeight: 400 }}>Unit</span>
            </div>
            <div className="t-body" style={{ color: 'var(--ws2-text-4)', fontSize: '0.9rem', lineHeight: 1.5 }}>
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
  const [ref, visible] = useInView();

  const fasPerProv = insights?.fasilitas_infrastruktur?.jumlah_per_provinsi_per_kategori || {};
  const desaPerProv = insights?.cakupan_geografis_infra?.desa_per_provinsi || {};
  const kabPerProv = insights?.cakupan_geografis_infra?.kab_kota_per_provinsi || {};
  const korbanPerProv = insights?.anggota_keluarga?.korban_kritis_per_provinsi || {};

  /* Dulu korban jiwa (54/44/4), desa (292/556/80), dan kab/kota (19/18/11)
     ditulis sebagai literal. Angkanya kebetulan cocok dengan insight.json
     saat itu, tetapi akan diam-diam melenceng begitu JSON diregenerasi.
     Sekarang semuanya dibaca, dan `max` per metrik dihitung — bukan ditebak. */
  const PROV_META = [
    { key: 'Sumatera Utara', title: 'Sumatera Utara' },
    { key: 'Aceh', title: 'Aceh' },
    { key: 'Sumatera Barat', title: 'Sumatera Barat' },
  ];

  const nilai = PROV_META.map(({ key, title }) => ({
    key,
    title,
    korban: korbanPerProv[key]?.meninggal_bencana ?? 0,
    fasilitas: Object.values(fasPerProv[key] || {}).reduce((a, b) => a + b, 0),
    desa: desaPerProv[key] ?? 0,
    kab: kabPerProv[key] ?? 0,
  }));

  const maks = {
    korban: Math.max(...nilai.map((n) => n.korban), 1),
    fasilitas: Math.max(...nilai.map((n) => n.fasilitas), 1),
    desa: Math.max(...nilai.map((n) => n.desa), 1),
    kab: Math.max(...nilai.map((n) => n.kab), 1),
  };

  const LABEL = { korban: 'Korban Jiwa', fasilitas: 'Fasilitas Publik', desa: 'Desa Terdampak', kab: 'Kab / Kota' };

  const PROV_DATA = nilai.map((n) => ({
    key: n.key,
    title: n.title,
    color: 'var(--ws2-accent)',
    metrics: ['korban', 'fasilitas', 'desa', 'kab'].map((m) => ({
      label: LABEL[m],
      val: n[m],
      max: maks[m],
      emph: n[m] === maks[m],
    })),
  }));

  return (
    <section className="infra-section infra-bg-cream infra-grain" style={{
      padding: 'clamp(5rem,9vw,8rem) 1.5rem',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{ position:'absolute', top:'0', left:'50%', transform:'translateX(-50%)', width:'80vw', height:'50vw', borderRadius:'50%', background:'radial-gradient(circle, var(--ws2-glow-cream) 0%, transparent 60%)', pointerEvents:'none', filter:'blur(80px)', zIndex:0 }} />
      <div ref={ref} style={{ maxWidth: 1240, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>

        <div style={{ 
          textAlign:'center', marginBottom:'4.5rem',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <h2 className="t-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', margin: '0 auto', maxWidth: 720, color: 'var(--ws2-ink-1)' }}>
            Perbandingan Lintas Provinsi
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Header Row (Desktop Only) */}
          <div className="infra-data-header">
            <div />
            <div className="t-eyebrow" style={{ color: 'var(--ws2-ink-4)', fontSize: '0.65rem' }}>Korban Jiwa</div>
            <div className="t-eyebrow" style={{ color: 'var(--ws2-ink-4)', fontSize: '0.65rem' }}>Fasilitas Publik</div>
            <div className="t-eyebrow" style={{ color: 'var(--ws2-ink-4)', fontSize: '0.65rem' }}>Desa Terdampak</div>
            <div className="t-eyebrow" style={{ color: 'var(--ws2-ink-4)', fontSize: '0.65rem' }}>Kab/Kota Terdampak</div>
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
                <h3 className="t-display" style={{ fontSize: '1.6rem', color: 'var(--ws2-ink-1)', fontWeight: 700, margin: 0 }}>{prov.title}</h3>
              </div>

              {/* Metrics Columns */}
              <div className="infra-data-metrics">
                {prov.metrics.map((m, mIdx) => (
                  <div key={m.label} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="infra-mobile-metric-label t-eyebrow" style={{ color: 'var(--ws2-ink-4)', marginBottom: '0.4rem', fontSize: '0.6rem' }}>{m.label}</div>
                    <div className="t-display" style={{ 
                      fontSize: m.emph ? '2.4rem' : '1.4rem', 
                      color: m.emph ? prov.color : 'var(--ws2-ink-3)', 
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

export default function BabakInfrastruktur() {
  /* Urutan mengikuti storyline: Kelumpuhan Kota -> Kelumpuhan Desa ->
     Narasi Layanan Dasar -> Zona Prioritas -> Sorotan Angka -> Transisi.

     Tiap batas warna kini lewat <BgSeam>. Sebelumnya memakai <SectionDivider
     from to>, yang nilainya harus dicocokkan manual dengan warna section di
     atas dan di bawahnya — dan salah satunya memudar navy -> krem padahal
     section berikutnya navy. */
  return (
    <>
      <SceneKelumpuhanKota />
      <BgSeam from="navy" to="cream" />
      <SceneKelumpuhanDesa />
      <BgSeam from="cream" to="navy" />
      <SceneLayananDasar />
      <BgSeam from="navy" to="cream" />
      <SceneZonaPrioritas />
      <BgSeam from="cream" to="navy" />
      <SceneSorotanAngka />
      <BgSeam from="navy" to="cream" />
      <TransisiBabak23 />
    </>
  );
}