import React, { useRef } from 'react';
import './Opening.css';

/**
 * Section 1 — Opening (Text Overlay Only)
 */
export default function Opening() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} id="section1-opening" className="section section-opening">
      <div className="opening-text-container">
        <h2 className="opening-subtitle">Menakar Risiko, Memantau Pemulihan:</h2>
        <h1 className="opening-title">
          Menjejak Bencana Lewat Lensa Big Data
        </h1>
        <p className="opening-desc">
          ACEH &middot; SUMATERA UTARA &middot; SUMATERA BARAT
        </p>
      </div>
    </section>
  );
}