import { beforeEach, describe, expect, it } from "vitest";
import { useStationStore } from "@/stores/useStationStore";
import type { Station, StationLink } from "@/types/station";

const MOCK_STATIONS: Station[] = [
	{ id: "L1S01", name: "구로", line: 1, x: 126.887, y: 37.503 },
	{ id: "L1S02", name: "신도림", line: 1, x: 126.901, y: 37.509 },
	{ id: "L2S01", name: "시청", line: 2, x: 126.978, y: 37.566 },
];

const MOCK_LINKS: StationLink[] = [
	{ source: "L1S01", target: "L1S02", line: 1 },
	{ source: "L1S02", target: "L2S01", line: 2 },
];

describe("useStationStore", () => {
	beforeEach(() => {
		useStationStore.getState().initStations([], []);
		useStationStore.getState().selectStation(null);
	});

	it("initStations 호출 시 stations와 links가 저장된다", () => {
		useStationStore.getState().initStations(MOCK_STATIONS, MOCK_LINKS);
		const { stations, links } = useStationStore.getState();
		expect(stations).toHaveLength(3);
		expect(links).toHaveLength(2);
	});

	it("initStations 호출 시 stationMap이 생성된다", () => {
		useStationStore.getState().initStations(MOCK_STATIONS, MOCK_LINKS);
		const { stationMap } = useStationStore.getState();
		expect(stationMap.size).toBe(3);
		expect(stationMap.get("L1S01")?.name).toBe("구로");
		expect(stationMap.get("L2S01")?.name).toBe("시청");
	});

	it("selectStation 호출 시 selectedStation이 업데이트된다", () => {
		const station = MOCK_STATIONS[0];
		if (station === undefined) return;
		useStationStore.getState().selectStation(station);
		expect(useStationStore.getState().selectedStation?.id).toBe("L1S01");
	});

	it("selectStation(null) 호출 시 선택이 해제된다", () => {
		const station = MOCK_STATIONS[0];
		if (station === undefined) return;
		useStationStore.getState().selectStation(station);
		useStationStore.getState().selectStation(null);
		expect(useStationStore.getState().selectedStation).toBeNull();
	});

	it("존재하지 않는 역 ID로 stationMap.get 시 undefined를 반환한다", () => {
		useStationStore.getState().initStations(MOCK_STATIONS, MOCK_LINKS);
		const { stationMap } = useStationStore.getState();
		expect(stationMap.get("NONEXISTENT")).toBeUndefined();
	});
});
