import type { MapBounds } from "@/types/map";

/** 서울 지하철 네트워크 GPS 경계 범위 */
export const MAP_BOUNDS: MapBounds = {
	minLon: 126.78,
	maxLon: 127.2,
	minLat: 37.44,
	maxLat: 37.7,
};

/** 기본 캔버스 크기 */
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;

/** 캔버스 여백 (px) */
export const CANVAS_PADDING = 60;

/** 줌 범위 및 속도 */
export const ZOOM_MIN = 0.3;
export const ZOOM_MAX = 6;
export const ZOOM_SPEED = 0.001;

/** 역 원 반지름 (px) */
export const STATION_RADIUS = 6;
export const STATION_RADIUS_HOVER = 9;

/** 노선 두께 (px) */
export const LINE_WIDTH = 3;
