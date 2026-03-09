import { type Container, Graphics } from "pixi.js";
import { LINE_COLORS } from "@/constants/lineColors";
import { TRAIN_CAPSULE_LENGTH, TRAIN_CAPSULE_WIDTH } from "@/constants/mapConfig";
import type { AnimatedTrainState } from "@/types/train";

/** 호선 색상 문자열을 16진수 숫자로 변환한다 */
function colorToHex(color: string): number {
	return Number.parseInt(color.replace("#", ""), 16);
}

/** 16진수 색상을 지정 비율만큼 어둡게 만든다 (0.7 = 30% 어둡게) */
function darkenColor(hex: number, factor: number): number {
	const r = Math.floor(((hex >> 16) & 0xff) * factor);
	const g = Math.floor(((hex >> 8) & 0xff) * factor);
	const b = Math.floor((hex & 0xff) * factor);
	return (r << 16) | (g << 8) | b;
}

/** 단일 열차 캡슐 Graphics를 생성하고 호선 색상으로 그린다 */
export function createTrainGraphics(line: number): Graphics | null {
	const colorStr = LINE_COLORS[line];
	if (colorStr === undefined) return null;

	const hex = colorToHex(colorStr);
	const gfx = new Graphics();
	const L = TRAIN_CAPSULE_LENGTH;
	const W = TRAIN_CAPSULE_WIDTH;

	// 글로우 효과 (은은한 반투명 캡슐)
	gfx.roundRect(-L * 1.25, -W * 1.25, L * 2.5, W * 2.5, W * 1.25).fill({
		color: hex,
		alpha: 0.15,
	});

	// 본체 캡슐 (borderRadius=W → 양 끝 반원)
	gfx
		.roundRect(-L, -W, L * 2, W * 2, W)
		.fill({ color: hex, alpha: 0.9 })
		.stroke({ width: 1.2, color: darkenColor(hex, 0.6) });

	// 헤드라이트 빔 (전방으로 퍼지는 빛)
	gfx
		.moveTo(L, 0)
		.lineTo(L + L * 0.8, -W * 0.7)
		.lineTo(L + L * 0.8, W * 0.7)
		.closePath()
		.fill({ color: 0xffffff, alpha: 0.25 });

	// 헤드라이트 빔 내부 (더 밝은 중심부)
	gfx
		.moveTo(L, 0)
		.lineTo(L + L * 0.5, -W * 0.35)
		.lineTo(L + L * 0.5, W * 0.35)
		.closePath()
		.fill({ color: 0xffffff, alpha: 0.4 });

	// 헤드라이트 점 (전방에 배치)
	gfx.circle(L * 0.5, 0, W * 0.35).fill({
		color: 0xffffff,
		alpha: 0.95,
	});

	return gfx;
}

/** 각도를 [-π, π] 범위로 정규화한다 */
function normalizeAngle(a: number): number {
	let r = a % (Math.PI * 2);
	if (r > Math.PI) r -= Math.PI * 2;
	if (r < -Math.PI) r += Math.PI * 2;
	return r;
}

/** 프레임별 회전 보간 계수 (60fps 기준 약 8~10프레임에 90% 수렴) */
const ROTATION_LERP_FACTOR = 0.12;

/** 열차 이동 방향 각도(라디안)를 반환한다. 정지 시 NaN. */
function computeTrainAngle(train: AnimatedTrainState): number {
	const dx = train.targetX - train.startX;
	const dy = train.targetY - train.startY;
	if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return Number.NaN;
	return Math.atan2(dy, dx);
}

const ALL_LINES = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

/** 선택 상태 및 노선 필터에 따른 열차 alpha 값을 반환한다 (비활성 노선 > 역 선택 > 열차 선택 > 기본) */
function computeTrainAlpha(
	trainNo: string,
	toStationId: string,
	selectedTrainNo: string | null,
	selectedStationId: string | null,
	line: number,
	activeLines: Set<number>,
): number {
	if (!activeLines.has(line)) return 0;
	if (selectedStationId !== null) return toStationId === selectedStationId ? 1.0 : 0.15;
	if (selectedTrainNo !== null) return trainNo === selectedTrainNo ? 1.0 : 0.15;
	return 1.0;
}

/** 신규 열차 Graphics를 초기화하고 풀/레이어에 등록한다 */
function registerTrain(
	trainsLayer: Container,
	pool: Map<string, Graphics>,
	train: AnimatedTrainState,
	onTrainTap: (trainNo: string) => void,
): Graphics | null {
	const created = createTrainGraphics(train.line);
	if (created === null) return null;
	created.label = train.trainNo;
	created.eventMode = "static";
	created.cursor = "pointer";
	const trainNo = train.trainNo;
	created.on("pointertap", () => onTrainTap(trainNo));
	pool.set(train.trainNo, created);
	trainsLayer.addChild(created);
	return created;
}

/**
 * 애니메이션 상태 배열로부터 열차 캡슐을 렌더링한다.
 * Graphics 풀링: trainNo → Graphics 맵으로 안정적인 열차 identity를 보장한다.
 * 역/열차 선택 및 노선 필터에 따라 alpha를 조정한다.
 * 이동 방향에 따라 캡슐을 회전시킨다.
 */
export function drawAnimatedTrains(
	trainsLayer: Container,
	animatedTrains: AnimatedTrainState[],
	pool: Map<string, Graphics>,
	selectedTrainNo: string | null,
	selectedStationId: string | null,
	onTrainTap: (trainNo: string) => void,
	activeLines: Set<number> = ALL_LINES,
): void {
	for (const train of animatedTrains) {
		const gfx = pool.get(train.trainNo) ?? registerTrain(trainsLayer, pool, train, onTrainTap);
		if (gfx === null) continue;

		gfx.x = train.currentX;
		gfx.y = train.currentY;

		// 이동 방향으로 캡슐 부드럽게 회전 (정지 시 이전 rotation 유지)
		const angle = computeTrainAngle(train);
		if (!Number.isNaN(angle)) {
			const diff = normalizeAngle(angle - gfx.rotation);
			gfx.rotation += diff * ROTATION_LERP_FACTOR;
		}

		gfx.alpha = computeTrainAlpha(
			train.trainNo,
			train.toStationId,
			selectedTrainNo,
			selectedStationId,
			train.line,
			activeLines,
		);
	}
}
