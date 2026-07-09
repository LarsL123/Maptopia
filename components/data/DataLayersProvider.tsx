"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface DataLayersContextValue {
  showDomaMarkers: boolean;
  showLiveloxMarkers: boolean;
  setShowDomaMarkers: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLiveloxMarkers: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataLayersContext = createContext<DataLayersContextValue | null>(null);

export function DataLayersProvider({ children }: { children: ReactNode }) {
  const [showDomaMarkers, setShowDomaMarkers] = useState<boolean>(true);
  const [showLiveloxMarkers, setShowLiveloxMarkers] = useState<boolean>(true);

  return (
    <DataLayersContext.Provider
      value={{
        showDomaMarkers,
        showLiveloxMarkers,
        setShowDomaMarkers,
        setShowLiveloxMarkers,
      }}
    >
      {children}
    </DataLayersContext.Provider>
  );
}

export function useDataLayers(): DataLayersContextValue {
  const ctx = useContext(DataLayersContext);
  if (!ctx)
    throw new Error("useDataLayers must be used inside DataLayersProvider");
  return ctx;
}
