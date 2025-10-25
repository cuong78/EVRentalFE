import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  MapPin,
  Battery,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Package,
  QrCode,
} from "lucide-react";

const AdminPage = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("today");

  // Mock data - sẽ thay bằng API thực
  const stats = {
    totalVehicles: 150,
    activeBookings: 45,
    todayRevenue: 85000000,
    totalCustomers: 1250,
    availableVehicles: 105,
    maintenanceVehicles: 8,
  };

  const recentActivities = [
    {
      id: 1,
      type: "booking",
      message: "Booking mới #BK12345 - Khách hàng Nguyễn Văn A",
      time: "5 phút trước",
      status: "success",
    },
    {
      id: 2,
      type: "return",
      message: "Xe #VH089 đã được trả - Booking #BK12340",
      time: "12 phút trước",
      status: "success",
    },
    {
      id: 3,
      type: "maintenance",
      message: "Xe #VH045 cần bảo trì định kỳ",
      time: "25 phút trước",
      status: "warning",
    },
    {
      id: 4,
      type: "payment",
      message: "Thanh toán thành công - Booking #BK12338",
      time: "1 giờ trước",
      status: "success",
    },
    {
      id: 5,
      type: "error",
      message: "Thanh toán thất bại - Booking #BK12339",
      time: "2 giờ trước",
      status: "error",
    },
  ];

  const quickStats = [
    {
      title: "Tổng số xe",
      value: stats.totalVehicles,
      icon: Car,
      color: "blue",
      subtext: `${stats.availableVehicles} xe khả dụng`,
    },
    {
      title: "Đơn đang hoạt động",
      value: stats.activeBookings,
      icon: Calendar,
      color: "green",
      subtext: "Đơn thuê đang diễn ra",
    },
    {
      title: "Doanh thu hôm nay",
      value: `${(stats.todayRevenue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: "purple",
      subtext: "VNĐ",
    },
    {
      title: "Tổng khách hàng",
      value: stats.totalCustomers,
      icon: Users,
      color: "orange",
      subtext: "Người dùng đã đăng ký",
    },
  ];

  const vehicleStatus = [
    { status: "Khả dụng", count: 105, color: "bg-green-500", percentage: 70 },
    { status: "Đang thuê", count: 37, color: "bg-blue-500", percentage: 25 },
    { status: "Bảo trì", count: 8, color: "bg-yellow-500", percentage: 5 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Hệ thống quản lý thuê xe điện</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm nay</option>
              </select>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{new Date().toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: "bg-blue-500",
              green: "bg-green-500",
              purple: "bg-purple-500",
              orange: "bg-orange-500",
            }[stat.color];

            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.subtext}</p>
                  </div>
                  <div className={`${colorClasses} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Battery className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Trạng thái xe</h3>
            </div>
            <div className="space-y-4">
              {vehicleStatus.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm font-medium text-gray-700">{item.status}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.count} xe</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tổng cộng</span>
                <span className="font-bold text-gray-900">{stats.totalVehicles} xe</span>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Xem tất cả →
              </button>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const statusConfig = {
                  success: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
                  warning: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-50" },
                  error: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
                }[activity.status];

                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`${statusConfig.bg} p-2 rounded-lg`}>
                      <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 mb-1">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button 
              onClick={() => navigate('/admin/vehicles')}
              className="flex items-center justify-center gap-2 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <Car className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-700">Quản lý xe</span>
            </button>
            <button 
              onClick={() => navigate('/admin/rental-stations')}
              className="flex items-center justify-center gap-2 p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors group"
            >
              <MapPin className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-700">Điểm thuê</span>
            </button>
            <button 
              onClick={() => navigate('/admin/vehicle-types')}
              className="flex items-center justify-center gap-2 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors group"
            >
              <Package className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-700">Loại xe</span>
            </button>
            <button 
              onClick={() => navigate('/admin/documents')}
              className="flex items-center justify-center gap-2 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors group"
            >
              <Users className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-700">Giấy tờ</span>
            </button>
            <button 
              onClick={() => navigate('/admin/qr-generator')}
              className="flex items-center justify-center gap-2 p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors group"
            >
              <QrCode className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-700">Tạo mã QR</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;

export const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-[200px] w-full">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
  </div>
);
