import React, { useRef } from 'react';
import './Opening.css';

/**
 * Section 1 — Peta Indonesia, zoom Sumatera, judul slide-up
 */
export default function Opening() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} id="section1-opening" className="section section-opening">
      {/* TODO: isi layout section ini */}
      <p style={{ color: 'var(--off-white)', textAlign: 'center' }}>
        Section 1: Opening
      </p>
    </section>
  );
}
