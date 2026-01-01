const getCategoryStyle = (category) => {
  const styles = {
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
  return (
    styles[category] || {
      color: "#666",
      fillColor: "#ccc",
      fillOpacity: 0.4,
      weight: 2,
    }
  );
};

export default getCategoryStyle;
