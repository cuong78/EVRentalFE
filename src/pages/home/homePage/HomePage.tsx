import React, { useState } from 'react';
import Header from '../../../components/ui/home/Header';
import HeroSection from '../../../components/ui/home/HeroSection';
import FeaturedStations from '../../../components/ui/home/FeaturedStations';
import VehicleTypes from '../../../components/ui/home/VehicleTypes';
import WhyChooseUs from '../../../components/ui/home/WhyChooseUs';
import CTASection from '../../../components/ui/home/CTASection';
import Footer from '../../../components/ui/home/Footer';
import LoginPopup from '../../../components/auth/login/LoginPopup';
import LoginForm from '../../../components/auth/login/LoginForm';
import RegisterPopup from '../../../components/auth/register/RegisterPopup';
import { RegisterForm } from '../../../components/auth/register/RegisterForm';

const HomePage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<'rent' | 'station'>('rent');
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isRegisterOpen, setIsRegisterOpen] = useState(false);

	const stations = [
		{ id: 1, name: 'Điểm Thuê Q1 - Nguyễn Huệ', address: 'Đường Nguyễn Huệ, Quận 1, TP.HCM', available: 8, total: 12, distance: '0.5 km' },
		{ id: 2, name: 'Điểm Thuê Q3 - Võ Văn Tần', address: 'Đường Võ Văn Tần, Quận 3, TP.HCM', available: 5, total: 10, distance: '1.2 km' },
		{ id: 3, name: 'Điểm Thuê Q7 - Phú Mỹ Hưng', address: 'Khu đô thị Phú Mỹ Hưng, Quận 7, TP.HCM', available: 12, total: 15, distance: '3.8 km' }
	];

	const vehicles = [
		{ id: 1, type: 'VinFast Klara A2', battery: 85, price: '150,000đ/ngày', image: '🛵', features: ['50km tầm xa', 'Sạc nhanh', 'GPS'] },
		{ id: 2, type: 'VinFast Theon S', battery: 92, price: '180,000đ/ngày', image: '🏍️', features: ['80km tầm xa', 'Chống nước IP67', 'App điều khiển'] },
		{ id: 3, type: 'VinFast Evo 200', battery: 78, price: '120,000đ/ngày', image: '🛴', features: ['40km tầm xa', 'Gấp gọn', 'Nhẹ 18kg'] }
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
			<Header onLoginClick={() => setIsLoginOpen(true)} onRegisterClick={() => setIsRegisterOpen(true)} />
			<HeroSection activeTab={activeTab} onChangeTab={setActiveTab} stations={stations} />
			<FeaturedStations stations={stations} />
			<VehicleTypes vehicles={vehicles} />
			<WhyChooseUs />
			<CTASection />
			<Footer />
			<LoginPopup open={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
				<LoginForm onSuccess={() => setIsLoginOpen(false)} onSwitchToRegister={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }} onSwitchToForgotPassword={() => {}} />
			</LoginPopup>
			<RegisterPopup open={isRegisterOpen} onClose={() => setIsRegisterOpen(false)}>
				<RegisterForm onClose={() => setIsRegisterOpen(false)} onSwitchToLogin={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }} />
			</RegisterPopup>
		</div>
	);
};

export default HomePage;


