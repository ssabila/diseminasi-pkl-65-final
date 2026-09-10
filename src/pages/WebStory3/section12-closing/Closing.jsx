import React, { useRef, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Closing.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * Scattered photo layout — positioned to match reference design (6 photos).
 * Each slot has: position (left, top), width, rotation, z-index, and aspect ratio.
 *
 * The user will supply actual images. Until then we render placeholder boxes
 * with a label describing what photo goes where.
 *
 * PHOTO FILES NEEDED (place in ./assets/):
 *   1. photo1.jpg — "Tim riset lapangan / foto bersama" (left-bottom area)
 *   2. photo2.jpg — "Foto bersama besar / grup PKL" (top-center area)
 *   3. photo3.jpg — "Wawancara warga / pendataan" (right-top area)
 *   4. photo4.jpg — "Kondisi lapangan / reruntuhan bencana" (left-bottom row)
 *   5. photo5.jpg — "Mahasiswa survei / pendataan lapangan" (center-bottom row)
 *   6. photo6.jpg — "Wawancara di teras / interaksi warga" (right-bottom row)
 */
const PHOTOS = [
  {
    id: 1,
    src: null, // will be replaced with: new URL('./assets/photo1.jpg', import.meta.url).href
    left: '3%',
    top: '8%',
    width: 220,
    z: 2,
    rotate: -8,
    label: 'Tim Riset Lapangan',
  },
  {
    id: 2,
    src: null,
    left: '28%',
    top: '-2%',
    width: 260,
    z: 4,
    rotate: 4,
    label: 'Foto Bersama Grup',
  },
  {
    id: 3,
    src: null,
    left: '56%',
    top: '5%',
    width: 250,
    z: 3,
    rotate: -3,
    label: 'Wawancara Warga',
  },
  {
    id: 4,
    src: null,
    left: '8%',
    top: '50%',
    width: 210,
    z: 2,
    rotate: 5,
    label: 'Kondisi Bencana',
  },
  {
    id: 5,
    src: null,
    left: '32%',
    top: '52%',
    width: 230,
    z: 3,
    rotate: -2,
    label: 'Pendataan Lapangan',
  },
  {
    id: 6,
    src: null,
    left: '56%',
    top: '48%',
    width: 240,
    z: 2,
    rotate: 6,
    label: 'Interaksi Warga',
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
      gsap.set(card, {
        opacity: 0,
        y: 40 + i * 10,
        scale: 0.9,
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
      tl.to(card, {
        opacity: 1,
        y: 0,
        scale: 1,
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

    // Hold quote on screen
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
      </div>
    </section>
  );
}
