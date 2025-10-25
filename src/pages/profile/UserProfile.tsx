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
        </div>
    );
};

export default UserProfile;


