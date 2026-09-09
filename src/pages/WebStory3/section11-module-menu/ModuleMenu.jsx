import React, { useRef } from 'react';
import './ModuleMenu.css';

/**
 * Section 11 — Slider Overview 8 Modul
 */
export default function ModuleMenu() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} id="section11-modulemenu" className="section section-modulemenu">
      {/* TODO: isi layout section ini */}
      <p style={{ color: 'var(--off-white)', textAlign: 'center' }}>
        Section 11: ModuleMenu
      </p>
    </section>
  );
}
