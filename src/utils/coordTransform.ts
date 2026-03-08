import { CANVAS_PADDING } from "@/constants/mapConfig";
import type { MapBounds, ScreenCoord } from "@/types/map";

export interface CoordTransformParams {
	bounds: MapBounds;
	canvasWidth: number;
	canvasHeight: number;
	padding?: number;
}

/**
 * GPS 좌표(경도, 위도)를 스크린 픽셀 좌표로 변환한다.
 * Y축: 위도가 클수록 화면 위에 표시 (반전 적용)
 */
export function gpsToScreen(
	lon: number,
	lat: number,
	{ bounds, canvasWidth, canvasHeight, padding = CANVAS_PADDING }: CoordTransformParams,
): ScreenCoord {
	const lonRange = bounds.maxLon - bounds.minLon;
	const latRange = bounds.maxLat - bounds.minLat;
	const drawWidth = canvasWidth - padding * 2;
	const drawHeight = canvasHeight - padding * 2;

	const x = ((lon - bounds.minLon) / lonRange) * drawWidth + padding;
	const y = ((bounds.maxLat - lat) / latRange) * drawHeight + padding;

	return { x, y };
}

/**
 * gpsToScreen을 부분 적용한 변환 함수를 생성한다.
 */
export function createTransformFn(
	params: CoordTransformParams,
): (lon: number, lat: number) => ScreenCoord {
	return (lon: number, lat: number): ScreenCoord => gpsToScreen(lon, lat, params);
}
