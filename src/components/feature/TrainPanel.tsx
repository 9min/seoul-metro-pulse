import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";
import { OVERLAY_PANEL } from "@/constants/overlayStyles";
import { useStationStore } from "@/stores/useStationStore";
import { useTrainStore } from "@/stores/useTrainStore";

/** 열차 클릭 시 좌하단에 표시되는 추적 패널 */
export function TrainPanel() {
	const selectedTrainNo = useTrainStore((state) => state.selectedTrainNo);
	const selectTrain = useTrainStore((state) => state.selectTrain);
	const interpolatedTrains = useTrainStore((state) => state.interpolatedTrains);
	const stationMap = useStationStore((state) => state.stationMap);

	if (selectedTrainNo === null) return null;

	const train = interpolatedTrains.find((t) => t.trainNo === selectedTrainNo);
	if (train === undefined) return null;

	const fromStation = stationMap.get(train.stationId);
	const toStation = stationMap.get(train.nextStationId);

	return (
		<>
			{/* 외부 영역 클릭 시 패널 닫기 */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: 백드롭은 마우스 전용 */}
			<div className="pointer-events-auto absolute inset-0" onClick={() => selectTrain(null)} />
			<div
				className={`pointer-events-auto absolute left-2 bottom-2 right-2 sm:left-4 sm:bottom-4 sm:right-auto sm:min-w-[240px] ${OVERLAY_PANEL} p-4`}
			>
				<div className="mb-3 flex items-start justify-between gap-2">
					<h2 className="text-lg font-bold text-white">{train.trainNo}</h2>
					<IconButton onClick={() => selectTrain(null)} label="패널 닫기">
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
					<Badge line={train.line} />
					<span className="text-xs text-gray-400">{train.direction}</span>
				</div>
				<div className="mt-3 text-xs text-gray-300">
					<span>{fromStation?.name ?? train.stationId}</span>
					<span className="mx-2 text-gray-500">→</span>
					<span>{toStation?.name ?? train.nextStationId}</span>
				</div>
				<div className="mt-2 text-xs text-gray-500">{train.status}</div>
			</div>
		</>
	);
}
