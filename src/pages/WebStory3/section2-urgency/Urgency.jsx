import React, { useRef } from 'react';
import './Urgency.css';

/**
 * Section 2 — Mengapa Big Data? — layout split kiri-kanan
 */
export default function Urgency() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} id="section2-urgency" className="section section-urgency">
      {/* TODO: isi layout section ini */}
      <p style={{ color: 'var(--off-white)', textAlign: 'center' }}>
        Section 2: Urgency
      </p>
    </section>
  );
}
