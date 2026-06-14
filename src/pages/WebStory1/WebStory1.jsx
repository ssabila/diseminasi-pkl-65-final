import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './WebStory1.css';

import { View0, View4, View9 } from './components/NadiaViews';
import { View1, View2, View3 } from './components/SanchaViews';
import { View5, View7 } from './components/HusnaViews';
import { View6, View8 } from './components/MaulViews';

gsap.registerPlugin(ScrollTrigger);

export default function WebStory1() {
  const containerRef = useRef(null);
  const [activeChapter, setActiveChapter] = useState(0);
  
  // Audio & Cursor
  const cursorRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('ws1-story-scrollbars-hidden');
    return () => document.body.classList.remove('ws1-story-scrollbars-hidden');
  }, []);

  useGSAP(() => {
    // 1. Golden Thread Animation
    // Garis bercahaya yang tumbuh memanjang ke bawah mengikuti scroll keseluruhan
    gsap.to('.ws1-golden-thread-progress', {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    });

    // Chapter Triggers for Storytelling Navigation
    const chapters = [
      { selector: '.ws1-nadia-view0', id: 0 },
      { selector: '.ws1-sancha-view1', id: 1 },
      { selector: '.ws1-nadia-view4', id: 2 },
      { selector: '.ws1-maul-view6', id: 3 },
      { selector: '.ws1-nadia-view9', id: 4 }
    ];

    chapters.forEach((ch) => {
      ScrollTrigger.create({
        trigger: ch.selector,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) setActiveChapter(ch.id);
        }
      });
    });

    // Custom Cursor
    const cursor = cursorRef.current;
    if (cursor) {
      gsap.set(cursor, { xPercent: -50, yPercent: -50 });
      const xTo = gsap.quickTo(cursor, "x", {duration: 0.2, ease: "power3"});
      const yTo = gsap.quickTo(cursor, "y", {duration: 0.2, ease: "power3"});

      const onMouseMove = (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };

      const onMouseHover = () => gsap.to(cursor, { scale: 2, backgroundColor: 'rgba(230, 126, 34, 0.2)', border: '1px solid rgba(230, 126, 34, 0.8)' });
      const onMouseLeaveHover = () => gsap.to(cursor, { scale: 1, backgroundColor: 'transparent', border: '2px solid rgba(229, 217, 182, 0.5)' });

      window.addEventListener("mousemove", onMouseMove);
      
      const interactives = containerRef.current?.querySelectorAll('button, a, .v4-map-loc, .v4-brief-stack-card, .ws1-maul-icon-item, .ws1-husna-bento-tile, .ws1-maul-orbit-item') ?? [];
      interactives.forEach(el => {
        el.addEventListener('mouseenter', onMouseHover);
        el.addEventListener('mouseleave', onMouseLeaveHover);
      });

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        interactives.forEach(el => {
          el.removeEventListener('mouseenter', onMouseHover);
          el.removeEventListener('mouseleave', onMouseLeaveHover);
        });
      };
    }

    // Narrative bridges have been removed per user request

  }, { scope: containerRef });

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch {
          setIsPlaying(false);
        }
      }
    }
  };

  return (
    <div className="webstory1-wrapper" ref={containerRef}>
      
      {/* ── CUSTOM CURSOR ── */}
      <div className="ws1-custom-cursor" ref={cursorRef} />

      {/* ── AUDIO BGM ── */}
      <audio 
        ref={audioRef} 
        src="https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" 
        loop 
        preload="none"
      />
      <button
        className={`ws1-audio-toggle ${isPlaying ? 'playing' : ''}`}
        onClick={toggleAudio}
        title={isPlaying ? 'Matikan audio' : 'Nyalakan audio'}
        aria-label={isPlaying ? 'Matikan audio latar' : 'Nyalakan audio latar'}
      >
        {isPlaying ? 'ON' : 'OFF'}
      </button>

      {/* ── THE GOLDEN THREAD ── */}
      <div className="ws1-golden-thread">
        <div className="ws1-golden-thread-progress"></div>
      </div>

      {/* ── CHAPTER TRACKER ── */}
      <div className="ws1-chapter-tracker">
        <div className={`ws1-chapter-item ${activeChapter === 0 ? 'active' : ''}`}>
          <div className="ws1-chapter-dot" />
          <span className="ws1-chapter-label">Misi</span>
        </div>
        <div className={`ws1-chapter-item ${activeChapter === 1 ? 'active' : ''}`}>
          <div className="ws1-chapter-dot" />
          <span className="ws1-chapter-label">Persiapan</span>
        </div>
        <div className={`ws1-chapter-item ${activeChapter === 2 ? 'active' : ''}`}>
          <div className="ws1-chapter-dot" />
          <span className="ws1-chapter-label">Lapangan</span>
        </div>
        <div className={`ws1-chapter-item ${activeChapter === 3 ? 'active' : ''}`}>
          <div className="ws1-chapter-dot" />
          <span className="ws1-chapter-label">Alat & Tim</span>
        </div>
        <div className={`ws1-chapter-item ${activeChapter === 4 ? 'active' : ''}`}>
          <div className="ws1-chapter-dot" />
          <span className="ws1-chapter-label">Penutup</span>
        </div>
      </div>

      {/* View 0: Cover (Nadia) */}
      <View0 />
      
      {/* View 1-3: Sancha */}
      <View1 />
      <View2 />
      <View3 />

      {/* View 4: Deployment (Nadia) */}
      <View4 />
      
      {/* View 5: Inti Lapangan (Husna) */}
      <View5 />
      
      {/* View 6: Amunisi Tempur (Maul) */}
      <View6 />

      {/* View 7: Tantangan Melawan Medan (Husna) */}
      <View7 />

      {/* View 8: Sehat dan Solid (Maul) */}
      <View8 />
      
      {/* View 9: Closing Visual (Nadia) */}
      <View9 />
    </div>
  );
}
