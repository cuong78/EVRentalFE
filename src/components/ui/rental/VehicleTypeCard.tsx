import React from 'react';
import { Battery, Users, Shield } from 'lucide-react';
import { formatNumberVN } from '../../../utils/format';

interface VehicleTypeCardProps {
	id: number;
	name: string;
	availableCount: number;
	rentalRate: number;
	depositAmount: number;
	image: string;
	features?: string[];
	onSelect?: (typeName: string) => void;
}

const VehicleTypeCard: React.FC<VehicleTypeCardProps> = ({ id, name, availableCount, rentalRate, depositAmount, image, features = [], onSelect }) => {
	return (
    	<div
			role="button"
			tabIndex={0}
			onClick={() => onSelect?.(name)}
			onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect?.(name); }}
			className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 cursor-pointer"
		>
			<div className="relative h-40 bg-gradient-to-br from-green-50 to-blue-50 rounded-t-2xl flex items-center justify-center overflow-hidden">
				<div className="text-7xl md:text-8xl mb-2">{image}</div>
				<div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
					{availableCount} có sẵn
				</div>
			</div>

			<div className="p-6">
				<div className="flex justify-between items-start mb-3">
					<div>
						<h3 className="text-xl font-bold text-gray-800 mb-1">{name}</h3>
						<p className="text-gray-600 text-sm">Loại xe</p>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold text-green-600">{formatNumberVN(rentalRate.toString())}</div>
						<div className="text-sm text-gray-500">/ngày</div>
					</div>
				</div>

				<div className="space-y-2 mb-4">
					<div className="flex items-center text-sm text-gray-600">
						<Battery className="w-4 h-4 mr-2 text-green-500" />
						<span>Pin tốt, sạc nhanh</span>
					</div>
					<div className="flex items-center text-sm text-gray-600">
						<Users className="w-4 h-4 mr-2 text-blue-500" />
						<span>{availableCount} xe khả dụng</span>
					</div>
					<div className="flex items-center text-sm text-gray-600">
						<Shield className="w-4 h-4 mr-2 text-purple-500" />
						<span>Đặt cọc {formatNumberVN(depositAmount.toString())}</span>
					</div>
				</div>

				{features.length > 0 && (
					<div className="mb-4">
						<div className="flex flex-wrap gap-2">
							{features.map((feature, index) => (
								<span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
									{feature}
								</span>
							))}
						</div>
					</div>
				)}

				<button
					onClick={(e) => { e.stopPropagation(); onSelect?.(name); }}
					className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 transform hover:scale-105"
				>
					Thuê xe
				</button>
			</div>
		</div>
	);
};

export default VehicleTypeCard;
