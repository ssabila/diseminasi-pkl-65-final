/**
 * intro.jsx — Babak 1: Intro
 *
 * Scene 1: Opening — "Saat Alam Berubah Menjadi Amarah"
 *   Hero gelap dengan judul besar, fade-in perlahan, scroll cue.
 *
 * Scene 2: Skala Dampak — "Skala Besar, Dampak Nyata"
 *   Big Number counter 3 statistik utama + ikon sektor pendataan.
 *
 * Data yang digunakan dari insight.json:
 *   ringkasan_dataset.total_rt_keluarga
 *   ringkasan_dataset.total_desa_infra
 *   cakupan_geografis_infra.kab_kota_per_provinsi
 *   fasilitas_infrastruktur.total_per_kategori
 */

import React, { useEffect, useRef, useState } from 'react';
import insights from '../insight.json';

/* ─────────────────────────────────────────
   Utility: animasi counter angka dari 0 → target
───────────────────────────────────────────*/
function useCountUp(target, duration = 2000, start = false) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!start || !target) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return current;
}

function fmt(n) {
  return n.toLocaleString('id-ID');
}

/* ─────────────────────────────────────────
   Big Number Card
───────────────────────────────────────────*/
function BigNumber({ label, value, suffix = '', started, color = 'var(--green)' }) {
  const count = useCountUp(value, 2200, started);
  const [glowing, setGlowing] = useState(false);

  useEffect(() => {
    if (started && value > 0) {
      const t = setTimeout(() => setGlowing(true), 2400);
      return () => clearTimeout(t);
    }
  }, [started, value]);

  return (
    <div style={{
      textAlign: 'center',
      padding: '2rem 2.5rem',
      border: `1px solid ${glowing ? color + '66' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: '16px',
      background: glowing ? `rgba(98,129,65,0.07)` : 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(6px)',
      flex: '1 1 200px',
      transition: 'border-color 0.6s ease, background 0.6s ease, box-shadow 0.6s ease',
      boxShadow: glowing ? `0 0 24px ${color}22` : 'none',
    }}>
      <div style={{
        fontFamily: 'var(--font-title)',
        fontSize: 'clamp(2.8rem, 5vw, 4.5rem)',
        fontWeight: 700,
        color,
        lineHeight: 1,
        letterSpacing: '-1px',
      }}>
        {fmt(count)}{suffix}
      </div>
      <div className="lato-regular" style={{
        marginTop: '0.75rem',
        fontSize: '0.95rem',
        color: 'var(--beige)',
        opacity: 0.85,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Ikon Sektor Pendataan
───────────────────────────────────────────*/
const SEKTOR = [
  {
    icon: '🏫',
    label: 'Pendidikan',
    count: null,
    color: '#4FC3F7',
    key: 'Pendidikan',
  },
  {
    icon: '🏥',
    label: 'Kesehatan',
    count: null,
    color: '#81C784',
    key: 'Kesehatan',
  },
  {
    icon: '🏪',
    label: 'Ekonomi',
    count: null,
    color: '#FFB74D',
    key: 'Ekonomi',
  },
  {
    icon: '🕌',
    label: 'Sosial / Ibadah',
    count: null,
    color: '#CE93D8',
    key: 'Sosial/Ibadah',
  },
];

function SektorIkon({ sektor, delay, show }) {
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
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.6rem',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
      flex: '1 1 120px',
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: `${sektor.color}18`,
        border: `2px solid ${sektor.color}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.8rem',
      }}>
        {sektor.icon}
      </div>
      <span className="lato-bold" style={{ fontSize: '0.82rem', color: sektor.color, textAlign: 'center' }}>
        {sektor.label}
      </span>
      {sektor.count !== null && (
        <span className="lato-regular" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
          {sektor.count.toLocaleString('id-ID')} fasilitas
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Dot provinsi (3 titik visual)
───────────────────────────────────────────*/
const PROVINSI_DOTS = [
  { name: 'ACEH', color: '#e74c3c', detail: '18 Kab/Kota' },
  { name: 'SUMATERA UTARA', color: '#f39c12', detail: '19 Kab/Kota' },
  { name: 'SUMATERA BARAT', color: '#2ecc71', detail: '11 Kab/Kota' },
];

/* ─────────────────────────────────────────
   Komponen Utama: BabakIntro
───────────────────────────────────────────*/
export default function BabakIntro() {
  const dataset = insights?.ringkasan_dataset || {};
  const totalKK   = dataset.total_rt_keluarga  || 0;
  const totalDesa = dataset.total_desa_infra    || 0;

  // Hitung total kabupaten dari cakupan geografis
  const kabPerProv = insights?.cakupan_geografis_infra?.kab_kota_per_provinsi || {};
  const totalKab   = Object.values(kabPerProv).reduce((s, v) => s + v, 0) || 15;

  // Data sektor fasilitas
  const totalPerKat = insights?.fasilitas_infrastruktur?.total_per_kategori || {};
  const sektorData = SEKTOR.map(s => ({
    ...s,
    count: totalPerKat[s.key] || null,
  }));

  /* Observer untuk trigger counter saat Scene 2 masuk viewport */
  const scene2Ref = useRef(null);
  const [counterStarted, setCounterStarted] = useState(false);
  useEffect(() => {
    const el = scene2Ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCounterStarted(true); },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* ── Scene 1: Opening hero ───────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #050510 0%, #0a0b1f 40%, #0d1a10 100%)',
        padding: '6rem 2rem 4rem',
      }}>
        {/* Grain overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
          opacity: 0.35,
        }} />

        {/* Radial glow */}
        <div style={{
          position: 'absolute',
          width: '60vw', height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(98,129,65,0.07) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }} />

        {/* Label: Hasil Pendataan R3P */}
        <div className="lato-bold" style={{
          fontSize: '0.8rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--green)',
          marginBottom: '2rem',
          opacity: 0,
          animation: 'fadeInUp 1s ease 0.3s both',
          background: 'rgba(98,129,65,0.12)',
          padding: '0.4rem 1.2rem',
          borderRadius: 20,
          border: '1px solid rgba(98,129,65,0.3)',
        }}>
          Hasil Pendataan R3P
        </div>

        {/* Headline utama */}
        <h1 className="playfair-display" style={{
          fontSize: 'clamp(2.4rem, 6vw, 5.5rem)',
          fontWeight: 700,
          textAlign: 'center',
          color: '#fff',
          lineHeight: 1.15,
          maxWidth: '900px',
          margin: '0 0 2rem 0',
          opacity: 0,
          animation: 'fadeInUp 1.2s ease 0.5s both',
        }}>
          Saat Alam Berubah<br />
          <span style={{ color: 'var(--green)' }}>Menjadi Amarah</span>
        </h1>

        {/* Subteks narasi */}
        <p className="lato-regular" style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          textAlign: 'center',
          color: 'var(--beige)',
          maxWidth: '680px',
          lineHeight: 1.9,
          opacity: 0,
          animation: 'fadeInUp 1.2s ease 0.75s both',
        }}>
          Bencana bukan sekadar deretan angka. Dalam sekejap, realitas ribuan nyawa berganti rupa.
          Ini adalah rekam jejak dari mereka yang bertahan di balik puing-puing kehancuran.
        </p>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute',
          bottom: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
          opacity: 0,
          animation: 'fadeInUp 1s ease 1.4s both',
        }}>
          <span className="lato-light" style={{ fontSize: '0.72rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 44, background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)' }} />
          <div style={{ fontSize: '1.2rem', animation: 'bounceDown 1.5s ease-in-out infinite', marginTop: '-8px', opacity: 0.5 }}>↓</div>
        </div>
      </section>

      {/* ── Scene 2: Skala Dampak ────────────────────── */}
      <section ref={scene2Ref} style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 2rem',
        background: 'linear-gradient(180deg, #0d1a10 0%, #15173d 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute',
          width: 700, height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(98,129,65,0.06) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }} />

        {/* Label */}
        <div className="lato-bold" style={{
          fontSize: '0.8rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--green)',
          marginBottom: '1.5rem',
          background: 'rgba(98,129,65,0.1)',
          padding: '0.35rem 1rem',
          borderRadius: 16,
          border: '1px solid rgba(98,129,65,0.25)',
        }}>
          Skala Besar, Dampak Nyata
        </div>

        {/* Sub headline */}
        <h2 className="playfair-display" style={{
          fontSize: 'clamp(1.8rem, 4vw, 3.2rem)',
          fontWeight: 700,
          textAlign: 'center',
          color: '#fff',
          maxWidth: '760px',
          marginBottom: '1.2rem',
          lineHeight: 1.2,
        }}>
          Kami menelusuri{' '}
          <span style={{ color: 'var(--green)' }}>{totalKab > 0 ? totalKab : 15} Kabupaten/Kota</span>
        </h2>

        <p className="lato-regular" style={{
          fontSize: '1.05rem',
          textAlign: 'center',
          color: 'var(--beige)',
          maxWidth: '660px',
          lineHeight: 1.85,
          marginBottom: '4rem',
          opacity: 0.88,
        }}>
          Ratusan ribu jiwa telah memberikan suaranya — bukan sekadar statistik,
          tapi saksi hidup dari ruang hidup yang hilang dalam satu malam.
        </p>

        {/* Big Numbers */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.2rem',
          justifyContent: 'center',
          marginBottom: '4rem',
          width: '100%',
          maxWidth: '900px',
        }}>
          <BigNumber label="Keluarga Disurvei"  value={totalKK}   started={counterStarted} color="#81C784" />
          <BigNumber label="Desa / Kelurahan"   value={totalDesa} started={counterStarted} color="var(--green)" />
          <BigNumber label="Kabupaten / Kota"   value={totalKab}  started={counterStarted} color="#FFB74D" />
        </div>

        {/* Divider */}
        <div style={{
          width: '100%', maxWidth: 600,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          marginBottom: '3rem',
        }} />

        {/* Ikon Sektor Pendataan */}
        <div className="lato-bold" style={{
          fontSize: '0.75rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
          marginBottom: '1.8rem',
        }}>
          Sektor yang Didata
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 600,
          marginBottom: '3rem',
        }}>
          {sektorData.map((s, i) => (
            <SektorIkon key={s.key} sektor={s} delay={i * 200 + 200} show={counterStarted} />
          ))}
        </div>

        {/* 3 provinsi badge row */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {PROVINSI_DOTS.map((d, i) => (
            <div key={d.name} className="lato-regular" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.82rem',
              color: 'var(--beige)',
              padding: '0.4rem 0.9rem',
              background: `${d.color}0d`,
              border: `1px solid ${d.color}33`,
              borderRadius: 20,
            }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, display: 'inline-block', boxShadow: `0 0 6px ${d.color}` }} />
              {d.name}
              <span style={{ color: `${d.color}bb`, fontSize: '0.72rem' }}>· {d.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(6px); }
        }
      `}</style>
    </>
  );
}
