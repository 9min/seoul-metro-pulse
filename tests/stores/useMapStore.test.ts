import { beforeEach, describe, expect, it } from "vitest";
import { useMapStore } from "@/stores/useMapStore";

describe("useMapStore — activeLines", () => {
	beforeEach(() => {
		// 활성화 가능 노선(1호선)만 초기 상태로 리셋
		useMapStore.setState({ activeLines: new Set([1]) });
	});

	it("초기 상태에서 1호선만 활성화되어 있다", () => {
		const { activeLines } = useMapStore.getState();
		expect(activeLines.has(1)).toBe(true);
		expect(activeLines.size).toBe(1);
	});

	it("toggleLine: 활성화 가능 노선(1호선)을 비활성화한다", () => {
		useMapStore.getState().toggleLine(1);
		const { activeLines } = useMapStore.getState();
		expect(activeLines.has(1)).toBe(false);
		expect(activeLines.size).toBe(0);
	});

	it("toggleLine: 비활성화된 1호선을 다시 활성화한다", () => {
		useMapStore.setState({ activeLines: new Set() });
		useMapStore.getState().toggleLine(1);
		expect(useMapStore.getState().activeLines.has(1)).toBe(true);
	});

	it("toggleLine: 활성화 불가 노선(2호선)은 토글되지 않는다", () => {
		useMapStore.getState().toggleLine(2);
		const { activeLines } = useMapStore.getState();
		expect(activeLines.has(2)).toBe(false);
		expect(activeLines.size).toBe(1);
	});

	it("setAllLinesActive(false): 모든 노선을 비활성화한다", () => {
		useMapStore.getState().setAllLinesActive(false);
		expect(useMapStore.getState().activeLines.size).toBe(0);
	});

	it("setAllLinesActive(true): 활성화 가능 노선만 활성화한다", () => {
		useMapStore.setState({ activeLines: new Set() });
		useMapStore.getState().setAllLinesActive(true);
		const { activeLines } = useMapStore.getState();
		expect(activeLines.size).toBe(1);
		expect(activeLines.has(1)).toBe(true);
	});
});
