import React from 'react';
import { AlertTriangle, Clock, DollarSign, CheckCircle } from 'lucide-react';

interface CancellationPolicyProps {
    startDate: string;
    totalPayment: number;
    onConfirm: (refundMethod: 'ONLINE' | 'DIRECT') => void;
    onCancel: () => void;
}

const CancellationPolicy: React.FC<CancellationPolicyProps> = ({
    startDate,
    totalPayment,
    onConfirm,
    onCancel
}) => {
    const calculateRefund = () => {
        const now = new Date();
        const start = new Date(startDate);
        const hoursUntilStart = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilStart >= 24) {
            return { percentage: 90, amount: Math.floor(totalPayment * 0.9) };
        } else if (hoursUntilStart >= 12) {
            return { percentage: 70, amount: Math.floor(totalPayment * 0.7) };
        } else if (hoursUntilStart >= 6) {
            return { percentage: 50, amount: Math.floor(totalPayment * 0.5) };
        } else if (hoursUntilStart >= 2) {
            return { percentage: 30, amount: Math.floor(totalPayment * 0.3) };
        } else {
            return { percentage: 0, amount: 0 };
        }
    };

    const refund = calculateRefund();
    const fee = totalPayment - refund.amount;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle className="w-8 h-8 text-orange-500" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Điều khoản hủy đặt xe</h2>
                            <p className="text-gray-600">Vui lòng đọc kỹ trước khi xác nhận hủy</p>
                        </div>
                    </div>

                    {/* Policy Details */}
                    <div className="space-y-6">
                        {/* Refund Calculation */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Thông tin hoàn tiền
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng tiền đã thanh toán:</span>
                                    <span className="font-semibold">{totalPayment.toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phí hủy ({100 - refund.percentage}%):</span>
                                    <span className="font-semibold text-red-600">-{fee.toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-600">Số tiền hoàn lại:</span>
                                    <span className="font-bold text-green-600 text-lg">
                                        {refund.amount.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Policy Rules */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Chính sách hoàn tiền theo thời gian
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Hủy trước 24h: Hoàn 90% (phí 10%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                    <span>Hủy trước 12h: Hoàn 70% (phí 30%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-yellow-500" />
                                    <span>Hủy trước 6h: Hoàn 50% (phí 50%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-orange-500" />
                                    <span>Hủy trước 2h: Hoàn 30% (phí 70%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-red-500" />
                                    <span>Hủy trong 2h: Không hoàn tiền</span>
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <h3 className="font-semibold text-yellow-800 mb-2">Lưu ý quan trọng:</h3>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• Hoàn tiền sẽ được xử lý trong 3-5 ngày làm việc</li>
                                <li>• Hoàn tiền online qua cổng thanh toán gốc</li>
                                <li>• Hoàn tiền trực tiếp tại văn phòng công ty</li>
                                <li>• Không thể hủy sau khi đã nhận xe</li>
                                <li>• Phí hủy được tính theo thời gian hủy so với giờ bắt đầu thuê</li>
                            </ul>
                        </div>

                        {/* Refund Method Selection */}
                        {refund.amount > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800">Chọn phương thức hoàn tiền:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => onConfirm('ONLINE')}
                                        className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                                    >
                                        <div className="text-center">
                                            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                            <h4 className="font-semibold text-blue-800">Hoàn tiền Online</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Hoàn về tài khoản/thẻ gốc<br/>
                                                <span className="text-blue-600">3-5 ngày làm việc</span>
                                            </p>
                                        </div>
                                    </button>
                                    {/* <button
                                        onClick={() => onConfirm('DIRECT')}
                                        className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-300"
                                    >
                                        <div className="text-center">
                                            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                            <h4 className="font-semibold text-green-800">Hoàn tiền Trực tiếp</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Nhận tiền mặt tại văn phòng<br/>
                                                <span className="text-green-600">Ngay lập tức</span>
                                            </p>
                                        </div>
                                    </button> */}
                                </div>
                            </div>
                        )}

                        {refund.amount === 0 && (
                            <div className="bg-red-50 rounded-lg p-4 text-center">
                                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-red-800 mb-2">Không thể hoàn tiền</h3>
                                <p className="text-red-700">
                                    Thời gian hủy quá gần giờ bắt đầu thuê. Bạn vẫn muốn hủy đặt xe?
                                </p>
                                <button
                                    onClick={() => onConfirm('ONLINE')}
                                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
                                >
                                    Xác nhận hủy (không hoàn tiền)
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                        >
                            Không hủy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancellationPolicy;
