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

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import insights from '../insight.json';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.defaults({ scrub: 0.8 });

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

function useParallax(speed = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, [speed]);
  return ref;
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
const BUBBLE_CONFIG = {
  r38a: { color: '#E67E22', label: 'Makanan' },
  r38b: { color: '#5FB0E0', label: 'Pakaian' },
  r38c: { color: '#E5D9B6', label: 'Perbaikan Rumah' },
  r38d: { color: '#7FBF6A', label: 'Pengobatan' },
  r38e: { color: '#628141', label: 'Uang Tunai' },
  r38f: { color: '#C98A4B', label: 'Lainnya' },
};

/* ─────────────────────────────────────────
   Ambient Ticker — teks kebutuhan yang scroll
   horizontal tak henti di background scene 1
───────────────────────────────────────────*/
function AmbientTicker({ items }) {
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
              color: i % 3 === 0 ? 'rgba(230,126,34,0.18)' : i % 3 === 1 ? 'rgba(98,129,65,0.15)' : 'rgba(229,217,182,0.12)',
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
───────────────────────────────────────────*/
function BubbleChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const [positions, setPositions] = useState({});
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <div className="lato-regular" style={{
        color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem',
        textAlign: 'center', padding: '3rem',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14,
      }}>
        Data kebutuhan akan muncul setelah insight.json tersedia.
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => (b.belum || 0) - (a.belum || 0));
  const maxBelum = sorted[0]?.belum || 1;

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodes = sorted.slice(0, 6).map((item) => {
      const fraction = (item.belum || 0) / maxBelum;
      const size = Math.max(80, Math.round(fraction * 200));
      return {
        col: item.col,
        x: centerX + (Math.random() - 0.5) * 180,
        y: centerY + (Math.random() - 0.5) * 180,
        vx: 0, vy: 0,
        size, radius: size / 2,
      };
    });

    let animId;
    let iter = 0;
    const simulate = () => {
      const damp = 0.92, repulse = 2600, grav = 0.055;
      nodes.forEach((node, i) => {
        const dx = centerX - node.x, dy = centerY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 80) {
          node.vx += (dx / dist) * grav;
          node.vy += (dy / dist) * grav;
        }
        nodes.forEach((other, j) => {
          if (i === j) return;
          const ox = node.x - other.x, oy = node.y - other.y;
          const d2 = ox * ox + oy * oy;
          const d = Math.sqrt(d2);
          const minD = node.radius + other.radius + 18;
          if (d < minD && d > 0) {
            const f = (minD - d) * repulse / d2;
            node.vx += (ox / d) * f; node.vy += (oy / d) * f;
          }
        });
        node.vx *= damp; node.vy *= damp;
        node.x += node.vx; node.y += node.vy;
        const pad = node.radius + 10;
        if (node.x - node.radius < pad) { node.x = node.radius + pad; node.vx *= -0.5; }
        if (node.x + node.radius > width - pad) { node.x = width - node.radius - pad; node.vx *= -0.5; }
        if (node.y - node.radius < pad) { node.y = node.radius + pad; node.vy *= -0.5; }
        if (node.y + node.radius > height - pad) { node.y = height - node.radius - pad; node.vy *= -0.5; }
      });
      setPositions(nodes.reduce((acc, n) => { acc[n.col] = { x: n.x, y: n.y }; return acc; }, {}));
      iter++;
      if (iter < 90) animId = requestAnimationFrame(simulate);
    };

    setMounted(true);
    animId = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animId);
  }, [data, maxBelum]);

  const FALLBACK_POS = [
    { x: '50%', y: '50%' }, { x: '22%', y: '26%' }, { x: '78%', y: '24%' },
    { x: '14%', y: '70%' }, { x: '82%', y: '68%' }, { x: '50%', y: '88%' },
  ];

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', width: '100%', maxWidth: 580, height: 480,
        margin: '0 auto', borderRadius: 20, overflow: 'hidden',
        border: '1px solid rgba(229,217,182,0.07)',
        background: `
          radial-gradient(ellipse at 50% 35%, rgba(98,129,65,0.12) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 85%, rgba(230,126,34,0.09) 0%, transparent 50%),
          linear-gradient(165deg, #1c1f4d 0%, #11132f 55%, #0a0b1f 100%)
        `,
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Grid kontur tipis */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, opacity: 0.28,
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(229,217,182,0.04) 0px, rgba(229,217,182,0.04) 1px, transparent 1px, transparent 52px),
          repeating-linear-gradient(90deg, rgba(229,217,182,0.04) 0px, rgba(229,217,182,0.04) 1px, transparent 1px, transparent 52px)
        `,
      }} />
      {/* Vignette */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 42%, rgba(6,7,19,0.88) 100%)',
        pointerEvents: 'none',
      }} />

      {sorted.slice(0, 6).map((item, i) => {
        const fraction = (item.belum || 0) / maxBelum;
        const size = Math.max(80, Math.round(fraction * 200));
        const cfg = BUBBLE_CONFIG[item.col] || { emoji: '📌', color: '#aaa', label: item.col };
        const isHov = hovered === item.col;
        const pos = positions[item.col] || FALLBACK_POS[i] || { x: 290, y: 240 };
        const intense = Math.min(1, (item.belum / maxBelum) * 1.2);
        const bgA = isHov ? 0.5 : 0.2 + intense * 0.15;
        const bdA = isHov ? 1 : 0.3 + intense * 0.4;

        return (
          <div
            key={item.col}
            onMouseEnter={() => setHovered(item.col)}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setHovered(item.col)}
            onTouchEnd={() => setHovered(null)}
            style={{
              position: 'absolute',
              left: pos.x, top: pos.y,
              transform: `translate(-50%, -50%) scale(${isHov ? 1.18 : 1}) ${!mounted ? 'scale(0.3)' : ''}`,
              width: size, height: size, borderRadius: '50%',
              background: isHov
                ? `radial-gradient(circle, ${cfg.color}${Math.round(bgA * 255).toString(16).padStart(2, '0')}, ${cfg.color}18)`
                : `radial-gradient(circle, ${cfg.color}${Math.round(bgA * 130).toString(16).padStart(2, '0')}, ${cfg.color}05)`,
              backdropFilter: 'blur(2px)',
              border: `1.5px solid ${cfg.color}${Math.round(bdA * 255).toString(16).padStart(2, '0')}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
              boxShadow: isHov
                ? `0 0 40px ${cfg.color}99, 0 0 6px ${cfg.color}, inset 0 0 22px ${cfg.color}33`
                : `0 0 ${10 + intense * 16}px ${cfg.color}55, 0 0 2px ${cfg.color}aa`,
              opacity: mounted ? 1 : 0,
              transitionDelay: `${i * 0.08}s`,
              zIndex: isHov ? 10 : 1,
            }}
          >
            <span style={{ fontSize: size > 130 ? '2.4rem' : '1.5rem' }}>{cfg.emoji}</span>
            <span className="lato-bold" style={{
              fontSize: size > 130 ? '0.78rem' : '0.65rem',
              color: '#fff', textAlign: 'center', padding: '0 4px',
              lineHeight: 1.2, opacity: isHov ? 0.6 : 1,
            }}>
              {cfg.label || item.nama}
            </span>

            {isHov && (
              <>
                <div style={{
                  position: 'absolute',
                  bottom: size / 2 + 22,
                  left: '50%', transform: 'translateX(-50%)',
                  background: cfg.color, color: '#fff',
                  padding: '0.6rem 1.1rem', borderRadius: 9,
                  fontSize: '0.75rem', whiteSpace: 'nowrap',
                  boxShadow: `0 4px 18px ${cfg.color}66`,
                  zIndex: 20, pointerEvents: 'none',
                  animation: 'tooltipUp 0.25s ease forwards',
                }}>
                  <div className="lato-bold" style={{ fontSize: '0.9rem', marginBottom: '0.15rem' }}>
                    {(item.belum || 0).toLocaleString('id-ID')} KK
                  </div>
                  <div className="lato-regular" style={{ fontSize: '0.62rem', opacity: 0.9 }}>Belum menerima bantuan</div>
                  {item.sudah > 0 && (
                    <div className="lato-regular" style={{ fontSize: '0.62rem', opacity: 0.8, marginTop: '0.15rem' }}>
                      {item.sudah.toLocaleString('id-ID')} KK sudah dibantu
                    </div>
                  )}
                </div>
                <div style={{
                  position: 'absolute', bottom: size / 2 + 8, left: '50%',
                  transform: 'translateX(-50%)', width: 0, height: 0,
                  borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
                  borderTop: `6px solid ${cfg.color}`, zIndex: 19, pointerEvents: 'none',
                }} />
              </>
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes tooltipUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────
   Scene 1: Kebutuhan Mendesak
   — Ambient ticker di bg, sticky header + bubble chart
   — Progress bar "tachometer" bukan angka bersih
───────────────────────────────────────────*/
function SceneJeritanBantuan() {
  const global = insights?.kebutuhan?.ringkasan_global || {};

  const DEFAULT_KEBUTUHAN = {
    r38a: { nama: 'Makanan', sudah: 25430, belum: 18950, pct_sudah: 57.3 },
    r38b: { nama: 'Pakaian', sudah: 18200, belum: 26180, pct_sudah: 41.0 },
    r38c: { nama: 'Perbaikan Rumah', sudah: 12500, belum: 31650, pct_sudah: 28.3 },
    r38d: { nama: 'Pengobatan', sudah: 22300, belum: 22130, pct_sudah: 50.2 },
    r38e: { nama: 'Uang Tunai', sudah: 8900, belum: 35480, pct_sudah: 20.1 },
    r38f: { nama: 'Lainnya', sudah: 15600, belum: 28800, pct_sudah: 35.1 },
  };

  const globalData = Object.keys(global).length > 0 ? global : DEFAULT_KEBUTUHAN;
  const bubbleData = Object.entries(globalData).map(([col, v]) => ({
    col, nama: v.nama, sudah: v.sudah || 0, belum: v.belum || 0, pct_sudah: v.pct_sudah || 0,
  }));
  const hasData = bubbleData.some(b => b.sudah + b.belum > 0);
  const [sceneRef, sceneVisible] = useSceneReveal();

  const totalSudah = bubbleData.reduce((s, b) => s + b.sudah, 0);
  const totalBelum = bubbleData.reduce((s, b) => s + b.belum, 0);
  const totalKeseluruhan = totalSudah + totalBelum;
  const pctSudahGlobal = totalKeseluruhan > 0 ? (totalSudah / totalKeseluruhan) * 100 : 0;

  const [introRef, introVisible] = useInView(0.1);
  const parallaxBg = useParallax(0.2);

  const nTotalBelum = useCountUp(totalBelum, introVisible, 1800);
  const nPctSudah   = useCountUp(pctSudahGlobal, introVisible, 1800);

  // Ticker items
  const tickerItems = bubbleData.map(b => ({
    ...BUBBLE_CONFIG[b.col] || { emoji: '📌', label: b.col },
    belum: b.belum,
  }));

  return (
    <section
      ref={sceneRef}
      style={{
        position: 'relative',
        background: 'linear-gradient(160deg, #141b38 0%, #0d132a 38%, #0a0d1d 100%)',
        padding: '6rem 2rem 6rem',
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
        opacity: sceneVisible ? 1 : 0,
        transform: sceneVisible ? 'translateY(0)' : 'translateY(26px)',
        transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), background 1.2s ease',
        willChange: 'opacity, transform',
      }}
    >
      <GrainOverlay opacity={0.045} />

      {/* Latar dekoratif parallax */}
      <div ref={parallaxBg} aria-hidden="true" style={{
        position: 'absolute', top: '-15%', right: '-12%',
        width: '70%', maxWidth: 640, aspectRatio: '1/1',
        borderRadius: '50%',
        border: '1px solid rgba(230,126,34,0.06)',
        boxShadow: 'inset 0 0 0 70px rgba(98,129,65,0.025), inset 0 0 0 140px rgba(230,126,34,0.015)',
        pointerEvents: 'none', zIndex: 0,
      }} />

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
          {/* Headline — italic, dramatik */}
          <h2 className="playfair-display" style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
            color: '#fff', lineHeight: 1.1,
            marginBottom: '0.4rem', fontStyle: 'italic',
            letterSpacing: '-0.01em',
          }}>
            Kebutuhan
          </h2>
          <h2 className="playfair-display" style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
            color: '#E67E22', lineHeight: 1.1,
            marginBottom: '1.8rem', fontStyle: 'italic',
            letterSpacing: '-0.01em',
          }}>
            Mendesak
          </h2>

          {/* Divider animasi */}
          <div style={{
            width: introVisible ? 72 : 0,
            height: 2,
            background: 'linear-gradient(90deg, #E67E22, rgba(230,126,34,0.3))',
            marginBottom: '1.8rem',
            transition: 'width 1s ease 0.3s',
          }} />

          <p className="lato-regular" style={{
            fontSize: '1rem', lineHeight: 1.95,
            color: 'rgba(229,217,182,0.78)',
            maxWidth: 400, marginBottom: '2.4rem',
          }}>
            Di balik setiap angka ada keluarga yang menunggu.
            Ukuran tiap bagian menunjukkan seberapa besar kebutuhan
            yang <em>belum</em> tertangani.
          </p>

          {/* Angka besar — dua kolom pendek */}
          <div style={{
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', gap: '2.8rem', flexWrap: 'wrap',
            marginBottom: '1.8rem',
          }}>
            <div>
              <div className="playfair-display" style={{
                fontSize: 'clamp(2.6rem, 7vw, 4.2rem)',
                fontWeight: 700, color: '#E67E22',
                lineHeight: 1, letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {Math.round(nTotalBelum).toLocaleString('id-ID')}
              </div>
              <div className="lato-bold" style={{
                fontSize: '0.68rem', letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)',
                marginTop: '0.5rem',
              }}>
                KK belum terbantu
              </div>
            </div>
            <div>
              <div className="playfair-display" style={{
                fontSize: 'clamp(2.6rem, 7vw, 4.2rem)',
                fontWeight: 700, color: '#7FBF6A',
                lineHeight: 1, letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {nPctSudah.toFixed(1)}%
              </div>
              <div className="lato-bold" style={{
                fontSize: '0.68rem', letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)',
                marginTop: '0.5rem',
              }}>
                Sudah tersalurkan
              </div>
            </div>
          </div>

          {/* Progress bar — lebih tebal, lebih dramatis */}
          <div style={{ marginBottom: '2.2rem' }}>
            <div style={{
              height: 6, width: '100%', borderRadius: 3,
              background: 'rgba(255,255,255,0.07)',
              overflow: 'hidden', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                width: introVisible ? `${pctSudahGlobal}%` : '0%',
                background: 'linear-gradient(90deg, rgba(127,191,106,0.6), #7FBF6A)',
                borderRadius: 3,
                transition: 'width 1.8s cubic-bezier(0.34, 1.2, 0.64, 1) 0.3s',
                boxShadow: '0 0 14px rgba(127,191,106,0.55)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span className="lato-regular" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>
                {totalSudah.toLocaleString('id-ID')} sudah
              </span>
              <span className="lato-regular" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>
                {totalBelum.toLocaleString('id-ID')} belum
              </span>
            </div>
          </div>

        </div>

        {/* ── Kolom kanan: ringkasan kebutuhan tanpa ilustrasi bubble ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.2rem', marginTop: '0' }}>
          <div style={{
            padding: '1.5rem 1.25rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(229,217,182,0.08)',
            borderRadius: 18,
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.2)',
          }}>
            <div className="lato-bold" style={{
              fontSize: '0.68rem', letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
              marginBottom: '1rem',
            }}>
              Status Penerimaan Bantuan
            </div>
            {!hasData ? (
              <div className="lato-regular" style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.85rem' }}>
                Menunggu data dari insight.json…
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {bubbleData.map((item) => {
                  const cfg = BUBBLE_CONFIG[item.col] || { color: '#aaa', icon: '•', label: item.col };
                  const pct = item.pct_sudah || 0;

                  return (
                    <div key={item.col} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '0.5rem 1rem',
                      alignItems: 'center',
                      padding: '0.7rem 0.8rem',
                      borderRadius: 10,
                      background: `${cfg.color}12`,
                      border: `1px solid ${cfg.color}20`,
                    }}>
                      <span className="lato-regular" style={{ fontSize: '0.82rem', color: '#fff' }}>
                        <span style={{ opacity: 0.8, marginRight: '0.6rem' }}>{cfg.icon}</span>
                        {cfg.label || item.nama}
                      </span>
                      <span className="lato-bold" style={{ fontSize: '0.72rem', color: cfg.color }}>
                        {pct.toFixed(1)}% sudah
                      </span>
                      <div style={{ gridColumn: '1 / -1', height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(Math.max(pct, 0), 100)}%`,
                          background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
                          borderRadius: 999,
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
        background: 'linear-gradient(180deg, #f3eadc 0%, #efe8d8 35%, #e6dfcf 100%)',
        padding: '7rem 2rem',
        opacity: sceneVisible ? 1 : 0,
        transform: sceneVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), background 1.2s ease',
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
                background: 'linear-gradient(180deg, #E67E22, #628141)',
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
              color: '#1a1a2e',
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
              color: '#2d2d4e',
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
            color: '#2d2d4e',
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
              color: '#2d2d4e',
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
            color: '#1a1a2e',
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

  const huntaraPhotos = Array.from({ length: 20 }, (_, i) => `huntara-${String(i + 1).padStart(2, '0')}.jpg`);

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
      style={{ position: 'relative', minHeight: '130vh', overflow: 'hidden', background: '#020208' }}
    >
      {/* Foto latar — sangat redup, acak */}
      {isPhotoVisible && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'rgba(5,5,18,0.8)',
        }}>
          {visiblePhotos.map((idx) => {
            const rx = Math.sin(idx * 13.1) * 40 + (Math.random() - 0.5) * 20;
            const ry = Math.cos(idx * 7.7) * 40 + (Math.random() - 0.5) * 25;
            const rs = 45 + Math.random() * 70;
            const rr = (Math.random() - 0.5) * 12;
            const ro = 0.12 + Math.random() * 0.18;
            return (
              <div key={`bg-${idx}`} style={{
                position: 'absolute',
                left: `${50 + rx}%`, top: `${50 + ry}%`,
                width: `${rs}%`, aspectRatio: '4/3',
                transform: `translate(-50%, -50%) rotate(${rr}deg)`,
                backgroundImage: `url('/src/assets/images/${huntaraPhotos[idx]}')`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                opacity: ro, borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.06)',
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
        background: 'linear-gradient(180deg, transparent, #628141, transparent)',
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
                style={{ color: '#F4E6D1', display: 'inline-block', marginRight: '0.38em', opacity: 0 }}
              >
                {word}
              </span>
            ))}
          </blockquote>

          {/* Kelompok rentan — baris horizontal, tanpa box/card */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.07)',
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
                    fontSize: '0.7rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.5, maxWidth: 160,
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
            color: 'rgba(255,255,255,0.82)',
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
              borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem',
            }}>
              {[
                { val: totalKK.toLocaleString('id-ID'), label: 'Keluarga di Huntara', color: '#7FBF6A' },
                { val: totalDesa.toLocaleString('id-ID'), label: 'Lokasi Huntara', color: '#FF8A65' },
                { val: '3', label: 'Provinsi Bencana', color: '#4FC3F7' },
              ].map(s => (
                <div key={s.label}>
                  <div className="playfair-display" style={{
                    fontSize: '1.8rem', fontWeight: 700, color: s.color, lineHeight: 1,
                  }}>
                    {s.val}
                  </div>
                  <div className="lato-regular" style={{
                    fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)',
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
    { val: '401',   label: 'Petugas Lapangan',   color: '#7FBF6A', desc: 'turun ke lapangan langsung' },
    { val: '1.039', label: 'Kunjungan Lapangan',  color: '#E67E22', desc: 'titik data terverifikasi' },
    { val: '3',     label: 'Provinsi Terdampak',  color: '#5FB0E0', desc: 'Aceh · Sumut · Sumbar' },
    { val: '6',     label: 'Jenis Kebutuhan',     color: '#E5D9B6', desc: 'dipetakan per keluarga' },
  ];

  return (
    <section
      ref={sceneRef}
      style={{
        position: 'relative',
        background: 'linear-gradient(175deg, #0a0d22 0%, #101d19 42%, #080c1e 100%)',
        padding: '9rem 2rem 8rem',
        overflow: 'hidden',
        opacity: sceneVisible ? 1 : 0,
        transform: sceneVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), background 1.2s ease',
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
              color: '#fff', lineHeight: 1.15,
              fontStyle: 'italic', marginBottom: '1.6rem',
              letterSpacing: '-0.01em',
            }}>
              Setiap kesadaran
              <br />
              <span style={{ color: '#E5D9B6' }}>adalah langkah nyata.</span>
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
              color: 'rgba(229,217,182,0.7)',
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
              color: 'rgba(229,217,182,0.55)',
              margin: 0,
            }}>
              "Pemulihan bukan sekadar soal fisik —
              ia dimulai dari data yang jujur,
              dan dari tangan yang mau berbagi."
            </p>
            <div className="lato-regular" style={{
              fontSize: '0.75rem', color: 'rgba(98,129,65,0.65)',
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
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
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
                borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
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
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
                marginTop: '0.2rem',
              }}>
                {s.label}
              </div>
              <div className="lato-regular" style={{
                fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)',
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
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: 'rgba(98,129,65,0.12)',
              border: '1px solid rgba(98,129,65,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              color: '#E5D9B6',
              marginBottom: '1rem',
            }}>
              •
            </div>
            <div className="lato-bold" style={{
              fontSize: '0.68rem', letterSpacing: '0.24em',
              textTransform: 'uppercase', color: 'rgba(229,217,182,0.4)',
              marginBottom: '0.8rem',
            }}>
              Sebarkan Informasi
            </div>
            <p className="lato-regular" style={{
              fontSize: '1rem', lineHeight: 1.8,
              color: 'rgba(229,217,182,0.6)', margin: 0,
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
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16,
            backdropFilter: 'blur(8px)',
          }}>
            <button
              onClick={handleShare}
              style={{
                width: '100%',
                padding: '1rem 1.8rem',
                background: '#628141',
                color: '#fff', border: 'none',
                fontSize: '0.95rem', fontFamily: 'var(--font-content)',
                fontWeight: 700, letterSpacing: '0.04em',
                cursor: 'pointer', borderRadius: 10,
                boxShadow: '0 6px 24px rgba(98,129,65,0.45)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#72994e';
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

            <a
              href="/"
              style={{
                display: 'block', width: '100%',
                padding: '0.9rem 1.8rem',
                background: 'transparent',
                color: 'rgba(229,217,182,0.65)',
                border: '1px solid rgba(229,217,182,0.2)',
                fontSize: '0.9rem', fontFamily: 'var(--font-content)',
                fontWeight: 600, letterSpacing: '0.03em',
                cursor: 'pointer', borderRadius: 10,
                textDecoration: 'none', textAlign: 'center',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(229,217,182,0.45)';
                e.currentTarget.style.color = '#E5D9B6';
                e.currentTarget.style.background = 'rgba(229,217,182,0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(229,217,182,0.2)';
                e.currentTarget.style.color = 'rgba(229,217,182,0.65)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Kembali ke Beranda
            </a>
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
            border-bottom: 1px solid rgba(255,255,255,0.06) !important;
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

// Kata-kata interaktif — hover highlight
function InteractiveWord({ word, color, delay = 0, visible }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-block',
        color: hov ? (color || '#E67E22') : (color || '#fff'),
        textShadow: hov
          ? `0 0 40px ${color || '#E67E22'}cc, 0 0 80px ${color || '#E67E22'}44`
          : 'none',
        transform: hov ? 'scale(1.07) translateY(-3px)' : 'scale(1) translateY(0)',
        transition: 'color 0.25s ease, text-shadow 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        cursor: 'default',
        marginRight: '0.28em',
        opacity: visible ? 1 : 0,
        transitionDelay: hov ? '0s' : `${delay}s`,
      }}
    >
      {word}
    </span>
  );
}

function SceneDataTerjaga() {
  const sectionRef   = useRef(null);
  const spotlightRef = useRef(null);
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
  const allWords = [...LINE1, ...LINE2];

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
        background: 'linear-gradient(175deg, #030912 0%, #0a1428 42%, #090d1a 100%)',
        overflow: 'hidden',
        cursor: 'none',
        opacity: sceneVisible ? 1 : 0,
        transform: sceneVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), background 1.2s ease',
        willChange: 'opacity, transform',
      }}
    >
      <GrainOverlay opacity={0.05} />

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
            color: 'rgba(229,217,182,0.5)',
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
            fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)',
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>
            Hasil Pendataan R3P · Data Pemulihan Bencana · 2026
          </span>
        </div>
      </div>

      <style>{`
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
      <SceneRingkasanNarasi />
      <SceneDiBalikAngka />
      <SceneDataTerjaga />
    </>
  );
}
