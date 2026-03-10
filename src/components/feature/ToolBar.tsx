import { useMapStore } from "@/stores/useMapStore";
import { usePerfStore } from "@/stores/usePerfStore";
import { useRouteStore } from "@/stores/useRouteStore";

/**
 * 우측 상단 도구 버튼 — 경로 탐색 + 히트맵 토글 + FPS 모니터 토글.
 */
export function ToolBar() {
	const heatmapEnabled = useMapStore((s) => s.heatmapEnabled);
	const toggleHeatmap = useMapStore((s) => s.toggleHeatmap);
	const perfVisible = usePerfStore((s) => s.visible);
	const togglePerf = usePerfStore((s) => s.toggleVisible);
	const isRouteMode = useRouteStore((s) => s.isRouteMode);
	const toggleRouteMode = useRouteStore((s) => s.toggleRouteMode);

	return (
		<div className="pointer-events-auto absolute top-4 right-6 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-2 backdrop-blur-sm">
			<button
				type="button"
				onClick={toggleRouteMode}
				title="경로 탐색 (R)"
				className={`cursor-pointer rounded px-2 py-0.5 text-sm transition-colors ${
					isRouteMode ? "bg-green-500/80 text-white" : "text-white/50 hover:text-white"
				}`}
			>
				경로
			</button>
			<button
				type="button"
				onClick={toggleHeatmap}
				title="혼잡도 히트맵 (H)"
				className={`cursor-pointer rounded px-2 py-0.5 text-sm transition-colors ${
					heatmapEnabled ? "bg-orange-500/80 text-white" : "text-white/50 hover:text-white"
				}`}
			>
				히트맵
			</button>
			<button
				type="button"
				onClick={togglePerf}
				title="성능 모니터 (P)"
				className={`cursor-pointer rounded px-2 py-0.5 text-sm transition-colors ${
					perfVisible ? "bg-blue-500/80 text-white" : "text-white/50 hover:text-white"
				}`}
			>
				FPS
			</button>
		</div>
	);
}
