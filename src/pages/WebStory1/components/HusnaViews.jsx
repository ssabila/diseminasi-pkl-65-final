import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { animateView5, animateView7 } from '../animations'; 

import './HusnaViews.css';

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 7 DATA (Versi Profesional)
// ═══════════════════════════════════════════════════════════════════════════════
const PROVINSI_DATA = [
  {
    id: "v7b1",
    name: "Aceh",
    img: "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?q=80&w=1000", 
    kicker: "Tantangan",
    heading: "Melawan",
    headingAccent: "Medan",
    body: "Menjangkau wilayah terdampak bencana menuntut adaptasi terhadap akses jalan darurat dan kendala sinyal. Tim memastikan setiap responden tetap terdata dengan baik.",
    quote: '"Data pemulihan pascabencana ini krusial untuk perencanaan kebijakan yang tepat sasaran."',
  },
  {
    id: "v7b2",
    name: "Sumatera Utara",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000",
    kicker: "Lapangan",
    heading: "Setiap",
    headingAccent: "Langkah",
    body: "Variasi topografi dari pesisir hingga pegunungan mengharuskan pergerakan tim yang efisien. Minimasi non-sampling error menjadi fokus utama di setiap rute perjalanan.",
    quote: '"Tantangan fisik di lapangan tidak boleh menurunkan standar objektivitas sebuah data statistik."',
  },
  {
    id: "v7b3",
    name: "Sumatera Barat",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000",
    kicker: "Dedikasi",
    heading: "Tetap",
    headingAccent: "Bergerak",
    body: "Pengumpulan data primer secara masif membutuhkan manajemen waktu dan tenaga yang solid. Konsistensi metodologi dijaga ketat pada setiap tahapan pencacahan.",
    quote: '"Angka yang kami kumpulkan adalah potret riil kondisi sosial-ekonomi masyarakat saat ini."',
  },
];

// ─────────────────────────────────────────────
// HELPER: wrap index agar infinite
// ─────────────────────────────────────────────
function wrap(index, length) {
  return ((index % length) + length) % length;
}

// ─────────────────────────────────────────────
// KOMPONEN CAROUSEL (GSAP)
// ─────────────────────────────────────────────
function SafariCarousel({ images, activeIndex, onSetIndex }) {
  const len = images.length;
  const containerRef = useRef(null);
  const isInitial = useRef(true);

  useGSAP(() => {
    const duration = isInitial.current ? 0 : 0.6;
    isInitial.current = false;

    images.forEach((_, i) => {
      const rawDist  = i - wrap(activeIndex, len);
      const dist     = rawDist >  len / 2 ? rawDist - len
                    : rawDist < -len / 2 ? rawDist + len
                    : rawDist;
      const absDist  = Math.abs(dist);
      const target = `.carousel-item-${i}`;

      if (absDist > 2) {
        gsap.to(target, { 
          opacity: 0, 
          scale: 0.6, 
          zIndex: 0,
          display: "none", 
          duration 
        });
      } else {
        gsap.to(target, {
          display: "block",
          x: dist * 180,
          scale: 1 - absDist * 0.15,
          zIndex: 10 - absDist,
          opacity: 1 - absDist * 0.3,
          duration,
          ease: "power3.out"
        });
      }
    });
  }, { dependencies: [activeIndex, len], scope: containerRef });

  return (
    <div className="ws1-husna-carousel-focus-container" ref={containerRef}>
      <div className="ws1-husna-carousel-track-centered">
        {images.map((img, i) => {
          const rawDist  = i - wrap(activeIndex, len);
          const dist     = rawDist >  len / 2 ? rawDist - len
                        : rawDist < -len / 2 ? rawDist + len
                        : rawDist;
          const isCenter = dist === 0;

          return (
            <div
              key={i}
              className={`ws1-husna-carousel-focus-item carousel-item-${i} ${isCenter ? 'is-active' : ''}`}
              onClick={() => !isCenter && onSetIndex(i)}
              style={{ cursor: isCenter ? 'default' : 'pointer', position: 'absolute' }}
            >
              <div className="ws1-husna-carousel-card-frame">
                <img src={img} alt="" loading="lazy" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// KOMPONEN MODAL (GSAP)
// ─────────────────────────────────────────────
function InteractiveModal({ selected, activeIndex, setActiveIndex, closeHandle, paginate }) {
  const modalRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(".ws1-husna-modal-content", 
      { scale: 0.9, y: 30, opacity: 0 }, 
      { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.2)" }
    );
  }, { scope: modalRef });

  const triggerClose = () => {
    gsap.to(modalRef.current, { opacity: 0, duration: 0.3, ease: "power2.in" });
    gsap.to(".ws1-husna-modal-content", { 
      scale: 0.9, y: 20, opacity: 0, duration: 0.3, ease: "power2.in", 
      onComplete: closeHandle 
    });
  };

  return (
    <div className="ws1-husna-safari-modal" ref={modalRef}>
      <div className="ws1-husna-modal-backdrop" onClick={triggerClose} />

      <div className="ws1-husna-modal-content">
        <button className="ws1-husna-modal-close" onClick={triggerClose}>✕</button>

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

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VIEW 5: INTI LAPANGAN (BENTO GRID)
// ─────────────────────────────────────────────
export const View5 = () => {
  const containerRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(() => {
    gsap.fromTo(".ws1-husna-bento-tile", 
      { opacity: 0, y: 40 },
      { 
        opacity: 1, 
        y: 0, 
        stagger: 0.1, 
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        }
      }
    );
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
      <div className="ws1-husna-view-inner-h">
        <header className="ws1-husna-v5-header-h">
          <span className="ws1-husna-kicker ws1-husna-kicker-beige lato-regular">Tahap 5 · Inti Lapangan</span>
          <h2 className="ws1-husna-headline ws1-husna-headline-beige">
            Mengetuk Pintu, <em className="ws1-husna-accent-orange">Merekam Harapan</em>
          </h2>
        </header>

        <div className="ws1-husna-bento-grid">
          
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

      {selected && (
        <InteractiveModal 
          selected={selected} 
          activeIndex={activeIndex} 
          setActiveIndex={setActiveIndex} 
          closeHandle={closeHandle} 
          paginate={paginate} 
        />
      )}
    </section>
  );
};

// ─────────────────────────────────────────────
// VIEW 7: MELAWAN MEDAN (ACCORDION)
// ─────────────────────────────────────────────
export const View7 = () => {
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(0);

  useGSAP(() => {
    animateView7(containerRef);
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="ws1-husna-view-7-accordion" id="field">
      <div className="ws1-husna-v7-accordion-header">
        <span className="ws1-husna-kicker ws1-husna-kicker-green lato-regular">Tahap 7 · Tantangan</span>
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