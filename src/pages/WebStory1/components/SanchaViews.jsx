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
    day: "12",
    month: "JAN",
    year: "2026",
    code: "DISPATCH // 01",
    phase: "PENGARAHAN STRATEGIS",
    location: "Aula Utama Politeknik Statistika STIS, Jakarta", 
    title: "Pembekalan & Penyatuan Visi Misi", 
    desc: "Pembukaan resmi program R3P 2026 dan penyelarasan metodologi pengumpulan data pemulihan pascabencana secara menyeluruh sebelum tim diterjunkan."
  },
  { 
    id: 2,
    step: "02",
    day: "13",
    month: "JAN",
    year: "2026",
    code: "DISPATCH // 02",
    phase: "SIMULASI INSTRUMEN",
    location: "Laboratorium Komputasi Statistik STIS", 
    title: "Pelatihan Teknis Lapangan & CAPI", 
    desc: "Uji coba komprehensif instrumen CAPI serta simulasi pencatatan data terpadu menggunakan aplikasi FASIH pada berbagai skenario kondisi darurat."
  },
  { 
    id: 3,
    step: "03",
    day: "14",
    month: "JAN",
    year: "2026",
    code: "DISPATCH // 03",
    phase: "MITIGASI TAKTIS",
    location: "Ruang Koordinasi Wilayah PKL 65", 
    title: "Konsolidasi & Pemetaan Jalur Rawan", 
    desc: "Distribusi kelompok kerja taktis per kabupaten sasaran serta perumusan strategi mitigasi rute transportasi darat yang rusak dan terisolasi."
  },
  { 
    id: 4,
    step: "04",
    day: "15",
    month: "JAN",
    year: "2026",
    code: "DISPATCH // 04",
    phase: "APEL SIAGA",
    location: "Plaza Utama Kampus STIS, Jakarta", 
    title: "Pelepasan Resmi Kontingen Peneliti", 
    desc: "Apel siaga pelepasan resmi kontingen peneliti menuju lokasi titik terdampak gempa bumi dan banjir bandang di Aceh, Sumatera Utara, dan Sumatera Barat."
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
                  </div>
                </div>

                {/* Garis cabang konektor */}
                <div className="ws1-sancha-tl-connector" />

                {/* Kartu timeline bergaya Editorial Dispatch */}
                <div className="ws1-sancha-tl-card-wrap">
                  <div className="ws1-sancha-tl-card">
                    {/* Header Editorial Dispatch */}
                    <div className="ws1-sancha-dispatch-header">
                      <div className="ws1-sancha-dispatch-date-block">
                        <span className="ws1-sancha-dispatch-day">{item.day}</span>
                        <div className="ws1-sancha-dispatch-date-sub">
                          <span className="ws1-sancha-dispatch-month">{item.month}</span>
                          <span className="ws1-sancha-dispatch-year">{item.year}</span>
                        </div>
                      </div>
                      <div className="ws1-sancha-dispatch-meta">
                        <span className="ws1-sancha-dispatch-code">{item.code}</span>
                        <span className="ws1-sancha-dispatch-phase">{item.phase}</span>
                      </div>
                    </div>

                    {/* Garis batas editorial tipis */}
                    <div className="ws1-sancha-dispatch-rule" />

                    {/* Judul & Deskripsi Naratif */}
                    <h3 className="ws1-sancha-dispatch-title">{item.title}</h3>
                    <p className="ws1-sancha-dispatch-desc">{item.desc}</p>

                    {/* Footer Catatan Ekspedisi */}
                    <div className="ws1-sancha-dispatch-footer">
                      <span className="ws1-sancha-dispatch-loc-label">LOKASI PERSIAPAN</span>
                      <span className="ws1-sancha-dispatch-loc-val">{item.location}</span>
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
