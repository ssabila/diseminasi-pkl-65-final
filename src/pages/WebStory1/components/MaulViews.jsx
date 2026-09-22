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
import imgJaket from '../assets/images/ws1-maul-jaket-v0.webp';
import maskot1 from '../assets/images/ws1-maskot_1.webp';

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
import imgTapanuliSelatan from '../assets/images/11-Tapanuli Selatan.webp';
import imgMandailingNatal from '../assets/images/12-Mandailing Natal.webp';
import imgAgam from '../assets/images/13-Agam.webp';
import imgTanahDatar from '../assets/images/15-Tanah Datar.webp';

// ==================== DATA VIEW 6 ====================
const amunisiItems = [
  { id: 'card', name: 'ID Card & Badge', icon: imgCard },
  { id: 'fasih', name: 'Smartphone FASIH', icon: imgFasih },
  { id: 'pb', name: 'Powerbank Taktis', icon: imgPb },
  { id: 'jas', name: 'Jas Hujan', icon: imgJas },
  { id: 'jaket', name: 'Jaket Lapangan', icon: imgJaket },
  { id: 'boots', name: 'Sepatu Boots', icon: imgBoots },
];

// ==================== KOMPONEN VIEW 6 (SINGLE MASKOT & ORBITAL AMUNISI) ====================
export const View6 = () => {
  const sectionRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);

  useGSAP(() => {
    // Header entrance
    gsap.fromTo('.ws1-amunisi-header', 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
    );

    // Mascot entrance
    gsap.fromTo('.ws1-amunisi-mascot-single',
      { opacity: 0, scale: 0.8, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'back.out(1.5)', scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
    );

    // Gear orbs entrance
    gsap.fromTo('.ws1-orbit-node',
      { opacity: 0, scale: 0.4 },
      {
        opacity: 1, scale: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: 'back.out(1.8)',
        scrollTrigger: {
          trigger: '.ws1-amunisi-constellation',
          start: 'top 75%',
        }
      }
    );

  }, { scope: sectionRef });

  return (
    <section className="ws1-maul-view6" ref={sectionRef}>
      <div className="ws1-maul-grid-overlay" />
      
      <div className="ws1-amunisi-stage">
        {/* Header Bersih */}
        <div className="ws1-amunisi-header">
          <span className="ws1-amunisi-kicker">PERLENGKAPAN LAPANGAN</span>
          <h2 className="ws1-amunisi-title">
            Amunisi <span className="ws1-amunisi-accent">Tempur</span>
          </h2>
          <p className="ws1-amunisi-subtitle">
            Enam bekal penting penjaga kelancaran data di medan penugasan.
          </p>
        </div>

        {/* Constellation Stage: Mascot Center + Orbiting Gear Logos */}
        <div className="ws1-amunisi-constellation">
          {/* Subtle Concentric Glowing Radar Rings */}
          <div className="ws1-orbit-ring ring-outer" />
          <div className="ws1-orbit-ring ring-mid" />

          {/* Left Wing Gear (3 items) */}
          <div className="ws1-orbit-wing wing-left">
            {amunisiItems.slice(0, 3).map((item) => (
              <div 
                key={item.id}
                className={`ws1-orbit-node node-${item.id} ${hoveredId === item.id ? 'is-hovered' : ''}`}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="ws1-orbit-icon-wrap">
                  <div className="ws1-orbit-icon-glow" />
                  <img src={item.icon} alt={item.name} loading="lazy" />
                </div>
                <span className="ws1-orbit-label">{item.name}</span>
              </div>
            ))}
          </div>

          {/* Center Mascot (Single, Waving Explorer Mascot) */}
          <div className="ws1-orbit-center-mascot">
            <div className="ws1-mascot-pedestal-glow" />
            <img 
              src={maskot1} 
              alt="Maskot Penjelajah PKL 65" 
              className="ws1-amunisi-mascot-single"
            />
          </div>

          {/* Right Wing Gear (3 items) */}
          <div className="ws1-orbit-wing wing-right">
            {amunisiItems.slice(3, 6).map((item) => (
              <div 
                key={item.id}
                className={`ws1-orbit-node node-${item.id} ${hoveredId === item.id ? 'is-hovered' : ''}`}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="ws1-orbit-icon-wrap">
                  <div className="ws1-orbit-icon-glow" />
                  <img src={item.icon} alt={item.name} loading="lazy" />
                </div>
                <span className="ws1-orbit-label">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

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
  { id: 11, name: "Tapanuli Selatan", img: imgTapanuliSelatan },
  { id: 12, name: "Mandailing Natal", img: imgMandailingNatal },
  { id: 13, name: "Agam", img: imgAgam },
  { id: 15, name: "Tanah Datar", img: imgTanahDatar }
];

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
    handleResize();
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
    gsap.fromTo('.ws1-maul-v8-header', { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
    // Center display scale up
    gsap.fromTo('.ws1-maul-center-display', { opacity: 0, scale: 0.8 }, {
      opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
    });
    // Orbit items stagger
    gsap.fromTo('.ws1-maul-orbit-item', { opacity: 0, scale: 0 }, {
      opacity: 1, scale: 1, duration: 0.4, stagger: 0.04, ease: 'back.out(1.7)',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none reverse' },
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
        <h2>
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
          <img
            src={pklLocations[activeIndex].img}
            alt={pklLocations[activeIndex].name}
            className="ws1-maul-center-img"
            key={activeIndex}
          />

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
              <img src={loc.img} alt={loc.name} loading="lazy" />
            </div>
          );
        })}
      </div>

    </section>
  );
};
