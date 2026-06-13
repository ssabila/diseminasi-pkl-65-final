/**
 * keluarga.jsx — Babak 3: Keluarga
 *
 * Scene 1: Sudut Desa — "Detail Hingga Sudut Desa: Kehilangan Tempat Bernaung"
 *   Kartu kabupaten dengan % kerusakan bangunan (fokus rumah, bukan fasilitas)
 *
 * Scene 2: Potret Hunian Narasi — "Rumah yang Masih Berdiri, Kehidupan yang Belum Pulih"
 *   Split bar status bangunan + kartu kondisi (air, listrik, sanitasi, KRT perempuan)
 *
 * Scene 3: Potret Hunian Visual — "Bertahan di Titik Nadir Keterbatasan"
 *   Status hunian sementara (Huntara/Fasum/Pengungsian) dari rumah_tangga.status_hunian
 *
 * Scene 4: Individu & Keluarga — "Kondisi Individu & Keluarga"
 *   Donut kelompok umur, donut bantuan, keluhan kesehatan, kelompok rentan
 *
 * Transisi 3→4: "Ada Kehilangan yang Tak Bisa Dibangun Kembali"
 *   Full-screen gelap, angka besar, narasi singkat emosional
 *
 * Data: insight.json → keluarga, individu, kebutuhan, rumah_tangga
 */

