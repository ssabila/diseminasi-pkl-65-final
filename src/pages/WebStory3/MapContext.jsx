import { createContext, useContext } from 'react';

/**
 * MapContext — menyediakan satu Mapbox map instance (dari MapBackground)
 * ke seluruh section (5-9) tanpa perlu SharedMapProvider terpisah.
 */
export const MapContext = createContext(null);

/**
 * Hook untuk mengakses map instance dan mapReady dari MapBackground.
 * Gantikan useSharedMap() dengan hook ini di semua section.
 */
export const useSharedMap = () => {
  const ctx = useContext(MapContext);
  if (!ctx) return { map: null, mapReady: false };
  return ctx;
};
