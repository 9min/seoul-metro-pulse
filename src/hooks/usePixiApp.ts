import { useEffect, useState } from "react";
import type { PixiScene } from "@/canvas/renderer/PixiApp";
import { createPixiApp } from "@/canvas/renderer/PixiApp";

/**
 * PixiJS Application을 초기화하고 PixiScene을 state로 반환한다.
 *
 * 핵심 설계:
 * - useEffect 호출마다 새로운 canvas를 생성하여 DOM에 추가한다.
 * - 이렇게 하면 StrictMode 이중 실행 시 두 effect가 서로 다른 canvas를
 *   사용하므로 WebGL 컨텍스트 충돌이 발생하지 않는다.
 * - cleanup(mounted=false) 시 해당 effect의 canvas를 제거한다.
 */
export function usePixiApp(containerRef: React.RefObject<HTMLDivElement | null>): PixiScene | null {
	const [scene, setScene] = useState<PixiScene | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: 마운트 1회 실행 의도
	useEffect(() => {
		const container = containerRef.current;
		if (container === null) return;

		// effect 호출마다 독립적인 canvas를 생성 → StrictMode 충돌 방지
		const canvas = document.createElement("canvas");
		canvas.style.cssText = "display:block;width:100%;height:100%";
		container.appendChild(canvas);

		let mounted = true;

		createPixiApp(canvas).then((newScene) => {
			if (!mounted) {
				// StrictMode cleanup으로 이미 무효화된 경우 리소스 해제
				newScene.destroy();
				canvas.remove();
				return;
			}
			setScene(newScene);
		});

		return (): void => {
			mounted = false;
			// async가 아직 미완료면 콜백에서 canvas.remove()를 처리한다.
			// 완료된 경우 아래 [scene] effect가 cleanup 책임을 진다.
		};
	}, []);

	// 실제 언마운트 시 PixiJS 리소스와 canvas를 해제한다
	useEffect(() => {
		const currentScene = scene;
		return (): void => {
			if (currentScene !== null) {
				currentScene.destroy();
				currentScene.canvas.remove();
			}
		};
	}, [scene]);

	return scene;
}
