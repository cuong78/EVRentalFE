import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { walletService } from '../../service/walletService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';

const WalletTopupReturn: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState('Đang xác nhận nạp ví...');
    const called = useRef(false); // Prevent double-call in StrictMode
    const params = useMemo(() => {
        const p = new URLSearchParams(location.search);
        const o: Record<string, string> = {};
        p.forEach((v, k) => { o[k] = v; });
        return o;
    }, [location.search]);

    useEffect(() => {
        if (called.current) return; // Prevent double-call in StrictMode
        called.current = true;

        const run = async () => {
            try {
                const res = await walletService.topupReturn(params);
                const code = res?.statusCode ?? 200;
                if (code === 200) {
                    showSuccessToast(res?.message || 'Nạp ví thành công');
                    setMessage('Nạp ví thành công. Đang chuyển về trang hồ sơ...');
                } else {
                    throw new Error(res?.message || 'Nạp ví thất bại');
                }
            } catch (e: any) {
                const msg = e?.response?.data?.message || e?.message || 'Nạp ví thất bại';
                showErrorToast(msg);
                setMessage(msg);
            } finally {
                setTimeout(() => navigate('/ho-so?tab=profile', { replace: true }), 1200);
            }
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="container mx-auto px-6 py-12 text-center">
            <div className="bg-white rounded-2xl shadow p-8 max-w-xl mx-auto">
                <h1 className="text-2xl font-bold mb-3">Kết quả nạp ví</h1>
                <p className="text-gray-700">{message}</p>
            </div>
        </div>
    );
};

export default WalletTopupReturn;


