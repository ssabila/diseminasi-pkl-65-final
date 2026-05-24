import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { animateWebStory2 } from './animations';

const WebStory2 = () => {
  const container = useRef(null);

  useGSAP(() => {
    animateWebStory2(container.current);
  }, { scope: container });

  return (
    <div ref={container} style={{ minHeight: '100vh', padding: '2rem' }}>
      <h1>Web Story 2</h1>
      <p className="animated-text">Ini adalah bagian Web Story 2.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <Link to="/">Kembali ke Landing Page</Link>
      </div>
    </div>
  );
};

export default WebStory2;