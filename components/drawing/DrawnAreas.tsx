"use client";

import { useEffect } from "react";

import DrawingController from "./DrawingController";
import DrawnAreasRenderer from "./DrawnAreasRenderer";
import { useDrawnFeatures } from "./DrawnFeaturesProvider";
import { useAuth } from "../auth/AuthProvider";
import { fetchFeatures } from "../../lib/features";

export default function DrawnAreas() {
  const { setFeatures } = useDrawnFeatures();
  const { session } = useAuth();

  useEffect(() => {
    fetchFeatures()
      .then(setFeatures)
      .catch((err) => console.error("Failed to load features:", err));
  }, [setFeatures]);

  return (
    <>
      {session && <DrawingController />}
      <DrawnAreasRenderer editable={!!session} />
    </>
  );
}
