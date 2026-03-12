import { beforeEach, describe, expect, it, vi } from "vitest";
import { TrainAnimator } from "@/canvas/animation/TrainAnimator";
import type { InterpolatedTrain } from "@/types/train";

// PixiJS Container 모킹
function createMockContainer() {
	const children: { x: number; y: number; visible: boolean }[] = [];
	return {
		children,
		addChild(child: { x: number; y: number; visible: boolean }) {
			children.push(child);
		},
		removeChild(child: { x: number; y: number; visible: boolean }) {
			const idx = children.indexOf(child);
			if (idx !== -1) children.splice(idx, 1);
		},
		removeChildren() {
			children.length = 0;
		},
	};
}

// drawAnimatedTrains 모킹
vi.mock("@/canvas/objects/TrainParticle", () => ({
	drawAnimatedTrains: vi.fn(),
}));

/** 도착 상태 기본 열차 — S01에 정차 중, 다음역 S00 */
const MOCK_TRAIN_ARRIVE: InterpolatedTrain = {
	trainNo: "1001",
	line: 1,
	direction: "상행",
	status: "도착",
	stationId: "S01",
	stationX: 100,
	stationY: 200,
	nextStationId: "S00",
	nextX: 50,
	nextY: 150,
	trackAngle: 0,
};

/** 출발 상태 열차 — S01 출발, S00 방향 이동 */
const MOCK_TRAIN_DEPART: InterpolatedTrain = {
	trainNo: "1001",
	line: 1,
	direction: "상행",
	status: "출발",
	stationId: "S01",
	stationX: 100,
	stationY: 200,
	nextStationId: "S00",
	nextX: 50,
	nextY: 150,
	trackAngle: 0,
};

