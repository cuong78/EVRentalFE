export interface Station {
	id: number;
	address: string;
	city: string;
}

export interface VehicleSearchParams {
	stationId: number;
	startDate: string;
	endDate: string;
}

export interface VehicleType {
	typeId: number;
	typeName: string;
	depositAmount: number;
	rentalRate: number;
	totalVehicles: number;
	availableCount: number;
	availableVehicles: Vehicle[];
}

export interface Vehicle {
	id: number;
	type: {
		id: number;
		name: string;
		depositAmount: number;
		rentalRate: number;
	};
	station: {
		id: number;
		city: string;
		address: string;
	};
}

export interface VehicleSearchResponse {
	statusCode: number;
	message: string;
	data: {
		stationId: number;
		stationName: string;
		searchStartDate: string;
		searchEndDate: string;
		vehicleTypes: VehicleType[];
	};
}
