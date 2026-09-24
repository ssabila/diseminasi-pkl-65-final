import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function makePoint(x = 0, y = 0) {
  return {
    x,
    y,
    round: function() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      return this;
    },
    sub: function() { return this; },
    add: function() { return this; },
    mult: function() { return this; },
    div: function() { return this; },
    clone: function() { return makePoint(this.x, this.y); },
  };
}

/**
 * Creates a Mapbox-compatible adapter over Leaflet for tokenless fallback.
 * Uses Esri Satellite and CartoDB Dark Matter tiles.
 */
export function createLeafletMapAdapter(containerEl, options = {}) {
  if (!containerEl) return null;

  const defaultCenter = options.center ? [options.center[1], options.center[0]] : [-2, 100];
  const defaultZoom = options.zoom || 3;

  const leafletMap = L.map(containerEl, {
    center: defaultCenter,
    zoom: defaultZoom,
    zoomControl: false,
    attributionControl: false,
  });

  // Base Dark Satellite Tile Layer
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
  }).addTo(leafletMap);

  // CartoDB Dark Labels / boundaries for sci-fi look
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_onlylabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
  }).addTo(leafletMap);

  const mapAdapter = {
    isSpinning: true,
    leafletMap,
    _canvasContainer: containerEl,
    _requestDomTask: (cb) => {
      if (cb) requestAnimationFrame(cb);
    },
    transform: {
      renderWorldCopies: false,
      width: window.innerWidth || 1000,
      height: window.innerHeight || 800,
      latRange: [-90, 90],
      lngRange: [-180, 180],
      point: () => makePoint(0, 0),
      locationPoint: (lngLat) => {
        if (!lngLat || !leafletMap._loaded) return makePoint(0, 0);
        try {
          const point = leafletMap.latLngToContainerPoint([lngLat.lat, lngLat.lng]);
          return makePoint(point ? point.x : 0, point ? point.y : 0);
        } catch (e) {
          return makePoint(0, 0);
        }
      },
      pointLocation: (pt) => {
        if (!pt || !leafletMap._loaded) return { lng: 0, lat: 0 };
        try {
          const ll = leafletMap.containerPointToLatLng([pt.x || 0, pt.y || 0]);
          return { lng: ll ? (ll.lng || 0) : 0, lat: ll ? (ll.lat || 0) : 0 };
        } catch (e) {
          return { lng: 0, lat: 0 };
        }
      },
      customLayerMatrix: () => new Float32Array(16),
      clone: function() { return this; },
    },
    _addMarker: function(marker) {
      if (marker) {
        marker._map = this;
        try {
          const el = marker.getElement ? marker.getElement() : marker._element;
          if (el && containerEl) {
            containerEl.appendChild(el);
          }
        } catch (e) {}
      }
    },
    _removeMarker: function(marker) {
      if (marker) {
        marker._map = null;
        try {
          const el = marker.getElement ? marker.getElement() : marker._element;
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        } catch (e) {}
      }
    },
    getContainer: () => containerEl,
    getCanvasContainer: () => containerEl,
    getCanvas: () => containerEl.querySelector('canvas') || containerEl,
    getCenter: () => {
      try {
        const c = leafletMap.getCenter();
        return { lng: c ? c.lng : 100, lat: c ? c.lat : -2 };
      } catch (e) {
        return { lng: 100, lat: -2 };
      }
    },
    setCenter: (center) => {
      if (!center) return;
      try {
        if (Array.isArray(center)) {
          leafletMap.setView([center[1], center[0]], leafletMap.getZoom(), { animate: false });
        } else if (center.lng !== undefined) {
          leafletMap.setView([center.lat, center.lng], leafletMap.getZoom(), { animate: false });
        }
      } catch (e) {}
    },
    getZoom: () => {
      try { return leafletMap.getZoom(); } catch (e) { return 3; }
    },
    getPitch: () => 0,
    getBearing: () => 0,
    setPadding: () => {},
    setFog: () => {},
    stop: () => {
      try { leafletMap.stop(); } catch (e) {}
    },
    jumpTo: ({ center, zoom }) => {
      if (center) {
        try {
          const lng = center.lng !== undefined ? center.lng : center[0];
          const lat = center.lat !== undefined ? center.lat : center[1];
          const z = zoom !== undefined ? zoom : leafletMap.getZoom();
          leafletMap.setView([lat, lng], z, { animate: false });
        } catch (e) {}
      }
    },
    easeTo: ({ center }) => {
      if (center) {
        try {
          const lng = center.lng !== undefined ? center.lng : center[0];
          const lat = center.lat !== undefined ? center.lat : center[1];
          leafletMap.panTo([lat, lng], { animate: true });
        } catch (e) {}
      }
    },
    flyTo: ({ center, zoom }) => {
      if (center) {
        try {
          const lng = center.lng !== undefined ? center.lng : center[0];
          const lat = center.lat !== undefined ? center.lat : center[1];
          const z = zoom !== undefined ? zoom : leafletMap.getZoom();
          leafletMap.flyTo([lat, lng], z);
        } catch (e) {}
      }
    },
    fitBounds: (bounds, opts) => {
      if (bounds) {
        try {
          if (Array.isArray(bounds) && bounds.length === 4) {
            leafletMap.fitBounds([[bounds[1], bounds[0]], [bounds[3], bounds[2]]]);
          }
        } catch (e) {}
      }
    },
    project: (lnglat) => {
      if (!lnglat || !leafletMap._loaded) return makePoint(0, 0);
      try {
        const lng = Array.isArray(lnglat) ? lnglat[0] : lnglat.lng;
        const lat = Array.isArray(lnglat) ? lnglat[1] : lnglat.lat;
        if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
          return makePoint(0, 0);
        }
        const point = leafletMap.latLngToContainerPoint([lat, lng]);
        return makePoint(point ? point.x : 0, point ? point.y : 0);
      } catch (e) {
        return makePoint(0, 0);
      }
    },
    unproject: (point) => {
      if (!point || !leafletMap._loaded) return { lng: 0, lat: 0 };
      try {
        const latLng = leafletMap.containerPointToLatLng([point.x || point[0], point.y || point[1]]);
        return { lng: latLng ? (latLng.lng || 0) : 0, lat: latLng ? (latLng.lat || 0) : 0 };
      } catch (e) {
        return { lng: 0, lat: 0 };
      }
    },
    resize: () => {
      try { leafletMap.invalidateSize(); } catch (e) {}
    },
    remove: () => {
      try { leafletMap.remove(); } catch (e) {}
    },
    getStyle: () => ({ layers: [] }),
    getLayer: (id) => ({ id, type: 'symbol' }),
    getSource: () => null,
    addSource: () => {},
    addLayer: () => {},
    addModel: () => {},
    setPaintProperty: () => {},
    setLayoutProperty: () => {},
    setFilter: () => {},
    queryRenderedFeatures: () => [],
    on: (evt, fn) => {
      if (evt === 'load' || evt === 'style.load') {
        setTimeout(fn, 50);
      } else if (evt === 'idle') {
        setTimeout(fn, 100);
      } else {
        try { leafletMap.on(evt, fn); } catch (e) {}
      }
    },
    off: (evt, fn) => {
      try { leafletMap.off(evt, fn); } catch (e) {}
    },
    once: (evt, fn) => {
      if (evt === 'load' || evt === 'style.load' || evt === 'idle') {
        setTimeout(fn, 50);
      } else {
        try { leafletMap.once(evt, fn); } catch (e) {}
      }
    }
  };

  return mapAdapter;
}
