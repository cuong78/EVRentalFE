import React from 'react';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Station = { id: number; name: string; address: string; available: number; total: number; distance: string };

interface FeaturedStationsProps {
	stations: Station[];
}

const FeaturedStations: React.FC<FeaturedStationsProps> = ({ stations }) => {
	const navigate = useNavigate();
	return (
		<section id="featured-stations" className="py-20 bg-white">
			<div className="container mx-auto px-6">
				<div className="text-center mb-16">
					<h3 className="text-4xl font-bold text-gray-800 mb-4">Điểm thuê nổi bật</h3>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Mạng lưới điểm thuê rộng khắp với nhiều lựa chọn xe điện chất lượng cao
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{stations.map((station) => (
						<div key={station.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
							<div className="mb-4">
								<h4 className="text-xl font-semibold text-gray-800 mb-3">{station.name}</h4>
								<div className="flex items-start text-sm text-green-600">
									<MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
									<span className="flex-1">{station.address}</span>
								</div>
							</div>

							<div className="border-t border-gray-100 pt-4">
								<div className="flex items-center justify-between mb-4">
									<span className="text-sm font-medium text-gray-700">Xe có sẵn</span>
									<div className="flex items-center">
										<div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
										<span className="font-bold text-green-600">{station.available}/{station.total}</span>
									</div>
								</div>

								<div className="bg-gray-200 rounded-full h-2 mb-4">
									<div
										className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
										style={{ width: `${(station.available / station.total) * 100}%` }}
									></div>
								</div>

							<button 
								onClick={() => navigate('/thue-xe', { state: { selectedStationId: station.id } })}
								className="w-full border-2 border-green-500 text-green-600 py-2 px-4 rounded-xl font-medium hover:bg-green-500 hover:text-white transition-all duration-300"
							>
								Xem chi tiết
							</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default FeaturedStations;


