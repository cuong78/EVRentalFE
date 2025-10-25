import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Battery, MapPin, Clock } from 'lucide-react';
import { formatNumberVN } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import LoginPopup from '../../components/auth/login/LoginPopup';
import LoginForm from '../../components/auth/login/LoginForm';
import BookingModal from '../../components/ui/rental/BookingModal';
import { vehicleService, type VehicleSearchParams, type VehicleSearchResponse } from '../../service/vehicleService';

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
    stationId?: number;
}

const VehicleDetail: React.FC = () => {
    const { name } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const vehicle: Vehicle | undefined = (location.state as any)?.vehicle;
    const [loadedVehicle, setLoadedVehicle] = useState<Vehicle | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Helper to generate emoji/icon for type name if photo not present
    const getVehicleIcon = (typeName: string): string => {
        switch ((typeName || '').toLowerCase()) {
            case 'electric motorbike': return '🏍️';
            case 'electric bicycle': return '🚲';
            case 'electric scooter': return '🛴';
            case 'electric car': return '🚗';
            default: return '🛵';
        }
    };

    const getVehicleFeatures = (typeName: string): string[] => {
        switch ((typeName || '').toLowerCase()) {
            case 'electric motorbike': return ['GPS', 'Sạc nhanh', 'Khóa thông minh'];
            case 'electric bicycle': return ['Gấp gọn', 'Nhẹ', 'Pin lâu'];
            case 'electric scooter': return ['Gấp gọn', 'Nhẹ', 'App kết nối'];
            case 'electric car': return ['Điều hòa', 'GPS', 'Bluetooth'];
            default: return ['GPS', 'Sạc nhanh'];
        }
    };

    const slugify = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // If navigated without state (from type card), load data by slug using last search
    useEffect(() => {
        if (vehicle) return; // already have full data from state
        const loadByTypeSlug = async () => {
            if (!name) return;
            let lastSearch: any = null;
            try { lastSearch = JSON.parse(sessionStorage.getItem('lastRentalSearch') || 'null'); } catch {}
            if (!lastSearch || !lastSearch.stationId || !lastSearch.pickupDate || !lastSearch.returnDate) {
                setLoadError('Vui lòng chọn thông tin tìm kiếm trước khi xem chi tiết loại xe.');
                return;
            }
            setLoading(true);
            setLoadError(null);
            try {
                const params: VehicleSearchParams = {
                    stationId: lastSearch.stationId,
                    startDate: lastSearch.pickupDate,
                    endDate: lastSearch.returnDate
                };
                const resp: VehicleSearchResponse = await vehicleService.searchVehicles(params);
                const matched = (resp.data.vehicleTypes || []).find(vt => slugify(vt.typeName) === name);
                if (!matched) {
                    setLoadError('Không tìm thấy loại xe phù hợp.');
                    return;
                }
                const firstAvailable = (matched.availableVehicles || [])[0] as any;
                const locationText = firstAvailable?.station?.address || '';
                const stationId = firstAvailable?.station?.id as number | undefined;
                const photos = firstAvailable?.photos as string | undefined;
                const vm: Vehicle = {
                    id: matched.typeId,
                    name: matched.typeName,
                    type: matched.typeName,
                    battery: 85,
                    price: matched.rentalRate.toString(),
                    image: getVehicleIcon(matched.typeName),
                    photos,
                    features: getVehicleFeatures(matched.typeName),
                    location: locationText,
                    available: (matched.availableCount || 0) > 0,
                    rating: 4.5,
                    reviews: 100,
                    depositAmount: matched.depositAmount,
                    rentalRate: matched.rentalRate,
                    stationId,
                };
                setLoadedVehicle(vm);
            } catch (e: any) {
                setLoadError(e?.message || 'Có lỗi xảy ra khi tải chi tiết loại xe.');
            } finally {
                setLoading(false);
            }
        };
        loadByTypeSlug();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name]);

    const selected = vehicle || loadedVehicle;

    if (!selected) {
        return (
            <div className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="text-center text-gray-600">Đang tải chi tiết loại xe...</div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4">Không tìm thấy thông tin xe</h2>
                        <p className="text-gray-600 mb-6">{loadError || `Không có dữ liệu chi tiết cho xe "${name}".`}</p>
                        <button onClick={() => navigate('/thue-xe')} className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-lg">Quay lại tìm kiếm</button>
                    </div>
                )}
            </div>
        );
    }

    const photoUrl = (() => {
        const src = selected.photos || (selected as any).image;
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
                                    <img src={photoUrl} alt={selected.name} className="max-h-72 object-contain" />
                                ) : (
                                    <div className="text-9xl">{(selected as any).image}</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-2">{selected.name}</h1>
                                <div className="text-xl text-green-600 font-bold mb-4">{formatNumberVN(selected.price)} <span className="text-sm text-gray-500">/ngày</span></div>
                                <p className="text-gray-600 mb-4">{selected.type} — {selected.location}</p>

                                <div className="flex gap-4 mb-6">
                                    <div className="flex items-center text-sm text-gray-600"><Battery className="w-4 h-4 mr-2 text-green-500"/>{selected.battery}% pin</div>
                                    <div className="flex items-center text-sm text-gray-600"><MapPin className="w-4 h-4 mr-2 text-blue-500"/>{selected.location}</div>
                                    <div className="flex items-center text-sm text-gray-600"><Clock className="w-4 h-4 mr-2 text-purple-500"/>Sạc nhanh</div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">Các tiện ích</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selected.features.map((f, i) => (
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
                        <div className="text-2xl font-bold text-green-600">{formatNumberVN(selected.price)}</div>
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
                id: selected.id,
                name: selected.name,
                price: selected.price,
                rentalRate: selected.rentalRate,
                depositAmount: selected.depositAmount,
                photos: selected.photos,
                image: (selected as any).image,
                location: selected.location,
                stationId: (selected as any).stationId,
            }} />
        </div>
    );
};

export default VehicleDetail;
