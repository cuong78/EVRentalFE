import React from 'react';
import { Zap } from 'lucide-react';

const Footer: React.FC = () => {
	return (
		<footer className="bg-gray-900 text-white py-12">
			<div className="container mx-auto px-6">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					<div>
						<div className="flex items-center space-x-3 mb-6">
							<div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-lg">
								<Zap className="h-6 w-6 text-white" />
							</div>
							<div>
								<h3 className="text-xl font-bold">EV Station</h3>
								<p className="text-sm text-gray-400">Thuê xe điện thông minh</p>
							</div>
						</div>
						<p className="text-gray-400 text-sm leading-relaxed">
							Hệ thống thuê xe điện hàng đầu Việt Nam với mạng lưới điểm thuê rộng khắp và dịch vụ chuyên nghiệp.
						</p>
					</div>

					<div>
						<h4 className="text-lg font-semibold mb-4">Dịch vụ</h4>
						<ul className="space-y-2 text-sm">
							<li><a href="#" className="text-gray-400 hover:text-white transition-colors">Thuê xe điện</a></li>
							<li><a href="#" className="text-gray-400 hover:text-white transition-colors">Điểm thuê</a></li>
							<li><a href="#" className="text-gray-400 hover:text-white transition-colors">Bảo hiểm</a></li>
							<li><a href="#" className="text-gray-400 hover:text-white transition-colors">Hỗ trợ kỹ thuật</a></li>
						</ul>
					</div>

					<div>
						<h4 className="text-lg font-semibold mb-4">Hỗ trợ</h4>
						<ul className="space-y-2 text-sm">
							<li><a href="#" className="text-gray-400 hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
							<li><a href="#" className="text-gray-400 hover:text-white transition-colors">Liên hệ</a></li>
							<li><a href="#" className="text-gray-400 hover:text-white transition-colors">Chính sách</a></li>
							<li><a href="#" className="text-gray-400 hover:text-white transition-colors">Điều khoản</a></li>
						</ul>
					</div>

					<div>
						<h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
						<div className="space-y-2 text-sm text-gray-400">
							<p>📞 1900 1234</p>
							<p>✉️ support@evstation.com</p>
							<p>📍 TP. Hồ Chí Minh, Việt Nam</p>
						</div>
					</div>
				</div>

				<div className="border-t border-gray-800 mt-8 pt-8 text-center">
					<p className="text-gray-400 text-sm">
						© 2025 EV Station. Tất cả quyền được bảo lưu.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;


