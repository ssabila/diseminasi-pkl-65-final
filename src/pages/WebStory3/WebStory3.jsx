import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { animateWebStory3 } from './animations';
import './WebStory3.css';

// Import sections and components
import MapBackground from './components/MapBackground';
import Opening from './section1-opening/Opening';
import Urgency from './section2-urgency/Urgency';

const WebStory3 = () => {
  const container = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);

  useGSAP(() => {
    if (!mapInstance) return;
    
    // We pass the container and the map instance to the animation file
    animateWebStory3(container.current, mapInstance);
  }, { scope: container, dependencies: [mapInstance] });

  return (
    <div ref={container} className="webstory3-container" style={{ position: 'relative' }}>
      {/* Sticky background layer */}
      <MapBackground onMapLoad={setMapInstance} />
      
      {/* Scrollable sections overlay */}
      <div className="webstory3-sections" style={{ position: 'relative', zIndex: 10 }}>
        <Opening />
        <Urgency />
        
        {/* Other sections will be added here */}
        
        {/* Tombol kembali sementara untuk navigasi */}
        <div style={{ position: 'relative', zIndex: 99, padding: '2rem', textAlign: 'center', height: '50vh' }}>
          <Link to="/" style={{ color: 'var(--off-white)', textDecoration: 'underline' }}>
            Kembali ke Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WebStory3;