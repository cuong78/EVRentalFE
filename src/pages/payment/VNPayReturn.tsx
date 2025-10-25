import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../../service/paymentService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import { bookingService } from '../../service/bookingService';
import { authService } from '../../service/authService';
import BookingInvoice from '../booking/BookingInvoice';

const VNPayReturn: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string>('Đang xác nhận thanh toán...');
    const [invoice, setInvoice] = useState<any | null>(null);
    const queryParams = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const obj: Record<string, string> = {};
        params.forEach((value, key) => { obj[key] = value; });
        return obj;
    }, [location.search]);

    useEffect(() => {
        const run = async () => {
            try {
                const resp = await paymentService.vnpayReturn(queryParams);
                const ok = (resp?.statusCode ?? 200) === 200;
                if (!ok) throw new Error(resp?.message || 'VNPay return failed');

                // Build invoice data using booking + user profile
                const bookingId = (queryParams['vnp_TxnRef'] || queryParams['txnRef'] || '').toString();
                let booking: any = null;
                try { if (bookingId) booking = await bookingService.getById(bookingId); } catch {}
                let profile: any = null;
                try { profile = await authService.getMyInfo(); } catch {}
                const renterName = profile?.fullName || profile?.username || '';
                const email = profile?.email || '';
                const phone = profile?.phoneNumber || profile?.phone || '';
                let pickup = '';
                let startDate = booking?.startDate || '';
                let endDate = booking?.endDate || '';
                try {
                    const last = JSON.parse(sessionStorage.getItem('lastRentalSearch') || 'null');
                    pickup = last?.pickup || '';
                    if (!startDate) startDate = last?.pickupDate || '';
                    if (!endDate) endDate = last?.returnDate || '';
                } catch {}

                const days = (() => {
                    if (!startDate || !endDate) return 1;
                    const s = new Date(startDate);
                    const e = new Date(endDate);
                    const d = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
                    return Math.max(1, d || 1);
                })();
                const total = Number(booking?.totalPayment || 0);

                const invoiceData = {
                    renterName,
                    phone,
                    email,
                    pickup,
                    startDate,
                    endDate,
                    note: '',
                    paymentMethod: 'vnpay',
                    vehicle: {
                        id: booking?.typeId || 0,
                        name: 'Thanh toán VNPay',
                        image: '🚗',
                        location: pickup,
                    },
                    pricing: {
                        dailyPrice: Math.round(total / days) || total,
                        days,
                        deposit: 0,
                        total,
                    },
                    booking,
                    createdAt: new Date().toISOString(),
                };

                showSuccessToast(resp?.message || 'Thanh toán VNPay thành công');
                setInvoice(invoiceData);
                setMessage('Thanh toán thành công. Hóa đơn đã sẵn sàng để in.');
                return;
            } catch (e: any) {
                const msg = e?.response?.data?.message || e?.message || 'Xác nhận thanh toán thất bại';
                showErrorToast(msg);
                setMessage(msg);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [queryParams, navigate]);

    if (invoice) {
        return <BookingInvoice invoice={invoice} />;
    }

    return (
        <div className="container mx-auto px-6 py-12 text-center">
            <div className="bg-white rounded-2xl shadow p-8 max-w-xl mx-auto">
                <h1 className="text-2xl font-bold mb-3">Kết quả thanh toán VNPay</h1>
                <p className="text-gray-700 mb-6">{loading ? 'Đang xử lý...' : message}</p>
                <div className="flex justify-center gap-3">
                    <button onClick={() => navigate('/ho-so?tab=orders')} className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-5 py-2 rounded-xl">Xem đơn hàng</button>
                    <button onClick={() => navigate('/')} className="border border-gray-200 text-gray-700 px-5 py-2 rounded-xl">Về trang chủ</button>
                </div>
            </div>
        </div>
    );
};

export default VNPayReturn;


