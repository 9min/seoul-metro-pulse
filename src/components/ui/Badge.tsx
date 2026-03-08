import { LINE_COLORS } from "@/constants/lineColors";

interface BadgeProps {
	line: number;
}

/** 호선 번호 뱃지 컴포넌트 */
export function Badge({ line }: BadgeProps) {
	const color = LINE_COLORS[line] ?? "#888888";

	return (
		<span
			className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold text-white"
			style={{ backgroundColor: color }}
		>
			{line}호선
		</span>
	);
}
