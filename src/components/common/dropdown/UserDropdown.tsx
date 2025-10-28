import React, { useState, useRef, useEffect } from 'react';
import { FileText, User, LogOut } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import AvatarLogo from '../avatar/AvatarLogo';
import { useNavigate } from 'react-router-dom';

interface UserDropdownProps {
    user: {
        username: string;
        fullName: string;
        roles: Array<{ roleName: string }>;
    };
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { logout, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    const handleMyOrders = () => {
        navigate('/ho-so?tab=orders');
        setIsOpen(false);
    };

    const handleAccount = () => {
        navigate('/ho-so');
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
                <AvatarLogo 
                    name={user.fullName || user.username} 
                    variant="circular" 
                    size={40}
                />
                <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-800">
                        {user.fullName || user.username}
                    </p>
                    <p className="text-xs text-gray-500">
                        {user.roles && user.roles.length > 0 ? user.roles[0].roleName : 'User'}
                    </p>
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* Đơn hàng của tôi */}
                    <button
                        onClick={handleMyOrders}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                        <FileText className="h-5 w-5" />
                        <span className="text-sm font-medium">Đơn hàng của tôi</span>
                    </button>

                    {/* Tài khoản */}
                    <button
                        onClick={handleAccount}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                        <User className="h-5 w-5" />
                        <span className="text-sm font-medium">Tài khoản</span>
                    </button>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Đăng xuất */}
                    <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 disabled:opacity-50"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="text-sm font-medium">
                            {isLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
