import React, { useState } from "react";
import SearchForm from "../../components/ui/rental/SearchForm";
import VehicleCard from "../../components/ui/rental/VehicleCard";
import { vehicleService } from "../../service/vehicleService";
import { type VehicleSearchResponse, type VehicleSearchParams } from "../../service/vehicleService";

// Import Vehicle type from VehicleCard
interface Vehicle {
	id: number;
	name: string;
	type: string;
	battery: number;
	price: string;
	image: string;
	features: string[];
	location: string;
	available: boolean;
	rating: number;
	reviews: number;
	depositAmount?: number;
	rentalRate?: number;
	status?: string;
	conditionNotes?: string;
	photos?: string;
}

interface SearchData {
	rentalType: 'daily' | 'monthly' | 'yearly';
	stationId: number;
	pickupDate: string;
	returnDate: string;
}

// Helper functions
const getVehicleIcon = (typeName: string): string => {
	switch (typeName.toLowerCase()) {
		case 'electric motorbike':
			return '🏍️';
		case 'electric bicycle':
			return '🚲';
		case 'electric scooter':
			return '🛴';
		case 'electric car':
			return '🚗';
		default:
			return '🛵';
	}
};

const getVehicleFeatures = (typeName: string): string[] => {
	switch (typeName.toLowerCase()) {
		case 'electric motorbike':
			return ['GPS', 'Sạc nhanh', 'Khóa thông minh'];
		case 'electric bicycle':
			return ['Gấp gọn', 'Nhẹ', 'Pin lâu'];
		case 'electric scooter':
			return ['Gấp gọn', 'Nhẹ', 'App kết nối'];
		case 'electric car':
			return ['Điều hòa', 'GPS', 'Bluetooth'];
		default:
			return ['GPS', 'Sạc nhanh'];
	}
};

const RentalPage: React.FC = () => {
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [searchData, setSearchData] = useState<SearchData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSearch = async (data: SearchData) => {
		setSearchData(data);
		setLoading(true);
		setError(null);
		
		try {
			const searchParams: VehicleSearchParams = {
				stationId: data.stationId,
				startDate: data.pickupDate,
				endDate: data.returnDate
			};
			
			const response: VehicleSearchResponse = await vehicleService.searchVehicles(searchParams);
			
			// Transform API response to match our VehicleCard component
			const transformedVehicles = response.data.vehicleTypes.flatMap(vehicleType => 
				vehicleType.availableVehicles.map(vehicle => ({
					id: vehicle.id,
					name: vehicleType.typeName,
					type: vehicleType.typeName,
					battery: 85, // Default value since not in API
					price: vehicleType.rentalRate.toString(),
					image: getVehicleIcon(vehicleType.typeName),
					features: getVehicleFeatures(vehicleType.typeName),
					location: vehicle.station.address,
					available: true, // All vehicles in availableVehicles are available
					rating: 4.5, // Default rating
					reviews: 100, // Default reviews
					depositAmount: vehicleType.depositAmount,
					rentalRate: vehicleType.rentalRate
				}))
			);
			
			setVehicles(transformedVehicles);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tìm kiếm xe');
			setVehicles([]);
		} finally {
			setLoading(false);
		}
	};

	const handleVehicleSelect = (vehicle: Vehicle) => {
		console.log('Selected vehicle:', vehicle);
		// Handle vehicle selection logic here
	};

	return (
		<div className="container mx-auto px-6 py-12">
			{/* Header */}
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold text-gray-800 mb-4">
					Thuê xe điện
				</h1>
				<p className="text-xl text-gray-600">
					Chọn xe điện phù hợp với nhu cầu của bạn
				</p>
			</div>

			{/* Search Form */}
			<div className="mb-12">
				<SearchForm onSearch={handleSearch} />
			</div>

			{/* Results */}
			{searchData && (
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-800 mb-2">
						Kết quả tìm kiếm
					</h2>
					<p className="text-gray-600 mb-4">
						Tìm thấy {vehicles.length} xe có sẵn tại điểm thuê
					</p>
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<p className="text-sm text-blue-800">
							<strong>Loại thuê:</strong> {searchData.rentalType === 'daily' ? 'Thuê theo ngày' : searchData.rentalType === 'monthly' ? 'Thuê theo tháng' : 'Thuê theo năm'}
						</p>
						<p className="text-sm text-blue-800 mt-1">
							<strong>Thời gian:</strong> {searchData.pickupDate} - {searchData.returnDate}
						</p>
					</div>
				</div>
			)}

			{/* Loading State */}
			{loading && (
				<div className="text-center py-12">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
					<p className="mt-4 text-gray-600">Đang tìm kiếm xe...</p>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="text-center py-12">
					<div className="text-6xl mb-4">⚠️</div>
					<h3 className="text-xl font-semibold text-red-600 mb-2">
						Lỗi tìm kiếm
					</h3>
					<p className="text-gray-600 mb-6">{error}</p>
					<button 
						onClick={() => setError(null)}
						className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-8 rounded-xl font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300"
					>
						Thử lại
					</button>
				</div>
			)}

			{/* Vehicle Grid */}
			{!loading && !error && vehicles.length > 0 && (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{vehicles.map((vehicle) => (
						<VehicleCard 
							key={vehicle.id} 
							vehicle={vehicle} 
							onSelect={handleVehicleSelect}
						/>
					))}
				</div>
			)}

			{/* No results message */}
			{!loading && !error && vehicles.length === 0 && searchData && (
				<div className="text-center py-12">
					<div className="text-6xl mb-4">🔍</div>
					<h3 className="text-xl font-semibold text-gray-800 mb-2">
						Không tìm thấy xe phù hợp
					</h3>
					<p className="text-gray-600 mb-6">
						Vui lòng thử lại với thông tin tìm kiếm khác
					</p>
					<button 
						onClick={() => setSearchData(null)}
						className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-8 rounded-xl font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300"
					>
						Tìm kiếm lại
					</button>
				</div>
			)}
		</div>
	);
};

export default RentalPage;