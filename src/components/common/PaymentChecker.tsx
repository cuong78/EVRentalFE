import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../service/bookingService';

const PaymentChecker: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        checkPendingPayment();
    }, []);

    const checkPendingPayment = async () => {
        const pendingPayment = localStorage.getItem('pendingPayment');
        if (!pendingPayment) return;

        try {
            const paymentInfo = JSON.parse(pendingPayment);
            const { bookingId, timestamp } = paymentInfo;

            // Check if payment was within last 10 minutes
            const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
            if (timestamp < tenMinutesAgo) {
                localStorage.removeItem('pendingPayment');
                return;
            }

            // Check booking status
            const booking = await bookingService.getBookingById(bookingId);
            
            if (booking.status === 'CONFIRMED') {
                // Payment successful
                localStorage.removeItem('pendingPayment');
                toast.success('Thanh toán thành công!');
                navigate(`/booking/confirmation/${bookingId}`);
            } else if (booking.status === 'PENDING') {
                // Still pending, show option to check again
                const shouldCheck = confirm('Có vẻ như bạn vừa thực hiện thanh toán. Bạn có muốn kiểm tra trạng thái booking không?');
                if (shouldCheck) {
                    navigate(`/booking/confirmation/${bookingId}`);
                }
                localStorage.removeItem('pendingPayment');
            }
        } catch (error) {
            console.error('Error checking payment:', error);
            localStorage.removeItem('pendingPayment');
        }
    };

    return null; // This component doesn't render anything
};

export default PaymentChecker;
