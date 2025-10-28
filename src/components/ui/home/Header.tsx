import React from 'react';
import { Zap } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import UserDropdown from '../../common/dropdown/UserDropdown';

interface HeaderProps {
	onLoginClick?: () => void;
	onRegisterClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onRegisterClick }) => {
	const { user } = useAuth();
	const navigate = useNavigate();

	const scrollToStations = () => {
		const stationsSection = document.querySelector('#featured-stations');
		if (stationsSection) {
			stationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	const goToHome = () => {
		navigate('/');
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<header className="bg-white shadow-lg border-b-4 border-green-500">
			<div className="container mx-auto px-6 py-4">
				<div className="flex items-center justify-between">
					<button 
						onClick={goToHome}
						className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
					>
						<div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-xl">
							<Zap className="h-8 w-8 text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-gray-800">EV Station</h1>
							<p className="text-sm text-gray-600">Thuê xe điện thông minh</p>
						</div>
					</button>

					<nav className="hidden md:flex items-center space-x-8">
						<button 
							onClick={goToHome}
							className="text-gray-700 hover:text-green-600 font-medium transition-colors"
						>
							Trang chủ
						</button>
						<button 
							onClick={scrollToStations}
							className="text-gray-700 hover:text-green-600 font-medium transition-colors"
						>
							Điểm thuê
						</button>
						<a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Hỗ trợ</a>
					</nav>

					<div className="flex items-center space-x-4">
						{/* Sử dụng if-else để kiểm tra trạng thái đăng nhập */}
						{user ? (
							// Nếu đã đăng nhập - hiển thị UserDropdown
							<UserDropdown user={user} />
						) : (
							// Nếu chưa đăng nhập - hiển thị nút đăng nhập/đăng ký
							<>
								<button onClick={onRegisterClick} className="border-2 border-green-500 text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-green-50 transition-all duration-300">
									Đăng ký
								</button>
								<button onClick={onLoginClick} className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
									Đăng nhập
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;


