import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createLeafletMapAdapter } from '../../utils/leafletMapAdapter';

const MapContext = createContext();

export const useSharedMap = () => useContext(MapContext);

export const SharedMapProvider = ({ children }) => {
  const mapContainerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      const adapter = createLeafletMapAdapter(mapContainerRef.current, {
        center: [99.8, 2.2],
        zoom: 6
      });
      setMapInstance(adapter);
      setMapReady(true);
      return () => {
        if (adapter) adapter.remove();
      };
    }

    mapboxgl.accessToken = token;
    let map;
    try {
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/gitraya1400/cmq40zowb006p01s36hi56mpa',
        center: [99.8, 2.2], // Shared center point for all modules
        zoom: 6.1,
        pitch: 30,
        bearing: -5,
        interactive: false,
        attributionControl: false
      });
    } catch (err) {
      console.warn("SharedMapProvider fallback to Leaflet:", err);
      const adapter = createLeafletMapAdapter(mapContainerRef.current, {
        center: [99.8, 2.2],
        zoom: 6
      });
      setMapInstance(adapter);
      setMapReady(true);
      return () => {
        if (adapter) adapter.remove();
      };
    }

    map.on('load', () => {
      setMapInstance(map);
      setMapReady(true);
    });

    const resizeObserver = new ResizeObserver(() => {
      if (map) map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (map) map.remove();
    };
  }, []);

  return (
    <MapContext.Provider value={{ map: mapInstance, mapReady }}>
      {/* 
        This is the single, fixed map instance for the entire scrollytelling experience. 
        It sits behind the content and won't scroll away! 
      */}
      <div 
        id="shared-map-bg"
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          zIndex: 0,
          pointerEvents: 'none',
          background: '#050614',
          opacity: 0, // Mulai tersembunyi, fade-in diatur oleh GSAP di animations.js
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* The narrative sections will be rendered here and scroll normally over the map */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </MapContext.Provider>
  );
};
