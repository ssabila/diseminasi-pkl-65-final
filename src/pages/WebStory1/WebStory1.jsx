import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './WebStory1.css';

import { View0, View4, View9 } from './components/NadiaViews';
import { View5 } from './components/HusnaViews';
import { View6, View8 } from './components/MaulViews';

gsap.registerPlugin(ScrollTrigger);

export default function WebStory1() {
  const containerRef = useRef(null);

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

    // 2. Narrative Bridges reveal
    // Teks puitis/transisi yang muncul perlahan di antara section
    gsap.utils.toArray('.ws1-narrative-bridge').forEach((bridge) => {
      const text = bridge.querySelector('h2');
      
      // Fade in dari bawah
      gsap.fromTo(text, 
        { opacity: 0, y: 50 }, 
        { 
          opacity: 1, y: 0,
          scrollTrigger: {
            trigger: bridge,
            start: 'top 70%',
            end: 'center 50%',
            scrub: true
          }
        }
      );
      
      // Fade out ke atas
      gsap.to(text, {
        opacity: 0, y: -50,
        scrollTrigger: {
          trigger: bridge,
          start: 'center 40%',
          end: 'bottom 20%',
          scrub: true
        }
      });
    });

  }, { scope: containerRef });

  return (
    <div className="webstory1-wrapper" ref={containerRef}>
      
      {/* ── THE GOLDEN THREAD ── */}
      <div className="ws1-golden-thread">
        <div className="ws1-golden-thread-progress"></div>
      </div>

      {/* View 0: Cover (Nadia) */}
      <View0 />
      
      {/* Bridge 1: Transisi ke Lapangan */}
      <div className="ws1-narrative-bridge">
        <div className="ws1-nb-content">
          <h2>Mereka disebar ke tiga provinsi.<br/>Kini, perjuangan sesungguhnya dimulai...</h2>
        </div>
      </div>

      {/* View 4: Deployment (Nadia) */}
      <View4 />
      
      {/* View 5: Inti Lapangan (Husna) */}
      <View5 />
      
      {/* View 6: Amunisi Tempur (Maul) */}
      <View6 />
      
      {/* Bridge 2: Transisi ke Kekompakan */}
      <div className="ws1-narrative-bridge">
        <div className="ws1-nb-content">
          <h2>Di balik medan yang menantang,<br/>tersimpan kekompakan yang tak tergoyahkan.</h2>
        </div>
      </div>
      
      {/* View 8: Sehat dan Solid (Maul) */}
      <View8 />
      
      {/* View 9: Closing Visual (Nadia) */}
      <View9 />
    </div>
  );
}