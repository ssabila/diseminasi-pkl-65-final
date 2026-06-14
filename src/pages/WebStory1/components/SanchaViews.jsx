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
  { id: 1, date: "12 JAN", title: "Pembekalan & Pengarahan Umum", desc: "Seluruh 510 mahasiswa berkumpul di Aula STIS untuk pembukaan resmi program R3P 2026." },
  { id: 2, date: "13 JAN", title: "Pelatihan Teknis Lapangan", desc: "Simulasi penggunaan aplikasi FASIH dan teknik wawancara door-to-door." },
  { id: 3, date: "14 JAN", title: "Konsolidasi Tim Provinsi", desc: "Pembagian kelompok kerja dan briefing khusus per wilayah target." },
  { id: 4, date: "15 JAN", title: "Pelepasan Resmi", desc: "Upacara pelepasan oleh pimpinan kampus sebelum terjun ke lokasi masing-masing." }
];

export const View1 = () => {
  const sectionRef = useRef(null);

  useGSAP(() => {
    // Animate the curving line
    gsap.fromTo('.ws1-sancha-tl-path', 
      { strokeDasharray: 1000, strokeDashoffset: 1000 },
      { 
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 50%',
          end: 'bottom 50%',
          scrub: true
        }
      }
    );

    // Animate the cards
    gsap.utils.toArray('.ws1-sancha-tl-card-wrap').forEach((card, i) => {
      gsap.fromTo(card, 
        { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
        { 
          opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
      
      // Animate the dot
      const dot = card.querySelector('.ws1-sancha-tl-dot');
      gsap.fromTo(dot,
        { scale: 0 },
        { scale: 1, duration: 0.5, ease: 'back.out(2)', scrollTrigger: { trigger: card, start: 'top 80%' } }
      );
    });
  }, { scope: sectionRef });

  return (
    <section className="ws1-sancha-view1" ref={sectionRef}>
      <div className="ws1-sancha-tl-container">
        
        {/* Curving SVG Line Background */}
        <svg className="ws1-sancha-tl-svg" viewBox="0 0 100 800" preserveAspectRatio="none">
          <path className="ws1-sancha-tl-path" d="M 50 0 Q 30 200 50 400 T 50 800" vectorEffect="non-scaling-stroke" />
        </svg>

        {timelineData.map((item, index) => (
          <div key={item.id} className={`ws1-sancha-tl-card-wrap ${index % 2 === 0 ? 'left' : 'right'}`}>
            <div className="ws1-sancha-tl-card">
              <span className="ws1-sancha-tl-date">{item.date}</span>
              <h3 className="ws1-sancha-tl-title">{item.title}</h3>
              <p className="ws1-sancha-tl-desc">{item.desc}</p>
            </div>
            <div className="ws1-sancha-tl-dot"></div>
          </div>
        ))}
        
      </div>
    </section>
  );
};

export const View2 = () => {
  const sectionRef = useRef(null);

  useGSAP(() => {
    // Heading fade in
    gsap.fromTo('.ws1-sancha-v2-header', { opacity: 0, x: -50 }, {
      opacity: 1, x: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' }
    });

    // Cards staggered fade in and slight rotation
    gsap.fromTo('.ws1-sancha-v2-doc', 
      { opacity: 0, y: 50, rotation: 0 },
      { 
        opacity: 1, y: 0, 
        rotation: (i) => [-2, 1.5, -1.5, 2][i % 4], // Tidy, symmetrical slight rotations
        duration: 1, stagger: 0.1, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: '.ws1-sancha-v2-gallery', start: 'top 80%' }
      }
    );
  }, { scope: sectionRef });

  return (
    <section className="ws1-sancha-view2" ref={sectionRef}>
      <div className="ws1-sancha-v2-container">
        
        <div className="ws1-sancha-v2-header">
          <h2 className="ws1-sancha-v2-heading">
            <span className="ws1-sancha-v2-orange">Ditempa Sebelum</span> Diterjunkan
          </h2>
        </div>
        
        <div className="ws1-sancha-v2-gallery">
          <div className="ws1-sancha-v2-doc">
            <img src={imgCard1} alt="Pelatihan 1" />
          </div>
          <div className="ws1-sancha-v2-doc">
            <img src={imgCard2} alt="Pelatihan 2" />
          </div>
          <div className="ws1-sancha-v2-doc">
            <img src={imgCard3} alt="Pelatihan 3" />
          </div>
          <div className="ws1-sancha-v2-doc">
            <img src={imgCard4} alt="Pelatihan 4" />
          </div>
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
