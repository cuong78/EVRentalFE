import React from 'react';
import { Car, Zap, Users, Package } from 'lucide-react';
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
				{image && (image.startsWith('http') || image.startsWith('/')) ? (
					<img 
						src={image} 
						alt={name} 
						className="h-32 w-auto max-w-full object-contain"
						onError={(e) => {
							// Fallback to emoji if image fails to load
							e.currentTarget.style.display = 'none';
							if (e.currentTarget.nextElementSibling) {
								(e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
							}
						}}
					/>
				) : null}
				<div 
					className="text-7xl md:text-8xl mb-2"
					style={{ display: (image && (image.startsWith('http') || image.startsWith('/'))) ? 'none' : 'block' }}
				>
					{image && !(image.startsWith('http') || image.startsWith('/')) ? image : '🛵'}
				</div>
				<div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
					{availableCount} có sẵn
				</div>
			</div>

			<div className="p-6">
				<div className="flex justify-between items-start mb-4">
					<div>
						<h3 className="text-xl font-bold text-gray-800 mb-1">{name}</h3>
						<p className="text-gray-600 text-sm">{features[0] || 'Loại xe'}</p>
					</div>
					<div className="text-right">
						<p className="text-xs text-gray-500 mb-1">Chỉ từ</p>
						<div className="text-2xl font-bold text-green-600">{formatNumberVN(rentalRate.toString())}</div>
						<div className="text-sm text-gray-500">/ngày</div>
					</div>
				</div>

				<div className="space-y-2 mb-4">
					{features[1] && (
						<div className="flex items-center text-sm text-gray-600">
							<Zap className="w-4 h-4 mr-2 text-green-500" />
							<span>{features[1]}</span>
						</div>
					)}
					{features[2] && (
						<div className="flex items-center text-sm text-gray-600">
							<Users className="w-4 h-4 mr-2 text-blue-500" />
							<span>{features[2]}</span>
						</div>
					)}
					{features[3] && (
						<div className="flex items-center text-sm text-gray-600">
							<Package className="w-4 h-4 mr-2 text-purple-500" />
							<span>{features[3]}</span>
						</div>
					)}
				</div>

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
