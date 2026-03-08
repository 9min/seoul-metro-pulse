import { useMemo } from "react";
import { CANVAS_HEIGHT, CANVAS_PADDING, CANVAS_WIDTH, MAP_BOUNDS } from "@/constants/mapConfig";
import type { ScreenCoord } from "@/types/map";
import type { Station } from "@/types/station";
import { createTransformFn } from "@/utils/coordTransform";

interface UseCoordTransformResult {
	transformFn: (lon: number, lat: number) => ScreenCoord;
	stationScreenMap: Map<string, ScreenCoord>;
}

/**
 * GPS→스크린 변환 함수와 역 ID별 스크린 좌표 맵을 메모이제이션하여 반환한다.
 */
export function useCoordTransform(stations: Station[]): UseCoordTransformResult {
	const transformFn = useMemo(
		() =>
			createTransformFn({
				bounds: MAP_BOUNDS,
				canvasWidth: CANVAS_WIDTH,
				canvasHeight: CANVAS_HEIGHT,
				padding: CANVAS_PADDING,
			}),
		[],
	);

	const stationScreenMap = useMemo(() => {
		const map = new Map<string, ScreenCoord>();
		for (const station of stations) {
			map.set(station.id, transformFn(station.x, station.y));
		}
		return map;
	}, [stations, transformFn]);

	return { transformFn, stationScreenMap };
}
