"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface MapLayerContextValue {
  showDomaMarkers: boolean;
  showLiveloxMarkers: boolean;
  setShowDomaMarkers: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLiveloxMarkers: React.Dispatch<React.SetStateAction<boolean>>;
}

const MapLayerContext = createContext<MapLayerContextValue | null>(null);

export function MapLayersProvider({ children }: { children: ReactNode }) {
  const [showDomaMarkers, setShowDomaMarkers] = useState<boolean>(false);
  const [showLiveloxMarkers, setShowLiveloxMarkers] = useState<boolean>(false);

  return (
    <MapLayerContext.Provider
      value={{
        showDomaMarkers,
        showLiveloxMarkers,
        setShowDomaMarkers,
        setShowLiveloxMarkers,
      }}
    >
      {children}
    </MapLayerContext.Provider>
  );
}

export function useMapLayers(): MapLayerContextValue {
  const ctx = useContext(MapLayerContext);
  if (!ctx) throw new Error("useMapLayers must be used inside MapLayerContext");
  return ctx;
}
