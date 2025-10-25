import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contractService, type Contract } from '../../service/contractService';
import { bookingService, type Booking } from '../../service/bookingService';
import { formatNumberVN } from '../../utils/format';

const ContractPrint: React.FC = () => {
    const { bookingId = '' } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [contract, setContract] = useState<Contract | null>(null);
    const [booking, setBooking] = useState<Booking | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const c = await contractService.getByBookingId(bookingId);
                setContract(c);
                try { setBooking(await bookingService.getById(bookingId)); } catch {}
            } finally {
                setLoading(false);
            }
        };
        if (bookingId) load();
    }, [bookingId]);

    const handlePrint = () => {
        try { window.print(); } catch {}
    };

    if (loading) return <div className="container mx-auto px-6 py-12 text-center">Đang tải hợp đồng...</div>;
    if (!contract) return (
        <div className="container mx-auto px-6 py-12 text-center">
            <h2 className="text-2xl font-bold mb-3">Không tìm thấy hợp đồng</h2>
            <button onClick={() => navigate('/staff')} className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-5 py-2 rounded-xl">Về trang nhân viên</button>
        </div>
    );

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="bg-white rounded-2xl shadow p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Hợp đồng cho thuê phương tiện</h1>
                        <div className="text-gray-500">Mã đơn: <span className="font-mono">{bookingId}</span></div>
                    </div>
                    <button onClick={handlePrint} className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-5 py-2 rounded-xl">In hợp đồng</button>
                </div>

                <div className="mb-6 text-gray-800">
                    <p>Hôm nay, hai bên thống nhất lập Hợp đồng thuê phương tiện với các thông tin sau:</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-gray-800">
                    <div>
                        <h3 className="font-semibold mb-2">Bên cho thuê (Bên A)</h3>
                        <div>Tên đơn vị: EVRental</div>
                        <div>Địa chỉ: ...</div>
                        <div>Điện thoại: ...</div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Bên thuê (Bên B)</h3>
                        <div>Mã đặt: <span className="font-mono">{bookingId}</span></div>
                        {booking && (
                            <>
                                <div>Thời gian thuê: {booking.startDate} → {booking.endDate}</div>
                                <div>Tổng thanh toán: {formatNumberVN(booking.totalPayment || 0)}đ</div>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Thông tin phương tiện</h3>
                    <div>Vehicle ID: #{contract.vehicleId}</div>
                    <div>Ghi chú tình trạng: {contract.conditionNotes || '-'}</div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Điều khoản chính</h3>
                    <ul className="list-disc pl-6 space-y-1 text-gray-800">
                        <li>Bên B sử dụng phương tiện đúng mục đích, thời gian.</li>
                        <li>Tuân thủ quy định an toàn giao thông và bảo quản phương tiện.</li>
                        <li>Thanh toán đầy đủ các khoản theo hợp đồng.</li>
                    </ul>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-10">
                    <div className="text-center">
                        <div className="font-semibold">Đại diện bên A</div>
                        <div className="text-sm text-gray-500">(Ký, ghi rõ họ tên)</div>
                        <div className="h-24"></div>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold">Đại diện bên B</div>
                        <div className="text-sm text-gray-500">(Ký, ghi rõ họ tên)</div>
                        <div className="h-24"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractPrint;


