import React from 'react';
import { Clock, CreditCard, Shield, Users } from 'lucide-react';

const WhyChooseUs: React.FC = () => {
	return (
		<section className="py-20 bg-white">
			<div className="container mx-auto px-6">
				<div className="text-center mb-16">
					<h3 className="text-4xl font-bold text-gray-800 mb-4">Tại sao chọn EV Station?</h3>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Trải nghiệm thuê xe điện hoàn toàn mới với công nghệ tiên tiến và dịch vụ tận tâm
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					<div className="text-center group">
						<div className="bg-gradient-to-br from-green-500 to-blue-600 p-6 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
							<Clock className="w-12 h-12 text-white" />
						</div>
						<h4 className="text-xl font-semibold text-gray-800 mb-3">Nhanh chóng</h4>
						<p className="text-gray-600">Đặt xe trong 30 giây, nhận xe ngay tại điểm thuê</p>
					</div>

					<div className="text-center group">
						<div className="bg-gradient-to-br from-green-500 to-blue-600 p-6 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
							<Shield className="w-12 h-12 text-white" />
						</div>
						<h4 className="text-xl font-semibold text-gray-800 mb-3">An toàn</h4>
						<p className="text-gray-600">Xe được kiểm tra kỹ thuật định kỳ, bảo hiểm đầy đủ</p>
					</div>

					<div className="text-center group">
						<div className="bg-gradient-to-br from-green-500 to-blue-600 p-6 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
							<CreditCard className="w-12 h-12 text-white" />
						</div>
						<h4 className="text-xl font-semibold text-gray-800 mb-3">Linh hoạt</h4>
						<p className="text-gray-600">Thanh toán đa dạng, thuê theo giờ hoặc theo ngày</p>
					</div>

					<div className="text-center group">
						<div className="bg-gradient-to-br from-green-500 to-blue-600 p-6 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
							<Users className="w-12 h-12 text-white" />
						</div>
						<h4 className="text-xl font-semibold text-gray-800 mb-3">Hỗ trợ 24/7</h4>
						<p className="text-gray-600">Nhân viên chuyên nghiệp hỗ trợ bạn mọi lúc mọi nơi</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default WhyChooseUs;


