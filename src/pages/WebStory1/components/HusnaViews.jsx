import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {  animateView7 } from '../animations';
import './HusnaViews.css';

gsap.registerPlugin(ScrollTrigger);

export const View5 = () => {
  return (
    <section className="webstory-view view-6">
      <h2>View 5 (Melawan Medan) - Husna</h2>
      {/* TODO */}
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 7
// ═══════════════════════════════════════════════════════════════════════════════

// 1. Data
const PROVINSI_DATA = [
  {
    id: "v7b1",
    name: "Aceh",
    img: "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?q=80&w=1000", 
    kicker: "Tantangan",
    heading: "Melawan",
    headingAccent: "Medan",
    body: "Hujan deras, jalan berlumpur, sinyal hilang — bukan halangan.\nKetika medan menguji, semangat menjawab.",
    quote: '"Kami bukan turis. Kami enumerator. Dan data ini penting."',
  },
  {
    id: "v7b2",
    name: "Sumatera Utara",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000",
    kicker: "Lapangan",
    heading: "Setiap",
    headingAccent: "Langkah",
    body: "Motor menembus kabut pagi, catatan basah tapi data tetap akurat.\nIntegritas tidak menyerah pada medan.",
    quote: '"Tidak ada jarak yang terlalu jauh untuk satu formulir yang benar."',
  },
  {
    id: "v7b3",
    name: "Sumatera Barat",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000",
    kicker: "Dedikasi",
    heading: "Tetap",
    headingAccent: "Bergerak",
    body: "21 hari, ratusan desa, ribuan wawancara.\nKami pulang membawa data yang layak diperjuangkan.",
    quote: '"Data ini bukan sekadar angka — ini suara mereka yang kami sampaikan."',
  },
];

// 2. Komponen Utama View 7
export const View7 = () => {
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(0);

  // Implementasi GSAP terisolasi
  useGSAP(() => {
    animateView7(containerRef);
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="ws1-husna-view-7-accordion" id="field">
      <div className="ws1-husna-v7-accordion-header">
        <span className="ws1-husna-kicker ws1-husna-kicker-green lato-regular">Tahap 7 · Tantangan</span>
        <h2 className="ws1-husna-headline ws1-husna-headline-navy">Melawan
          <em> Medan</em> {/* Otomatis hijau sesuai CSS headline */}
        </h2>
      </div>

      <div className="ws1-husna-accordion-container">
        {PROVINSI_DATA.map((prov, i) => {
          const isActive = hovered === i;

          return (
            <motion.div
              key={prov.id}
              className={`ws1-husna-accordion-panel ${isActive ? 'is-active' : ''}`}
              onMouseEnter={() => setHovered(i)}
              animate={{ 
                flex: isActive ? 2.5 : 1,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
            
              <div 
                className="ws1-husna-panel-bg" 
                style={{ backgroundImage: `url(${prov.img})` }} 
              />
              
              <div className="ws1-husna-panel-overlay" />

              <AnimatePresence>
                {!isActive && (
                  <motion.div 
                    key="collapsed-name"
                    className="ws1-husna-panel-name-vertical"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                  >
                    {prov.name}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="ws1-husna-panel-content">
                {isActive && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <blockquote className="ws1-husna-panel-quote">{prov.body}</blockquote>
                  </motion.div>
                )}
              </div>    
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};