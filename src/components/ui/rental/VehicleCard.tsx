import React from 'react';
import { Battery, MapPin, Clock, Users, Zap } from 'lucide-react';

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

interface VehicleCardProps {
	vehicle: Vehicle;
	onSelect?: (vehicle: Vehicle) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onSelect }) => {
	return (
		<div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
			{/* Vehicle Image */}
			<div className="relative h-48 bg-gradient-to-br from-green-50 to-blue-50 rounded-t-2xl flex items-center justify-center">
				<div className="text-6xl mb-4">{vehicle.image}</div>
				{vehicle.available ? (
					<div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
						Có sẵn
					</div>
				) : (
					<div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
						Đã thuê
					</div>
				)}
			</div>

			{/* Vehicle Info */}
			<div className="p-6">
				<div className="flex justify-between items-start mb-3">
					<div>
						<h3 className="text-xl font-bold text-gray-800 mb-1">{vehicle.name}</h3>
						<p className="text-gray-600 text-sm">{vehicle.type}</p>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold text-green-600">{vehicle.price}</div>
						<div className="text-sm text-gray-500">/ngày</div>
					</div>
				</div>

				{/* Rating */}
				<div className="flex items-center mb-4">
					<div className="flex text-yellow-400">
						{[...Array(5)].map((_, i) => (
							<svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
								<path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
							</svg>
						))}
					</div>
					<span className="ml-2 text-sm text-gray-600">({vehicle.reviews} đánh giá)</span>
				</div>

				{/* Features */}
				<div className="space-y-2 mb-4">
					<div className="flex items-center text-sm text-gray-600">
						<Battery className="w-4 h-4 mr-2 text-green-500" />
						<span>{vehicle.battery}% pin</span>
					</div>
					<div className="flex items-center text-sm text-gray-600">
						<MapPin className="w-4 h-4 mr-2 text-blue-500" />
						<span>{vehicle.location}</span>
					</div>
					<div className="flex items-center text-sm text-gray-600">
						<Clock className="w-4 h-4 mr-2 text-purple-500" />
						<span>Sạc nhanh 2h</span>
					</div>
				</div>

				{/* Features List */}
				<div className="mb-4">
					<div className="flex flex-wrap gap-2">
						{vehicle.features.map((feature, index) => (
							<span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
								{feature}
							</span>
						))}
					</div>
				</div>

				{/* Action Button */}
				<button
					onClick={() => onSelect?.(vehicle)}
					disabled={!vehicle.available}
					className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
						vehicle.available
							? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 transform hover:scale-105'
							: 'bg-gray-300 text-gray-500 cursor-not-allowed'
					}`}
				>
					{vehicle.available ? 'Thuê ngay' : 'Không có sẵn'}
				</button>
			</div>
		</div>
	);
};

export default VehicleCard;