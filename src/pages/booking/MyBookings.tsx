import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Calendar, MapPin, Car, CreditCard, Eye, AlertCircle, X, Home, ArrowLeft, XCircle, User } from 'lucide-react';
import { bookingService } from '../../service/bookingService';
import type { BookingResponse } from '../../service/bookingService';
import { paymentService } from '../../service/paymentService';
import { generateBookingCode } from '../../utils/bookingCodeGenerator';
import { useAuth } from '../../hooks/useAuth';
import CancellationPolicy from '../../components/booking/CancellationPolicy';

const MyBookings: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);

    useEffect(() => {
        if (user) {
            loadBookings();
        } else {
            navigate('/');
        }
    }, [user]);

    const loadBookings = async () => {
        if (!user?.userId) {
            toast.error('Vui lòng đăng nhập để xem đặt xe');
            navigate('/');
            return;
        }
        
        try {
            setLoading(true);
            const data = await bookingService.getMyBookings(user.userId);
            setBookings(data);
        } catch (error: any) {
            console.error('Failed to load bookings:', error);
            
            // If 401 error, redirect to login
            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
                localStorage.clear();
                navigate('/');
            } else {
                toast.error('Không thể tải danh sách đặt xe');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = (booking: BookingResponse) => {
        setSelectedBooking(booking);
        setShowCancellationPolicy(true);
    };

    const handleConfirmCancellation = async (refundMethod: 'ONLINE' | 'DIRECT') => {
        if (!selectedBooking) return;
        
        console.log('Attempting to cancel booking:', {
            bookingId: selectedBooking.id,
            refundMethod: refundMethod,
            bookingStatus: selectedBooking.status
        });
        
        try {
            const result = await bookingService.cancelBookingWithRefund(selectedBooking.id, refundMethod);
            console.log('Cancel booking result:', result);
            
            toast.success(`Đã hủy đơn đặt xe thành công. Hoàn tiền ${refundMethod === 'ONLINE' ? 'online sẽ được xử lý trong 3-5 ngày' : 'trực tiếp tại văn phòng'}.`);
            setShowCancellationPolicy(false);
            setSelectedBooking(null);
            loadBookings(); // Reload bookings
        } catch (error: any) {
            console.error('Failed to cancel booking:', error);
            console.error('Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            // Handle specific error messages
            if (error.response?.status === 403) {
                toast.error('Bạn không có quyền hủy đơn đặt xe này. Vui lòng kiểm tra trạng thái đơn hàng.');
            } else if (error.response?.status === 404) {
                toast.error('Không tìm thấy đơn đặt xe');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Không thể hủy đơn đặt xe. Vui lòng thử lại sau.');
            }
        }
    };

    const handleCancelCancellation = () => {
        setShowCancellationPolicy(false);
        setSelectedBooking(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDisplayBookingCode = (booking: BookingResponse) => {
        return generateBookingCode({
            stationName: booking.stationName,
            stationId: booking.stationId,
            vehicleTypeName: booking.typeName,
            vehicleTypeId: booking.typeId,
            bookingId: booking.id
        });
    };

    const canCancelBooking = (booking: BookingResponse) => {
        // Can cancel if status is PENDING or CONFIRMED and not started yet
        const allowedStatuses = ['PENDING', 'CONFIRMED'];
        if (!allowedStatuses.includes(booking.status)) {
            return false;
        }
        
        // Check if booking hasn't started yet
        const now = new Date();
        const startDate = new Date(booking.startDate);
        return startDate > now;
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ thanh toán' },
            CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang chờ xác nhận' },
            ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đang thuê' },
            COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Hoàn thành' },
            CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
        };

        const config = statusConfig[status] || statusConfig.PENDING;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(booking.status);
        if (filter === 'completed') return ['COMPLETED', 'CANCELLED'].includes(booking.status);
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải danh sách...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                            onClick={() => navigate('/booking')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
                        >
                            <Car className="w-5 h-5" />
                            <span className="font-medium">Đặt xe mới</span>
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                        >
                            <User className="w-5 h-5" />
                            <span className="font-medium">Thông tin cá nhân</span>
                        </button>
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Đặt xe của tôi</h1>
                    <p className="text-lg text-gray-600">Quản lý và theo dõi các đơn đặt xe của bạn</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                filter === 'all'
                                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Tất cả ({bookings.length})
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                filter === 'active'
                                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Đang hoạt động ({bookings.filter(b => ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(b.status)).length})
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                filter === 'completed'
                                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Đã hoàn thành ({bookings.filter(b => ['COMPLETED', 'CANCELLED'].includes(b.status)).length})
                        </button>
                    </div>
                </div>

                {/* Bookings List */}
                {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Không có đặt xe nào</h3>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all' 
                                ? 'Bạn chưa có đơn đặt xe nào'
                                : `Không có đơn đặt xe ${filter === 'active' ? 'đang hoạt động' : 'đã hoàn thành'}`
                            }
                        </p>
                        <button
                            onClick={() => navigate('/booking')}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300"
                        >
                            Đặt xe ngay
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Mã: {getDisplayBookingCode(booking)}
                                            </h3>
                                            {getStatusBadge(booking.status)}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Đặt ngày: {formatDate(booking.createdAt)}
                                        </p>
                                    </div>
                                    <div className="mt-4 md:mt-0 text-right">
                                        <p className="text-2xl font-bold text-green-600">
                                            {booking.totalPayment.toLocaleString('vi-VN')} VNĐ
                                        </p>
                                        <div className="text-sm mt-1">
                                            {booking.status === 'CONFIRMED' ? (
                                                <span className="text-green-600 font-medium">✓ Đã thanh toán đầy đủ</span>
                                            ) : (
                                                <div>
                                                    <span className="text-orange-600">
                                                        Đã trả: 0 VNĐ
                                                    </span>
                                                    <div className="text-red-500">
                                                        Còn lại: {booking.totalPayment.toLocaleString('vi-VN')} VNĐ
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {booking.paymentMethod && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Phương thức: {booking.paymentMethod === 'VNPAY' ? 'VNPay (Online)' :
                                                             booking.paymentMethod === 'CASH' ? 'Tiền mặt' :
                                                             booking.paymentMethod}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-start">
                                        <MapPin className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Điểm thuê</p>
                                            <p className="font-medium text-gray-800">
                                                {booking.stationName || `Station #${booking.stationId}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Car className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Loại xe</p>
                                            <p className="font-medium text-gray-800">
                                                {booking.typeName || `Type #${booking.typeId}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Calendar className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                                            <p className="font-medium text-gray-800">
                                                {formatDate(booking.startDate)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Calendar className="w-5 h-5 text-green-500 mr-2 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Ngày kết thúc</p>
                                            <p className="font-medium text-gray-800">
                                                {formatDate(booking.endDate)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => navigate(`/booking/confirmation/${booking.id}`)}
                                        className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Xem chi tiết
                                    </button>
                                    
                                    {booking.status === 'PENDING' && !booking.isFullyPaid && !booking.isPaymentExpired && (
                                        <>
                                            <button
                                                onClick={() => navigate(`/booking/confirmation/${booking.id}`)}
                                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-all duration-300"
                                            >
                                                <CreditCard className="w-4 h-4 inline mr-2" />
                                                Thanh toán
                                            </button>
                                            <button
                                                onClick={() => handleCancelBooking(booking)}
                                                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-300"
                                            >
                                                <XCircle className="w-4 h-4 inline mr-2" />
                                                Hủy đơn
                                            </button>
                                        </>
                                    )}
                                    
                                    {/* Cancel button for CONFIRMED bookings */}
                                    {booking.status === 'CONFIRMED' && canCancelBooking(booking) && (
                                        <button
                                            onClick={() => handleCancelBooking(booking)}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all duration-300"
                                        >
                                            <XCircle className="w-4 h-4 inline mr-2" />
                                            Hủy và hoàn tiền
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/booking')}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300"
                    >
                        Đặt xe mới
                    </button>
                </div>
            </div>

            {/* Cancellation Policy Modal */}
            {showCancellationPolicy && selectedBooking && (
                <CancellationPolicy
                    startDate={selectedBooking.startDate}
                    totalPayment={selectedBooking.totalPayment}
                    onConfirm={handleConfirmCancellation}
                    onCancel={handleCancelCancellation}
                />
            )}
        </div>
    );
};

export default MyBookings;
