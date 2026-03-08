import { create } from "zustand";

interface MapState {
	scale: number;
	offsetX: number;
	offsetY: number;
	isDragging: boolean;
	setScale: (scale: number) => void;
	setOffset: (x: number, y: number) => void;
	setIsDragging: (isDragging: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
	scale: 1,
	offsetX: 0,
	offsetY: 0,
	isDragging: false,
	setScale: (scale) => set({ scale }),
	setOffset: (offsetX, offsetY) => set({ offsetX, offsetY }),
	setIsDragging: (isDragging) => set({ isDragging }),
}));
