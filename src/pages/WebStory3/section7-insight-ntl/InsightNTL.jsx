import React, { useRef } from 'react';
import './InsightNTL.css';

/**
 * Section 7 — Saat Cahaya Meredup — Modul 4 & 5
 */
export default function InsightNTL() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} id="section7-insightntl" className="section section-insightntl">
      {/* TODO: isi layout section ini */}
      <p style={{ color: 'var(--off-white)', textAlign: 'center' }}>
        Section 7: InsightNTL
      </p>
    </section>
  );
}
