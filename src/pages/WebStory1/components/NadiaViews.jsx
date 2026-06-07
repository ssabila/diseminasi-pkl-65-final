import React, { useRef, useState, useEffect, useCallback } from 'react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from '@gsap/react';
import './NadiaViews.css';

// View 4 Assets
import imgSumatera from '../assets/images/view-4/ws1-nadia-sumatera-v4.png';
import imgPoint from '../assets/images/view-4/ws1-nadia-point-v4.png';

// View 0/Global Hero Asset
import imgHero from '../assets/images/view-0/ws1-hero.webp';

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
    x: '25%', y: '20%',
    mhs: 270, pml: 29
  },
  { 
    id: 'sumut', name: 'Sumatera Utara', 
    x: '38%', y: '35%',
    mhs: 210, pml: 21
  },
  { 
    id: 'sumbar', name: 'Sumatera Barat', 
    x: '45%', y: '65%',
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

  // Parallax elements
  const photoRef = useRef(null);
  const titleGroupRef = useRef(null);
  const subGroupRef = useRef(null);
  const contentRef = useRef(null);
  const benangRef = useRef(null);

  const [scrambleTrigger, setScrambleTrigger] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setScrambleTrigger(true), 900);
    return () => clearTimeout(t);
  }, []);
  const headline1 = useTextScramble("Misi R3P", scrambleTrigger);
  const headline2 = useTextScramble("2026", scrambleTrigger);


  useGSAP(() => {
    // Scroll progress implementations for hero image opacity & scale
    // and content Y movement
    gsap.to(photoRef.current, {
      scale: 1.1,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "start start",
        end: "end start",
        scrub: true,
      }
    });

    gsap.to(contentRef.current, {
      yPercent: 28, // mapping from 0% to 28%
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "start start",
        end: "end start",
        scrub: true,
      }
    });

    // Animate path stroke (benang)
    if (benangRef.current) {
      const benangLen = benangRef.current.getTotalLength();
      gsap.set(benangRef.current, { strokeDasharray: benangLen, strokeDashoffset: benangLen });
      
      gsap.to(benangRef.current, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "start start",
          end: "end 10%",
          scrub: true,
        }
      });
    }

    // QuickTo for mouse parallax
    // mouseX and mouseY from -1 to 1 mapped to pixels
    const photoX = gsap.quickTo(photoRef.current, "x", { duration: 0.5, ease: "power3" });
    const photoY = gsap.quickTo(photoRef.current, "y", { duration: 0.5, ease: "power3" });
    
    const titleX = gsap.quickTo(titleGroupRef.current, "x", { duration: 0.6, ease: "power3" });
    const titleY = gsap.quickTo(titleGroupRef.current, "y", { duration: 0.6, ease: "power3" });
    
    const subX = gsap.quickTo(subGroupRef.current, "x", { duration: 0.4, ease: "power3" });
    const subY = gsap.quickTo(subGroupRef.current, "y", { duration: 0.4, ease: "power3" });

    const handleMouseMove = (e) => {
      // Mapping to -1 to 1 ranges
      const mX = (e.clientX / window.innerWidth - 0.5) * 2;
      const mY = (e.clientY / window.innerHeight - 0.5) * 2;

      // Applying multipliers
      photoX(mX * 12);
      photoY(mY * 8);

      titleX(mX * -20);
      titleY(mY * -14);

      subX(mX * -9);
      subY(mY * -6);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Initial entrance animations
    const tl = gsap.timeline();
    tl.to(".gsap-fade-badge", { opacity: 1, y: 0, duration: 0.9, delay: 0.5, ease: "power3.out" }, 0)
      .to(".gsap-fade-headline", { opacity: 1, y: 0, duration: 1.1, delay: 0.8, ease: "power3.out" }, 0)
      .to(".gsap-fade-subline", { opacity: 1, y: 0, duration: 1.0, delay: 1.1, ease: "power3.out" }, 0)
      .to(".gsap-fade-desc", { opacity: 1, duration: 0.8, delay: 1.5 }, 0)
      .to(".gsap-fade-chip", { opacity: 1, y: 0, duration: 0.65, stagger: 0.09, delay: 1.8, ease: "power3.out" }, 0)
      .to(".gsap-scroll-cue", { opacity: 1, y: 0, duration: 0.9, delay: 2.3, ease: "power3.out" }, 0)
      .to(".gsap-cover-caption", { opacity: 1, duration: 1.2, delay: 2.5 }, 0);
      
    // Looping animations
    gsap.to(".gsap-scroll-ring", {
      rotate: 360,
      duration: 16,
      ease: "linear",
      repeat: -1,
      transformOrigin: "center"
    });

    gsap.to(".gsap-scroll-wheel", {
      y: 6,
      opacity: 0.3,
      duration: 1.7,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut"
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };

  }, { scope: containerRef });

  return (
    <section className="webstory-view ws1-nadia-view0" ref={containerRef} id="cover">
      <div className="j-cover-photo" ref={photoRef}>
        <img src={imgHero} alt="Tim R3P 2026" />
      </div>
      <div className="j-cover-overlay-grad" />
      <div className="j-cover-overlay-vig" />
      <GrainOverlay />
      
      <div className="j-cover-content" ref={contentRef}>

        <div ref={titleGroupRef}>
          <h1 className="j-cover-headline gsap-fade-headline gsap-hidden-up">
            {headline1}<br />
            <span className="j-cover-hl-accent">{headline2}</span>
          </h1>
        </div>
        <div ref={subGroupRef}>
          <p className="j-cover-subline gsap-fade-subline gsap-hidden-up">Sebuah Perjalanan Kemanusiaan</p>
          <p className="j-cover-descriptor gsap-fade-desc gsap-hidden">RENCANA REHABILITASI REKONSTRUKSI PASCABENCANA SUMATERA</p>
        </div>
      </div>
      
      <div className="j-benang-wrap" aria-hidden="true">
        <svg viewBox="0 0 24 120" className="j-benang-svg" overflow="visible">
          <defs>
            <filter id="bGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path d="M12,0 C12,30 4,45 8,65 C12,85 20,95 12,120" stroke="rgba(230,126,34,0.2)" strokeWidth="1.5" fill="none" />
          <path d="M12,0 C12,30 4,45 8,65 C12,85 20,95 12,120" stroke="#E67E22" strokeWidth="2" fill="none" strokeLinecap="round" style={{ filter: "url(#bGlow)" }} ref={benangRef} />
          <circle r="4" fill="#E67E22" filter="url(#bGlow)">
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M12,0 C12,30 4,45 8,65 C12,85 20,95 12,120" />
          </circle>
        </svg>
      </div>
      
      <RotatingScrollCue />
      
      <div className="j-cover-caption gsap-cover-caption gsap-hidden">
        Angkatan 65 · 14 Jan – 2 Feb 2026 · Sumatera
      </div>
    </section>
  );
};



