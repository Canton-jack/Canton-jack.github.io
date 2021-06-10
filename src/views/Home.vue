/* eslint-disable @typescript-eslint/no-explicit-any */
<template>
	<div class="home">
		<h5>点击地图获取坐标</h5>
		<h5>{{ lnglatArr }}</h5>
		<div class="btn-wrap">
			<button @click="createLine">生成轨迹</button>
			<button @click="startDrive">开始运动</button>
			<button @click="reset">重置</button>
		</div>
		<div id="map"></div>
	</div>
</template>

<script lang="ts">
	import Vue from "vue";
	import {
		point,
		along,
		// distance,
		// lineDistance,
		// lineString,
		bearing,
		length,
		// lineDistance,
		// lineString,
		distance,
	} from "@turf/turf";
	import mapboxgl from "mapbox-gl";

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const arr: any[] = [];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let map: any;
	let isDrving = false;
	let lineFlag = false;
	let totaldistance = 0; // 轨迹总里程 //km
	let totalTime: number; // 根据速度常量计算总花费时间 totaldista/speed = 总时间 //小时数 换算成毫秒
	let popup: mapboxgl.Popup;
	let marker: mapboxgl.Marker;
	// eslint-disable-next-line
	const speed: number = 100; // 100km/h
	// eslint-disable-next-line
	const fuel100: number = 6; // 6L/100km
	let fuelVol = 100; // 100L
	// eslint-disable-next-line
	const ticket: string = "ticket109000";
	// eslint-disable-next-line
	const busType: string = "金龙客车";
	const imgBase64 =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEV0lEQVRoge2Zz0syXRTHv/nj8UeKDDqitog2Foht8z+IiGwh1EraBC1qV4uIXLWR1rlwV7geEFtE2B+QtFNyEVS0SEVHJhNHx8l6Fy8Oao06M/qGL88HBmbuPefO+d4754xznXp8fPzCBKP67QCUopHjxLIscrkccrkcCoUCKpUKqtUqqtUqWJYFz/PgeR4fHx//3kSjgVarhVarhdFohNlshtlshsVigdPphMvlgsvlgsFgGL2A9/d3pNNp5HI55PN5vL6+olKpSLpJs9lEs9kEALy9vYnaEQQhiJmZmYHX64XJZOo79lS/HLi6usLl5SVarZakgEeFWq3G2toaVlZWRG1EcyCVSiEej/9a8ADQarUQj8eRSqVEbUQfoWQyKeqkVqvhcDiE5SYIAgaD4duh1+sBAI1GA/V6/dvBMExXLolN1s3NDZaWlqQJyOVyXdd+v19IOLvdDpVq+AJmMpkGPsufn58oFotCriUSCdFYOhEV0Dsbq6urwnmj0UCpVEKxWESpVEKpVEK5XEa9XgfHcWg0GuA4DhzHAQB0Oh10Oh30ej10Oh0MBgOsVitIkgRJkrDb7SBJEg6HAw6HAwC6BLSrmSQBYkQiEaTTaUk+LMuCZdmBdouLi9jd3ZU0tubs7AyZTGZoh3bws7OzsNlssNlssFqtsNlsMJvNwmz/+fMHOp0OAMBxHJrNprAq1WoVNE2jXC6DpmnQNI2Xl5e+E7Ozs/Otzev1QiMl+E6Ojo6GtjUajTAajX1tfgpwEJlM5nsZjUajiEajkgcbN2JxTfxvob8Cfpu/AnrheR40TY/MbhCyvgfEeH5+xvn5OQDg+PgYWq1Wkd0wqLxer3DReS4FnudBURROT09RKBQwNTX14zfDsHb96I1Xs7e3JyvoNk9PT7i4uEChUIBKpcLy8jL8fj80Go0su0H0xiv7EeJ5HolEAslkEl9fX3A6ndja2sLc3JwsO7nIFtA7E/l8HuFweKDfsHbDIrkKyc2TcY0teQWU5syomfgXmawcYBgGFEXh4eEBAOB2uxEIBEAQxH/i34lkAQzD4OTkBLVaTWi7u7tDNptFKBQaGIRS/14kP0IURaFWq8Hj8SAcDiMcDsPj8aBWq4GiqLH7KxbQXvZgMAiCIEAQBILBYFffOP17mfgklizA7XYDAGKxGBiGAcMwiMViXX3j9O9FchIHAgFks1nc39/j8PBQaJ+enkYgEBi7fy+SBRAEgVAoJLsMKvXvRdZ7gCAIbG9vy3EdiX8nE5/EoitgNBq7tgPlbDyNin6bYqIrMD8/P5Zg5LCwsCDaJypgc3MTNpttLAFJgSRJbGxsiPaLCiAIAgcHB2MJSgr7+/t9q1PfKtTp2Lsv2c4JpfuoYuO02weV1omvQv9/ARaLBQC6/nxon7f7lKB0/IFvYp/Ph+vra0QikR/7lKJ0/IEC1tfXAQC3t7fCLprFYoHP5xP6lKB0/L7/1E8CE5/E/wCECzwBWskMHgAAAABJRU5ErkJggg==";

	const counter = 0;
	const steps = 1000;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let pointSource: any = {
		type: "FeatureCollection",
		features: [
			{
				type: "Feature",
				properties: { bearing: 0 },
				geometry: {
					type: "Point",
					coordinates: [],
				},
			},
		],
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let routeSource: any = {
		type: "FeatureCollection",
		features: [
			{
				type: "Feature",
				geometry: {
					type: "LineString",
					coordinates: [],
				},
			},
		],
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let drivedRouteSource: any = {
		type: "FeatureCollection",
		features: [
			{
				type: "Feature",
				geometry: {
					type: "LineString",
					coordinates: [],
				},
			},
		],
	};

	export default Vue.extend({
		name: "Home",
		components: {},

		data() {
			return {
				lnglatArr: arr,
				drivingFlag: isDrving,
				lineFlag: lineFlag,
				totalDistance: totaldistance,
				counter: counter,
				steps: steps,
				fuelVol: fuelVol,
			};
		},
		methods: {
			init(): void {
				map = new mapboxgl.Map({
					container: "map", // container id
					style: "mapbox://styles/mapbox/streets-v11", //hosted style id
					center: [116.13781, 23.56752], // starting position
					zoom: 9, // starting zoom
					minZoom: 8,
					// maxBounds: [
					// 	[116.13781, 23.56752],
					// 	[116.53781, 24.8752],
					// ],
				});
				map.on("load", function () {
					console.info("1");
					// 创建大巴车图标
					const img: HTMLImageElement = new Image(20, 20);
					img.src = imgBase64;

					map.addImage("custom-bus", img);
				});
				// 点击选择坐标点
				map.on("click", (e: { lngLat: { lng: number; lat: number } }) => {
					console.info(JSON.stringify(e.lngLat));
					if (this.drivingFlag || this.lineFlag) return;
					this.lnglatArr.push([e.lngLat.lng, e.lngLat.lat]);
				});
				// 初始化弹窗
				popup = new mapboxgl.Popup({
					className: "my-popup",
				}).setMaxWidth("300px");
			},

			// 生成轨迹
			createLine(): void {
				// 生成路线中时，运动时不允许重新生成轨迹
				if (this.drivingFlag || this.lineFlag) return;
				if (this.lnglatArr.length === 1) {
					alert("请至少选择2个坐标");
					return;
				}
				this.lineFlag = true;

				pointSource.features[0].geometry.coordinates = this.lnglatArr[0];
				routeSource.features[0].geometry.coordinates = this.lnglatArr;

				this.totalDistance = parseFloat(
					length(routeSource.features[0]).toFixed(2)
				);
				totalTime = parseFloat((this.totalDistance / speed).toFixed(2));
				console.info("总距离/km", this.totalDistance);
				console.info("总时间/h", totalTime);

				let arc = [];

				// Number of steps to use in the arc and animation, more steps means
				// a smoother arc and animation, but too many steps will result in a
				// low frame rate

				// Draw an arc between the `origin` & `destination` of the two points
				for (
					let i = 0;
					i < this.totalDistance;
					i += this.totalDistance / this.steps
				) {
					const segment = along(routeSource.features[0], i);
					arc.push(segment.geometry.coordinates);
				}

				// Update the route with calculated arc coordinates
				routeSource.features[0].geometry.coordinates = arc;

				// 添加起点数据源

				if (!map.getSource("pointSource")) {
					map.addSource("pointSource", {
						type: "geojson",
						data: pointSource,
					});
				} else {
					map.getSource("pointSource").setData(pointSource);
				}
				// 添加路线数据源
				if (!map.getSource("routeSource")) {
					map.addSource("routeSource", {
						type: "geojson",
						data: routeSource,
						lineMetrics: true,
					});
				} else {
					map.getSource("routeSource").setData(routeSource);
				}

				if (!map.getSource("drivedRouteSource")) {
					// 添加已驾驶轨迹数据源
					map.addSource("drivedRouteSource", {
						type: "geojson",
						data: drivedRouteSource,
						lineMetrics: true,
					});
				} else {
					map.getSource("drivedRouteSource").setData(drivedRouteSource);
				}

				this.addRouterLayer(); // 创建轨迹图层
				this.addDrivedRouteLayer(); // 创建已行驶图层
				// 车起点位置图层
				// map.addLayer({
				// 	id: "pointLayer",
				// 	type: "symbol",
				// 	source: "pointSource", // reference the data source
				// 	layout: {
				// 		"icon-image": "airport-15", // reference the image
				// 		"icon-size": 2,
				// 		"icon-rotate": ["get", "bearing"],
				// 		"icon-rotation-alignment": "map",
				// 		"icon-allow-overlap": true,
				// 		"icon-ignore-placement": true,
				// 	},
				// });
				// 添加marker、设置弹窗
				let html = `<ul><li>汽车车票:${ticket}</li><li>汽车型号:${busType}</li><li>汽车颜色:蓝色</li><li>剩余油量:100</li><li>距离终点距离:${this.totalDistance}km</li><li>距离终点时间:${totalTime}h</li></ul>`;

				popup.setHTML(html);
				if (marker) marker.remove();

				let el = document.createElement("img");
				el.src = imgBase64;
				el.style.width = "20px";
				el.style.height = "20px";
				marker = new mapboxgl.Marker({
					element: el,
				})
					.setLngLat(pointSource.features[0].geometry.coordinates)
					.setPopup(popup)
					.addTo(map);
			},
			// 开始运动
			startDrive(): void {
				// 开始运动后不允许再次点击
				if (this.drivingFlag || !this.lineFlag) return;
				console.info("driving");
				this.drivingFlag = true;

				this.animate();
			},
			// setRouteData(): void {},

			// 创建轨迹图层
			addRouterLayer(): void {
				map.addLayer({
					id: "routeLayer",
					type: "line",
					source: "routeSource", // 数据源
					paint: {
						"line-width": 5,
						"line-opacity": 1,
						"line-color": "#009EFF",
					},
				});
			},
			// 创建已行驶图层
			addDrivedRouteLayer(): void {
				map.addLayer({
					id: "drivedLayer",
					type: "line",
					source: "drivedRouteSource",
					paint: {
						"line-width": 5,
						"line-opacity": 1,
						"line-color": "#FF9900",
					},
				});
			},

			// 动画
			animate(): void {
				// debugger;
				var start =
					routeSource.features[0].geometry.coordinates[
						this.counter >= this.steps ? this.counter - 1 : this.counter
					];
				var end =
					routeSource.features[0].geometry.coordinates[
						this.counter >= steps ? this.counter : this.counter + 1
					];
				if (!start || !end) return;

				// turf计算行驶距离
				let begin = point(routeSource.features[0].geometry.coordinates[0]);
				let stop = point(
					routeSource.features[0].geometry.coordinates[this.counter]
				);
				let drivedDis = distance(begin, stop);
				let drivedTime = parseFloat((drivedDis / 100).toFixed(2));
				let restTime = totalTime - drivedTime; // 小时
				let restFuel = parseFloat(
					(100 - (drivedDis / 100) * fuel100).toFixed(2)
				);
				let restDis = Math.round(
					parseFloat((this.totalDistance - drivedDis).toFixed(2))
				);
				// console.info("行驶距离", drivedDis);
				// console.info("剩余时间", restTime);
				// console.info("剩余距离", restDis);

				pointSource.features[0].geometry.coordinates =
					routeSource.features[0].geometry.coordinates[this.counter];
				drivedRouteSource.features[0].geometry.coordinates.push(
					pointSource.features[0].geometry.coordinates
				);

				// 添加marker、设置弹窗
				let html = `<ul><li>汽车车票:${ticket}</li><li>汽车型号:${busType}</li><li>汽车颜色:蓝色</li><li>剩余油量:${restFuel}</li><li>距离终点距离:${restDis}km</li><li>距离终点时间:${restTime}h</li></ul>`;

				popup.setHTML(html);
				if (marker) marker.remove();
				let el = document.createElement("img");
				el.src = imgBase64;
				el.style.width = "20px";
				el.style.height = "20px";
				marker = new mapboxgl.Marker({
					element: el,
				})
					.setLngLat(pointSource.features[0].geometry.coordinates)
					.setPopup(popup)
					.addTo(map);
				pointSource.features[0].properties.bearing = bearing(
					point(start),
					point(end)
				);

				// map.getSource("pointSource").setData(pointSource);
				map.getSource("drivedRouteSource").setData(drivedRouteSource);
				if (counter < steps) {
					requestAnimationFrame(this.animate);
				} else {
					this.lineFlag = false;
					this.drivingFlag = false;
				}

				this.counter = this.counter + 1;
			},
			// 重置
			reset(): void {
				if (!this.lineFlag) return; // 未生成轨迹情况
				pointSource.features[0].geometry.coordinates = [];
				routeSource.features[0].geometry.coordinates = [];
				drivedRouteSource.features[0].geometry.coordinates = [];
				map.getSource("pointSource") &&
					map.getSource("pointSource").setData(pointSource);
				map.getSource("routeSource") &&
					map.getSource("routeSource").setData(routeSource);
				map.getSource("drivedRouteSource") &&
					map.getSource("drivedRouteSource").setData(drivedRouteSource);
				// Reset the counter
				this.counter = 0;
				this.lineFlag = false;
				this.drivingFlag = false;
				this.lnglatArr = [];
				// 删除图层
				if (map.getLayer("routeLayer")) {
					map.removeLayer("routeLayer");
				}
				if (map.getLayer("pointLayer")) {
					map.removeLayer("pointLayer");
				}
				if (map.getLayer("drivedLayer")) {
					map.removeLayer("drivedLayer");
				}
				if (marker) {
					marker.remove();
				}
			},
			handleTime(n: number): string {
				let d,
					h,
					m,
					s = 0;
				d = Math.floor(n / (24 * 8 * 3600 * 1000));
				h = Math.floor((n % (24 * 3600 * 1000)) / (3600 * 1000));
				m = Math.floor(
					((n % (24 * 3600 * 1000)) % (3600 * 1000)) / (60 * 1000)
				);
				s = Math.floor(
					(((n % (24 * 3600 * 1000)) % (3600 * 1000)) % (60 * 1000)) / 1000
				);
				return `${d}天${h}小时${m}分${s}秒`;
			},
		},
		mounted() {
			this.init();
		},
	});
</script>
<style lang="scss" scoped>
	#map {
		// position: absolute;
		// top: 0;
		// bottom: 0;
		width: 1000px;
		height: 500px;
		margin: 0 auto;
	}
	.btn-wrap {
		margin: 20px 0;
	}
</style>

function animate(animate: any) { throw new Error("Function not implemented."); }
