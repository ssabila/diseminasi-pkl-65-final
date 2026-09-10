import sumateraGeo from '../../../assets/maps/sumatera_provinsi.json';

/**
 * Sumber poligon TUNGGAL untuk Babak 1, 2, dan 3.
 *
 * sumatera_provinsi.json = 64 KB, delapan provinsi Sumatera — cukup untuk
 * ketiga babak, karena kamera tidak pernah keluar dari Sumatera. Sebelumnya
 * Babak 3 mengimpor Administrasi_Provinsi.json (22,7 MB) secara statis untuk
 * menggambar batas wilayah yang sama.
 *
 * Bentuk sumber: { provinces: [{ name, centroid, rings: [[ [lng,lat], … ] ] }] }
 * Koordinat GeoJSON = [lng, lat]; Leaflet LatLng = [lat, lng]. Perhatikan
 * urutannya saat memakai centroid di luar konteks GeoJSON.
 */

export const TARGET_PROV = ['ACEH', 'SUMATERA UTARA', 'SUMATERA BARAT'];

export const NAME_TO_INDEX = {
  ACEH: 0,
  'SUMATERA UTARA': 1,
  'SUMATERA BARAT': 2,
};

export const SUMATERA_FC = {
  type: 'FeatureCollection',
  features: sumateraGeo.provinces.map((p) => ({
    type: 'Feature',
    properties: {
      name: p.name,
      target: TARGET_PROV.includes(p.name) ? 1 : 0,
    },
    geometry: { type: 'MultiPolygon', coordinates: p.rings.map((r) => [r]) },
  })),
};

export const TARGET_FEATURES = SUMATERA_FC.features.filter((f) => f.properties.target === 1);
export const CONTEXT_FEATURES = SUMATERA_FC.features.filter((f) => f.properties.target === 0);

export function getProvFeature(name) {
  return SUMATERA_FC.features.find((f) => f.properties.name === name) || null;
}

/**
 * Bounds sebuah provinsi sebagai [[latMin, lngMin], [latMax, lngMax]] —
 * format yang langsung diterima Leaflet fitBounds, tanpa perlu membuat
 * layer L.geoJSON hanya untuk mengukur.
 */
export function provBounds(name) {
  const feature = getProvFeature(name);
  if (!feature) return null;

  let latMin = Infinity; let latMax = -Infinity;
  let lngMin = Infinity; let lngMax = -Infinity;

  feature.geometry.coordinates.forEach((polygon) => {
    polygon.forEach((ring) => {
      ring.forEach(([lng, lat]) => {
        if (lat < latMin) latMin = lat;
        if (lat > latMax) latMax = lat;
        if (lng < lngMin) lngMin = lng;
        if (lng > lngMax) lngMax = lng;
      });
    });
  });

  return [[latMin, lngMin], [latMax, lngMax]];
}

/** Bounds gabungan ketiga provinsi target — tampilan default peta Babak 2. */
export function targetBounds() {
  const all = TARGET_PROV.map(provBounds).filter(Boolean);
  if (!all.length) return null;

  return [
    [Math.min(...all.map((b) => b[0][0])), Math.min(...all.map((b) => b[0][1]))],
    [Math.max(...all.map((b) => b[1][0])), Math.max(...all.map((b) => b[1][1]))],
  ];
}

/**
 * Titik pusat ring terbesar (daratan utama) — bukan centroid semua ring,
 * yang untuk Aceh/Sumbar bisa jatuh di laut karena banyaknya pulau kecil.
 */
export function mainlandCenter(name) {
  const feature = getProvFeature(name);
  if (!feature) return null;

  let best = null;
  feature.geometry.coordinates.forEach((polygon) => {
    polygon.forEach((ring) => {
      if (!best || ring.length > best.length) best = ring;
    });
  });
  if (!best) return null;

  let latMin = Infinity; let latMax = -Infinity;
  let lngMin = Infinity; let lngMax = -Infinity;
  best.forEach(([lng, lat]) => {
    if (lat < latMin) latMin = lat;
    if (lat > latMax) latMax = lat;
    if (lng < lngMin) lngMin = lng;
    if (lng > lngMax) lngMax = lng;
  });

  return [(latMin + latMax) / 2, (lngMin + lngMax) / 2];
}
