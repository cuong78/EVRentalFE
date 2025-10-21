import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Calendar, MapPin, Car, Clock, CreditCard } from 'lucide-react';
import { rentalStationService } from '../../service/rentalStationService';
import { vehicleTypeService } from '../../service/vehicleTypeService';
import { bookingService } from '../../service/bookingService';
import type { RentalStation } from '../../service/rentalStationService';
import type { VehicleType } from '../../service/vehicleTypeService';
import type { BookingRequest } from '../../service/bookingService';
import { useAuth } from '../../hooks/useAuth';

const BookingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [stations, setStations] = useState<RentalStation[]>([]);
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        stationId: '',
        typeId: '',
        startDate: '',
        endDate: '',
    });

    const [selectedStation, setSelectedStation] = useState<RentalStation | null>(null);
    const [selectedType, setSelectedType] = useState<VehicleType | null>(null);
    const [totalCost, setTotalCost] = useState(0);
    const [rentalDays, setRentalDays] = useState(0);

    // Load stations on component mount (only if user is logged in)
    useEffect(() => {
        if (!user) {
            // Don't redirect immediately - just show message
            toast.warning('Vui lòng đăng nhập để đặt xe');
            setLoading(false);
            return;
        }
        
        // User is logged in, load stations
        loadStations();
    }, [user]);

    // Load vehicle types when station and dates are selected
    useEffect(() => {
        if (formData.stationId && formData.startDate && formData.endDate) {
            loadVehicleTypes();
        }
    }, [formData.stationId, formData.startDate, formData.endDate]);

    // Calculate total cost when type or dates change
    useEffect(() => {
        if (selectedType && formData.startDate && formData.endDate) {
            calculateCost();
        }
    }, [selectedType, formData.startDate, formData.endDate]);

    const loadStations = async () => {
        try {
            setLoading(true);
            const data = await rentalStationService.getAllRentalStations();
            setStations(data);
        } catch (error: any) {
            console.error('Failed to load stations:', error);
            
            // Check if it's an authentication error
            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                // Don't navigate here - let the error handler in api.ts handle it
            } else {
                toast.error('Không thể tải danh sách điểm thuê');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadVehicleTypes = async () => {
        try {
            setLoading(true);
            const data = await vehicleTypeService.getVehicleTypesByStation(
                Number(formData.stationId),
                formData.startDate,
                formData.endDate
            );
            setVehicleTypes(data);
        } catch (error: any) {
            console.error('Failed to load vehicle types:', error);
            
            // Fallback: If by-station endpoint doesn't exist (404), load all vehicle types
            if (error.response?.status === 404) {
                try {
                    console.log('Falling back to load all vehicle types...');
                    const allTypes = await vehicleTypeService.getAllVehicleTypes();
                    setVehicleTypes(allTypes);
                    toast.info('Hiển thị tất cả loại xe có sẵn');
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                    toast.error('Không thể tải danh sách loại xe');
                }
            } else {
                toast.error('Không thể tải danh sách loại xe');
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateCost = () => {
        if (!selectedType || !formData.startDate || !formData.endDate) return;

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        if (days > 0) {
            setRentalDays(days);
            const cost = days * selectedType.rentalRate + selectedType.depositAmount;
            setTotalCost(cost);
        }
    };

    const handleStationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stationId = e.target.value;
        setFormData({ ...formData, stationId, typeId: '' });
        const station = stations.find(s => s.id === Number(stationId));
        setSelectedStation(station || null);
        setSelectedType(null);
        setVehicleTypes([]);
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const typeId = e.target.value;
        setFormData({ ...formData, typeId });
        const type = vehicleTypes.find(t => t.id === Number(typeId));
        setSelectedType(type || null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('Vui lòng đăng nhập để đặt xe');
            return;
        }

        if (!formData.stationId || !formData.typeId || !formData.startDate || !formData.endDate) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setSubmitting(true);
            
            // Helper function to get phone number
            const getUserPhone = () => {
                const possibleFields = ['phoneNumber', 'phone', 'mobile', 'telephone'];
                for (const field of possibleFields) {
                    if (user?.[field] && user[field].trim() !== '') {
                        return user[field];
                    }
                }
                return '';
            };
            
            const bookingRequest: BookingRequest = {
                stationId: Number(formData.stationId),
                typeId: Number(formData.typeId),
                startDate: new Date(formData.startDate).toISOString().split('T')[0], // Chỉ gửi YYYY-MM-DD
                endDate: new Date(formData.endDate).toISOString().split('T')[0],     // Chỉ gửi YYYY-MM-DD
                // Snapshot thông tin khách hàng tại thời điểm đặt hàng
                customerInfo: {
                    fullName: user?.fullName || user?.username || '',
                    email: user?.email || '',
                    phone: getUserPhone(), 
                    address: user?.address || ''
                }
            };

            console.log('User info:', user);
            console.log('User phoneNumber:', user?.phoneNumber);
            console.log('User phone:', user?.phone);
            console.log('All user fields:', Object.keys(user || {}));
            console.log('Customer info being sent:', bookingRequest.customerInfo);
            console.log('Submitting booking request:', bookingRequest);
            const booking = await bookingService.createBooking(bookingRequest);
            toast.success('Đặt xe thành công!');
            navigate(`/booking/confirmation/${booking.id}`);
        } catch (error: any) {
            console.error('Failed to create booking:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.message || error.message || 'Không thể đặt xe. Vui lòng thử lại.';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const isFormValid = () => {
        return formData.stationId && formData.typeId && formData.startDate && formData.endDate;
    };

    // Show login prompt if user is not logged in
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
                <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
                    <div className="bg-gradient-to-r from-green-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Car className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Đăng nhập để đặt xe
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Bạn cần đăng nhập để sử dụng dịch vụ đặt xe điện của chúng tôi
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300"
                    >
                        Về trang chủ để đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Đặt xe điện</h1>
                    <p className="text-gray-600 mb-8">Hoàn thành thông tin dưới đây để đặt xe</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Station Selection */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="w-5 h-5 mr-2 text-green-500" />
                                Điểm thuê
                            </label>
                            <select
                                value={formData.stationId}
                                onChange={handleStationChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="">-- Chọn điểm thuê --</option>
                                {stations.map(station => (
                                    <option key={station.id} value={station.id}>
                                        {station.city} - {station.address}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-5 h-5 mr-2 text-green-500" />
                                    Ngày bắt đầu
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <Clock className="w-5 h-5 mr-2 text-green-500" />
                                    Ngày kết thúc
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    min={formData.startDate || new Date().toISOString().slice(0, 16)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Vehicle Type Selection */}
                        {formData.stationId && formData.startDate && formData.endDate && (
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <Car className="w-5 h-5 mr-2 text-green-500" />
                                    Loại xe
                                </label>
                                <select
                                    value={formData.typeId}
                                    onChange={handleTypeChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                    disabled={loading || vehicleTypes.length === 0}
                                >
                                    <option value="">-- Chọn loại xe --</option>
                                    {vehicleTypes.map(type => (
                                        <option key={type.id} value={type.id}>
                                            {type.name} - {type.rentalRate.toLocaleString('vi-VN')} VNĐ/ngày
                                        </option>
                                    ))}
                                </select>
                                {vehicleTypes.length === 0 && !loading && (
                                    <p className="text-sm text-red-500 mt-2">
                                        Không có xe khả dụng cho thời gian này
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Cost Summary */}
                        {selectedType && rentalDays > 0 && (
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                                    Chi tiết giá
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Số ngày thuê:</span>
                                        <span className="font-medium">{rentalDays} ngày</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Giá thuê/ngày:</span>
                                        <span className="font-medium">{selectedType.rentalRate.toLocaleString('vi-VN')} VNĐ</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tiền cọc:</span>
                                        <span className="font-medium">{selectedType.depositAmount.toLocaleString('vi-VN')} VNĐ</span>
                                    </div>
                                    <div className="border-t border-green-200 pt-2 mt-2">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span className="text-gray-800">Tổng cộng:</span>
                                            <span className="text-green-600">{totalCost.toLocaleString('vi-VN')} VNĐ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={!isFormValid() || submitting || loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Đang đặt xe...' : 'Đặt xe ngay'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
