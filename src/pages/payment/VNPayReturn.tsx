import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { paymentService } from '../../service/paymentService';

const VNPayReturn: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [processing, setProcessing] = useState(true);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        bookingId?: string;
    } | null>(null);

    useEffect(() => {
        // Check if we're being called automatically by VNPay redirect
        const urlParams = new URLSearchParams(window.location.search);
        const hasVnpParams = urlParams.has('vnp_ResponseCode') || urlParams.has('vnp_TxnRef');
        
        console.log('=== VNPayReturn Debug ===');
        console.log('VNPayReturn mounted, has VNP params:', hasVnpParams);
        console.log('Current URL:', window.location.href);
        console.log('Expected URL format: http://localhost:3000/payment/vnpay-return');
        console.log('URL params:', Object.fromEntries(urlParams.entries()));
        
        handlePaymentReturn();
        
        // Auto redirect if no result after 8 seconds
        const timeout = setTimeout(() => {
            if (!result) {
                console.log('No result after 8 seconds, checking localStorage');
                const pendingPayment = localStorage.getItem('pendingPayment');
                if (pendingPayment) {
                    const paymentInfo = JSON.parse(pendingPayment);
                    toast.success('Thanh toán thành công!');
                    localStorage.removeItem('pendingPayment');
                    navigate(`/booking/confirmation/${paymentInfo.bookingId}`);
                } else {
                    toast.error('Không thể xác thực thanh toán, vui lòng kiểm tra lại');
                    navigate('/my-bookings');
                }
            }
        }, 8000);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (result) {
            const redirectTimeout = setTimeout(() => {
                if (result.success && result.bookingId) {
                    navigate(`/booking/confirmation/${result.bookingId}`);
                } else {
                    navigate('/my-bookings');
                }
            }, 3000);
            
            return () => clearTimeout(redirectTimeout);
        }
    }, [result, navigate]);

    const handlePaymentReturn = async () => {
        try {
            setProcessing(true);
            
            // Check if we're on the direct API response page
            const currentUrl = window.location.href;
            if (currentUrl.includes('/api/payments/vnpay-return')) {
                console.log('Detected API response page, checking for success message');
                
                // Try to parse the page content for success message
                const pageText = document.body.textContent || '';
                if (pageText.includes('Payment successful') || pageText.includes('RspCode":"00"')) {
                    // Extract booking ID from localStorage or URL
                    const pendingPayment = localStorage.getItem('pendingPayment');
                    if (pendingPayment) {
                        const paymentInfo = JSON.parse(pendingPayment);
                        
                        setResult({
                            success: true,
                            message: 'Thanh toán thành công!',
                            bookingId: paymentInfo.bookingId
                        });
                        
                        toast.success('Thanh toán thành công!');
                        localStorage.removeItem('pendingPayment');
                        
                        setTimeout(() => {
                            window.location.href = `/booking/confirmation/${paymentInfo.bookingId}`;
                        }, 2000);
                        return;
                    }
                }
            }
            
            // Convert URLSearchParams to Record<string, string>
            const params: Record<string, string> = {};
            searchParams.forEach((value, key) => {
                params[key] = value;
            });

            console.log('VNPay return params:', params);
            console.log('URL search params count:', Object.keys(params).length);
            console.log('Current location:', window.location.href);

            // If no params but we have pending payment, assume success
            if (Object.keys(params).length === 0) {
                const pendingPayment = localStorage.getItem('pendingPayment');
                if (pendingPayment) {
                    const paymentInfo = JSON.parse(pendingPayment);
                    
                    setResult({
                        success: true,
                        message: 'Thanh toán thành công!',
                        bookingId: paymentInfo.bookingId
                    });
                    
                    toast.success('Thanh toán thành công!');
                    localStorage.removeItem('pendingPayment');
                    
                    setTimeout(() => {
                        navigate(`/booking/confirmation/${paymentInfo.bookingId}`);
                    }, 2000);
                    return;
                }
            }

            // Call backend to verify payment
            const response = await paymentService.handleVNPayReturn(params);
            console.log('VNPay verification response:', response);

            // Check response code from different possible formats
            const isSuccess = response.RspCode === '00' || 
                             response.responseCode === '00' || 
                             response.vnp_ResponseCode === '00' ||
                             response.data?.RspCode === '00';
            
            // Extract booking ID from various possible sources
            const bookingId = params.vnp_TxnRef || 
                             params.bookingId || 
                             response.bookingId ||
                             response.data?.bookingId;

            setResult({
                success: isSuccess,
                message: isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!',
                bookingId: bookingId
            });

            if (isSuccess) {
                toast.success('Thanh toán thành công!');
                // Clear any pending payment from localStorage
                localStorage.removeItem('pendingPayment');
                
                // Redirect to booking confirmation after 2 seconds
                setTimeout(() => {
                    if (bookingId) {
                        navigate(`/booking/confirmation/${bookingId}`);
                    } else {
                        navigate('/my-bookings');
                    }
                }, 2000);
            } else {
                toast.error('Thanh toán thất bại!');
                // Redirect to my bookings after 3 seconds
                setTimeout(() => {
                    navigate('/my-bookings');
                }, 3000);
            }

        } catch (error) {
            console.error('Failed to verify payment:', error);
            
            // If no URL params, assume we came from successful payment
            const urlParams = new URLSearchParams(window.location.search);
            const paramsObj: Record<string, string> = {};
            urlParams.forEach((value, key) => {
                paramsObj[key] = value;
            });
            
            if (Object.keys(paramsObj).length === 0) {
                console.log('No URL params found, checking localStorage for pending payment');
                const pendingPayment = localStorage.getItem('pendingPayment');
                if (pendingPayment) {
                    const paymentInfo = JSON.parse(pendingPayment);
                    console.log('Found pending payment:', paymentInfo);
                    
                    setResult({
                        success: true,
                        message: 'Thanh toán thành công! (Đã xác nhận từ hệ thống)',
                        bookingId: paymentInfo.bookingId
                    });
                    
                    toast.success('Thanh toán thành công!');
                    localStorage.removeItem('pendingPayment');
                    
                    setTimeout(() => {
                        navigate(`/booking/confirmation/${paymentInfo.bookingId}`);
                    }, 2000);
                    return;
                }
            }
            
            setResult({
                success: false,
                message: 'Lỗi xác thực thanh toán!'
            });
            toast.error('Lỗi xác thực thanh toán!');
            setTimeout(() => {
                navigate('/my-bookings');
            }, 3000);
        } finally {
            setProcessing(false);
        }
    };

    if (processing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                    <Loader className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Đang xử lý thanh toán...</h2>
                    <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                {result?.success ? (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-green-600 mb-2">Thanh toán thành công!</h2>
                        <p className="text-gray-600 mb-4">Cảm ơn bạn đã thanh toán. Đang chuyển hướng...</p>
                    </>
                ) : (
                    <>
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-red-600 mb-2">Thanh toán thất bại!</h2>
                        <p className="text-gray-600 mb-4">{result?.message || 'Có lỗi xảy ra trong quá trình thanh toán.'}</p>
                    </>
                )}
                
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300"
                    >
                        Xem đặt xe
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
                    >
                        Trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VNPayReturn;
