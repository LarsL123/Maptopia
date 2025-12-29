"use client";

import dynamic from "next/dynamic";

// Dynamically import the Map component
const MapAnt = dynamic(() => import("../components/Map/MapAnt"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Maptopia!</h1>
      <MapAnt />
    </div>
  );
}
