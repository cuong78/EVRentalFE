import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contractService, type Contract } from '../../service/contractService';
import { bookingService, type Booking } from '../../service/bookingService';
import { formatNumberVN } from '../../utils/format';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import { FileText, Printer, Home } from 'lucide-react';

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
                try { 
                    const b = await bookingService.getById(bookingId); 
                    setBooking(b);
                } catch (e) {
                    console.error('Failed to load booking:', e);
                }
            } catch (error) {
                console.error('Failed to load contract:', error);
                showErrorToast('Không thể tải hợp đồng');
            } finally {
                setLoading(false);
            }
        };
        if (bookingId) load();
    }, [bookingId]);

    const handlePrintContract = () => {
        if (!contract || !booking) {
            showErrorToast('Thiếu thông tin để in hợp đồng');
            return;
        }

        const displayCode = booking.id;
        const currentDate = new Date().toLocaleDateString('vi-VN');
        const customerInfo = booking.customerInfo || {
            fullName: 'Khách hàng',
            email: '---',
            phone: '---',
            address: '---'
        };
        
        const contractContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Hợp đồng thuê xe - ${displayCode}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; background: white; }
                    .contract-container { max-width: 800px; margin: 0 auto; background: white; }
                    .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
                    .company-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
                    .company-info { font-size: 12px; color: #666; }
                    .contract-title { font-size: 28px; font-weight: bold; color: #1a365d; margin: 20px 0; }
                    .contract-details { margin-bottom: 30px; }
                    .info-row { margin-bottom: 8px; }
                    .info-label { font-weight: bold; display: inline-block; width: 150px; }
                    .terms-section { margin: 30px 0; }
                    .terms-section h3 { color: #2563eb; margin-bottom: 15px; font-size: 16px; }
                    .terms-section p { margin: 10px 0; line-height: 1.6; }
                    .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
                    .signature-box { width: 200px; text-align: center; }
                    .signature-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 5px; }
                    .digital-seal { position: relative; width: 80px; height: 80px; border: 2px solid #dc2626; border-radius: 50%; margin: 10px auto; display: flex; align-items: center; justify-content: center; color: #dc2626; font-weight: bold; font-size: 10px; }
                    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666; }
                    @media print { body { margin: 0; } .contract-container { box-shadow: none; } }
                </style>
            </head>
            <body>
                <div class="contract-container">
                    <!-- Header -->
                    <div class="header">
                        <div class="company-name">CÔNG TY THUÊ XE ĐIỆN XANH</div>
                        <div class="company-info">
                            Địa chỉ: 123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM<br>
                            Điện thoại: (028) 1234-5678 | Email: info@evrentalvn.com<br>
                            MST: 0123456789
                        </div>
                        <div class="contract-title">HỢP ĐỒNG THUÊ XE</div>
                    </div>

                    <!-- Contract Details -->
                    <div class="contract-details">
                        <h3 style="color: #2563eb; margin-bottom: 15px;">THÔNG TIN HỢP ĐỒNG</h3>
                        <div class="info-row"><span class="info-label">Mã hợp đồng:</span> ${displayCode}</div>
                        <div class="info-row"><span class="info-label">Ngày lập:</span> ${currentDate}</div>
                        <div class="info-row"><span class="info-label">Bên cho thuê:</span> CÔNG TY THUÊ XE ĐIỆN XANH</div>
                        <div class="info-row"><span class="info-label">Bên thuê:</span> ${customerInfo.fullName}</div>
                        <div class="info-row"><span class="info-label">Số điện thoại:</span> ${customerInfo.phone}</div>
                        <div class="info-row"><span class="info-label">Email:</span> ${customerInfo.email}</div>
                        <div class="info-row"><span class="info-label">Địa chỉ:</span> ${customerInfo.address}</div>
                        <div class="info-row"><span class="info-label">Loại xe:</span> ${booking.typeName || 'N/A'}</div>
                        <div class="info-row"><span class="info-label">Điểm thuê:</span> ${booking.stationName || 'N/A'}</div>
                        <div class="info-row"><span class="info-label">Xe:</span> #${contract.vehicleId}</div>
                        <div class="info-row"><span class="info-label">Thời gian thuê:</span> Từ ${booking.startDate} đến ${booking.endDate}</div>
                        <div class="info-row"><span class="info-label">Tổng tiền:</span> ${formatNumberVN(booking.totalPayment || 0)} VNĐ</div>
                        <div class="info-row"><span class="info-label">Trạng thái thanh toán:</span> ${booking.status === 'CONFIRMED' ? 'Đã thanh toán' : 'Chưa thanh toán'}</div>
                    </div>

                    <!-- Vehicle Condition -->
                    ${contract.conditionNotes ? `
                    <div style="margin-bottom: 30px; padding: 15px; background: #f7fafc; border-left: 4px solid #2563eb;">
                        <h3 style="color: #2563eb; margin-bottom: 10px; font-size: 14px;">TÌNH TRẠNG XE KHI BÀN GIAO</h3>
                        <p style="margin: 0; font-size: 13px; line-height: 1.6;">${contract.conditionNotes}</p>
                    </div>
                    ` : ''}

                    <!-- Terms -->
                    <div class="terms-section">
                        <h3>ĐIỀU KHOẢN HỢP ĐỒNG</h3>
                        <div style="font-size: 13px; line-height: 1.6;">
                            <p><strong>Điều 1: Cam kết của bên thuê (Bên B)</strong></p>
                            <p style="margin-left: 20px;">
                                Bên B cam kết sử dụng xe đúng mục đích, không vi phạm pháp luật, không sử dụng vào các hoạt động bất hợp pháp. 
                                Bên B chịu trách nhiệm hoàn toàn về các hành vi vi phạm pháp luật trong thời gian thuê xe.
                            </p>

                            <p><strong>Điều 2: Cam kết của bên cho thuê (Bên A)</strong></p>
                            <p style="margin-left: 20px;">
                                Bên A cam kết xe trong tình trạng tốt, đầy đủ giấy tờ hợp lệ theo quy định của pháp luật. 
                                Xe đã được kiểm tra kỹ lưỡng trước khi bàn giao cho khách hàng.
                            </p>

                            <p><strong>Điều 3: Trách nhiệm bảo quản và sử dụng xe</strong></p>
                            <p style="margin-left: 20px;">
                                Bên B có trách nhiệm bảo quản xe cẩn thận, trả xe đúng hạn và trong tình trạng ban đầu (trừ hao mòn tự nhiên). 
                                Trong trường hợp xe bị hư hỏng do lỗi của Bên B, Bên B phải bồi thường toàn bộ chi phí sửa chữa.
                            </p>

                            <p><strong>Điều 4: Bồi thường thiệt hại</strong></p>
                            <p style="margin-left: 20px;">
                                Mọi thiệt hại về xe do lỗi của Bên B (tai nạn, va chạm, mất cắp phụ kiện, v.v.) 
                                sẽ được bồi thường theo giá thị trường hoặc giá sửa chữa thực tế tại thời điểm xảy ra sự cố.
                            </p>

                            <p><strong>Điều 5: Giải quyết tranh chấp</strong></p>
                            <p style="margin-left: 20px;">
                                Mọi tranh chấp phát sinh từ hợp đồng này sẽ được hai bên cùng thương lượng giải quyết. 
                                Nếu không thỏa thuận được, tranh chấp sẽ được giải quyết theo pháp luật Việt Nam.
                            </p>

                            <p><strong>Điều 6: Hiệu lực hợp đồng</strong></p>
                            <p style="margin-left: 20px;">
                                Hợp đồng có hiệu lực kể từ ngày ký và thanh toán đầy đủ, 
                                có giá trị pháp lý đối với hai bên cho đến khi kết thúc thời gian thuê và hoàn tất việc trả xe.
                            </p>
                        </div>
                    </div>

                    <!-- Important Notes -->
                    <div style="margin: 30px 0; padding: 15px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px;">
                        <h4 style="color: #92400e; margin-bottom: 10px; font-size: 14px;">⚠️ LƯU Ý QUAN TRỌNG</h4>
                        <ul style="margin: 0; padding-left: 20px; font-size: 12px; line-height: 1.6; color: #78350f;">
                            <li>Xe phải được trả đúng địa điểm và thời gian đã thỏa thuận</li>
                            <li>Nghiêm cấm sử dụng xe khi đã sử dụng rượu bia hoặc chất kích thích</li>
                            <li>Không cho người khác mượn xe hoặc chuyển nhượng hợp đồng</li>
                            <li>Bảo quản giấy tờ xe cẩn thận, không để mất</li>
                            <li>Liên hệ ngay với công ty khi có sự cố: 1900-1234 (24/7)</li>
                        </ul>
                    </div>

                    <!-- Signature Section -->
                    <div class="signature-section">
                        <div class="signature-box">
                            <div style="font-weight: bold;">BÊN THUÊ (BÊN B)</div>
                            <div style="font-size: 12px; margin: 5px 0;">(Ký và ghi rõ họ tên)</div>
                            <div class="signature-line">${customerInfo.fullName}</div>
                        </div>
                        <div class="signature-box">
                            <div style="font-weight: bold;">BÊN CHO THUÊ (BÊN A)</div>
                            <div style="font-size: 12px; margin: 5px 0;">(Ký và ghi rõ họ tên)</div>
                            <div class="digital-seal">
                                CÔNG TY<br>
                                THUÊ XE<br>
                                ĐIỆN XANH
                            </div>
                            <div class="signature-line">Đại diện công ty</div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p>Hợp đồng được tạo tự động bởi hệ thống - Ngày in: ${new Date().toLocaleString('vi-VN')}</p>
                        <p>Hợp đồng có hiệu lực kể từ ngày ký và thanh toán đầy đủ</p>
                        <p style="margin-top: 10px; font-style: italic;">
                            "Hai bên đã đọc kỹ, hiểu rõ và đồng ý với tất cả các điều khoản trong hợp đồng này"
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        try {
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            if (printWindow) {
                printWindow.document.write(contractContent);
                printWindow.document.close();
                
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                };
                showSuccessToast('Đang mở cửa sổ in...');
            } else {
                // Fallback: download HTML file
                const blob = new Blob([contractContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `hop-dong-${displayCode}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showSuccessToast('Hợp đồng đã được tải xuống!');
            }
        } catch (error) {
            console.error('Error printing contract:', error);
            showErrorToast('Có lỗi khi in hợp đồng');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <div className="text-gray-600">Đang tải hợp đồng...</div>
            </div>
        );
    }

    if (!contract) {
        return (
        <div className="container mx-auto px-6 py-12 text-center">
            <h2 className="text-2xl font-bold mb-3">Không tìm thấy hợp đồng</h2>
                <p className="text-gray-600 mb-6">Vui lòng kiểm tra lại mã đơn hàng</p>
                <button
                    onClick={() => navigate('/staff')}
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-5 py-2 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all"
                >
                    Về trang nhân viên
                </button>
        </div>
    );
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                    <Home className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700 font-medium">Quay lại</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Hợp đồng cho thuê phương tiện</h1>
                        <div className="text-gray-500 mt-1">
                            Mã đơn: <span className="font-mono font-semibold">{bookingId}</span>
                        </div>
                        {contract.createdAt && (
                            <div className="text-gray-500 text-sm mt-1">
                                Ngày tạo: {new Date(contract.createdAt).toLocaleString('vi-VN')}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handlePrintContract}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 text-white px-5 py-2 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all"
                    >
                        <Printer className="w-5 h-5" />
                        In hợp đồng
                    </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-gray-800 text-sm">
                        📋 Hợp đồng này được tạo tự động khi nhân viên xác nhận đơn đặt xe và bàn giao phương tiện cho khách hàng.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-gray-800">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold mb-3 text-blue-600">Bên cho thuê (Bên A)</h3>
                        <div className="space-y-1 text-sm">
                            <div>Tên đơn vị: <span className="font-semibold">CÔNG TY THUÊ XE ĐIỆN XANH</span></div>
                            <div>Địa chỉ: 123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM</div>
                            <div>Điện thoại: (028) 1234-5678</div>
                            <div>Email: info@evrentalvn.com</div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold mb-3 text-green-600">Bên thuê (Bên B)</h3>
                        <div className="space-y-1 text-sm">
                            <div>Họ tên: <span className="font-semibold">{booking?.customerInfo?.fullName || 'Khách hàng'}</span></div>
                            <div>SĐT: {booking?.customerInfo?.phone || '---'}</div>
                            <div>Email: {booking?.customerInfo?.email || '---'}</div>
                        {booking && (
                            <>
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <div>Thời gian: {booking.startDate} → {booking.endDate}</div>
                                        <div>Tổng thanh toán: <span className="font-semibold text-green-600">{formatNumberVN(booking.totalPayment || 0)}đ</span></div>
                                    </div>
                            </>
                        )}
                        </div>
                    </div>
                </div>

                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold mb-3">Thông tin phương tiện</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">ID phương tiện:</span>
                            <span className="ml-2 font-semibold">#{contract.vehicleId}</span>
                        </div>
                        {booking && (
                            <>
                                <div>
                                    <span className="text-gray-600">Loại xe:</span>
                                    <span className="ml-2 font-semibold">{booking.typeName || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Điểm thuê:</span>
                                    <span className="ml-2 font-semibold">{booking.stationName || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Số ngày thuê:</span>
                                    <span className="ml-2 font-semibold">{booking.rentalDays || 0} ngày</span>
                                </div>
                            </>
                        )}
                    </div>
                    {contract.conditionNotes && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                            <div className="font-semibold text-sm text-yellow-800 mb-1">Ghi chú tình trạng xe:</div>
                            <div className="text-sm text-gray-700">{contract.conditionNotes}</div>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-3">Điều khoản chính</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-800 text-sm">
                        <li>Bên B cam kết sử dụng phương tiện đúng mục đích và thời gian đã thỏa thuận</li>
                        <li>Bên B tuân thủ đầy đủ quy định an toàn giao thông và bảo quản phương tiện cẩn thận</li>
                        <li>Bên B thanh toán đầy đủ các khoản phí theo hợp đồng</li>
                        <li>Bên A cam kết xe trong tình trạng tốt, đầy đủ giấy tờ hợp lệ</li>
                        <li>Mọi tranh chấp sẽ được giải quyết theo pháp luật Việt Nam</li>
                    </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                        ✓ Hợp đồng có hiệu lực kể từ ngày ký và thanh toán đầy đủ. 
                        Hai bên đã đọc kỹ, hiểu rõ và đồng ý với tất cả các điều khoản.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-10">
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                        <div className="font-semibold text-gray-800">Đại diện bên A</div>
                        <div className="text-sm text-gray-500 mt-1">(Ký, ghi rõ họ tên)</div>
                        <div className="h-24 flex items-center justify-center">
                            <div className="text-xs text-gray-400 border border-dashed border-gray-300 px-4 py-2 rounded">
                                Chữ ký điện tử
                            </div>
                        </div>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                        <div className="font-semibold text-gray-800">Đại diện bên B</div>
                        <div className="text-sm text-gray-500 mt-1">(Ký, ghi rõ họ tên)</div>
                        <div className="h-24 flex items-center justify-center">
                            <div className="text-xs text-gray-400 border border-dashed border-gray-300 px-4 py-2 rounded">
                                Khách hàng ký tên
                            </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractPrint;
