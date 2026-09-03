import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './SanchaViews.css';

// Import View 2 Assets
import imgCard1 from '../assets/images/view-2/v2-card-1.webp';
import imgCard2 from '../assets/images/view-2/v2-card-2.webp';
import imgCard3 from '../assets/images/view-2/v2-card-3.webp';
import imgCard4 from '../assets/images/view-2/v2-card-4.webp';

gsap.registerPlugin(ScrollTrigger);

const timelineData = [
  { 
    id: 1,
    step: "01", 
    date: "12 JAN 2026",
    tag: "Pengarahan Umum",
    location: "Aula Utama Politeknik Statistika STIS", 
    title: "Pembekalan & Pengarahan", 
    desc: "Pembukaan resmi program R3P 2026 dan penyelarasan visi strategis pengumpulan data pemulihan pascabencana secara menyeluruh.",
    icon: (
      <svg className="ws1-sancha-tl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    )
  },
  { 
    id: 2,
    step: "02", 
    date: "13 JAN 2026",
    tag: "Simulasi CAPI & FASIH",
    location: "Laboratorium Komputasi Statistik", 
    title: "Pelatihan Teknis Lapangan", 
    desc: "Uji coba instrumen CAPI serta simulasi pencatatan data terpadu menggunakan sistem aplikasi FASIH secara intensif dan adaptif.",
    icon: (
      <svg className="ws1-sancha-tl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    )
  },
  { 
    id: 3,
    step: "03", 
    date: "14 JAN 2026",
    tag: "Manajemen Regu",
    location: "Ruang Rapat Koordinasi PKL", 
    title: "Konsolidasi & Pemetaan Wilayah", 
    desc: "Distribusi kelompok kerja taktis per kabupaten sasaran serta pemantapan strategi mitigasi rute geografis yang rawan dan terisolasi.",
    icon: (
      <svg className="ws1-sancha-tl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  },
  { 
    id: 4,
    step: "04", 
    date: "15 JAN 2026",
    tag: "Apel Keberangkatan",
    location: "Plaza Utama Kampus STIS", 
    title: "Pelepasan Resmi Menuju Sumatera", 
    desc: "Apel siaga pelepasan resmi kontingen peneliti menuju lokasi titik terdampak gempa dan banjir di Aceh, Sumut, dan Sumbar.",
    icon: (
      <svg className="ws1-sancha-tl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    )
  }
];

export const View1 = () => {
  const sectionRef = useRef(null);

  useGSAP(() => {
    // 1. Header Entrance
    gsap.fromTo('.ws1-sancha-v1-header',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        }
      }
    );

    // 2. Continuous Track Progress bar fill (Scrub smoothly)
    gsap.fromTo('.ws1-sancha-tl-progress-bar', 
      { scaleY: 0 },
      { 
        scaleY: 1,
        transformOrigin: 'top center',
        ease: 'none',
        scrollTrigger: {
          trigger: '.ws1-sancha-tl-container',
          start: 'top 75%',
          end: 'bottom 85%',
          scrub: 0.3
        }
      }
    );

    // 3. Staggered row entrance: Node -> Connector -> Card (Instant, no delay)
    gsap.utils.toArray('.ws1-sancha-tl-row').forEach((row, i) => {
      const isLeft = i % 2 === 0;
      const card = row.querySelector('.ws1-sancha-tl-card');
      const node = row.querySelector('.ws1-sancha-tl-node');
      const conn = row.querySelector('.ws1-sancha-tl-connector');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: 'top 84%',
          toggleActions: 'play none none reverse'
        }
      });

      tl.fromTo(node, 
        { scale: 0, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }
      )
      .fromTo(conn,
        { scaleX: 0, opacity: 0 },
        { 
          scaleX: 1, 
          opacity: 1, 
          duration: 0.3, 
          transformOrigin: isLeft ? 'right center' : 'left center',
          ease: 'power2.out' 
        },
        '-=0.15'
      )
      .fromTo(card, 
        { opacity: 0, x: isLeft ? -40 : 40, y: 15 }, 
        { opacity: 1, x: 0, y: 0, duration: 0.45, ease: 'power3.out' }, 
        '-=0.2'
      );
    });
  }, { scope: sectionRef });

  return (
    <section className="ws1-sancha-view1" ref={sectionRef} id="timeline">
      {/* Background ambient lighting */}
      <div className="ws1-sancha-v1-glow top-glow" />
      <div className="ws1-sancha-v1-glow bottom-glow" />

      <div className="ws1-sancha-v1-inner">
        {/* Section Header */}
        <header className="ws1-sancha-v1-header">
          <span className="ws1-sancha-kicker">Tahap 1 · Pra-Pemberangkatan</span>
          <h2 className="ws1-sancha-headline">
            Menempa Kesiapan, <em className="ws1-sancha-accent-orange">Mengunci Komitmen</em>
          </h2>
          <p className="ws1-sancha-subhead">
            Empat hari krusial persiapan teknis, taktis, dan mental sebelum armada peneliti diterjunkan langsung ke wilayah terdampak bencana Sumatera.
          </p>
        </header>

        {/* Timeline Container */}
        <div className="ws1-sancha-tl-container">
          {/* Poros Vertikal Tengah */}
          <div className="ws1-sancha-tl-spine">
            <div className="ws1-sancha-tl-track" />
            <div className="ws1-sancha-tl-progress-bar" />
          </div>

          {timelineData.map((item, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div 
                key={item.id} 
                className={`ws1-sancha-tl-row ${isLeft ? 'is-left' : 'is-right'}`}
              >
                {/* Node di poros tengah */}
                <div className="ws1-sancha-tl-node-wrap">
                  <div className="ws1-sancha-tl-node">
                    <span className="ws1-sancha-tl-node-num">{item.step}</span>
                    <div className="ws1-sancha-tl-node-ping" />
                  </div>
                </div>

                {/* Garis cabang konektor */}
                <div className="ws1-sancha-tl-connector" />

                {/* Kartu timeline */}
                <div className="ws1-sancha-tl-card-wrap">
                  <div className="ws1-sancha-tl-card">
                    {/* Watermark nomor step */}
                    <div className="ws1-sancha-tl-watermark">{item.step}</div>

                    <div className="ws1-sancha-tl-card-top">
                      <div className="ws1-sancha-tl-badge-group">
                        <span className="ws1-sancha-tl-tag">{item.tag}</span>
                        <span className="ws1-sancha-tl-date">{item.date}</span>
                      </div>
                      <div className="ws1-sancha-tl-icon-box">
                        {item.icon}
                      </div>
                    </div>

                    <h3 className="ws1-sancha-tl-title">{item.title}</h3>
                    <p className="ws1-sancha-tl-desc">{item.desc}</p>

                    <div className="ws1-sancha-tl-card-footer">
                      <span className="ws1-sancha-tl-location">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {item.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const View2 = () => {
  const sectionRef = useRef(null);

  useGSAP(() => {
    // Heading fade in
    gsap.fromTo('.ws1-sancha-v2-header', { opacity: 0, x: -30 }, {
      opacity: 1, x: 0, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' }
    });

    // Cards staggered fade in and slight rotation
    gsap.fromTo('.ws1-sancha-v2-doc', 
      { opacity: 0, y: 30, rotation: 0 },
      { 
        opacity: 1, y: 0, 
        rotation: (i) => [-2, 1.5, -1.5, 2][i % 4],
        duration: 0.6, stagger: 0.08, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: '.ws1-sancha-v2-gallery', start: 'top 85%' }
      }
    );
  }, { scope: sectionRef });

  const galleryData = [
    { id: 1, img: imgCard1, label: "Pengarahan Umum", date: "Aula STIS, 12 Jan" },
    { id: 2, img: imgCard2, label: "Simulasi Aplikasi FASIH", date: "Laboratorium, 13 Jan" },
    { id: 3, img: imgCard3, label: "Briefing Kelompok Kerja", date: "Ruang Diskusi, 14 Jan" },
    { id: 4, img: imgCard4, label: "Pelepasan Petugas", date: "Plaza Kampus, 15 Jan" }
  ];

  return (
    <section className="ws1-sancha-view2" ref={sectionRef}>
      <div className="ws1-sancha-v2-container">
        
        <div className="ws1-sancha-v2-header">
          <h2 className="ws1-sancha-v2-heading">
            <span className="ws1-sancha-v2-orange">Ditempa Sebelum</span> Diterjunkan
          </h2>
        </div>
        
        <div className="ws1-sancha-v2-gallery">
          {galleryData.map((item) => (
            <div key={item.id} className="ws1-sancha-v2-doc">
              <div className="ws1-sancha-v2-tape" />
              <div className="ws1-sancha-v2-img-container">
                <img src={item.img} alt={item.label} />
              </div>
              <div className="ws1-sancha-v2-caption">
                <p className="v2-caption-text">{item.label}</p>
                <span className="v2-caption-date">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export const View3 = () => {
  const sectionRef = useRef(null);
  const quoteRef = useRef(null);

  useGSAP(() => {
    // Pin the section
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: () => window.innerWidth < 768 ? '+=100%' : '+=150%', // Pin for 150% of viewport height (100% on mobile)
      pin: true,
      pinSpacing: true,
    });

    // Reveal words one by one as we scroll through the pinned section
    gsap.fromTo('.ws1-sancha-v3-word', 
      { opacity: 0.15, y: 15 }, 
      {
        opacity: 1, y: 0, 
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: { 
          trigger: sectionRef.current, 
          start: 'top top',
          end: () => window.innerWidth < 768 ? '+=70%' : '+=100%', 
          scrub: true 
        }
      }
    );

    // Fade in author at the end
    gsap.fromTo('.ws1-sancha-v3-author', 
      { opacity: 0, y: 20 }, 
      {
        opacity: 1, y: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: () => window.innerWidth < 768 ? '+=70%' : '+=100%', 
          end: () => window.innerWidth < 768 ? '+=90%' : '+=130%',
          scrub: true
        }
      }
    );

  }, { scope: sectionRef });

  return (
    <section className="ws1-sancha-view3" ref={sectionRef}>
      <div className="ws1-sancha-v3-overlay"></div>
      <div className="ws1-sancha-v3-content">
        <h2 className="ws1-sancha-v3-quote" ref={quoteRef}>
          {'"Bukan sekadar mengumpulkan angka,'.split(' ').map((word, i) => (
            <span key={'w1'+i} className="ws1-sancha-v3-word">{word}&nbsp;</span>
          ))}
          <br/>
          {'tapi mendengarkan suara dari pelosok negeri."'.split(' ').map((word, i) => (
            <span key={'w2'+i} className="ws1-sancha-v3-word">{word}&nbsp;</span>
          ))}
        </h2>
        <p className="ws1-sancha-v3-author">— Arahan Pimpinan</p>
      </div>
    </section>
  );
};
