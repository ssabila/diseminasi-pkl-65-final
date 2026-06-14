import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './MaulViews.css';

gsap.registerPlugin(ScrollTrigger);

// ==================== ASET VIEW 6 ====================
import imgFasih from '../assets/images/ws1-maul-fasih-v0.webp';
import imgJas from '../assets/images/ws1-maul-jas-v0.webp';
import imgPb from '../assets/images/ws1-maul-pb-v0.webp';
import imgBoots from '../assets/images/ws1-maul-booth-v0.webp';
import imgCard from '../assets/images/ws1-maul-card-v0.webp';
import imgCharger from '../assets/images/ws1-maul-charger-v0.webp';

// ==================== ASET VIEW 8 ====================
import imgPidieJaya from '../assets/images/1-Pidie Jaya.webp';
import imgAcehTengah from '../assets/images/2-Aceh Tengah.webp';
import imgBenerMeriah from '../assets/images/3-Bener Meriah.webp';
import imgGayoLues from '../assets/images/4-Gayo Lues.webp';
import imgAcehUtara from '../assets/images/5-Aceh Utara.webp';
import imgAcehTimur from '../assets/images/6-Aceh Timur.webp';
import imgAcehTamiang from '../assets/images/7-Aceh Tamiang.webp';
import imgTapanuliTengah from '../assets/images/8-Tapanuli Tengah.webp';
import imgKotaSibolga from '../assets/images/9-Kota Sibolga.webp';
// 10 - Tapanuli Utara kosong
import imgTapanuliSelatan from '../assets/images/11-Tapanuli Selatan.webp';
import imgMandailingNatal from '../assets/images/12-Mandailing Natal.webp';
import imgAgam from '../assets/images/13-Agam.webp';
// 14 - Padang Pariaman kosong
import imgTanahDatar from '../assets/images/15-Tanah Datar.webp';

// ==================== DATA VIEW 6 ====================
const amunisiList = [
  { id: 1, src: imgCard, title: "ID Card", desc: "Tanda pengenal resmi petugas PKL R3P STIS" },
  { id: 2, src: imgFasih, title: "Smartphone + FASIH", desc: "Alat pencatat data realtime ke server BPS" },
  { id: 3, src: imgPb, title: "Powerbank", desc: "Menjaga smartphone menyala seharian" },
  { id: 4, src: imgJas, title: "Jas Hujan", desc: "Pelindung tubuh saat cuaca tidak menentu" },
  { id: 5, src: imgCharger, title: "Kabel Data", desc: "Menghubungkan perangkat dan transfer data" },
  { id: 6, src: imgBoots, title: "Sepatu Boots", desc: "Pelindung kaki untuk medan lumpur dan banjir" }
];

// ==================== DATA VIEW 8 ====================
const pklLocations = [
  { id: 1, name: "Pidie Jaya", img: imgPidieJaya },
  { id: 2, name: "Aceh Tengah", img: imgAcehTengah },
  { id: 3, name: "Bener Meriah", img: imgBenerMeriah },
  { id: 4, name: "Gayo Lues", img: imgGayoLues },
  { id: 5, name: "Aceh Utara", img: imgAcehUtara },
  { id: 6, name: "Aceh Timur", img: imgAcehTimur },
  { id: 7, name: "Aceh Tamiang", img: imgAcehTamiang },
  { id: 8, name: "Tapanuli Tengah", img: imgTapanuliTengah },
  { id: 9, name: "Kota Sibolga", img: imgKotaSibolga },
  { id: 10, name: "Tapanuli Utara", img: null },
  { id: 11, name: "Tapanuli Selatan", img: imgTapanuliSelatan },
  { id: 12, name: "Mandailing Natal", img: imgMandailingNatal },
  { id: 13, name: "Agam", img: imgAgam },
  { id: 14, name: "Padang Pariaman", img: null },
  { id: 15, name: "Tanah Datar", img: imgTanahDatar }
];

