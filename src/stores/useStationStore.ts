import { create } from "zustand";
import type { Station, StationLink } from "@/types/station";

interface StationState {
	stations: Station[];
	links: StationLink[];
	selectedStation: Station | null;
	stationMap: Map<string, Station>;
	initStations: (stations: Station[], links: StationLink[]) => void;
	selectStation: (station: Station | null) => void;
}

export const useStationStore = create<StationState>((set) => ({
	stations: [],
	links: [],
	selectedStation: null,
	stationMap: new Map(),
	initStations: (stations, links) => {
		const stationMap = new Map<string, Station>();
		for (const station of stations) {
			stationMap.set(station.id, station);
		}
		set({ stations, links, stationMap });
	},
	selectStation: (selectedStation) => set({ selectedStation }),
}));
