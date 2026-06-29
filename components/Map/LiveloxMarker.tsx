"use client";

import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import liveloxData from "./LiveloxData.json";

type LiveloxItem = {
  date: string;
  link: string;
  participantId: number;
  center: {
    latitude: number;
    longitude: number;
  };
};

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function LiveloxMarker() {
  return (
    <>
      {(liveloxData as LiveloxItem[]).map((item) => (
        <Marker
          key={item.participantId}
          icon={redIcon}
          position={[item.center.latitude, item.center.longitude]}
        >
          <Popup>
            <div>
              <a href={item.link}>Link</a>
              <br />
              Lat: {item.center.latitude.toFixed(6)}
              <br />
              Lon: {item.center.longitude.toFixed(6)}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
