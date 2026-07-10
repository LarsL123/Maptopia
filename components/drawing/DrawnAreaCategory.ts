interface CategoryStyle {
  color: string;
  fillColor: string;
  fillOpacity: number;
  weight: number;
}

// Deterministic fallback color for categories outside the hardcoded palette
// below, so user-created categories stay visually distinct instead of all
// rendering the same gray.
function hashToStyle(category: string): CategoryStyle {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash << 5) - hash + category.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return {
    color: `hsl(${hue}, 55%, 35%)`,
    fillColor: `hsl(${hue}, 65%, 65%)`,
    fillOpacity: 0.4,
    weight: 2,
  };
}

const getCategoryStyle = (category: string): CategoryStyle => {
  const styles: Record<string, CategoryStyle> = {
    default: {
      color: "#666",
      fillColor: "#ccc",
      fillOpacity: 0.4,
      weight: 2,
    },
    heritage: {
      color: "#8B4513",
      fillColor: "#D2691E",
      fillOpacity: 0.4,
      weight: 2,
    },
    parks: {
      color: "#228B22",
      fillColor: "#90EE90",
      fillOpacity: 0.4,
      weight: 2,
    },
    development: {
      color: "#4169E1",
      fillColor: "#87CEEB",
      fillOpacity: 0.4,
      weight: 2,
    },
  };
  return styles[category] ?? hashToStyle(category);
};

export default getCategoryStyle;
