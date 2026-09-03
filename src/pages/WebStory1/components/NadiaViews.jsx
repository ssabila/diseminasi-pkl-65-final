import { useEffect, useRef, useState } from 'react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from '@gsap/react';
import './NadiaViews.css';

// View 4 Assets
import imgSumatera from '../assets/images/view-4/ws1-nadia-sumatera-v4.png';
import imgPoint from '../assets/images/view-4/ws1-nadia-point-v4.svg';

// View 0/Global Hero Asset
import imgHero from '../assets/images/view-0/ws1-hero.webp';
import briefingPhoto1 from '../assets/images/view-2/v2-card-1.webp';
import briefingPhoto2 from '../assets/images/view-2/v2-card-2.webp';
import briefingPhoto3 from '../assets/images/view-2/v2-card-3.webp';
import briefingPhoto4 from '../assets/images/view-2/v2-card-4.webp';

gsap.registerPlugin(ScrollTrigger);

function useTextScramble(finalText, trigger = true) {
  const [displayText, setDisplayText] = useState(finalText);
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ!@#$%^&*░▒▓";

  useEffect(() => {
    if (!trigger) return;
    let frame = 0;
    const totalFrames = 22;
    const interval = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        setDisplayText(finalText);
        clearInterval(interval);
        return;
      }
      const progress = frame / totalFrames;
      const result = finalText
        .split("")
        .map((char, i) => {
          if (char === " " || char === "\n" || char === ",") return char;
          if (i / finalText.length < progress) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      setDisplayText(result);
    }, 38);
    return () => clearInterval(interval);
  }, [finalText, trigger]);

  return displayText;
}

const GrainOverlay = () => <div className="j-grain" aria-hidden="true" />;

// ── Map Data (GSAP Original) ────────────────────────────────
const PROVINCES = [
  { 
    id: 'aceh', name: 'Aceh', 
    x: '17%', y: '22%',
    mhs: 270, pml: 29
  },
  { 
    id: 'sumut', name: 'Sumatera Utara', 
    x: '30%', y: '28%',
    mhs: 210, pml: 21
  },
  { 
    id: 'sumbar', name: 'Sumatera Barat', 
    x: '38.5%', y: '47%',
    mhs: 30, pml: 2
  },
];

function RotatingScrollCue() {
  const text = "SCROLL TO EXPLORE · SCROLL TO EXPLORE · ";
  const r = 38;
  return (
    <div className="j-scroll-cue gsap-scroll-cue gsap-hidden-up">
      <svg viewBox="0 0 100 100" className="j-scroll-cue-ring gsap-scroll-ring">
        <defs><path id="cueCircle" d={`M50,50 m-${r},0 a${r},${r} 0 1,1 ${r * 2},0 a${r},${r} 0 1,1 -${r * 2},0`} /></defs>
        <text fontSize="8.5" fill="rgba(229,217,182,0.55)" letterSpacing="3" fontFamily="'Lato', sans-serif" fontWeight="300">
          <textPath href="#cueCircle">{text}</textPath>
        </text>
      </svg>
      <div className="j-scroll-mouse">
        <div className="j-scroll-wheel gsap-scroll-wheel" />
      </div>
    </div>
  );
}

