import React, { useEffect, useMemo, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { formatNumberVN } from '../../../utils/format';
import { useAuth } from '../../../hooks/useAuth';

export interface BookingVehicle {
    id: number;
    name: string;
    price: string;
    rentalRate?: number;
    photos?: string;
    image?: string;
    location?: string;
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
    const [renterName, setRenterName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [pickup, setPickup] = useState(vehicle.location || '');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'e_wallet' | 'cash' | 'card'>('e_wallet');

    const dailyPrice = useMemo(() => vehicle.rentalRate ?? parsePrice(vehicle.price), [vehicle]);

    const days = useMemo(() => {
        if (!startDate || !endDate) return 1;
        const s = new Date(startDate);
        const e = new Date(endDate);
        const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(1, diff || 1);
    }, [startDate, endDate]);

    const total = dailyPrice * days;

    // Prefill renter name/email from logged-in user (best effort with available fields)
    useEffect(() => {
        if (user) {
            const name = (user as any).fullName || (user as any).username || '';
            const mail = (user as any).email || '';
            setRenterName(name);
            setEmail(mail);
        }
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder submit; integrate API later
        console.log('Booking submit', {
            renterName, phone, email, pickup, startDate, endDate, note, paymentMethod,
            vehicleId: vehicle.id,
        });
        onClose();
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Phương thức thanh toán</label>
                                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
                                        <option value="e_wallet">QR và ví điện tử</option>
                                        <option value="card">Thẻ ngân hàng</option>
                                        <option value="cash">Tiền mặt</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-3.5 rounded-xl font-semibold transform transition-all duration-300">Thanh toán {formatNumberVN(total)}đ</button>
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
                            <div className="flex justify-between text-xl pt-3 border-t"><span className="font-semibold">Thanh toán*</span><span className="font-extrabold text-green-600">{formatNumberVN(total)}đ</span></div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;


