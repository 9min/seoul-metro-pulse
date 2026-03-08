export interface Station {
	id: string;
	name: string;
	line: number;
	x: number;
	y: number;
}

export interface StationLink {
	source: string;
	target: string;
	line: number;
}
