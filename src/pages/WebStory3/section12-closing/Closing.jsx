import React, { useRef, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import './Closing.css';

// 6 asset foto dokumentasi huntara untuk penutup
import huntara05 from '../../../assets/images/huntara-05.webp';
import huntara06 from '../../../assets/images/huntara-06.webp';
import huntara09 from '../../../assets/images/huntara-09.webp';
import huntara18 from '../../../assets/images/huntara-18.webp';
import huntara19 from '../../../assets/images/huntara-19.webp';
import huntara20 from '../../../assets/images/huntara-20.webp';

gsap.registerPlugin(ScrollTrigger);

/**
 * Scattered photo layout (6 photos).
 * Each slot has: position (left, top), width, aspect ratio, rotation, z-index, and source image.
 */
const PHOTOS = [
  {
    id: 1,
    src: huntara05,
    left: '3%',
    top: '5%',
    width: 250,
    aspectRatio: '16 / 10',
    z: 2,
    rotate: -6,
    label: 'Dokumentasi Huntara 05',
  },
  {
    id: 2,
    src: huntara06,
    left: '34%',
    top: '-2%',
    width: 285,
    aspectRatio: '4 / 3',
    z: 4,
    rotate: 3,
    label: 'Dokumentasi Huntara 06',
  },
  {
    id: 3,
    src: huntara09,
    left: '68%',
    top: '4%',
    width: 255,
    aspectRatio: '16 / 10',
    z: 3,
    rotate: -4,
    label: 'Dokumentasi Huntara 09',
  },
  {
    id: 4,
    src: huntara18,
    left: '5%',
    top: '49%',
    width: 250,
    aspectRatio: '4 / 3',
    z: 2,
    rotate: 5,
    label: 'Dokumentasi Huntara 18',
  },
  {
    id: 5,
    src: huntara19,
    left: '36%',
    top: '48%',
    width: 275,
    aspectRatio: '4 / 3',
    z: 3,
    rotate: -3,
    label: 'Dokumentasi Huntara 19',
  },
  {
    id: 6,
    src: huntara20,
    left: '69%',
    top: '43%',
    width: 230,
    aspectRatio: '3 / 4',
    z: 2,
    rotate: 6,
    label: 'Dokumentasi Huntara 20',
  },
];

/**
 * Section 12 — Closing
 *
 * Two phases (matching reference design at webstorydesign.lovable.app):
 * 1. Scattered photo collage with hover glow + white ring spotlight
 * 2. Quote heading + paragraph + attribution (scroll reveal)
 *
 * Smooth transition from Section 11 (ModuleMenu) via scroll-triggered reveal.
 */
export default function Closing() {
  const sectionRef = useRef(null);
  const photosContainerRef = useRef(null);
  const quoteContainerRef = useRef(null);
  const photoCardsRef = useRef([]);
  const backBtnRef = useRef(null);

  /**
   * Hover handler: moves the radial highlight to follow the cursor
   * within each photo card, creating a dynamic spotlight effect.
   */
  const handleMouseMove = useCallback((e, index) => {
    const card = photoCardsRef.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--glow-x', `${x}%`);
    card.style.setProperty('--glow-y', `${y}%`);
  }, []);

  useGSAP(() => {
    const s = sectionRef.current;
    if (!s) return;

    const photosEl = photosContainerRef.current;
    const quoteEl = quoteContainerRef.current;
    const cards = photoCardsRef.current.filter(Boolean);

    /* ── Initial states ── */
    gsap.set(photosEl, { opacity: 0, scale: 0.88, y: 50 });
    gsap.set(quoteEl, { opacity: 0, y: 80 });

    // Stagger each photo card's initial state
    cards.forEach((card, i) => {
      const rot = PHOTOS[i]?.rotate || 0;
      gsap.set(card, {
        opacity: 0,
        y: 40 + i * 10,
        scale: 0.9,
        rotation: rot,
      });
    });

    /* ── Master scroll-driven timeline ── */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: s,
        start: 'top top',
        end: '+=350%',
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
        // When the user scrolls past the pin, collapse the section so it
        // doesn't reappear in normal document flow (which would look like
        // a duplicate closing section).
        onLeave: () => {
          gsap.set(s, { height: 0, minHeight: 0, overflow: 'hidden', padding: 0, margin: 0 });
        },
        // Restore when scrolling back up
        onEnterBack: () => {
          gsap.set(s, { clearProps: 'height,minHeight,overflow,padding,margin' });
        },
      },
    });

    /*
     * Phase 1: Photo collage appears (scroll reveal)
     * — Container fades in, then each card staggers in
     */
    tl.to(photosEl, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.12,
      ease: 'power2.out',
    }, 0.02);

    // Stagger individual cards
    cards.forEach((card, i) => {
      const rot = PHOTOS[i]?.rotate || 0;
      tl.to(card, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: rot,
        duration: 0.08,
        ease: 'power2.out',
      }, 0.04 + i * 0.015);
    });

    // Hold photos for viewing
    tl.to({}, { duration: 0.25 });

    /*
     * Phase 2: Photos fade out upward, quote fades in
     */
    tl.to(photosEl, {
      opacity: 0,
      y: -60,
      scale: 0.92,
      duration: 0.15,
      ease: 'power2.in',
    });

    // Quote container enters
    tl.to(quoteEl, {
      opacity: 1,
      y: 0,
      duration: 0.18,
      ease: 'power2.out',
    }, '-=0.06');

    // Stagger text elements within the quote
    const quoteHeading = s.querySelector('.closing-quote-heading');
    const quotePara = s.querySelector('.closing-quote-paragraph');
    const quoteAttrib = s.querySelector('.closing-attribution');

    if (quoteHeading) {
      gsap.set(quoteHeading, { opacity: 0, y: 30 });
      tl.to(quoteHeading, {
        opacity: 1, y: 0, duration: 0.12, ease: 'power2.out',
      }, '-=0.12');
    }

    if (quotePara) {
      gsap.set(quotePara, { opacity: 0, y: 25 });
      tl.to(quotePara, {
        opacity: 1, y: 0, duration: 0.10, ease: 'power2.out',
      }, '-=0.06');
    }

    if (quoteAttrib) {
      gsap.set(quoteAttrib, { opacity: 0, y: 20 });
      tl.to(quoteAttrib, {
        opacity: 1, y: 0, duration: 0.08, ease: 'power2.out',
      }, '-=0.04');
    }

    // Back button fade in
    const backBtn = backBtnRef.current;
    if (backBtn) {
      gsap.set(backBtn, { opacity: 0, y: 15 });
      tl.to(backBtn, {
        opacity: 1, y: 0, duration: 0.08, ease: 'power2.out',
      }, '-=0.02');
    }

    // Hold quote + button on screen
    tl.to({}, { duration: 0.20 });

  }, []);

  return (
    <section
      ref={sectionRef}
      id="section12-closing"
      className="section section-closing"
    >
      {/* Starfield background */}
      <div className="starfield closing-starfield">
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            '--dur': `${2 + Math.random() * 4}s`,
            '--delay': `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* Ambient gradient glow */}
      <div className="closing-ambient" />

      {/* Subtle vignette */}
      <div className="closing-vignette" />

      {/* "Penutup" label */}
      <p className="closing-label">Penutup</p>

      {/* ═══ Phase 1: Scattered photo collage ═══ */}
      <div ref={photosContainerRef} className="closing-photos-container">
        <div className="closing-photos-scattered">
          {PHOTOS.map((photo, i) => (
            <div
              key={photo.id}
              ref={(el) => (photoCardsRef.current[i] = el)}
              className="closing-photo-card"
              onMouseMove={(e) => handleMouseMove(e, i)}
              style={{
                left: photo.left,
                top: photo.top,
                width: `${photo.width}px`,
                aspectRatio: photo.aspectRatio,
                zIndex: photo.z,
                '--card-rotate': `${photo.rotate}deg`,
              }}
            >
              {/* Photo image or placeholder */}
              <div className="closing-photo-img">
                {photo.src ? (
                  <img
                    src={photo.src}
                    alt={photo.label}
                    className="closing-photo-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="closing-photo-placeholder">
                    <span className="closing-photo-placeholder-label">
                      {photo.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Dynamic spotlight glow (follows cursor) */}
              <div className="closing-photo-glow" />

              {/* White border ring highlight */}
              <div className="closing-photo-ring" />

              {/* Corner shine accent */}
              <div className="closing-photo-shine" />
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Phase 2: Quote ═══ */}
      <div ref={quoteContainerRef} className="closing-quote-container">
        {/* Main heading — matching reference: "Safe doesn't mean Disconnected. It just means you can help." */}
        <h2 className="closing-quote-heading">
          <span className="cq-italic cq-white">Safe </span>
          <span className="cq-italic cq-dim">doesn't mean </span>
          <span className="cq-bold cq-white">Disconnected.</span>
          <br />
          <span className="cq-italic cq-dim">It just means </span>
          <span className="cq-italic cq-accent">you can help.</span>
        </h2>

        {/* Paragraph — matching reference design */}
        <p className="closing-quote-paragraph">
          Koneksi yang aman tak pernah membangun sekat, tetapi menjadi jembatan
          bagi empati yang lebih dalam. Di sinilah kepedulian kita bergerak:
          mendekatkan hati yang jauh, mengubah data menjadi cerita, dan
          memungkinkan kita membantu dengan tulus.
        </p>

        {/* Attribution line */}
        <p className="closing-attribution">
          Webstory R3P · PKL 65 · Aceh, Sumut, Sumbar
        </p>

        {/* Tombol Kembali ke Landing Page */}
        <Link
          ref={backBtnRef}
          to="/"
          className="closing-back-btn"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16" height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          <span>Kembali ke Landing Page</span>
        </Link>
      </div>
    </section>
  );
}
