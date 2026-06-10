import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { animateView5, animateView7 } from '../animations';
import './HusnaViews.css';

import imgAceh1 from '../assets/images/husna-view-5/ws1-husna-view5-aceh1.webp';
import imgAceh2 from '../assets/images/husna-view-5/ws1-husna-view5-aceh2.webp';
import imgAceh3 from '../assets/images/husna-view-5/ws1-husna-view5-aceh3.webp';
import imgAceh4 from '../assets/images/husna-view-5/ws1-husna-view5-aceh4.webp';
import imgSumut1 from '../assets/images/husna-view-5/ws1-husna-view5-sumut1.webp';
import imgSumut2 from '../assets/images/husna-view-5/ws1-husna-view5-sumut2.webp';
import imgSumut3 from '../assets/images/husna-view-5/ws1-husna-view5-sumut3.webp';
import imgSumbar1 from '../assets/images/husna-view-5/ws1-husna-view5-sumbar1.webp';
import imgSumbar2 from '../assets/images/husna-view-5/ws1-husna-view5-sumbar2.webp';

import imgAceh21 from '../assets/images/husna-view-5/ws1-husna-view5-aceh21.webp';
import imgAceh22 from '../assets/images/husna-view-5/ws1-husna-view5-aceh22.webp';
import imgAceh23 from '../assets/images/husna-view-5/ws1-husna-view5-aceh23.webp';
import imgSumut21 from '../assets/images/husna-view-5/ws1-husna-view5-sumut21.webp';
import imgSumut22 from '../assets/images/husna-view-5/ws1-husna-view5-sumut22.webp';
import imgSumbar21 from '../assets/images/husna-view-5/ws1-husna-view5-sumbar21.webp';
import imgSumbar22 from '../assets/images/husna-view-5/ws1-husna-view5-sumbar22.webp';
import imgSumbar23 from '../assets/images/husna-view-5/ws1-husna-view5-sumbar23.webp';

gsap.registerPlugin(ScrollTrigger);


// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 5 — "TANTANGAN"
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// 1. DATA 
// ─────────────────────────────────────────────
const SCRAPBOOK_DATA = [
  {
    id: "wawancara",
    title: "Wawancara",
    num: "01",
    images: [
      imgAceh1,
      imgAceh3,
      imgAceh2,
      imgAceh4,
      imgSumut1,
      imgSumut2,
      imgSumut3,
      imgSumbar1,
      imgSumbar2
    ],
    caption: "Mendengar suara yang menanti pemulihan.",
    type: "gallery"
  },
  {
    id: "kondisi",
    title: "Kondisi Lapangan",
    num: "02",
    images: [
      imgAceh21,
      imgAceh22,
      imgAceh23,
      imgSumut21,
      imgSumut22,
      imgSumbar21,
      imgSumbar22,
      imgSumbar23
    ],
    caption: "Merekam realitas infrastruktur pasca bencana.",
    type: "gallery"
  },
  {
    id: "momen",
    title: "Momen Utama",
    num: "03",
    videos: [
      {id: "hcqIrxQ54Uk", source: "youtube", caption: "Di Balik Pendataan Pascabencana Aceh Tengah"},
      {id: "wNxD4448jas", source: "youtube", caption: "Di Balik Pendataan Pascabencana Tapanuli Utara"},
      {id: "Vd4LgunRcPo", source: "youtube", caption: "Di Balik Pendataan Pascabencana Sumatera Barat"},
      {id: "DUBIBhUEiA0", source: "reels", caption: "Mendata di Pidie Jaya"}
    ],
    type: "video_gallery"
  },
];

// ─────────────────────────────────────────────
// 2. HELPER: wrap index agar infinite
// ─────────────────────────────────────────────
function wrap(index, length) {
  return ((index % length) + length) % length;
}

