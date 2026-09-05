import { useRef, useState, useEffect, useLayoutEffect } from "react";
import PillButton from "../components/PillButton";
import LeafletMap from "../components/LeafletMap";
import { heroSectionAnimation } from "../animations";
import { masterTL } from "../LandingPage";

export default function HeroSection() {
  const sectionRef = useRef(null);
  const [showLeaderLines, setShowLeaderLines] = useState(false)
  useLayoutEffect(() => {
    const cleanUp = heroSectionAnimation(sectionRef.current, masterTL, setShowLeaderLines);
    return cleanUp;
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-gradient-to-br from-[#0f172a] to-[var(--navy)] overflow-hidden flex flex-col justify-center px-[5%]"
    >
      <style>{`
        @keyframes scrollLine {
          0%   { transform:scaleY(0); transform-origin:top; opacity:0; }
          30%  { transform:scaleY(1); transform-origin:top; opacity:1; }
          70%  { transform:scaleY(1); transform-origin:bottom; opacity:1; }
          100% { transform:scaleY(0); transform-origin:bottom; opacity:0; }
        }
      `}</style>
      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60 z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Light gradient background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_55%_70%_at_15%_55%,rgba(98,129,65,0.07)_0%,transparent_65%)] z-10" />

      {/* ── Top bar ── */}
      <div className="hero-topbar absolute top-0 left-0 right-0 py-[clamp(18px,3.5vh,32px)] px-[5%] flex items-center justify-between border-b border-[var(--beige)]/[0.07] z-20">
        <div className="flex flex-col gap-[3px]">
          <span className="font-[family-name:var(--font-title)] text-[clamp(12px,1.4vw,14px)] tracking-[0.05em] text-[var(--gold)]">
            Politeknik Statistika STIS
          </span>
          <span className="text-[10px] tracking-[0.16em] uppercase text-[var(--beige)]/[0.35] font-light">
            PKL Angkatan 65 · 2026
          </span>
        </div>
      </div>

      {/* ── Content — left aligned ── */}
      <div className="hero-content-left relative z-20 max-w-[620px] flex flex-col items-start py-[clamp(80px,12vh,120px)]">
        {/* Kicker */}
        <div className="hero-kicker opacity-0 flex items-center gap-3 mb-[clamp(16px,2.5vh,24px)]">
          <div className="w-7 h-[1px] bg-[var(--gold)]" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--gold)] font-normal">
            Diseminasi Hasil Pendataan Pascabencana
          </span>
        </div>

        {/* H1 */}
        <h1 className="hero-title opacity-0 font-[family-name:var(--font-title)] italic text-[clamp(36px,5.8vw,80px)] leading-[1.08] font-bold !text-[var(--beige)] mb-[clamp(8px,1.5vh,16px)] tracking-[-0.02em] drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)]">
          Praktik Kerja<br />Lapangan
        </h1>

        {/* Sub-title */}
        <h2 className="hero-subtitle opacity-0 font-[family-name:var(--font-title)] italic text-[clamp(16px,2vw,26px)] font-normal !text-[var(--beige)]/60 mb-[clamp(24px,3.5vh,36px)] leading-[1.35] max-w-[520px]">
          Sebuah Cerita di balik <br />"Pendataan Rencana Rehabilitasi<br />
          Rekonstruksi Pascabencana"
        </h2>

        {/* Details info */}
        <div className="hero-details opacity-0 border-l-3 border-[var(--beige)] pl-4 mb-[clamp(28px,4vh,44px)]">
          <p className="font-[family-name:var(--font-content)] text-[clamp(13px,1.3vw,16px)] text-[var(--beige)] mb-[0.3rem] font-light tracking-[0.03em]">
            Aceh · Sumatera Utara · Sumatera Barat
          </p>
          <p className="font-[family-name:var(--font-content)] text-[clamp(13px,1.3vw,16px)] text-[var(--beige)]/75 m-0 font-light">
            14 Januari – 02 Februari 2026
          </p>
        </div>

        {/* CTA buttons */}
        <div className="hero-cta opacity-0 flex flex-wrap gap-3.5">
          <PillButton href="#portal" primary onClick={(e) => scrollToSection(e, "#portal")}>
            Mulai Perjalanan
          </PillButton>

          <PillButton href="#mandate" onClick={(e) => scrollToSection(e, "#mandate")}>
            Apa yang kami kerjakan?
          </PillButton>
        </div>
      </div>

      {/* ── Map panel — right side ── */}
      <div className="hero-map opacity-0 absolute bg-[#0d0e28] top-0 right-0 w-[55vw] h-full overflow-hidden max-lg:relative max-lg:w-full max-lg:h-[40vh] max-lg:opacity-25 z-30">
        <div className="hero-map-title m-5 absolute top-0 z-40 w-full hidden">
          <h2 className="font-[family-name:var(--font-title)] text-center italic text-[clamp(28px,3.5vw,50px)] leading-[1.15] !text-[var(--beige)] mb-[clamp(20px,3vh,32px)]">
            510 Total Mahasiswa<br />
            <span className="not-italic text-[var(--gold)]">Mengemban Tugas Penting</span>
          </h2>
        </div>
        <div className="hero-map-gradient absolute inset-0 bg-gradient-to-r from-[#0f172a] via-transparent to-transparent z-10 max-lg:hidden pointer-events-none" />

        {/* Canvas fixed di ukuran final, anchored kanan */}
        <div className="hero-map-canvas absolute top-0 left-0 h-[360px] md:h-full w-[1000px] md:w-screen scale-90 md:scale-150 -translate-x-90 -translate-y-5 md:translate-y-0 md:-translate-x-[30vw]">
          <LeafletMap showLeaderLines={showLeaderLines} />
        </div>
      </div>

      {/* Scroll cue */}
      <div className="hero-scroll-cue opacity-0 absolute md:bottom-[clamp(20px,3.5vh,40px)] md:left-[5%] bottom-[43vh] left-5 flex items-center gap-2.5 z-30">
        <div className="w-[1px] h-10 bg-[var(--beige)] animate-[scrollLine_2.2s_ease-in-out_infinite]" />
        <span className="text-[9px] tracking-[0.2em] uppercase text-[var(--beige)] font-light">
          Scroll
        </span>
      </div>
    </section>
  );
}
