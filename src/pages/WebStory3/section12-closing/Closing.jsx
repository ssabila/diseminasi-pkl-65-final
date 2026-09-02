import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Closing.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * Scattered photo layout — positioned manually with rotation, like reference design.
 * Each photo has: position (left, top), width, rotation, and z-index.
 * Replace gradient with actual <img> when photos are available.
 */
const PHOTOS = [
  { id: 1, gradient: 'linear-gradient(135deg, #1a365d, #3182ce)', left: '2%',  top: '6%',  width: 240, z: 2, rotate: -10, label: 'Tim Riset 3' },
  { id: 2, gradient: 'linear-gradient(135deg, #2d3748, #4a5568)', left: '26%', top: '0%',  width: 220, z: 3, rotate: 6,   label: 'Lapangan Aceh' },
  { id: 3, gradient: 'linear-gradient(135deg, #22543d, #48bb78)', left: '50%', top: '10%', width: 280, z: 2, rotate: -4,  label: 'Sumbar Survey' },
  { id: 4, gradient: 'linear-gradient(135deg, #553c9a, #805ad5)', left: '14%', top: '52%', width: 240, z: 2, rotate: 6,   label: 'PKL 65' },
  { id: 5, gradient: 'linear-gradient(135deg, #744210, #d69e2e)', left: '38%', top: '56%', width: 220, z: 3, rotate: -3,  label: 'Data Collection' },
  { id: 6, gradient: 'linear-gradient(135deg, #9b2c2c, #fc8181)', left: '58%', top: '54%', width: 230, z: 2, rotate: 4,   label: 'Tim Lengkap' },
  { id: 7, gradient: 'linear-gradient(135deg, #2b4c7e, #5b8fb9)', left: '76%', top: '50%', width: 220, z: 1, rotate: -8,  label: 'Dokumentasi' },
];

/**
 * Section 12 — Closing
 *
 * Two phases (matching reference design):
 * 1. Scattered photo collage with hover glow + white ring
 * 2. Heading quote + paragraph + attribution (scroll reveal)
 */
export default function Closing() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const s = sectionRef.current;
    if (!s) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: s,
        start: 'top top',
        end: '+=300%',
        scrub: 0.8,
        pin: true,
      },
    });

    // Phase 1: Scattered photo collage reveal
    const photoContainer = s.querySelector('.closing-photos-container');
    const photos = s.querySelectorAll('.closing-photo-card');
    if (photos.length > 0) {
      gsap.set(photoContainer, { opacity: 0, scale: 0.92 });
      tl.to(photoContainer, {
        opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out',
      }, 0.02);
    }

    // Phase 1.5: Hold photos
    tl.to({}, { duration: 0.2 });

    // Phase 2: Photos fade, quotes appear
    tl.to(photoContainer, {
      opacity: 0, y: -30, duration: 0.12, ease: 'power2.in',
    });

    // Quote heading
    const quoteContainer = s.querySelector('.closing-quote-container');
    gsap.set(quoteContainer, { opacity: 0, y: 60 });

    tl.to(quoteContainer, {
      opacity: 1, y: 0, duration: 0.15, ease: 'power2.out',
    }, '-=0.03');

    // Hold quote
    tl.to({}, { duration: 0.15 });

  }, []);

  return (
    <section ref={sectionRef} id="section12-closing" className="section section-closing">
      {/* Starfield */}
      <div className="starfield">
        {Array.from({ length: 25 }).map((_, i) => (
          <span key={i} className="star" style={{
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            '--dur': `${2 + Math.random() * 4}s`, '--delay': `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* Ambient glow */}
      <div className="closing-ambient" />

      {/* Label */}
      <p className="closing-label">Penutup</p>

      {/* Phase 1: Scattered photo collage (matching reference layout) */}
      <div className="closing-photos-container">
        <div className="closing-photos-scattered">
          {PHOTOS.map((photo) => (
            <div
              key={photo.id}
              className="closing-photo-card"
              style={{
                left: photo.left,
                top: photo.top,
                width: `${photo.width}px`,
                zIndex: photo.z,
                transform: `rotate(${photo.rotate}deg)`,
              }}
            >
              <div
                className="closing-photo-img"
                style={{ background: photo.gradient }}
              >
                <span className="closing-photo-text">{photo.label}</span>
              </div>
              {/* Hover glow (radial highlight, like reference) */}
              <div className="closing-photo-glow" />
              {/* Inner ring */}
              <div className="closing-photo-ring" />
            </div>
          ))}
        </div>
      </div>

      {/* Phase 2: Quote */}
      <div className="closing-quote-container">
        <h2 className="closing-quote-heading">
          <span className="cq-white">Koneksi</span>{' '}
          <span className="cq-dim">yang aman</span>{' '}
          <span className="cq-white">tak pernah membangun sekat.</span>
          <br />
          <span className="cq-dim">Ia menjadi</span>{' '}
          <span className="cq-ember">jembatan bagi empati.</span>
        </h2>

        <p className="closing-quote-paragraph">
          Koneksi yang aman tak pernah membangun sekat, tetapi menjadi jembatan bagi empati yang lebih dalam.
          Di sinilah kepedulian kita bergerak: mendekatkan hati yang jauh, mengubah data menjadi cerita,
          dan memungkinkan kita membantu dengan tulus.
        </p>

        <p className="closing-attribution">Webstory R3P · PKL 65 · Aceh, Sumut, Sumbar</p>
      </div>
    </section>
  );
}
