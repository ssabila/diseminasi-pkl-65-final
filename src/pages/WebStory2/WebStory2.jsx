import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useLocation, useNavigate } from 'react-router-dom';

import BabakIntro from './1.Intro/intro';
import BabakInfrastruktur from './2.Infrastruktur/infrastruktur';
import BabakKeluarga from './3.Keluarga/keluarga';
import BabakKebutuhan from './4.Kebutuhan/kebutuhan';
import BgSeam from './shared/BgSeam';
import { BG } from './ws2-tokens';
import './ws2-tokens.css';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────
   Indikator progres scroll — dipasang di tepi BAWAH layar.
───────────────────────────────────────────*/
function ScrollProgress() {
  const barRef = useRef(null);
  useGSAP(() => {
    gsap.to(barRef.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
      },
    });
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: 4,
      background: 'var(--ws2-line-1)',
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      <div ref={barRef} style={{
        height: '100%',
        background: 'var(--ws2-accent)',
        transformOrigin: 'left',
        transform: 'scaleX(0)',
        boxShadow: '0 0 12px var(--ws2-accent-glow)',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   Komponen Utama: WebStory2
───────────────────────────────────────────*/
const WebStory2 = () => {
  const container = useRef(null);
  const lenisRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigatingRef = useRef(false);

  /* ── Smooth scroll ─────────────────────────────────────────────────────
     Pola yang sama dengan WebStory3. Tanpa ini, Babak 2 memakai native
     scroll sementara Babak 3 penuh tween ber-scrub, sehingga pergantian
     antar babak terasa berbeda kecepatan. Semua peta sudah mematikan
     scroll-zoom, jadi Lenis tidak perlu opsi `prevent`. */
  React.useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false });
    lenisRef.current = lenis;
    // Lenis mengambil alih posisi scroll, jadi window.scrollTo tidak lagi
    // dapat diandalkan untuk melompat ke satu scene saat pengecekan manual.
    if (import.meta.env.DEV) window.__lenis = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Pin-spacer dan web font mengubah tinggi dokumen setelah mount; tanpa
    // refresh, posisi seam meleset dari yang terlihat di layar.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    const t = setTimeout(refresh, 1200);

    return () => {
      clearTimeout(t);
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const target = location.state?.scrollTarget ?? 'top';
    const scrollToTarget = () => {
      const top = target === 'bottom' ? document.documentElement.scrollHeight : 0;
      lenisRef.current?.scrollTo(top, { immediate: true, force: true });
      window.scrollTo({ top, left: 0, behavior: 'auto' });
    };

    const raf1 = requestAnimationFrame(() => {
      scrollToTarget();
      requestAnimationFrame(scrollToTarget);
    });

    return () => cancelAnimationFrame(raf1);
  }, [location.key, location.state]);

  /* ── Pergantian warna latar ────────────────────────────────────────────
     Container ini adalah SATU-SATUNYA pemilik warna latar di seluruh Web
     Story 2; semua section di keempat babak transparan. Dulu tiap batas
     dikerjakan sendiri-sendiri lewat gradient di dalam section atau
     <SectionDivider from to> yang nilainya tidak cocok dengan tetangganya —
     salah satunya memudar navy -> krem lalu disusul section navy lagi.

     <BgSeam> hanya menandai DI MANA pergantian terjadi; warnanya dihitung
     di sini. Satu mesin untuk semua seam, bukan satu tween per seam: delapan
     tween pada properti yang sama akan saling berebut dan menghasilkan warna
     lumpur di antara navy dan krem. Dengan menghitung warna langsung dari
     posisi scroll, hasilnya deterministik dan reversibel sempurna. */
  useGSAP(() => {
    const el = container.current;
    if (!el) return undefined;

    const seams = gsap.utils.toArray('[data-seam]')
      .map((node) => {
        const [from, to] = node.dataset.seam.split('>');
        return { node, from, to };
      })
      .filter((s) => s.from !== s.to && BG[s.from] && BG[s.to])
      .map((s) => ({ ...s, mix: gsap.utils.interpolate(BG[s.from], BG[s.to]), top: 0, bottom: 0 }));

    /* Posisi seam di-cache supaya paint() tidak membaca layout tiap frame.
       Tapi tinggi dokumen masih berubah setelah gambar lazy-load dan web font
       selesai — kalau cache tidak ikut diperbarui, seluruh seam dianggap sudah
       terlewat dan warnanya terkunci di nilai terakhir. Karena itu tinggi
       dokumen dipakai sebagai penanda: berubah sedikit pun, ukur ulang. */
    let tinggiTerukur = -1;

    const measure = () => {
      seams.forEach((s) => {
        const rect = s.node.getBoundingClientRect();
        s.top = rect.top + window.scrollY;
        s.bottom = s.top + rect.height;
      });
      tinggiTerukur = document.documentElement.scrollHeight;
    };

    // Garis baca di 55% viewport: pergantian terasa selesai kira-kira saat
    // seam melewati tengah layar, bukan saat baru menyentuh tepi bawah.
    const paint = () => {
      if (document.documentElement.scrollHeight !== tinggiTerukur) measure();
      const y = window.scrollY + window.innerHeight * 0.55;
      let color = BG.navy;
      for (const s of seams) {
        if (y >= s.bottom) color = BG[s.to];
        else if (y > s.top) { color = s.mix((y - s.top) / (s.bottom - s.top)); break; }
        else break;
      }
      gsap.set(el, { backgroundColor: color });
    };

    measure();
    paint();

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: paint,
      onRefresh: () => { measure(); paint(); },
    });

    return () => st.kill();
  }, { scope: container });

  React.useEffect(() => {
    const threshold = 24;
    let touchStartY = 0;

    const isAtTop = () => window.scrollY <= threshold;
    const isAtBottom = () => (
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold
    );

    const goToNextStory = () => {
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;
      navigate('/web-story-3', { state: { scrollTarget: 'top' } });
    };

    const goToPreviousStory = () => {
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;
      navigate('/web-story-1', { state: { scrollTarget: 'bottom' } });
    };

    const onWheel = (event) => {
      if (event.deltaY > 0 && isAtBottom()) goToNextStory();
      if (event.deltaY < 0 && isAtTop()) goToPreviousStory();
    };

    const onKeyDown = (event) => {
      const downKeys = ['ArrowDown', 'PageDown', ' ', 'End'];
      const upKeys = ['ArrowUp', 'PageUp', 'Home'];
      if (downKeys.includes(event.key) && isAtBottom()) goToNextStory();
      if (upKeys.includes(event.key) && isAtTop()) goToPreviousStory();
    };

    const onTouchStart = (event) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchEnd = (event) => {
      const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY;
      const swipeDelta = touchStartY - touchEndY;
      if (swipeDelta > 20 && isAtBottom()) goToNextStory();
      if (swipeDelta < -20 && isAtTop()) goToPreviousStory();
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [navigate]);

  return (
    <div
      ref={container}
      id="ws2-root"
      className="ws2"
      style={{
        backgroundColor: 'var(--ws2-bg-navy)',
        color: 'var(--ws2-text-1)',
        fontFamily: 'var(--font-content)',
      }}
    >
      <ScrollProgress />

      {/* Urutan warna: B1 navy -> B2 (navy, krem, navy, navy, krem)
          -> B3 (navy ... krem) -> B4 (navy, krem, navy, navy).
          Seam di dalam tiap babak diurus file babak masing-masing. */}

      <div id="babak-1" className="babak-section" style={{ minHeight: '100vh', position: 'relative' }}>
        <BabakIntro />
      </div>

      {/* Babak 1 dan 2 sama-sama navy: penanda bab saja, tanpa tween warna. */}
      <BgSeam from="navy" to="navy" />

      <div id="babak-2" className="babak-section" style={{ minHeight: '100vh', position: 'relative' }}>
        <BabakInfrastruktur />
      </div>

      {/* Babak 2 berakhir krem (Perbandingan Lintas Provinsi). */}
      <BgSeam from="cream" to="navy" />

      <div id="babak-3" className="babak-section" style={{ minHeight: '100vh', position: 'relative' }}>
        <BabakKeluarga />
      </div>

      {/* Babak 3 berakhir krem (panel klimaks 1.891 dan jembatannya). */}
      <BgSeam from="cream" to="navy" />

      <div id="babak-4" className="babak-section" style={{ minHeight: '100vh', position: 'relative' }}>
        <BabakKebutuhan />
      </div>
    </div>
  );
};

export default WebStory2;
