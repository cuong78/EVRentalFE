import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Battery, MapPin, Clock } from 'lucide-react';
import { formatNumberVN } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import LoginPopup from '../../components/auth/login/LoginPopup';
import LoginForm from '../../components/auth/login/LoginForm';
import BookingModal from '../../components/ui/rental/BookingModal';

interface Vehicle {
    id: number;
    name: string;
    type: string;
    battery: number;
    price: string;
    image: string;
    photos?: string;
    features: string[];
    location: string;
    available: boolean;
    rating: number;
    reviews: number;
    depositAmount?: number;
    rentalRate?: number;
}

const VehicleDetail: React.FC = () => {
    const { name } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const vehicle: Vehicle | undefined = (location.state as any)?.vehicle;

    // If no vehicle in state, show a friendly message (could fetch by name if API available)
    if (!vehicle) {
        return (
            <div className="container mx-auto px-6 py-12">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Không tìm thấy thông tin xe</h2>
                    <p className="text-gray-600 mb-6">Không có dữ liệu chi tiết cho xe "{name}". Vui lòng quay lại trang tìm kiếm và chọn xe.</p>
                    <button onClick={() => navigate('/thue-xe')} className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-lg">Quay lại tìm kiếm</button>
                </div>
            </div>
        );
    }

    const photoUrl = (() => {
        const src = vehicle.photos || (vehicle as any).image;
        if (typeof src === 'string' && (src.startsWith('http') || src.startsWith('/'))) return src;
        return '';
    })();

    const handleBookNow = () => {
        if (!user) {
            setIsLoginOpen(true);
            return;
        }
        setIsBookingOpen(true);
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl p-6 shadow">
                        <div className="flex gap-6">
                            <div className="w-1/2 flex items-center justify-center bg-gray-50 rounded-lg">
                                {photoUrl ? (
                                    <img src={photoUrl} alt={vehicle.name} className="max-h-72 object-contain" />
                                ) : (
                                    <div className="text-9xl">{(vehicle as any).image}</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-2">{vehicle.name}</h1>
                                <div className="text-xl text-green-600 font-bold mb-4">{formatNumberVN(vehicle.price)} <span className="text-sm text-gray-500">/ngày</span></div>
                                <p className="text-gray-600 mb-4">{vehicle.type} — {vehicle.location}</p>

                                <div className="flex gap-4 mb-6">
                                    <div className="flex items-center text-sm text-gray-600"><Battery className="w-4 h-4 mr-2 text-green-500"/>{vehicle.battery}% pin</div>
                                    <div className="flex items-center text-sm text-gray-600"><MapPin className="w-4 h-4 mr-2 text-blue-500"/>{vehicle.location}</div>
                                    <div className="flex items-center text-sm text-gray-600"><Clock className="w-4 h-4 mr-2 text-purple-500"/>Sạc nhanh</div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">Các tiện ích</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {vehicle.features.map((f, i) => (
                                            <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{f}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 bg-white rounded-2xl p-6 shadow">
                        <h3 className="text-xl font-bold mb-4">Điều kiện thuê xe</h3>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>Chứng minh nhân dân/CCCD hoặc Hộ chiếu còn hạn</li>
                            <li>Bằng lái hợp lệ</li>
                            <li>Đặt cọc theo mức quy định</li>
                        </ul>
                    </div>
                </div>

                <aside className="bg-white rounded-2xl p-6 shadow">
                    <div className="mb-4">
                        <div className="text-sm text-gray-500">Giá</div>
                        <div className="text-2xl font-bold text-green-600">{formatNumberVN(vehicle.price)}</div>
                        <div className="text-sm text-gray-500">/ngày</div>
                    </div>

                    <button onClick={handleBookNow} className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium mb-3">Đặt xe</button>
                    <button className="w-full border border-gray-200 text-gray-700 py-2 px-4 rounded-xl">Nhận thông tin tư vấn</button>
                </aside>
            </div>

            <LoginPopup open={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
                <LoginForm stayOnPage onSuccess={() => { setIsLoginOpen(false); setIsBookingOpen(true); }} onSwitchToRegister={() => {}} onSwitchToForgotPassword={() => {}} />
            </LoginPopup>

            <BookingModal open={isBookingOpen} onClose={() => setIsBookingOpen(false)} vehicle={{
                id: vehicle.id,
                name: vehicle.name,
                price: vehicle.price,
                rentalRate: vehicle.rentalRate,
                photos: vehicle.photos,
                image: (vehicle as any).image,
                location: vehicle.location,
            }} />
        </div>
    );
};

export default VehicleDetail;
