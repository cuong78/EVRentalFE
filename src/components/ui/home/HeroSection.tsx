import React from 'react';
import { Car, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Station = { id: number; name: string; address: string; available: number; total: number; distance: string };

interface HeroSectionProps {
	activeTab: 'rent' | 'station';
	onChangeTab: (tab: 'rent' | 'station') => void;
	stations: Station[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ activeTab, onChangeTab, stations }) => {
	const navigate = useNavigate();

	const handleRentNow = () => {
		navigate('thue-xe');
	};

	return (
		<section className="relative py-20 overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10"></div>
			<div className="container mx-auto px-6 text-center relative z-10">
				<h2 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
					Thuê xe điện <span className="text-green-600">thông minh</span>
					<br />tại điểm thuê gần nhất
				</h2>
				<p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
					Hệ thống thuê xe điện hiện đại với mạng lưới điểm thuê rộng khắp TP.HCM.
					Đặt xe nhanh chóng, nhận xe tại điểm, trả xe linh hoạt.
				</p>

				{/* <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
					<div className="flex justify-center mb-8">
						<div className="bg-gray-100 rounded-xl p-1 flex">
							<button
								onClick={() => onChangeTab('rent')}
								className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
									activeTab === 'rent'
										? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
										: 'text-gray-600 hover:text-gray-800'
								}`}
							>
								<Car className="inline-block w-5 h-5 mr-2" />
								Thuê xe
							</button>
							<button
								onClick={() => onChangeTab('station')}
								className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
									activeTab === 'station'
										? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
										: 'text-gray-600 hover:text-gray-800'
								}`}
							>
								<MapPin className="inline-block w-5 h-5 mr-2" />
								Tìm điểm thuê
							</button>
						</div>
					</div>

					{activeTab === 'rent' && (
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Điểm nhận xe</label>
									<select className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500">
										<option>Chọn điểm thuê</option>
										{stations.map((station) => (
											<option key={station.id} value={station.id}>{station.name}</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
									<label className="block text-sm font-medium text-gray-700 mb-2">Ngày nhận xe</label>
									<input
										type="date"
										className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
										defaultValue={new Date().toISOString().split('T')[0]}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
									<input
										type="date"
										className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
										defaultValue={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
									/>
									<label className="block text-sm font-medium text-gray-700 mb-2">Ngày trả xe</label>
									<select className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500">
										<option>4 giờ</option>
										<option>8 giờ</option>
										<option>1 ngày</option>
										<option>3 ngày</option>
										<option>1 tuần</option>
									</select>
								</div>
							</div>
							<button className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
								Tìm xe có sẵn
							</button>
						</div>
					)}

					{activeTab === 'station' && (
						<div className="text-center">
							<div className="bg-green-50 border-2 border-dashed border-green-200 rounded-xl p-12">
								<MapPin className="w-16 h-16 text-green-500 mx-auto mb-4" />
								<h3 className="text-xl font-semibold text-gray-800 mb-2">Bản đồ điểm thuê</h3>
								<p className="text-gray-600 mb-6">Tìm điểm thuê xe điện gần bạn nhất trên bản đồ tương tác</p>
								<button className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-8 rounded-xl font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300">
									Xem bản đồ
								</button>
							</div>
						</div>
					)}
				</div> */}
				<button 
					onClick={handleRentNow}
					className="w-[350px] bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
				>
					Thuê xe ngay
				</button>
			</div>
		</section>
	);
};

export default HeroSection;


