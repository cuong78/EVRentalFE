import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle, Calendar, MapPin, Car, CreditCard, Clock, AlertCircle, FileText, Download, ArrowLeft, Home, Printer, XCircle, User } from 'lucide-react';
import { bookingService } from '../../service/bookingService';
import type { BookingResponse } from '../../service/bookingService';
import { paymentService } from '../../service/paymentService';
import { contractService } from '../../service/contractService';
import BookingProgressTracker from '../../components/booking/BookingProgressTracker';
import { generateBookingCode } from '../../utils/bookingCodeGenerator';
import { useAuth } from '../../hooks/useAuth';

const BookingConfirmation: React.FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [booking, setBooking] = useState<BookingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'VNPAY' | 'CASH' | null>(null);

    useEffect(() => {
        if (bookingId) {
            loadBooking();
        }
    }, [bookingId]);

    // Debug log to check booking data
    useEffect(() => {
        if (booking) {
            console.log('Booking data:', booking);
            console.log('Customer info in booking:', booking.customerInfo);
        }
        if (user) {
            console.log('Current user in confirmation:', user);
            console.log('User phoneNumber:', user?.phoneNumber);
            console.log('User phone:', user?.phone);
            console.log('getCustomerInfo result:', getCustomerInfo());
        }
    }, [booking, user]);

    // Helper function to extract phone number from user object
    const getUserPhone = (userObj: any) => {
        const possibleFields = ['phoneNumber', 'phone', 'mobile', 'telephone'];
        for (const field of possibleFields) {
            if (userObj?.[field] && userObj[field].trim() !== '') {
                return userObj[field];
            }
        }
        return '';
    };

    // Helper function to get customer info with fallback
    const getCustomerInfo = () => {
        // Prioritize customerInfo from booking (snapshot at booking time)
        if (booking?.customerInfo) {
            return booking.customerInfo;
        }
        
        // Fallback to current user info
        if (user) {
            const phoneNumber = getUserPhone(user);
            return {
                fullName: user.fullName || user.username || '',
                email: user.email || '',
                phone: phoneNumber || 'Chưa cập nhật',
                address: user.address || 'Chưa cập nhật'
            };
        }
        
        // Default fallback
        return {
            fullName: 'Khách hàng',
            email: '---',
            phone: '---',
            address: '---'
        };
    };

    // Reload booking when coming back from payment
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && bookingId) {
                // Reload booking when user comes back to tab
                setTimeout(() => {
                    loadBooking();
                }, 1000);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [bookingId]);

    const loadBooking = async () => {
        try {
            setLoading(true);
            const data = await bookingService.getBookingById(bookingId!);
            setBooking(data);
        } catch (error) {
            console.error('Failed to load booking:', error);
            toast.error('Không thể tải thông tin đặt xe');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (method: 'VNPAY' | 'CASH') => {
        if (!booking) return;

        if (method === 'VNPAY') {
            try {
                setProcessingPayment(true);
                console.log('Creating VNPay URL for booking:', booking.id);
                const response = await paymentService.createVnPayUrl(booking.id);
                console.log('VNPay response:', response);
                
                // Redirect to VNPay payment URL
                let paymentUrl = null;
                
                // Try different possible response structures
                if (response.data && response.data.vnpayUrl) {
                    paymentUrl = response.data.vnpayUrl;
                } else if (response.data && response.data.paymentUrl) {
                    paymentUrl = response.data.paymentUrl;
                } else if (response.data && response.data.data && response.data.data.paymentUrl) {
                    paymentUrl = response.data.data.paymentUrl;
                } else if (response.paymentUrl) {
                    paymentUrl = response.paymentUrl;
                } else if (response.vnpayUrl) {
                    paymentUrl = response.vnpayUrl;
                } else if (response.data && typeof response.data === 'string' && response.data.startsWith('http')) {
                    paymentUrl = response.data;
                }
                
                if (paymentUrl) {
                    console.log('Redirecting to:', paymentUrl);
                    // Save payment info to localStorage for tracking
                    localStorage.setItem('pendingPayment', JSON.stringify({
                        bookingId: booking.id,
                        timestamp: Date.now(),
                        method: 'VNPAY'
                    }));
                    window.location.href = paymentUrl;
                } else {
                    console.error('No payment URL found in response:', response);
                    console.error('Response.data:', response.data);
                    toast.error('Không thể tạo link thanh toán - URL không tìm thấy');
                }
            } catch (error: any) {
                console.error('Failed to create payment URL:', error);
                console.error('Error response:', error.response?.data);
                const errorMessage = error.response?.data?.message || error.message || 'Không thể khởi tạo thanh toán VNPay';
                toast.error(errorMessage);
            } finally {
                setProcessingPayment(false);
            }
        } else {
            // For cash payment, just show success message
            toast.success('Vui lòng thanh toán bằng tiền mặt tại điểm thuê');
            navigate('/my-bookings');
        }
    };

    const handlePrintInvoice = () => {
        if (!booking) return;
        
        const displayCode = getDisplayBookingCode();
        const currentDate = new Date().toLocaleDateString('vi-VN');
        const currentTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const customerInfo = getCustomerInfo();
        
        // Generate invoice number from booking ID (encoded)
        const invoiceNumber = `INV${displayCode}`;
        
        // Create professional invoice content with digital signature
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
                    .info-section { margin: 12px 0; padding: 8px; background: #f8fafc; border-radius: 4px; }
                    .info-section h3 { font-size: 13px; font-weight: bold; color: #1f2937; margin-bottom: 6px; }
                    .customer-info .info-title { font-weight: bold; color: #2563eb; margin-bottom: 8px; font-size: 14px; }
                    .customer-info .info-row { margin: 4px 0; font-size: 12px; }
                    .customer-info .info-label { font-weight: bold; color: #374151; }
                    .services-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                    .services-table th, .services-table td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; }
                    .services-table th { background-color: #f7fafc; font-weight: bold; color: #2d3748; }
                    .services-table th:nth-child(1) { width: 5%; } /* STT */
                    .services-table th:nth-child(2) { width: 25%; } /* Dịch vụ */
                    .services-table th:nth-child(3) { width: 15%; } /* Mã đặt xe */
                    .services-table th:nth-child(4) { width: 20%; } /* Địa điểm */
                    .services-table th:nth-child(5) { width: 20%; } /* Thời gian */
                    .services-table th:nth-child(6) { width: 7.5%; } /* Đơn giá */
                    .services-table th:nth-child(7) { width: 7.5%; } /* Thành tiền */
                    .total-section { text-align: right; margin: 30px 0; }
                    .total-row { margin: 5px 0; }
                    .total-final { font-size: 18px; font-weight: bold; color: #2563eb; border-top: 2px solid #2563eb; padding-top: 10px; }
                    .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
                    .signature-box { width: 200px; text-align: center; }
                    .signature-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 5px; }
                    .digital-seal { position: relative; width: 80px; height: 80px; border: 2px solid #dc2626; border-radius: 50%; margin: 10px auto; display: flex; align-items: center; justify-content: center; color: #dc2626; font-weight: bold; font-size: 10px; }
                    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666; }
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
                            <div class="info-row"><span class="info-label">Ngày đặt:</span> ${formatDateTime(booking.createdAt)}</div>
                            <div class="info-row"><span class="info-label">Trạng thái:</span> ${booking.status}</div>
                            <div class="info-row"><span class="info-label">Phương thức TT:</span> ${booking.paymentMethod === 'VNPAY' ? 'VNPay (Online)' : booking.paymentMethod === 'CASH' ? 'Tiền mặt' : booking.status === 'CONFIRMED' ? 'Online' : booking.paymentMethod || 'Chưa chọn'}</div>
                            ${booking.customerInfo ? `
                            <div class="info-section">
                                <h3>Thông tin khách hàng (tại thời điểm đặt xe)</h3>
                                <div class="info-row"><span class="info-label">Họ tên:</span> ${booking.customerInfo.fullName}</div>
                                <div class="info-row"><span class="info-label">Email:</span> ${booking.customerInfo.email}</div>
                                ${booking.customerInfo.phone ? `<div class="info-row"><span class="info-label">SĐT:</span> ${booking.customerInfo.phone}</div>` : ''}
                                ${booking.customerInfo.address ? `<div class="info-row"><span class="info-label">Địa chỉ:</span> ${booking.customerInfo.address}</div>` : ''}
                            </div>
                            ` : ''}
                        </div>
                        <div class="customer-info">
                            <div class="info-title">Thông tin khách hàng</div>
                            <div class="info-row"><span class="info-label">Tên:</span> ${customerInfo.fullName}</div>
                            <div class="info-row"><span class="info-label">Điện thoại:</span> ${customerInfo.phone}</div>
                            <div class="info-row"><span class="info-label">Email:</span> ${customerInfo.email}</div>
                            <div class="info-row"><span class="info-label">Địa chỉ:</span> ${customerInfo.address}</div>
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
                                <td>Thuê xe ${booking.typeName || 'N/A'}</td>
                                <td>${displayCode}</td>
                                <td>${booking.stationName || 'N/A'}</td>
                                <td>Từ ${formatDate(booking.startDate)} đến ${formatDate(booking.endDate)}</td>
                                <td>${(booking.totalPayment || 0).toLocaleString('vi-VN')} VNĐ</td>
                                <td>${(booking.totalPayment || 0).toLocaleString('vi-VN')} VNĐ</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Total Section -->
                    <div class="total-section">
                        <div class="total-row">Tạm tính: ${(booking.totalPayment || 0).toLocaleString('vi-VN')} VNĐ</div>
                        <div class="total-row">VAT (0%): 0 VNĐ</div>
                        <div class="total-final">Tổng cộng: ${(booking.totalPayment || 0).toLocaleString('vi-VN')} VNĐ</div>
                        <div style="margin-top: 10px; font-style: italic;">
                            Bằng chữ: ${convertNumberToWords(booking.totalPayment || 0)} đồng
                        </div>
                    </div>

                    <!-- Signature Section -->
                    <div class="signature-section">
                        <div class="signature-box">
                            <div style="font-weight: bold;">KHÁCH HÀNG</div>
                            <div style="font-size: 12px; margin: 5px 0;">(Ký và ghi rõ họ tên)</div>
                            <div class="signature-line">${customerInfo.fullName}</div>
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
                    <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                        <h3 style="color: #2563eb; margin-bottom: 15px;">ĐIỀU KHOẢN VÀ ĐIỀU KIỆN</h3>
                        <div style="font-size: 12px; line-height: 1.5; color: #4a5568;">
                            <p><strong>1. Điều kiện thuê xe:</strong></p>
                            <ul style="margin-left: 20px;">
                                <li>Khách hàng phải có GPLX hợp lệ và CCCD/CMND</li>
                                <li>Tuổi tối thiểu: 18 tuổi (xe máy), 21 tuổi (ô tô)</li>
                                <li>Đặt cọc 100% giá trị thuê xe</li>
                            </ul>
                            
                            <p><strong>2. Chính sách hủy đặt xe:</strong></p>
                            <ul style="margin-left: 20px;">
                                <li>Hủy trước 24h: Hoàn 100% tiền cọc</li>
                                <li>Hủy trước 12h: Hoàn 50% tiền cọc</li>
                                <li>Hủy trong 12h: Không hoàn tiền</li>
                            </ul>
                            
                            <p><strong>3. Trách nhiệm khách hàng:</strong></p>
                            <ul style="margin-left: 20px;">
                                <li>Bảo quản xe cẩn thận, không sử dụng vào mục đích bất hợp pháp</li>
                                <li>Trả xe đúng giờ, đúng địa điểm đã thỏa thuận</li>
                                <li>Bồi thường thiệt hại (nếu có) theo giá thị trường</li>
                            </ul>
                            
                            <p><strong>4. Liên hệ hỗ trợ:</strong></p>
                            <ul style="margin-left: 20px;">
                                <li>Hotline: 1900-1234 (24/7)</li>
                                <li>Email: support@evrentalvn.com</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Contract Section -->
                    <div style="margin-top: 30px; border-top: 2px solid #2563eb; padding-top: 20px;">
                        <h3 style="color: #2563eb; margin-bottom: 15px; text-align: center;">HỢP ĐỒNG THUÊ XE</h3>
                        <div style="font-size: 13px; line-height: 1.6; color: #2d3748;">
                            <p><strong>Bên cho thuê:</strong> CÔNG TY THUÊ XE ĐIỆN XANH</p>
                            <p><strong>Bên thuê:</strong> Khách hàng (Ký tên bên dưới)</p>
                            <p><strong>Mã hợp đồng:</strong> ${displayCode}</p>
                            <p><strong>Thời gian thuê:</strong> Từ ${formatDateOnly(booking.startDate)} đến ${formatDateOnly(booking.endDate)}</p>
                            
                            <p style="margin-top: 15px;"><strong>Hai bên thống nhất:</strong></p>
                            <p>1. Bên thuê cam kết sử dụng xe đúng mục đích và trả xe đúng hạn</p>
                            <p>2. Bên cho thuê cam kết xe trong tình trạng tốt, đầy đủ giấy tờ</p>
                            <p>3. Mọi tranh chấp sẽ được giải quyết theo pháp luật Việt Nam</p>
                            
                            <p style="margin-top: 15px; text-align: center; font-style: italic;">
                                Hợp đồng có hiệu lực kể từ ngày ký và thanh toán đầy đủ
                            </p>
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
                
                // Wait for content to load before printing
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                    }, 500);
                };
            } else {
                // Fallback: create blob and download
                const blob = new Blob([invoiceContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `hoa-don-${displayCode}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.info('Hóa đơn đã được tải xuống do không thể mở cửa sổ in.');
            }
        } catch (error) {
            console.error('Error printing invoice:', error);
            toast.error('Có lỗi khi in hóa đơn. Vui lòng thử lại.');
        }
    };

    // Helper function to convert number to words (simplified Vietnamese)
    const convertNumberToWords = (num: number): string => {
        if (num === 0) return 'không';
        
        const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
        const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
        const scales = ['', 'nghìn', 'triệu', 'tỷ'];
        
        // Simplified conversion for demo - in production, use a proper Vietnamese number-to-words library
        if (num < 1000) {
            return `${ones[Math.floor(num / 100)]} trăm ${ones[num % 100]}`.trim();
        } else if (num < 1000000) {
            return `${Math.floor(num / 1000)} nghìn ${num % 1000}`.trim();
        } else {
            return `${Math.floor(num / 1000000)} triệu ${Math.floor((num % 1000000) / 1000)} nghìn`.trim();
        }
    };

    const handlePrintContract = () => {
        if (!booking) return;
        
        const displayCode = getDisplayBookingCode();
        const currentDate = new Date().toLocaleDateString('vi-VN');
        const customerInfo = getCustomerInfo();
        
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
                    .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
                    .signature-box { width: 200px; text-align: center; }
                    .signature-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 5px; }
                    .digital-seal { position: relative; width: 80px; height: 80px; border: 2px solid #dc2626; border-radius: 50%; margin: 10px auto; display: flex; align-items: center; justify-content: center; color: #dc2626; font-weight: bold; font-size: 10px; }
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
                        <div class="info-row"><span class="info-label">Loại xe:</span> ${booking.typeName || 'N/A'}</div>
                        <div class="info-row"><span class="info-label">Điểm thuê:</span> ${booking.stationName || 'N/A'}</div>
                        <div class="info-row"><span class="info-label">Thời gian thuê:</span> Từ ${formatDate(booking.startDate)} đến ${formatDate(booking.endDate)}</div>
                        <div class="info-row"><span class="info-label">Tổng tiền:</span> ${(booking.totalPayment || 0).toLocaleString('vi-VN')} VNĐ</div>
                        <div class="info-row"><span class="info-label">Trạng thái thanh toán:</span> ${booking.status === 'CONFIRMED' ? 'Đã thanh toán' : 'Chưa thanh toán'}</div>
                    </div>

                    <!-- Terms -->
                    <div class="terms-section">
                        <h3 style="color: #2563eb; margin-bottom: 15px;">ĐIỀU KHOẢN HỢP ĐỒNG</h3>
                        <div style="font-size: 13px; line-height: 1.6;">
                            <p><strong>Điều 1:</strong> Bên thuê cam kết sử dụng xe đúng mục đích, không vi phạm pháp luật.</p>
                            <p><strong>Điều 2:</strong> Bên cho thuê cam kết xe trong tình trạng tốt, đầy đủ giấy tờ hợp lệ.</p>
                            <p><strong>Điều 3:</strong> Bên thuê có trách nhiệm bảo quản xe, trả xe đúng hạn và trong tình trạng ban đầu.</p>
                            <p><strong>Điều 4:</strong> Mọi thiệt hại do lỗi của bên thuê sẽ được bồi thường theo giá thị trường.</p>
                            <p><strong>Điều 5:</strong> Tranh chấp (nếu có) sẽ được giải quyết theo pháp luật Việt Nam.</p>
                        </div>
                    </div>

                    <!-- Signature Section -->
                    <div class="signature-section">
                        <div class="signature-box">
                            <div style="font-weight: bold;">BÊN THUÊ</div>
                            <div style="font-size: 12px; margin: 5px 0;">(Ký và ghi rõ họ tên)</div>
                            <div class="signature-line">Khách hàng</div>
                        </div>
                        <div class="signature-box">
                            <div style="font-weight: bold;">BÊN CHO THUÊ</div>
                            <div style="font-size: 12px; margin: 5px 0;">(Ký và ghi rõ họ tên)</div>
                            <div class="digital-seal">
                                CÔNG TY<br>
                                THUÊ XE<br>
                                ĐIỆN XANH
                            </div>
                            <div class="signature-line">Nguyễn Văn A</div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666;">
                        <p>Hợp đồng được tạo tự động bởi hệ thống - Ngày in: ${new Date().toLocaleString('vi-VN')}</p>
                        <p>Hợp đồng có hiệu lực kể từ ngày ký và thanh toán đầy đủ</p>
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
                
                // Wait for content to load before printing
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                    }, 500);
                };
            } else {
                // Fallback: create blob and download
                const blob = new Blob([contractContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `hop-dong-${displayCode}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.info('Hợp đồng đã được tải xuống do không thể mở cửa sổ in.');
            }
        } catch (error) {
            console.error('Error printing contract:', error);
            toast.error('Có lỗi khi in hợp đồng. Vui lòng thử lại.');
        }
    };

    const getDisplayBookingCode = () => {
        if (!booking) return booking?.id || '';
        
        return generateBookingCode({
            stationName: booking.stationName,
            stationId: booking.stationId,
            vehicleTypeName: booking.typeName,
            vehicleTypeId: booking.typeId,
            bookingId: booking.id
        });
    };

    const generateInvoiceNumber = (bookingId: string): string => {
        // Convert booking ID to a different encoded number
        const hash = bookingId.split('').reduce((acc, char) => {
            return acc + char.charCodeAt(0);
        }, 0);
        
        // Create invoice number format: INV + year + month + encoded hash
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const encodedHash = (hash * 7 + 1000).toString().padStart(6, '0');
        
        return `INV${year}${month}${encodedHash}`;
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateOnly = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatDateTime = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const dateStr = date.toLocaleDateString('vi-VN');
        const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        return `${dateStr} lúc ${timeStr}`;
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ thanh toán' },
            CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang xác nhận' },
            ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đang thuê' },
            COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Hoàn thành' },
            CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
        };

        const config = statusConfig[status] || statusConfig.PENDING;
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy đặt xe</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
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
                            onClick={() => navigate('/my-bookings')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Đặt xe của tôi</span>
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300"
                        >
                            <User className="w-5 h-5" />
                            <span className="font-medium">Thông tin cá nhân</span>
                        </button>
                    </div>
                </div>

                {/* Progress Tracker */}
                {booking && (
                    <div className="mb-6">
                        <BookingProgressTracker 
                            currentStatus={booking.status}
                            isFullyPaid={booking.status === 'CONFIRMED'}
                        />
                    </div>
                )}

                {/* Success Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Đặt xe thành công!</h1>
                        <p className="text-gray-600">Mã đặt xe: <span className="font-semibold text-blue-600">{getDisplayBookingCode()}</span></p>
                        <div className="mt-4">
                            {getStatusBadge(booking.status)}
                        </div>
                    </div>
                </div>

                {/* Booking Details */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Chi tiết đặt xe</h2>
                    
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <MapPin className="w-5 h-5 text-green-500 mr-3 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500">Điểm thuê</p>
                                <p className="font-medium text-gray-800">{booking.stationName || `Station #${booking.stationId}`}</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <Car className="w-5 h-5 text-green-500 mr-3 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500">Loại xe</p>
                                <p className="font-medium text-gray-800">{booking.typeName || `Type #${booking.typeId}`}</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <Calendar className="w-5 h-5 text-green-500 mr-3 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500">Thời gian thuê</p>
                                <p className="font-medium text-gray-800">
                                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    ({booking.rentalDays} ngày)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <Clock className="w-5 h-5 text-green-500 mr-3 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500">Hạn thanh toán</p>
                                <p className="font-medium text-gray-800">
                                    {formatDate(booking.paymentExpiryTime)}
                                </p>
                                {booking.isPaymentExpired && (
                                    <p className="text-sm text-red-500 mt-1">⚠️ Đã hết hạn thanh toán</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Information at Booking Time */}
                {(booking.customerInfo || user) && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Thông tin khách hàng (tại thời điểm đặt xe)</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <User className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Họ và tên</p>
                                    <p className="font-medium text-gray-800">{getCustomerInfo().fullName}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <CreditCard className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-800">{getCustomerInfo().email}</p>
                                </div>
                            </div>

                            {getCustomerInfo().phone && getCustomerInfo().phone !== '---' && getCustomerInfo().phone !== 'Chưa cập nhật' && (
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Số điện thoại</p>
                                        <p className="font-medium text-gray-800">{getCustomerInfo().phone}</p>
                                    </div>
                                </div>
                            )}

                            {getCustomerInfo().address && getCustomerInfo().address !== '---' && getCustomerInfo().address !== 'Chưa cập nhật' && (
                                <div className="flex items-start">
                                    <MapPin className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Địa chỉ</p>
                                        <p className="font-medium text-gray-800">{getCustomerInfo().address}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Payment Information */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Thông tin thanh toán</h2>
                    
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <CreditCard className="w-5 h-5 text-green-500 mr-3 mt-1" />
                            <div className="flex-1">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tổng tiền:</span>
                                        <span className="font-semibold">{(booking.totalPayment || 0).toLocaleString('vi-VN')} VNĐ</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Đã thanh toán:</span>
                                        <span className={`font-semibold ${booking.status === 'CONFIRMED' ? 'text-green-600' : 'text-orange-600'}`}>
                                            {booking.status === 'CONFIRMED' ? (booking.totalPayment || 0).toLocaleString('vi-VN') : '0'} VNĐ
                                        </span>
                                    </div>
                                    {booking.status !== 'CONFIRMED' && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Còn lại:</span>
                                                <span className="font-semibold text-red-600">
                                                    {(booking.totalPayment || 0).toLocaleString('vi-VN')} VNĐ
                                                </span>
                                            </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phương thức:</span>
                                        <span className="font-semibold">
                                            {booking.paymentMethod === 'VNPAY' ? 'VNPay (Online)' :
                                            //  booking.paymentMethod === 'CASH' ? 'Tiền mặt' :
                                             booking.status === 'CONFIRMED' ? 'Online' :
                                             booking.paymentMethod || 'Chưa chọn'}
                                            </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {booking.status === 'CONFIRMED' ? 'Đã thanh toán' :
                                             booking.status === 'PENDING' ? 'Chờ thanh toán' :
                                             booking.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Options */}
                {booking.status === 'PENDING' && !booking.isFullyPaid && !booking.isPaymentExpired && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Phương thức thanh toán</h2>
                        
                        {!selectedPaymentMethod ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSelectedPaymentMethod('VNPAY')}
                                    className="p-6 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                                >
                                    <div className="text-center">
                                        <div className="text-3xl mb-2">💳</div>
                                        <h3 className="font-semibold text-gray-800 mb-1">VNPay</h3>
                                        <p className="text-sm text-gray-600">Thanh toán online</p>
                                    </div>
                                </button>
                                {/* <button
                                    onClick={() => setSelectedPaymentMethod('CASH')}
                                    className="p-6 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-300"
                                >
                                    <div className="text-center">
                                        <div className="text-3xl mb-2">💵</div>
                                        <h3 className="font-semibold text-gray-800 mb-1">Tiền mặt</h3>
                                        <p className="text-sm text-gray-600">Thanh toán tại điểm thuê</p>
                                    </div>
                                </button> */}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="text-2xl mr-3">
                                            {selectedPaymentMethod === 'VNPAY' ? '💳' : '💵'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                {selectedPaymentMethod === 'VNPAY' ? 'VNPay' : 'Tiền mặt'}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {selectedPaymentMethod === 'VNPAY' ? 'Thanh toán online' : 'Thanh toán tại điểm thuê'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedPaymentMethod(null)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Thay đổi
                                    </button>
                                </div>
                                
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handlePayment(selectedPaymentMethod)}
                                        disabled={processingPayment}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
                                    >
                                        {processingPayment ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Print Options */}
                {booking && (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">In tài liệu</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handlePrintInvoice}
                                className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-300"
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                In hóa đơn
                            </button>
                            <button
                                onClick={handlePrintContract}
                                className="flex items-center justify-center px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-all duration-300"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                In hợp đồng
                            </button>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300"
                    >
                        Xem đặt xe của tôi
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;
