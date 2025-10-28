import React, { useEffect, useMemo, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { formatNumberVN } from '../../../utils/format';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../service/authService';
import { bookingService, type Booking } from '../../../service/bookingService';
import { paymentService } from '../../../service/paymentService';
import { showErrorToast, showSuccessToast } from '../../../utils/show-toast';

export interface BookingVehicle {
    id: number;
    name: string;
    price: string;
    rentalRate?: number;
    depositAmount?: number;
    photos?: string;
    image?: string;
    location?: string;
    stationId?: number;
}

interface BookingModalProps {
    open: boolean;
    onClose: () => void;
    vehicle: BookingVehicle;
}

const parsePrice = (price: string | number | undefined): number => {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    const digitsOnly = String(price).replace(/[^\d]/g, '');
    return Number(digitsOnly || 0);
};

const BookingModal: React.FC<BookingModalProps> = ({ open, onClose, vehicle }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [renterName, setRenterName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [pickup, setPickup] = useState(vehicle.location || '');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'wallet'>('vnpay');
    const [submitting, setSubmitting] = useState(false);

    const dailyPrice = useMemo(() => vehicle.rentalRate ?? parsePrice(vehicle.price), [vehicle]);
    const deposit = useMemo(() => vehicle.depositAmount ?? 0, [vehicle]);

    const days = useMemo(() => {
        if (!startDate || !endDate) return 1;
        const s = new Date(startDate);
        const e = new Date(endDate);
        const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(1, diff || 1);
    }, [startDate, endDate]);

    const total = dailyPrice * days + deposit;

    // Prefill renter name/email from logged-in user (best effort with available fields)
    useEffect(() => {
        const prefillFromAuth = async () => {
            try {
                // Prefer data from backend to ensure latest phone/email
                const profile = await authService.getMyInfo();
                const name = profile?.fullName || profile?.username || (user as any)?.fullName || (user as any)?.username || '';
                const mail = profile?.email || (user as any)?.email || '';
                const phoneNumber = profile?.phoneNumber || profile?.phone || '';
                setRenterName(name);
                setEmail(mail);
                if (!phone) setPhone(phoneNumber);
            } catch {
                if (user) {
                    const name = (user as any).fullName || (user as any).username || '';
                    const mail = (user as any).email || '';
                    const phoneNumber = (user as any).phoneNumber || '';
                    setRenterName(name);
                    setEmail(mail);
                    if (!phone) setPhone(phoneNumber);
                }
            }
        };
        if (open) prefillFromAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, open]);

    // Prefill pickup/return dates from last search
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('lastRentalSearch');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.pickupDate) setStartDate(parsed.pickupDate);
                if (parsed?.returnDate) setEndDate(parsed.returnDate);
            }
        } catch {}
    }, [open]);

    if (!open) return null;

    const photoSrc = vehicle.photos || (vehicle.image && (vehicle.image.startsWith('http') || vehicle.image.startsWith('/')) ? vehicle.image : '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            showErrorToast('Vui lòng chọn ngày nhận và ngày trả');
            return;
        }
        setSubmitting(false);
        // 1) Create booking on server
        let booking: Booking | null = null;
        try {
            if (!vehicle.stationId || !vehicle.id) throw new Error('Thiếu thông tin điểm thuê hoặc loại xe');
            booking = await bookingService.create({
                stationId: vehicle.stationId,
                typeId: vehicle.id,
                startDate,
                endDate,
            });
        } catch (err) {
            console.error('Create booking failed', err);
            // vẫn cho phép in hóa đơn tạm nếu API lỗi
        }

        // 2) Trigger payment per selected method if booking created
        if (booking?.id) {
            try {
                if (paymentMethod === 'wallet') {
                    const result = await paymentService.payWithWallet(booking.id);
                    console.log('Wallet payment result:', result);
                    
                    // Check if wallet payment failed (API might return 200 with error statusCode)
                    if (result.statusCode === 400) {
                        // Insufficient balance - show error and redirect
                        const errorMsg = result.message || 'Số dư ví không đủ. Vui lòng nạp thêm tiền.';
                        showErrorToast(errorMsg);
                        onClose();
                        setSubmitting(false);
                        setTimeout(() => {
                            navigate('/ho-so?tab=orders');
                        }, 100);
                        return;
                    }
                    
                    // Check if wallet payment succeeded
                    if (result.statusCode === 200 || result.message?.includes('success')) {
                        // Payment successful, reload booking and show invoice
                        try { booking = await bookingService.getById(booking.id); } catch {}
                        showSuccessToast('Thanh toán thành công!');
                        // Navigate to invoice page
                        const invoiceData = {
                            renterName,
                            phone,
                            email,
                            pickup,
                            startDate,
                            endDate,
                            note,
                            paymentMethod,
                            vehicle: {
                                id: vehicle.id,
                                name: vehicle.name,
                                image: vehicle.image,
                                location: vehicle.location,
                            },
                            pricing: {
                                dailyPrice,
                                days,
                                deposit,
                                total,
                            },
                            booking,
                            createdAt: new Date().toISOString(),
                        };
                        onClose();
                        setSubmitting(false);
                        navigate('/hoa-don', { state: { invoice: invoiceData } });
                        return;
                    }
                } else if (paymentMethod === 'vnpay') {
                    const payUrl = await paymentService.payWithVNPay(booking.id);
                    if (payUrl) {
                        setSubmitting(false);
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
                
                setSubmitting(false);
                
                // If wallet payment fails with 400 (insufficient balance), show API error and redirect
                if (paymentMethod === 'wallet' && responseStatus === 400) {
                    // Show exact error message from API
                    showErrorToast(errorMsg || 'Số dư ví không đủ. Vui lòng nạp thêm tiền.');
                    onClose();
                    // Use setTimeout to ensure modal closes before navigation
                    setTimeout(() => {
                        navigate('/ho-so?tab=orders');
                    }, 100);
                    return;
                }
                
                // For other errors, show error but keep modal open
                showErrorToast(errorMsg || 'Thanh toán thất bại');
                return;
            }
        }

        // Fallback: if no payment method matched or booking creation failed
        setSubmitting(false);
        showErrorToast('Đã có lỗi xảy ra. Vui lòng thử lại.');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-auto p-0 overflow-hidden">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-white" onClick={onClose}>
                    <IoMdClose size={24} />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-bold mb-6">Đăng ký thuê xe</h2>
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Tên người thuê<span className="text-red-500">*</span></label>
                                    <input value={renterName} onChange={(e) => setRenterName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Số điện thoại<span className="text-red-500">*</span></label>
                                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Email<span className="text-red-500">*</span></label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Nơi nhận xe<span className="text-red-500">*</span></label>
                                <input value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Ngày nhận</label>
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Ngày trả</label>
                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Ghi chú</label>
                                <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" rows={3} />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Phương thức thanh toán</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="paymentMethod" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={(e) => setPaymentMethod(e.target.value as any)} className="w-4 h-4 text-blue-600" />
                                        <div className="flex items-center gap-2">
                                            <img src="https://tse3.mm.bing.net/th/id/OIP.kklIaX3TV97u5KnjU_Kr4wHaHa?rs=1&pid=ImgDetMain" alt="VNPay" className="w-10 h-10 object-contain" />
                                            <div>
                                                <div className="font-semibold text-gray-800">VNPay</div>
                                                <div className="text-xs text-gray-500">Cổng thanh toán</div>
                                            </div>
                                        </div>
                                    </label>
                                    <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="paymentMethod" value="wallet" checked={paymentMethod === 'wallet'} onChange={(e) => setPaymentMethod(e.target.value as any)} className="w-4 h-4 text-green-600" />
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-800">Ví EVWallet</div>
                                                <div className="text-xs text-gray-500">Thanh toán nhanh</div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="text-sm text-gray-500 mb-2">
                                <div className="flex justify-between"><span>Tiền thuê</span><span>{formatNumberVN(dailyPrice)}đ x {days} ngày = {formatNumberVN(dailyPrice * days)}đ</span></div>
                                <div className="flex justify-between"><span>Đặt cọc</span><span>{formatNumberVN(deposit)}đ</span></div>
                            </div>
                            <button disabled={submitting} type="submit" className={`w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-3.5 rounded-xl font-semibold transform transition-all duration-300 ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}>{submitting ? 'Đang xử lý...' : `Thanh toán ${formatNumberVN(total)}đ`}</button>
                        </form>
                    </div>

                    <aside className="bg-white rounded-2xl p-5 border border-gray-100 shadow h-fit">
                        <div className="flex items-center gap-3 mb-3">
                            {photoSrc ? (
                                <img src={photoSrc} className="w-28 h-20 object-cover rounded" />
                            ) : (
                                <div className="w-28 h-20 flex items-center justify-center bg-gray-100 rounded text-2xl">{vehicle.image || '🚗'}</div>
                            )}
                            <div>
                                <div className="font-semibold">{vehicle.name}</div>
                                <div className="text-sm text-gray-500">{vehicle.location || ''}</div>
                            </div>
                        </div>
                        <div className="space-y-2 text-[15px]">
                            <div className="flex justify-between"><span>Đơn giá</span><span className="font-medium">{formatNumberVN(dailyPrice)}đ/ngày</span></div>
                            <div className="flex justify-between"><span>Số ngày</span><span className="font-medium">{days}</span></div>
                            <div className="flex justify-between"><span>Đặt cọc</span><span className="font-medium">{formatNumberVN(deposit)}đ</span></div>
                            <div className="flex justify-between text-xl pt-3 border-t"><span className="font-semibold">Thanh toán*</span><span className="font-extrabold text-green-600">{formatNumberVN(total)}đ</span></div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;


