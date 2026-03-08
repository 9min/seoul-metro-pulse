import type { Container } from "pixi.js";
import { ZOOM_MAX, ZOOM_MIN, ZOOM_SPEED } from "@/constants/mapConfig";
import { useMapStore } from "@/stores/useMapStore";

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
