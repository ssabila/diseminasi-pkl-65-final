/**
 * kebutuhan.jsx — Babak 4: Kebutuhan (REDESIGN — Cinematic Scrollytelling)
 *
 * Pendekatan baru:
 * Scene 1: "Berapa yang Belum Tersentuh?" — Scrollytelling horizontal ticker ambient
 *          + Bubble chart dengan entrance dramatik
 * Scene 2: Long-form narrative reveal — teks muncul per-blok saat scroll, gaya pudding.cool
 * Scene 3: Full-bleed confessional — 1 kutipan, typewriter reveal, foto sebagai grain
 * Scene 4: Ajakan — split halaman diagonal, bukan centered CTA
 * Scene 5: Ledger investigatif — angka besar selang-seling seperti laporan hak asasi
 *
 * Data: insight.json → kebutuhan.ringkasan_global, metadata, status_penugasan
 */

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import insights from '../insight.json';
import { Link } from 'react-router-dom';
import { WS2 } from '../ws2-tokens';
import BgSeam from '../shared/BgSeam';
import { fmtN, fmtPct } from '../shared/rtStats';
import tile01 from '../../../assets/images/huntara-01.webp';
import tile07 from '../../../assets/images/huntara-07.webp';
import tile09 from '../../../assets/images/huntara-09.webp';
import tile11 from '../../../assets/images/huntara-11.webp';
import tile12 from '../../../assets/images/huntara-12.webp';
import tile14 from '../../../assets/images/huntara-14.webp';

/* Delapan tile diambil dari enam berkas terkecil (total < 2 MB). Memakai
   seluruh 20 foto akan menambah ~20 MB ke bundle untuk lapisan latar yang
   opacity-nya hanya 0,12-0,30. */
const HUNTARA_TILES = [tile09, tile14, tile12, tile01, tile11, tile07];

gsap.registerPlugin(ScrollTrigger);
/* ScrollTrigger.defaults({ scrub: 0.8 }) dihapus dari sini: itu efek samping
   GLOBAL yang diam-diam men-scrub setiap trigger di seluruh aplikasi,
   termasuk Web Story 1 dan 3. Tiap trigger di file ini sudah menyetel
   scrub-nya sendiri. */

/* ─────────────────────────────────────────
   Utility Hooks
───────────────────────────────────────────*/
function useInView(threshold = 0.15, rootMargin = '0px 0px -8% 0px') {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold, rootMargin }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);
  return [ref, visible];
}

function useCountUp(target, visible, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, target, duration]);
  return value;
}

function useSceneReveal(threshold = 0.14) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* ─────────────────────────────────────────
   Grain Overlay — tekstur sinematik
───────────────────────────────────────────*/
function GrainOverlay({ opacity = 0.05 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0, zIndex: 4,
        pointerEvents: 'none', opacity,
        mixBlendMode: 'overlay',
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

/* ─────────────────────────────────────────
   Bubble Config
───────────────────────────────────────────*/
/* Enam kategori TIDAK perlu enam warna: labelnya sudah tampil di tiap
   gelembung dan di tooltip, jadi mewarnai semuanya hanya menambah elemen yang
   tidak diperlukan (guideline: "memakai elemen hanya jika diperlukan").
   Monokrom krem, dengan SATU aksen oranye untuk Perbaikan Rumah — kebutuhan
   yang paling belum terjangkau, sekaligus inti ceritanya. */
const BUBBLE_CONFIG = {
  makanan:         { label: 'Makanan',         color: WS2.cream },
  pengobatan:      { label: 'Pengobatan',      color: WS2.cream },
  pakaian:         { label: 'Pakaian',         color: WS2.cream },
  uang_tunai:      { label: 'Uang Tunai',      color: WS2.cream },
  lainnya:         { label: 'Lainnya',         color: WS2.cream },
  perbaikan_rumah: { label: 'Perbaikan Rumah', color: WS2.accent },
};


/* ─────────────────────────────────────────
   Ambient Ticker — teks kebutuhan yang scroll
   horizontal tak henti di background scene 1
 {
  const tickerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!tickerRef.current) return;
    const el = tickerRef.current;
    // Clone untuk seamless loop
    el.innerHTML += el.innerHTML;
    const totalWidth = el.scrollWidth / 2;

    let pos = 0;
    const speed = 0.4;
    const tick = () => {
      pos += speed;
      if (pos >= totalWidth) pos = 0;
      el.style.transform = `translateX(-${pos}px)`;
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div style={{ overflow: 'hidden', width: '100%', pointerEvents: 'none' }}>
      <div
        ref={tickerRef}
        style={{
          display: 'flex',
          gap: '3rem',
          whiteSpace: 'nowrap',
          willChange: 'transform',
        }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="playfair-display"
            style={{
              fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
              fontStyle: 'italic',
              color: i % 3 === 0 ? 'rgba(230,126,34,0.18)' : i % 3 === 1 ? 'rgba(98,129,65,0.15)' : 'var(--ws2-line-1)',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            {item.label} {item.belum.toLocaleString('id-ID')} KK
            <span style={{ margin: '0 2rem', opacity: 0.3 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Bubble Chart — Force simulation
/* ── Bubble chart kebutuhan ──────────────────────────────────────────────
   Sesuai storyline Babak 4 Scene 1. Komponen ini sudah ada di file ini
   sebelumnya tetapi TIDAK PERNAH dirender, dan mengandung pelanggaran
   rules-of-hooks (useEffect dipanggil setelah early return) yang akan
   membuatnya crash begitu diaktifkan.

   Yang diukur: jumlah keluarga yang BELUM menerima tiap jenis bantuan
   (115.462 − penerima). Dengan begitu gelembung terbesar adalah kebutuhan
   yang paling belum terjangkau — konsisten dengan judul "Kebutuhan Mendesak".

   Tanpa dependensi baru: D3 tidak terpasang dan tidak diperlukan untuk enam
   lingkaran. Tata letaknya fungsi murni yang deterministik (spiral sudut
   emas), tanpa Math.random dan tanpa simulasi per-frame. */

const GOLDEN_ANGLE = 137.5;

function packCircles(items, width) {
  if (!width || !items.length) return [];

  const mobile = width < 480;
  const H = Math.round(width * (mobile ? 1.05 : 0.82));
  const GAP = mobile ? 10 : 14;
  const maxVal = Math.max(...items.map((d) => d.value), 1);

  // Radius sebanding AKAR KUADRAT nilai supaya LUAS gelembung yang
  // sebanding dengan nilainya — bukan radiusnya.
  const radiusFor = (v, rMax) => Math.max(18, rMax * Math.sqrt(v / maxVal));

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const rMax = Math.round(width * (mobile ? 0.19 : 0.21)) * (0.92 ** attempt);
    const sorted = [...items].sort((a, b) => b.value - a.value);
    const placed = [];
    let gagal = false;

    sorted.forEach((item, i) => {
      const r = radiusFor(item.value, rMax);

      if (i === 0) {
        placed.push({ ...item, x: width / 2, y: H / 2, r });
        return;
      }

      let taruh = null;
      const Rmax = Math.max(width, H);
      for (let R = placed[0].r + r + GAP; R <= Rmax && !taruh; R += 4) {
        for (let k = 0; k < 24 && !taruh; k += 1) {
          const theta = ((i * GOLDEN_ANGLE + k * 15) * Math.PI) / 180;
          const x = width / 2 + R * Math.cos(theta);
          const y = H / 2 + R * Math.sin(theta);

          if (x - r < 8 || x + r > width - 8 || y - r < 8 || y + r > H - 8) continue;
          const bentrok = placed.some((p) => Math.hypot(p.x - x, p.y - y) < p.r + r + GAP);
          if (!bentrok) taruh = { ...item, x, y, r };
        }
      }

      if (!taruh) gagal = true;
      else placed.push(taruh);
    });

    if (!gagal) {
      // Geser hasil ke tengah kanvas supaya tidak berat sebelah.
      const minX = Math.min(...placed.map((p) => p.x - p.r));
      const maxX = Math.max(...placed.map((p) => p.x + p.r));
      const minY = Math.min(...placed.map((p) => p.y - p.r));
      const maxY = Math.max(...placed.map((p) => p.y + p.r));
      const dx = (width - (maxX + minX)) / 2;
      const dy = (H - (maxY + minY)) / 2;
      return { H, nodes: placed.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy })) };
    }
  }

  return { H, nodes: [] };
}

