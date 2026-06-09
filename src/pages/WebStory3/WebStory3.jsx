import React, { useEffect, useRef, Component } from 'react';
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
import { SharedMapProvider } from './SharedMapProvider';

gsap.registerPlugin(ScrollTrigger);

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo
    });
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

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <ErrorBoundary>
      <div ref={container} className="webstory3">
        <Opening />
        <Urgency />
        <BigDataAnswers />
        <GlobeTransition />

        <SharedMapProvider>
          <InsightEnv />
          <InsightDamage />
          <InsightNTL />
          <InsightVulnerability />
          <InsightTimeline />
        </SharedMapProvider>

        <InsightRecovery />
        <ModuleMenu />
        <Closing />
      </div>
    </ErrorBoundary>
  );
};

export default WebStory3;