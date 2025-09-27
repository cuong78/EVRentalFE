import React from 'react';

const CTASection: React.FC = () => {
	return (
		<section className="py-20 bg-gradient-to-r from-green-500 to-blue-600">
			<div className="container mx-auto px-6 text-center">
				<h3 className="text-4xl font-bold text-white mb-6">
					Bắt đầu hành trình xanh của bạn
				</h3>
				<p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
					Đăng ký tài khoản ngay hôm nay và nhận ưu đãi 20% cho chuyến thuê đầu tiên
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<button className="bg-white text-green-600 py-4 px-8 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
						Đăng ký miễn phí
					</button>
					<button className="border-2 border-white text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105">
						Tìm hiểu thêm
					</button>
				</div>
			</div>
		</section>
	);
};

export default CTASection;


