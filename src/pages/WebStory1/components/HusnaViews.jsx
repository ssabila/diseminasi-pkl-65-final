import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { animateView5, animateView7 } from '../animations'; 

import './HusnaViews.css';

import imgAceh from '../assets/images/husna-view-7/ws1-husna-view7-aceh.webp';
import imgSumut from '../assets/images/husna-view-7/ws1-husna-view7-sumut.webp';
import imgSumbar from '../assets/images/husna-view-7/ws1-husna-view7-sumbar.webp';

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
// VIEW 7 DATA 
// ═══════════════════════════════════════════════════════════════════════════════

const PROVINSI_DATA = [
  {
    id: "v7b1",
    name: "Aceh",
    img: imgAceh, 
    kicker: "Tantangan",
    heading: "Melawan",
    headingAccent: "Medan",
    body: "Sulitnya mengakses wilayah terdampak akibat rusaknya infrastruktur tidak menghalangi pelaksanaan proses pendataan R3P.",
  },
  {
    id: "v7b2",
    name: "Sumatera Utara",
    img: imgSumut,
    kicker: "Lapangan",
    heading: "Setiap",
    headingAccent: "Langkah",
    body: "Perjalanan panjang menuju lokasi bencana tidak menyurutkan komitmen dan semangat tim pendata.",
  },
  {
    id: "v7b3",
    name: "Sumatera Barat",
    img: imgSumbar,
    kicker: "Dedikasi",
    heading: "Tetap",
    headingAccent: "Bergerak",
    body: "Medan geografis yang terjal dan ekstrem harus dilalui demi keakuratan dan kelengkapan data.",
  },
];

// 2. Komponen Utama 
export const View7 = () => {
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(0);

  // Implementasi GSAP 
  useGSAP(() => {
    animateView7(containerRef);
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="ws1-husna-view-7-accordion" id="field">
      <div className="ws1-husna-v7-accordion-header">
        <h2 className="ws1-husna-headline ws1-husna-headline-navy">Melawan
          <em className="ws1-text-orange"> Medan</em> 
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
              animate={{ flex: isActive ? 2.5 : 1 }}
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