import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { formatNumberVN } from '../../utils/format';
import { bookingService, type Booking } from '../../service/bookingService';
import { FileText, Printer, Home } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';

interface BookingInvoiceProps {
    invoice?: any;
}

const BookingInvoice: React.FC<BookingInvoiceProps> = ({ invoice: invoiceProp }) => {
    const { state } = useLocation() as any;
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(false);
    
    const invoice = invoiceProp ?? state?.invoice;

    useEffect(() => {
        if (id && !invoice) {
            loadBooking();
        }
    }, [id]);

    const loadBooking = async () => {
        try {
            setLoading(true);
            const data = await bookingService.getById(id!);
            setBooking(data);
        } catch (error) {
            console.error('Failed to load booking:', error);
            showErrorToast('Không thể tải thông tin đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const bookingData = booking || invoice?.booking;

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <div className="text-gray-600">Đang tải hóa đơn...</div>
            </div>
        );
    }

    if (!invoice && !booking) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Không có dữ liệu hóa đơn</h2>
                <p className="text-gray-600 mb-6">Vui lòng quay lại trang thuê xe để tạo hóa đơn mới.</p>
                <button onClick={() => navigate('/thue-xe')} className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-xl">Quay lại</button>
            </div>
        );
    }

    // Helper function to convert number to Vietnamese words
    const convertNumberToWords = (num: number): string => {
        if (num === 0) return 'không';
        
        const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
        const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
        
        // Simplified conversion for demo
        if (num < 1000) {
            return `${ones[Math.floor(num / 100)]} trăm ${ones[num % 100]}`.trim();
        } else if (num < 1000000) {
            return `${Math.floor(num / 1000)} nghìn ${num % 1000}`.trim();
        } else {
            return `${Math.floor(num / 1000000)} triệu ${Math.floor((num % 1000000) / 1000)} nghìn`.trim();
        }
    };

    const handlePrintInvoice = () => {
        const displayCode = bookingData?.id || invoice?.booking?.id || 'N/A';
        const currentDate = new Date().toLocaleDateString('vi-VN');
        const currentTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        
        const renterName = invoice?.renterName || bookingData?.customerInfo?.fullName || 'Khách hàng';
        const phone = invoice?.phone || bookingData?.customerInfo?.phone || '---';
        const email = invoice?.email || bookingData?.customerInfo?.email || '---';
        const address = invoice?.address || bookingData?.customerInfo?.address || 'Chưa cập nhật';
        
        const vehicleName = invoice?.vehicle?.name || bookingData?.typeName || 'N/A';
        const stationName = invoice?.pickup || bookingData?.stationName || 'N/A';
        const startDate = invoice?.startDate || bookingData?.startDate || 'N/A';
        const endDate = invoice?.endDate || bookingData?.endDate || 'N/A';
        const totalPayment = invoice?.pricing?.total || bookingData?.totalPayment || 0;
        const dailyPrice = invoice?.pricing?.dailyPrice || 0;
        const days = invoice?.pricing?.days || bookingData?.rentalDays || 0;
        const deposit = invoice?.pricing?.deposit || 0;
        const paymentMethod = invoice?.paymentMethod === 'wallet' ? 'Ví EVWallet' : 
                            invoice?.paymentMethod === 'vnpay' ? 'VNPay' :
                            bookingData?.paymentMethod || 'Chưa chọn';
        const status = bookingData?.status || 'PENDING';
        const createdAt = invoice?.createdAt || bookingData?.createdAt || new Date().toISOString();

        // Generate invoice number
        const invoiceNumber = `INV${displayCode}`;
        
        const invoiceContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Hóa đơn thuê xe - ${displayCode}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; background: white; }
                    .invoice-container { max-width: 800px; margin: 0 auto; background: white; }
                    .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
                    .company-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
                    .company-info { font-size: 12px; color: #666; }
                    .invoice-title { font-size: 28px; font-weight: bold; color: #1a365d; margin: 20px 0; }
                    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .invoice-info, .customer-info { width: 45%; }
                    .info-title { font-weight: bold; color: #2563eb; margin-bottom: 8px; font-size: 14px; }
                    .info-row { margin: 4px 0; font-size: 12px; }
                    .info-label { font-weight: bold; color: #374151; }
                    .services-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                    .services-table th, .services-table td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; }
                    .services-table th { background-color: #f7fafc; font-weight: bold; color: #2d3748; }
                    .total-section { text-align: right; margin: 30px 0; }
                    .total-row { margin: 5px 0; }
                    .total-final { font-size: 18px; font-weight: bold; color: #2563eb; border-top: 2px solid #2563eb; padding-top: 10px; }
                    .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
                    .signature-box { width: 200px; text-align: center; }
                    .signature-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 5px; }
                    .digital-seal { position: relative; width: 80px; height: 80px; border: 2px solid #dc2626; border-radius: 50%; margin: 10px auto; display: flex; align-items: center; justify-content: center; color: #dc2626; font-weight: bold; font-size: 10px; }
                    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666; }
                    .terms-section { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                    .terms-section h3 { color: #2563eb; margin-bottom: 15px; }
                    .terms-section ul { margin-left: 20px; line-height: 1.6; }
                    @media print { body { margin: 0; } .invoice-container { box-shadow: none; } }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <!-- Header -->
                    <div class="header">
                        <div class="company-name">CÔNG TY THUÊ XE ĐIỆN XANH</div>
                        <div class="company-info">
                            Địa chỉ: 123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM<br>
                            Điện thoại: (028) 1234-5678 | Email: info@evrentalvn.com<br>
                            MST: 0123456789
                        </div>
                        <div class="invoice-title">HÓA ĐƠN THUÊ XE</div>
                    </div>

                    <!-- Invoice Details -->
                    <div class="invoice-details">
                        <div class="invoice-info">
                            <div class="info-title">Thông tin hóa đơn</div>
                            <div class="info-row"><span class="info-label">Số hóa đơn:</span> ${invoiceNumber}</div>
                            <div class="info-row"><span class="info-label">Ngày lập:</span> ${currentDate} lúc ${currentTime}</div>
                            <div class="info-row"><span class="info-label">Ngày đặt:</span> ${new Date(createdAt).toLocaleDateString('vi-VN')}</div>
                            <div class="info-row"><span class="info-label">Trạng thái:</span> ${status}</div>
                            <div class="info-row"><span class="info-label">Phương thức TT:</span> ${paymentMethod}</div>
                        </div>
                        <div class="customer-info">
                            <div class="info-title">Thông tin khách hàng</div>
                            <div class="info-row"><span class="info-label">Tên:</span> ${renterName}</div>
                            <div class="info-row"><span class="info-label">Điện thoại:</span> ${phone}</div>
                            <div class="info-row"><span class="info-label">Email:</span> ${email}</div>
                            <div class="info-row"><span class="info-label">Địa chỉ:</span> ${address}</div>
                        </div>
                    </div>

                    <!-- Services Table -->
                    <table class="services-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Dịch vụ</th>
                                <th>Mã đặt xe</th>
                                <th>Địa điểm thuê</th>
                                <th>Thời gian thuê</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Thuê xe ${vehicleName}</td>
                                <td>${displayCode}</td>
                                <td>${stationName}</td>
                                <td>Từ ${startDate} đến ${endDate}</td>
                                <td>${formatNumberVN(totalPayment)} VNĐ</td>
                                <td>${formatNumberVN(totalPayment)} VNĐ</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Total Section -->
                    <div class="total-section">
                        <div class="total-row">Tạm tính: ${formatNumberVN(totalPayment)} VNĐ</div>
                        <div class="total-row">VAT (0%): 0 VNĐ</div>
                        <div class="total-final">Tổng cộng: ${formatNumberVN(totalPayment)} VNĐ</div>
                        <div style="margin-top: 10px; font-style: italic;">
                            Bằng chữ: ${convertNumberToWords(totalPayment)} đồng
                        </div>
                    </div>

                    <!-- Signature Section -->
                    <div class="signature-section">
                        <div class="signature-box">
                            <div style="font-weight: bold;">KHÁCH HÀNG</div>
                            <div style="font-size: 12px; margin: 5px 0;">(Ký và ghi rõ họ tên)</div>
                            <div class="signature-line">${renterName}</div>
                        </div>
                        <div class="signature-box">
                            <div style="font-weight: bold;">NGƯỜI LẬP</div>
                            <div style="font-size: 12px; margin: 5px 0;">(Ký và ghi rõ họ tên)</div>
                            <div class="digital-seal">
                                CÔNG TY<br>
                                THUÊ XE<br>
                                ĐIỆN XANH
                            </div>
                            <div class="signature-line">Nguyễn Văn A</div>
                        </div>
                    </div>

                    <!-- Terms and Conditions -->
                    <div class="terms-section">
                        <h3>ĐIỀU KHOẢN VÀ ĐIỀU KIỆN</h3>
                        <div style="font-size: 12px; line-height: 1.5; color: #4a5568;">
                            <p><strong>1. Điều kiện thuê xe:</strong></p>
                            <ul>
                                <li>Khách hàng phải có GPLX hợp lệ và CCCD/CMND</li>
                                <li>Tuổi tối thiểu: 18 tuổi (xe máy), 21 tuổi (ô tô)</li>
                                <li>Đặt cọc 100% giá trị thuê xe</li>
                            </ul>
                            
                            <p><strong>2. Chính sách hủy đặt xe:</strong></p>
                            <ul>
                                <li>Hủy trước 24h: Hoàn 100% tiền cọc</li>
                                <li>Hủy trước 12h: Hoàn 50% tiền cọc</li>
                                <li>Hủy trong 12h: Không hoàn tiền</li>
                            </ul>
                            
                            <p><strong>3. Trách nhiệm khách hàng:</strong></p>
                            <ul>
                                <li>Bảo quản xe cẩn thận, không sử dụng vào mục đích bất hợp pháp</li>
                                <li>Trả xe đúng giờ, đúng địa điểm đã thỏa thuận</li>
                                <li>Bồi thường thiệt hại (nếu có) theo giá thị trường</li>
                            </ul>
                            
                            <p><strong>4. Liên hệ hỗ trợ:</strong></p>
                            <ul>
                                <li>Hotline: 1900-1234 (24/7)</li>
                                <li>Email: support@evrentalvn.com</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p>Hóa đơn được tạo tự động bởi hệ thống - Ngày in: ${new Date().toLocaleString('vi-VN')}</p>
                        <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        try {
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            if (printWindow) {
                printWindow.document.write(invoiceContent);
                printWindow.document.close();
                
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                };
                showSuccessToast('Đang mở cửa sổ in...');
            } else {
                // Fallback: download HTML file
                const blob = new Blob([invoiceContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `hoa-don-${displayCode}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showSuccessToast('Hóa đơn đã được tải xuống!');
            }
        } catch (error) {
            console.error('Error printing invoice:', error);
            showErrorToast('Có lỗi khi in hóa đơn');
        }
    };

    const { renterName, phone, email, pickup, startDate, endDate, paymentMethod, vehicle, pricing, createdAt } = invoice || {};
    const methodLabel = paymentMethod === 'wallet' ? 'Ví EVWallet' : 'VNPay';

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

            <div className="bg-white rounded-2xl shadow p-8" id="hoa-don-thue-xe">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Hóa đơn thuê xe</h1>
                        <div className="text-gray-500">Ngày lập: {new Date(createdAt || booking?.createdAt || Date.now()).toLocaleString('vi-VN')}</div>
                        {bookingData && (
                            <div className="text-gray-500 mt-1">Mã đơn: <span className="font-mono font-semibold">{bookingData.id}</span></div>
                        )}
                    </div>
                    <button
                        onClick={handlePrintInvoice}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 px-5 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all"
                    >
                        <Printer className="w-5 h-5" />
                        In hóa đơn
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h3 className="font-semibold mb-2">Thông tin người thuê</h3>
                        <div className="text-gray-700">{renterName || bookingData?.customerInfo?.fullName || 'N/A'}</div>
                        <div className="text-gray-700">{phone || bookingData?.customerInfo?.phone || 'N/A'}</div>
                        <div className="text-gray-700">{email || bookingData?.customerInfo?.email || 'N/A'}</div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Thông tin thuê</h3>
                        <div className="text-gray-700">Điểm nhận: {pickup || bookingData?.stationName || 'N/A'}</div>
                        <div className="text-gray-700">Thời gian: {startDate || bookingData?.startDate} → {endDate || bookingData?.endDate}</div>
                        <div className="text-gray-700">Phương thức thanh toán: {methodLabel}</div>
                        {bookingData && (
                            <div className="text-gray-700 mt-1">
                                Trạng thái: <span className={`font-medium ${
                                    bookingData.status === 'CONFIRMED' ? 'text-green-600' :
                                    bookingData.status === 'PENDING' ? 'text-yellow-600' :
                                    'text-gray-600'
                                }`}>{bookingData.status}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-semibold mb-2">Xe/Loại xe</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-16 flex items-center justify-center bg-gray-100 rounded text-2xl">
                            {vehicle?.image || '🚗'}
                        </div>
                        <div>
                            <div className="font-semibold">{vehicle?.name || bookingData?.typeName || 'N/A'}</div>
                            <div className="text-gray-500">{vehicle?.location || bookingData?.stationName || ''}</div>
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
                    {pricing && (
                        <>
                    <div className="grid grid-cols-4 px-6 py-3 border-t">
                        <div>Tiền thuê theo ngày</div>
                        <div className="text-right">{formatNumberVN(pricing.dailyPrice)}đ</div>
                        <div className="text-right">{pricing.days} ngày</div>
                        <div className="text-right">{formatNumberVN(pricing.dailyPrice * pricing.days)}đ</div>
                    </div>
                            {pricing.deposit > 0 && (
                    <div className="grid grid-cols-4 px-6 py-3 border-t">
                        <div>Đặt cọc</div>
                        <div className="text-right">{formatNumberVN(pricing.deposit)}đ</div>
                        <div className="text-right">1</div>
                        <div className="text-right">{formatNumberVN(pricing.deposit)}đ</div>
                    </div>
                            )}
                        </>
                    )}
                    <div className="grid grid-cols-4 px-6 py-4 border-t text-lg">
                        <div className="font-semibold">Tổng thanh toán</div>
                        <div></div>
                        <div></div>
                        <div className="text-right font-extrabold text-green-600">
                            {formatNumberVN(pricing?.total || bookingData?.totalPayment || 0)}đ
                        </div>
                    </div>
                </div>

                <div className="text-sm text-gray-500 mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-800 mb-2">📌 Lưu ý quan trọng:</p>
                    <p>Đem hóa đơn này đến điểm thuê để lựa chọn xe phù hợp trong đúng loại đã đặt. Nhân viên sẽ tạo hợp đồng, ký và xác nhận đơn đặt.</p>
                </div>
            </div>
        </div>
    );
};

export default BookingInvoice;
