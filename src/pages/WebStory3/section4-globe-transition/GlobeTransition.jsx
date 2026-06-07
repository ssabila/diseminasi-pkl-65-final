import React, { useRef } from 'react';
import './GlobeTransition.css';

/**
 * Section 4 — Globe + satelit → flyTo Sumatera
 */
export default function GlobeTransition() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} id="section4-globetransition" className="section section-globetransition">
      {/* TODO: isi layout section ini */}
      <p style={{ color: 'var(--off-white)', textAlign: 'center' }}>
        Section 4: GlobeTransition
      </p>
    </section>
  );
}
