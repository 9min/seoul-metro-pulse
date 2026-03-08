import { describe, expect, it } from "vitest";
import type { MapBounds } from "@/types/map";
import { createTransformFn, gpsToScreen } from "@/utils/coordTransform";

const BOUNDS: MapBounds = {
	minLon: 126.8,
	maxLon: 127.2,
	minLat: 37.45,
	maxLat: 37.7,
};

const WIDTH = 1200;
const HEIGHT = 800;
const PADDING = 60;

const params = { bounds: BOUNDS, canvasWidth: WIDTH, canvasHeight: HEIGHT, padding: PADDING };

describe("gpsToScreen", () => {
	it("왼쪽 상단 GPS → 최소 X, 최소 Y (padding 값)", () => {
		const result = gpsToScreen(126.8, 37.7, params);
		expect(result.x).toBeCloseTo(PADDING);
		expect(result.y).toBeCloseTo(PADDING);
	});

	it("오른쪽 하단 GPS → 최대 X, 최대 Y", () => {
		const result = gpsToScreen(127.2, 37.45, params);
		expect(result.x).toBeCloseTo(WIDTH - PADDING);
		expect(result.y).toBeCloseTo(HEIGHT - PADDING);
	});

	it("중앙 GPS → 캔버스 중심", () => {
		const result = gpsToScreen(127.0, 37.575, params);
		expect(result.x).toBeCloseTo(WIDTH / 2);
		expect(result.y).toBeCloseTo(HEIGHT / 2);
	});

	it("Y축이 반전된다 (위도가 클수록 화면 위쪽)", () => {
		const top = gpsToScreen(127.0, 37.65, params);
		const bottom = gpsToScreen(127.0, 37.5, params);
		expect(top.y).toBeLessThan(bottom.y);
	});

	it("X축은 경도가 클수록 오른쪽", () => {
		const left = gpsToScreen(126.9, 37.575, params);
		const right = gpsToScreen(127.1, 37.575, params);
		expect(right.x).toBeGreaterThan(left.x);
	});
});

describe("createTransformFn", () => {
	it("gpsToScreen과 동일한 결과를 반환한다", () => {
		const transform = createTransformFn(params);
		const direct = gpsToScreen(127.0, 37.575, params);
		const via = transform(127.0, 37.575);
		expect(via.x).toBeCloseTo(direct.x);
		expect(via.y).toBeCloseTo(direct.y);
	});

	it("여러 좌표를 연속으로 변환할 수 있다", () => {
		const transform = createTransformFn(params);
		const coords = [
			{ lon: 126.9, lat: 37.55 },
			{ lon: 127.0, lat: 37.6 },
			{ lon: 127.1, lat: 37.5 },
		];
		for (const { lon, lat } of coords) {
			const result = transform(lon, lat);
			expect(result.x).toBeGreaterThan(0);
			expect(result.y).toBeGreaterThan(0);
		}
	});
});
