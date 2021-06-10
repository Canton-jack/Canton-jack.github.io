declare global {
	import mapboxgl from "mapbox-gl";
	interface Window {
		mapboxgl: mapboxgl;
	}
}
