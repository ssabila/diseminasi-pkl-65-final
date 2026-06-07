import React, { useRef } from 'react';
import './BigDataAnswers.css';

/**
 * Section 3 — 5 pertanyaan Big Data + layer map scroll
 */
export default function BigDataAnswers() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} id="section3-bigdataanswers" className="section section-bigdataanswers">
      {/* TODO: isi layout section ini */}
      <p style={{ color: 'var(--off-white)', textAlign: 'center' }}>
        Section 3: BigDataAnswers
      </p>
    </section>
  );
}
