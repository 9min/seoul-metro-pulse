import type { Container } from "pixi.js";
import { Graphics } from "pixi.js";
import { LINE_COLORS } from "@/constants/lineColors";
import { LINE_WIDTH } from "@/constants/mapConfig";
import type { ScreenCoord } from "@/types/map";
import type { StationLink } from "@/types/station";

/**
 * 호선별로 Graphics 객체를 생성하여 노선 링크를 일괄 렌더링한다.
 * 각 Graphics의 label에 호선 번호를 저장하여 updateLinksAlpha에서 참조한다.
 */
export function drawLinks(
	linksLayer: Container,
	links: StationLink[],
	stationScreenMap: Map<string, ScreenCoord>,
): void {
	linksLayer.removeChildren();

	// 호선별 Graphics를 미리 생성 (배치 렌더링)
	const lineGraphicsMap = new Map<number, Graphics>();

	for (const link of links) {
		const sourceCoord = stationScreenMap.get(link.source);
		const targetCoord = stationScreenMap.get(link.target);

		if (sourceCoord === undefined || targetCoord === undefined) {
			continue;
		}

		let gfx = lineGraphicsMap.get(link.line);
		if (gfx === undefined) {
			gfx = new Graphics();
			gfx.label = String(link.line);
			lineGraphicsMap.set(link.line, gfx);
		}

		const colorHex = LINE_COLORS[link.line];
		const color = colorHex !== undefined ? parseInt(colorHex.replace("#", ""), 16) : 0xffffff;

		gfx
			.moveTo(sourceCoord.x, sourceCoord.y)
			.lineTo(targetCoord.x, targetCoord.y)
			.stroke({ width: LINE_WIDTH, color, alpha: 0.9 });
	}

	for (const gfx of lineGraphicsMap.values()) {
		linksLayer.addChild(gfx);
	}
}

/**
 * 활성 노선 필터에 따라 linksLayer 자식 Graphics의 alpha를 업데이트한다.
 * label에 저장된 호선 번호를 기준으로 비활성 노선을 숨긴다.
 */
export function updateLinksAlpha(linksLayer: Container, activeLines: Set<number>): void {
	for (const child of linksLayer.children) {
		const line = Number(child.label);
		child.alpha = activeLines.has(line) ? 1 : 0;
	}
}
