import React from 'react';
import { Battery, Star } from 'lucide-react';

type Vehicle = { id: number; type: string; battery: number; price: string; image: string; features: string[] };

interface VehicleTypesProps {
	vehicles: Vehicle[];
}

const VehicleTypes: React.FC<VehicleTypesProps> = ({ vehicles }) => {
	return (
		<section className="py-20 bg-gray-50">
			<div className="container mx-auto px-6">
				<div className="text-center mb-16">
					<h3 className="text-4xl font-bold text-gray-800 mb-4">Loại xe điện</h3>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Đa dạng các  phù hợp với mọi nhu cầu di chuyển
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{vehicles.map((vehicle) => (
						<div key={vehicle.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
							<div className="bg-gradient-to-br from-green-500 to-blue-600 p-8 text-center">
								<div className="text-6xl mb-4">{vehicle.image}</div>
								<h4 className="text-xl font-bold text-white mb-2">{vehicle.type}</h4>
							</div>

							<div className="p-6">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center">
										<Battery className="w-5 h-5 text-green-500 mr-2" />
										<span className="font-medium text-gray-700">Pin: {vehicle.battery}%</span>
									</div>
									<div className="flex items-center">
										<Star className="w-4 h-4 text-yellow-400 fill-current" />
										<span className="text-sm text-gray-600 ml-1">4.8</span>
									</div>
								</div>

								<div className="space-y-2 mb-6">
									{vehicle.features.map((feature, index) => (
										<div key={index} className="flex items-center text-sm text-gray-600">
											<div className="w-1 h-1 bg-green-500 rounded-full mr-3"></div>
											{feature}
										</div>
									))}
								</div>

								<div className="border-t border-gray-100 pt-4">
									<div className="flex items-center justify-between">
										<span className="text-2xl font-bold text-green-600">{vehicle.price}</span>
										<button className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 px-6 rounded-xl font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300">
											Đặt xe
										</button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default VehicleTypes;


