import { beforeEach, describe, expect, it } from "vitest";
import { useMapStore } from "@/stores/useMapStore";

describe("useMapStore — activeLines", () => {
	beforeEach(() => {
		// 초기 상태로 리셋
		useMapStore.setState({ activeLines: new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]) });
	});

	it("초기 상태에서 1~9호선이 모두 활성화되어 있다", () => {
		const { activeLines } = useMapStore.getState();
		for (let i = 1; i <= 9; i++) {
			expect(activeLines.has(i)).toBe(true);
		}
		expect(activeLines.size).toBe(9);
	});

	it("toggleLine: 활성 노선을 비활성화한다", () => {
		useMapStore.getState().toggleLine(2);
		const { activeLines } = useMapStore.getState();
		expect(activeLines.has(2)).toBe(false);
		expect(activeLines.size).toBe(8);
	});

	it("toggleLine: 비활성 노선을 다시 활성화한다", () => {
		useMapStore.setState({ activeLines: new Set([1, 3]) });
		useMapStore.getState().toggleLine(2);
		expect(useMapStore.getState().activeLines.has(2)).toBe(true);
	});

	it("setAllLinesActive(false): 모든 노선을 비활성화한다", () => {
		useMapStore.getState().setAllLinesActive(false);
		expect(useMapStore.getState().activeLines.size).toBe(0);
	});

	it("setAllLinesActive(true): 모든 노선을 활성화한다", () => {
		useMapStore.setState({ activeLines: new Set([1]) });
		useMapStore.getState().setAllLinesActive(true);
		const { activeLines } = useMapStore.getState();
		expect(activeLines.size).toBe(9);
		for (let i = 1; i <= 9; i++) {
			expect(activeLines.has(i)).toBe(true);
		}
	});
});
