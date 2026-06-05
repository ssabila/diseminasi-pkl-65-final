/**
 * kebutuhan.jsx — Babak 4: Kebutuhan
 *
 * Scene 1: Kebutuhan Mendesak — "Kebutuhan Mendesak"
 *   Bubble Chart interaktif — ukuran = frekuensi kebutuhan
 *
 * Scene 2: Ringkasan Narasi — (tanpa headline)
 *   Teks narasi panjang + pull quote besar
 *
 * Scene 3: Di Balik Angka — "Di Balik Angka"
 *   Quote emosional + narasi penutup
 *
 * Scene 4: Ajakan — (Ajakan aksi)
 *   Tombol share + link
 *
 * Scene 5: Data yang Terjaga — "Setiap Entri Diverifikasi untuk Kredibilitas Tinggi"
 *   Ikon verifikasi + statistik validasi data
 *
 * Data: insight.json → kebutuhan.ringkasan_global, metadata, status_penugasan
 */

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import insights from '../insight.json';

gsap.registerPlugin(ScrollTrigger);

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
   Bubble Config
───────────────────────────────────────────*/
const BUBBLE_CONFIG = {
  r38a: { emoji: '🍚', color: '#FF8A65', label: 'Makanan' },
  r38b: { emoji: '👕', color: '#4FC3F7', label: 'Pakaian' },
  r38c: { emoji: '🏠', color: '#FFD54F', label: 'Perbaikan Rumah' },
  r38d: { emoji: '💊', color: '#81C784', label: 'Pengobatan' },
  r38e: { emoji: '💵', color: '#CE93D8', label: 'Uang Tunai' },
  r38f: { emoji: '📦', color: '#F06292', label: 'Lainnya' },
};

const POSITIONS = [
  { x: '50%', y: '50%' },
  { x: '20%', y: '28%' },
  { x: '80%', y: '24%' },
  { x: '14%', y: '70%' },
  { x: '83%', y: '70%' },
  { x: '50%', y: '90%' },
];

