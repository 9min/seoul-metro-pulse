import { create } from "zustand";

const ALL_LINES_INIT = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

interface MapState {
	scale: number;
	offsetX: number;
	offsetY: number;
	isDragging: boolean;
	activeLines: Set<number>;
	setScale: (scale: number) => void;
	setOffset: (x: number, y: number) => void;
	setIsDragging: (isDragging: boolean) => void;
	toggleLine: (line: number) => void;
	setAllLinesActive: (active: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
	scale: 1,
	offsetX: 0,
	offsetY: 0,
	isDragging: false,
	activeLines: new Set(ALL_LINES_INIT),
	setScale: (scale) => set({ scale }),
	setOffset: (offsetX, offsetY) => set({ offsetX, offsetY }),
	setIsDragging: (isDragging) => set({ isDragging }),
	toggleLine: (line) =>
		set((state) => {
			const next = new Set(state.activeLines);
			if (next.has(line)) {
				next.delete(line);
			} else {
				next.add(line);
			}
			return { activeLines: next };
		}),
	setAllLinesActive: (active) => set({ activeLines: active ? new Set(ALL_LINES_INIT) : new Set() }),
}));
