import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatNumberVN } from '../../utils/format';
import { exportToPDF } from '../../utils/pdf';

interface BookingInvoiceProps {
    invoice?: any;
}

const BookingInvoice: React.FC<BookingInvoiceProps> = ({ invoice: invoiceProp }) => {
    const { state } = useLocation() as any;
    const navigate = useNavigate();
    const invoice = invoiceProp ?? state?.invoice;

    if (!invoice) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Không có dữ liệu hóa đơn</h2>
                <p className="text-gray-600 mb-6">Vui lòng quay lại trang thuê xe để tạo hóa đơn mới.</p>
                <button onClick={() => navigate('/thue-xe')} className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-xl">Quay lại</button>
            </div>
        );
    }

    const { renterName, phone, email, pickup, startDate, endDate, paymentMethod, vehicle, pricing, createdAt, booking } = invoice;

    const handlePrint = () => {
        try {
            window.print();
        } catch {
            exportToPDF('hoa-don-thue-xe');
        }
    };

    const methodLabel = paymentMethod === 'wallet' ? 'Ví EVWallet' : 'VNPay';

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="bg-white rounded-2xl shadow p-8">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Hóa đơn thuê xe</h1>
                        <div className="text-gray-500">Ngày lập: {new Date(createdAt).toLocaleString()}</div>
                    </div>
                    <button onClick={handlePrint} className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 px-5 rounded-xl">In hóa đơn</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h3 className="font-semibold mb-2">Thông tin người thuê</h3>
                        <div className="text-gray-700">{renterName}</div>
                        <div className="text-gray-700">{phone}</div>
                        <div className="text-gray-700">{email}</div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Thông tin thuê</h3>
                        <div className="text-gray-700">Điểm nhận: {pickup}</div>
                        <div className="text-gray-700">Thời gian: {startDate} → {endDate}</div>
                        <div className="text-gray-700">Phương thức thanh toán: {methodLabel}</div>
                        {booking && (
                            <div className="text-gray-700 mt-1">Mã đặt: <span className="font-mono">{booking.id}</span> — Trạng thái: <span className="font-medium">{booking.status}</span></div>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Xe/Loại xe</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-16 flex items-center justify-center bg-gray-100 rounded text-2xl">{vehicle.image || '🚗'}</div>
                        <div>
                            <div className="font-semibold">{vehicle.name}</div>
                            <div className="text-gray-500">{vehicle.location || ''}</div>
                        </div>
                    </div>
                </div>

                <div className="border rounded-xl overflow-hidden">
                    <div className="grid grid-cols-4 bg-gray-50 text-gray-600 px-6 py-3 text-sm">
                        <div>Mục</div>
                        <div className="text-right">Đơn giá</div>
                        <div className="text-right">Số lượng</div>
                        <div className="text-right">Thành tiền</div>
                    </div>
                    <div className="grid grid-cols-4 px-6 py-3 border-t">
                        <div>Tiền thuê theo ngày</div>
                        <div className="text-right">{formatNumberVN(pricing.dailyPrice)}đ</div>
                        <div className="text-right">{pricing.days} ngày</div>
                        <div className="text-right">{formatNumberVN(pricing.dailyPrice * pricing.days)}đ</div>
                    </div>
                    <div className="grid grid-cols-4 px-6 py-3 border-t">
                        <div>Đặt cọc</div>
                        <div className="text-right">{formatNumberVN(pricing.deposit)}đ</div>
                        <div className="text-right">1</div>
                        <div className="text-right">{formatNumberVN(pricing.deposit)}đ</div>
                    </div>
                    <div className="grid grid-cols-4 px-6 py-4 border-t text-lg">
                        <div className="font-semibold">Tổng thanh toán</div>
                        <div></div>
                        <div></div>
                        <div className="text-right font-extrabold text-green-600">{formatNumberVN(pricing.total)}đ</div>
                    </div>
                </div>

                <div className="text-sm text-gray-500 mt-6">
                    Đem hóa đơn này đến điểm thuê để lựa chọn xe phù hợp trong đúng loại đã đặt. Nhân viên sẽ tạo hợp đồng, ký và xác nhận đơn đặt.
                </div>
            </div>
        </div>
    );
};

export default BookingInvoice;