import React, { useEffect, useRef, useState } from 'react';
import insights from '../insight.json';

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
        <div className="lato-bold" style={{
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
            <span className="lato-regular" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', flex: 1 }}>
              {p.label}
            </span>
            <span className="lato-bold" style={{ fontSize: '0.78rem', color: p.color }}>
              {p.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Split Bar — status bangunan
───────────────────────────────────────────*/
function SplitBar({ label, pct, color, show }) {
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span className="lato-regular" style={{ fontSize: '0.88rem', color: 'var(--beige)' }}>{label}</span>
        <span className="lato-bold" style={{ fontSize: '0.88rem', color }}>{pct?.toFixed(1)}%</span>
      </div>
      <div style={{ height: 10, background: 'rgba(255,255,255,0.07)', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: show ? `${Math.min(pct, 100)}%` : '0%',
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 5,
          transition: 'width 1s ease',
        }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Scene 1: Kehilangan Tempat Bernaung
───────────────────────────────────────────*/
function SceneSudutDesa() {
  const [ref, visible] = useInView(0.1);

  const perKabAll = Object.values(insights?.keluarga?.per_kabupaten || {}).flat();
  const topKab = [...perKabAll]
    .sort((a, b) => (b.pct_bangunan_rusak || 0) - (a.pct_bangunan_rusak || 0))
    .slice(0, 6);

  return (
    <section style={{
      background: 'linear-gradient(160deg, #15173d 0%, #0d1a10 100%)',
      padding: '7rem 2rem',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <span className="lato-bold" style={{
          fontSize: '0.78rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--green)',
          display: 'block', marginBottom: '1rem',
        }}>
          Babak 3 · Scene 1
        </span>
        <h2 className="playfair-display" style={{
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          color: '#fff', lineHeight: 1.2, marginBottom: '1rem',
        }}>
          Detail Hingga Sudut Desa:{' '}
          <span style={{ color: 'var(--green)' }}>Kehilangan Tempat Bernaung</span>
        </h2>
        <p className="lato-regular" style={{
          fontSize: '1.05rem', lineHeight: 1.88,
          color: 'var(--beige)', opacity: 0.85,
          maxWidth: 640, marginBottom: '3.5rem',
        }}>
          Dari level provinsi, mari melihat lebih dekat. Setiap persentase ini adalah
          cerminan atap yang runtuh dan dinding yang rubuh di ratusan desa.
        </p>

        <div ref={ref} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '1.2rem',
        }}>
          {topKab.length === 0 ? (
            <div className="lato-regular" style={{
              padding: '1.5rem', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem',
              gridColumn: '1/-1',
            }}>
              💡 Data kerusakan bangunan akan muncul setelah insight.json dihasilkan.
            </div>
          ) : (
            topKab.map((kab, i) => {
              const pct = kab.pct_bangunan_rusak || 0;
              const color = pct > 60 ? '#e74c3c' : pct > 30 ? '#FFB74D' : '#81C784';
              return (
                <div key={kab.kabupaten} style={{
                  padding: '1.5rem',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: 14,
                  border: `1px solid ${color}2a`,
                  borderTop: `3px solid ${color}`,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
                }}>
                  <div className="lato-bold" style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.25rem' }}>
                    {kab.kabupaten}
                  </div>
                  <div className="lato-regular" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
                    {kab.provinsi}
                  </div>
                  <div style={{ position: 'relative', height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: '0.5rem' }}>
                    <div style={{
                      height: '100%',
                      width: visible ? `${Math.min(pct, 100)}%` : '0%',
                      background: `linear-gradient(90deg, ${color}88, ${color})`,
                      borderRadius: 4,
                      transition: `width 0.9s ease ${i * 0.1}s`,
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="lato-regular" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                      {(kab.bangunan_rusak || 0).toLocaleString('id-ID')} KK rusak
                    </span>
                    <span className="lato-bold" style={{ fontSize: '0.92rem', color }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Scene 2: Potret Hunian Narasi
───────────────────────────────────────────*/
function ScenePotretHunianNarasi() {
  const [ref, visible] = useInView(0.15);

  const kondisiBangunan = insights?.rumah_tangga?.kondisi_bangunan || {};
  const statusHunian    = insights?.rumah_tangga?.status_hunian || {};

  // Hitung agregat kondisi bangunan
  const masihAda = (kondisiBangunan['1. Bangunan ada dan tidak terdampak']?.n || 0)
                 + (kondisiBangunan['2. Bangunan ada, terdampak, tetapi tidak perlu perbaikan']?.n || 0)
                 + (kondisiBangunan['3. Bangunan ada, terdampak, dan perlu perbaikan']?.n || 0);
  const rusak = kondisiBangunan['3. Bangunan ada, terdampak, dan perlu perbaikan']?.n || 0;
  const hilang = (kondisiBangunan['4. Bangunan rusak dan tidak dapat diperbaiki<b> --> Lanjut ke Rincian 10</b>']?.n || 0)
               + (kondisiBangunan['5. Bangunan hilang<b> --> Lanjut ke Rincian 10</b>']?.n || 0);

  const totalBangunan = masihAda + rusak + hilang || 1;

  const pctMasih = (masihAda / totalBangunan * 100);
  const pctRusak = (rusak / totalBangunan * 100);
  const pctHilang = (hilang / totalBangunan * 100);

  // Perlu perbaikan
  const perluPerbaikan = kondisiBangunan['3. Bangunan ada, terdampak, dan perlu perbaikan'];

  return (
    <section style={{
      background: 'linear-gradient(180deg, #1a0f08 0%, #15173d 100%)',
      padding: '7rem 2rem',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <span className="lato-bold" style={{
          fontSize: '0.78rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#FFB74D',
          display: 'block', marginBottom: '1rem',
        }}>
          Babak 3 · Scene 2
        </span>
        <h2 className="playfair-display" style={{
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          color: '#fff', lineHeight: 1.2, marginBottom: '1rem',
        }}>
          Rumah yang Masih Berdiri,{' '}
          <span style={{ color: '#FFB74D' }}>Kehidupan yang Belum Pulih</span>
        </h2>
        <p className="lato-regular" style={{
          fontSize: '1.05rem', lineHeight: 1.88,
          color: 'var(--beige)', opacity: 0.85,
          maxWidth: 640, marginBottom: '3.5rem',
        }}>
          Ribuan keluarga masih tinggal di rumah yang mengalami kerusakan
          dan membutuhkan perbaikan segera.
        </p>

        <div ref={ref} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {/* Card: Status Bangunan — Split Bar */}
          <div style={{
            background: 'rgba(0,0,0,0.35)', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)', padding: '2rem',
            gridColumn: 'span 2',
          }}>
            <div className="lato-bold" style={{
              fontSize: '0.8rem', color: '#FFB74D',
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.8rem',
            }}>
              Status Bangunan Pasca Bencana
            </div>

            {/* Stacked flex bar */}
            <div style={{
              display: 'flex',
              height: 20,
              borderRadius: 10,
              overflow: 'hidden',
              marginBottom: '1rem',
            }}>
              {[
                { pct: pctMasih, color: '#81C784', label: 'Tidak Terdampak' },
                { pct: pctRusak, color: '#FFB74D', label: 'Perlu Perbaikan' },
                { pct: pctHilang, color: '#e74c3c', label: 'Rusak/Hilang' },
              ].map(bar => (
                <div key={bar.label} style={{
                  flex: visible ? `0 0 ${bar.pct}%` : '0 0 0%',
                  background: bar.color,
                  transition: 'flex-basis 1.2s cubic-bezier(0.4,0,0.2,1)',
                }} />
              ))}
            </div>

            {/* Labels */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[
                { pct: pctMasih, color: '#81C784', label: 'Tidak Terdampak' },
                { pct: pctRusak, color: '#FFB74D', label: 'Perlu Perbaikan' },
                { pct: pctHilang, color: '#e74c3c', label: 'Rusak/Hilang' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
                  <span className="lato-regular" style={{ fontSize: '0.82rem', color: 'var(--beige)' }}>
                    {item.label}
                  </span>
                  <span className="lato-bold" style={{ fontSize: '0.82rem', color: item.color }}>
                    {item.pct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Kondisi Air, Listrik, Sanitasi */}
          <div style={{
            background: 'rgba(0,0,0,0.35)', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)', padding: '2rem',
          }}>
            <div className="lato-bold" style={{
              fontSize: '0.8rem', color: '#4FC3F7',
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem',
            }}>
              Akses Layanan Dasar
            </div>
            {[
              { icon: '💧', label: 'Akses Air Bersih', desc: 'Terganggu akibat kerusakan jaringan distribusi', color: '#4FC3F7' },
              { icon: '⚡', label: 'Pasokan Listrik', desc: 'Jaringan rusak di wilayah terdampak', color: '#FFD54F' },
              { icon: '🚽', label: 'Fasilitas Sanitasi', desc: 'Toilet/WC tidak dapat digunakan', color: '#81C784' },
            ].map((item, i) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'flex-start', gap: '1rem',
                padding: '0.8rem 0',
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                opacity: visible ? 1 : 0,
                transition: `opacity 0.5s ease ${i * 0.15 + 0.3}s`,
              }}>
                <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div className="lato-bold" style={{ fontSize: '0.85rem', color: item.color, marginBottom: '0.2rem' }}>
                    {item.label}
                  </div>
                  <div className="lato-regular" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Card: Perlu Perbaikan Highlight */}
          {perluPerbaikan && (
            <div style={{
              background: 'rgba(255,183,77,0.07)', borderRadius: 16,
              border: '1px solid rgba(255,183,77,0.25)', padding: '2rem',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div className="lato-bold" style={{
                fontSize: '0.8rem', color: '#FFB74D',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem',
              }}>
                Butuh Perbaikan Segera
              </div>
              <div className="playfair-display" style={{
                fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                color: '#FFB74D',
                fontWeight: 700,
                lineHeight: 1,
                marginBottom: '0.5rem',
              }}>
                {perluPerbaikan.n?.toLocaleString('id-ID')}
              </div>
              <div className="lato-regular" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                keluarga menempati bangunan yang masih ada namun terdampak dan perlu perbaikan segera
              </div>
              <div className="lato-bold" style={{ fontSize: '1.4rem', color: '#FFB74D', marginTop: '1rem' }}>
                {perluPerbaikan.pct?.toFixed(1)}% dari total
              </div>
            </div>
          )}
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
  const totalKK = insights?.ringkasan_dataset?.total_rt_keluarga || 1;

  return (
    <section style={{
      background: 'linear-gradient(180deg, #15173d 0%, #0a0b1f 100%)',
      padding: '7rem 2rem',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <span className="lato-bold" style={{
          fontSize: '0.78rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#FF8A65',
          display: 'block', marginBottom: '1rem',
        }}>
          Babak 3 · Scene 3
        </span>
        <h2 className="playfair-display" style={{
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          color: '#fff', lineHeight: 1.2, marginBottom: '1rem',
        }}>
          Bertahan di Titik Nadir{' '}
          <span style={{ color: '#FF8A65' }}>Keterbatasan</span>
        </h2>
        <p className="lato-regular" style={{
          fontSize: '1.05rem', lineHeight: 1.88,
          color: 'var(--beige)', opacity: 0.85,
          maxWidth: 640, marginBottom: '3.5rem',
        }}>
          Kehilangan rumah berarti kehilangan martabat dasar.
          Ribuan keluarga kini hidup di hunian darurat, terputus dari
          air bersih dan sanitasi layak.
        </p>

        {/* Status hunian cards */}
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
                <div className="playfair-display" style={{
                  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                  color: status.color,
                  fontWeight: 700,
                  lineHeight: 1,
                  marginBottom: '0.3rem',
                }}>
                  {data.n?.toLocaleString('id-ID') || '—'}
                </div>
                <div className="lato-bold" style={{
                  fontSize: '0.72rem',
                  color: status.color,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}>
                  {status.label}
                </div>
                {data.pct > 0 && (
                  <div className="lato-regular" style={{
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.5)',
                  }}>
                    {data.pct.toFixed(2)}% dari total KK
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Narasi penutup */}
        <div style={{
          padding: '2rem',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.07)',
          borderLeft: '3px solid #FF8A65',
        }}>
          <p className="lato-regular" style={{
            fontSize: '1rem', lineHeight: 1.85,
            color: 'var(--beige)', opacity: 0.8, margin: 0,
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
const UMUR_COLORS = {
  'Balita (0–4 th)':  '#FF8A65',
  'Anak (5–14 th)':   '#FFD54F',
  'Remaja (15–24 th)':'#81C784',
  'Dewasa (25–59 th)':'#4FC3F7',
  'Lansia (60+ th)':  '#CE93D8',
  'Tidak Diketahui':  '#555',
};

function SceneIndividu() {
  const perKabAll = Object.values(insights?.individu?.per_kabupaten || {}).flat();
  const kebutuhanAll = Object.values(insights?.kebutuhan?.per_kabupaten || {}).flat();

  const totalInd = perKabAll.reduce((s, k) => s + (k.total_individu || 0), 0);

  // Kelompok umur
  const umurAgg = {};
  perKabAll.forEach(k => {
    Object.entries(k.kelompok_umur || {}).forEach(([label, v]) => {
      umurAgg[label] = (umurAgg[label] || 0) + (v.count || 0);
    });
  });
  const umurSegments = Object.entries(umurAgg)
    .filter(([, v]) => v > 0)
    .map(([label, value]) => ({ label, value, color: UMUR_COLORS[label] || '#aaa' }));

  // Keluhan kesehatan top 7
  const keluhanAgg = {};
  perKabAll.forEach(k => {
    Object.entries(k.keluhan_kesehatan || {}).forEach(([, v]) => {
      keluhanAgg[v.keluhan] = (keluhanAgg[v.keluhan] || 0) + (v.count || 0);
    });
  });
  const topKeluhan = Object.entries(keluhanAgg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);
  const maxKeluhan = topKeluhan[0]?.[1] || 1;

  // Kelompok rentan
  const totalBumil  = perKabAll.reduce((s, k) => s + (k.kelompok_rentan?.bumil?.count  || 0), 0);
  const totalLansia = perKabAll.reduce((s, k) => s + (k.kelompok_rentan?.lansia?.count || 0), 0);
  const totalBalita = perKabAll.reduce((s, k) => s + (k.kelompok_rentan?.balita?.count || 0), 0);

  // Bantuan
  const bantuanGlobal = {};
  kebutuhanAll.forEach(k => {
    Object.entries(k.bantuan || {}).forEach(([col, v]) => {
      if (!bantuanGlobal[col]) bantuanGlobal[col] = { nama: v.nama, sudah: 0 };
      bantuanGlobal[col].sudah += v.sudah || 0;
    });
  });
  const bantuanSegments = Object.entries(bantuanGlobal).map(([col, v], i) => ({
    label: v.nama,
    value: v.sudah,
    color: ['#81C784','#4FC3F7','#FFB74D','#e74c3c','#CE93D8','#FF8A65'][i % 6],
  }));

  return (
    <section style={{
      background: '#0d1a10',
      padding: '7rem 2rem',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <span className="lato-bold" style={{
          fontSize: '0.78rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#CE93D8',
          display: 'block', marginBottom: '1rem',
        }}>
          Babak 3 · Scene 4
        </span>
        <h2 className="playfair-display" style={{
          fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
          color: '#fff', lineHeight: 1.2, marginBottom: '1rem',
        }}>
          Kondisi Individu &{' '}
          <span style={{ color: '#CE93D8' }}>Keluarga</span>
        </h2>
        <p className="lato-regular" style={{
          fontSize: '1.05rem', lineHeight: 1.88,
          color: 'var(--beige)', opacity: 0.85,
          maxWidth: 640, marginBottom: '3rem',
        }}>
          Profil kesehatan, pekerjaan, dan bantuan yang diterima oleh keluarga terdampak.
          Setiap angka adalah wajah nyata dari mereka yang bertahan.
        </p>

        {totalInd === 0 && (
          <div className="lato-regular" style={{
            padding: '1.5rem', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem',
            marginBottom: '2rem',
          }}>
            💡 Data individu akan tersedia setelah insight.json dihasilkan.
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {/* Donut umur */}
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)', padding: '2rem',
          }}>
            <DonutChart segments={umurSegments} title="Kelompok Umur" size={160} thickness={30} />
          </div>

          {/* Donut bantuan */}
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)', padding: '2rem',
          }}>
            <DonutChart segments={bantuanSegments} title="Bantuan Diterima" size={160} thickness={30} />
          </div>

          {/* Kelompok rentan */}
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)', padding: '2rem',
          }}>
            <div className="lato-bold" style={{
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
                padding: '0.8rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 10, marginBottom: '0.6rem',
                border: `1px solid ${item.color}18`,
              }}>
                <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="lato-bold" style={{ fontSize: '0.85rem', color: '#fff' }}>{item.label}</div>
                </div>
                <div className="lato-black" style={{ fontSize: '1.2rem', color: item.color }}>
                  {item.val.toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>

          {/* Keluhan kesehatan */}
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)', padding: '2rem',
            gridColumn: 'span 2',
          }}>
            <div className="lato-bold" style={{
              fontSize: '0.78rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem',
            }}>
              Keluhan Kesehatan Terbanyak (Fisik & Mental)
            </div>
            {topKeluhan.length === 0 ? (
              <span className="lato-regular" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>Menunggu data…</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {topKeluhan.map(([label, cnt], i) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span className="lato-bold" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', width: 20, textAlign: 'right' }}>
                      {i + 1}
                    </span>
                    <span className="lato-regular" style={{ flex: '0 0 160px', fontSize: '0.85rem', color: 'var(--beige)' }}>{label}</span>
                    <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(cnt / maxKeluhan) * 100}%`,
                        background: 'linear-gradient(90deg, #e74c3c88, #e74c3c)',
                        borderRadius: 4,
                      }} />
                    </div>
                    <span className="lato-bold" style={{ fontSize: '0.8rem', color: '#e74c3c', width: 60, textAlign: 'right' }}>
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
