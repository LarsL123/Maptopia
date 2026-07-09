"use client";

import dynamic from "next/dynamic";
import { AuthProvider } from "../components/auth/AuthProvider";
import AuthPanel from "../components/auth/AuthPanel";

// Dynamically import the Map component
const MapAnt = dynamic(() => import("../components/map/MapAnt"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-4 py-2">
          <h1>Welcome to Maptopia!</h1>
          <AuthPanel />
        </div>
        <div className="w-full flex-1">
          <MapAnt />
        </div>
      </div>
    </AuthProvider>
  );
}
