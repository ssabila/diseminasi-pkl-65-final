import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './SanchaViews.css';

// Import View 4 Map of Sumatera for Watermark
import imgSumatera from '../assets/images/view-4/ws1-nadia-sumatera-v4.png';

// Import View 2 Assets
import imgCard1 from '../assets/images/view-2/v2-card-1.webp';
import imgCard2 from '../assets/images/view-2/v2-card-2.webp';
import imgCard3 from '../assets/images/view-2/v2-card-3.webp';
import imgCard4 from '../assets/images/view-2/v2-card-4.webp';

gsap.registerPlugin(ScrollTrigger);

const timelineData = [
  { 
    id: 1,
    date: "12 JAN",
    year: "2026",
    phase: "HARI KE-1 · PEMBEKALAN DASAR",
    title: "Pelatihan Hari Pertama", 
    location: "Ruang Kelas dan Auditorium Polstat STIS",
    coordinate: "JAKARTA PUSAT · 6°13'S 106°52'E",
    desc: "Penyelarasan konsep metodologi, pemahaman instrumen survei, dan pembekalan materi komprehensif bagi seluruh kontingen di ruang kelas serta auditorium kampus."
  },
  { 
    id: 2,
    date: "13 JAN",
    year: "2026",
    phase: "HARI KE-2 · SIMULASI CAPI & TEKNIS",
    title: "Pelatihan Hari Kedua", 
    location: "Ruang Kelas dan Auditorium Polstat STIS",
    coordinate: "JAKARTA PUSAT · 6°13'S 106°52'E",
    desc: "Pendalaman teknis penggunaan aplikasi CAPI FASIH, uji coba skenario lapangan darurat bencana, dan pemantapan koordinasi tim pencacah."
  },
  { 
    id: 3,
    date: "14 JAN",
    year: "2026",
    phase: "HARI KE-3 · PENGARAHAN & PELEPASAN",
    title: "Pelepasan dengan Kepala BPS RI", 
    location: "Auditorium Polstat STIS",
    coordinate: "AUDITORIUM STIS · 6°13'S 106°52'E",
    desc: "Prosesi apel pelepasan resmi dan pengarahan langsung oleh Kepala BPS RI guna meneguhkan integritas, profesionalitas, serta keselamatan peneliti di daerah bencana."
  },
  { 
    id: 4,
    date: "15 JAN",
    year: "2026",
    phase: "HARI KE-4 · MOBILISASI KONTINGEN",
    title: "Pemberangkatan ke Lapangan", 
    location: "Bandara Halim, Bandara Soekarno Hatta",
    coordinate: "HLP & CGK AIRPORT · 6°07'S 106°39'E",
    desc: "Armada peneliti diberangkatkan serentak melalui Bandara Halim Perdanakusuma dan Bandara Internasional Soekarno-Hatta menuju pulau Sumatera."
  },
  { 
    id: 5,
    date: "16 JAN",
    year: "2026",
    phase: "HARI KE-5 · PENGUMPULAN DATA LAPANGAN",
    title: "Pelaksanaan Pendataan", 
    location: "Aceh, Sumatera Utara, Sumatera Barat",
    coordinate: "KORIDOR SUMATERA · 5°33'N — 0°57'S",
    desc: "Pelaksanaan pendataan langsung secara terpadu di wilayah terdampak bencana alam di 3 provinsi: Aceh, Sumatera Utara, dan Sumatera Barat."
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

    // 3. Staggered row entrance: Pin -> Branch -> Typographic Block (No delay, cardless)
    gsap.utils.toArray('.ws1-sancha-tl-entry').forEach((entry, i) => {
      const isLeft = i % 2 === 0;
      const block = entry.querySelector('.ws1-sancha-tl-block');
      const pin = entry.querySelector('.ws1-sancha-tl-pin');
      const branch = entry.querySelector('.ws1-sancha-tl-branch');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: entry,
          start: 'top 84%',
          toggleActions: 'play none none reverse'
        }
      });

      tl.fromTo(pin, 
        { scale: 0, opacity: 0, rotation: 0 }, 
        { scale: 1, opacity: 1, rotation: 45, duration: 0.35, ease: 'back.out(2)' }
      )
      .fromTo(branch,
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
      .fromTo(block, 
        { opacity: 0, x: isLeft ? -35 : 35, y: 10 }, 
        { opacity: 1, x: 0, y: 0, duration: 0.5, ease: 'power3.out' }, 
        '-=0.2'
      );
    });
  }, { scope: sectionRef });

  return (
    <section className="ws1-sancha-view1" ref={sectionRef} id="timeline">
      {/* Background cartography grid overlay matching View 0 */}
      <div className="ws1-sancha-v1-grid" />

      {/* Siluet Peta Pulau Sumatera sebagai Watermark Ekspedisi */}
      <div className="ws1-sancha-v1-map-watermark" aria-hidden="true">
        <img src={imgSumatera} alt="Peta Sumatera" className="ws1-sancha-v1-map-img" />
      </div>

      {/* Ornamen Sudut Songket Khas Sumatera (Pucuk Rebung) */}
      <div className="ws1-sancha-sumatra-corner corner-tl" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
          <path d="M0 0 L80 0 M0 0 L0 80" stroke="var(--gold)" strokeWidth="2" opacity="0.6"/>
          <path d="M6 6 L68 6 M6 6 L6 68" stroke="var(--beige)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"/>
          <polygon points="10,10 24,10 10,24" fill="var(--orange)" opacity="0.5"/>
          <polygon points="28,10 42,10 10,42 10,28" fill="var(--gold)" opacity="0.3"/>
          <path d="M0 20 L20 0 M0 36 L36 0 M0 52 L52 0" stroke="var(--gold)" strokeWidth="1" opacity="0.4"/>
        </svg>
      </div>
      <div className="ws1-sancha-sumatra-corner corner-tr" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
          <path d="M0 0 L80 0 M0 0 L0 80" stroke="var(--gold)" strokeWidth="2" opacity="0.6"/>
          <path d="M6 6 L68 6 M6 6 L6 68" stroke="var(--beige)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"/>
          <polygon points="10,10 24,10 10,24" fill="var(--orange)" opacity="0.5"/>
          <polygon points="28,10 42,10 10,42 10,28" fill="var(--gold)" opacity="0.3"/>
          <path d="M0 20 L20 0 M0 36 L36 0 M0 52 L52 0" stroke="var(--gold)" strokeWidth="1" opacity="0.4"/>
        </svg>
      </div>

      <div className="ws1-sancha-v1-inner">
        {/* Section Header dengan Emblem Pinto Aceh / Bungong Jeumpa */}
        <header className="ws1-sancha-v1-header">
          {/* Ornamen Motif Khas Aceh (Pinto Aceh / Bungong Jeumpa) */}
          <div className="ws1-sancha-aceh-crest" aria-hidden="true">
            <svg width="54" height="36" viewBox="0 0 60 40" fill="none">
              <path d="M30 2 L43 17 L30 32 L17 17 Z" stroke="var(--gold)" strokeWidth="1.5" fill="rgba(212, 168, 85, 0.12)"/>
              <path d="M30 8 L37 17 L30 26 L23 17 Z" stroke="var(--orange)" strokeWidth="1" fill="none"/>
              <circle cx="30" cy="17" r="2.5" fill="var(--orange)"/>
              <path d="M17 17 C11 13 5 17 2 21 C8 23 13 21 17 17 Z" fill="rgba(230, 126, 34, 0.25)" stroke="var(--orange)" strokeWidth="1"/>
              <path d="M43 17 C49 13 55 17 58 21 C52 23 47 21 43 17 Z" fill="rgba(230, 126, 34, 0.25)" stroke="var(--orange)" strokeWidth="1"/>
              <path d="M30 32 L30 39 M25 36 L35 36" stroke="var(--gold)" strokeWidth="1.2"/>
              <path d="M14 30 L8 38 M46 30 L52 38" stroke="rgba(229, 217, 182, 0.4)" strokeWidth="1"/>
            </svg>
          </div>

          <h2 className="ws1-sancha-headline">
            Menempa Kesiapan, <em className="ws1-sancha-accent-orange">Mengunci Komitmen</em>
          </h2>
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
                className={`ws1-sancha-tl-entry ${isLeft ? 'is-left' : 'is-right'}`}
              >
                {/* Pin Kotak di Poros Tengah (Persis Referensi) */}
                <div className="ws1-sancha-tl-pin-wrap">
                  <div className="ws1-sancha-tl-pin" />
                </div>

                {/* Garis cabang konektor */}
                <div className="ws1-sancha-tl-branch" />

                {/* Blok Tipografi Murni Tanpa Card */}
                <div className="ws1-sancha-tl-block">
                  {/* Tanggal Besar & Tegas */}
                  <div className="ws1-sancha-tl-date-row">
                    <span className="ws1-sancha-tl-huge-date">{item.date}</span>
                    <span className="ws1-sancha-tl-phase-label">{item.phase}</span>
                  </div>

                  {/* Garis Aksen Oranye dengan detail motif Songket */}
                  <div className="ws1-sancha-tl-orange-line">
                    <span className="ws1-sancha-tl-diamond" />
                  </div>

                  {/* Judul & Deskripsi Narasi */}
                  <h3 className="ws1-sancha-tl-heading">{item.title}</h3>
                  <p className="ws1-sancha-tl-narrative">{item.desc}</p>
                  
                  {/* Venue & Koordinat Ekspedisi Sumatera */}
                  <div className="ws1-sancha-tl-meta-block">
                    <span className="ws1-sancha-tl-venue">{item.location}</span>
                    <span className="ws1-sancha-tl-coord">{item.coordinate}</span>
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
