'use client';

import { useEffect } from "react";
import { MapContainer, useMap, ImageOverlay, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import proj4 from "proj4";
import "proj4leaflet";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility"; // fixes missing marker icons
import "leaflet-imageoverlay-rotated" //Do i need this?

import rotatedCorners from "../../components/math";

// Define UTM33N CRS
// const crsUTM33 = new L.Proj.CRS(
//   'EPSG:32633',
//   '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs',
//   {
//     origin: [-150000, 10000000], // Top-left corner from XML
//     resolutions: [
//       3571428.5712, 1785714.2856, 892857.142857, 446428,
//       223214.2857, 111607.1428, 55803.57142, 27901.78571,
//       13950.89286, 6975.446428, 3487.723214
//     ]
//   }
// );

// Create a WMTS Layer as a React component
function WMTSLayer() {
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
	attribution: 'Basert p&aring; FKB og laserdata &copy; Statens Kartverk, Geovekst og kommunene.<br/>Med st&oslash;tte fra Sparebankstiftelsen DNB.'
    }).addTo(map);

    return () => {
      map.removeLayer(mapantLayer);
    };
  }, [map]);

  return null;
}

function projectLatLng(lat, lng) {
  return proj4(
    "EPSG:4326",  // WGS84 lat/lng
    "EPSG:32633", // UTM 33N (WGS84)
    [lng, lat]
  );
}

// function KartOverlay(){
//     const map = useMap();
//     const mapPosition = [
//     [63.39580092641835, 10.444216338859054],
//     [63.40216052271733, 10.464352992915757]];
//     L.Proj.imageOverlay("/Kart1.png", mapPosition);
//     return " ";
// }
 function KartOverlay3(){
    {/* <north>63.425680672421109</north>
        <south>63.395816963699154</south>
        <east>10.288496233499727</east>
        <west>10.175326477930689</west>
        <rotation>-2.1316596087590511</rotation> */}
    const map = useMap();

  
console.log("Rotated Corners in MapAnt:", rotatedCorners);

  var overlay = L.imageOverlay.rotated("map.png", rotatedCorners[0], rotatedCorners[1], rotatedCorners[3], //TOP LEFT, TOP RIGHT, BOTTOM LEFT
    {
    opacity: 0.4,
    attribution: "&copy; <a href='http://www.ign.es'>Instituto Geográfico Nacional de España</a>"
  }).addTo(map);

    return " ";
}







function KartOverlay() {
  const map = useMap();

  // Original WGS84 coordinates
  const southWest = projectLatLng(63.39580092641835, 10.444216338859054);
  const northEast = projectLatLng(63.40216052271733, 10.464352992915757);

  const bounds = L.bounds(
    L.point(southWest),
    L.point(northEast)
  );

  console.log("Projected Bounds:", bounds);

  L.Proj.imageOverlay("/Kart1.png", bounds).addTo(map);

  return 
//   <ImageOverlay
//     url="/Kart1.png"
//     bounds={[southWest, northEast]}
//     opacity={0.7} // optional
//   />
  ;
}

// function KartOverlay2(){
// {/* <north>63.425680672421109</north>
//         <south>63.395816963699154</south>
//         <east>10.288496233499727</east>
//         <west>10.175326477930689</west>
//         <rotation>-2.1316596087590511</rotation> */}
//     const map = useMap();
//     const sw = proj4("EPSG:4326", "EPSG:32633", [10.175326477930689, 63.395816963699154]);//West, South
//     const ne = proj4("EPSG:4326", "EPSG:32633", [10.288496233499727, 63.425680672421109]); //East, North

//     const bounds = L.bounds(L.point(sw), L.point(ne));

//     L.Proj.imageOverlay("/map.png", bounds, { opacity: 0.7 }).addTo(map);
// }

export default function MapAnt() {
      

    var res = [
	  8000 / 8,
		8000 / 16,
		8000 / 32,
		8000 / 64,
		8000 / 128,
		8000 / 256,
		8000 / 512,
		8000 / 1024,
		8000 / 2048,
		8000 / 4096,	
	  8000 / 8192,
		8000 / 16384
      ]; 
    
    var crs = new L.Proj.CRS(
	"EPSG:32633",
	"+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs",
	{
	    resolutions: res,
	    origin: [-150000, 10000000],
        // origin: [0,0],
	    bounds: L.bounds([-100000, 8000000], [1280252, 6400000])
	});

    
  return (
    <MapContainer
      crs={crs}
      center={[63.420779, 10.344897]} 
      zoom={1}
      style={{ height: "600px", width: "100%" }}
    >
      <WMTSLayer />
      <KartOverlay3 />
      <Marker position={[63.420779, 10.344897]} />
      {/* <KartOverlay2 /> */}

       {/* <ImageOverlay
        url="/Kart1.png"
        bounds={mapPosition}
        opacity={0.7} // optional
        /> */}
    </MapContainer>
  );
}