// ─────────────────────────────────────────────
// 3. KOMPONEN CAROUSEL
// ─────────────────────────────────────────────
function SafariCarousel({ images, activeIndex, onSetIndex }) {
  const len = images.length;

  return (
    <div className="ws1-husna-carousel-focus-container">
      <div className="ws1-husna-carousel-track-centered">
        {images.map((img, i) => {
          const rawDist  = i - wrap(activeIndex, len);
          const dist     = rawDist >  len / 2 ? rawDist - len
                        : rawDist < -len / 2 ? rawDist + len
                        : rawDist;
          const absDist  = Math.abs(dist);
          const isCenter = dist === 0;

          if (absDist > 2) return null;

          return (
            <motion.div
              key={i}
              className={`ws1-husna-carousel-focus-item ${isCenter ? 'is-active' : ''}`}
              initial={false}
              animate={{
                x:       dist    * 180,
                scale:   1 - absDist * 0.15,
                zIndex:  10 - absDist,
                opacity: 1 - absDist * 0.3,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              onClick={() => !isCenter && onSetIndex(i)}
              style={{ cursor: isCenter ? 'default' : 'pointer' }}
            >
              <div className="ws1-husna-carousel-card-frame">
                <img src={img} alt="" loading="lazy" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 4. VIEW UTAMA
// ─────────────────────────────────────────────
export const View5 = () => {
  const containerRef = useRef(null);
  const [selected, setSelected]       = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // IMPLEMENTASI GSAP
  useGSAP(() => {
    animateView5(containerRef);
  }, { scope: containerRef }); 

  useEffect(() => {
    if (selected?.images) {
      setActiveIndex(Math.floor(selected.images.length / 2));
    }
    ScrollTrigger.refresh();
  }, [selected]);

  const paginate = (direction) => {
    setActiveIndex((prev) => prev + direction);
  };

  const closeHandle = () => {
    setSelected(null);
    setActiveIndex(0);
  };

  return (
    <section ref={containerRef} className="ws1-husna-view-5-horizontal" id="flatlay">
      {/* <GrainOverlay /> */}

      <div className="ws1-husna-view-inner-h">
        <header className="ws1-husna-v5-header-h">
          <span className="ws1-husna-kicker ws1-husna-kicker-beige">Tahap 5 · Inti Lapangan</span>
          <h2 className="ws1-husna-headline ws1-husna-headline-beige">
            Mengetuk Pintu,
            <em> Merekam Harapan</em> 
          </h2>
        </header>

        {/* ── Bento Grid ── */}
        <div className="ws1-husna-bento-grid">
          
          {/* Tile 01 */}
          <div className="ws1-husna-bento-tile ws1-husna-tile-wawancara" onClick={() => setSelected(SCRAPBOOK_DATA[0])}>
            <div className="ws1-husna-bento-img-wrap">
              <img src="src\pages\WebStory1\assets\images\husna-view-5\thumbnail1.webp" alt="Wawancara" />
              <div className="ws1-husna-bento-img-overlay" />
            </div>
            <div className="ws1-husna-bento-body">
              <div className="ws1-husna-bento-num">{SCRAPBOOK_DATA[0].num} · {SCRAPBOOK_DATA[0].title}</div>
              <div className="ws1-husna-bento-title">Suara yang Menanti</div>
              <div className="ws1-husna-bento-desc">{SCRAPBOOK_DATA[0].caption}</div>
              <div className="ws1-husna-bento-cta">
                <span className="ws1-husna-bento-cta-txt">Lihat Foto</span>
                <div className="ws1-husna-bento-cta-arr">→</div>
              </div>
            </div>
            <div className="ws1-husna-bento-hover-bar" />
          </div>

          {/* Tile 02 */}
          <div className="ws1-husna-bento-tile ws1-husna-tile-kondisi" onClick={() => setSelected(SCRAPBOOK_DATA[1])}>
            <div className="ws1-husna-bento-img-wrap">
              <img src="src\pages\WebStory1\assets\images\husna-view-5\thumbnail2.webp" alt="Kondisi Lapangan" />
              <div className="ws1-husna-bento-img-overlay" />
            </div>
            <div className="ws1-husna-bento-body">
              <div className="ws1-husna-bento-num">{SCRAPBOOK_DATA[1].num} · {SCRAPBOOK_DATA[1].title}</div>
              <div className="ws1-husna-bento-title">Realitas Infrastruktur</div>
              <div className="ws1-husna-bento-desc">{SCRAPBOOK_DATA[1].caption}</div>
              <div className="ws1-husna-bento-cta">
                <span className="ws1-husna-bento-cta-txt">Lihat Foto</span>
                <div className="ws1-husna-bento-cta-arr">→</div>
              </div>
            </div>
            <div className="ws1-husna-bento-hover-bar" />
          </div>

          {/* Tile 03 (Video) */}
          <div className="ws1-husna-bento-tile ws1-husna-tile-video" onClick={() => setSelected(SCRAPBOOK_DATA[2])}>
            <div className="ws1-husna-bento-img-wrap">
              <img src="src\pages\WebStory1\assets\images\husna-view-5\thumbnail3.webp" alt="Momen Utama" />
              <div className="ws1-husna-bento-img-overlay" />
              <div className="ws1-husna-bento-play">
                <div className="ws1-husna-bento-play-ring">
                  <div className="ws1-husna-bento-play-tri" />
                </div>
              </div>
              <div className="ws1-husna-bento-vid-badge">▶ Video</div>
            </div>
            <div className="ws1-husna-bento-body">
              <div className="ws1-husna-bento-num">{SCRAPBOOK_DATA[2].num} · {SCRAPBOOK_DATA[2].title}</div>
              <div className="ws1-husna-bento-title">Langkah Nyata di Tanah Sumatera</div>
              <div className="ws1-husna-bento-desc">{SCRAPBOOK_DATA[2].caption}</div>
              <div className="ws1-husna-bento-cta">
                <span className="ws1-husna-bento-cta-txt">Tonton Video</span>
                <div className="ws1-husna-bento-cta-arr">→</div>
              </div>
            </div>
            <div className="ws1-husna-bento-hover-bar" />
          </div>

        </div>
      </div>

      {/* ── Modal Interaktif ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="ws1-husna-safari-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="ws1-husna-modal-backdrop" onClick={closeHandle} />

            <motion.div
              className="ws1-husna-modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
            >
              <button className="ws1-husna-modal-close" onClick={closeHandle}>✕</button>

              <div className="ws1-husna-focus-slider-wrapper">
                <div className="ws1-husna-main-display-area">
                  {selected.type === "video_gallery" ? (() => {
                      const activeVideo = selected.videos[wrap(activeIndex, selected.videos.length)];
                      if (activeVideo.source === "youtube") {
                        return (
                          <div className="ws1-husna-modal-video-frame" key={`yt-${activeVideo.id}`}>
                            <iframe
                              src={`https://www.youtube.com/embed/${activeVideo.id}?rel=0`}
                              title="YouTube video"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            ></iframe>
                          </div>
                        );
                      } else if (activeVideo.source === "reels") {
                        return (
                          <div className="ws1-husna-modal-reels-frame" key={`ig-${activeVideo.id}`}>
                            <iframe
                              src={`https://www.instagram.com/p/${activeVideo.id}/embed/?hidecaption=true`}
                              title="Instagram Reels"
                              frameBorder="0"
                              scrolling="no"
                              allowTransparency="true"
                              allowFullScreen
                            ></iframe>
                          </div>
                        );
                      }
                    })() : (
                      <SafariCarousel
                        images={selected.images}
                        activeIndex={activeIndex}
                        onSetIndex={setActiveIndex}
                      />
                    )}
                </div>
              </div>

              {/* Navigasi & Info */}
              <div className="ws1-husna-modal-bottom-section">
                {((selected.type === "gallery" && selected.images.length > 1) || 
                  (selected.type === "video_gallery" && selected.videos.length > 1)) && (
                  <div className={`ws1-husna-elegant-nav ${selected.type === "video_gallery" ? "nav-video-mode" : ""}`}>
                    <button className="ws1-husna-nav-minimal" onClick={() => paginate(-1)}>
                      <span className="ws1-husna-nav-icon">←</span> PREV
                    </button>
                    <div className="ws1-husna-nav-counter">
                      <span>
                        {selected.type === "video_gallery" 
                          ? wrap(activeIndex, selected.videos.length) + 1 
                          : wrap(activeIndex, selected.images.length) + 1}
                      </span> / 
                      {selected.type === "video_gallery" ? selected.videos.length : selected.images.length}
                    </div>
                    <button className="ws1-husna-nav-minimal" onClick={() => paginate(1)}>
                      NEXT <span className="ws1-husna-nav-icon">→</span>
                    </button>
                  </div>
                )}

                <div className="ws1-husna-modal-info">
                  <h3>{selected.title}</h3>
                  <p>
                    {selected.type === "video_gallery" 
                      ? selected.videos[wrap(activeIndex, selected.videos.length)].caption 
                      : selected.caption}
                  </p>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 7 — "MELAWAN MEDAN"
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// DATA 
// ─────────────────────────────────────────────
const PROVINSI_DATA = [
  {
    id: "v6b1",
    name: "Aceh",
    img: "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?q=80&w=1000", 
    kicker: "Tantangan",
    heading: "Melawan",
    headingAccent: "Medan",
    body: "Hujan deras, jalan berlumpur, sinyal hilang — bukan halangan.\nKetika medan menguji, semangat menjawab.",
    quote: '"Kami bukan turis. Kami enumerator. Dan data ini penting."',
  },
  {
    id: "v6b2",
    name: "Sumatera Utara",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000",
    kicker: "Lapangan",
    heading: "Setiap",
    headingAccent: "Langkah",
    body: "Motor menembus kabut pagi, catatan basah tapi data tetap akurat.\nIntegritas tidak menyerah pada medan.",
    quote: '"Tidak ada jarak yang terlalu jauh untuk satu formulir yang benar."',
  },
  {
    id: "v6b3",
    name: "Sumatera Barat",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000",
    kicker: "Dedikasi",
    heading: "Tetap",
    headingAccent: "Bergerak",
    body: "21 hari, ratusan desa, ribuan wawancara.\nKami pulang membawa data yang layak diperjuangkan.",
    quote: '"Data ini bukan sekadar angka — ini suara mereka yang kami sampaikan."',
  },
];

// ─────────────────────────────────────────────
// VIEW UTAMA
// ─────────────────────────────────────────────
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
        <span className="ws1-husna-kicker ws1-husna-kicker-orange lato-regular">Tahap 7 · Tantangan</span>
        <h2 className="ws1-husna-headline ws1-husna-headline-navy">Melawan
          <em> Medan</em> 
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