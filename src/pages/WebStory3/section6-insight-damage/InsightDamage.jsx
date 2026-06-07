import React, { useRef } from 'react';
import './InsightDamage.css';

/**
 * Section 6 — Seberapa Luas Dampaknya? — Modul 3
 */
export default function InsightDamage() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} id="section6-insightdamage" className="section section-insightdamage">
      {/* TODO: isi layout section ini */}
      <p style={{ color: 'var(--off-white)', textAlign: 'center' }}>
        Section 6: InsightDamage
      </p>
    </section>
  );
}