export const View0 = () => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(() => {
    // Parallax content on scroll
    gsap.to(contentRef.current, {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "start start",
        end: "end start",
        scrub: true,
      }
    });

    // Mountains parallax (back layer moves slower)
    gsap.to(".v0-mountain-back", {
      yPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "start start",
        end: "end start",
        scrub: true,
      }
    });

    // Cinematic entrance timeline
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(".v0-ambient-glow", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 2 }, 0)
      .fromTo(".v0-grid-overlay", { opacity: 0 }, { opacity: 0.8, duration: 1.5 }, 0.3)
      .to(".gsap-fade-headline", { opacity: 1, y: 0, duration: 0.8 }, 0.5)
      .to(".gsap-fade-subline", { opacity: 1, y: 0, duration: 0.7 }, 0.8)
      .fromTo(".j-cover-frame", { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0.8)
      .fromTo(".v0-mountains", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" }, 0.6);

  }, { scope: containerRef });

  return (
    <section className="webstory-view ws1-nadia-view0" ref={containerRef} id="cover">
      <GrainOverlay />

      {/* Layer 0: Background Hero Image with transparency */}
      <div 
        className="v0-hero-bg" 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${imgHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          zIndex: 0
        }} 
      />

      {/* Layer 1: Warm ambient glow */}
      <div className="v0-ambient-glow" aria-hidden="true" style={{ zIndex: 1 }} />

      {/* Layer 2: Cartographic grid */}
      <div className="v0-grid-overlay" aria-hidden="true" style={{ zIndex: 1 }} />

      {/* Layer 3: Floating ember particles */}
      <div className="v0-particles" aria-hidden="true">
        <div className="v0-particle p1" />
        <div className="v0-particle p2" />
        <div className="v0-particle p3" />
        <div className="v0-particle p4" />
        <div className="v0-particle p5" />
      </div>

      {/* Layer 4: Songket frame */}
      <div className="j-cover-frame" aria-hidden="true" style={{opacity: 0}}>
        <svg className="j-frame-corner corner-tl" viewBox="0 0 100 100" fill="none">
          <path d="M0,0 L100,0 M0,0 L0,100" stroke="var(--gold)" strokeWidth="3"/>
          <path d="M8,8 L85,8 M8,8 L8,85" stroke="var(--gold)" strokeWidth="1" strokeDasharray="2 2"/>
          <polygon points="12,12 28,12 12,28" fill="var(--gold)" opacity="0.3"/>
          <path d="M0,25 L25,0 M0,45 L45,0 M0,65 L65,0" stroke="var(--gold)" strokeWidth="1"/>
        </svg>
        <svg className="j-frame-corner corner-tr" viewBox="0 0 100 100" fill="none">
          <path d="M0,0 L100,0 M0,0 L0,100" stroke="var(--gold)" strokeWidth="3"/>
          <path d="M8,8 L85,8 M8,8 L8,85" stroke="var(--gold)" strokeWidth="1" strokeDasharray="2 2"/>
          <polygon points="12,12 28,12 12,28" fill="var(--gold)" opacity="0.3"/>
          <path d="M0,25 L25,0 M0,45 L45,0 M0,65 L65,0" stroke="var(--gold)" strokeWidth="1"/>
        </svg>
        <svg className="j-frame-corner corner-bl" viewBox="0 0 100 100" fill="none">
          <path d="M0,0 L100,0 M0,0 L0,100" stroke="var(--gold)" strokeWidth="3"/>
          <path d="M8,8 L85,8 M8,8 L8,85" stroke="var(--gold)" strokeWidth="1" strokeDasharray="2 2"/>
          <polygon points="12,12 28,12 12,28" fill="var(--gold)" opacity="0.3"/>
          <path d="M0,25 L25,0 M0,45 L45,0 M0,65 L65,0" stroke="var(--gold)" strokeWidth="1"/>
        </svg>
        <svg className="j-frame-corner corner-br" viewBox="0 0 100 100" fill="none">
          <path d="M0,0 L100,0 M0,0 L0,100" stroke="var(--gold)" strokeWidth="3"/>
          <path d="M8,8 L85,8 M8,8 L8,85" stroke="var(--gold)" strokeWidth="1" strokeDasharray="2 2"/>
          <polygon points="12,12 28,12 12,28" fill="var(--gold)" opacity="0.3"/>
          <path d="M0,25 L25,0 M0,45 L45,0 M0,65 L65,0" stroke="var(--gold)" strokeWidth="1"/>
        </svg>
      </div>

      {/* Layer 5: Main content */}
      <div className="j-cover-content" ref={contentRef} style={{ zIndex: 2, position: 'relative' }}>
        <h1 className="j-cover-headline gsap-fade-headline gsap-hidden-up">
          Misi R3P<br />
          <span className="j-cover-hl-accent">2026</span>
        </h1>
        <p className="j-cover-subline gsap-fade-subline gsap-hidden-up" style={{ marginBottom: '8px', fontSize: '1.2em', fontWeight: '500' }}>
          Rencana Rehabilitasi Rekonstruksi Pascabencana
        </p>
        <p className="j-cover-subline gsap-fade-subline gsap-hidden-up" style={{ opacity: 0.85, fontSize: '0.95em' }}>
          Sebuah Perjalanan Kemanusiaan
        </p>
      </div>

      {/* Layer 6: Mountain silhouettes */}
      <div className="v0-mountains" aria-hidden="true">
        <svg className="v0-mountain-svg" viewBox="0 0 1440 250" preserveAspectRatio="none">
          {/* Back range — lighter, further */}
          <path className="v0-mountain-back" d="M0,250 L0,180 Q120,80 240,140 Q360,60 480,120 Q600,40 720,100 Q840,30 960,110 Q1080,50 1200,130 Q1320,70 1440,160 L1440,250 Z" />
          {/* Front range — darker, closer */}
          <path className="v0-mountain-front" d="M0,250 L0,200 Q180,130 360,180 Q540,100 720,160 Q900,90 1080,170 Q1260,120 1440,190 L1440,250 Z" />
        </svg>
      </div>
    </section>
  );
};



