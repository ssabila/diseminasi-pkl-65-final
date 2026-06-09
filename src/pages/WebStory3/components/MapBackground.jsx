import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import starBg from '../../../assets/images/background-star.png';
import './MapBackground.css';

export default function MapBackground({ onMapLoad }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/gitraya1400/cmq40zowb006p01s36hi56mpa',
      projection: 'globe',
      zoom: 1.5,
      center: [100, -2],
      interactive: false,
      attributionControl: false,
      antialias: true,
    });

    const map = mapRef.current;

    map.on('style.load', () => {
      map.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgba(0, 0, 0, 0)',
        'star-intensity': 0,
      });
    });

    map.isSpinning = true;
    let animationId;
    let spinEnabled = true;
    const secondsPerRevolution = 120;

    function spinGlobe() {
      if (spinEnabled && map && map.isSpinning) {
        const distancePerSecond = 360 / secondsPerRevolution;
        const center = map.getCenter();
        center.lng -= distancePerSecond / 60;
        map.jumpTo({ center, zoom: map.getZoom() });
        animationId = requestAnimationFrame(spinGlobe);
      } else if (spinEnabled && map) {
        // Keep the loop running but don't move the map
        animationId = requestAnimationFrame(spinGlobe);
      }
    }

    map.on('load', () => {
      const layers = map.getStyle().layers;
      const bgLayer = layers.find((l) => l.type === 'background');
      if (bgLayer) {
        map.setPaintProperty(bgLayer.id, 'background-color', 'rgba(0,0,0,0)');
        map.setPaintProperty(bgLayer.id, 'background-opacity', 0);
      }
      spinGlobe();

      if (onMapLoad) {
        onMapLoad(map);
      }
    });

    return () => {
      spinEnabled = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (mapRef.current) mapRef.current.remove();
    };
  }, [onMapLoad]);

  return (
    <div className="map-background-wrapper" id="global-map-bg">
      <div
        className="map-stars"
        aria-hidden="true"
        style={{ backgroundImage: `url(${starBg})` }}
      />
      <div className="map-container" id="global-map-container">
        <div ref={mapContainerRef} className="mapbox-globe" />
      </div>
    </div>
  );
}