// ─── Briefing image stack photos (Unsplash) ──────────────────
const briefingPhotos = [
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&fit=crop',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&fit=crop',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&fit=crop',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&fit=crop',
];

export const View4 = () => {
  const sectionRef    = useRef(null);
  const heroRef       = useRef(null);
  const mapRef        = useRef(null);
  const briefingRef   = useRef(null);
  const [activeProvince, setActiveProvince] = useState(null);

  useGSAP(() => {
    // ── 1. HERO: Teks masuk dari bawah ─────────────────────────
    gsap.fromTo('.v4-hero-eyebrow', { opacity: 0, y: 24 }, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: heroRef.current, start: 'top 80%', toggleActions: 'play none none none' },
    });
    gsap.fromTo('.v4-hero-title', { opacity: 0, y: 36 }, {
      opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: 0.15,
      scrollTrigger: { trigger: heroRef.current, start: 'top 78%', toggleActions: 'play none none none' },
    });
    gsap.fromTo('.v4-hero-desc', { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.35,
      scrollTrigger: { trigger: heroRef.current, start: 'top 75%', toggleActions: 'play none none none' },
    });
    // Parallax foto bg on scroll
    gsap.to('.v4-hero-bg img', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
    });

    // ── 2. PETA SUMATERA ───────────────────────────────────────
    // Heading fade in
    gsap.fromTo('.v4-map-heading', { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: mapRef.current, start: 'top 80%', toggleActions: 'play none none none' },
    });

    // Map reveal with clip-path
    gsap.fromTo('.v4-map-sumatera', 
      { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
      { 
        clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, 
        duration: 1.5, ease: 'power3.inOut',
        scrollTrigger: { trigger: mapRef.current, start: 'top 50%', toggleActions: 'play none none none' }
      }
    );

    // Pin pop-up stagger
    gsap.fromTo('.v4-loc-pin',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.25,
        scrollTrigger: { trigger: mapRef.current, start: 'top 40%', toggleActions: 'play none none none' }
      }
    );

    // ── 3. BRIEFING TERAKHIR: Interactive Card Stack ───────────────
    const briefCards = gsap.utils.toArray('.v4-brief-stack-card');
    const container = document.querySelector('.v4-briefing-stack-container');
    
    // stack array holds card indexes from FRONT (0) to BACK (last)
    let stack = [];
    for(let i = briefCards.length - 1; i >= 0; i--) stack.push(i);

    // Initial setup
    stack.forEach((cardIndex, stackPos) => {
      const card = briefCards[cardIndex];
      gsap.set(card, {
        y: stackPos * -30,       
        x: stackPos * 30,        
        scale: 1 - (stackPos * 0.05), 
        zIndex: briefCards.length - stackPos,           
        opacity: 0,              
      });
    });

    // Reveal animation
    gsap.to(briefCards, {
      opacity: (i) => {
        const stackPos = stack.indexOf(i);
        return 1 - (stackPos * 0.2); 
      },
      duration: 1,
      stagger: 0.15,
      ease: 'back.out(1.2)',
      scrollTrigger: {
        trigger: briefingRef.current,
        start: 'top 60%',
        toggleActions: 'play none none none',
      }
    });

    // Click handler to cycle cards
    const handleStackClick = () => {
      if (gsap.isTweening(briefCards[stack[0]])) return; // Prevent spam clicking

      const frontCardIndex = stack[0];
      const frontCard = briefCards[frontCardIndex];
      
      // 1. Animate front card flying away and fading out
      gsap.to(frontCard, {
        y: -150, 
        x: -50, 
        opacity: 0, 
        scale: 1.05, 
        duration: 0.4, 
        ease: 'power2.in',
        onComplete: () => {
          // Move front card to the back of the logic array
          stack.push(stack.shift());
          
          // Set it to a hidden position behind the stack so it can slide in
          const backPos = stack.length - 1;
          gsap.set(frontCard, { 
            y: backPos * -30 + 50, 
            x: backPos * 30 + 50, 
            scale: 1 - (backPos * 0.05), 
            zIndex: 0 
          });
          
          // Animate the former front card settling into the back
          gsap.to(frontCard, {
            y: backPos * -30,
            x: backPos * 30,
            opacity: 1 - (backPos * 0.2),
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
            y: stackPos * -30, 
            x: stackPos * 30, 
            scale: 1 - (stackPos * 0.05), 
            zIndex: briefCards.length - stackPos, 
            opacity: 1 - (stackPos * 0.2), 
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

  }, { scope: sectionRef });

  const briefingCardsData = [
    {
      region: "ACEH",
      pclCount: "275 PCL",
      date: "19 Jan 2026",
      title: "Instruksi Final",
      desc: "Kepala BPS Provinsi menyampaikan arahan teknis terakhir sebelum penerjunan. Standar wawancara, protokol entry data, dan prosedur verifikasi lapangan diulangi satu per satu.",
      locLabel: "📍 BPS PROVINSI ACEH",
      img: briefingPhotos[0]
    },
    {
      region: "SUMUT",
      pclCount: "210 PCL",
      date: "21 Jan 2026",
      title: "Koordinasi Lapangan",
      desc: "Memastikan kesiapan seluruh tim di lapangan dengan menyelaraskan SOP dan penanganan masalah teknis yang sering ditemui selama pendataan R3P.",
      locLabel: "📍 BPS PROVINSI SUMUT",
      img: briefingPhotos[1]
    },
    {
      region: "SUMBAR",
      pclCount: "30 PCL",
      date: "22 Jan 2026",
      title: "Review Kuesioner",
      desc: "Sesi tanya jawab mendalam mengenai konsep dan definisi operasional kuesioner R3P untuk meminimalisir kesalahan interpretasi data di lapangan.",
      locLabel: "📍 BPS PROVINSI SUMBAR",
      img: briefingPhotos[2]
    },
    {
      region: "PUSAT",
      pclCount: "510 MHS",
      date: "25 Jan 2026",
      title: "Pelepasan Bersama",
      desc: "Apel siaga dan pelepasan resmi seluruh mahasiswa PKL oleh pimpinan, mengobarkan semangat untuk mengumpulkan data yang akurat dan berkualitas.",
      locLabel: "📍 KAMPUS STIS",
      img: briefingPhotos[3] || briefingPhotos[0]
    }
  ];

  return (
    <section className="ws1-nadia-view4" ref={sectionRef}>

      {/* ── Section A: Hero "Tiga Provinsi Satu Semangat" ── */}
      <div className="v4-hero" ref={heroRef}>
        <div className="v4-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&fit=crop&crop=top"
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
            Sebanyak 510 mahasiswa Politeknik Statistika STIS dilepas untuk
            melaksanakan Pendataan R3P di Provinsi Aceh, Sumatera Utara,
            dan Sumatera Barat.
          </p>
        </div>
      </div>

      {/* ── Section B: Peta Sumatera & Alokasi (Stand Out Layout) ── */}
      <div className="v4-map-section" ref={mapRef}>
        <h3 className="v4-map-heading v4-anim-fade">Peta Alokasi Petugas</h3>
        
        <div className="v4-map-layout-standout">
          <div className="v4-map-wrapper">
            <img src={imgSumatera} className="v4-map-sumatera" alt="Peta Sumatera" />
            
            {PROVINCES.map((prov, i) => (
              <div 
                key={prov.id} 
                className="v4-map-loc"
                style={{ left: prov.x, top: prov.y }}
                onMouseEnter={() => setActiveProvince(i)}
                onMouseLeave={() => setActiveProvince(null)}
                onClick={() => setActiveProvince(activeProvince === i ? null : i)}
              >
                <img src={imgPoint} className="v4-loc-pin" alt="Pin" />
                
                {/* Tooltip Hover Info */}
                <div className={`v4-alloc-tooltip tooltip-${prov.id} ${activeProvince === i ? 'active' : ''}`}>
                  <h4>{prov.name}</h4>
                  <div className="v4-tooltip-stats">
                    <p><span>{prov.mhs}</span> Mahasiswa</p>
                    <p className="v4-pml-text"><span>{prov.pml}</span> PML</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section C: Briefing Terakhir — Card Stack ── */}
      <div className="v4-briefing-section" ref={briefingRef}>
        <div className="v4-briefing-header">
          <h3 className="v4-briefing-title">Briefing <em>Terakhir</em></h3>
          <p className="v4-briefing-subtitle">
            Satu meja, tiga provinsi, satu standar - sebelum kaki melangkah ke lapangan
          </p>
        </div>
        
        <div className="v4-briefing-stack-container">
          {briefingCardsData.map((card, i) => (
            <div key={i} className="v4-brief-stack-card">
              <div className="v4-bsc-left">
                <img src={card.img} alt={card.title} />
                <div className="v4-bsc-loc-overlay">
                  <span className="v4-bsc-loc-icon">📍</span> {card.locLabel}
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
      </div>

    </section>
  );
};

export const View9 = () => {
  const closingRef = useRef(null);

  useGSAP(() => {
    // Kicker fade in
    gsap.fromTo('.v9-kicker', { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: closingRef.current, start: 'top 70%', toggleActions: 'play none none none' },
    });
    // Headline reveal
    gsap.fromTo('.v9-headline', { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2,
      scrollTrigger: { trigger: closingRef.current, start: 'top 65%', toggleActions: 'play none none none' },
    });
    // Closing paragraph
    gsap.fromTo('.v9-closing-text', { opacity: 0 }, {
      opacity: 1, duration: 1, delay: 0.5,
      scrollTrigger: { trigger: closingRef.current, start: 'top 60%', toggleActions: 'play none none none' },
    });
    // Decorative line grow
    gsap.fromTo('.v9-line', { scaleX: 0 }, {
      scaleX: 1, duration: 1.2, ease: 'power3.inOut', delay: 0.3,
      scrollTrigger: { trigger: closingRef.current, start: 'top 60%', toggleActions: 'play none none none' },
    });
    // Stats counter fade in stagger
    gsap.fromTo('.v9-stat', { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out', delay: 0.6,
      scrollTrigger: { trigger: closingRef.current, start: 'top 55%', toggleActions: 'play none none none' },
    });
    // Footer credits
    gsap.fromTo('.v9-credits', { opacity: 0 }, {
      opacity: 1, duration: 1.5, delay: 1,
      scrollTrigger: { trigger: closingRef.current, start: 'top 50%', toggleActions: 'play none none none' },
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
          510 mahasiswa. 3 provinsi. 15 kabupaten/kota.<br />
          Dari mengetuk pintu hingga merekam harapan — sebuah misi kemanusiaan
          yang tak akan terlupakan.
        </p>

        <div className="v9-stats-row">
          <div className="v9-stat">
            <span className="v9-stat-num">510</span>
            <span className="v9-stat-label">Mahasiswa</span>
          </div>
          <div className="v9-stat">
            <span className="v9-stat-num">3</span>
            <span className="v9-stat-label">Provinsi</span>
          </div>
          <div className="v9-stat">
            <span className="v9-stat-num">15</span>
            <span className="v9-stat-label">Kabupaten/Kota</span>
          </div>
          <div className="v9-stat">
            <span className="v9-stat-num">52</span>
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
