import { useStationStore } from "@/stores/useStationStore";
import type { Station } from "@/types/station";

/**
 * 역 클릭 시 Zustand 스토어의 selectedStation을 업데이트한다.
 */
export function handleStationTap(station: Station): void {
	useStationStore.getState().selectStation(station);
}
