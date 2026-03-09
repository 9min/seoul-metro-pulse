import { LINE_COLORS } from "@/constants/lineColors";
import { useMapStore } from "@/stores/useMapStore";

const LINES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/**
 * 노선 필터 UI — 상단 중앙에 고정된 1~9호선 토글 버튼.
 * 비활성 노선의 역/링크/열차를 지도에서 숨긴다.
 */
export function LineFilter() {
	const activeLines = useMapStore((s) => s.activeLines);
	const toggleLine = useMapStore((s) => s.toggleLine);
	const setAllLinesActive = useMapStore((s) => s.setAllLinesActive);

	const allActive = activeLines.size === LINES.length;

	return (
		<div className="pointer-events-auto absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
			{LINES.map((line) => {
				const colorHex = LINE_COLORS[line] ?? "#ffffff";
				const isActive = activeLines.has(line);
				return (
					<button
						key={line}
						type="button"
						onClick={() => toggleLine(line)}
						className="h-7 w-7 rounded-full text-xs font-bold text-white transition-opacity"
						style={{
							backgroundColor: colorHex,
							opacity: isActive ? 1 : 0.25,
						}}
					>
						{line}
					</button>
				);
			})}
			<div className="mx-1 h-4 w-px bg-white/30" />
			<button
				type="button"
				onClick={() => setAllLinesActive(!allActive)}
				className="rounded px-2 py-0.5 text-xs text-white/70 transition-colors hover:text-white"
			>
				{allActive ? "전체해제" : "전체"}
			</button>
		</div>
	);
}
