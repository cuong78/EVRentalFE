import React, { useState } from 'react';
import { MapPin, Battery, Car, Clock, Users, Zap, Star, CreditCard, Shield } from 'lucide-react';

const HomePage = () => {
    const [activeTab, setActiveTab] = useState('rent');

    const stations = [
        { id: 1, name: 'Điểm Thuê Q1 - Nguyễn Huệ', address: 'Đường Nguyễn Huệ, Quận 1, TP.HCM', available: 8, total: 12, distance: '0.5 km' },
        { id: 2, name: 'Điểm Thuê Q3 - Võ Văn Tần', address: 'Đường Võ Văn Tần, Quận 3, TP.HCM', available: 5, total: 10, distance: '1.2 km' },
        { id: 3, name: 'Điểm Thuê Q7 - Phú Mỹ Hưng', address: 'Khu đô thị Phú Mỹ Hưng, Quận 7, TP.HCM', available: 12, total: 15, distance: '3.8 km' }
    ];

    const vehicles = [
        { id: 1, type: 'VinFast Klara A2', battery: 85, price: '150,000đ/ngày', image: '🛵', features: ['50km tầm xa', 'Sạc nhanh', 'GPS'] },
        { id: 2, type: 'VinFast Theon S', battery: 92, price: '180,000đ/ngày', image: '🏍️', features: ['80km tầm xa', 'Chống nước IP67', 'App điều khiển'] },
        { id: 3, type: 'VinFast Evo 200', battery: 78, price: '120,000đ/ngày', image: '🛴', features: ['40km tầm xa', 'Gấp gọn', 'Nhẹ 18kg'] }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
            {/* Header */}
            <header className="bg-white shadow-lg border-b-4 border-green-500">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-xl">
                                <Zap className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">EV Station</h1>
                                <p className="text-sm text-gray-600">Thuê xe điện thông minh</p>
                            </div>
                        </div>

                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Trang chủ</a>
                            <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Điểm thuê</a>
                            <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Xe điện</a>
                            <a href="#" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Hỗ trợ</a>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <button className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
                                Đăng nhập
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
                        Thuê xe điện <span className="text-green-600">thông minh</span>
                        <br />tại điểm thuê gần nhất
                    </h2>
                    <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Hệ thống thuê xe điện hiện đại với mạng lưới điểm thuê rộng khắp TP.HCM.
                        Đặt xe nhanh chóng, nhận xe tại điểm, trả xe linh hoạt.
                    </p>

                    {/* Quick Action Tabs */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
                        <div className="flex justify-center mb-8">
                            <div className="bg-gray-100 rounded-xl p-1 flex">
                                <button
                                    onClick={() => setActiveTab('rent')}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                                        activeTab === 'rent'
                                            ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    <Car className="inline-block w-5 h-5 mr-2" />
                                    Thuê xe
                                </button>
                                <button
                                    onClick={() => setActiveTab('station')}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                                        activeTab === 'station'
                                            ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    <MapPin className="inline-block w-5 h-5 mr-2" />
                                    Tìm điểm thuê
                                </button>
                            </div>
                        </div>

                        {activeTab === 'rent' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Điểm nhận xe</label>
                                        <select className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500">
                                            <option>Chọn điểm thuê</option>
                                            {stations.map(station => (
                                                <option key={station.id} value={station.id}>{station.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày thuê</label>
                                        <input
                                            type="date"
                                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian thuê</label>
                                        <select className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500">
                                            <option>4 giờ</option>
                                            <option>8 giờ</option>
                                            <option>1 ngày</option>
                                            <option>3 ngày</option>
                                            <option>1 tuần</option>
                                        </select>
                                    </div>
                                </div>
                                <button className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                                    Tìm xe có sẵn
                                </button>
                            </div>
                        )}

                        {activeTab === 'station' && (
                            <div className="text-center">
                                <div className="bg-green-50 border-2 border-dashed border-green-200 rounded-xl p-12">
                                    <MapPin className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Bản đồ điểm thuê</h3>
                                    <p className="text-gray-600 mb-6">Tìm điểm thuê xe điện gần bạn nhất trên bản đồ tương tác</p>
                                    <button className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-8 rounded-xl font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300">
                                        Xem bản đồ
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Stations */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-gray-800 mb-4">Điểm thuê nổi bật</h3>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Mạng lưới điểm thuê rộng khắp với nhiều lựa chọn xe điện chất lượng cao
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {stations.map(station => (
                            <div key={station.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h4 className="text-xl font-semibold text-gray-800 mb-2">{station.name}</h4>
                                        <p className="text-gray-600 text-sm mb-3">{station.address}</p>
                                        <div className="flex items-center text-sm text-green-600">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {station.distance}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-700">Xe có sẵn</span>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                            <span className="font-bold text-green-600">{station.available}/{station.total}</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-200 rounded-full h-2 mb-4">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(station.available / station.total) * 100}%` }}
                                        ></div>
                                    </div>

                                    <button className="w-full border-2 border-green-500 text-green-600 py-2 px-4 rounded-xl font-medium hover:bg-green-500 hover:text-white transition-all duration-300">
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vehicle Types */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-gray-800 mb-4">Loại xe điện</h3>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Đa dạng các loại xe điện phù hợp với mọi nhu cầu di chuyển
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {vehicles.map(vehicle => (
                            <div key={vehicle.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="bg-gradient-to-br from-green-500 to-blue-600 p-8 text-center">
                                    <div className="text-6xl mb-4">{vehicle.image}</div>
                                    <h4 className="text-xl font-bold text-white mb-2">{vehicle.type}</h4>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <Battery className="w-5 h-5 text-green-500 mr-2" />
                                            <span className="font-medium text-gray-700">Pin: {vehicle.battery}%</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="text-sm text-gray-600 ml-1">4.8</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        {vehicle.features.map((feature, index) => (
                                            <div key={index} className="flex items-center text-sm text-gray-600">
                                                <div className="w-1 h-1 bg-green-500 rounded-full mr-3"></div>
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-100 pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-green-600">{vehicle.price}</span>
                                            <button className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 px-6 rounded-xl font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300">
                                                Đặt xe
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-gray-800 mb-4">Tại sao chọn EV Station?</h3>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Trải nghiệm thuê xe điện hoàn toàn mới với công nghệ tiên tiến và dịch vụ tận tâm
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center group">
                            <div className="bg-gradient-to-br from-green-500 to-blue-600 p-6 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Clock className="w-12 h-12 text-white" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">Nhanh chóng</h4>
                            <p className="text-gray-600">Đặt xe trong 30 giây, nhận xe ngay tại điểm thuê</p>
                        </div>

                        <div className="text-center group">
                            <div className="bg-gradient-to-br from-green-500 to-blue-600 p-6 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Shield className="w-12 h-12 text-white" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">An toàn</h4>
                            <p className="text-gray-600">Xe được kiểm tra kỹ thuật định kỳ, bảo hiểm đầy đủ</p>
                        </div>

                        <div className="text-center group">
                            <div className="bg-gradient-to-br from-green-500 to-blue-600 p-6 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                                <CreditCard className="w-12 h-12 text-white" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">Linh hoạt</h4>
                            <p className="text-gray-600">Thanh toán đa dạng, thuê theo giờ hoặc theo ngày</p>
                        </div>

                        <div className="text-center group">
                            <div className="bg-gradient-to-br from-green-500 to-blue-600 p-6 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-12 h-12 text-white" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">Hỗ trợ 24/7</h4>
                            <p className="text-gray-600">Nhân viên chuyên nghiệp hỗ trợ bạn mọi lúc mọi nơi</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-green-500 to-blue-600">
                <div className="container mx-auto px-6 text-center">
                    <h3 className="text-4xl font-bold text-white mb-6">
                        Bắt đầu hành trình xanh của bạn
                    </h3>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Đăng ký tài khoản ngay hôm nay và nhận ưu đãi 20% cho chuyến thuê đầu tiên
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-green-600 py-4 px-8 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                            Đăng ký miễn phí
                        </button>
                        <button className="border-2 border-white text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105">
                            Tìm hiểu thêm
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-lg">
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">EV Station</h3>
                                    <p className="text-sm text-gray-400">Thuê xe điện thông minh</p>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Hệ thống thuê xe điện hàng đầu Việt Nam với mạng lưới điểm thuê rộng khắp và dịch vụ chuyên nghiệp.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Dịch vụ</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Thuê xe điện</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Điểm thuê</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Bảo hiểm</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Hỗ trợ kỹ thuật</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Hỗ trợ</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Liên hệ</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Chính sách</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Điều khoản</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
                            <div className="space-y-2 text-sm text-gray-400">
                                <p>📞 1900 1234</p>
                                <p>✉️ support@evstation.com</p>
                                <p>📍 TP. Hồ Chí Minh, Việt Nam</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            © 2025 EV Station. Tất cả quyền được bảo lưu.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;