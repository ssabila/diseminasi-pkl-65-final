import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { animateWebStory1 } from './animations';

const WebStory1 = () => {
  const container = useRef(null);

  useGSAP(() => {
    animateWebStory1(container.current);
  }, { scope: container });

  return (
    <div ref={container} style={{ minHeight: '100vh', padding: '2rem' }}>
      <h1>Web Story 1</h1>
      <p className="animated-text">Ini adalah bagian Web Story 1.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <Link to="/">Kembali ke Landing Page</Link>
      </div>
    </div>
  );
};

export default WebStory1;