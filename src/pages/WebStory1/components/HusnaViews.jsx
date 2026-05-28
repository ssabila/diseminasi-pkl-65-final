import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './HusnaViews.css';

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────
// 1. DATA 
// ─────────────────────────────────────────────
const SCRAPBOOK_DATA = [
  {
    id: "wawancara",
    title: "Wawancara",
    num: "01",
    images: [
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800"
    ],
    caption: "Mendengar suara yang menanti pemulihan.",
    type: "gallery"
  },
  {
    id: "kondisi",
    title: "Kondisi Lapangan",
    num: "02",
    images: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800"
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
          <span className="ws1-husna-kicker-beige lato-regular">Tahap 5 · Inti Lapangan</span>
          <h2>
            Mengetuk Pintu, <em className="ws1-husna-accent-orange">Merekam Harapan</em>
          </h2>
        </header>

        {/* ── Bento Grid ── */}
        <div className="ws1-husna-bento-grid">
          
          {/* Tile 01 */}
          <div className="ws1-husna-bento-tile ws1-husna-tile-wawancara" onClick={() => setSelected(SCRAPBOOK_DATA[0])}>
            <div className="ws1-husna-bento-img-wrap">
              <img src={SCRAPBOOK_DATA[0].images[0]} alt="Wawancara" />
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
              <img src={SCRAPBOOK_DATA[1].images[0]} alt="Kondisi Lapangan" />
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
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" alt="Momen Utama" />
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
                  <div className="ws1-husna-elegant-nav">
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


export const View7 = () => {
  return (
    <section className="webstory-view view-7">
      <h2>View 7 (Tantangan/Parallax) - Husna</h2>
      {/* TODO: Add tantangan content and animations here */}
    </section>
  );
};
