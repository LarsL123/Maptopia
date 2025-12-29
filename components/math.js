//Code for rotating KML image corners to Leaflet-ready coordinates

// ---- KML values ---- //TODO: read from KML file
const north = 63.425680672421109;
const south = 63.395816963699154;
const east = 10.288496233499727;
const west = 10.175326477930689;
const rotationDeg = -2.1316596087590511;

// ---- Center ----
const latC = (north + south) / 2;
const lonC = (east + west) / 2;

// ---- Constants ----
const R = 6378137; // Earth radius (WGS84)
const degToRad = Math.PI / 180;
const radToDeg = 180 / Math.PI;

// ---- Convert lat/lon → local meters ----
function latLonToMeters(lat, lon, lat0, lon0) {
  const x = (lon - lon0) * degToRad * R * Math.cos(lat0 * degToRad);
  const y = (lat - lat0) * degToRad * R;
  return [x, y];
}

// ---- Convert local meters → lat/lon ----
function metersToLatLon(x, y, lat0, lon0) {
  const lat = lat0 + (y / R) * radToDeg;
  const lon = lon0 + (x / (R * Math.cos(lat0 * degToRad))) * radToDeg;
  return [lat, lon];
}

// ---- Corners (lat, lon) ----
const corners = [
  [north, west], // NW
  [north, east], // NE
  [south, east], // SE
  [south, west], // SW
];

// ---- Rotation ----
const theta = rotationDeg * degToRad;
const cosT = Math.cos(theta);
const sinT = Math.sin(theta);

// ---- Rotate corners ----
const rotatedLatLng = corners.map(([lat, lon]) => {
  const [x, y] = latLonToMeters(lat, lon, latC, lonC);

  const xr = x * cosT - y * sinT;
  const yr = x * sinT + y * cosT;

  return metersToLatLon(xr, yr, latC, lonC);
});

console.log("Rotated corners (Leaflet-ready):");
console.log("NW, NE, SE, SW:", rotatedLatLng);

export default rotatedLatLng;
