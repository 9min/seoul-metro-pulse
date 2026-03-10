import type { Container } from "pixi.js";
import { ZOOM_MAX, ZOOM_MIN, ZOOM_SPEED } from "@/constants/mapConfig";
import { useMapStore } from "@/stores/useMapStore";
import { easeInOutCubic } from "@/utils/easing";

interface ZoomPanOptions {
	viewport: Container;
	canvas: HTMLCanvasElement;
}

/**
 * 마우스 휠 줌 및 드래그 팬 인터랙션을 설정한다.
 * @returns cleanup 함수
 */
export function setupZoomPan({ viewport, canvas }: ZoomPanOptions): () => void {
	let isDragging = false;
	let dragStartX = 0;
	let dragStartY = 0;
	let viewportStartX = 0;
	let viewportStartY = 0;

	const { setScale, setOffset, setIsDragging } = useMapStore.getState();

	const onWheel = (event: WheelEvent): void => {
		event.preventDefault();

		const rect = canvas.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;

		const oldScale = viewport.scale.x;
		const delta = event.deltaY * ZOOM_SPEED;
		const newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, oldScale * (1 - delta)));

		// 마우스 포인터 기준으로 pivot 보정
		const worldX = (mouseX - viewport.x) / oldScale;
		const worldY = (mouseY - viewport.y) / oldScale;

		viewport.scale.set(newScale);
		viewport.x = mouseX - worldX * newScale;
		viewport.y = mouseY - worldY * newScale;

		setScale(newScale);
		setOffset(viewport.x, viewport.y);
	};

	const onPointerDown = (event: PointerEvent): void => {
		isDragging = true;
		dragStartX = event.clientX;
		dragStartY = event.clientY;
		viewportStartX = viewport.x;
		viewportStartY = viewport.y;
		canvas.setPointerCapture(event.pointerId);
		setIsDragging(true);
	};

	const onPointerMove = (event: PointerEvent): void => {
		if (!isDragging) return;
		const dx = event.clientX - dragStartX;
		const dy = event.clientY - dragStartY;
		viewport.x = viewportStartX + dx;
		viewport.y = viewportStartY + dy;
		setOffset(viewport.x, viewport.y);
	};

	const onPointerUp = (event: PointerEvent): void => {
		if (!isDragging) return;
		isDragging = false;
		canvas.releasePointerCapture(event.pointerId);
		setIsDragging(false);
	};

	canvas.addEventListener("wheel", onWheel, { passive: false });
	canvas.addEventListener("pointerdown", onPointerDown);
	canvas.addEventListener("pointermove", onPointerMove);
	canvas.addEventListener("pointerup", onPointerUp);
	canvas.addEventListener("pointercancel", onPointerUp);

	return (): void => {
		canvas.removeEventListener("wheel", onWheel);
		canvas.removeEventListener("pointerdown", onPointerDown);
		canvas.removeEventListener("pointermove", onPointerMove);
		canvas.removeEventListener("pointerup", onPointerUp);
		canvas.removeEventListener("pointercancel", onPointerUp);
	};
}

/** flyToStation 애니메이션 지속 시간 (ms) */
const FLY_DURATION_MS = 800;

/** 목표 줌 레벨 */
const FLY_TARGET_SCALE = 2.0;

/**
 * 카메라를 특정 월드 좌표로 부드럽게 이동한다.
 * @param viewport - PixiJS viewport Container
 * @param targetX - 목표 월드 X 좌표
 * @param targetY - 목표 월드 Y 좌표
 * @param targetScale - 목표 줌 배율 (기본 2.0)
 */
export function flyToStation(
	viewport: Container,
	targetX: number,
	targetY: number,
	targetScale = FLY_TARGET_SCALE,
): void {
	const startX = viewport.x;
	const startY = viewport.y;
	const startScale = viewport.scale.x;
	const startTime = performance.now();

	const endX = window.innerWidth / 2 - targetX * targetScale;
	const endY = window.innerHeight / 2 - targetY * targetScale;

	const { setScale, setOffset } = useMapStore.getState();

	const animate = (): void => {
		const elapsed = performance.now() - startTime;
		const t = Math.min(elapsed / FLY_DURATION_MS, 1);
		const eased = easeInOutCubic(t);

		const currentScale = startScale + (targetScale - startScale) * eased;
		viewport.scale.set(currentScale);
		viewport.x = startX + (endX - startX) * eased;
		viewport.y = startY + (endY - startY) * eased;

		setScale(currentScale);
		setOffset(viewport.x, viewport.y);

		if (t < 1) {
			requestAnimationFrame(animate);
		}
	};

	requestAnimationFrame(animate);
}
