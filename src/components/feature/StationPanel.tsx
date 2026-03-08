import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";
import { useStationStore } from "@/stores/useStationStore";

/** 역 클릭 시 우하단에 표시되는 정보 패널 */
export function StationPanel() {
	const selectedStation = useStationStore((state) => state.selectedStation);
	const selectStation = useStationStore((state) => state.selectStation);

	if (selectedStation === null) return null;

	return (
		<div className="pointer-events-auto absolute right-6 bottom-6 min-w-[200px] rounded-xl border border-white/10 bg-gray-900/90 p-4 shadow-2xl backdrop-blur-md">
			<div className="mb-3 flex items-start justify-between gap-2">
				<h2 className="text-lg font-bold text-white">{selectedStation.name}</h2>
				<IconButton onClick={() => selectStation(null)} label="패널 닫기">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</IconButton>
			</div>
			<div className="flex items-center gap-2">
				<Badge line={selectedStation.line} />
			</div>
			<div className="mt-3 text-xs text-gray-400">
				<span>ID: {selectedStation.id}</span>
			</div>
		</div>
	);
}
