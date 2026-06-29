import L from "leaflet";
import { useMap } from "react-leaflet";
import rotatedCorners from "../../components/math";

function KartOverlay() {
  const map = useMap();

  var overlay = L.imageOverlay
    .rotated(
      "map.png",
      rotatedCorners[0] as L.LatLngExpression,
      rotatedCorners[1] as L.LatLngExpression,
      rotatedCorners[3] as L.LatLngExpression, //TOP LEFT, TOP RIGHT, BOTTOM LEFT
      {
        opacity: 0.4,
        attribution:
          "&copy; <a href='http://www.ign.es'>Instituto Geográfico Nacional de España</a>",
      }
    )
    .addTo(map);

  return " ";
}
export default KartOverlay;
