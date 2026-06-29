import * as L from "leaflet";

declare module "leaflet" {
  namespace imageOverlay {
    function rotated(
      imgSrc: string,
      topleft: L.LatLngExpression,
      topright: L.LatLngExpression,
      bottomleft: L.LatLngExpression,
      options?: L.ImageOverlayOptions
    ): L.ImageOverlay;
  }

  namespace Proj {
    class CRS implements L.CRS {
      code: string;
      wrapLng?: [number, number];
      wrapLat?: [number, number];
      infinite: boolean;
      latLngToPoint(latlng: L.LatLngExpression, zoom: number): L.Point;
      pointToLatLng(point: L.PointExpression, zoom: number): L.LatLng;
      project(latlng: L.LatLng | L.LatLngLiteral): L.Point;
      unproject(point: L.Point): L.LatLng;
      scale(zoom: number): number;
      zoom(scale: number): number;
      getProjectedBounds(zoom: number): L.Bounds;
      distance(latlng1: L.LatLngExpression, latlng2: L.LatLngExpression): number;
      wrapLatLng(latlng: L.LatLng): L.LatLng;
      constructor(
        code: string,
        proj4def: string,
        options?: {
          resolutions?: number[];
          origin?: [number, number];
          bounds?: L.Bounds;
        }
      );
    }
  }
}

declare module "proj4leaflet" {}
declare module "leaflet-imageoverlay-rotated" {}
