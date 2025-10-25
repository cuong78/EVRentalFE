import React, { useState, useEffect } from 'react';
import HeroSection from '../../components/ui/home/HeroSection';
import FeaturedStations from '../../components/ui/home/FeaturedStations';
import WhyChooseUs from '../../components/ui/home/WhyChooseUs';
import CTASection from '../../components/ui/home/CTASection';
import { stationService } from '../../service/stationService';
import LoginPopup from '../../components/auth/login/LoginPopup';
import LoginForm from '../../components/auth/login/LoginForm';
import RegisterPopup from '../../components/auth/register/RegisterPopup';
import { RegisterForm } from '../../components/auth/register/RegisterForm';

const HomeContent: React.FC = () => {
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isRegisterOpen, setIsRegisterOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<'rent' | 'station'>('rent');
	const [stations, setStations] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	// Fetch stations from API
	useEffect(() => {
		const fetchStations = async () => {
			try {
				const response = await stationService.getAllStations();
				console.log('📍 Stations data:', response);
				
				// Map API data to component format
				const mappedStations = response.data?.map((station: any) => ({
					id: station.id,
					name: `Điểm Thuê ${station.city}`,
					address: station.address,
					available: station.vehicles?.filter((v: any) => v.status === 'AVAILABLE').length || 0,
					total: station.vehicles?.length || 0,
					distance: 'N/A' // Distance calculation not available from API
				})) || [];
				
				setStations(mappedStations);
			} catch (error) {
				console.error('Failed to fetch stations:', error);
				// Fallback to mock data on error
				setStations([
					{ id: 1, name: 'Điểm Thuê Q1 - Nguyễn Huệ', address: 'Đường Nguyễn Huệ, Quận 1, TP.HCM', available: 8, total: 12, distance: '0.5 km' },
					{ id: 2, name: 'Điểm Thuê Q3 - Võ Văn Tần', address: 'Đường Võ Văn Tần, Quận 3, TP.HCM', available: 5, total: 10, distance: '1.2 km' }
				]);
			}
		};

		fetchStations();
		setLoading(false);
	}, []);

	// Show loading state
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
					<p className="text-gray-600">Đang tải dữ liệu...</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<HeroSection activeTab={activeTab} onChangeTab={setActiveTab} stations={stations} />
			<FeaturedStations stations={stations} />
			<WhyChooseUs />
			<CTASection onRegisterClick={() => setIsRegisterOpen(true)} />

			{/* Popup đăng nhập */}
			<LoginPopup open={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
				<LoginForm 
					onSuccess={() => setIsLoginOpen(false)} 
					onSwitchToRegister={() => { 
						setIsLoginOpen(false); 
						setIsRegisterOpen(true); 
					}} 
					onSwitchToForgotPassword={() => {}} 
				/>
			</LoginPopup>
			
			{/* Popup đăng ký */}
			<RegisterPopup open={isRegisterOpen} onClose={() => setIsRegisterOpen(false)}>
				<RegisterForm 
					onClose={() => setIsRegisterOpen(false)} 
					onSwitchToLogin={() => { 
						setIsRegisterOpen(false); 
						setIsLoginOpen(true); 
					}} 
				/>
			</RegisterPopup>
		</>
	);
};

export default HomeContent;