// ─── Briefing image stack photos (Unsplash) ──────────────────
const briefingPhotos = [
  briefingPhoto1,
  briefingPhoto2,
  briefingPhoto3,
  briefingPhoto4,
];

export const View4 = () => {
  const sectionRef    = useRef(null);
  const heroRef       = useRef(null);
  const mapRef        = useRef(null);
  const briefingRef   = useRef(null);
  const [activeProvince, setActiveProvince] = useState(null);

  useGSAP(() => {
    // ── 1. HERO: Teks masuk dari bawah ─────────────────────────
    gsap.fromTo('.v4-hero-eyebrow', { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: heroRef.current, start: 'top 90%', toggleActions: 'play none none reverse' },
    });
    gsap.fromTo('.v4-hero-title', { opacity: 0, y: 24 }, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1,
      scrollTrigger: { trigger: heroRef.current, start: 'top 90%', toggleActions: 'play none none reverse' },
    });
    gsap.fromTo('.v4-hero-desc', { opacity: 0, y: 16 }, {
      opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.2,
      scrollTrigger: { trigger: heroRef.current, start: 'top 90%', toggleActions: 'play none none reverse' },
    });
    // Parallax foto bg on scroll
    gsap.to('.v4-hero-bg img', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
    });

    // ── 2. PETA SUMATERA ───────────────────────────────────────
    // Heading fade in
    gsap.fromTo('.v4-map-heading', { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: mapRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
    });

    // Map reveal with clip-path
    gsap.fromTo('.v4-map-sumatera', 
      { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
      { 
        clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, 
        duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: mapRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
      }
    );

    // Pin pop-up stagger
    gsap.fromTo('.v4-loc-pin',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)', stagger: 0.1,
        scrollTrigger: { trigger: mapRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }
      }
    );

    // ── 3. BRIEFING TERAKHIR: Interactive Card Stack ───────────────
    const container = briefingRef.current?.querySelector('.v4-briefing-stack-container');
    const briefCards = gsap.utils.toArray('.v4-brief-stack-card', briefingRef.current);
    
    // stack array holds card indexes from FRONT (0) to BACK (last)
    let stack = [];
    for(let i = briefCards.length - 1; i >= 0; i--) stack.push(i);

    // Initial setup with elegant, spacious deck offsets (preventing header collision)
    stack.forEach((cardIndex, stackPos) => {
      const card = briefCards[cardIndex];
      gsap.set(card, {
        y: stackPos * -14,       
        x: stackPos * 16,        
        scale: 1 - (stackPos * 0.035), 
        zIndex: briefCards.length - stackPos,           
        opacity: 0,              
      });
    });

    // Reveal animation
    gsap.to(briefCards, {
      opacity: (i) => {
        const stackPos = stack.indexOf(i);
        return 1 - (stackPos * 0.18); 
      },
      duration: 0.6,
      stagger: 0.08,
      ease: 'back.out(1.2)',
      scrollTrigger: {
        trigger: briefingRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    });

    // Click handler to cycle cards
    const handleStackClick = () => {
      if (gsap.isTweening(briefCards[stack[0]])) return; // Prevent spam clicking

      const frontCardIndex = stack[0];
      const frontCard = briefCards[frontCardIndex];
      
      // 1. Animate front card flying away and fading out
      gsap.to(frontCard, {
        y: -120, 
        x: -40, 
        opacity: 0, 
        scale: 1.04, 
        duration: 0.4, 
        ease: 'power2.in',
        onComplete: () => {
          // Move front card to the back of the logic array
          stack.push(stack.shift());
          
          // Set it to a hidden position behind the stack so it can slide in
          const backPos = stack.length - 1;
          gsap.set(frontCard, { 
            y: backPos * -14 + 35, 
            x: backPos * 16 + 35, 
            scale: 1 - (backPos * 0.035), 
            zIndex: 0 
          });
          
          // Animate the former front card settling into the back
          gsap.to(frontCard, {
            y: backPos * -14,
            x: backPos * 16,
            opacity: 1 - (backPos * 0.18),
            duration: 0.5,
            ease: 'power2.out'
          });
        }
      });
      
      // 2. Simultaneously slide the other cards forward
      const nextStack = [...stack];
      nextStack.push(nextStack.shift()); // Simulate the new state
      
      nextStack.forEach((cardIndex, stackPos) => {
        if (cardIndex !== frontCardIndex) {
          const card = briefCards[cardIndex];
          gsap.to(card, {
            y: stackPos * -14, 
            x: stackPos * 16, 
            scale: 1 - (stackPos * 0.035), 
            zIndex: briefCards.length - stackPos, 
            opacity: 1 - (stackPos * 0.18), 
            duration: 0.6, 
            ease: 'power2.out'
          });
        }
      });
    };

    if (container) {
      container.addEventListener('click', handleStackClick);
      container.style.cursor = 'pointer';
    }

    return () => {
      if (container) {
        container.removeEventListener('click', handleStackClick);
        container.style.cursor = '';
      }
    };

  }, { scope: sectionRef });

  const briefingCardsData = [
    {
      region: "ACEH",
      pclCount: "275 PCL",
      date: "19 Jan 2026",
      title: "Instruksi Final",
      desc: "Kepala BPS Provinsi menyampaikan arahan teknis terakhir sebelum penerjunan. Standar wawancara, protokol entry data, dan prosedur verifikasi lapangan diulangi satu per satu.",
      locLabel: "BPS PROVINSI ACEH",
      img: briefingPhotos[0]
    },
    {
      region: "SUMUT",
      pclCount: "210 PCL",
      date: "21 Jan 2026",
      title: "Koordinasi Lapangan",
      desc: "Memastikan kesiapan seluruh tim di lapangan dengan menyelaraskan SOP dan penanganan masalah teknis yang sering ditemui selama pendataan R3P.",
      locLabel: "BPS PROVINSI SUMUT",
      img: briefingPhotos[1]
    },
    {
      region: "SUMBAR",
      pclCount: "30 PCL",
      date: "22 Jan 2026",
      title: "Review Kuesioner",
      desc: "Sesi tanya jawab mendalam mengenai konsep dan definisi operasional kuesioner R3P untuk meminimalisir kesalahan interpretasi data di lapangan.",
      locLabel: "BPS PROVINSI SUMBAR",
      img: briefingPhotos[2]
    },
    {
      region: "PUSAT",
      pclCount: "510 MHS",
      date: "25 Jan 2026",
      title: "Pelepasan Bersama",
      desc: "Apel siaga dan pelepasan resmi seluruh mahasiswa PKL oleh pimpinan, mengobarkan semangat untuk mengumpulkan data yang akurat dan berkualitas.",
      locLabel: "KAMPUS STIS",
      img: briefingPhotos[3] || briefingPhotos[0]
    }
  ];

  return (
    <section className="ws1-nadia-view4" ref={sectionRef}>

      {/* ── Section A: Hero "Tiga Provinsi Satu Semangat" ── */}
      <div className="v4-hero" ref={heroRef}>
        <div className="v4-hero-bg">
          <img
            src={imgHero}
            alt="Briefing Keberangkatan"
          />
        </div>
        <div className="v4-hero-overlay" />
        <div className="v4-hero-content">
          <p className="v4-hero-eyebrow">Pendataan R3P 2026 · Angkatan 65</p>
          <h2 className="v4-hero-title">
            Tiga Provinsi<br />
            <span className="v4-accent">Satu Semangat</span>
          </h2>
          <p className="v4-hero-desc">
            510 mahasiswa STIS diterjunkan ke Aceh, Sumatera Utara,
            dan Sumatera Barat.
          </p>
        </div>
      </div>

      {/* ── Section B: Peta Sumatera & Alokasi (Interactive Dashboard) ── */}
      <div className="v4-map-section" ref={mapRef}>
        <h3 className="v4-map-heading v4-anim-fade">Peta Alokasi Petugas</h3>
        
        <div className="v4-map-layout-standout">
          {/* Map display */}
          <div className="v4-map-wrapper">
            <img src={imgSumatera} className="v4-map-sumatera" alt="Peta Sumatera" />
            
            {PROVINCES.map((prov, i) => (
              <div 
                key={prov.id} 
                className={`v4-map-loc ${activeProvince === i ? 'active' : ''}`}
                style={{ left: prov.x, top: prov.y }}
                onMouseEnter={() => setActiveProvince(i)}
                onMouseLeave={() => setActiveProvince(null)}
                onClick={() => setActiveProvince(activeProvince === i ? null : i)}
              >
                <img src={imgPoint} className="v4-loc-pin" alt="Pin" />
              </div>
            ))}
          </div>

          {/* Interactive details dashboard */}
          <div className="v4-map-dashboard">
            <div className="v4-dashboard-inner">
              <span className="v4-db-kicker">
                {activeProvince !== null ? 'PROVINSI TERPILIH' : 'KOMANDO PUSAT'}
              </span>
              <h4 className="v4-db-title">
                {activeProvince !== null ? PROVINCES[activeProvince].name : 'R3P Sumatra 2026'}
              </h4>
              <div className="v4-db-divider" />
              
              <div className="v4-db-stats-grid">
                <div className="v4-db-stat-box">
                  <span className="v4-db-stat-num">
                    {activeProvince !== null ? PROVINCES[activeProvince].mhs : '510'}
                  </span>
                  <span className="v4-db-stat-label">Mahasiswa</span>
                </div>
                <div className="v4-db-stat-box">
                  <span className="v4-db-stat-num">
                    {activeProvince !== null ? PROVINCES[activeProvince].pml : '52'}
                  </span>
                  <span className="v4-db-stat-label">PML</span>
                </div>
              </div>

              <div className="v4-db-footer">
                <p>
                  {activeProvince !== null 
                    ? `Misi pendataan terfokus di wilayah ${PROVINCES[activeProvince].name} dengan pendampingan melekat oleh supervisor PML.`
                    : 'Arahkan kursor atau ketuk pin provinsi di peta untuk memfilter data alokasi petugas secara langsung.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section C: Briefing Terakhir — Card Stack ── */}
      <div className="v4-briefing-section" ref={briefingRef}>
        <div className="v4-briefing-header">
          <h3 className="v4-briefing-title">Briefing <em>Terakhir</em></h3>
        </div>
        
        <div className="v4-briefing-stack-container">
          {briefingCardsData.map((card, i) => (
            <div key={i} className="v4-brief-stack-card">
              <div className="v4-bsc-left">
                <img src={card.img} alt={card.title} />
                <div className="v4-bsc-loc-overlay">
                  <span className="v4-bsc-loc-icon">LOKASI</span> {card.locLabel}
                </div>
              </div>
              <div className="v4-bsc-right">
                <div className="v4-bsc-header-row">
                  <span className="v4-bsc-pill">{card.region} - {card.pclCount}</span>
                  <span className="v4-bsc-date">{card.date}</span>
                  <span className="v4-bsc-pagination">
                    {String(i + 1).padStart(2, '0')} / {String(briefingCardsData.length).padStart(2, '0')}
                  </span>
                </div>
                <h4 className="v4-bsc-title">{card.title}</h4>
                <p className="v4-bsc-desc">{card.desc}</p>
                <div className="v4-bsc-line"></div>
              </div>
            </div>
          ))}
        </div>
        <p className="v4-stack-hint">Tap to flip cards ↺</p>
      </div>
    </section>
  );
};

