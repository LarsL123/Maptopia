export type SidebarMode = "layers" | "data" | "draw" | "draw-info";

export interface DrawnFeatureProperties {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
}

export interface DrawnFeature {
  type: "Feature";
  geometry: {
    type: string;
    coordinates: unknown;
  };
  properties: DrawnFeatureProperties;
}
