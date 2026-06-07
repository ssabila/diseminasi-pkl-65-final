import React, { useRef } from 'react';
import './Closing.css';

/**
 * Section 12 — Foto hover + quotes penutup
 */
export default function Closing() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} id="section12-closing" className="section section-closing">
      {/* TODO: isi layout section ini */}
      <p style={{ color: 'var(--off-white)', textAlign: 'center' }}>
        Section 12: Closing
      </p>
    </section>
  );
}
