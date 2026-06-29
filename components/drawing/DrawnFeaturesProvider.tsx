"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { DrawnFeature } from "../types";

interface DrawnFeaturesContextValue {
  features: DrawnFeature[];
  setFeatures: React.Dispatch<React.SetStateAction<DrawnFeature[]>>;
}

const DrawnFeaturesContext = createContext<DrawnFeaturesContextValue | null>(
  null,
);

export function DrawnFeaturesProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<DrawnFeature[]>([]);

  return (
    <DrawnFeaturesContext.Provider value={{ features, setFeatures }}>
      {children}
    </DrawnFeaturesContext.Provider>
  );
}

export function useDrawnFeatures(): DrawnFeaturesContextValue {
  const ctx = useContext(DrawnFeaturesContext);
  if (!ctx)
    throw new Error(
      "useDrawnFeatures must be used inside DrawnFeaturesProvider",
    );
  return ctx;
}
