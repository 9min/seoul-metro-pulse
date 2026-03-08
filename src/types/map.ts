/** 지도 GPS 경계 범위 */
export interface MapBounds {
	minLon: number;
	maxLon: number;
	minLat: number;
	maxLat: number;
}

/** 스크린 픽셀 좌표 */
export interface ScreenCoord {
	x: number;
	y: number;
}
