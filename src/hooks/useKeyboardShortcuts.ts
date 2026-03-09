import { useEffect } from "react";
import { useMapStore } from "@/stores/useMapStore";
import { usePerfStore } from "@/stores/usePerfStore";
import { useStationStore } from "@/stores/useStationStore";
import { useTrainStore } from "@/stores/useTrainStore";

/**
 * 전역 키보드 이벤트 핸들러 (테스트 가능하도록 분리).
 * - Esc: 선택된 역/열차 해제
 * - P: 성능 모니터 토글
 * - H: 히트맵 토글
 */
export function handleGlobalKeyDown(event: KeyboardEvent): void {
	// input/textarea 등에서는 단축키 무시
	const target = event.target as HTMLElement | null;
	if (target !== null && target !== undefined) {
		const tag = target.tagName;
		if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
	}

	if (event.key === "Escape") {
		useStationStore.getState().selectStation(null);
		useTrainStore.getState().selectTrain(null);
	} else if (event.key === "p" || event.key === "P") {
		usePerfStore.getState().toggleVisible();
	} else if (event.key === "h" || event.key === "H") {
		useMapStore.getState().toggleHeatmap();
	}
}

/**
 * 전역 키보드 단축키를 등록한다.
 * - Esc: 선택된 역/열차 해제
 */
export function useKeyboardShortcuts(): void {
	useEffect(() => {
		window.addEventListener("keydown", handleGlobalKeyDown);
		return () => window.removeEventListener("keydown", handleGlobalKeyDown);
	}, []);
}
