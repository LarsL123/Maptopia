import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function WMSLayer() {
  const map = useMap();

  useEffect(() => {
    var templateUrl = "https://mapant.no/tiles/{z}/{y}/{x}.png";

    var mapantLayer = new L.TileLayer(templateUrl, {
      maxZoom: 11,
      maxNativeZoom: 10,
      minZoom: 0,
      tileSize: 1024,
      continuousWorld: true,
      unloadInvisibleTiles: false,
      attribution:
        "Basert p&aring; FKB og laserdata &copy; Statens Kartverk, Geovekst og kommunene.<br/>Med st&oslash;tte fra Sparebankstiftelsen DNB.",
    }).addTo(map);

    return () => {
      map.removeLayer(mapantLayer);
    };
  }, [map]);

  return null;
}
