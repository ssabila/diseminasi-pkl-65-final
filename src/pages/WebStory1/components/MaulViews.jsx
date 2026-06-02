import React, { useState, useEffect } from 'react';
import './MaulViews.css';

// ==================== ASET VIEW 6 ====================
import imgFasih from '../assets/images/ws1-maul-fasih-v0.png';
import imgJas from '../assets/images/ws1-maul-jas-v0.png';
import imgPb from '../assets/images/ws1-maul-pb-v0.png';
import imgBoots from '../assets/images/ws1-maul-booth-v0.png';
import imgCard from '../assets/images/ws1-maul-card-v0.png';
import imgCharger from '../assets/images/ws1-maul-charger-v0.png';

// ==================== ASET VIEW 8 ====================
import imgPidieJaya from '../assets/images/1-Pidie Jaya.png';
import imgAcehTengah from '../assets/images/2-Aceh Tengah.png';
import imgBenerMeriah from '../assets/images/3-Bener Meriah.png';
import imgGayoLues from '../assets/images/4-Gayo Lues.png';
import imgAcehUtara from '../assets/images/5-Aceh Utara.png';
import imgAcehTimur from '../assets/images/6-Aceh Timur.png';
import imgAcehTamiang from '../assets/images/7-Aceh Tamiang.png';
import imgTapanuliTengah from '../assets/images/8-Tapanuli Tengah.png';
import imgKotaSibolga from '../assets/images/9-Kota Sibolga.png';
// 10 - Tapanuli Utara kosong
import imgTapanuliSelatan from '../assets/images/11-Tapanuli Selatan.png';
import imgMandailingNatal from '../assets/images/12-Mandailing Natal.png';
import imgAgam from '../assets/images/13-Agam.png';
// 14 - Padang Pariaman kosong
import imgTanahDatar from '../assets/images/15-Tanah Datar.png';

// ==================== DATA VIEW 6 ====================
const amunisiList = [
  { id: 1, src: imgCard, title: "ID Card", desc: "Tanda pengenal resmi petugas PKL R3P STIS" },
  { id: 2, src: imgFasih, title: "Smartphone + FASIH", desc: "Alat pencatat data realtime ke server BPS. GPS aktif untuk verifikasi lokasi responden" },
  { id: 3, src: imgPb, title: "Powerbank + charger", desc: "Menjaga smartphone menyala seharian" },
  { id: 4, src: imgJas, title: "Jas Hujan", desc: "Pelindung tubuh saat cuaca tidak menentu di lapangan" },
  { id: 5, src: imgCharger, title: "Kabel Data", desc: "Menghubungkan perangkat dan transfer data" },
  { id: 6, src: imgBoots, title: "Sepatu Boots", desc: "Pelindung medan lumpur. Melindungi kaki saat melewati medan berlumpur & banjir" }
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
  const [activeItem, setActiveItem] = useState(null);

  return (
    <section className="ws1-maul-view6">
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
            {activeItem === item.id && (
              <div className="ws1-maul-text-container">
                <div className="ws1-maul-pill-title lato-bold">{item.title}</div>
                <div className="ws1-maul-desc-text lato-regular">{item.desc}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// ==================== KOMPONEN VIEW 8 ====================
export const View8 = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAuto, setIsAuto] = useState(false);

  useEffect(() => {
    let interval;
    if (isAuto) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % pklLocations.length);
      }, 2000); 
    }
    return () => clearInterval(interval); 
  }, [isAuto]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? pklLocations.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % pklLocations.length);
  };

  return (
    <section className="ws1-maul-view8">
      
      <div className="ws1-maul-v8-header">
        <h2 className="playfair-display">
          <span className="ws1-maul-text-navy">Sehat & </span>
          <span className="ws1-maul-text-orange">Solid</span>
        </h2>
        
        <div className="ws1-maul-controls">
          <button className="ws1-maul-btn-round" onClick={handlePrev}>&lt;</button>
          <button 
            className={`ws1-maul-btn-pill ${isAuto ? 'active' : ''}`} 
            onClick={() => setIsAuto(!isAuto)}
          >
            {isAuto ? 'Auto Off' : 'Auto On'}
          </button>
          <button className="ws1-maul-btn-round" onClick={handleNext}>&gt;</button>
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
          const radius = 290; 
          const angle = (index / pklLocations.length) * -360; 
          
          const rad = ((angle - 90) * Math.PI) / 180; 
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;

          return (
            <div 
              key={loc.id}
              className={`ws1-maul-orbit-item ${activeIndex === index ? 'active' : ''}`}
              /* PERHATIAN: Ini baris yang paling penting agar foto tidak lari ke tengah */
              style={{ '--x': `${x}px`, '--y': `${y}px` }}
              onClick={() => {
                setActiveIndex(index);
                setIsAuto(false); 
              }}
              title={loc.name}
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