describe("TrainAnimator", () => {
	let animator: TrainAnimator;

	beforeEach(() => {
		animator = new TrainAnimator();
		// biome-ignore lint/suspicious/noExplicitAny: 테스트용 모킹
		animator.setLayer(createMockContainer() as any);
	});

	// ── 기본 동작 ──────────────────────────────────────────────────────────────

	it("초기 상태에서 열차 수가 0이다", () => {
		expect(animator.count).toBe(0);
	});

	it("setTargets로 열차를 추가하면 count가 증가한다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]);
		expect(animator.count).toBe(1);
	});

	it("clear()로 전체 상태를 초기화한다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]);
		animator.clear();
		expect(animator.count).toBe(0);
	});

	it("clear() 후 열차를 다시 추가할 수 있다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]);
		animator.clear();
		animator.setTargets([MOCK_TRAIN_ARRIVE]);
		expect(animator.count).toBe(1);
	});

	it("layer가 설정되지 않으면 update()가 에러 없이 반환한다", () => {
		const noLayerAnimator = new TrainAnimator();
		noLayerAnimator.setTargets([MOCK_TRAIN_ARRIVE]);
		expect(() => noLayerAnimator.update()).not.toThrow();
	});

	it("getTrainState로 현재 열차 상태를 조회한다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]);
		const state = animator.getTrainState("1001");
		expect(state).toBeDefined();
		expect(state?.trainNo).toBe("1001");
	});

	it("존재하지 않는 열차의 getTrainState는 undefined를 반환한다", () => {
		expect(animator.getTrainState("NONE")).toBeUndefined();
	});

	it("setOnTrainTap으로 콜백을 등록할 수 있다", () => {
		const cb = vi.fn();
		expect(() => animator.setOnTrainTap(cb)).not.toThrow();
	});

	// ── 신규 열차 초기 배치 ────────────────────────────────────────────────────

	it("신규 도착 열차는 stationX/Y에 배치되고 isMoving=false이다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]);
		const state = animator.getTrainState("1001");
		expect(state?.isMoving).toBe(false);
		expect(state?.currentX).toBe(100);
		expect(state?.currentY).toBe(200);
		expect(state?.progress).toBe(0);
	});

	it("신규 진입 열차도 stationX/Y에 배치되고 isMoving=false이다", () => {
		const enter: InterpolatedTrain = { ...MOCK_TRAIN_ARRIVE, status: "진입" };
		animator.setTargets([enter]);
		const state = animator.getTrainState("1001");
		expect(state?.isMoving).toBe(false);
		expect(state?.currentX).toBe(100);
		expect(state?.currentY).toBe(200);
	});

	it("신규 출발 열차는 stationX/Y에서 시작해 nextX/Y를 향해 isMoving=true이다", () => {
		animator.setTargets([MOCK_TRAIN_DEPART]);
		const state = animator.getTrainState("1001");
		expect(state?.isMoving).toBe(true);
		expect(state?.currentX).toBe(100); // 출발 직후 위치 (progress=0)
		expect(state?.currentY).toBe(200);
		expect(state?.fromX).toBe(100);
		expect(state?.fromY).toBe(200);
		expect(state?.toX).toBe(50);
		expect(state?.toY).toBe(150);
		expect(state?.progress).toBe(0);
	});

	it("stationId와 toStationId가 올바르게 저장된다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]);
		const state = animator.getTrainState("1001");
		expect(state?.stationId).toBe("S01");
		expect(state?.toStationId).toBe("S00");
	});

	// ── 같은 구간 재폴링 ────────────────────────────────────────────────────────

	it("같은 구간 출발 재폴링 시 progress가 초기화되지 않는다 (이동 연속성 — Rule 4)", () => {
		animator.setTargets([MOCK_TRAIN_DEPART]);
		const state = animator.getTrainState("1001");
		// 진행 중 시뮬레이션
		if (state) state.progress = 0.4;

		animator.setTargets([MOCK_TRAIN_DEPART]); // 동일 구간 재폴링
		const stateAfter = animator.getTrainState("1001");
		expect(stateAfter?.progress).toBe(0.4); // progress 유지
		expect(stateAfter?.isMoving).toBe(true);
	});

	it("같은 구간 출발 재폴링 시 목표 좌표가 최신으로 동기화된다", () => {
		animator.setTargets([MOCK_TRAIN_DEPART]);
		const updatedTarget: InterpolatedTrain = { ...MOCK_TRAIN_DEPART, nextX: 60, nextY: 160 };
		animator.setTargets([updatedTarget]);
		const state = animator.getTrainState("1001");
		expect(state?.toX).toBe(60);
		expect(state?.toY).toBe(160);
	});

	it("이동 중 같은 구간 도착 수신은 무시하고 이동 상태를 유지한다 (스테일 데이터)", () => {
		animator.setTargets([MOCK_TRAIN_DEPART]); // isMoving=true
		const state = animator.getTrainState("1001");
		if (state) state.progress = 0.5;

		const arrive: InterpolatedTrain = { ...MOCK_TRAIN_ARRIVE, status: "도착" };
		animator.setTargets([arrive]); // 같은 구간, 도착 수신
		const stateAfter = animator.getTrainState("1001");
		expect(stateAfter?.isMoving).toBe(true); // 이동 상태 유지
		expect(stateAfter?.progress).toBe(0.5); // progress 유지
	});

	it("이동 중 같은 구간 진입 수신도 무시하고 이동 상태를 유지한다", () => {
		animator.setTargets([MOCK_TRAIN_DEPART]); // isMoving=true
		const enter: InterpolatedTrain = { ...MOCK_TRAIN_ARRIVE, status: "진입" };
		animator.setTargets([enter]);
		const state = animator.getTrainState("1001");
		expect(state?.isMoving).toBe(true);
	});

	it("정차 중 도착 재폴링은 정차 상태를 유지한다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]); // isMoving=false
		animator.setTargets([MOCK_TRAIN_ARRIVE]); // 동일 재폴링
		const state = animator.getTrainState("1001");
		expect(state?.isMoving).toBe(false);
	});

	// ── 다음 구간으로 정상 진행 (trainAdvanced) ────────────────────────────────

	it("출발로 다음 역 진행 시 출발역 좌표로 스냅 후 다음 역으로 이동한다 (노선 이탈 방지)", () => {
		animator.setTargets([MOCK_TRAIN_DEPART]); // S01 출발, fromX=100, toX=50

		// 이동 중간 위치 시뮬레이션 (75 ≈ S01과 S00의 중간)
		const state = animator.getTrainState("1001");
		if (state) {
			state.currentX = 75;
			state.currentY = 175;
		}

		// S00(다음 역)에서 출발 (trainAdvanced)
		const departFromNext: InterpolatedTrain = {
			...MOCK_TRAIN_DEPART,
			stationId: "S00", // 기존 toStationId → trainAdvanced 분기
			stationX: 50,
			stationY: 150,
			nextStationId: "S_PREV",
			nextX: 10,
			nextY: 100,
		};
		animator.setTargets([departFromNext]);
		const stateAfter = animator.getTrainState("1001");

		// fromX는 출발역(S00) 좌표(50)로 스냅 — 노선 이탈 방지
		expect(stateAfter?.fromX).toBe(50);   // B역 좌표 = train.stationX
		expect(stateAfter?.fromY).toBe(150);
		expect(stateAfter?.currentX).toBe(50);
		expect(stateAfter?.currentY).toBe(150);
		expect(stateAfter?.toX).toBe(10);    // 새 목표역
		expect(stateAfter?.progress).toBe(0); // 새 구간 시작
		expect(stateAfter?.isMoving).toBe(true);
		expect(stateAfter?.stationId).toBe("S00");
		expect(stateAfter?.toStationId).toBe("S_PREV");
	});

	it("도착으로 다음 역 진행 시 역 좌표로 전진 스냅한다", () => {
		animator.setTargets([MOCK_TRAIN_DEPART]); // S01→S00 이동 중

		// S00 도착 (trainAdvanced + 도착)
		const arrivedAtNext: InterpolatedTrain = {
			...MOCK_TRAIN_ARRIVE,
			stationId: "S00", // 기존 toStationId
			stationX: 50,
			stationY: 150,
			nextStationId: "S_PREV",
			nextX: 10,
			nextY: 100,
			status: "도착",
		};
		animator.setTargets([arrivedAtNext]);
		const state = animator.getTrainState("1001");

		expect(state?.isMoving).toBe(false);
		expect(state?.currentX).toBe(50); // 역 좌표로 전진 스냅
		expect(state?.currentY).toBe(150);
		expect(state?.stationId).toBe("S00");
		expect(state?.toStationId).toBe("S_PREV");
	});

	// ── 예상 밖 구간 변경 (API 이상) ──────────────────────────────────────────

	it("예상 밖 구간 변경 시 새 역으로 스냅 후 이동한다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]); // S01 정차

		// 2+ 역 점프 (S01→S03, API 이상)
		const unexpectedJump: InterpolatedTrain = {
			...MOCK_TRAIN_DEPART,
			stationId: "S03", // S00이 아닌 전혀 다른 역
			stationX: 300,
			stationY: 400,
			nextStationId: "S04",
			nextX: 500,
			nextY: 600,
		};
		animator.setTargets([unexpectedJump]);
		const state = animator.getTrainState("1001");

		expect(state?.currentX).toBe(300); // 새 역으로 스냅
		expect(state?.currentY).toBe(400);
		expect(state?.fromX).toBe(300);
		expect(state?.toX).toBe(500);
		expect(state?.progress).toBe(0);
		expect(state?.isMoving).toBe(true);
	});

	it("예상 밖 구간이 도착 상태면 정차한다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]); // S01 정차
		const unexpectedArrive: InterpolatedTrain = {
			...MOCK_TRAIN_ARRIVE,
			stationId: "S05",
			stationX: 500,
			stationY: 600,
			nextStationId: "S06",
			nextX: 600,
			nextY: 700,
			status: "도착",
		};
		animator.setTargets([unexpectedArrive]);
		const state = animator.getTrainState("1001");
		expect(state?.isMoving).toBe(false);
		expect(state?.currentX).toBe(500);
	});

	// ── trailDirty 플래그 (스냅 시 Trail 허상 선 방지) ───────────────────────

	it("출발로 다음 역 진행(trainAdvanced+isDepart) 시 trailDirty=true가 설정된다", () => {
		animator.setTargets([MOCK_TRAIN_DEPART]); // S01 출발

		// S00(다음 역)에서 출발 (trainAdvanced)
		const departFromNext: InterpolatedTrain = {
			...MOCK_TRAIN_DEPART,
			stationId: "S00",
			stationX: 50,
			stationY: 150,
			nextStationId: "S_PREV",
			nextX: 10,
			nextY: 100,
		};
		animator.setTargets([departFromNext]);
		const state = animator.getTrainState("1001");
		expect(state?.trailDirty).toBe(true);
	});

	it("도착으로 다음 역 진행(trainAdvanced+도착) 시 trailDirty=true가 설정된다", () => {
		animator.setTargets([MOCK_TRAIN_DEPART]); // S01→S00 이동 중

		// S00 도착 (trainAdvanced + 도착)
		const arrivedAtNext: InterpolatedTrain = {
			...MOCK_TRAIN_ARRIVE,
			stationId: "S00",
			stationX: 50,
			stationY: 150,
			nextStationId: "S_PREV",
			nextX: 10,
			nextY: 100,
			status: "도착",
		};
		animator.setTargets([arrivedAtNext]);
		const state = animator.getTrainState("1001");
		expect(state?.trailDirty).toBe(true);
	});

	it("예상 밖 구간 변경 시 trailDirty=true가 설정된다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]); // S01 정차

		// 2+ 역 점프 (S01→S03, API 이상)
		const unexpectedJump: InterpolatedTrain = {
			...MOCK_TRAIN_DEPART,
			stationId: "S03",
			stationX: 300,
			stationY: 400,
			nextStationId: "S04",
			nextX: 500,
			nextY: 600,
		};
		animator.setTargets([unexpectedJump]);
		const state = animator.getTrainState("1001");
		expect(state?.trailDirty).toBe(true);
	});

	it("같은 구간 재폴링 시 trailDirty가 설정되지 않는다", () => {
		animator.setTargets([MOCK_TRAIN_DEPART]);
		const state = animator.getTrainState("1001");
		if (state) state.trailDirty = false;

		animator.setTargets([MOCK_TRAIN_DEPART]); // 동일 구간 재폴링
		const stateAfter = animator.getTrainState("1001");
		expect(stateAfter?.trailDirty).toBe(false);
	});

	// ── trackAngle ─────────────────────────────────────────────────────────────

	it("trackAngle은 항상 최신 폴 값을 사용한다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]);
		const withAngle: InterpolatedTrain = { ...MOCK_TRAIN_DEPART, trackAngle: 1.57 };
		animator.setTargets([withAngle]);
		const state = animator.getTrainState("1001");
		expect(state?.trackAngle).toBe(1.57);
	});

	it("direction이 바뀌면 기존 이동 상태는 유지된 채 direction만 갱신된다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]);
		const reversed: InterpolatedTrain = { ...MOCK_TRAIN_ARRIVE, direction: "하행" };
		animator.setTargets([reversed]);
		const state = animator.getTrainState("1001");
		expect(state?.direction).toBe("하행");
	});

	// ── fade-out / fade-in ─────────────────────────────────────────────────────

	it("사라진 열차는 setTargets 후 즉시 삭제되지 않고 fade-out 상태가 된다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]);
		animator.setTargets([]);
		expect(animator.count).toBe(1);
		const state = animator.getTrainState("1001");
		expect(state?.fadeOutStartedAt).toBeDefined();
	});

	it("fade-out 완료 후 열차가 삭제된다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]);
		animator.setTargets([]);

		const state = animator.getTrainState("1001");
		// fade-out 시작 시각을 과거로 조정하여 완료 시뮬레이션
		if (state) {
			state.fadeOutStartedAt = performance.now() - 600; // TRAIN_FADEOUT_MS(500) 초과
		}

		animator.update();

		expect(animator.count).toBe(0);
		expect(animator.getTrainState("1001")).toBeUndefined();
	});

	it("fade-out 중 복귀하면 fade-out이 취소된다", () => {
		animator.setTargets([MOCK_TRAIN_ARRIVE]);
		animator.setTargets([]); // fade-out 시작

		const stateFading = animator.getTrainState("1001");
		expect(stateFading?.fadeOutStartedAt).toBeDefined();

		animator.setTargets([MOCK_TRAIN_ARRIVE]); // 같은 열차 복귀
		const stateRevived = animator.getTrainState("1001");
		expect(stateRevived?.fadeOutStartedAt).toBeUndefined();
		expect(animator.count).toBe(1);
	});
});
