import React, { useEffect, useRef, useState, Component } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './WebStory3.css';

import Opening from './section1-opening/Opening';
import Urgency from './section2-urgency/Urgency';
import BigDataAnswers from './section3-bigdata-answers/BigDataAnswers';
import GlobeTransition from './section4-globe-transition/GlobeTransition';
import InsightEnv from './section5-insight-env/InsightEnv';
import InsightDamage from './section6-insight-damage/InsightDamage';
import InsightNTL from './section7-insight-ntl/InsightNTL';
import InsightVulnerability from './section8-insight-vulnerability/InsightVulnerability';
import InsightTimeline from './section9-insight-timeline/InsightTimeline';
import InsightRecovery from './section10-insight-recovery/InsightRecovery';
import ModuleMenu from './section11-module-menu/ModuleMenu';
import Closing from './section12-closing/Closing';
import MapBackground from './components/MapBackground';
import { MapContext } from './MapContext';
import { animateWebStory3 } from './animations';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true, error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#333', color: 'white', height: '100vh', overflow: 'auto' }}>
          <h2>React Crashed!</h2>
          <details open style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

const WebStory3 = () => {
  const container = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    const tickerFn = (time) => { lenis.raf(time * 1000); };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerFn);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  const handleMapLoad = (map) => {
    setMapInstance(map);
    setMapReady(true);
  };

  useGSAP(() => {
    if (!mapInstance) return;
    animateWebStory3(container.current, mapInstance);
  }, { scope: container, dependencies: [mapInstance] });

  return (
    <ErrorBoundary>
      <div ref={container} className="webstory3-container webstory3" style={{ position: 'relative' }}>
        {/* Satu Mapbox instance untuk seluruh WebStory */}
        <MapBackground onMapLoad={handleMapLoad} />

        {/* Sediakan map instance ke semua section via Context */}
        <MapContext.Provider value={{ map: mapInstance, mapReady }}>
          <div className="webstory3-sections" style={{ position: 'relative', zIndex: 10 }}>
            <Opening />
            <Urgency />
            <BigDataAnswers />
            <GlobeTransition />
            <InsightEnv />
            <InsightDamage />
            <InsightNTL />
            <InsightVulnerability />
            <InsightTimeline />
            <InsightRecovery />
            <ModuleMenu />
            <Closing />

            {/* Tombol kembali sementara untuk navigasi */}
            <div style={{ position: 'relative', zIndex: 99, padding: '2rem', textAlign: 'center', height: '50vh' }}>
              <Link to="/" style={{ color: 'var(--off-white)', textDecoration: 'underline' }}>
                Kembali ke Landing Page
              </Link>
            </div>
          </div>
        </MapContext.Provider>
      </div>
    </ErrorBoundary>
  );
};

export default WebStory3;