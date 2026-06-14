import React, { useRef } from 'react';
import './Urgency.css';

// Import Stack component
import Stack from '../components/Stack';

// Import assets
import baseLayer from './assets/base-layer.png';
import ndviImg from './assets/NDVI.webp';
import ndbiImg from './assets/NDBI.webp';
import ndwiImg from './assets/NDWI.webp';
import lstImg from './assets/LST.webp';
import coImg from './assets/CO.webp';
import so2Img from './assets/SO2.webp';

import h1 from '../../../assets/images/huntara-15.webp';
import h2 from '../../../assets/images/huntara-16.webp';
import h3 from '../../../assets/images/huntara-18.webp';
import h4 from '../../../assets/images/huntara-13.webp';

/**
 * Section 2 — Mengapa Big Data?
 */
export default function Urgency() {
  const sectionRef = useRef(null);

  const stackImages = [
    { src: baseLayer, alt: "Base Layer", className: "layer-base" },
    { src: ndviImg, alt: "NDVI", className: "layer-ndvi" },
    { src: ndbiImg, alt: "NDBI", className: "layer-ndbi" },
    { src: ndwiImg, alt: "NDWI", className: "layer-ndwi" },
    { src: lstImg, alt: "LST", className: "layer-lst" },
    { src: coImg, alt: "CO", className: "layer-co" },
    { src: so2Img, alt: "SO2", className: "layer-so2" },
  ];

  const photoStackCards = [h1, h2, h3, h4];

  return (
    <section ref={sectionRef} id="section2-urgency" className="section section-urgency">
      <div className="urgency-content">

        {/* Kiri: Teks */}
        <div className="urgency-text-container">
          <h1 className="urgency-title">
            Mengapa Big Data?
          </h1>
          <p>Saat bencana terjadi, informasi harus tersedia dengan cepat. Data lapangan tetap penting, tetapi membutuhkan waktu dan jangkauan yang terbatas.</p>
          <p><span style={{ fontWeight: '600', color: '#e67e22' }}><b>Big Data</b></span> membantu melengkapi informasi tersebut melalui citra satelit dan berbagai data geospasial yang dapat menggambarkan kondisi suatu wilayah secara lebih luas dan berkelanjutan.</p>

          <div style={{ width: '220px', height: '220px', margin: '0rem auto 0rem auto', zIndex: 10 }}>
            <Stack
              randomRotation={true}
              sensitivity={180}
              sendToBackOnClick={true}
              cards={photoStackCards.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`card-${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ))}
            />
          </div>


        </div>

        {/* Kanan: Stack Gambar */}
        <div className="urgency-stack-container">
          {stackImages.map((img, idx) => (
            <img
              key={idx}
              src={img.src}
              alt={img.alt}
              className={`stack-layer ${img.className}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Prompt ditaruh di luar agar bisa persis di tengah halaman bawah */}
      <div className="urgency-scroll-wrapper">
        <div className="urgency-scroll">
          <p>Lalu, <span style={{ fontWeight: '600', color: '#e67e22' }}><b>apa yang bisa kita pelajari</b></span> dari data-data tersebut?</p>
          <div className="scroll-arrow">↓</div>
        </div>
      </div>
    </section>
  );
}