// ==================== KOMPONEN VIEW 6 ====================
export const View6 = () => {
  const sectionRef = useRef(null);
  const [activeItem, setActiveItem] = useState(null);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.ws1-maul-icon-item')) {
        setActiveItem(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  useGSAP(() => {
    // Header entrance
    gsap.fromTo('.ws1-maul-header h2', { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none none' },
    });
    gsap.fromTo('.ws1-maul-header p', { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none none' },
    });
    // Grid items stagger in
    gsap.fromTo('.ws1-maul-icon-wrapper', { opacity: 0, y: 30, scale: 0.9 }, {
      opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '.ws1-maul-icon-grid', start: 'top 70%', toggleActions: 'play none none none' },
    });
  }, { scope: sectionRef });

  return (
    <section className="ws1-maul-view6" ref={sectionRef}>
      <div className="ws1-maul-header">
        <h2 className="playfair-display">
          Amunisi <span className="ws1-maul-text-orange">Tempur</span>
        </h2>
        <p className="lato-regular">
          Jas hujan, sepatu boots, dan aplikasi digital siap di tangan.
        </p>
      </div>

      <div className="ws1-maul-icon-grid">
        {amunisiList.map((item) => (
          <div 
            key={item.id} 
            className="ws1-maul-icon-wrapper"
            onMouseEnter={() => setActiveItem(item.id)}
            onMouseLeave={() => setActiveItem(null)}
          >
            <div className="ws1-maul-icon-item">
              <img src={item.src} alt={item.title} />
            </div>
            <div className={`ws1-maul-text-container ${activeItem === item.id ? 'show' : ''}`}>
              <div className="ws1-maul-pill-title lato-bold">{item.title}</div>
              <div className="ws1-maul-desc-text lato-regular">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ==================== KOMPONEN VIEW 8 ====================
export const View8 = () => {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAuto, setIsAuto] = useState(false);
  const [orbitRadius, setOrbitRadius] = useState(290);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setOrbitRadius(130);
      } else if (width <= 768) {
        setOrbitRadius(150);
      } else if (width <= 1024) {
        setOrbitRadius(240);
      } else {
        setOrbitRadius(290);
      }
    };
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let interval;
    if (isAuto) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % pklLocations.length);
      }, 2000); 
    }
    return () => clearInterval(interval); 
  }, [isAuto]);

  useGSAP(() => {
    // Header entrance
    gsap.fromTo('.ws1-maul-v8-header', { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none none' },
    });
    // Center display scale up
    gsap.fromTo('.ws1-maul-center-display', { opacity: 0, scale: 0.7 }, {
      opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 60%', toggleActions: 'play none none none' },
    });
    // Orbit items stagger
    gsap.fromTo('.ws1-maul-orbit-item', { opacity: 0, scale: 0 }, {
      opacity: 1, scale: 1, duration: 0.5, stagger: 0.06, ease: 'back.out(1.7)',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 55%', toggleActions: 'play none none none' },
    });
  }, { scope: sectionRef });

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? pklLocations.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % pklLocations.length);
  };

  const selectLocation = (index) => {
    setActiveIndex(index);
    setIsAuto(false);
  };

  const handleLocationKeyDown = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectLocation(index);
    }
  };

  return (
    <section className="ws1-maul-view8" ref={sectionRef}>
      
      <div className="ws1-maul-v8-header">
        <h2 className="playfair-display">
          <span className="ws1-maul-text-navy">Sehat & </span>
          <span className="ws1-maul-text-orange">Solid</span>
        </h2>
        
        <div className="ws1-maul-controls">
          <button className="ws1-maul-btn-round" onClick={handlePrev} aria-label="Lokasi sebelumnya">&lt;</button>
          <button 
            className={`ws1-maul-btn-pill ${isAuto ? 'active' : ''}`} 
            onClick={() => setIsAuto(!isAuto)}
            aria-label={isAuto ? 'Matikan putar otomatis' : 'Nyalakan putar otomatis'}
          >
            {isAuto ? 'Auto Off' : 'Auto On'}
          </button>
          <button className="ws1-maul-btn-round" onClick={handleNext} aria-label="Lokasi berikutnya">&gt;</button>
        </div>
      </div>

      <div className="ws1-maul-gallery-container">
        
        {/* LAYAR UTAMA (LINGKARAN BESAR) */}
        <div className="ws1-maul-center-display">
          {pklLocations[activeIndex].img ? (
            <img 
              src={pklLocations[activeIndex].img} 
              alt={pklLocations[activeIndex].name} 
              className="ws1-maul-center-img"
              key={activeIndex} 
            />
          ) : (
            <div className="ws1-maul-placeholder-center-large">
              {pklLocations[activeIndex].id}
            </div>
          )}

          <div className="ws1-maul-center-overlay"></div>

          <svg className="ws1-maul-curved-text-svg" viewBox="0 0 400 400">
            <path id="curvePath" d="M 40, 210 A 160, 160 0 0, 1 360, 210" fill="transparent" />
            <text className="ws1-maul-svg-text">
              <textPath href="#curvePath" startOffset="50%" textAnchor="middle">
                {pklLocations[activeIndex].name}
              </textPath>
            </text>
          </svg>
        </div>

        {/* LINGKARAN ORBIT (GALERI) */}
        {pklLocations.map((loc, index) => {
          const radius = orbitRadius; 
          const angle = (index / pklLocations.length) * -360; 
          
          const rad = ((angle - 90) * Math.PI) / 180; 
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;

          return (
            <div 
              key={loc.id}
              className={`ws1-maul-orbit-item ${activeIndex === index ? 'active' : ''}`}
              style={{ '--x': `${x}px`, '--y': `${y}px` }}
              onClick={() => selectLocation(index)}
              onKeyDown={(event) => handleLocationKeyDown(event, index)}
              role="button"
              tabIndex={0}
              title={loc.name}
              aria-label={`Tampilkan ${loc.name}`}
            >
              {loc.img ? (
                <img src={loc.img} alt={loc.name} />
              ) : (
                <div className="ws1-maul-placeholder-orbit">{loc.id}</div>
              )}
            </div>
          );
        })}
      </div>

    </section>
  );
};
