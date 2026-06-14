import React, { useRef } from 'react';
import './GlobeTransition.css';

/**
 * Section 4 — Globe + satelit → flyTo Sumatera
 */
export default function GlobeTransition() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} id="section4-globetransition" className="section section-globetransition">
      <div className="globetransition-content-area">
        <div className="globetransition-panel-pinned">
          
          <div className="globe-card globe-card-1">
            <span className="globe-badge">&#10033; NARASI 1</span>
            <p className="globe-narrative">
              Saat bencana terjadi, kondisi suatu wilayah dapat berubah dengan cepat. Citra satelit membantu merekam perubahan tersebut secara berkala dan dalam cakupan yang luas.
            </p>
          </div>

          <div className="globe-card globe-card-2">
            <span className="globe-badge">&#10033; NARASI 2</span>
            <h2 className="globe-title">Melihat Wilayah dari<br/>Perspektif yang Lebih Luas</h2>
            <p className="globe-narrative">
              Melalui berbagai sumber data geospasial, kita dapat mengamati kondisi lingkungan, aktivitas manusia, hingga perubahan wilayah tanpa harus berada langsung di lokasi.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
