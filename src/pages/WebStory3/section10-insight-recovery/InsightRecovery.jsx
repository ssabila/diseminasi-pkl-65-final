import React, { useRef } from 'react';
import './InsightRecovery.css';

/**
 * Section 10 — Jejak Pemulihan / NDVI — Modul 8
 */
export default function InsightRecovery() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} id="section10-insightrecovery" className="section section-insightrecovery">
      <p style={{ color: 'var(--off-white)', textAlign: 'center' }}>
        Section 10: InsightRecovery
      </p>
    </section>
  );
}
