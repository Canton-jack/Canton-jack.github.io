//eslint-disable
// declare global {
// 	interface Window {
// 		mapboxgl: any;
// 	}
// }
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
  "pk.eyJ1Ijoid2FuZ3BhbjAyMCIsImEiOiJja3BtZXUxYTIxY3hsMnBueWM0d2R1MXFiIn0.qpMdbcFxFF9Y3wNGzmTZfA";

window.mapboxgl = mapboxgl;

export default mapboxgl;
