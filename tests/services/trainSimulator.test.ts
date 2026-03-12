import { describe, expect, it } from "vitest";
import { TrainSimulator } from "@/services/trainSimulator";
import type { ScreenCoord } from "@/types/map";
import type { StationLink } from "@/types/station";

const LINKS: StationLink[] = [
	{ source: "S1", target: "S2", line: 1 },
	{ source: "S2", target: "S3", line: 1 },
	{ source: "S3", target: "S4", line: 1 },
	{ source: "S4", target: "S5", line: 1 },
];

const SCREEN_MAP: Map<string, ScreenCoord> = new Map([
	["S1", { x: 100, y: 100 }],
	["S2", { x: 200, y: 100 }],
	["S3", { x: 300, y: 100 }],
	["S4", { x: 400, y: 100 }],
	["S5", { x: 500, y: 100 }],
]);

describe("TrainSimulator", () => {
	it("init 후 tick하면 보간된 열차 좌표를 반환한다", () => {
		const sim = new TrainSimulator();
		sim.init(LINKS);
		const trains = sim.tick(SCREEN_MAP);
		expect(trains.length).toBeGreaterThan(0);
		const validXs = new Set([100, 200, 300, 400, 500]);
		for (const t of trains) {
			expect(validXs.has(t.stationX)).toBe(true);
		}
	});

	it("trainNo가 gm-{3자리번호} 형식이다", () => {
		const sim = new TrainSimulator();
		sim.init(LINKS);
		const trains = sim.tick(SCREEN_MAP);
		for (const t of trains) {
			expect(t.trainNo).toMatch(/^gm-\d{3}$/);
		}
	});

	it("여러 틱에 걸쳐 열차가 이동한다", () => {
		const sim = new TrainSimulator();
		sim.init(LINKS);

		const first = sim.tick(SCREEN_MAP);
		const firstPositions = first.map((t) => `${t.stationX},${t.stationY}`);

		for (let i = 0; i < 10; i++) {
			sim.tick(SCREEN_MAP);
		}
		const later = sim.tick(SCREEN_MAP);
		const laterPositions = later.map((t) => `${t.stationX},${t.stationY}`);

		const changed = laterPositions.some((pos, i) => pos !== firstPositions[i]);
		expect(changed).toBe(true);
	});

	it("stationId와 nextStationId가 유효하다", () => {
		const sim = new TrainSimulator();
		sim.init(LINKS);
		const trains = sim.tick(SCREEN_MAP);
		for (const t of trains) {
			expect(SCREEN_MAP.has(t.stationId)).toBe(true);
			expect(SCREEN_MAP.has(t.nextStationId)).toBe(true);
		}
	});

	it("status가 항상 '출발'이다", () => {
		const sim = new TrainSimulator();
		sim.init(LINKS);
		const trains = sim.tick(SCREEN_MAP);
		for (const t of trains) {
			expect(t.status).toBe("출발");
		}
	});

	it("speedFactor가 [0.85, 1.15] 범위로 반환된다", () => {
		const sim = new TrainSimulator();
		sim.init(LINKS);
		const trains = sim.tick(SCREEN_MAP);
		for (const t of trains) {
			expect(t.speedFactor).toBeDefined();
			expect(t.speedFactor).toBeGreaterThanOrEqual(0.85);
			expect(t.speedFactor).toBeLessThanOrEqual(1.15);
		}
	});

	it("모든 열차가 speedFactor를 포함한다", () => {
		const sim = new TrainSimulator();
		sim.init(LINKS);
		const trains = sim.tick(SCREEN_MAP);
		for (const t of trains) {
			expect(typeof t.speedFactor).toBe("number");
		}
	});

	it("simProgress가 [0, 1) 범위로 반환된다", () => {
		const sim = new TrainSimulator();
		sim.init(LINKS);
		const trains = sim.tick(SCREEN_MAP);
		for (const t of trains) {
			expect(t.simProgress).toBeDefined();
			expect(t.simProgress).toBeGreaterThanOrEqual(0);
			expect(t.simProgress).toBeLessThan(1);
		}
	});

	it("모든 열차가 simProgress를 포함한다", () => {
		const sim = new TrainSimulator();
		sim.init(LINKS);
		const trains = sim.tick(SCREEN_MAP);
		for (const t of trains) {
			expect(typeof t.simProgress).toBe("number");
		}
	});

	it("정차 중 trackAngle이 유효하다", () => {
		const sim = new TrainSimulator();
		sim.init(LINKS);

		for (let i = 0; i < 10; i++) {
			const trains = sim.tick(SCREEN_MAP);
			for (const t of trains) {
				expect(typeof t.trackAngle).toBe("number");
				expect(Number.isNaN(t.trackAngle)).toBe(false);
			}
		}
	});
});
