import { useEffect, useRef } from "react";
import { handleStationTap } from "@/canvas/interactions/stationClick";
import { setupZoomPan } from "@/canvas/interactions/zoomPan";
import { drawLinks } from "@/canvas/objects/LineLink";
import { drawAllStations } from "@/canvas/objects/StationNode";
import linksData from "@/data/links.json";
import stationsData from "@/data/stations.json";
import { useCoordTransform } from "@/hooks/useCoordTransform";
import { usePixiApp } from "@/hooks/usePixiApp";
import { useStationStore } from "@/stores/useStationStore";
import type { Station, StationLink } from "@/types/station";

const STATIONS = stationsData as Station[];
const LINKS = linksData as StationLink[];

/**
 * PixiJS 지도 캔버스 오케스트레이터 컴포넌트.
 * canvas 엘리먼트는 usePixiApp 내부에서 생성하여 containerRef div에 추가된다.
 */
export function MapCanvas() {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const scene = usePixiApp(containerRef);
	const { stationScreenMap } = useCoordTransform(STATIONS);
	const initStations = useStationStore((state) => state.initStations);

	// 역/링크 데이터를 스토어에 등록
	useEffect(() => {
		initStations(STATIONS, LINKS);
	}, [initStations]);

	// scene이 준비되면 노선/역 렌더링 + 줌팬 설정
	useEffect(() => {
		if (scene === null) return;

		drawLinks(scene.linksLayer, LINKS, stationScreenMap);
		drawAllStations(scene.stationsLayer, STATIONS, stationScreenMap, handleStationTap);

		const cleanupZoomPan = setupZoomPan({ viewport: scene.viewport, canvas: scene.canvas });
		return cleanupZoomPan;
	}, [scene, stationScreenMap]);

	return <div ref={containerRef} className="h-full w-full" />;
}
