"use client";

import dynamic from "next/dynamic";

// Dynamically import the Map component
const Map = dynamic(() => import("../components/Map/Map"), { ssr: false });
const MapAnt = dynamic(() => import("../components/Map/MapAnt"), { ssr: false });

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Maptopia!</h1>
      {/* <Map /> */}
      <MapAnt />

    </div>
  );
}