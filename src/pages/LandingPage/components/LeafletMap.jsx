import { useEffect } from "react";
import { MapContainer, GeoJSON, Polyline, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import dataProvinsiIndo from "../../../assets/maps/Administrasi_Provinsi.json";
import { LeafletLeaderLinesWrapper } from "./LeaderLine";

const JAKARTA = [-6.2088, 106.8456];

const REGIONS = [
  { id: "aceh", match: ["aceh"], label: "Aceh", color: "var(--green)", to: [5.5483, 95.3238], delay: 0 },
  { id: "sumut", match: ["sumatera utara", "sumut"], label: "Sumatera Utara", color: "var(--gold)", to: [3.5952, 98.6722], delay: 0.4 },
  { id: "sumbar", match: ["sumatera barat", "sumbar"], label: "Sumatera Barat", color: "#c2703d", to: [-0.9471, 100.4172], delay: 0.8 },
];

const normalize = (str) => (str || "").toString().toLowerCase().trim();

const getRegionColor = (feature) => {
  const name = normalize(feature?.properties?.nmprov);
  const found = REGIONS.find((r) => r.match.some((m) => name.includes(m)));
  return found?.color || null;
};

const getGeoJsonStyle = (feature) => {
  const color = getRegionColor(feature);
  return {
    color: "var(--beige)",
    weight: color ? 1.4 : 1,
    fillColor: color || "var(--green)",
    fillOpacity: color ? 0.55 : 0.12,
    opacity: 1,
    dashArray: color ? null : "2 4",
  };
};

function createArc(start, end, curvature = 0.18, segments = 64) {
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;
  const [midLat, midLng] = [(lat1 + lat2) / 2, (lng1 + lng2) / 2];
  const [dx, dy] = [lng2 - lng1, lat2 - lat1];
  const [ctrlLat, ctrlLng] = [midLat - dx * curvature, midLng + dy * curvature];

  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * ctrlLat + t * t * lat2;
    const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * ctrlLng + t * t * lng2;
    points.push([lat, lng]);
  }
  return points;
}

function FlightPathDefs() {
  const map = useMap();

  useEffect(() => {
    const svg = map.getPanes().overlayPane.querySelector("svg");
    if (!svg || svg.querySelector("#leaflet-glow")) return;

    const NS = "http://www.w3.org/2000/svg";
    const defs = document.createElementNS(NS, "defs");

    REGIONS.forEach(({ id, color }) => {
      const grad = document.createElementNS(NS, "linearGradient");
      grad.setAttribute("id", `grad-${id}`);
      grad.setAttribute("x1", "0%"); grad.setAttribute("y1", "0%");
      grad.setAttribute("x2", "100%"); grad.setAttribute("y2", "0%");

      const start = document.createElementNS(NS, "stop");
      start.setAttribute("offset", "0%"); start.setAttribute("stop-color", color); start.setAttribute("stop-opacity", "0");

      const end = document.createElementNS(NS, "stop");
      end.setAttribute("offset", "100%"); end.setAttribute("stop-color", color); end.setAttribute("stop-opacity", "0.9");

      grad.appendChild(start);
      grad.appendChild(end);
      defs.appendChild(grad);
    });

    defs.innerHTML += `
      <filter id="leaflet-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    `;

    svg.insertBefore(defs, svg.firstChild);
  }, [map]);

  return null;
}

function FlightPaths() {
  return (
    <>
      <FlightPathDefs />
      
      <CircleMarker center={JAKARTA} radius={5} pathOptions={{ color: "#e5343b", fillColor: "#e5343b", fillOpacity: 1, weight: 0, className: "origin-dot" }} interactive={false} />
      <CircleMarker center={JAKARTA} radius={9} pathOptions={{ color: "#e5343b", fillOpacity: 0, weight: 1.5, opacity: 0.4 }} interactive={false} />
      <Tooltip permanent direction="right" offset={[10, 0]} className="route-label origin-label">Jakarta</Tooltip>

      {REGIONS.map((r) => (
        <div key={r.id} style={{ display: "contents" }}>
          <Polyline
            positions={createArc(JAKARTA, r.to)}
            pathOptions={{
              color: `url(#grad-${r.id})`,
              weight: 1.5,
              className: "flight-path-draw",
              style: { animationDelay: `${r.delay}s`, "--path-delay": `${r.delay}s` },
            }}
            interactive={false}
          />
          <CircleMarker center={r.to} radius={5} pathOptions={{ color: r.color, fillColor: r.color, fillOpacity: 1, weight: 0, className: "destination-glow" }} interactive={true} />
          {[9, 20, 30].map((radius, i) => (
            <CircleMarker key={i} center={r.to} radius={radius} pathOptions={{ color: r.color, fillOpacity: 0, weight: 1.5, opacity: 0.5, className: "pulse-ring" }} interactive={false} />
          ))}
          <Tooltip permanent direction="right" offset={[10, 0]} className="route-label">
            <span style={{ color: r.color }}>{r.label}</span>
          </Tooltip>
        </div>
      ))}
    </>
  );
}

export default function LeafletMap({ showLeaderLines }) {
  return (
    <div className="w-full h-full">
      <style>{cleanMapStyles}</style>
      <MapContainer center={[-0.7893, 100.0]} zoom={5} style={{ width: "100%", height: "100%", background: "transparent" }} zoomControl={false} attributionControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} boxZoom={false}>
        {dataProvinsiIndo && <GeoJSON data={dataProvinsiIndo} style={getGeoJsonStyle} />}
        <FlightPaths />
        <LeafletLeaderLinesWrapper show={showLeaderLines} />
      </MapContainer>
    </div>
  );
}

const cleanMapStyles = `
@keyframes trailLine {
  0% { stroke-dasharray: 0 800; stroke-dashoffset: 0; opacity: 0; }
  10% { opacity: 1; }
  50% { stroke-dasharray: 800 800; stroke-dashoffset: 0; opacity: 1; }
  90% { stroke-dasharray: 0 800; stroke-dashoffset: -800; opacity: 1; }
  100% { stroke-dasharray: 0 800; stroke-dashoffset: -800; opacity: 0; }
}

path.flight-path-draw {
  animation: trailLine 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  animation-delay: var(--path-delay, 0s);
}

@keyframes destinationFadeIn {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

path.destination-glow {
  transform-box: fill-box;
  transform-origin: center;
  animation: destinationFadeIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  opacity: 0;
}

@keyframes pulseRing {
  0% { stroke-width: 1.5; opacity: 0.6; }
  70% { stroke-width: 0.5; opacity: 0; }
  100% { opacity: 0; }
}

path.pulse-ring {
  transform-box: fill-box;
  transform-origin: center;
  animation: pulseRing 2.4s ease-out infinite;
  opacity: 0;
}

path.origin-dot, path.destination-glow {
  filter: url(#leaflet-glow);
}

.leaflet-tooltip.route-label {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  font-family: "Playfair Display", serif;
  font-style: italic;
  font-size: 11px;
  white-space: nowrap;
}
.leaflet-tooltip.route-label::before { display: none; }
.leaflet-tooltip.origin-label {
  font-family: "Lato", sans-serif;
  font-style: normal;
  color: rgba(229, 217, 182, 0.7);
}
`;