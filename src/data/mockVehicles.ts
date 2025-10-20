export interface Vehicle {
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
}

export const mockVehicles: Vehicle[] = [
	{
		id: 1,
		name: 'VinFast Klara A2',
		type: 'Xe máy điện',
		battery: 85,
		price: '150,000',
		image: '🛵',
		features: ['50km tầm xa', 'Sạc nhanh', 'GPS'],
		location: 'Q1 - Nguyễn Huệ',
		available: true,
		rating: 4.8,
		reviews: 124
	},
	{
		id: 2,
		name: 'VinFast Theon S',
		type: 'Xe máy điện',
		battery: 92,
		price: '180,000',
		image: '🏍️',
		features: ['80km tầm xa', 'Chống nước IP67', 'App điều khiển'],
		location: 'Q3 - Võ Văn Tần',
		available: true,
		rating: 4.9,
		reviews: 89
	},
	{
		id: 3,
		name: 'VinFast Evo 200',
		type: 'Xe đạp điện',
		battery: 78,
		price: '120,000',
		image: '🛴',
		features: ['40km tầm xa', 'Gấp gọn', 'Nhẹ 18kg'],
		location: 'Q7 - Phú Mỹ Hưng',
		available: true,
		rating: 4.6,
		reviews: 67
	},
	{
		id: 4,
		name: 'Yadea G5',
		type: 'Xe máy điện',
		battery: 88,
		price: '160,000',
		image: '🛵',
		features: ['60km tầm xa', 'Khóa thông minh', 'Đèn LED'],
		location: 'Q2 - Thủ Thiêm',
		available: false,
		rating: 4.7,
		reviews: 156
	},
	{
		id: 5,
		name: 'Segway Ninebot E25',
		type: 'Xe đạp điện',
		battery: 95,
		price: '200,000',
		image: '🚲',
		features: ['100km tầm xa', '3 chế độ', 'Màn hình LCD'],
		location: 'Q10 - Lê Hồng Phong',
		available: true,
		rating: 4.9,
		reviews: 203
	},
	{
		id: 6,
		name: 'Xiaomi Mi Electric Scooter',
		type: 'Xe đạp điện',
		battery: 82,
		price: '140,000',
		image: '🛴',
		features: ['45km tầm xa', 'Gấp gọn', 'App kết nối'],
		location: 'Q1 - Nguyễn Huệ',
		available: true,
		rating: 4.5,
		reviews: 98
	},
	{
		id: 7,
		name: 'Honda PCX Electric',
		type: 'Xe máy điện',
		battery: 90,
		price: '220,000',
		image: '🏍️',
		features: ['120km tầm xa', 'Thiết kế cao cấp', 'Hệ thống ABS'],
		location: 'Q3 - Võ Văn Tần',
		available: true,
		rating: 4.8,
		reviews: 145
	},
	{
		id: 8,
		name: 'Gogoro Viva',
		type: 'Xe máy điện',
		battery: 75,
		price: '170,000',
		image: '🛵',
		features: ['55km tầm xa', 'Thiết kế nhỏ gọn', 'Pin thay thế'],
		location: 'Q7 - Phú Mỹ Hưng',
		available: false,
		rating: 4.4,
		reviews: 76
	}
];
