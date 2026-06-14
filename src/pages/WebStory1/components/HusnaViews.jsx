import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import './HusnaViews.css';

// Import Husna View 5 Assets
import thumb1 from '../assets/images/husna-view-5/thumbnail1.webp';
import thumb2 from '../assets/images/husna-view-5/thumbnail2.webp';
import thumb3 from '../assets/images/husna-view-5/thumbnail3.webp';

import aceh1 from '../assets/images/husna-view-5/ws1-husna-view5-aceh1.webp';
import aceh2 from '../assets/images/husna-view-5/ws1-husna-view5-aceh2.webp';
import aceh21 from '../assets/images/husna-view-5/ws1-husna-view5-aceh21.webp';
import aceh22 from '../assets/images/husna-view-5/ws1-husna-view5-aceh22.webp';
import aceh23 from '../assets/images/husna-view-5/ws1-husna-view5-aceh23.webp';
import aceh3 from '../assets/images/husna-view-5/ws1-husna-view5-aceh3.webp';
import aceh4 from '../assets/images/husna-view-5/ws1-husna-view5-aceh4.webp';

import sumbar1 from '../assets/images/husna-view-5/ws1-husna-view5-sumbar1.webp';
import sumbar2 from '../assets/images/husna-view-5/ws1-husna-view5-sumbar2.webp';
import sumbar21 from '../assets/images/husna-view-5/ws1-husna-view5-sumbar21.webp';
import sumbar22 from '../assets/images/husna-view-5/ws1-husna-view5-sumbar22.webp';
import sumbar23 from '../assets/images/husna-view-5/ws1-husna-view5-sumbar23.webp';

import sumut1 from '../assets/images/husna-view-5/ws1-husna-view5-sumut1.webp';
import sumut2 from '../assets/images/husna-view-5/ws1-husna-view5-sumut2.webp';
import sumut21 from '../assets/images/husna-view-5/ws1-husna-view5-sumut21.webp';
import sumut22 from '../assets/images/husna-view-5/ws1-husna-view5-sumut22.webp';
import sumut3 from '../assets/images/husna-view-5/ws1-husna-view5-sumut3.webp';

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
      thumb1,
      aceh1, aceh2, aceh3, aceh4, sumbar1, sumbar2, sumut1, sumut3
    ],
    caption: "Mendengar suara yang menanti pemulihan.",
    type: "gallery"
  },
  {
    id: "kondisi",
    title: "Kondisi Lapangan",
    num: "02",
    images: [
      thumb2,
      aceh21, aceh22, aceh23, sumbar21, sumbar22, sumbar23, sumut2, sumut21, sumut22
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
    caption: "Momen puncak penuh haru dan tawa.",
    type: "video_gallery"
  },
];

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
// 2. HELPER: wrap index agar infinite
// ─────────────────────────────────────────────
function wrap(index, length) {
  return ((index % length) + length) % length;
}

// ─────────────────────────────────────────────
// 3. KOMPONEN CAROUSEL (Diubah ke GSAP)
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
// 4. KOMPONEN MODAL (Diubah ke GSAP)
// ─────────────────────────────────────────────
function InteractiveModal({ selected, activeIndex, setActiveIndex, closeHandle, paginate }) {
  const modalRef = useRef(null);

  useGSAP(() => {
    // Entrance animation
    gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(".ws1-husna-modal-content", 
      { scale: 0.9, y: 30, opacity: 0 }, 
      { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.2)" }
    );
  }, { scope: modalRef });

  const triggerClose = () => {
    // Exit animation
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
        <button className="ws1-husna-modal-close" onClick={triggerClose} aria-label="Tutup galeri">x</button>

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
                        loading="lazy"
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
                        loading="lazy"
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
              <button className="ws1-husna-nav-minimal" onClick={() => paginate(-1)} aria-label="Konten sebelumnya">
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
              <button className="ws1-husna-nav-minimal" onClick={() => paginate(1)} aria-label="Konten berikutnya">
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
// 5. VIEW UTAMA
// ─────────────────────────────────────────────
export const View5 = () => {
  const containerRef = useRef(null);
  const [selected, setSelected]       = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // IMPLEMENTASI GSAP ENTRY ANIMATIONS 
  useGSAP(() => {
    // Basic entrance animations for bento tiles can be added here
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
    if (!selected) return undefined;
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [selected]);

  const paginate = (direction) => {
    setActiveIndex((prev) => prev + direction);
  };

  const openScrapbook = (item) => {
    setActiveIndex(item.images ? Math.floor(item.images.length / 2) : 0);
    setSelected(item);
  };

  const handleTileKeyDown = (event, item) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openScrapbook(item);
    }
  };

  const closeHandle = () => {
    setSelected(null);
    setActiveIndex(0);
  };

  return (
    <section ref={containerRef} className="ws1-husna-view-5-horizontal" id="flatlay">

      <div className="ws1-husna-view-inner-h">
        <header className="ws1-husna-v5-header-h">
          <h2>
            Mengetuk Pintu, <em className="ws1-husna-accent-orange">Merekam Harapan</em>
          </h2>
        </header>

        {/* ── Bento Grid ── */}
        <div className="ws1-husna-bento-grid">
          
          {/* Tile 01 */}
          <div
            className="ws1-husna-bento-tile ws1-husna-tile-wawancara"
            onClick={() => openScrapbook(SCRAPBOOK_DATA[0])}
            onKeyDown={(event) => handleTileKeyDown(event, SCRAPBOOK_DATA[0])}
            role="button"
            tabIndex={0}
          >
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
          <div
            className="ws1-husna-bento-tile ws1-husna-tile-kondisi"
            onClick={() => openScrapbook(SCRAPBOOK_DATA[1])}
            onKeyDown={(event) => handleTileKeyDown(event, SCRAPBOOK_DATA[1])}
            role="button"
            tabIndex={0}
          >
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
          <div
            className="ws1-husna-bento-tile ws1-husna-tile-video"
            onClick={() => openScrapbook(SCRAPBOOK_DATA[2])}
            onKeyDown={(event) => handleTileKeyDown(event, SCRAPBOOK_DATA[2])}
            role="button"
            tabIndex={0}
          >
            <div className="ws1-husna-bento-img-wrap">
              <img src={thumb3} alt="Momen Utama" />
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


export const View7 = () => {
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(0);

  useGSAP(() => {
    gsap.fromTo('.ws1-husna-accordion-panel', 
      { 
        y: 80, 
        opacity: 0 
      },
      {
        y: 0, 
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%", 
          toggleActions: "play none none reverse",
        }
      }
    );
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
