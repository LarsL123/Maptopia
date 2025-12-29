"use client"; // Must be first line

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ImageOverlay,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility"; // fixes missing marker icons

export default function Map() {
  const position = [63.3799934, 10.508714];

  const mapPosition = [
    [63.39580092641835, 10.444216338859054],
    [63.40216052271733, 10.464352992915757],
  ];

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "1000px", width: "80%" }}
    >
      {/* Base OSM Layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* MapAnt.no WMTS as TileLayer
      <TileLayer
        url="https://mapant.no/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=MapAnt.no&STYLE=default&TILEMATRIXSET=EPSG32633-UTM33N&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png"
        attribution="&copy; Kartverket"
      /> */}

      {/* Image Overlay */}
      <ImageOverlay
        url="/Kart1.png"
        bounds={mapPosition}
        opacity={0.7} // optional
      />

      {/* Marker */}
      <Marker position={position}>
        <Popup>
          A sample popup <br /> with some text.
        </Popup>
      </Marker>
    </MapContainer>
  );
}
