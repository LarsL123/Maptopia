import extractQuickRoute from "@/components/extractQuickRoute";
// import extractQuickRoute from "../../components/extractQuick2";
// import checkFile, { printMarkerInfo } from "@/components/ckeckFile";

export default function Kuk() {
  const { mapCorners, rotationDeg } = extractQuickRoute("12410.blank.jpg");

  return (
    <div>
      <h1>Welcome to Maptopia!</h1>
      <h2>Data fra Quicroutefil:</h2>
      {/* {checkFile("12452.jpg")} */}
      {/* {printMarkerInfo("12452.jpg")} */}
      {mapCorners && <p>Map corners: {JSON.stringify(mapCorners)}</p>}
      {rotationDeg !== null && <p>Rotation (deg): {rotationDeg}</p>}
    </div>
  );
}
