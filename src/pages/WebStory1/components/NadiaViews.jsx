import React, { useRef, useState, useEffect } from 'react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from '@gsap/react';
import './NadiaViews.css';

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

  const meta = [
    { n: "510", l: "Mahasiswa" },
    { n: "3", l: "Provinsi" },
    { n: "21", l: "Hari Lapangan" },
    { n: "57", l: "PML" },
  ];

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
        <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1800&fit=crop&crop=faces" alt="Tim R3P 2026" />
      </div>
      <div className="j-cover-overlay-grad" />
      <div className="j-cover-overlay-vig" />
      <GrainOverlay />
      
      <div className="j-cover-content" ref={contentRef}>
        <div className="j-cover-badge-row gsap-fade-badge gsap-hidden-up">
          <span className="j-badge">PKL POLSTAT STIS</span>
          <span className="j-badge-sep">·</span>
          <span className="j-badge">Angkatan 65</span>
        </div>
        <div ref={titleGroupRef}>
          <h1 className="j-cover-headline gsap-fade-headline gsap-hidden-up">
            {headline1}<br />
            <span className="j-cover-hl-accent">{headline2}</span>
          </h1>
        </div>
        <div ref={subGroupRef}>
          <p className="j-cover-subline gsap-fade-subline gsap-hidden-up">Sebuah Perjalanan</p>
          <p className="j-cover-descriptor gsap-fade-desc gsap-hidden">Pendataan Regsosek · Rehabilitasi · Rekonstruksi Pasca Bencana</p>
        </div>
        <div className="j-cover-meta">
          {meta.map((m, i) => (
            <div key={i} className="j-cover-chip gsap-fade-chip gsap-hidden-up">
              <span className="j-chip-num">{m.n}</span>
              <span className="j-chip-label">{m.l}</span>
            </div>
          ))}
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

export const View4 = () => {
  return (
    <section className="webstory-view ws1-nadia-view4">
      <h2>View 4 (Deployment) - Nadia</h2>
      {/* TODO: Add deployment content and animations here */}
    </section>
  );
};

export const View9 = () => {
  return (
    <section className="webstory-view ws1-nadia-view9">
      <h2>View 9 (Closing Visual) - Nadia</h2>
      {/* TODO: Add closing visual content and animations here */}
    </section>
  );
};