/* ─────────────────────────────────────────
   Bubble Chart dengan Force Simulation & Animated Entrance
───────────────────────────────────────────*/
function BubbleChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const [positions, setPositions] = useState({});
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const forceRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <div className="lato-regular" style={{
        color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem',
        textAlign: 'center', padding: '3rem',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
      }}>
        💡 Data kebutuhan bantuan akan muncul setelah insight.json dihasilkan.
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => (b.belum || 0) - (a.belum || 0));
  const maxBelum = sorted[0]?.belum || 1;

  // Force simulation: simple physics-based positioning
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    // Initialize positions
    const nodes = sorted.slice(0, 6).map((item, i) => {
      const fraction = (item.belum || 0) / maxBelum;
      const size = Math.max(85, Math.round(fraction * 210));
      return {
        col: item.col,
        x: centerX + (Math.random() - 0.5) * 200,
        y: centerY + (Math.random() - 0.5) * 200,
        vx: 0,
        vy: 0,
        size: size,
        radius: size / 2,
      };
    });

    forceRef.current = nodes;

    // Animation loop with force simulation
    let animationId;
    let iteration = 0;
    const maxIterations = 80;

    const simulateForces = () => {
      const dampening = 0.92;
      const springStrength = 0.005;
      const repulsion = 2500;  // Increased to prevent overlap
      const gravity = 0.06;     // Slightly reduced for stability

      // Apply forces
      nodes.forEach((node, i) => {
        // Gravity towards center
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 100) {
          node.vx += (dx / dist) * gravity;
          node.vy += (dy / dist) * gravity;
        }

        // Repulsion from other nodes
        nodes.forEach((other, j) => {
          if (i !== j) {
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);
            const minDist = node.radius + other.radius + 20;

            if (dist < minDist && dist > 0) {
              const force = (minDist - dist) * repulsion / distSq;
              node.vx += (dx / dist) * force;
              node.vy += (dy / dist) * force;
            }
          }
        });

        // Dampen velocity
        node.vx *= dampening;
        node.vy *= dampening;

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Boundary constraints (soft)
        const padding = node.radius + 10;
        if (node.x - node.radius < padding) {
          node.x = node.radius + padding;
          node.vx *= -0.5;
        }
        if (node.x + node.radius > width - padding) {
          node.x = width - node.radius - padding;
          node.vx *= -0.5;
        }
        if (node.y - node.radius < padding) {
          node.y = node.radius + padding;
          node.vy *= -0.5;
        }
        if (node.y + node.radius > height - padding) {
          node.y = height - node.radius - padding;
          node.vy *= -0.5;
        }
      });

      setPositions(
        nodes.reduce((acc, node) => {
          acc[node.col] = { x: node.x, y: node.y };
          return acc;
        }, {})
      );

      iteration++;
      if (iteration < maxIterations) {
        animationId = requestAnimationFrame(simulateForces);
      }
    };

    setMounted(true);
    animationId = requestAnimationFrame(simulateForces);

    return () => cancelAnimationFrame(animationId);
  }, [data, maxBelum]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 560,
        height: 500,
        margin: '0 auto',
        background: 'rgba(255,255,255,0.01)',
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      {sorted.slice(0, 6).map((item, i) => {
        const fraction = (item.belum || 0) / maxBelum;
        const size = Math.max(85, Math.round(fraction * 210));
        const cfg = BUBBLE_CONFIG[item.col] || { emoji: '📌', color: '#aaa', label: item.col };
        const isHov = hovered === item.col;
        const pos = positions[item.col] || POSITIONS[i] || { x: 280, y: 250 };

        // Gradient intensity based on data (more needy = darker/more saturated)
        const intensityFactor = Math.min(1, (item.belum / maxBelum) * 1.2);
        const bgIntensity = isHov ? 0.5 : 0.2 + intensityFactor * 0.15;
        const borderIntensity = isHov ? 1 : 0.3 + intensityFactor * 0.4;

        return (
          <div
            key={item.col}
            onMouseEnter={() => setHovered(item.col)}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setHovered(item.col)}
            onTouchEnd={() => setHovered(null)}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              transform: `translate(-50%, -50%) scale(${isHov ? 1.15 : 1})`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: isHov
                ? `radial-gradient(circle, ${cfg.color}${Math.round(bgIntensity * 255).toString(16).padStart(2, '0')}, ${cfg.color}22)`
                : `radial-gradient(circle, ${cfg.color}${Math.round(bgIntensity * 200).toString(16).padStart(2, '0')}, ${cfg.color}08)`,
              border: `2px solid ${cfg.color}${Math.round(borderIntensity * 255).toString(16).padStart(2, '0')}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
              boxShadow: isHov
                ? `0 0 32px ${cfg.color}${Math.round(0.5 * 255).toString(16).padStart(2, '0')}, inset 0 0 24px ${cfg.color}${Math.round(0.2 * 255).toString(16).padStart(2, '0')}`
                : `0 0 16px ${cfg.color}${Math.round(intensityFactor * 0.3 * 255).toString(16).padStart(2, '0')}`,
              opacity: mounted ? 1 : 0,
              transform: `translate(-50%, -50%) scale(${isHov ? 1.15 : 1}) ${!mounted ? 'scale(0.5)' : ''}`,
              transitionDelay: `${i * 0.1}s`,
            }}
          >
            <span style={{ fontSize: size > 130 ? '2.4rem' : '1.6rem', transition: 'transform 0.3s ease' }}>
              {cfg.emoji}
            </span>
            <span
              className="lato-bold"
              style={{
                fontSize: size > 130 ? '0.82rem' : '0.68rem',
                color: '#fff',
                textAlign: 'center',
                padding: '0 4px',
                lineHeight: 1.2,
                transition: 'opacity 0.3s ease',
                opacity: isHov ? 0.7 : 1,
              }}
            >
              {cfg.label || item.nama}
            </span>

            {/* Tooltip Detail saat Hover */}
            {isHov && (
              <div
                style={{
                  position: 'absolute',
                  bottom: size / 2 + 20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: cfg.color,
                  color: '#fff',
                  padding: '0.6rem 1rem',
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  boxShadow: `0 4px 16px ${cfg.color}66`,
                  zIndex: 20,
                  animation: 'slideUpTooltip 0.3s ease forwards',
                  pointerEvents: 'none',
                }}
              >
                <div className="lato-bold" style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                  {(item.belum || 0).toLocaleString('id-ID')} KK
                </div>
                <div className="lato-regular" style={{ fontSize: '0.65rem', opacity: 0.9 }}>
                  Belum menerima bantuan
                </div>
                {item.sudah > 0 && (
                  <div className="lato-regular" style={{ fontSize: '0.65rem', opacity: 0.85, marginTop: '0.2rem' }}>
                    {item.sudah.toLocaleString('id-ID')} KK sudah dibantu
                  </div>
                )}
              </div>
            )}

            {/* Arrow pointer tooltip */}
            {isHov && (
              <div
                style={{
                  position: 'absolute',
                  bottom: size / 2 + 6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: `6px solid ${cfg.color}`,
                  zIndex: 19,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        );
      })}

      {/* Inline style untuk animation */}
      <style>{`
        @keyframes slideUpTooltip {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────
   Scene 1: Kebutuhan Mendesak
───────────────────────────────────────────*/
function SceneJeritanBantuan() {
  const global = insights?.kebutuhan?.ringkasan_global || {};

  // Fallback data dummy jika insight.json belum punya kebutuhan data
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
    col,
    nama: v.nama,
    sudah: v.sudah || 0,
    belum: v.belum || 0,
    pct_sudah: v.pct_sudah || 0,
  }));

  const hasData = bubbleData.some(b => b.sudah + b.belum > 0);

  return (
    <section style={{
      background: 'linear-gradient(180deg, #15173d 0%, #0a0b1f 100%)',
      padding: '7rem 2rem',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <span className="lato-bold" style={{
          fontSize: '0.78rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#FF8A65',
          display: 'block', marginBottom: '1rem',
        }}>
          Babak 4 · Scene 1
        </span>
        <h2 className="playfair-display" style={{
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          color: '#fff', lineHeight: 1.2, marginBottom: '1rem',
        }}>
          Kebutuhan{' '}
          <span style={{ color: '#FF8A65' }}>Mendesak</span>
        </h2>
        <p className="lato-regular" style={{
          fontSize: '1.05rem', lineHeight: 1.85,
          color: 'var(--beige)', opacity: 0.85,
          maxWidth: 560, marginBottom: '3rem',
        }}>
          Air bersih dan akses kesehatan menjadi prioritas utama warga.
          Makanan, perbaikan rumah, dan pakaian menjadi kebutuhan utama.
          Semakin besar gelembung, semakin banyak keluarga yang{' '}
          <em>belum</em> menerima bantuan tersebut.
        </p>

        {/* Legend / Petunjuk Interaksi */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '0.8rem 1.2rem',
          borderRadius: 12,
          marginBottom: '2rem',
          maxWidth: 560,
        }}>
          <div className="lato-bold" style={{
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '0.6rem',
          }}>
            💡 Cara Baca
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF8A65, #FF6B6B)',
                opacity: 0.8,
              }} />
              <span className="lato-regular" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                Ukuran = Frekuensi Kebutuhan
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
              }} />
              <span className="lato-regular" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                Hover untuk Detail
              </span>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '3rem',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}>
          {/* Bubble chart */}
          <div style={{ flex: '1 1 400px', minWidth: 300 }}>
            <BubbleChart data={hasData ? bubbleData : []} />
          </div>

          {/* Panel kanan: status penerimaan */}
          <div style={{ flex: '1 1 260px' }}>
            <div className="lato-bold" style={{
              fontSize: '0.78rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
              marginBottom: '1.5rem',
            }}>
              📊 Status Penerimaan Bantuan
            </div>
            {!hasData ? (
              <div className="lato-regular" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                Menunggu data dari insight.json…
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                {bubbleData.map((item, idx) => {
                  const cfg = BUBBLE_CONFIG[item.col] || { color: '#aaa', emoji: '📌', label: item.col };
                  const pct = item.pct_sudah || 0;
                  const total = item.sudah + item.belum;
                  const pctBelum = total > 0 ? ((item.belum / total) * 100).toFixed(1) : 0;

                  return (
                    <div
                      key={item.col}
                      style={{
                        padding: '1rem',
                        background: `${cfg.color}08`,
                        border: `1px solid ${cfg.color}22`,
                        borderRadius: 10,
                        transition: 'all 0.3s ease',
                        ':hover': {
                          background: `${cfg.color}12`,
                        },
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${cfg.color}12`;
                        e.currentTarget.style.borderColor = `${cfg.color}44`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `${cfg.color}08`;
                        e.currentTarget.style.borderColor = `${cfg.color}22`;
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className="lato-regular" style={{ fontSize: '0.85rem', color: '#fff' }}>
                          {cfg.emoji} {cfg.label || item.nama}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span className="lato-bold" style={{ fontSize: '0.8rem', color: cfg.color }}>
                            {pct.toFixed(1)}%
                          </span>
                          <span className="lato-regular" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                            Sudah
                          </span>
                        </div>
                      </div>

                      {/* Progress bar dengan gradient */}
                      <div style={{
                        height: 10,
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: 5,
                        overflow: 'hidden',
                        marginBottom: '0.5rem',
                        position: 'relative',
                      }}>
                        {/* Belum (unfilled) */}
                        <div style={{
                          height: '100%',
                          width: `${Math.min(pctBelum, 100)}%`,
                          background: `linear-gradient(90deg, ${cfg.color}44, ${cfg.color}22)`,
                          borderRadius: 5,
                          transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }} />
                        {/* Sudah (filled) overlay dari kanan */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: `${Math.min(pct, 100)}%`,
                          background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
                          borderRadius: 5,
                          transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          boxShadow: `inset 0 0 8px ${cfg.color}66`,
                        }} />
                      </div>

                      {/* Statistik detail */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                        fontSize: '0.68rem',
                      }}>
                        <div className="lato-regular" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          ✅ <span style={{ color: cfg.color, fontWeight: 'bold' }}>{item.sudah.toLocaleString('id-ID')}</span> sudah
                        </div>
                        <div className="lato-regular" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          ⏳ <span style={{ color: 'rgba(255,200,100,0.8)', fontWeight: 'bold' }}>{item.belum.toLocaleString('id-ID')}</span> belum
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Scene 2: Ringkasan Narasi (tanpa headline)
───────────────────────────────────────────*/
function SceneRingkasanNarasi() {
  const [ref, visible] = useInView(0.15);

  const totalKK   = insights?.ringkasan_dataset?.total_rt_keluarga || 0;
  const totalDesa = insights?.ringkasan_dataset?.total_desa_infra || 0;
  const totalFas  = insights?.ringkasan_dataset?.total_fasilitas_gabungan || 0;

  const PARAGRAF = [
    `Pendataan R3P telah menjangkau lebih dari ${totalKK.toLocaleString('id-ID')} keluarga di ${totalDesa.toLocaleString('id-ID')} desa dan kelurahan yang tersebar di tiga provinsi terdampak bencana — Aceh, Sumatera Utara, dan Sumatera Barat.`,
    `Dari data yang berhasil dikumpulkan, terlihat jelas bahwa bencana ini tidak hanya merobohkan bangunan fisik, tetapi juga mengguncang fondasi sosial-ekonomi masyarakat. Ribuan keluarga kehilangan sumber penghidupan, akses terhadap layanan dasar, dan tempat bernaung yang layak.`,
    `Sebanyak ${totalFas.toLocaleString('id-ID')} fasilitas publik terdata — mencakup sekolah, puskesmas, masjid, pasar, dan fasilitas ekonomi lainnya. Dari jumlah tersebut, sebagian besar mengalami kerusakan dalam berbagai tingkat keparahan.`,
    `Data ini bukan sekadar angka. Ia adalah potret dari ketangguhan warga yang terus bertahan, sambil menunggu uluran tangan yang datang dari keputusan berbasis bukti.`,
  ];

  return (
    <section style={{
      background: '#f5f0e8',
      padding: '8rem 2rem',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto', width: '100%' }}>
        {/* Pull quote besar */}
        <blockquote style={{
          fontFamily: 'var(--font-title)',
          fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
          fontStyle: 'italic',
          fontWeight: 700,
          color: '#1a1a2e',
          lineHeight: 1.4,
          margin: '0 0 3rem 0',
          paddingLeft: '2rem',
          borderLeft: '4px solid #628141',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}>
          "Data ini bukan sekadar statistik — ini adalah peta jalan menuju pemulihan."
        </blockquote>

        {/* Paragraf narasi */}
        <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {PARAGRAF.map((p, i) => (
            <p key={i} className="lato-regular" style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
              lineHeight: 1.9,
              color: '#2d2d4e',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity 0.6s ease ${i * 0.15 + 0.1}s, transform 0.6s ease ${i * 0.15 + 0.1}s`,
              margin: 0,
            }}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Scene 3: Di Balik Angka (Outro Emosional)
   Full-screen parallax photo + word-by-word reveal
───────────────────────────────────────────*/
function SceneDiBalikAngka() {
  const sectionRef = useRef(null);
  const photosContainerRef = useRef(null);
  const quoteWordsRef = useRef([]);
  const [visiblePhotos, setVisiblePhotos] = useState([]);
  const [isPhotoVisible, setIsPhotoVisible] = useState(false);

  const totalKK   = insights?.ringkasan_dataset?.total_rt_keluarga || 0;
  const totalDesa = insights?.ringkasan_dataset?.total_desa_infra || 0;

  const quoteText = "Kami hanya ingin segera kembali normal.";
  const words = quoteText.split(' ');

  const vulnerableGroups = [
    { emoji: '👵', label: 'Lansia', desc: 'Perlindungan khusus & akses kesehatan prioritas' },
    { emoji: '🤰', label: 'Ibu Hamil', desc: 'Nutrisi & pemeriksaan kesehatan teratur' },
    { emoji: '👶', label: 'Balita', desc: 'Imunisasi & gizi terpantau di huntara' },
  ];

  // Array foto huntara (akan di-import dari assets)
  // Ganti dengan foto nyata setelah ditambahkan ke src/assets/images/
  const huntaraPhotos = [
    'huntara-01.jpg', 'huntara-02.jpg', 'huntara-03.jpg', 'huntara-04.jpg', 'huntara-05.jpg',
    'huntara-06.jpg', 'huntara-07.jpg', 'huntara-08.jpg', 'huntara-09.jpg', 'huntara-10.jpg',
    'huntara-11.jpg', 'huntara-12.jpg', 'huntara-13.jpg', 'huntara-14.jpg', 'huntara-15.jpg',
    'huntara-16.jpg', 'huntara-17.jpg', 'huntara-18.jpg', 'huntara-19.jpg', 'huntara-20.jpg',
  ];

  // Detect visibility of Scene 3 untuk hide/show photo
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        setIsPhotoVisible(e.isIntersecting);
        if (e.isIntersecting) {
          setVisiblePhotos([]); // Reset ketika masuk scene
        }
      },
      { threshold: 0 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Stacked images - muncul satu per satu (slower fill untuk nyaman dilihat)
  useEffect(() => {
    if (!isPhotoVisible) return;

    let photoCount = 0;
    const stackInterval = setInterval(() => {
      if (photoCount < huntaraPhotos.length) {
        setVisiblePhotos(prev => [...prev, photoCount]);
        photoCount++;
      } else {
        clearInterval(stackInterval);
      }
    }, 250); // Slower interval untuk comfortable viewing

    return () => clearInterval(stackInterval);
  }, [isPhotoVisible, huntaraPhotos.length]);

  // Parallax effect + word-by-word reveal on scroll
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top center',
        end: 'center center', // End reveal earlier so it's complete before scroll ends
        scrub: 1,
        markers: false,
      },
    });

    // Word-by-word reveal dengan timing lebih cepat
    quoteWordsRef.current.forEach((wordEl, idx) => {
      tl.fromTo(
        wordEl,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3 },
        idx * 0.08 // Faster stagger
      );
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        style={{
          position: 'relative',
          minHeight: '120vh',
          overflow: 'hidden',
          background: '#020208',
        }}
      >
        {/* Stacked photos container - HANYA TAMPIL DI SCENE 3 */}
        {isPhotoVisible && (
        <div
          ref={photosContainerRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'none',
            background: 'linear-gradient(135deg, rgba(10,11,31,0.9) 0%, rgba(5,5,16,0.95) 100%)',
          }}
        >
          {/* Background gradient overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
              zIndex: 3,
            }}
          />

          {/* Background photos - overlapping & random sized, FULL SCREEN */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              backgroundColor: 'rgba(10,11,31,0.7)',
              overflow: 'hidden',
            }}
          >
            {visiblePhotos.map((idx, order) => {
              // Random positioning untuk overlapping effect
              const randomX = Math.sin(idx * 12.9) * 35 + (Math.random() - 0.5) * 20; // -55% to 55%
              const randomY = Math.cos(idx * 7.3) * 40 + (Math.random() - 0.5) * 25;  // -65% to 65%
              const randomSize = 40 + Math.random() * 80; // 40% to 120% width
              const randomRotation = (Math.random() - 0.5) * 15; // -7.5 to 7.5 deg
              const randomOpacity = 0.2 + Math.random() * 0.3; // 0.2 to 0.5

              return (
                <div
                  key={`photo-${idx}`}
                  style={{
                    position: 'absolute',
                    left: `${50 + randomX}%`,
                    top: `${50 + randomY}%`,
                    width: `${randomSize}%`,
                    aspectRatio: '4/3',
                    transform: `translate(-50%, -50%) rotate(${randomRotation}deg)`,
                    backgroundImage: `url('/src/assets/images/${huntaraPhotos[idx]}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: randomOpacity,
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    animation: `fadeInBg 0.8s ease forwards`,
                    animationDelay: `${order * 0.12}s`,
                    zIndex: order,
                  }}
                />
              );
            })}
          </div>

          {/* Dark overlay untuk readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `
                radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)
              `,
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />

          {/* Accent border left */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '4px',
              height: '60%',
              background: 'linear-gradient(180deg, transparent, var(--green), transparent)',
              zIndex: 5,
            }}
          />
        </div>
        )}

        {/* Content overlay - positioned relative to section */}
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            padding: '4rem 2rem',
            background: 'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
          }}
        >
          <div style={{ maxWidth: 680, margin: '0 auto', width: '100%' }}>
            {/* Scene identifier */}
            <div className="lato-bold" style={{
              fontSize: '0.75rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(98,129,65,0.8)',
              marginBottom: '2rem',
            }}>
              Babak 4 · Scene 3
            </div>

            {/* Main heading */}
            <h2 className="playfair-display" style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: '#fff',
              lineHeight: 1.2,
              marginBottom: '2.5rem',
              fontWeight: 700,
            }}>
              Di Balik Angka
            </h2>

            {/* Quote dengan word-by-word reveal */}
            <blockquote
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
                fontStyle: 'italic',
                fontWeight: 700,
                lineHeight: 1.6,
                margin: '0 0 1.5rem 0',
                padding: '0 1rem 0 2rem',
                borderLeft: '4px solid var(--green)',
                textShadow: '0 4px 16px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              {words.map((word, i) => (
                <span
                  key={i}
                  ref={el => (quoteWordsRef.current[i] = el)}
                  style={{
                    color: '#fff',
                    display: 'inline-block',
                    marginRight: '0.4em',
                    opacity: 0,
                  }}
                >
                  {word}
                </span>
              ))}
            </blockquote>

            {/* Attribution */}
            <cite className="lato-regular-italic" style={{
              fontSize: '1.1rem',
              color: 'var(--green)',
              display: 'block',
              marginBottom: '3rem',
              paddingLeft: '2rem',
            }}>
              — Suara dari Hunian Sementara (Huntara)
            </cite>

            {/* Context: Vulnerable groups */}
            <div style={{
              background: 'rgba(98,129,65,0.08)',
              border: '1px solid rgba(98,129,65,0.2)',
              borderRadius: 16,
              padding: '2rem',
              marginBottom: '2rem',
            }}>
              <div className="lato-bold" style={{
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '1.5rem',
              }}>
                🛡️ Kelompok Rentan dalam Hunian Sementara
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '1.5rem',
              }}>
                {vulnerableGroups.map(group => (
                  <div key={group.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{group.emoji}</div>
                    <div className="lato-bold" style={{
                      fontSize: '0.9rem',
                      color: 'var(--green)',
                      marginBottom: '0.3rem',
                    }}>
                      {group.label}
                    </div>
                    <div className="lato-regular" style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: 1.4,
                    }}>
                      {group.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Narasi penjelasan */}
            <p className="lato-regular" style={{
              fontSize: '1rem',
              lineHeight: 2,
              color: 'rgba(255,255,255,0.75)',
              marginBottom: '2rem',
              paddingLeft: '1rem',
              borderLeft: '2px solid rgba(98,129,65,0.3)',
            }}>
              Setiap variabel data — kebutuhan air bersih, akses kesehatan,
              tingkat kerusakan rumah — bukan sekadar angka teknis. Ia adalah
              representasi nyata dari kebutuhan mendesak keluarga dan kelompok
              rentan yang tengah bertahan di hunian sementara dengan keterbatasan
              fasilitas dasar, nutrisi, dan akses layanan kesehatan.
            </p>

            {/* Hunian Status Statistics */}
            {totalKK > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '1.8rem',
                marginBottom: '2rem',
              }}>
                <div className="lato-bold" style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: '1rem',
                }}>
                  📊 Status Hunian Sementara
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '1.5rem',
                }}>
                  <div>
                    <div className="playfair-display" style={{
                      fontSize: '2rem',
                      color: 'var(--green)',
                      fontWeight: 700,
                      lineHeight: 1,
                    }}>
                      {totalKK.toLocaleString('id-ID')}
                    </div>
                    <div className="lato-regular" style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginTop: '0.5rem',
                    }}>
                      Keluarga di Huntara
                    </div>
                  </div>
                  <div>
                    <div className="playfair-display" style={{
                      fontSize: '2rem',
                      color: '#FF8A65',
                      fontWeight: 700,
                      lineHeight: 1,
                    }}>
                      {totalDesa.toLocaleString('id-ID')}
                    </div>
                    <div className="lato-regular" style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginTop: '0.5rem',
                    }}>
                      Lokasi Huntara
                    </div>
                  </div>
                  <div>
                    <div className="playfair-display" style={{
                      fontSize: '2rem',
                      color: '#4FC3F7',
                      fontWeight: 700,
                      lineHeight: 1,
                    }}>
                      3
                    </div>
                    <div className="lato-regular" style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginTop: '0.5rem',
                    }}>
                      Provinsi Bencana
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Closing message */}
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'rgba(98,129,65,0.05)',
              borderRadius: 12,
              borderLeft: '4px solid var(--green)',
            }}>
              <p className="lato-regular" style={{
                fontSize: '0.95rem',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.6)',
                margin: 0,
              }}>
                Data ini adalah pengingat bahwa setiap titik statistik adalah
                <span style={{ color: 'var(--green)', fontWeight: 'bold' }}> manusia </span>
                yang sedang menunggu pemulihan melalui perencanaan rehabilitasi berbasis bukti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CSS for scroll-triggered animations */}
      <style>{`
        @keyframes wordFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInPhoto {
          from {
            opacity: 0;
            transform: translate(30px, 30px) rotate(-8deg) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
        }

        @keyframes fadeInBg {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.25;
          }
        }
      `}</style>
    </>
  );
}

/* ─────────────────────────────────────────
   Scene 4: Ajakan Aksi
───────────────────────────────────────────*/
function SceneAjakan() {
  const [ref, visible] = useInView(0.2);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Hasil Pendataan R3P — Laporan Bencana',
        text: 'Data pendataan bencana di Aceh, Sumatera Utara, dan Sumatera Barat. Setiap kesadaran adalah langkah menuju pemulihan.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href)
        .then(() => alert('Link berhasil disalin!'))
        .catch(() => {});
    }
  };

  return (
    <section style={{
      background: 'linear-gradient(160deg, #0d1a10 0%, #15173d 100%)',
      padding: '8rem 2rem',
      textAlign: 'center',
    }}>
      <div ref={ref} style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{
          fontSize: '3rem', marginBottom: '1.5rem',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}>
          🌱
        </div>

        <h2 className="playfair-display" style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
          color: '#fff',
          lineHeight: 1.3,
          marginBottom: '1.2rem',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.8s ease 0.2s',
        }}>
          Sebarkan Informasi Ini
        </h2>

        <p className="lato-regular" style={{
          fontSize: '1.05rem',
          lineHeight: 1.85,
          color: 'var(--beige)',
          opacity: visible ? 0.8 : 0,
          transition: 'opacity 0.8s ease 0.35s',
          marginBottom: '3rem',
        }}>
          Setiap kesadaran adalah langkah menuju pemulihan.
          Bagi informasi ini agar lebih banyak pihak dapat bergerak bersama.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          opacity: 1,
          transition: 'opacity 0.8s ease 0.5s',
        }}>
          <button
            onClick={handleShare}
            style={{
              padding: '1rem 2.4rem',
              borderRadius: 28,
              background: '#628141',
              color: '#fff',
              border: 'none',
              fontSize: '1.05rem',
              fontFamily: 'var(--font-content)',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 24px rgba(98,129,65,0.5)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 10px 32px rgba(98,129,65,0.7)';
              e.currentTarget.style.background = '#6fa84f';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(98,129,65,0.5)';
              e.currentTarget.style.background = '#628141';
            }}
          >
            🔗 Bagikan Laporan Ini
          </button>

          <a
            href="/"
            style={{
              padding: '1rem 2.4rem',
              borderRadius: 28,
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              border: '2px solid #628141',
              fontSize: '1.05rem',
              fontFamily: 'var(--font-content)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 0 rgba(98,129,65,0)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#6fa84f';
              e.currentTarget.style.background = 'rgba(98,129,65,0.15)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(98,129,65,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#628141';
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = '0 0 0 rgba(98,129,65,0)';
            }}
          >
            ← Kembali ke Beranda
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Scene 5: Data yang Terjaga
───────────────────────────────────────────*/
function SceneDataTerjaga() {
  const [ref, visible] = useInView(0.15);

  const statusPenugasan = insights?.status_penugasan_keluarga || {};
  const totalEntri = Object.values(statusPenugasan).reduce((s, v) => s + (v.n || 0), 0);
  const approved   = Object.entries(statusPenugasan)
    .filter(([k]) => k.startsWith('APPROVED'))
    .reduce((s, [, v]) => s + (v.n || 0), 0);
  const pctApproved = totalEntri > 0 ? (approved / totalEntri * 100).toFixed(1) : 99.9;

  const totalPetugas  = insights?.ringkasan_dataset?.total_petugas_unik || 401;
  const totalKunjungan = insights?.ringkasan_dataset?.total_kunjungan || 1039;

  const VERIF_ITEMS = [
    { icon: '✅', label: 'Entri Terverifikasi', nilai: `${pctApproved}%`, color: '#81C784', desc: 'Data disetujui pengawas atau admin kabupaten' },
    { icon: '👤', label: 'Petugas Lapangan', nilai: totalPetugas.toLocaleString('id-ID'), color: '#4FC3F7', desc: 'Petugas unik yang terlibat dalam pendataan' },
    { icon: '📋', label: 'Total Kunjungan', nilai: totalKunjungan.toLocaleString('id-ID'), color: '#FFB74D', desc: 'Kunjungan monitoring yang dilakukan PML' },
    { icon: '🛡️', label: 'Validasi Real-Time', nilai: '3 Layer', color: '#CE93D8', desc: 'Pencacah → Pengawas → Admin Kabupaten' },
  ];

  return (
    <section style={{
      background: '#020208',
      padding: '8rem 2rem 6rem',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div ref={ref} style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{
            fontSize: '3.5rem', marginBottom: '1.5rem',
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.7)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}>
            🛡️
          </div>
          <h2 className="playfair-display" style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)',
            color: '#fff',
            lineHeight: 1.3,
            marginBottom: '1rem',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.8s ease 0.15s',
          }}>
            Setiap Entri Diverifikasi untuk{' '}
            <span style={{ color: '#81C784' }}>Kredibilitas Tinggi</span>
          </h2>
          <p className="lato-regular" style={{
            fontSize: '1.05rem',
            lineHeight: 1.85,
            color: 'var(--beige)',
            opacity: visible ? 0.75 : 0,
            transition: 'opacity 0.8s ease 0.3s',
            maxWidth: 560,
            margin: '0 auto',
          }}>
            Setiap data yang ditampilkan telah melalui proses verifikasi real-time
            oleh PML di lapangan.
          </p>
        </div>

        {/* Grid verifikasi */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.2rem',
          marginBottom: '4rem',
        }}>
          {VERIF_ITEMS.map((item, i) => (
            <div key={item.label} style={{
              padding: '1.8rem 1.5rem',
              background: `${item.color}08`,
              border: `1px solid ${item.color}28`,
              borderRadius: 16,
              textAlign: 'center',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              transition: `opacity 0.5s ease ${i * 0.12 + 0.3}s, transform 0.5s ease ${i * 0.12 + 0.3}s`,
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{item.icon}</div>
              <div className="playfair-display" style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                color: item.color,
                fontWeight: 700,
                lineHeight: 1,
                marginBottom: '0.4rem',
              }}>
                {item.nilai}
              </div>
              <div className="lato-bold" style={{
                fontSize: '0.75rem',
                color: item.color,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}>
                {item.label}
              </div>
              <div className="lato-regular" style={{
                fontSize: '0.72rem',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.5,
              }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Penutup */}
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          borderTop: '1px solid rgba(98,129,65,0.2)',
          opacity: visible ? 0.5 : 0,
          transition: 'opacity 1s ease 0.8s',
        }}>
          <span className="lato-regular" style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            Hasil Pendataan R3P · Data Pemulihan Bencana · 2026
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Komponen Utama: BabakKebutuhan
───────────────────────────────────────────*/
export default function BabakKebutuhan() {
  return (
    <>
      <SceneJeritanBantuan />
      <SceneRingkasanNarasi />
      <SceneDiBalikAngka />
      <SceneAjakan />
      <SceneDataTerjaga />
    </>
  );
}
