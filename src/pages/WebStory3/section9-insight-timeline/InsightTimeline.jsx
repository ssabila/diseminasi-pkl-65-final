import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './InsightTimeline.css';

import tlSebelum from '../geojson-data/timeline_sebelum.geojson?url';
import tlPuncak from '../geojson-data/timeline_puncak.geojson?url';
import tlSurut from '../geojson-data/timeline_surut.geojson?url';
import tlSinyal from '../geojson-data/timeline_sinyal.geojson?url';
import tlPemulihan from '../geojson-data/timeline_pemulihan.geojson?url';
import { useSharedMap } from '../SharedMapProvider';

gsap.registerPlugin(ScrollTrigger);

const TIMELINE_STAGES = [
  { id: 'sebelum', title: 'Kondisi Normal', desc: 'Sebelum bencana terjadi, aktivitas berjalan seperti biasa tanpa ada tanda-tanda gangguan.', source: tlSebelum, color: '#3b82f6' },
  { id: 'puncak', title: 'Puncak Bencana', desc: 'Intensitas bencana mencapai puncaknya, berdampak luas pada wilayah dan memutus akses.', source: tlPuncak, color: '#ef4444' },
  { id: 'surut', title: 'Banjir Surut', desc: 'Air mulai surut, menyingkap tingkat kerusakan yang ditinggalkan pada infrastruktur dan alam.', source: tlSurut, color: '#f97316' },
  { id: 'sinyal', title: 'Sinyal Awal', desc: 'Bantuan tiba dan aktivitas mulai menunjukkan tanda-tanda kehidupan kembali meskipun terbatas.', source: tlSinyal, color: '#eab308' },
  { id: 'pemulihan', title: 'Pemulihan', desc: 'Wilayah mulai pulih, infrastruktur diperbaiki, dan masyarakat perlahan bangkit kembali.', source: tlPemulihan, color: '#22c55e' }
];

export default function InsightTimeline() {
  const sectionRef = useRef(null);
  const { map, mapReady } = useSharedMap();
  const [layersAdded, setLayersAdded] = useState(false);
  const stagesRef = useRef([]);

  useEffect(() => {
    if (!mapReady || !map) return;

    TIMELINE_STAGES.forEach((stage, idx) => {
      // Add Source
      if (!map.getSource(`tl-${stage.id}-source`)) {
        map.addSource(`tl-${stage.id}-source`, {
          type: 'geojson',
          data: stage.source
        });
      }

      // Add Layer 
      if (!map.getLayer(`tl-${stage.id}-layer`)) {
        map.addLayer({
          id: `tl-${stage.id}-layer`,
          type: 'circle',
          source: `tl-${stage.id}-source`,
          paint: {
            'circle-radius': 8,
            'circle-color': stage.color,
            'circle-opacity': 0, // Start everything completely hidden so it doesn't leak into InsightVulnerability
            'circle-blur': 0.2
          }
        });
      }
    });

    setLayersAdded(true);

    return () => {
      // Leave layers on the map for smooth crossfading
    };
  }, [mapReady, map]);

  useGSAP(() => {
    if (!layersAdded || !map) return;

    const s = sectionRef.current;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: s,
        start: 'top top',
        end: '+=400%', // Long pin for 5 stages
        scrub: 0.5,
        pin: true,
      },
    });

    // Fade IN first stage map layer right at the beginning
    tl.to({}, {
      duration: 0.05,
      onUpdate: function() {
        const progress = this.progress();
        if (map.getLayer(`tl-sebelum-layer`)) {
          map.setPaintProperty(`tl-sebelum-layer`, 'circle-opacity', progress * 0.8);
        }
      }
    });

    // Content fade in
    tl.fromTo(s.querySelector('.insight-content'), 
      { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.1 });

    // Iterate through stages to create crossfades
    const stepDuration = 1 / (TIMELINE_STAGES.length - 1);

    let currentActiveIdx = 0;

    TIMELINE_STAGES.forEach((stage, idx) => {
      if (idx === 0) return; // Skip first as it's the starting state
      
      const prevStage = TIMELINE_STAGES[idx - 1];

      // At each step, fade out previous layer, fade in current layer
      tl.to({}, {
        duration: stepDuration,
        onUpdate: function() {
          const progress = this.progress();
          
          // Crossfade Map Layers
          if (map.getLayer(`tl-${prevStage.id}-layer`)) {
            map.setPaintProperty(`tl-${prevStage.id}-layer`, 'circle-opacity', (1 - progress) * 0.8);
          }
          if (map.getLayer(`tl-${stage.id}-layer`)) {
            map.setPaintProperty(`tl-${stage.id}-layer`, 'circle-opacity', progress * 0.8);
          }
          
          // Update Active Text State via DOM to avoid React re-renders during scroll
          const newIdx = progress > 0.5 ? idx : idx - 1;
          if (newIdx !== currentActiveIdx) {
            if (stagesRef.current[currentActiveIdx]) {
              stagesRef.current[currentActiveIdx].classList.remove('active');
            }
            if (stagesRef.current[newIdx]) {
              stagesRef.current[newIdx].classList.add('active');
            }
            currentActiveIdx = newIdx;
          }
        }
      }, `>-${stepDuration * 0.2}`); // Slight overlap for smooth transition
    });

    // Fade OUT the final layer when exiting the entire timeline section!
    tl.to({}, {
      duration: 0.1,
      onUpdate: function() {
        const progress = this.progress();
        const lastStage = TIMELINE_STAGES[TIMELINE_STAGES.length - 1];
        if (map.getLayer(`tl-${lastStage.id}-layer`)) {
          map.setPaintProperty(`tl-${lastStage.id}-layer`, 'circle-opacity', (1 - progress) * 0.8);
        }
      }
    });

  }, [layersAdded, map]);

  return (
    <section ref={sectionRef} id="section9-insighttimeline" className="section section-insighttimeline" style={{ background: 'transparent' }}>
      <div className="starfield">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="star" style={{
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            '--dur': `${2 + Math.random() * 4}s`, '--delay': `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      <div className="insight-layout">
        <div className="insight-content tl-content">
          <span className="insight-subtitle">Section 8: Modul 7</span>
          <h2 className="insight-title">Perjalanan<br />Bencana</h2>
          
          <div className="tl-stages-container">
            {TIMELINE_STAGES.map((stage, idx) => (
              <div 
                key={stage.id} 
                ref={el => stagesRef.current[idx] = el}
                className={`tl-stage ${idx === 0 ? 'active' : ''}`}
              >
                <div className="tl-stage-header">
                  <span className="tl-dot" style={{ backgroundColor: stage.color }} />
                  <h3>{stage.title}</h3>
                </div>
                <div className="tl-stage-body">
                  <p>{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
