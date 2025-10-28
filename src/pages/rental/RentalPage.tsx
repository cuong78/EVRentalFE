import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import SearchForm from "../../components/ui/rental/SearchForm";
import VehicleTypeCard from "../../components/ui/rental/VehicleTypeCard";
import { vehicleService } from "../../service/vehicleService";
import { type VehicleSearchResponse, type VehicleSearchParams } from "../../service/vehicleService";

// Import Vehicle type from VehicleCard
interface VehicleTypeViewModel {
    id: number;
    name: string;
    availableCount: number;
    rentalRate: number;
    depositAmount: number;
    image: string;
    features: string[];
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
    const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeViewModel[]>([]);
	const [searchData, setSearchData] = useState<SearchData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
	const location = useLocation();

	// Auto-search khi có selectedStationId từ navigation
	useEffect(() => {
		const state = location.state as { selectedStationId?: number };
		if (state?.selectedStationId) {
			console.log('🔍 Auto-searching for station:', state.selectedStationId);
			
			// Tạo default search data với station đã chọn
			// Ngày hôm nay
			const today = new Date();
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);
			
			const autoSearchData: SearchData = {
				rentalType: 'daily',
				stationId: state.selectedStationId,
				pickupDate: today.toISOString().split('T')[0],
				returnDate: tomorrow.toISOString().split('T')[0]
			};
			
			// Trigger search tự động
			handleSearch(autoSearchData);
			
			// Clear state để tránh auto-search lại khi component re-render
			window.history.replaceState({}, document.title);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.state]);

	const handleSearch = async (data: SearchData) => {
		setSearchData(data);
		try { sessionStorage.setItem('lastRentalSearch', JSON.stringify(data)); } catch {}
		setLoading(true);
		setError(null);
		
		try {
			const searchParams: VehicleSearchParams = {
				stationId: data.stationId,
				startDate: data.pickupDate,
				endDate: data.returnDate
			};
			
            const response: VehicleSearchResponse = await vehicleService.searchVehicles(searchParams);

            // Transform API response to show vehicle TYPES instead of individual vehicles
            const transformedTypes: VehicleTypeViewModel[] = response.data.vehicleTypes.map(vt => ({
                id: vt.typeId,
                name: vt.typeName,
                availableCount: vt.availableCount,
                rentalRate: vt.rentalRate,
                depositAmount: vt.depositAmount,
                image: getVehicleIcon(vt.typeName),
                features: getVehicleFeatures(vt.typeName)
            }));

            setVehicleTypes(transformedTypes);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tìm kiếm xe');
            setVehicleTypes([]);
		} finally {
			setLoading(false);
		}
	};

    const handleTypeSelect = (typeName: string) => {
        const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = slugify(typeName);
        navigate(`/thue-xe/${slug}`);
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
				<SearchForm onSearch={handleSearch} initialSearchData={searchData} />
			</div>

            {/* Results */}
			{searchData && (
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-800 mb-2">
						Kết quả tìm kiếm
					</h2>
					<p className="text-gray-600 mb-4">
                        Tìm thấy {vehicleTypes.length} loại xe có sẵn tại điểm thuê
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

            {/* Vehicle Type Grid */}
            {!loading && !error && vehicleTypes.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {vehicleTypes.map((vt) => (
                        <VehicleTypeCard
                            key={vt.id}
                            id={vt.id}
                            name={vt.name}
                            availableCount={vt.availableCount}
                            rentalRate={vt.rentalRate}
                            depositAmount={vt.depositAmount}
                            image={vt.image}
                            features={vt.features}
                            onSelect={handleTypeSelect}
                        />
                    ))}
                </div>
            )}

            {/* No results message */}
            {!loading && !error && vehicleTypes.length === 0 && searchData && (
				<div className="text-center py-12">
					<div className="text-6xl mb-4">🔍</div>
					<h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Không tìm thấy loại xe phù hợp
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