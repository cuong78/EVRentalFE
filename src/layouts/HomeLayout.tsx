import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/ui/home/Header';
import Footer from '../components/ui/home/Footer';
import LoginPopup from '../components/auth/login/LoginPopup';
import LoginForm from '../components/auth/login/LoginForm';
import RegisterPopup from '../components/auth/register/RegisterPopup';
import { RegisterForm } from '../components/auth/register/RegisterForm';

const HomeLayout: React.FC = () => {
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isRegisterOpen, setIsRegisterOpen] = useState(false);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
			<Header 
				onLoginClick={() => setIsLoginOpen(true)} 
				onRegisterClick={() => setIsRegisterOpen(true)} 
			/>
			
			{/* Nội dung trang sẽ được render ở đây */}
			<Outlet />
			
			<Footer />
			
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
		</div>
	);
};

export default HomeLayout;
