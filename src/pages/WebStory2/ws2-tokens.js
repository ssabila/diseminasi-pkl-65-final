/**
 * WEB STORY 2 — konstanta warna untuk konteks yang TIDAK menerima var().
 *
 * Dipakai hanya oleh: properti paint Mapbox GL, style Leaflet/GeoJSON,
 * template string di dalam innerHTML marker, dan konkatenasi hex-alpha
 * (`${WS2.cream}29`). Untuk segala hal lain pakai var(--ws2-*).
 *
 * Nilai WAJIB identik dengan ws2-tokens.css.
 */

export const WS2 = {
  navy: '#15173D',
  cream: '#E5D9B6',
  green: '#628141',
  accent: '#E67E22',
  white: '#FFFFFF',
};

/** Tangga alpha severity (4 = terparah). Satu hue, tanpa hijau. */
export const WS2_SEV = {
  4: '#E67E22',
  3: 'rgba(230,126,34,0.55)',
  2: 'rgba(230,126,34,0.28)',
  1: 'rgba(229,217,182,0.18)',
};

/** Kategorikal maksimal empat. Lebih dari itu → satu hue + tangga alpha. */
export const WS2_CAT = ['#628141', '#E5D9B6', '#E67E22', '#FFFFFF'];
export const WS2_CAT_CREAM = ['#628141', '#15173D', '#E67E22', 'rgba(21,23,61,0.35)'];

export const WS2_GLOW = 'rgba(230,126,34,0.45)';

/** Dua warna latar cerita. Dipakai mesin pergantian latar di WebStory2.jsx. */
export const BG = {
  navy: WS2.navy,
  cream: WS2.cream,
};
