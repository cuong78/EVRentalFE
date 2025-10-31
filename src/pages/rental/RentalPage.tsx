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

// Helper function to get vehicle details based on type name
const getVehicleDetails = (typeName: string) => {
	const name = typeName.toLowerCase();
	
	// VinFast VF 3
	if (name.includes('vf 3') || name.includes('vf3')) {
		return {
			category: 'Minicar',
			range: '210km (NEDC)',
			seats: '4 chỗ',
			trunk: 'Dung tích cốp 285L'
		};
	}
	
	// VinFast VF 5
	if (name.includes('vf 5') || name.includes('vf5')) {
		return {
			category: 'A-SUV',
			range: '326km (NEDC)',
			seats: '5 chỗ',
			trunk: 'Dung tích cốp 310L'
		};
	}
	
	// VinFast VF 6
	if (name.includes('vf 6') || name.includes('vf6')) {
		return {
			category: 'B-SUV',
			range: '460km (NEDC)',
			seats: '5 chỗ',
			trunk: 'Dung tích cốp 423L'
		};
	}
	
	// VinFast VF 7
	if (name.includes('vf 7') || name.includes('vf7')) {
		return {
			category: 'C-SUV',
			range: '450km (NEDC)',
			seats: '5 chỗ',
			trunk: 'Dung tích cốp 520L'
		};
	}
	
	// VinFast VF 8
	if (name.includes('vf 8') || name.includes('vf8')) {
		return {
			category: 'E-SUV',
			range: '471km (NEDC)',
			seats: '5 chỗ',
			trunk: 'Dung tích cốp 593L'
		};
	}
	
	// VinFast VF 9
	if (name.includes('vf 9') || name.includes('vf9')) {
		return {
			category: 'E-SUV',
			range: '438km (NEDC)',
			seats: '7 chỗ',
			trunk: 'Dung tích cốp 423L'
		};
	}
	
	// VinFast VF e34
	if (name.includes('e34')) {
		return {
			category: 'B-SUV',
			range: '300km (NEDC)',
			seats: '5 chỗ',
			trunk: 'Dung tích cốp 298L'
		};
	}
	
	// Electric Motorbike
	if (name.includes('motorbike') || name.includes('xe máy')) {
		return {
			category: 'Xe máy điện',
			range: '80-120km',
			seats: '2 chỗ',
			trunk: 'Cốp dưới yên'
		};
	}
	
	// Electric Scooter
	if (name.includes('scooter')) {
		return {
			category: 'Xe scooter điện',
			range: '40-60km',
			seats: '1 chỗ',
			trunk: 'Không có'
		};
	}
	
	// Electric Bicycle
	if (name.includes('bicycle') || name.includes('bike')) {
		return {
			category: 'Xe đạp điện',
			range: '50-70km',
			seats: '1 chỗ',
			trunk: 'Giỏ xe'
		};
	}
	
	// Default for unknown types
	return {
		category: 'Xe điện',
		range: '100km+',
		seats: '2-5 chỗ',
		trunk: 'Có sẵn'
	};
};

const RentalPage: React.FC = () => {
    const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeViewModel[]>([]);
	const [searchData, setSearchData] = useState<SearchData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
	const location = useLocation();

	// Auto-search khi vào trang hoặc có selectedStationId từ navigation
	useEffect(() => {
		const state = location.state as { selectedStationId?: number };
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);
		
		// Nếu có selectedStationId từ navigation, dùng nó
		// Ngược lại, mặc định dùng stationId = 1
		const stationId = state?.selectedStationId || 1;
		
		console.log('🔍 Auto-searching for station:', stationId);
		
		const autoSearchData: SearchData = {
			rentalType: 'daily',
			stationId: stationId,
			pickupDate: today.toISOString().split('T')[0],
			returnDate: tomorrow.toISOString().split('T')[0]
		};
		
		// Trigger search tự động
		handleSearch(autoSearchData);
		
		// Clear state để tránh auto-search lại khi component re-render
		if (state?.selectedStationId) {
			window.history.replaceState({}, document.title);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
            const transformedTypes: VehicleTypeViewModel[] = response.data.vehicleTypes.map(vt => {
				// Lấy ảnh từ xe đầu tiên trong danh sách available vehicles
				const firstVehicleImage = vt.availableVehicles?.[0]?.photos || '';
				const details = getVehicleDetails(vt.typeName);
				
				return {
					id: vt.typeId,
					name: vt.typeName,
					availableCount: vt.availableCount,
					rentalRate: vt.rentalRate,
					depositAmount: vt.depositAmount,
					image: firstVehicleImage || getVehicleIcon(vt.typeName), // Fallback to emoji if no image
					features: [details.category, details.range, details.seats, details.trunk]
				};
			});

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