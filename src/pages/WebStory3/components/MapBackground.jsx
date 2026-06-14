import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import satelliteUrl from '../section1-opening/assets/space_satellite.glb?url';
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
        // Warna atmosfer di cakrawala (bagian bawah) — biru langit cerah
        color: 'rgb(135, 185, 235)',
        // Warna atmosfer di lapisan atas — biru lebih dalam
        'high-color': 'rgb(30, 80, 200)',
        // Ketebalan cincin atmosfer: 0.1–0.2 untuk glow yang jelas tapi tidak berlebihan
        'horizon-blend': 0.12,
        // Ruang angkasa: gelap pekat
        'space-color': 'rgb(5, 6, 20)',
        // Bintang bawaan Mapbox
        'star-intensity': 0.85,
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

      // Pengaturan Satelit
      const SATELLITE_SPEED = 0.5; // derajat per frame (semakin besar semakin cepat)
      const SATELLITE_LATITUDE = 15;
      const SATELLITE_ALTITUDE = 5000000;

      // --- 1. Garis Orbit ---
      // Karena globe digeser menggunakan padding (65% layar) di Section 1,
      // Mapbox sering salah menghapus (cull) garis yang panjang karena dianggap di luar layar.
      // Solusinya: kita pecah garis orbit menjadi banyak segmen (garis kecil).
      const orbitFeatures = [];
      for (let lng = -180; lng < 180; lng += 10) {
        orbitFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [lng, SATELLITE_LATITUDE, SATELLITE_ALTITUDE],
              [lng + 10, SATELLITE_LATITUDE, SATELLITE_ALTITUDE]
            ]
          }
        });
      }

      map.addSource('orbit-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: orbitFeatures
        }
      });

      map.addLayer({
        id: 'orbit-layer',
        type: 'line',
        source: 'orbit-source',
        paint: {
          'line-color': 'rgba(229, 217, 182, 0.4)', // warna krem transparan
          'line-width': 1.5
        }
      });

      // --- 2. Model Satelit ---
      map.addModel('satellite', satelliteUrl);

      map.addSource('satellite-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, SATELLITE_LATITUDE, SATELLITE_ALTITUDE]
          },
          properties: {}
        }
      });

      map.addLayer({
        id: 'satellite-layer',
        type: 'model',
        source: 'satellite-source',
        layout: {
          'model-id': 'satellite',
        },
        paint: {
          'model-scale': [300000, 300000, 300000],
          'model-rotation': [0, 0, 0],
          'model-color-mix-intensity': 0
        }
      });

      let satelliteLng = 0;
      let lastSpinState = true;

      // 4. Update posisi satelit secara terpisah dari putaran bumi
      function animateSatellite() {
        if (spinEnabled && map) {
          // Cek jika status spinning berubah menjadi false oleh animasi GSAP
          if (lastSpinState && !map.isSpinning) {
            map.stop(); // Hentikan easeTo globe
          } else if (!lastSpinState && map.isSpinning) {
            spinMapbox(); // Mulai ulang easeTo jika kembali ke Section 1
          }
          lastSpinState = map.isSpinning;

          // Orbit satelit (bergerak berdasarkan SATELLITE_SPEED)
          satelliteLng += SATELLITE_SPEED;
          if (satelliteLng > 180) satelliteLng -= 360;

          // Update data source satelit
          const source = map.getSource('satellite-source');
          if (source) {
            source.setData({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [satelliteLng, SATELLITE_LATITUDE, SATELLITE_ALTITUDE]
              },
              properties: {}
            });
          }

          animationId = requestAnimationFrame(animateSatellite);
        }
      }

      // Fungsi khusus untuk memutar globe menggunakan easeTo (direkomendasikan Mapbox)
      // agar tidak mengganggu rendering garis orbit
      function spinMapbox() {
        if (spinEnabled && map && map.isSpinning) {
          const distancePerSecond = 360 / secondsPerRevolution;
          const center = map.getCenter();
          center.lng -= distancePerSecond;
          map.easeTo({ center, duration: 1000, easing: (n) => n });
        }
      }

      // Dengarkan event moveend untuk melanjutkan putaran globe
      map.on('moveend', () => {
        if (spinEnabled && map && map.isSpinning) {
          spinMapbox();
        }
      });

      // Tunggu hingga Mapbox benar-benar "idle" (selesai menggambar orbit line)
      // sebelum memulai animasi apa pun.
      let animationStarted = false;
      const startAnim = () => {
        if (animationStarted) return;
        animationStarted = true;
        spinMapbox();
        animateSatellite();
      };

      map.once('idle', startAnim);

      // Fallback: jika idle tidak terpanggil, paksa mulai dalam 1.5 detik
      setTimeout(startAnim, 1500);

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
      {/* Bintang dirender oleh Mapbox native (star-intensity di setFog) */}
      <div className="map-container">
        <div ref={mapContainerRef} className="mapbox-globe" />
      </div>
    </div>
  );
}
