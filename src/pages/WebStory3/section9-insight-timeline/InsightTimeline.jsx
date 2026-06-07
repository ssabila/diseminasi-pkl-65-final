import React, { useRef } from 'react';
import './InsightTimeline.css';

/**
 * Section 9 — Perjalanan Sebuah Bencana — Modul 7
 */
export default function InsightTimeline() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} id="section9-insighttimeline" className="section section-insighttimeline">
      {/* TODO: isi layout section ini */}
      <p style={{ color: 'var(--off-white)', textAlign: 'center' }}>
        Section 9: InsightTimeline
      </p>
    </section>
  );
}
