import React from 'react';
import { CheckCircle, Circle, Clock, Car, CreditCard, FileText, RotateCcw } from 'lucide-react';

interface BookingProgressTrackerProps {
    currentStatus: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    isFullyPaid?: boolean;
}

const BookingProgressTracker: React.FC<BookingProgressTrackerProps> = ({ 
    currentStatus, 
    isFullyPaid = false 
}) => {
    const steps = [
        {
            id: 'booking',
            title: 'Đặt xe',
            description: 'Tạo đơn đặt xe',
            icon: Car,
            status: 'completed' // Always completed if we're viewing this
        },
        {
            id: 'payment',
            title: 'Thanh toán',
            description: 'Thanh toán đặt cọc',
            icon: CreditCard,
            status: isFullyPaid ? 'completed' : 
                   currentStatus === 'PENDING' ? 'current' : 'completed'
        },
        {
            id: 'confirmed',
            title: 'Xác nhận',
            description: 'Đơn được xác nhận',
            icon: CheckCircle,
            status: currentStatus === 'PENDING' ? 'pending' :
                   currentStatus === 'CONFIRMED' ? 'current' : 
                   ['ACTIVE', 'COMPLETED'].includes(currentStatus) ? 'completed' : 'pending'
        },
        {
            id: 'pickup',
            title: 'Nhận xe',
            description: 'Nhận xe tại điểm thuê',
            icon: FileText,
            status: currentStatus === 'CONFIRMED' ? 'pending' :
                   currentStatus === 'ACTIVE' ? 'current' :
                   currentStatus === 'COMPLETED' ? 'completed' : 'pending'
        },
        {
            id: 'return',
            title: 'Trả xe',
            description: 'Trả xe và hoàn thành',
            icon: RotateCcw,
            status: currentStatus === 'COMPLETED' ? 'completed' :
                   currentStatus === 'ACTIVE' ? 'pending' : 'pending'
        }
    ];

    const getStepColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100 border-green-200';
            case 'current': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'pending': return 'text-gray-400 bg-gray-100 border-gray-200';
            default: return 'text-gray-400 bg-gray-100 border-gray-200';
        }
    };

    const getConnectorColor = (index: number) => {
        const currentStep = steps[index];
        const nextStep = steps[index + 1];
        
        if (currentStep.status === 'completed' && nextStep?.status !== 'pending') {
            return 'bg-green-400';
        }
        return 'bg-gray-300';
    };

    if (currentStatus === 'CANCELLED') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center mr-3">
                        <Circle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-medium text-red-800">Đơn đặt xe đã bị hủy</h3>
                        <p className="text-sm text-red-600">Đơn đặt xe của bạn đã được hủy</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Tiến độ đặt xe</h3>
            
            {/* Horizontal Progress Bar */}
            <div className="relative">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isLast = index === steps.length - 1;
                        
                        return (
                            <div key={step.id} className="flex flex-col items-center relative flex-1">
                                {/* Connector Line */}
                                {!isLast && (
                                    <div className={`absolute top-5 left-1/2 w-full h-0.5 ${getConnectorColor(index)} z-0`} 
                                         style={{ transform: 'translateX(50%)' }} />
                                )}
                                
                                {/* Step Circle */}
                                <div className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStepColor(step.status)} mb-3`}>
                                    {step.status === 'completed' ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : step.status === 'current' ? (
                                        <Clock className="w-5 h-5" />
                                    ) : (
                                        <Icon className="w-5 h-5" />
                                    )}
                                </div>
                                
                                {/* Step Content */}
                                <div className="text-center max-w-20">
                                    <h4 className={`font-medium text-sm ${
                                        step.status === 'completed' ? 'text-green-800' :
                                        step.status === 'current' ? 'text-blue-800' : 'text-gray-500'
                                    }`}>
                                        {step.title}
                                    </h4>
                                    <p className={`text-xs mt-1 ${
                                        step.status === 'completed' ? 'text-green-600' :
                                        step.status === 'current' ? 'text-blue-600' : 'text-gray-400'
                                    }`}>
                                        {step.description}
                                    </p>
                                    
                                    {/* Status Badge */}
                                    {step.status === 'current' && (
                                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                            Đang xử lý
                                        </span>
                                    )}
                                    {step.status === 'completed' && (
                                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                            Hoàn thành
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BookingProgressTracker;
