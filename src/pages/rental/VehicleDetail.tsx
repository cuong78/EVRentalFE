import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Battery, MapPin, Clock, Users, Zap, Gauge, Package, Car, Settings, Shield, Navigation } from 'lucide-react';
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

    // Get detailed specifications for each vehicle type
    const getVehicleSpecs = (typeName: string) => {
        const name = typeName.toLowerCase();
        
        // VinFast VF 3
        if (name.includes('vf 3') || name.includes('vf3')) {
            return {
                category: 'Minicar',
                seats: '4 chỗ',
                transmission: 'Số tự động',
                horsepower: '43 HP',
                trunk: '285L',
                range: '210km (NEDC)',
                airbags: '1 túi khí',
                limit: 'Giới hạn di chuyển 300 km/ngày'
            };
        }
        
        // VinFast VF 5
        if (name.includes('vf 5') || name.includes('vf5')) {
            return {
                category: 'A-SUV',
                seats: '5 chỗ',
                transmission: 'Số tự động',
                horsepower: '134 HP',
                trunk: '310L',
                range: '326km (NEDC)',
                airbags: '4 túi khí',
                limit: 'Giới hạn di chuyển 350 km/ngày'
            };
        }
        
        // VinFast VF 6
        if (name.includes('vf 6') || name.includes('vf6')) {
            return {
                category: 'B-SUV',
                seats: '5 chỗ',
                transmission: 'Số tự động',
                horsepower: '174 HP',
                trunk: '423L',
                range: '460km (NEDC)',
                airbags: '6 túi khí',
                limit: 'Giới hạn di chuyển 450 km/ngày'
            };
        }
        
        // VinFast VF 7
        if (name.includes('vf 7') || name.includes('vf7')) {
            return {
                category: 'C-SUV',
                seats: '5 chỗ',
                transmission: 'Số tự động',
                horsepower: '201 HP',
                trunk: '520L',
                range: '450km (NEDC)',
                airbags: '8 túi khí',
                limit: 'Giới hạn di chuyển 450 km/ngày'
            };
        }
        
        // VinFast VF 8
        if (name.includes('vf 8') || name.includes('vf8')) {
            return {
                category: 'E-SUV',
                seats: '5 chỗ',
                transmission: 'Số tự động',
                horsepower: '349 HP',
                trunk: '593L',
                range: '471km (NEDC)',
                airbags: '11 túi khí',
                limit: 'Giới hạn di chuyển 470 km/ngày'
            };
        }
        
        // VinFast VF 9
        if (name.includes('vf 9') || name.includes('vf9')) {
            return {
                category: 'E-SUV',
                seats: '7 chỗ',
                transmission: 'Số tự động',
                horsepower: '408 HP',
                trunk: '423L',
                range: '438km (NEDC)',
                airbags: '11 túi khí',
                limit: 'Giới hạn di chuyển 430 km/ngày'
            };
        }
        
        // VinFast VF e34
        if (name.includes('e34')) {
            return {
                category: 'B-SUV',
                seats: '5 chỗ',
                transmission: 'Số tự động',
                horsepower: '110 HP',
                trunk: '298L',
                range: '300km (NEDC)',
                airbags: '4 túi khí',
                limit: 'Giới hạn di chuyển 300 km/ngày'
            };
        }
        
        // Default
        return {
            category: 'Xe điện',
            seats: '2-5 chỗ',
            transmission: 'Số tự động',
            horsepower: '50+ HP',
            trunk: 'Có sẵn',
            range: '100km+',
            airbags: '2+ túi khí',
            limit: 'Giới hạn di chuyển 200 km/ngày'
        };
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

                    {/* Thông tin cần có khi nhận xe */}
                    <div className="mt-8 bg-white rounded-2xl p-6 shadow">
                        <h3 className="text-xl font-bold mb-4">Thông tin cần có khi nhận xe</h3>
                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                            <li>CCCD hoặc Hộ chiếu còn thời hạn</li>
                            <li>Bằng lái hợp lệ, còn thời hạn</li>
                        </ul>
                    </div>

                    {/* Hình thức thanh toán */}
                    <div className="mt-6 bg-white rounded-2xl p-6 shadow">
                        <h3 className="text-xl font-bold mb-4">Hình thức thanh toán</h3>
                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                            <li>Trả trước</li>
                            <li>Thời hạn thanh toán: đặt cọc giữ xe thanh toán 100% khi kí hợp đồng và nhận xe</li>
                        </ul>
                    </div>

                    {/* Chính sách đặt cọc */}
                    <div className="mt-6 bg-white rounded-2xl p-6 shadow">
                        <h3 className="text-xl font-bold mb-4">Chính sách đặt cọc (thế chân)</h3>
                        <ul className="list-disc pl-5 text-gray-700">
                            <li>
                                Khách hàng phải thanh toán số tiền cọc là{' '}
                                <span className="font-bold text-green-600">
                                    {formatNumberVN((selected.depositAmount || 0).toString())}đ
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <aside className="bg-white rounded-2xl p-6 shadow">
                    {/* Vehicle Specifications */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                        <h3 className="font-bold text-lg mb-4">Thông số kỹ thuật</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {(() => {
                                const specs = getVehicleSpecs(selected.type);
                                return (
                                    <>
                                        <div className="flex items-start">
                                            <Users className="w-4 h-4 mr-2 mt-1 text-gray-600 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{specs.seats}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <Zap className="w-4 h-4 mr-2 mt-1 text-gray-600 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{specs.range}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <Settings className="w-4 h-4 mr-2 mt-1 text-gray-600 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{specs.transmission}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <Shield className="w-4 h-4 mr-2 mt-1 text-gray-600 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{specs.airbags}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <Gauge className="w-4 h-4 mr-2 mt-1 text-gray-600 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{specs.horsepower}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <Car className="w-4 h-4 mr-2 mt-1 text-gray-600 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{specs.category}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <Package className="w-4 h-4 mr-2 mt-1 text-gray-600 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{specs.trunk}</span>
                                        </div>
                                        <div className="flex items-start col-span-2">
                                            <Navigation className="w-4 h-4 mr-2 mt-1 text-gray-600 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{specs.limit}</span>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Price and Action Buttons */}
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
