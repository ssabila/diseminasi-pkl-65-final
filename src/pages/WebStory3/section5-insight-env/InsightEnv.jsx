import React, { useRef } from 'react';
import './InsightEnv.css';

/**
 * Section 5 — Membaca Bahasa Alam — Modul 1 & 2
 */
export default function InsightEnv() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} id="section5-insightenv" className="section section-insightenv">
      {/* TODO: isi layout section ini */}
      <p style={{ color: 'var(--off-white)', textAlign: 'center' }}>
        Section 5: InsightEnv
      </p>
    </section>
  );
}
