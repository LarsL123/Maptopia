// DrawnFeaturesProvider.tsx
"use client";

import { createContext, useContext, useState } from "react";

const DrawnFeaturesContext = createContext(null);

export function DrawnFeaturesProvider({ children }) {
  const [features, setFeatures] = useState([]);

  return (
    <DrawnFeaturesContext.Provider value={{ features, setFeatures }}>
      {children}
    </DrawnFeaturesContext.Provider>
  );
}

export const useDrawnFeatures = () => useContext(DrawnFeaturesContext);
