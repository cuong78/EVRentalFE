import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingService, type Booking } from '../../service/bookingService';
import { stationService } from '../../service/stationService';
import { authService } from '../../service/authService';
import { apiClient } from '../../service/api';
import { API } from '../../constants';
import { formatNumberVN } from '../../utils/format';
import { showErrorToast } from '../../utils/show-toast';

interface UserInfo {
    userId?: number;
    fullName?: string;
    username?: string;
    phoneNumber?: string;
    phone?: string;
    email?: string;
}

interface StationInfo {
    id: number;
    name?: string;
    city?: string;
    address?: string;
}

interface VehicleTypeInfo {
    id: number;
    name?: string;
    depositAmount?: number;
    rentalRate?: number;
}

const BookingDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [stationInfo, setStationInfo] = useState<StationInfo | null>(null);
    const [vehicleTypeInfo, setVehicleTypeInfo] = useState<VehicleTypeInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!id) {
                setError('Mã đơn hàng không hợp lệ');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await bookingService.getById(id);
                console.log('Booking data:', data);
                setBooking(data);

                // Fetch current user info (only works if this booking belongs to current user)
                try {
                    const currentUser = await authService.getMyInfo();
                    // Only use if it's the same user
                    if (currentUser?.userId === data.userId) {
                        setUserInfo(currentUser);
                    }
                } catch (err) {
                    console.error('Failed to fetch user info', err);
                }

                // Fetch station info
                try {
                    const stationData = await stationService.getStationById(data.stationId);
                    setStationInfo(stationData);
                } catch (err) {
                    console.error('Failed to fetch station info', err);
                }

                // Fetch vehicle type info
                try {
                    const typeResponse = await apiClient.get(`${API.BASE}/vehicle-types/${data.typeId}`);
                    setVehicleTypeInfo(typeResponse.data?.data || typeResponse.data);
                } catch (err) {
                    console.error('Failed to fetch vehicle type info', err);
                }
            } catch (err: any) {
                console.error('Failed to fetch booking', err);
                setError(err?.response?.data?.message || err?.message || 'Không thể tải thông tin đơn hàng');
                showErrorToast('Không thể tải thông tin đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id]);

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <div className="text-gray-600">Đang tải thông tin đơn hàng...</div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <h2 className="text-2xl font-bold mb-3 text-red-600">Lỗi</h2>
                <p className="text-gray-600 mb-4">{error || 'Không tìm thấy đơn hàng'}</p>
                <button onClick={() => navigate('/ho-so?tab=orders')} className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg">
                    Quay lại danh sách đơn hàng
                </button>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-500';
            case 'CONFIRMED':
                return 'bg-green-500';
            case 'ACTIVE':
                return 'bg-blue-500';
            case 'CANCELLED':
                return 'bg-red-500';
            case 'COMPLETED':
                return 'bg-gray-500';
            default:
                return 'bg-gray-400';
        }
    };

    const formatDateTime = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleString('vi-VN');
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium">
                ← Quay lại
            </button>

            {/* Header với mã đơn hàng và trạng thái */}
            <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-2xl shadow-lg p-8 mb-6">
                <h1 className="text-3xl font-bold text-white mb-4">Chi tiết đơn hàng</h1>
                <div className="flex flex-wrap items-center justify-between gap-4 text-white">
                    <div>
                        <span className="text-sm opacity-90 block mb-1">Mã đơn hàng</span>
                        <span className="font-mono font-bold text-2xl">{booking.id}</span>
                    </div>
                    <div className="text-right">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(booking.status)} inline-block`}>
                            {booking.status}
                        </span>
                        {booking.isPaymentExpired && (
                            <div className="mt-2 text-xs bg-red-500 px-3 py-1 rounded-full inline-block">
                                Hết hạn thanh toán
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Thông tin người thuê */}
                <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500">
                    <h3 className="text-xl font-bold mb-4 text-green-600 flex items-center gap-2">
                        <span>👤</span> THÔNG TIN NGƯỜI THUÊ
                    </h3>
                    <div className="space-y-3 text-gray-700">
                        {userInfo ? (
                            <>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Họ và tên:</span>
                                    <span className="font-semibold">{userInfo.fullName || userInfo.username || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Số điện thoại:</span>
                                    <span className="font-semibold">{userInfo.phoneNumber || userInfo.phone || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Email:</span>
                                    <span className="font-semibold text-sm">{userInfo.email || 'N/A'}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500 font-medium">Mã người dùng:</span>
                                <span className="font-semibold">#{booking.userId}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Thông tin đơn hàng */}
                <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold mb-4 text-blue-600 flex items-center gap-2">
                        <span>📋</span> THÔNG TIN ĐƠN HÀNG
                    </h3>
                    <div className="space-y-3 text-gray-700">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Điểm thuê:</span>
                            <span className="font-semibold">{stationInfo?.name || stationInfo?.city || `#${booking.stationId}`}</span>
                        </div>
                        {stationInfo?.address && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500 font-medium">Địa chỉ:</span>
                                <span className="font-semibold text-sm text-right">{stationInfo.address}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Loại xe:</span>
                            <span className="font-semibold">{vehicleTypeInfo?.name || `#${booking.typeId}`}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Số ngày thuê:</span>
                            <span className="font-semibold text-blue-600">{booking.rentalDays ?? 'N/A'} ngày</span>
                        </div>
                    </div>
                </div>

                {/* Thời gian thuê */}
                <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold mb-4 text-purple-600 flex items-center gap-2">
                        <span>📅</span> THỜI GIAN THUÊ XE
                    </h3>
                    <div className="space-y-3 text-gray-700">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Ngày nhận xe:</span>
                            <span className="font-semibold">{booking.startDate}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Ngày trả xe:</span>
                            <span className="font-semibold">{booking.endDate}</span>
                        </div>
                    </div>
                </div>

                {/* Thanh toán */}
                <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-orange-500">
                    <h3 className="text-xl font-bold mb-4 text-orange-600 flex items-center gap-2">
                        <span>💳</span> THANH TOÁN
                    </h3>
                    <div className="space-y-3 text-gray-700">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Phương thức:</span>
                            <span className="font-semibold">{booking.paymentMethod || 'Chưa thanh toán'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Đã thanh toán:</span>
                            <span className="font-semibold text-green-600">{formatNumberVN(booking.totalPaid || 0)}đ</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Trạng thái:</span>
                            <span className={`font-semibold ${booking.isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                                {booking.isFullyPaid ? '✓ Đã thanh toán đủ' : '⚠ Chưa thanh toán đủ'}
                            </span>
                        </div>
                        {booking.paymentExpiryTime && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500 font-medium">Hết hạn thanh toán:</span>
                                <span className="font-semibold text-sm">{formatDateTime(booking.paymentExpiryTime)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 mt-2">
                            <span className="font-bold text-lg">Tổng thanh toán:</span>
                            <span className="font-extrabold text-green-600 text-2xl">{formatNumberVN(booking.totalPayment || 0)}đ</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lịch sử thời gian */}
            <div className="bg-white rounded-2xl shadow-md p-6 mt-6 border-l-4 border-gray-500">
                <h3 className="text-xl font-bold mb-4 text-gray-600 flex items-center gap-2">
                    <span>🕒</span> LỊCH SỬ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-gray-500 text-sm mb-1">Ngày tạo</div>
                        <div className="font-semibold">{formatDateTime(booking.createdAt)}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-gray-500 text-sm mb-1">Cập nhật lần cuối</div>
                        <div className="font-semibold">{formatDateTime(booking.updatedAt)}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-gray-500 text-sm mb-1">Có thể hủy</div>
                        <div className={`font-bold ${booking.canCancel ? 'text-green-600' : 'text-red-600'}`}>
                            {booking.canCancel ? 'Có' : 'Không'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hướng dẫn */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mt-6 border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">📌 Lưu ý quan trọng</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                    Đem hóa đơn này đến điểm thuê để lựa chọn xe phù hợp trong đúng loại đã đặt. 
                    Nhân viên sẽ tạo hợp đồng, ký và xác nhận đơn đặt. 
                    {!booking.isFullyPaid && <span className="text-orange-600 font-semibold"> Vui lòng hoàn tất thanh toán trước khi đến điểm thuê.</span>}
                </p>
            </div>
        </div>
    );
};

export default BookingDetail;

