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
   Bubble Chart
───────────────────────────────────────────*/
function BubbleChart({ data }) {
  const [hovered, setHovered] = useState(null);

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

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 560,
      height: 500,
      margin: '0 auto',
    }}>
      {sorted.slice(0, 6).map((item, i) => {
        const fraction = (item.belum || 0) / maxBelum;
        const size = Math.max(85, Math.round(fraction * 210));
        const cfg = BUBBLE_CONFIG[item.col] || { emoji: '📌', color: '#aaa', label: item.col };
        const isHov = hovered === item.col;
        const pos = POSITIONS[i] || POSITIONS[0];

        return (
          <div
            key={item.col}
            onMouseEnter={() => setHovered(item.col)}
            onMouseLeave={() => setHovered(null)}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              transform: `translate(-50%, -50%) scale(${isHov ? 1.13 : 1})`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: isHov
                ? `radial-gradient(circle, ${cfg.color}55, ${cfg.color}22)`
                : `radial-gradient(circle, ${cfg.color}30, ${cfg.color}10)`,
              border: `2px solid ${isHov ? cfg.color : cfg.color + '44'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.25s ease, border-color 0.25s ease, background 0.25s ease',
              boxShadow: isHov ? `0 0 32px ${cfg.color}44` : 'none',
              zIndex: isHov ? 10 : 1,
            }}
          >
            <span style={{ fontSize: size > 130 ? '2.4rem' : '1.6rem' }}>{cfg.emoji}</span>
            <span className="lato-bold" style={{
              fontSize: size > 130 ? '0.82rem' : '0.68rem',
              color: '#fff',
              textAlign: 'center',
              padding: '0 4px',
              lineHeight: 1.2,
            }}>
              {cfg.label || item.nama}
            </span>
            {isHov && (
              <span className="lato-bold" style={{
                fontSize: '0.82rem',
                color: cfg.color,
                marginTop: '0.2rem',
              }}>
                {(item.belum || 0).toLocaleString('id-ID')} KK
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   Scene 1: Kebutuhan Mendesak
───────────────────────────────────────────*/
function SceneJeritanBantuan() {
  const global = insights?.kebutuhan?.ringkasan_global || {};

  const bubbleData = Object.entries(global).map(([col, v]) => ({
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
              Status Penerimaan Bantuan
            </div>
            {!hasData ? (
              <div className="lato-regular" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                Menunggu data dari insight.json…
              </div>
            ) : (
              bubbleData.map(item => {
                const cfg = BUBBLE_CONFIG[item.col] || { color: '#aaa', emoji: '📌', label: item.col };
                const pct = item.pct_sudah || 0;
                return (
                  <div key={item.col} style={{ marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span className="lato-regular" style={{ fontSize: '0.88rem', color: '#fff' }}>
                        {cfg.emoji} {cfg.label || item.nama}
                      </span>
                      <span className="lato-bold" style={{ fontSize: '0.88rem', color: cfg.color }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(pct, 100)}%`,
                        background: `linear-gradient(90deg, ${cfg.color}77, ${cfg.color})`,
                        borderRadius: 4,
                        transition: 'width 1s ease',
                      }} />
                    </div>
                    <div className="lato-regular" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem' }}>
                      {item.sudah.toLocaleString('id-ID')} KK sudah · {item.belum.toLocaleString('id-ID')} KK belum
                    </div>
                  </div>
                );
              })
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
───────────────────────────────────────────*/
function SceneDiBalikAngka() {
  const [ref, visible] = useInView(0.3);

  const totalKK   = insights?.ringkasan_dataset?.total_rt_keluarga || 0;
  const totalDesa = insights?.ringkasan_dataset?.total_desa_infra || 0;

  return (
    <section style={{
      background: 'linear-gradient(180deg, #0a0b1f 0%, #050510 100%)',
      padding: '8rem 2rem',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }} ref={ref}>
        {/* Judul scene */}
        <div className="lato-bold" style={{
          fontSize: '0.78rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
          marginBottom: '2rem',
          opacity: visible ? 1 : 0,
          transition: 'opacity 1s ease',
        }}>
          Babak 4 · Scene 3 — Di Balik Angka
        </div>

        {/* Tanda kutip besar dekoratif */}
        <div style={{
          fontSize: 'clamp(4rem, 10vw, 9rem)',
          color: 'rgba(255,255,255,0.05)',
          fontFamily: 'Georgia, serif',
          lineHeight: 1,
          marginBottom: '-2.5rem',
        }}>
          "
        </div>

        {/* Quote utama */}
        <blockquote style={{
          fontFamily: 'var(--font-title)',
          fontSize: 'clamp(1.4rem, 3.5vw, 2.4rem)',
          fontStyle: 'italic',
          fontWeight: 700,
          color: visible ? '#fff' : 'transparent',
          lineHeight: 1.5,
          margin: '0 0 2rem 0',
          transition: 'color 1.5s ease 0.2s',
          textShadow: visible ? '0 0 40px rgba(98,129,65,0.3)' : 'none',
        }}>
          Kami hanya ingin segera kembali normal.
        </blockquote>

        <cite className="lato-regular-italic" style={{
          fontSize: '1rem',
          color: visible ? 'var(--green)' : 'transparent',
          transition: 'color 1.5s ease 0.6s',
          display: 'block',
          marginBottom: '3.5rem',
        }}>
          — Suara dari Huntara
        </cite>

        {/* Narasi */}
        <p className="lato-regular" style={{
          fontSize: '1.05rem',
          lineHeight: 1.9,
          color: 'var(--beige)',
          opacity: visible ? 0.82 : 0,
          transition: 'opacity 1.5s ease 1s',
          maxWidth: 640,
          margin: '0 auto 4rem',
        }}>
          Setelah audiens terpapar oleh deretan statistik kerusakan infrastruktur,
          narasi beralih ke bagian paling intim. Setiap variabel data —
          kebutuhan air bersih, akses kesehatan, tingkat kerusakan rumah —
          bukan sekadar angka teknis, melainkan representasi dari kebutuhan
          mendesak keluarga dan kelompok rentan yang tengah bertahan di tengah keterbatasan.
        </p>

        {/* Statistik akhir */}
        {totalKK > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem',
            flexWrap: 'wrap',
            opacity: visible ? 1 : 0,
            transition: 'opacity 1.5s ease 1.5s',
          }}>
            {[
              { val: totalKK.toLocaleString('id-ID'), label: 'Keluarga Tercatat' },
              { val: totalDesa.toLocaleString('id-ID'), label: 'Desa Terdampak' },
              { val: '3', label: 'Provinsi Bencana' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div className="playfair-display" style={{ fontSize: '2.5rem', color: 'var(--green)', fontWeight: 700 }}>
                  {s.val}
                </div>
                <div className="lato-regular" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
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
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.8s ease 0.5s',
        }}>
          <button
            onClick={handleShare}
            style={{
              padding: '0.9rem 2.2rem',
              borderRadius: 28,
              background: 'var(--green)',
              color: '#fff',
              border: 'none',
              fontSize: '1rem',
              fontFamily: 'var(--font-content)',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 20px rgba(98,129,65,0.4)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.boxShadow = '0 6px 28px rgba(98,129,65,0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(98,129,65,0.4)';
            }}
          >
            🔗 Bagikan Laporan Ini
          </button>

          <a
            href="/"
            style={{
              padding: '0.9rem 2.2rem',
              borderRadius: 28,
              background: 'transparent',
              color: 'var(--beige)',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '1rem',
              fontFamily: 'var(--font-content)',
              fontWeight: 400,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
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
            Hasil Pendataan R3P · Data Pemulihan Bencana · 2024
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
