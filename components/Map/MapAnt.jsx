"use client";

import { MapContainer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-imageoverlay-rotated";
import proj4 from "proj4"; //Needed??
import "proj4leaflet";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility"; // fixes missing marker icons

import WMSLayer from "./MapantWMS";
import DomaMarkers from "./DomaMarker";
import KartOverlay from "./KartOverlay";
import DrawnAreas from "./DrawnAreas";

export default function MapAnt() {
  return (
    <MapContainer
      crs={makeCRS()}
      center={[63.420779, 10.344897]}
      zoom={1}
      style={{ height: "600px", width: "100%" }}
    >
      <WMSLayer />
      <KartOverlay />
      <DomaMarkers />
      <DrawnAreas />
    </MapContainer>
  );
}

function makeCRS() {
  var res = [
    8000 / 8,
    8000 / 16,
    8000 / 32,
    8000 / 64,
    8000 / 128,
    8000 / 256,
    8000 / 512,
    8000 / 1024,
    8000 / 2048,
    8000 / 4096,
    8000 / 8192,
    8000 / 16384,
  ];

  return new L.Proj.CRS(
    "EPSG:32633",
    "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs",
    {
      resolutions: res,
      origin: [-150000, 10000000],
      bounds: L.bounds([-100000, 8000000], [1280252, 6400000]),
    }
  );
}
