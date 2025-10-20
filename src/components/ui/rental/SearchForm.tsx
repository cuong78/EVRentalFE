import React, { useState, useEffect } from 'react';
import { Car, MapPin, Calendar, CalendarDays } from 'lucide-react';
import { vehicleService, type Station } from '../../../service/vehicleService';

interface SearchFormProps {
	onSearch: (searchData: SearchData) => void;
}

interface SearchData {
	rentalType: 'daily' | 'monthly' | 'yearly';
	stationId: number;
	pickupDate: string;
	returnDate: string;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
	const [searchData, setSearchData] = useState<SearchData>({
		rentalType: 'daily',
		stationId: 0,
		pickupDate: new Date().toISOString().split('T')[0],
		returnDate: ''
	});
	const [stations, setStations] = useState<Station[]>([]);
	const [loading, setLoading] = useState(false);

	// Load stations when component mounts
	useEffect(() => {
		const loadStations = async () => {
			try {
				setLoading(true);
				const stationsData = await vehicleService.getStations();
				setStations(stationsData);
			} catch (error) {
				console.error('Failed to load stations:', error);
				// Fallback to hardcoded stations if API fails
				setStations([
					{ id: 1, address: '123 Nguyen Van Linh, District 7, Ho Chi Minh City', city: 'Ho Chi Minh City' },
					{ id: 2, address: '456 Le Van Viet, Thu Duc City, Ho Chi Minh City', city: 'Ho Chi Minh City' },
					{ id: 3, address: '789 Cau Giay, Cau Giay District, Hanoi', city: 'Hanoi' },
					{ id: 4, address: '321 Bach Dang, Hai Chau District, Da Nang', city: 'Da Nang' }
				]);
			} finally {
				setLoading(false);
			}
		};

		loadStations();
	}, []);

	const handleInputChange = (field: keyof SearchData, value: string | number) => {
		setSearchData(prev => ({
			...prev,
			[field]: value
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSearch(searchData);
  };

  return (
		<div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
			<div className="flex justify-center mb-8">
				<div className="bg-gray-100 rounded-xl p-1 flex">
					<button 
						onClick={() => handleInputChange('rentalType', 'daily')}
						className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
							searchData.rentalType === 'daily'
								? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
								: 'text-gray-600 hover:text-gray-800'
						}`}
					>
						<Calendar className="inline-block w-5 h-5 mr-2" />
						Thuê theo ngày
					</button>
					<button 
						onClick={() => handleInputChange('rentalType', 'monthly')}
						className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
							searchData.rentalType === 'monthly'
								? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
								: 'text-gray-600 hover:text-gray-800'
						}`}
					>
						<CalendarDays className="inline-block w-5 h-5 mr-2" />
						Thuê theo tháng
					</button>
					<button 
						onClick={() => handleInputChange('rentalType', 'yearly')}
						className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
							searchData.rentalType === 'yearly'
								? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
								: 'text-gray-600 hover:text-gray-800'
						}`}
					>
						<Car className="inline-block w-5 h-5 mr-2" />
						Thuê theo năm
					</button>
				</div>
        </div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							<MapPin className="inline-block w-4 h-4 mr-1" />
							Điểm thuê xe
						</label>
						<select 
							value={searchData.stationId}
							onChange={(e) => handleInputChange('stationId', parseInt(e.target.value))}
							className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
							required
							disabled={loading}
						>
							<option value={0}>{loading ? 'Đang tải...' : 'Chọn điểm thuê xe'}</option>
							{stations.map((station) => (
								<option key={station.id} value={station.id}>
									{station.city} - {station.address}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							<Calendar className="inline-block w-4 h-4 mr-1" />
							Ngày nhận xe
						</label>
						<input
							type="date"
							value={searchData.pickupDate}
							onChange={(e) => handleInputChange('pickupDate', e.target.value)}
							className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							<CalendarDays className="inline-block w-4 h-4 mr-1" />
							Ngày trả xe
						</label>
						<input
							type="date"
							value={searchData.returnDate}
							onChange={(e) => handleInputChange('returnDate', e.target.value)}
							className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
							required
						/>
					</div>
				</div>
				<button 
					type="submit"
					className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
				>
					Tìm xe có sẵn
				</button>
			</form>
		</div>
  );
};

export default SearchForm;