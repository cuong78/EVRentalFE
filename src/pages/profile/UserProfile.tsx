<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../service/authService';
import { walletService } from '../../service/walletService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import { bookingService, type Booking } from '../../service/bookingService';
import { paymentService } from '../../service/paymentService';
import { formatNumberVN } from '../../utils/format';

type Profile = {
    userId: number;
    username: string;
    email: string;
    phone?: string;
    phoneNumber?: string;
    createdAt?: string;
    updatedAt?: string;
    roles?: string[] | { roleName: string }[];
    permissions?: string[] | { permissionName: string }[];
    walletBalance?: number;
    totalDocuments?: number;
    validDocuments?: number;
    totalBookings?: number;
};

const UserProfile: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const tabParam = useMemo(() => new URLSearchParams(location.search).get('tab') || 'profile', [location.search]);
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>(tabParam === 'orders' ? 'orders' : 'profile');
    const [orders, setOrders] = useState<Booking[] | null>(null);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState<string | null>(null);
    const [topupAmount, setTopupAmount] = useState<number>(100000);
    const [topupLoading, setTopupLoading] = useState(false);
    const [topupOpen, setTopupOpen] = useState(false);
    const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'vnpay' | 'wallet'>('vnpay');

    useEffect(() => {
        setActiveTab(tabParam === 'orders' ? 'orders' : 'profile');
    }, [tabParam]);

    // load orders when tab active
    useEffect(() => {
        const loadOrders = async () => {
            if (activeTab !== 'orders') return;
            if (!profile?.userId) return;
            setOrdersLoading(true);
            setOrdersError(null);
            try {
                const list = await bookingService.getByUser(profile.userId);
                // sort descending by createdAt if exists
                setOrders((list || []).slice().sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
            } catch (e: any) {
                setOrdersError(e?.message || 'Không thể tải đơn hàng');
                setOrders([]);
            } finally {
                setOrdersLoading(false);
            }
        };
        loadOrders();
    }, [activeTab, profile]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await authService.getMyInfo();
                setProfile(data);
            } catch (e: any) {
                setError(e?.message || 'Không thể tải hồ sơ');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);


    if (loading) {
        return (
            <div className="container mx-auto px-6 py-12 text-center text-gray-600">Đang tải hồ sơ...</div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <h2 className="text-2xl font-bold mb-3">Lỗi tải hồ sơ</h2>
                <p className="text-gray-600">{error}</p>
            </div>
        );
    }

    if (!profile) return null;

    const phone = profile.phoneNumber || profile.phone || '';

    const handlePayOrder = async () => {
        if (!payingBookingId) return;
        try {
            setTopupLoading(true);
            if (selectedPaymentMethod === 'wallet') {
                const result = await paymentService.payWithWallet(payingBookingId);
                console.log('Wallet payment result:', result);
                
                // Check if wallet payment failed (API returns 200 with error statusCode in body)
                if (result.statusCode === 400) {
                    const errorMsg = result.message || 'Số dư ví không đủ. Vui lòng nạp thêm tiền.';
                    showErrorToast(errorMsg);
                    setPaymentModalOpen(false);
                    setPayingBookingId(null);
                    setTopupLoading(false);
                    return;
                }
                
                // Check if wallet payment succeeded
                if (result.statusCode === 200 || result.message?.includes('success')) {
                    showSuccessToast('Thanh toán thành công!');
                    setPaymentModalOpen(false);
                    const bookingId = payingBookingId;
                    setPayingBookingId(null);
                    setTopupLoading(false);
                    
                    // Fetch updated booking info and create invoice data
                    try {
                        const updatedBooking = await bookingService.getById(bookingId);
                        
                        // Get rental search data from sessionStorage for pricing details
                        const lastSearch = sessionStorage.getItem('lastRentalSearch');
                        let searchData = null;
                        if (lastSearch) {
                            try { searchData = JSON.parse(lastSearch); } catch {}
                        }
                        
                        const invoiceData = {
                            renterName: profile?.username || 'N/A',
                            phone: profile?.phoneNumber || profile?.phone || 'N/A',
                            email: profile?.email || 'N/A',
                            pickup: searchData?.stationName || 'Điểm thuê',
                            startDate: updatedBooking.startDate,
                            endDate: updatedBooking.endDate,
                            paymentMethod: 'wallet',
                            vehicle: {
                                id: updatedBooking.typeId,
                                name: `Loại xe #${updatedBooking.typeId}`,
                                image: '🚗',
                                location: `Điểm thuê #${updatedBooking.stationId}`,
                            },
                            pricing: {
                                dailyPrice: updatedBooking.totalPayment && updatedBooking.rentalDays 
                                    ? Math.floor(updatedBooking.totalPayment / (updatedBooking.rentalDays || 1))
                                    : 0,
                                days: updatedBooking.rentalDays || 1,
                                deposit: 0,
                                total: updatedBooking.totalPayment || 0,
                            },
                            booking: updatedBooking,
                            createdAt: new Date().toISOString(),
                        };
                        navigate('/hoa-don', { state: { invoice: invoiceData } });
                    } catch (err) {
                        console.error('Failed to create invoice data', err);
                        // Fallback: navigate to booking detail if invoice creation fails
                        navigate(`/booking/${bookingId}`);
                    }
                    return;
                }
            } else if (selectedPaymentMethod === 'vnpay') {
                const payUrl = await paymentService.payWithVNPay(payingBookingId);
                if (payUrl) {
                    window.location.href = payUrl;
                    return;
                }
            }
        } catch (err: any) {
            console.error('Payment failed', err);
            console.log('Error response:', err?.response);
            console.log('Error response data:', err?.response?.data);
            
            // Extract error message from API response
            const errorMsg = err?.response?.data?.message || err?.message || '';
            const responseStatus = err?.response?.status || err?.response?.data?.statusCode;
            
            setTopupLoading(false);
            
            // If wallet payment fails with 400 (insufficient balance), show API error
            if (selectedPaymentMethod === 'wallet' && responseStatus === 400) {
                showErrorToast(errorMsg || 'Số dư ví không đủ. Vui lòng nạp thêm tiền.');
                setPaymentModalOpen(false);
                setPayingBookingId(null);
            } else {
                showErrorToast(errorMsg || 'Thanh toán thất bại');
            }
        } finally {
            setTopupLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Hồ sơ của tôi</h1>
                <p className="text-gray-600">Quản lý thông tin tài khoản, ví và đơn hàng</p>
            </div>

            {/* Tabs */}
            <div className="mb-8 flex gap-2 border-b">
                <button
                    className={`px-4 py-2 rounded-t-lg ${activeTab === 'profile' ? 'bg-white border border-b-0 shadow text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
                    onClick={() => navigate('/ho-so?tab=profile')}
                >
                    Thông tin cá nhân
                </button>
                <button
                    className={`px-4 py-2 rounded-t-lg ${activeTab === 'orders' ? 'bg-white border border-b-0 shadow text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
                    onClick={() => navigate('/ho-so?tab=orders')}
                >
                    Đơn hàng của tôi
                </button>
            </div>

            {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl shadow p-6">
                        <h3 className="text-xl font-semibold mb-4">Thông tin cá nhân</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                            <div><span className="text-gray-500">Tên đăng nhập</span><div className="font-medium">{profile.username}</div></div>
                            <div><span className="text-gray-500">Email</span><div className="font-medium">{profile.email}</div></div>
                            <div><span className="text-gray-500">Số điện thoại</span><div className="font-medium">{phone}</div></div>
                            <div><span className="text-gray-500">Mã người dùng</span><div className="font-medium">#{profile.userId}</div></div>
                            {profile.createdAt && <div><span className="text-gray-500">Tạo lúc</span><div className="font-medium">{new Date(profile.createdAt).toLocaleString()}</div></div>}
                            {profile.updatedAt && <div><span className="text-gray-500">Cập nhật</span><div className="font-medium">{new Date(profile.updatedAt).toLocaleString()}</div></div>}
                        </div>
                    </div>
                </div>

                <aside className="space-y-8">
                    <div className="bg-white rounded-2xl shadow p-6">
                        <h3 className="text-xl font-semibold mb-2">Số dư ví</h3>
                        <div className="text-3xl font-extrabold text-green-600">{formatNumberVN(profile.walletBalance || 0)}đ</div>
                        <p className="text-gray-500 text-sm mt-1">Nạp ví qua VNPay</p>
                        <button onClick={() => setTopupOpen(true)} className="mt-4 w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-2.5 rounded-xl">Nạp vào ví</button>
                    </div>

                    <div className="bg-white rounded-2xl shadow p-6">
                        <h3 className="text-xl font-semibold mb-4">Thống kê</h3>
                        <div className="space-y-2 text-gray-700">
                            <div className="flex justify-between"><span>Tổng tài liệu</span><span className="font-medium">{profile.totalDocuments ?? 0}</span></div>
                            <div className="flex justify-between"><span>Tài liệu hợp lệ</span><span className="font-medium">{profile.validDocuments ?? 0}</span></div>
                            <div className="flex justify-between"><span>Tổng lượt đặt</span><span className="font-medium">{profile.totalBookings ?? 0}</span></div>
                        </div>
                    </div>
                </aside>
            </div>
            )}

            {activeTab === 'orders' && (
                <div className="bg-white rounded-2xl shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Đơn hàng của tôi</h3>
                        <button onClick={() => navigate('/thue-xe')} className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg">Đặt thêm</button>
                    </div>
                    {ordersLoading && <div className="text-gray-600">Đang tải...</div>}
                    {ordersError && <div className="text-red-600">{ordersError}</div>}
                    {!ordersLoading && !ordersError && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b">
                                        <th className="py-2 pr-4">Mã đơn hàng</th>
                                        <th className="py-2 pr-4">Thời gian</th>
                                        <th className="py-2 pr-4">Tổng tiền</th>
                                        <th className="py-2 pr-4">Trạng thái</th>
                                        <th className="py-2 pr-4">Thanh toán</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(orders || []).map((o) => (
                                        <tr key={o.id} className="border-b last:border-0">
                                            <td className="py-2 pr-4">
                                                <button onClick={() => navigate(`/booking/${o.id}`)} className="font-mono text-blue-600 hover:text-blue-800 hover:underline">{o.id}</button>
                                            </td>
                                            <td className="py-2 pr-4 whitespace-nowrap">{o.startDate} → {o.endDate}</td>
                                            <td className="py-2 pr-4 font-medium">{formatNumberVN(o.totalPayment || 0)}đ</td>
                                            <td className="py-2 pr-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${o.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : o.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{o.status}</span>
                                            </td>
                                            <td className="py-2 pr-4">
                                                {o.status === 'PENDING' && (
                                                    <button onClick={() => { setPayingBookingId(o.id); setPaymentModalOpen(true); }} className="px-3 py-1 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg text-xs hover:shadow-md transition">Thanh toán</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {orders && orders.length === 0 && (
                                        <tr><td className="py-3 text-gray-600" colSpan={5}>Chưa có đơn hàng</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {topupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Nạp vào ví</h3>
                            <button onClick={() => !topupLoading && setTopupOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Số tiền (VND)</label>
                                <input type="number" min={10000} step={10000} value={topupAmount} onChange={(e) => setTopupAmount(Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Phương thức thanh toán</label>
                                <div className="flex items-center gap-3 p-3 border-2 border-blue-500 bg-blue-50 rounded-xl">
                                    <input type="radio" checked readOnly className="w-4 h-4 text-blue-600" />
                                    <img src="https://tse3.mm.bing.net/th/id/OIP.kklIaX3TV97u5KnjU_Kr4wHaHa?rs=1&pid=ImgDetMain" alt="VNPay" className="w-10 h-10 object-contain" />
                                    <div>
                                        <div className="font-semibold text-gray-800">VNPay</div>
                                        <div className="text-xs text-gray-500">Cổng thanh toán</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => !topupLoading && setTopupOpen(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700">Hủy</button>
                            <button disabled={topupLoading || !topupAmount} onClick={async () => {
                                try {
                                    setTopupLoading(true);
                                    const billId = await walletService.createTopup(topupAmount);
                                    const url = await walletService.getTopupVnpayUrl(billId);
                                    window.location.href = url;
                                } catch (e: any) {
                                    showErrorToast(e?.response?.data?.message || e?.message || 'Tạo nạp ví thất bại');
                                } finally {
                                    setTopupLoading(false);
                                }
                            }} className={`px-4 py-2 rounded-lg text-white bg-gradient-to-r from-green-500 to-blue-600 ${topupLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>{topupLoading ? 'Đang chuyển...' : 'Nạp tiền'}</button>
                        </div>
                    </div>
                </div>
            )}

            {paymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Thanh toán đơn hàng</h3>
                            <button onClick={() => !topupLoading && setPaymentModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Mã đơn hàng</label>
                                <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 font-mono text-sm">{payingBookingId}</div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Phương thức thanh toán</label>
                                <div className="space-y-3">
                                    <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="paymentMethod" checked={selectedPaymentMethod === 'vnpay'} onChange={() => setSelectedPaymentMethod('vnpay')} className="w-4 h-4 text-blue-600" />
                                        <img src="https://tse3.mm.bing.net/th/id/OIP.kklIaX3TV97u5KnjU_Kr4wHaHa?rs=1&pid=ImgDetMain" alt="VNPay" className="w-10 h-10 object-contain" />
                                        <div>
                                            <div className="font-semibold text-gray-800">VNPay</div>
                                            <div className="text-xs text-gray-500">Cổng thanh toán</div>
                                        </div>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === 'wallet' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="paymentMethod" checked={selectedPaymentMethod === 'wallet'} onChange={() => setSelectedPaymentMethod('wallet')} className="w-4 h-4 text-green-600" />
                                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">Ví EVWallet</div>
                                            <div className="text-xs text-gray-500">Thanh toán nhanh</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => !topupLoading && setPaymentModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700">Hủy</button>
                            <button disabled={topupLoading} onClick={handlePayOrder} className={`px-4 py-2 rounded-lg text-white bg-gradient-to-r from-green-500 to-blue-600 ${topupLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>{topupLoading ? 'Đang xử lý...' : 'Thanh toán'}</button>
                        </div>
                    </div>
                </div>
            )}
=======
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
>>>>>>> e20d11b0eca0826dcfba530ffe0c81341434fe9e
        </div>
    );
};

export default UserProfile;
<<<<<<< HEAD


=======
>>>>>>> e20d11b0eca0826dcfba530ffe0c81341434fe9e