function BubbleChart({ items, total, visible }) {
  // Semua hook di paling atas. Versi lama memanggil useEffect SETELAH early
  // return, yang melanggar rules-of-hooks dan akan crash saat dirender.
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (active === null) return undefined;
    const tutup = (e) => {
      if (!wrapRef.current?.contains(e.target)) setActive(null);
    };
    document.addEventListener('pointerdown', tutup);
    return () => document.removeEventListener('pointerdown', tutup);
  }, [active]);

  const layout = useMemo(() => packCircles(items, width), [items, width]);
  const punyaHover = typeof window !== 'undefined'
    && window.matchMedia?.('(hover: hover)').matches;

  return (
    <div>
      {/* Kanvas transparan: gelembung mengambang langsung di latar navy.
          Versi lama membungkusnya dengan gradient + border + vignette — tiga
          lapis dekorasi untuk enam lingkaran. */}
      <div
        ref={wrapRef}
        className="kb-bubble-wrap"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 560,
          height: layout.H || 400,
          margin: '0 auto',
          overflow: 'visible',
        }}
      >
        {layout.nodes?.map((node, i) => {
          const aktif = active === node.key;
          const kecil = node.r < 44;
          return (
            <div
              key={node.key}
              role="button"
              tabIndex={0}
              aria-label={`${node.label}: ${fmtN(node.value)} keluarga belum menerima`}
              onMouseEnter={punyaHover ? () => setActive(node.key) : undefined}
              onMouseLeave={punyaHover ? () => setActive(null) : undefined}
              onFocus={() => setActive(node.key)}
              onBlur={() => setActive(null)}
              onClick={() => setActive((p) => (p === node.key ? null : node.key))}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: node.r * 2,
                height: node.r * 2,
                transform: `translate(-50%, -50%) scale(${visible ? (aktif ? 1.06 : 1) : 0.86})`,
                opacity: visible ? 1 : 0,
                borderRadius: '50%',
                background: `${node.color}${aktif ? '4D' : '29'}`,
                border: `1.5px solid ${node.color}${aktif ? 'FF' : 'BF'}`,
                boxShadow: `0 0 ${aktif ? 28 : 18}px ${node.color}${aktif ? '59' : '33'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                // Tanpa overshoot: guideline melarang gerak memantul.
                transition: `transform 320ms var(--ws2-bar-ease) ${i * 0.07}s, opacity 700ms ease ${i * 0.07}s, background-color 320ms ease, box-shadow 320ms ease`,
              }}
            >
              {!kecil && (
                <>
                  <span className="lato-bold" style={{ fontSize: '0.72rem', color: 'var(--ws2-hero)', letterSpacing: '0.04em', padding: '0 6px' }}>
                    {node.label}
                  </span>
                  <span className="lato-light" style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                    {fmtN(node.value)}
                  </span>
                </>
              )}

              {kecil && (
                <span className="lato-light" style={{
                  position: 'absolute',
                  top: node.r * 2 + 8,
                  fontSize: '0.68rem',
                  color: 'var(--ws2-text-3)',
                  whiteSpace: 'nowrap',
                }}>
                  {node.label}
                </span>
              )}

              {aktif && (
                <div style={{
                  position: 'absolute',
                  bottom: node.r * 2 + 14,
                  background: 'var(--ws2-bg-cream)',
                  color: 'var(--ws2-ink-1)',
                  borderRadius: 'var(--ws2-r-sm)',
                  padding: '0.55rem 0.9rem',
                  whiteSpace: 'nowrap',
                  zIndex: 20,
                  pointerEvents: 'none',
                }}>
                  <div className="lato-bold" style={{ fontSize: '0.9rem' }}>
                    {fmtN(node.value)} keluarga
                  </div>
                  <div className="lato-light" style={{ fontSize: '0.68rem' }}>
                    {fmtPct(node.pctBelum)}% dari {fmtN(total)} rumah tangga
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="lato-light" style={{
        fontSize: '0.72rem',
        color: 'var(--ws2-text-3)',
        textAlign: 'center',
        marginTop: '1.2rem',
        lineHeight: 1.6,
      }}>
        Ukuran gelembung sebanding dengan jumlah keluarga yang belum menerima
        jenis bantuan tersebut. Arahkan kursor atau ketuk untuk melihat angkanya.
      </p>
    </div>
  );
}


/* ─────────────────────────────────────────
   Scene 1: Kebutuhan Mendesak
   — Ambient ticker di bg, sticky header + bubble chart
   — Progress bar "tachometer" bukan angka bersih
───────────────────────────────────────────*/
function SceneJeritanBantuan() {
  /* Dulu blok ini membaca `insights.kebutuhan` — kunci yang TIDAK ADA di
     insight.json — sehingga selalu jatuh ke DEFAULT_KEBUTUHAN, sekumpulan
     angka karangan yang tampil di layar seolah data asli. DEFAULT itu dihapus:
     angka palsu tidak boleh punya jalur ke layar.

     Sumbernya sekarang rumah_tangga.bantuan_diterima, dengan penyebut
     ringkasan_dataset.total_rt_keluarga (115.462) — sama seperti Babak 1-3,
     jadi persentase antar babak bisa dibandingkan.

     Yang divisualkan adalah sisi BELUM (115.462 − penerima), supaya gelembung
     terbesar adalah kebutuhan yang paling belum terjangkau. */
  const totalRT = insights?.ringkasan_dataset?.total_rt_keluarga || 0;

  const bubbleData = useMemo(() => {
    const bantuan = insights?.rumah_tangga?.bantuan_diterima || {};
    return Object.entries(bantuan).map(([key, v]) => {
    const cfg = BUBBLE_CONFIG[key] || { label: key, color: WS2.cream };
    const sudah = v?.n_menerima ?? 0;
    const belum = Math.max(0, totalRT - sudah);
    return {
      key,
      label: cfg.label,
      color: cfg.color,
      value: belum,
      sudah,
      pctSudah: v?.pct ?? 0,
      pctBelum: totalRT ? (belum / totalRT) * 100 : 0,
    };
    }).sort((a, b) => b.value - a.value);
  }, [totalRT]);

  const hasData = bubbleData.length > 0 && totalRT > 0;
  const [sceneRef, sceneVisible] = useSceneReveal();
  const [introRef, introVisible] = useInView(0.1);

  // Dua angka pembuka diturunkan dari data yang sama dengan gelembungnya:
  // yang paling belum terjangkau, dan yang paling sudah.
  const palingBelum = bubbleData[0];
  const palingSudah = bubbleData[bubbleData.length - 1];
  const nPalingBelum = useCountUp(palingBelum?.value ?? 0, introVisible, 1800);
  const pctPalingSudah = useCountUp(palingSudah?.pctSudah ?? 0, introVisible, 1800);

  return (
    <section
      ref={sceneRef}
      style={{
        position: 'relative',
        background: 'transparent',
        padding: '6rem 2rem 6rem',
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
        opacity: sceneVisible ? 1 : 0,
        transform: sceneVisible ? 'translateY(0)' : 'translateY(26px)',
        transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'opacity, transform',
      }}
    >
      <GrainOverlay opacity={0.045} />

      {/* Konten utama */}
      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: 1160, margin: '0 auto', width: '100%',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.45fr)',
        gap: '4rem',
        alignItems: 'start',
      }} className="kb-s1-grid">

        {/* ── Kolom kiri: narasi editorial + angka ── */}
        <div ref={introRef} style={{
          position: 'sticky', top: '3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          opacity: introVisible ? 1 : 0,
          transform: introVisible ? 'translateY(0)' : 'translateY(32px)',
          transition: 'opacity 1s ease, transform 1s ease',
        }}>
          <h2 className="playfair-display" style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
            color: 'var(--ws2-text-1)', lineHeight: 1.1,
            marginBottom: '0.4rem', fontStyle: 'italic',
            letterSpacing: '-0.01em',
          }}>
            Kebutuhan
          </h2>
          <h2 className="playfair-display" style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
            color: 'var(--ws2-accent)', lineHeight: 1.1,
            marginBottom: '1.8rem', fontStyle: 'italic',
            letterSpacing: '-0.01em',
          }}>
            Mendesak
          </h2>

          <div style={{
            width: introVisible ? 72 : 0,
            height: 2,
            background: 'var(--ws2-accent)',
            marginBottom: '1.8rem',
            transition: 'width 1s ease 0.3s',
          }} />

          <p className="lato-light" style={{
            fontSize: '1rem', lineHeight: 1.95,
            color: 'var(--ws2-text-2)',
            maxWidth: 400, marginBottom: '2.4rem',
          }}>
            Setiap gelembung adalah satu jenis bantuan. Semakin besar,
            semakin banyak keluarga yang <em>belum</em> menerimanya.
          </p>

          <div style={{
            paddingTop: '2rem',
            borderTop: '1px solid var(--ws2-line-1)',
            display: 'flex', gap: '2.8rem', flexWrap: 'wrap',
          }}>
            <div>
              <div className="playfair-display" style={{
                fontSize: 'clamp(2.6rem, 7vw, 4.2rem)',
                fontWeight: 700, fontStyle: 'italic',
                color: 'var(--ws2-accent)',
                lineHeight: 1, letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {fmtN(Math.round(nPalingBelum))}
              </div>
              <div className="lato-bold" style={{
                fontSize: '0.68rem', letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'var(--ws2-text-4)',
                marginTop: '0.5rem', maxWidth: 220, lineHeight: 1.6,
              }}>
                keluarga belum menerima {palingBelum?.label?.toLowerCase()}
              </div>
            </div>
            <div>
              <div className="playfair-display" style={{
                fontSize: 'clamp(2.6rem, 7vw, 4.2rem)',
                fontWeight: 700, fontStyle: 'italic',
                color: 'var(--ws2-text-1)',
                lineHeight: 1, letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {fmtPct(pctPalingSudah)}%
              </div>
              <div className="lato-bold" style={{
                fontSize: '0.68rem', letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'var(--ws2-text-4)',
                marginTop: '0.5rem', maxWidth: 220, lineHeight: 1.6,
              }}>
                sudah menerima {palingSudah?.label?.toLowerCase()}
              </div>
            </div>
          </div>
          {/* Progress bar global dihapus: angkanya menjumlahkan pertanyaan
              multi-jawab, jadi "sudah vs belum" secara keseluruhan tidak
              punya arti yang sah. */}
        </div>

        {/* ── Kolom kanan: bubble chart ── */}
        <div>
          <div className="lato-bold" style={{
            fontSize: '0.68rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'var(--ws2-text-3)',
            marginBottom: '2rem',
          }}>
            Bantuan yang Belum Terjangkau
          </div>
          {!hasData ? (
            <div className="lato-light" style={{ color: 'var(--ws2-text-4)', fontSize: '0.85rem' }}>
              Menunggu data dari insight.json…
            </div>
          ) : (
            <BubbleChart items={bubbleData} total={totalRT} visible={sceneVisible} />
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .kb-s1-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          .kb-s1-grid > div:first-child {
            position: relative !important;
            top: 0 !important;
          }
          .kb-bubble-wrap { max-width: 100% !important; }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   Scene 2: Ringkasan Narasi
   — Sticky pull quote kiri + rail progres vertikal (gaya cula.tech)
   — Kolom kanan: stat besar + prose + mini pull quote penutup
───────────────────────────────────────────*/
function SceneRingkasanNarasi() {
  const [ref, visible] = useInView(0.15);
  const containerRef = useRef(null);
  const railRef = useRef(null);

  const totalKK   = insights?.ringkasan_dataset?.total_rt_keluarga || 0;
  const totalDesa = insights?.ringkasan_dataset?.total_desa_infra || 0;
  const totalFas  = insights?.ringkasan_dataset?.total_fasilitas_gabungan || 0;
  const [sceneRef, sceneVisible] = useSceneReveal();

  // Rail progres — terisi mengikuti posisi scroll di sepanjang kolom kanan
  useEffect(() => {
    if (!containerRef.current || !railRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(railRef.current, { scaleY: 0 }, {
        scaleY: 1,
        ease: 'none',
        transformOrigin: 'top center',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sceneRef}
      style={{
        background: 'transparent',
        padding: '7rem 2rem',
        opacity: sceneVisible ? 1 : 0,
        transform: sceneVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'opacity, transform',
      }}
    >
      <div
        ref={containerRef}
        className="kebutuhan-scene2-grid"
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
          gap: '4rem',
          alignItems: 'start',
        }}
      >
        {/* Kolom kiri: pull quote besar + rail progres, sticky */}
        <div style={{ position: 'sticky', top: '7rem', display: 'flex', gap: '1.4rem' }}>
          {/* Rail progres vertikal — gaya cula.tech */}
          <div style={{
            width: 2,
            alignSelf: 'stretch',
            minHeight: 220,
            background: 'rgba(21,23,61,0.08)',
            borderRadius: 1,
            position: 'relative',
            flexShrink: 0,
          }}>
            <div
              ref={railRef}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'var(--ws2-line-2)',
                borderRadius: 1,
                transform: 'scaleY(0)',
                transformOrigin: 'top center',
              }}
            />
          </div>

          <div>
            <blockquote style={{
              fontFamily: 'var(--font-title)',
              fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)',
              fontStyle: 'italic',
              fontWeight: 700,
              color: 'var(--ws2-ink-1)',
              lineHeight: 1.35,
              margin: 0,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.9s ease, transform 0.9s ease',
            }}>
              "Data ini bukan sekadar statistik, ini adalah peta jalan menuju pemulihan."
            </blockquote>
          </div>
        </div>

        {/* Kolom kanan: campuran stat besar & prose, tidak lagi seragam */}
        <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '3.2rem' }}>

          {/* Stat 1: total keluarga & desa */}
          <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(22px)',
            transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.8rem', marginBottom: '0.8rem' }}>
              <span className="playfair-display" style={{
                fontSize: 'clamp(2.6rem, 7vw, 4.6rem)',
                fontWeight: 700,
                fontStyle: 'italic',
                color: '#E67E22',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {totalKK.toLocaleString('id-ID')}
              </span>
              <span className="lato-bold" style={{
                fontSize: '0.85rem', letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(21,23,61,0.45)',
              }}>
                keluarga terdata
              </span>
            </div>
            <p className="lato-regular" style={{
              fontSize: 'clamp(0.98rem, 1.8vw, 1.15rem)',
              lineHeight: 1.95,
              color: 'var(--ws2-ink-2)',
              margin: 0,
            }}>
              Pendataan R3P telah menjangkau keluarga-keluarga di{' '}
              <strong style={{ color: '#628141' }}>{totalDesa.toLocaleString('id-ID')} desa dan kelurahan</strong>{' '}
              yang tersebar di tiga provinsi terdampak bencana yakni, Aceh, Sumatera Utara, dan Sumatera Barat.
            </p>
          </div>

          {/* Prose 1 — sedikit indent agar tidak seragam dengan stat block */}
          <p className="lato-regular" style={{
            fontSize: 'clamp(0.98rem, 1.8vw, 1.15rem)',
            lineHeight: 1.95,
            color: 'var(--ws2-ink-2)',
            margin: 0,
            paddingLeft: '1.6rem',
            borderLeft: '2px solid rgba(21,23,61,0.1)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(22px)',
            transition: 'opacity 0.7s ease 0.28s, transform 0.7s ease 0.28s',
          }}>
            Dari data yang berhasil dikumpulkan, terlihat jelas bahwa bencana ini tidak hanya merobohkan
            bangunan fisik, tetapi juga mengguncang fondasi sosial-ekonomi masyarakat. Ribuan keluarga
            kehilangan sumber penghidupan, akses terhadap layanan dasar, dan tempat bernaung yang layak.
          </p>

          {/* Stat 2: fasilitas publik */}
          <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(22px)',
            transition: 'opacity 0.7s ease 0.46s, transform 0.7s ease 0.46s',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.8rem', marginBottom: '0.8rem' }}>
              <span className="playfair-display" style={{
                fontSize: 'clamp(2.6rem, 7vw, 4.6rem)',
                fontWeight: 700,
                fontStyle: 'italic',
                color: '#628141',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {totalFas.toLocaleString('id-ID')}
              </span>
              <span className="lato-bold" style={{
                fontSize: '0.85rem', letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(21,23,61,0.45)',
              }}>
                fasilitas publik terdata
              </span>
            </div>
            <p className="lato-regular" style={{
              fontSize: 'clamp(0.98rem, 1.8vw, 1.15rem)',
              lineHeight: 1.95,
              color: 'var(--ws2-ink-2)',
              margin: 0,
            }}>
              Mencakup sekolah, puskesmas, masjid, pasar, dan fasilitas ekonomi lainnya. Dari jumlah
              tersebut, sebagian besar mengalami kerusakan dalam berbagai tingkat keparahan.
            </p>
          </div>

          {/* Penutup — kembali ke pull-quote kecil, menutup ritme */}
          <p className="lato-regular" style={{
            fontFamily: 'var(--font-title)',
            fontSize: 'clamp(1.1rem, 2.4vw, 1.5rem)',
            fontStyle: 'italic',
            lineHeight: 1.7,
            color: 'var(--ws2-ink-1)',
            margin: 0,
            paddingLeft: '1.6rem',
            borderLeft: '2px solid #E67E22',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(22px)',
            transition: 'opacity 0.7s ease 0.64s, transform 0.7s ease 0.64s',
          }}>
            Data ini bukan sekadar angka. Ia adalah potret dari ketangguhan warga yang terus bertahan,
            sambil menunggu uluran tangan yang datang dari keputusan berbasis bukti.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .kebutuhan-scene2-grid {
            grid-template-columns: 1fr !important;
            gap: 2.4rem !important;
          }
          .kebutuhan-scene2-grid > div:first-child {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   Scene 3: Di Balik Angka — Confessional
   — Satu kutipan tunggal. Sangat besar. Muncul per-kata saat scroll.
   — Tidak ada kartu, tidak ada grid. Hanya teks dan kegelapan.
   — Latar: foto huntara sangat redup + grain sinematik
───────────────────────────────────────────*/
function SceneDiBalikAngka() {
  const sectionRef = useRef(null);
  const quoteWordsRef = useRef([]);
  const [visiblePhotos, setVisiblePhotos] = useState([]);
  const [isPhotoVisible, setIsPhotoVisible] = useState(false);

  const totalKK   = insights?.ringkasan_dataset?.total_rt_keluarga || 0;
  const totalDesa = insights?.ringkasan_dataset?.total_desa_infra || 0;

  const quoteText = "Kami hanya ingin segera kembali normal.";
  const words = quoteText.split(' ');

  /* url('/src/assets/...') hanya hidup di dev server dan 404 setelah build;
     nama file juga di-generate .jpg padahal di disk .JPG (aman di Windows,
     gagal di CI Linux). Sekarang impor statis .webp — semuanya huruf kecil. */
  const huntaraPhotos = HUNTARA_TILES;

  const vulnerableGroups = [
    { label: 'Lansia', desc: 'Perlindungan khusus & akses kesehatan prioritas' },
    { label: 'Ibu Hamil', desc: 'Nutrisi & pemeriksaan kesehatan teratur' },
    { label: 'Balita', desc: 'Imunisasi & gizi terpantau di huntara' },
  ];

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        setIsPhotoVisible(e.isIntersecting);
        if (e.isIntersecting) setVisiblePhotos([]);
      },
      { threshold: 0 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isPhotoVisible) return;
    let count = 0;
    const iv = setInterval(() => {
      if (count < huntaraPhotos.length) { setVisiblePhotos(p => [...p, count]); count++; }
      else clearInterval(iv);
    }, 220);
    return () => clearInterval(iv);
  }, [isPhotoVisible, huntaraPhotos.length]);

  // Word-by-word reveal — GSAP scrub
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 55%', end: 'center 45%',
        scrub: 1.2,
      },
    });
    quoteWordsRef.current.forEach((el, idx) => {
      tl.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3 }, idx * 0.09);
    });
    return () => { tl.kill(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ position: 'relative', minHeight: '130vh', overflow: 'hidden', background: 'transparent' }}
    >
      {/* Foto latar — sangat redup, acak */}
      {isPhotoVisible && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'var(--ws2-scrim)',
        }}>
          {visiblePhotos.map((idx) => {
            /* Math.random() saat render membuat posisi tiap tile berubah
               setiap komponen re-render — kolase seolah bergetar. Diganti
               fungsi deterministik dari indeksnya (React Compiler juga
               menolak pemanggilan impure di dalam render). */
            const n = (k) => (Math.sin(idx * 12.9898 + k * 78.233) + 1) / 2;
            const rx = Math.sin(idx * 13.1) * 40 + (n(1) - 0.5) * 20;
            const ry = Math.cos(idx * 7.7) * 40 + (n(2) - 0.5) * 25;
            const rs = 45 + n(3) * 70;
            const rr = (n(4) - 0.5) * 12;
            const ro = 0.12 + n(5) * 0.18;
            return (
              <div key={`bg-${idx}`} style={{
                position: 'absolute',
                left: `${50 + rx}%`, top: `${50 + ry}%`,
                width: `${rs}%`, aspectRatio: '4/3',
                transform: `translate(-50%, -50%) rotate(${rr}deg)`,
                backgroundImage: `url(${huntaraPhotos[idx % huntaraPhotos.length]})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                opacity: ro, borderRadius: 6,
                border: '1px solid var(--ws2-surface-1)',
                filter: 'grayscale(100%) contrast(0.7)',
                animation: 'bgFadeIn 1s ease forwards',
              }} />
            );
          })}
          {/* Radial overlay untuk readability */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(2,2,8,0.35) 0%, rgba(2,2,8,0.9) 80%)',
          }} />
        </div>
      )}

      <GrainOverlay opacity={0.055} />

      {/* Garis aksen kiri — bergerak naik bersamaan grain */}
      <div style={{
        position: 'absolute', left: 0, top: '50%',
        transform: 'translateY(-50%)',
        width: 3, height: '55%',
        background: 'linear-gradient(180deg, transparent, var(--ws2-green), transparent)',
        zIndex: 5,
      }} />

      {/* Konten utama — satu kolom terpusat, tidak ada padding box */}
      <div style={{
        position: 'relative', zIndex: 6,
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        padding: '6rem 2rem',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>

          {/* Heading mini */}
          <h2 className="playfair-display" style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)',
            color: '#E67E22',
            lineHeight: 1.2, marginBottom: '3rem', fontWeight: 700,
          }}>
            Di Balik Angka
          </h2>

          {/* THE Quote — raksasa, word-by-word */}
          <blockquote style={{
            fontFamily: 'var(--font-title)',
            fontSize: 'clamp(2rem, 5.5vw, 3.8rem)',
            fontStyle: 'italic', fontWeight: 700,
            lineHeight: 1.45, margin: '0 0 1.5rem',
            padding: '0 0 0 2rem',
            borderLeft: '3px solid #E67E22',
          }}>
            {words.map((word, i) => (
              <span
                key={i}
                ref={el => (quoteWordsRef.current[i] = el)}
                style={{ color: 'var(--ws2-text-1)', display: 'inline-block', marginRight: '0.38em', opacity: 0 }}
              >
                {word}
              </span>
            ))}
          </blockquote>

          {/* Kelompok rentan — baris horizontal, tanpa box/card */}
          <div style={{
            borderTop: '1px solid var(--ws2-line-1)',
            paddingTop: '2.5rem', marginBottom: '2.5rem',
          }}>
            <div className="lato-bold" style={{
              fontSize: '0.65rem', letterSpacing: '0.2em',
              textTransform: 'uppercase', color: '#E67E22',
              marginBottom: '2rem',
            }}>
              Kelompok Rentan dalam Huntara
            </div>
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              {vulnerableGroups.map(g => (
                <div key={g.label} style={{ minWidth: 150 }}>
                  <div className="lato-bold" style={{
                    fontSize: '0.85rem', color: '#E5D9B6', marginBottom: '0.5rem',
                  }}>
                    {g.label}
                  </div>
                  <div className="lato-regular" style={{
                    fontSize: '0.7rem', color: 'var(--ws2-text-2)', lineHeight: 1.5, maxWidth: 160,
                  }}>
                    {g.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Narasi penutup — teks saja, tanpa border-radius box */}
          <p className="lato-regular" style={{
            fontSize: '1rem', lineHeight: 2,
            color: 'var(--ws2-text-2)',
            paddingLeft: '2rem',
            borderLeft: '2px solid rgba(98,129,65,0.25)',
            margin: 0,
          }}>
            Setiap variabel data, kebutuhan air bersih, akses kesehatan,
            tingkat kerusakan rumah adalah representasi nyata keluarga dan
            kelompok rentan yang bertahan di huntara dengan keterbatasan
            fasilitas dasar, nutrisi, dan layanan kesehatan.
          </p>

          {/* Mini statistik — tiga angka, sangat kecil */}
          {totalKK > 0 && (
            <div style={{
              marginTop: '3rem', display: 'flex', gap: '2.5rem', flexWrap: 'wrap',
              borderTop: '1px solid var(--ws2-surface-1)', paddingTop: '2rem',
            }}>
              {[
                { val: totalKK.toLocaleString('id-ID'), label: 'Keluarga di Huntara', color: '#628141' },
                { val: totalDesa.toLocaleString('id-ID'), label: 'Lokasi Huntara', color: '#E67E22' },
                { val: '3', label: 'Provinsi Bencana', color: '#FFFFFF' },
              ].map(s => (
                <div key={s.label}>
                  <div className="playfair-display" style={{
                    fontSize: '1.8rem', fontWeight: 700, color: s.color, lineHeight: 1,
                  }}>
                    {s.val}
                  </div>
                  <div className="lato-regular" style={{
                    fontSize: '0.68rem', color: 'var(--ws2-text-4)',
                    textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.4rem',
                  }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bgFadeIn { from { opacity: 0; } to { opacity: inherit; } }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   Scene 4: Ajakan Aksi
   — Full-bleed dark section dengan layout vertikal terpusat
   — Headline besar + sub-narasi + two-column social proof
   — CTA panel transparan, backdrop blur, border tipis
   — Gaya: pudding.cool editorial meets cula.tech clean CTA
───────────────────────────────────────────*/
function SceneAjakan() {
  const [refHero,  visHero]  = useInView(0.15);
  const [refStats, visStats] = useInView(0.2);
  const [refCTA,   visCTA]   = useInView(0.2);
  const [sceneRef, sceneVisible] = useSceneReveal();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Hasil Pendataan R3P — Laporan Bencana',
        text: 'Data pendataan bencana di Aceh, Sumatera Utara, dan Sumatera Barat.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href)
        .then(() => alert('Link berhasil disalin!'))
        .catch(() => {});
    }
  };

  const STATS = [
    { val: '401',   label: 'Petugas Lapangan',   color: '#628141', desc: 'turun ke lapangan langsung' },
    { val: '1.039', label: 'Kunjungan Lapangan',  color: '#E67E22', desc: 'titik data terverifikasi' },
    { val: '3',     label: 'Provinsi Terdampak',  color: 'var(--ws2-ink-1)', desc: 'Aceh · Sumut · Sumbar' },
    { val: '6',     label: 'Jenis Kebutuhan',     color: 'var(--ws2-ink-1)', desc: 'dipetakan per keluarga' },
  ];

  return (
    <section
      ref={sceneRef}
      style={{
        position: 'relative',
        background: 'transparent',
        padding: '9rem 2rem 8rem',
        overflow: 'hidden',
        opacity: sceneVisible ? 1 : 0,
        transform: sceneVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'opacity, transform',
      }}
    >
      <GrainOverlay opacity={0.04} />

      {/* Dekoratif: lingkaran besar redup kanan */}
      <div aria-hidden="true" style={{
        position: 'absolute', right: '-18%', top: '10%',
        width: '55%', maxWidth: 600, aspectRatio: '1/1',
        borderRadius: '50%',
        border: '1px solid rgba(98,129,65,0.07)',
        boxShadow: 'inset 0 0 0 80px rgba(98,129,65,0.02)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Dekoratif: lingkaran kecil kiri bawah */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: '-8%', bottom: '8%',
        width: '30%', maxWidth: 340, aspectRatio: '1/1',
        borderRadius: '50%',
        border: '1px solid rgba(230,126,34,0.05)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: 960, margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: '5rem',
      }}>

        {/* ── Bagian Hero: eyebrow + headline utama + sub-narasi ── */}
        <div
          ref={refHero}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '4rem',
            alignItems: 'end',
            opacity: visHero ? 1 : 0,
            transform: visHero ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 1s ease, transform 1s ease',
          }}
          className="kb-s4-hero"
        >
          {/* Kiri: teks utama */}
          <div>
            <h2 className="playfair-display" style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              color: 'var(--ws2-ink-1)', lineHeight: 1.15,
              fontStyle: 'italic', marginBottom: '1.6rem',
              letterSpacing: '-0.01em',
            }}>
              Setiap kesadaran
              <br />
              <span style={{ color: 'var(--ws2-ink-1)' }}>adalah langkah nyata.</span>
            </h2>

            {/* Divider animasi */}
            <div style={{
              width: visHero ? 56 : 0,
              height: 2,
              background: 'linear-gradient(90deg, #628141, rgba(98,129,65,0.3))',
              marginBottom: '1.6rem',
              transition: 'width 1s ease 0.4s',
              borderRadius: 1,
            }} />

            <p className="lato-regular" style={{
              fontSize: '1.05rem', lineHeight: 1.9,
              color: 'var(--ws2-ink-2)',
              maxWidth: 420, margin: 0,
            }}>
              Data ini ada karena ratusan petugas turun ke lapangan.
              Bagi agar lebih banyak pihak dapat membaca dan bergerak bersama.
            </p>
          </div>

          {/* Kanan: pull quote emosional */}
          <div style={{
            borderLeft: '2px solid rgba(98,129,65,0.3)',
            paddingLeft: '2rem',
          }}>
            <p className="playfair-display" style={{
              fontSize: 'clamp(1.1rem, 2.2vw, 1.55rem)',
              fontStyle: 'italic', lineHeight: 1.75,
              color: 'var(--ws2-ink-3)',
              margin: 0,
            }}>
              "Pemulihan bukan sekadar soal fisik —
              ia dimulai dari data yang jujur,
              dan dari tangan yang mau berbagi."
            </p>
            <div className="lato-regular" style={{
              fontSize: '0.75rem', color: 'var(--ws2-green)',
              letterSpacing: '0.1em', marginTop: '1.2rem',
              textTransform: 'uppercase',
            }}>
              — Tim Pendataan R3P, 2026
            </div>
          </div>
        </div>

        {/* ── Social Proof: 4 angka ── */}
        <div
          ref={refStats}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0',
            borderTop: '1px solid var(--ws2-surface-1)',
            borderBottom: '1px solid var(--ws2-surface-1)',
            opacity: visStats ? 1 : 0,
            transform: visStats ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.9s ease 0.1s, transform 0.9s ease 0.1s',
          }}
          className="kb-s4-stats"
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: '2.2rem 1.5rem',
                borderRight: i < STATS.length - 1 ? '1px solid var(--ws2-surface-1)' : 'none',
                display: 'flex', flexDirection: 'column', gap: '0.4rem',
              }}
            >
              <div className="playfair-display" style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                fontWeight: 700, color: s.color,
                lineHeight: 1, letterSpacing: '-0.02em',
              }}>
                {s.val}
              </div>
              <div className="lato-bold" style={{
                fontSize: '0.72rem', letterSpacing: '0.15em',
                textTransform: 'uppercase', color: 'var(--ws2-ink-3)',
                marginTop: '0.2rem',
              }}>
                {s.label}
              </div>
              <div className="lato-regular" style={{
                fontSize: '0.68rem', color: 'var(--ws2-ink-4)',
                lineHeight: 1.4,
              }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA Panel: dua tombol side-by-side dalam container transparan ── */}
        <div
          ref={refCTA}
          style={{
            opacity: visCTA ? 1 : 0,
            transform: visCTA ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
            gap: '2rem',
            alignItems: 'center',
          }}
          className="kb-s4-cta"
        >
          {/* Label kiri */}
          <div>
            <p className="lato-regular" style={{
              fontSize: '1rem', lineHeight: 1.8,
              color: 'var(--ws2-ink-3)', margin: 0,
              maxWidth: 380,
            }}>
              Bagi laporan ini kepada pengambil keputusan,
              relawan, dan siapa pun yang peduli.
            </p>
          </div>

          {/* Tombol kanan */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '1rem',
            padding: '2rem',
            background: 'var(--ws2-surface-c2)',
            border: '1px solid var(--ws2-line-c1)',
            borderRadius: 16,
            backdropFilter: 'blur(8px)',
          }}>
            <button
              onClick={handleShare}
              style={{
                width: '100%',
                padding: '1rem 1.8rem',
                background: '#628141',
                color: 'var(--ws2-ink-1)', border: 'none',
                fontSize: '0.95rem', fontFamily: 'var(--font-content)',
                fontWeight: 700, letterSpacing: '0.04em',
                cursor: 'pointer', borderRadius: 10,
                boxShadow: '0 6px 24px rgba(98,129,65,0.45)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--ws2-green)';
                e.currentTarget.style.boxShadow = '0 10px 32px rgba(98,129,65,0.65)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#628141';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(98,129,65,0.45)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Bagikan Laporan Ini
            </button>

            <Link
              to="/"
              style={{
                display: 'block', width: '100%',
                padding: '0.9rem 1.8rem',
                background: 'transparent',
                color: 'var(--ws2-ink-3)',
                border: '1px solid var(--ws2-line-c2)',
                fontSize: '0.9rem', fontFamily: 'var(--font-content)',
                fontWeight: 600, letterSpacing: '0.03em',
                cursor: 'pointer', borderRadius: 10,
                textDecoration: 'none', textAlign: 'center',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--ws2-text-4)';
                e.currentTarget.style.color = '#E5D9B6';
                e.currentTarget.style.background = 'rgba(229,217,182,0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--ws2-line-2)';
                e.currentTarget.style.color = 'var(--ws2-text-3)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 760px) {
          .kb-s4-hero {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          .kb-s4-stats {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .kb-s4-stats > div {
            border-right: none !important;
            border-bottom: 1px solid var(--ws2-surface-1) !important;
          }
          .kb-s4-cta {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
        @media (max-width: 480px) {
          .kb-s4-stats {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   Scene 5: Penutup Interaktif
   — Mouse-tracking spotlight yang mengikuti kursor
   — Partikel mengambang yang bereaksi terhadap hover
   — Kata-kata muncul satu per satu saat scroll (GSAP scrub)
   — Kursor kustom berbentuk lingkaran cahaya
   — Hover pada kata = highlight warna + scale
───────────────────────────────────────────*/

// Partikel mengambang — deterministik
const FLOAT_PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: ((i * 73 + 17) % 92) + 4,
  y: ((i * 41 + 29) % 88) + 6,
  size: 2 + (i % 4),
  dur: 4 + (i % 6),
  delay: (i % 8) * 0.5,
  color: i % 3 === 0 ? '#628141' : i % 3 === 1 ? '#E67E22' : '#E5D9B6',
  opacity: 0.12 + (i % 5) * 0.05,
}));


function SceneDataTerjaga() {
  const sectionRef   = useRef(null);
  const wordsRef     = useRef([]);
  const [ref, visible] = useInView(0.1);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [entered, setEntered] = useState(false);
  const [sceneRef, sceneVisible] = useSceneReveal();

  // Mouse-tracking spotlight
  const handleMouseMove = useCallback((e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMouse({ x, y });
    setEntered(true);
  }, []);

  // GSAP word-by-word reveal saat scroll masuk
  useEffect(() => {
    if (!sectionRef.current || wordsRef.current.length === 0) return;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%',
        end: 'center 40%',
        scrub: 1.4,
      },
    });
    wordsRef.current.forEach((el, i) => {
      if (!el) return;
      tl.fromTo(el,
        { opacity: 0, y: 22, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4 },
        i * 0.07
      );
    });
    return () => tl.kill();
  }, []);

  // Spotlight mengikuti mouse — smooth via CSS transition
  const spotlightStyle = {
    background: entered
      ? `radial-gradient(circle 420px at ${mouse.x}% ${mouse.y}%, rgba(98,129,65,0.13) 0%, rgba(230,126,34,0.05) 35%, transparent 65%)`
      : 'radial-gradient(circle 420px at 50% 50%, rgba(98,129,65,0.06) 0%, transparent 65%)',
    transition: 'background 0.08s linear',
  };

  // Baris kalimat — setiap kata bisa hover
  const LINE1 = [
    { w: 'Data', c: '#fff' },
    { w: 'yang', c: '#fff' },
    { w: 'jujur', c: '#E5D9B6' },
    { w: 'adalah', c: '#fff' },
  ];
  const LINE2 = [
    { w: 'awal', c: '#628141' },
    { w: 'dari', c: '#fff' },
    { w: 'pemulihan.', c: '#E67E22' },
  ];

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        sceneRef.current = node;
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setEntered(false)}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent',
        overflow: 'hidden',
        opacity: sceneVisible ? 1 : 0,
        transform: sceneVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'opacity, transform',
      }}
    >
      <GrainOverlay opacity={0.05} />

      {/* Fajar perlahan naik dari tepi bawah — dua lapis gradien yang bergeser
          sangat lambat (18 dan 24 detik). Dipilih karena kalimat penutupnya
          bicara tentang AWAL pemulihan; gerakannya harus terasa seperti langit
          menjelang terang, bukan animasi dekoratif. */}
      <div aria-hidden="true" className="kb-fajar kb-fajar-1" />
      <div aria-hidden="true" className="kb-fajar kb-fajar-2" />

      {/* Spotlight layer */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 1,
        pointerEvents: 'none',
        ...spotlightStyle,
      }} />

      {/* Partikel mengambang — pulse animasi via CSS */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {FLOAT_PARTICLES.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              borderRadius: '50%',
              background: p.color,
              opacity: p.opacity,
              animation: `particleFloat${p.id % 4} ${p.dur}s ${p.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Kursor kustom — lingkaran cahaya */}
      {entered && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: `${mouse.x}%`,
            top: `${mouse.y}%`,
            width: 36, height: 36,
            borderRadius: '50%',
            border: '1.5px solid rgba(98,129,65,0.7)',
            boxShadow: '0 0 18px rgba(98,129,65,0.4)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 999,
            transition: 'left 0.06s linear, top 0.06s linear',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* Konten teks */}
      <div
        ref={ref}
        style={{
          position: 'relative', zIndex: 2,
          textAlign: 'center',
          padding: '4rem 2rem',
          maxWidth: 900,
        }}
      >
        {/* Headline — kata per kata, GSAP scrub + hover */}
        <h2
          className="playfair-display"
          style={{
            fontSize: 'clamp(2.6rem, 7vw, 5.4rem)',
            fontStyle: 'italic', fontWeight: 700,
            lineHeight: 1.25, margin: '0 0 1.8rem',
            letterSpacing: '-0.01em',
          }}
        >
          {/* Baris 1 */}
          <span style={{ display: 'block' }}>
            {LINE1.map((w, i) => (
              <span
                key={i}
                ref={el => (wordsRef.current[i] = el)}
                onMouseEnter={e => {
                  e.currentTarget.style.color = w.c === '#fff' ? '#E5D9B6' : w.c;
                  e.currentTarget.style.textShadow = `0 0 40px ${w.c === '#fff' ? '#E5D9B6' : w.c}aa`;
                  e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = w.c;
                  e.currentTarget.style.textShadow = 'none';
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                }}
                style={{
                  display: 'inline-block',
                  color: w.c,
                  marginRight: '0.3em',
                  opacity: 0,
                  cursor: 'default',
                  transition: 'color 0.2s ease, text-shadow 0.2s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                {w.w}
              </span>
            ))}
          </span>
          {/* Baris 2 */}
          <span style={{ display: 'block' }}>
            {LINE2.map((w, i) => (
              <span
                key={i}
                ref={el => (wordsRef.current[LINE1.length + i] = el)}
                onMouseEnter={e => {
                  e.currentTarget.style.color = w.c;
                  e.currentTarget.style.textShadow = `0 0 50px ${w.c}bb, 0 0 100px ${w.c}44`;
                  e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = w.c;
                  e.currentTarget.style.textShadow = 'none';
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                }}
                style={{
                  display: 'inline-block',
                  color: w.c,
                  marginRight: '0.3em',
                  opacity: 0,
                  cursor: 'default',
                  transition: 'color 0.2s ease, text-shadow 0.2s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                {w.w}
              </span>
            ))}
          </span>
        </h2>

        {/* Divider */}
        <div style={{
          width: visible ? 64 : 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #628141, transparent)',
          margin: '0 auto 2.6rem',
          transition: 'width 1.2s ease 0.6s',
          borderRadius: 1,
        }} />

        {/* Sub-kalimat — fade in */}
        <p
          className="lato-regular"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            lineHeight: 1.95,
            color: 'var(--ws2-text-4)',
            maxWidth: 540, margin: '0 auto 3.5rem',
            opacity: visible ? 1 : 0,
            transition: 'opacity 1s ease 0.8s',
          }}
        >
          Setiap baris data adalah satu keluarga yang ditemui,
          satu cerita yang dicatat, satu langkah menuju keputusan yang lebih baik.
        </p>

        {/* Footer */}
        <div style={{ opacity: visible ? 0.35 : 0, transition: 'opacity 1s ease 1.2s' }}>
          <span className="lato-regular" style={{
            fontSize: '0.7rem', color: 'var(--ws2-text-4)',
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>
            Hasil Pendataan R3P · Data Pemulihan Bencana · 2026
          </span>
        </div>
      </div>

      <style>{`
        .kb-fajar {
          position: absolute;
          left: -20%;
          right: -20%;
          bottom: -35%;
          height: 85%;
          pointer-events: none;
          z-index: 0;
          border-radius: 50%;
          filter: blur(90px);
        }
        .kb-fajar-1 {
          background: radial-gradient(ellipse at 50% 100%, rgba(98,129,65,0.30) 0%, transparent 68%);
          animation: kbFajar1 18s ease-in-out infinite;
        }
        .kb-fajar-2 {
          background: radial-gradient(ellipse at 38% 100%, rgba(230,126,34,0.20) 0%, transparent 62%);
          animation: kbFajar2 24s ease-in-out infinite;
        }
        @keyframes kbFajar1 {
          0%, 100% { transform: translate3d(-3%, 4%, 0) scale(1); opacity: 0.55; }
          50%      { transform: translate3d(3%, -2%, 0) scale(1.1); opacity: 0.9; }
        }
        @keyframes kbFajar2 {
          0%, 100% { transform: translate3d(4%, 2%, 0) scale(1.05); opacity: 0.4; }
          50%      { transform: translate3d(-4%, -4%, 0) scale(1); opacity: 0.75; }
        }
        @media (prefers-reduced-motion: reduce) {
          .kb-fajar { animation: none; }
        }
        @keyframes particleFloat0 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(8px,-14px) scale(1.3); }
        }
        @keyframes particleFloat1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-10px,10px) scale(0.8); }
        }
        @keyframes particleFloat2 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(12px,6px) scale(1.2); }
          66%     { transform: translate(-6px,12px) scale(0.9); }
        }
        @keyframes particleFloat3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(6px,-18px) scale(1.4); }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   Root Export
───────────────────────────────────────────*/
export default function BabakKebutuhan() {
  return (
    <>
      <SceneJeritanBantuan />
      <BgSeam from="navy" to="cream" />
      <SceneRingkasanNarasi />
      <BgSeam from="cream" to="navy" />
      <SceneDiBalikAngka />
      {/* Ajakan diberi latar krem supaya berbeda dari dua scene gelap yang
          mengapitnya, sekaligus melanjutkan pola selang-seling warna. */}
      <BgSeam from="navy" to="cream" />
      <SceneAjakan />
      <BgSeam from="cream" to="navy" />
      <SceneDataTerjaga />
    </>
  );
}