export const View9 = () => {
  const closingRef = useRef(null);

  useGSAP(() => {
    // Kicker fade in
    gsap.fromTo('.v9-kicker', { opacity: 0, y: 15 }, {
      opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
      scrollTrigger: { trigger: closingRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
    // Headline reveal
    gsap.fromTo('.v9-headline', { opacity: 0, y: 25 }, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1,
      scrollTrigger: { trigger: closingRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
    // Closing paragraph
    gsap.fromTo('.v9-closing-text', { opacity: 0 }, {
      opacity: 1, duration: 0.6, delay: 0.2,
      scrollTrigger: { trigger: closingRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
    });
    // Decorative line grow
    gsap.fromTo('.v9-line', { scaleX: 0 }, {
      scaleX: 1, duration: 0.6, ease: 'power3.inOut', delay: 0.15,
      scrollTrigger: { trigger: closingRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
    });
    // Stats counter fade in stagger
    gsap.fromTo('.v9-stat', { opacity: 0, y: 15 }, {
      opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.25,
      scrollTrigger: { trigger: closingRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
    });
    // Stats counter count-up (faster 1.2s instead of 2.5s)
    gsap.utils.toArray('.v9-stat-num').forEach((el) => {
      const targetVal = parseInt(el.getAttribute('data-target'), 10);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetVal,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.25,
        scrollTrigger: { trigger: closingRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
        onUpdate: () => {
          el.innerText = Math.floor(obj.val);
        }
      });
    });
    // Footer credits
    gsap.fromTo('.v9-credits', { opacity: 0 }, {
      opacity: 1, duration: 0.8, delay: 0.4,
      scrollTrigger: { trigger: closingRef.current, start: 'top 70%', toggleActions: 'play none none reverse' },
    });
  }, { scope: closingRef });

  return (
    <section className="ws1-nadia-view9" ref={closingRef}>
      <GrainOverlay />
      
      {/* Decorative floating orbs */}
      <div className="v9-orb v9-orb-1" aria-hidden="true" />
      <div className="v9-orb v9-orb-2" aria-hidden="true" />

      <div className="v9-content">
        <p className="v9-kicker">PENUTUP</p>
        <div className="v9-line" />
        <h2 className="v9-headline">
          Data Dikumpulkan,<br />
          <span className="v9-hl-accent">Harapan Direkam</span>
        </h2>
        <p className="v9-closing-text">
          510 mahasiswa. 3 provinsi. 15 kabupaten/kota.
        </p>

        <div className="v9-stats-row">
          <div className="v9-stat">
            <span className="v9-stat-num" data-target="510">0</span>
            <span className="v9-stat-label">Mahasiswa</span>
          </div>
          <div className="v9-stat">
            <span className="v9-stat-num" data-target="3">0</span>
            <span className="v9-stat-label">Provinsi</span>
          </div>
          <div className="v9-stat">
            <span className="v9-stat-num" data-target="15">0</span>
            <span className="v9-stat-label">Kabupaten/Kota</span>
          </div>
          <div className="v9-stat">
            <span className="v9-stat-num" data-target="52">0</span>
            <span className="v9-stat-label">PML</span>
          </div>
        </div>

        <p className="v9-credits">
          PKL Angkatan 65 · Politeknik Statistika STIS · 2026
        </p>
      </div>
    </section>
  );
};
