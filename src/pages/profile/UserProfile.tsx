import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Home, ArrowLeft, Camera } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface UserProfileData {
    id: number;
    email: string;
    fullName: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const { user, updateUserInfo } = useAuth();
    
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        dateOfBirth: ''
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadProfile();
        } else {
            navigate('/');
        }
    }, [user]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            // For now, use data from auth context
            // In real app, you'd fetch from API: /api/users/profile
            const profileData: UserProfileData = {
                id: user?.id || 0,
                email: user?.email || '',
                fullName: user?.fullName || '',
                phone: user?.phone || '',
                address: user?.address || '',
                dateOfBirth: user?.dateOfBirth || '',
                avatar: user?.avatar || '',
                createdAt: user?.createdAt || new Date().toISOString(),
                updatedAt: user?.updatedAt || new Date().toISOString()
            };
            
            setProfile(profileData);
            setFormData({
                fullName: profileData.fullName,
                phone: profileData.phone || '',
                address: profileData.address || '',
                dateOfBirth: profileData.dateOfBirth || ''
            });
        } catch (error) {
            console.error('Failed to load profile:', error);
            toast.error('Không thể tải thông tin profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            let avatarUrl = profile?.avatar;
            
            // Upload avatar if selected
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                
                try {
                    // In real app, call API to upload avatar
                    // const uploadResponse = await userService.uploadAvatar(formData);
                    // avatarUrl = uploadResponse.data.url;
                    
                    // For demo, use the preview URL
                    avatarUrl = avatarPreview || profile?.avatar;
                    toast.success('Cập nhật avatar thành công!');
                } catch (error) {
                    console.error('Failed to upload avatar:', error);
                    toast.error('Không thể tải lên avatar');
                }
            }
            
            // In real app, you'd call API to update profile
            // const response = await userService.updateProfile({...formData, avatar: avatarUrl});
            
            // For now, just update local state
            if (profile) {
                const updatedProfile = {
                    ...profile,
                    ...formData,
                    avatar: avatarUrl
                };
                setProfile(updatedProfile);
                
                // Update auth context if needed
                if (updateUserInfo) {
                    updateUserInfo(updatedProfile);
                }
            }
            
            // Reset avatar states
            setAvatarFile(null);
            setAvatarPreview(null);
            setEditing(false);
            toast.success('Cập nhật thông tin thành công!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Không thể cập nhật thông tin');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                fullName: profile.fullName,
                phone: profile.phone || '',
                address: profile.address || '',
                dateOfBirth: profile.dateOfBirth || ''
            });
        }
        setEditing(false);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Chưa cập nhật';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Vui lòng chọn file hình ảnh');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Kích thước file không được vượt quá 5MB');
                return;
            }
            
            setAvatarFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const getAvatarUrl = (avatar?: string) => {
        if (avatarPreview) return avatarPreview;
        if (avatar) return avatar;
        // Default avatar based on first letter of name
        const firstLetter = profile?.fullName?.charAt(0)?.toUpperCase() || 'U';
        return `https://ui-avatars.com/api/?name=${firstLetter}&background=3B82F6&color=fff&size=128`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy thông tin</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation Bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                            <Home className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-700 font-medium">Trang chủ</span>
                        </button>
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Đặt xe của tôi</span>
                        </button>
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Thông tin cá nhân</h1>
                    <p className="text-lg text-gray-600">Quản lý thông tin tài khoản của bạn</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-green-600 px-8 py-12 text-white relative">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <img
                                    src={getAvatarUrl(profile.avatar)}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                                />
                                <label className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-300 cursor-pointer">
                                    <Camera className="w-4 h-4" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            
                            {/* Basic Info */}
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl font-bold mb-2">{profile.fullName}</h2>
                                <p className="text-blue-100 mb-1 flex items-center justify-center md:justify-start gap-2">
                                    <Mail className="w-4 h-4" />
                                    {profile.email}
                                </p>
                                <p className="text-blue-100 text-sm">
                                    Thành viên từ {formatDate(profile.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="absolute top-6 right-6">
                            {!editing ? (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-300"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    <span className="font-medium">Chỉnh sửa</span>
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-all duration-300 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span className="font-medium">
                                            {saving ? 'Đang lưu...' : 'Lưu'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-all duration-300"
                                    >
                                        <X className="w-4 h-4" />
                                        <span className="font-medium">Hủy</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên
                                </label>
                                {editing ? (
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nhập họ và tên"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <User className="w-5 h-5 text-gray-500" />
                                        <span className="text-gray-800">{profile.fullName || 'Chưa cập nhật'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại
                                </label>
                                {editing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nhập số điện thoại"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Phone className="w-5 h-5 text-gray-500" />
                                        <span className="text-gray-800">{profile.phone || 'Chưa cập nhật'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Email (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-600">{profile.email}</span>
                                    <span className="text-xs text-gray-500 ml-auto">(Không thể thay đổi)</span>
                                </div>
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày sinh
                                </label>
                                {editing ? (
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Calendar className="w-5 h-5 text-gray-500" />
                                        <span className="text-gray-800">{formatDate(profile.dateOfBirth || '')}</span>
                                    </div>
                                )}
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa chỉ
                                </label>
                                {editing ? (
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nhập địa chỉ"
                                    />
                                ) : (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                                        <span className="text-gray-800">{profile.address || 'Chưa cập nhật'}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin tài khoản</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">ID tài khoản:</span>
                                    <span className="ml-2 font-medium text-gray-800">#{profile.id}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Ngày tạo:</span>
                                    <span className="ml-2 font-medium text-gray-800">{formatDate(profile.createdAt)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Cập nhật lần cuối:</span>
                                    <span className="ml-2 font-medium text-gray-800">{formatDate(profile.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
                    >
                        <div className="text-blue-600 mb-2">
                            <Calendar className="w-8 h-8 mx-auto" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Đặt xe của tôi</h3>
                        <p className="text-sm text-gray-600">Xem lịch sử đặt xe</p>
                    </button>
                    
                    <button
                        onClick={() => navigate('/booking')}
                        className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
                    >
                        <div className="text-green-600 mb-2">
                            <User className="w-8 h-8 mx-auto" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Đặt xe mới</h3>
                        <p className="text-sm text-gray-600">Tìm và đặt xe</p>
                    </button>
                    
                    <button
                        onClick={() => {/* TODO: Add support/help page */}}
                        className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
                    >
                        <div className="text-orange-600 mb-2">
                            <Phone className="w-8 h-8 mx-auto" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Hỗ trợ</h3>
                        <p className="text-sm text-gray-600">Liên hệ hỗ trợ</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
