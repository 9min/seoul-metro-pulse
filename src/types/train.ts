export interface TrainPosition {
	trainNo: string;
	stationId: string;
	stationName: string;
	line: string;
	direction: "상행" | "하행";
	status: "진입" | "도착" | "출발";
}

export interface InterpolatedTrain {
	trainNo: string;
	line: string;
	x: number;
	y: number;
	direction: "상행" | "하행";
	progress: number;
	fromStationId: string;
	toStationId: string;
}
