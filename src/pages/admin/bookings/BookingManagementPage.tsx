import React, { useEffect, useState } from 'react';
import { bookingService, type Booking } from '../../../service/bookingService';
import { showErrorToast } from '../../../utils/show-toast';
import { formatNumberVN } from '../../../utils/format';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const BookingManagementPage: React.FC = () => {
    const [selectedStatus, setSelectedStatus] = useState<BookingStatus>('PENDING');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const statusOptions: { value: BookingStatus; label: string; color: string }[] = [
        { value: 'PENDING', label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
        { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'bg-green-100 text-green-700 border-green-300' },
        { value: 'ACTIVE', label: 'Đang thuê', color: 'bg-blue-100 text-blue-700 border-blue-300' },
        { value: 'COMPLETED', label: 'Hoàn thành', color: 'bg-gray-100 text-gray-700 border-gray-300' },
        { value: 'CANCELLED', label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-300' },
    ];

    const loadBookings = async (status: BookingStatus) => {
        setLoading(true);
        try {
            const data = await bookingService.getByStatus(status);
            setBookings(data);
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Không thể tải danh sách booking');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings(selectedStatus);
    }, [selectedStatus]);

    const handleStatusChange = (status: BookingStatus) => {
        setSelectedStatus(status);
    };

    const handleViewDetail = async (bookingId: string) => {
        setLoadingDetail(true);
        setDetailModalOpen(true);
        try {
            const detail = await bookingService.getDetail(bookingId);
            setSelectedBooking(detail);
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Không thể tải chi tiết booking');
            setDetailModalOpen(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    const closeDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedBooking(null);
    };

    const getStatusBadge = (status: string) => {
        const found = statusOptions.find(s => s.value === status);
        return found ? (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${found.color}`}>
                {found.label}
            </span>
        ) : (
            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{status}</span>
        );
    };

    const formatDateTime = (dateTime?: string | null) => {
        if (!dateTime) return 'N/A';
        try {
            return new Date(dateTime).toLocaleString('vi-VN');
        } catch {
            return dateTime;
        }
    };

    const formatDate = (date?: string | null) => {
        if (!date) return 'N/A';
        return date;
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý Booking</h1>
                <p className="text-gray-600">Quản lý tất cả các đơn thuê xe trong hệ thống</p>
            </div>

            {/* Status Filter */}
            <div className="bg-white rounded-lg shadow mb-6 p-4">
                <div className="flex flex-wrap gap-3">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleStatusChange(option.value)}
                            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                                selectedStatus === option.value
                                    ? option.color + ' shadow-md'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-600">Đang tải...</div>
                ) : bookings.length === 0 ? (
                    <div className="p-8 text-center text-gray-600">
                        Không có booking nào với trạng thái "{statusOptions.find(s => s.value === selectedStatus)?.label}"
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Booking ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Khách hàng
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        SĐT
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Điểm thuê
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loại xe
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thời gian thuê
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng tiền
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hạn thanh toán
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                                            {booking.id}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {(booking as any).username || 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {(booking as any).userPhone || 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {(booking as any).stationName || 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>
                                                <div className="font-medium">{booking.typeName || 'N/A'}</div>
                                                {(booking as any).vehicleName && (
                                                    <div className="text-xs text-gray-500">{(booking as any).vehicleName}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900">
                                            <div className="whitespace-nowrap">
                                                <div>{formatDate(booking.startDate)}</div>
                                                <div className="text-xs text-gray-500">→ {formatDate(booking.endDate)}</div>
                                                {booking.rentalDays && (
                                                    <div className="text-xs text-blue-600 mt-1">
                                                        {booking.rentalDays} ngày
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatNumberVN(booking.totalPayment)}đ
                                            {booking.totalPaid !== null && booking.totalPaid !== undefined && (
                                                <div className="text-xs text-green-600">
                                                    Đã trả: {formatNumberVN(booking.totalPaid)}đ
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            {getStatusBadge(booking.status)}
                                            {booking.isPaymentExpired && (
                                                <div className="text-xs text-red-600 mt-1">Hết hạn TT</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.paymentExpiryTime ? (
                                                <span className="text-xs">{formatDateTime(booking.paymentExpiryTime)}</span>
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleViewDetail(booking.id)}
                                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Summary */}
                {!loading && bookings.length > 0 && (
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                                Tổng số booking: <span className="font-semibold text-gray-900">{bookings.length}</span>
                            </span>
                            <span>
                                Tổng giá trị: <span className="font-semibold text-gray-900">
                                    {formatNumberVN(bookings.reduce((sum, b) => sum + b.totalPayment, 0))}đ
                                </span>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {detailModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-10 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">Chi tiết Booking</h2>
                            <button
                                onClick={closeDetailModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            {loadingDetail ? (
                                <div className="text-center py-12 text-gray-600">Đang tải...</div>
                            ) : selectedBooking ? (
                                <div className="space-y-6">
                                    {/* Booking Info - Always show */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            📋 Thông tin Booking
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div><span className="font-medium">Booking ID:</span> {selectedBooking.id}</div>
                                            <div><span className="font-medium">Khách hàng:</span> {selectedBooking.username || 'N/A'}</div>
                                            <div><span className="font-medium">SĐT:</span> {selectedBooking.userPhone || 'N/A'}</div>
                                            <div><span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedBooking.status)}</div>
                                            <div><span className="font-medium">Điểm thuê:</span> {selectedBooking.stationName || 'N/A'}</div>
                                            <div><span className="font-medium">Địa chỉ:</span> {selectedBooking.stationAddress || 'N/A'}</div>
                                            <div><span className="font-medium">Loại xe:</span> {selectedBooking.typeName || 'N/A'}</div>
                                            <div><span className="font-medium">Ngày bắt đầu:</span> {formatDate(selectedBooking.startDate)}</div>
                                            <div><span className="font-medium">Ngày kết thúc:</span> {formatDate(selectedBooking.endDate)}</div>
                                            <div><span className="font-medium">Số ngày thuê:</span> {selectedBooking.rentalDays || 'N/A'} ngày</div>
                                            <div><span className="font-medium">Tổng tiền:</span> {formatNumberVN(selectedBooking.totalPayment)}đ</div>
                                            <div><span className="font-medium">Hạn thanh toán:</span> {formatDateTime(selectedBooking.paymentExpiryTime)}</div>
                                        </div>
                                    </div>

                                    {/* Payment Info - Show for CONFIRMED, ACTIVE, COMPLETED */}
                                    {['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(selectedBooking.status) && selectedBooking.payments && (
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                💳 Thông tin Thanh toán
                                            </h3>
                                            {selectedBooking.payments.length > 0 ? (
                                                <div className="space-y-3">
                                                    {selectedBooking.payments.map((payment: any, index: number) => (
                                                        <div key={payment.id || index} className="bg-white rounded p-3 text-sm">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div><span className="font-medium">Loại:</span> {payment.type || 'N/A'}</div>
                                                                <div><span className="font-medium">Phương thức:</span> {payment.method || 'N/A'}</div>
                                                                <div><span className="font-medium">Số tiền:</span> {formatNumberVN(payment.amount)}đ</div>
                                                                <div><span className="font-medium">Trạng thái:</span> <span className={payment.status === 'SUCCESS' ? 'text-green-600' : 'text-yellow-600'}>{payment.status}</span></div>
                                                                <div className="col-span-2"><span className="font-medium">Transaction ID:</span> {payment.transactionId || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-gray-600">Chưa có thanh toán</div>
                                            )}
                                        </div>
                                    )}

                                    {/* Contract Info - Show for ACTIVE, COMPLETED */}
                                    {['ACTIVE', 'COMPLETED'].includes(selectedBooking.status) && selectedBooking.contract && (
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                📄 Thông tin Hợp đồng
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="font-medium">Contract ID:</span> {selectedBooking.contract.id || 'N/A'}</div>
                                                <div><span className="font-medium">Xe:</span> {selectedBooking.contract.vehicleName || 'N/A'}</div>
                                                <div><span className="font-medium">Biển số:</span> {selectedBooking.contract.licensePlate || 'N/A'}</div>
                                                <div><span className="font-medium">Ngày bắt đầu:</span> {formatDateTime(selectedBooking.contract.startTime)}</div>
                                                <div><span className="font-medium">Ngày kết thúc dự kiến:</span> {formatDateTime(selectedBooking.contract.expectedEndTime)}</div>
                                                <div><span className="font-medium">Tiền cọc:</span> {formatNumberVN(selectedBooking.contract.depositAmount)}đ</div>
                                                <div className="col-span-2"><span className="font-medium">Ghi chú tình trạng xe:</span> {selectedBooking.contract.conditionNotes || 'Không có'}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Return Transaction Info - Show for COMPLETED only */}
                                    {selectedBooking.status === 'COMPLETED' && selectedBooking.returnTransaction && (
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                🔄 Thông tin Hoàn trả
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="font-medium">Return ID:</span> {selectedBooking.returnTransaction.id || 'N/A'}</div>
                                                <div><span className="font-medium">Thời gian trả:</span> {formatDateTime(selectedBooking.returnTransaction.returnTime)}</div>
                                                <div><span className="font-medium">Phí hư hỏng:</span> {formatNumberVN(selectedBooking.returnTransaction.damageFee || 0)}đ</div>
                                                <div><span className="font-medium">Phí trễ hạn:</span> {formatNumberVN(selectedBooking.returnTransaction.lateFee || 0)}đ</div>
                                                <div><span className="font-medium">Tổng hoàn trả:</span> {formatNumberVN(selectedBooking.returnTransaction.totalRefund || 0)}đ</div>
                                                <div><span className="font-medium">Staff xử lý:</span> {selectedBooking.returnTransaction.staffName || 'N/A'}</div>
                                                <div className="col-span-2"><span className="font-medium">Ghi chú:</span> {selectedBooking.returnTransaction.notes || 'Không có'}</div>
                                            </div>
                                            {selectedBooking.returnTransaction.photos && selectedBooking.returnTransaction.photos.length > 0 && (
                                                <div className="mt-3">
                                                    <span className="font-medium text-sm">Ảnh trả xe:</span>
                                                    <div className="flex gap-2 mt-2 flex-wrap">
                                                        {selectedBooking.returnTransaction.photos.map((photo: string, idx: number) => (
                                                            <img key={idx} src={photo} alt={`Return ${idx + 1}`} className="w-24 h-24 object-cover rounded border" />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-600">Không có dữ liệu</div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                            <button
                                onClick={closeDetailModal}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingManagementPage;

