import { useMap } from "react-leaflet";
import rotatedCorners from "../../components/math";

function KartOverlay() {
  const map = useMap();

  var overlay = L.imageOverlay
    .rotated(
      "map.png",
      rotatedCorners[0],
      rotatedCorners[1],
      rotatedCorners[3], //TOP LEFT, TOP RIGHT, BOTTOM LEFT
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
