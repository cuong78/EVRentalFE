import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  FileText,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Film,
  DollarSign,
  ShoppingCart,
  Star,
  Clock,
} from "lucide-react";

import { DashboardMainStats } from "../../components/ui/admin/dashboard/dashboard-main-stats";
import { formatCurrency } from "../../utils/format";
import { exportToCSV } from "../../utils/csv";
import { exportToPDF } from "../../utils/pdf";
import { DashboardSecondaryStats } from "../../components/ui/admin/dashboard/dashboard-secondary-stats";
import { SalesTrendChart } from "../../components/ui/admin/dashboard/dashboard-sales-trend-chart";
import { TopSellingMoviesChart } from "../../components/ui/admin/dashboard/dashboard-top-selling-movies-chart";
import { ShowtimePerformanceChart } from "../../components/ui/admin/dashboard/showtime-performance-chart";
import { RoomOccupancyChart } from "../../components/ui/admin/dashboard/room-occupancy-chart";
import {
  useDashboardSummary,
  useMovieRevenue,
  usePerformanceTime,
  useRevenueBooking,
  useRoomOccupancy,
} from "../../hooks/dashboard/useDashboardSocket";
import { useDashboardRevenueByProduct } from "../../hooks/dashboard/useDashboard";
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("this-month");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const summary = useDashboardSummary();
  const revenueBooking = useRevenueBooking();
  const movieRevenue = useMovieRevenue();
  const performanceTime = usePerformanceTime();
  const roomOccupancy = useRoomOccupancy();

  const {
    data: revenueByProduct,
    loading: loadingRevenue,
    error: errorRevenue,
    fetchRevenue,
  } = useDashboardRevenueByProduct();

  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showVersionDetails, setShowVersionDetails] = useState(false);
  const [expandedMovies, setExpandedMovies] = useState<Set<string>>(new Set());

  function getThisWeekRange() {
    const now = new Date();
    const day = now.getDay() || 7; // CN = 0 => 7
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return {
      from: monday.toISOString(),
      to: sunday.toISOString(),
    };
  }

  React.useEffect(() => {
    let range = getThisWeekRange();
    setFrom(range.from);
    setTo(range.to);
    fetchRevenue(range.from, range.to);
  }, [dateRange, fetchRevenue]);

  const filteredData = revenueByProduct.filter((item) => {
    const vi = (item.movieNameVi || "").toLowerCase();
    const en = (item.movieNameEn || "").toLowerCase();
    const version = (item.versionName || "").toLowerCase();
    return (
      vi.includes(search.toLowerCase()) || en.includes(search.toLowerCase()) || version.includes(search.toLowerCase())
    );
  });

  // Group data by movie name
  const groupedData = filteredData.reduce((acc, item) => {
    const movieKey = item.movieNameVi || item.movieNameEn;
    if (!acc[movieKey]) {
      acc[movieKey] = [];
    }
    acc[movieKey].push(item);
    return acc;
  }, {} as Record<string, typeof filteredData>);

  const toggleMovieExpansion = (movieKey: string) => {
    setExpandedMovies((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(movieKey)) {
        newExpanded.delete(movieKey);
      } else {
        newExpanded.add(movieKey);
      }
      return newExpanded;
    });
  };

  // Mock data for cinema management
  const mockRevenueData = [
    {
      productName: "Avengers: Endgame",
      quantitySold: 1250,
      unitPrice: 120000,
      totalRevenue: 150000000,
      category: "Action",
    },
    {
      productName: "Spider-Man: No Way Home",
      quantitySold: 980,
      unitPrice: 120000,
      totalRevenue: 117600000,
      category: "Action",
    },
    { productName: "The Batman", quantitySold: 850, unitPrice: 120000, totalRevenue: 102000000, category: "Action" },
    { productName: "Dune", quantitySold: 720, unitPrice: 120000, totalRevenue: 86400000, category: "Sci-Fi" },
    { productName: "No Time to Die", quantitySold: 650, unitPrice: 120000, totalRevenue: 78000000, category: "Action" },
    {
      productName: "Popcorn Combo",
      quantitySold: 3200,
      unitPrice: 45000,
      totalRevenue: 144000000,
      category: "Concession",
    },
    {
      productName: "Drink Large",
      quantitySold: 2800,
      unitPrice: 25000,
      totalRevenue: 70000000,
      category: "Concession",
    },
  ];

  const mockExpenseData = [
    {
      category: "Staff Salaries",
      date: "2024-01-15",
      description: "Monthly staff payment",
      amount: 45000000,
      runningBalance: 45000000,
    },
    {
      category: "Equipment Maintenance",
      date: "2024-01-20",
      description: "Projector maintenance",
      amount: 8500000,
      runningBalance: 53500000,
    },
    {
      category: "Utilities",
      date: "2024-01-25",
      description: "Electricity bill",
      amount: 12000000,
      runningBalance: 65500000,
    },
    {
      category: "Marketing",
      date: "2024-01-28",
      description: "Social media advertising",
      amount: 5000000,
      runningBalance: 70500000,
    },
    {
      category: "Concession Supplies",
      date: "2024-01-30",
      description: "Popcorn and drinks inventory",
      amount: 18000000,
      runningBalance: 88500000,
    },
  ];

  const generateLast30DaysData = () => {
    const today = new Date();
    const result = [];

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      result.push({
        date: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }), // eg. "15/07"
        revenue: Math.floor(Math.random() * 30000000) + 10000000, // 10tr - 40tr
        orders: Math.floor(Math.random() * 500) + 200, // 200 - 700 đơn
      });
    }

    return result;
  };

  const mockSalesTrendData = generateLast30DaysData();

  const mockCustomerData = [
    { customerId: "C001", name: "Nguyễn Văn A", totalOrders: 25, avgOrderValue: 180000, lastOrderDate: "2024-01-30" },
    { customerId: "C002", name: "Trần Thị B", totalOrders: 18, avgOrderValue: 220000, lastOrderDate: "2024-01-28" },
    { customerId: "C003", name: "Lê Văn C", totalOrders: 15, avgOrderValue: 150000, lastOrderDate: "2024-01-25" },
    { customerId: "C004", name: "Phạm Thị D", totalOrders: 22, avgOrderValue: 190000, lastOrderDate: "2024-01-29" },
    { customerId: "C005", name: "Hoàng Văn E", totalOrders: 12, avgOrderValue: 165000, lastOrderDate: "2024-01-20" },
  ];

  const mockOrderVolumeData = [
    { date: "2024-01-01", totalOrders: 450, fulfilled: 430, canceled: 20 },
    { date: "2024-01-02", totalOrders: 580, fulfilled: 560, canceled: 20 },
    { date: "2024-01-03", totalOrders: 510, fulfilled: 495, canceled: 15 },
    { date: "2024-01-04", totalOrders: 620, fulfilled: 600, canceled: 20 },
    { date: "2024-01-05", totalOrders: 750, fulfilled: 735, canceled: 15 },
    { date: "2024-01-06", totalOrders: 850, fulfilled: 825, canceled: 25 },
    { date: "2024-01-07", totalOrders: 920, fulfilled: 890, canceled: 30 },
  ];

  const categories = ["all", "Action", "Sci-Fi", "Drama", "Comedy", "Horror", "Concession"];

  interface FilterBarProps {
    children: React.ReactNode;
  }

  const FilterBar: React.FC<FilterBarProps> = ({ children }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-wrap gap-4 items-center">{children}</div>
    </div>
  );

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        {/* Main Stats Grid */}
        {summary ? <DashboardMainStats data={summary} /> : <LoadingSpinner />}

        {/* Secondary Stats */}
        {summary ? <DashboardSecondaryStats data={summary} /> : <LoadingSpinner />}

        {/* === Biểu đồ Doanh Thu & Đơn Hàng === */}
        {revenueBooking ? <SalesTrendChart data={revenueBooking} /> : <LoadingSpinner />}

        {/* === Top 5 Phim === */}
        {movieRevenue ? <TopSellingMoviesChart data={movieRevenue} /> : <LoadingSpinner />}

        {/* === Hiệu suất xuất chiếu === */}
        {performanceTime ? <ShowtimePerformanceChart data={performanceTime} /> : <LoadingSpinner />}

        {/* === Tỷ lệ lấp đầy phòng === */}
        {roomOccupancy ? <RoomOccupancyChart data={roomOccupancy} /> : <LoadingSpinner />}

        {/* Recent Activity */}
        {/* <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Hoạt Động Gần Đây</h3>
          <div className="space-y-4">
            {[
              { time: '2 phút trước', action: 'Đặt vé thành công', detail: 'Khách hàng Nguyễn Văn A đặt 2 vé phim "Avengers: Endgame"', status: 'success' },
              { time: '5 phút trước', action: 'Thanh toán thất bại', detail: 'Giao dịch #12345 bị từ chối', status: 'error' },
              { time: '8 phút trước', action: 'Phim mới được thêm', detail: 'Phim "The Batman" đã được thêm vào hệ thống', status: 'info' },
              { time: '12 phút trước', action: 'Khách hàng mới', detail: 'Trần Thị B đã tạo tài khoản mới', status: 'success' },
              { time: '15 phút trước', action: 'Bảo trì thiết bị', detail: 'Máy chiếu phòng 3 đã hoàn thành bảo trì', status: 'warning' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'error' ? 'bg-red-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    );
  };

  // === Báo cáo doanh thu động ===
  const renderRevenueReport = () => (
    <div className="space-y-6">
      <FilterBar>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="this-month">Tháng này</option>
            <option value="last-month">Tháng trước</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm tên phim/sản phẩm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 ml-4"
        />
        <div className="flex items-center gap-2 ml-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showVersionDetails}
              onChange={(e) => setShowVersionDetails(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Hiển thị chi tiết phiên bản
          </label>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => exportToCSV(filteredData, "revenue-report")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loadingRevenue}
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => exportToPDF("revenue-report")}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={loadingRevenue}
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </FilterBar>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Báo Cáo Doanh Thu Sản Phẩm/Phim</h3>
        </div>
        {loadingRevenue ? (
          <LoadingSpinner />
        ) : errorRevenue ? (
          <div className="p-6 text-red-600">{errorRevenue}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên Phim/Sản Phẩm
                  </th>
                  {showVersionDetails && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phiên Bản
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đã Bán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh Thu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {showVersionDetails
                  ? // Show detailed breakdown by version
                    filteredData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.movieNameVi}
                          {item.movieNameEn && <span className="text-xs text-gray-500 ml-1">({item.movieNameEn})</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.versionName || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantitySold}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {formatCurrency(Number(item.totalRevenue))}
                        </td>
                      </tr>
                    ))
                  : // Show grouped summary
                    Object.entries(groupedData).map(([movieKey, items]) => {
                      const totalQuantity = items.reduce((sum, item) => sum + item.quantitySold, 0);
                      const totalRevenue = items.reduce((sum, item) => sum + Number(item.totalRevenue), 0);
                      const hasMultipleVersions = items.length > 1;
                      const isExpanded = expandedMovies.has(movieKey);

                      return (
                        <React.Fragment key={movieKey}>
                          {/* Summary row */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center gap-2">
                                {hasMultipleVersions && (
                                  <button
                                    onClick={() => toggleMovieExpansion(movieKey)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    {isExpanded ? "▼" : "▶"}
                                  </button>
                                )}
                                {items[0].movieNameVi}
                                {items[0].movieNameEn && (
                                  <span className="text-xs text-gray-500 ml-1">({items[0].movieNameEn})</span>
                                )}
                                {hasMultipleVersions && (
                                  <span className="text-xs text-gray-500">({items.length} phiên bản)</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{totalQuantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              {formatCurrency(totalRevenue)}
                            </td>
                          </tr>

                          {/* Version detail rows when expanded */}
                          {isExpanded &&
                            hasMultipleVersions &&
                            items.map((item, index) => (
                              <tr key={`${movieKey}-${index}`} className="hover:bg-gray-50 bg-gray-25">
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 pl-8">
                                  └─ {item.movieNameVi} - {item.versionName || "Không có phiên bản"}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                  {item.quantitySold}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-green-600">
                                  {formatCurrency(Number(item.totalRevenue))}
                                </td>
                              </tr>
                            ))}
                        </React.Fragment>
                      );
                    })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tổng Doanh Thu:</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(filteredData.reduce((sum, item) => sum + Number(item.totalRevenue), 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfitLoss = () => {
    const ProfitLossPage = React.lazy(() =>
      import("../../components/ui/admin/profit-loss").then((module) => ({ default: module.ProfitLossPage }))
    );

    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <ProfitLossPage />
      </React.Suspense>
    );
  };

  const tabs = [
    { id: "overview", label: "Tổng Quan", icon: TrendingUp },
    { id: "revenue", label: "Doanh Thu", icon: DollarSign },
    // { id: 'profit-loss', label: 'Lãi/Lỗ', icon: DollarSign },
    // { id: "product", label: "Sản Phẩm", icon: Film },
  ];

  const renderAnalytics = () => (
    <div className="space-y-6">
      <FilterBar>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="daily">Theo ngày</option>
            <option value="weekly">Theo tuần</option>
            <option value="monthly">Theo tháng</option>
          </select>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => exportToCSV(mockSalesTrendData, "sales-analytics")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </FilterBar>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Xu Hướng Bán Hàng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockSalesTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Doanh Thu" />
              <Line type="monotone" dataKey="orders" stroke="#10B981" name="Đơn Hàng" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Phân Bố Theo Giờ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { hour: "10:00", orders: 45 },
                { hour: "12:00", orders: 120 },
                { hour: "14:00", orders: 85 },
                { hour: "16:00", orders: 95 },
                { hour: "18:00", orders: 150 },
                { hour: "20:00", orders: 180 },
                { hour: "22:00", orders: 90 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#8884d8" name="Đơn Hàng" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderProductPerformance = () => {
    const ProductPerformancePage = React.lazy(() =>
      import("../../components/ui/admin/product-performance").then((module) => ({
        default: module.ProductPerformancePage,
      }))
    );

    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <ProductPerformancePage />
      </React.Suspense>
    );
  };

  const renderOrderVolume = () => (
    <div className="space-y-6">
      <FilterBar>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="this-week">Tuần này</option>
            <option value="this-month">Tháng này</option>
          </select>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => exportToCSV(mockOrderVolumeData, "order-volume")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </FilterBar>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Khối Lượng Đơn Hàng</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={mockOrderVolumeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalOrders" fill="#3B82F6" name="Tổng Đơn Hàng" />
            <Bar dataKey="fulfilled" fill="#10B981" name="Hoàn Thành" />
            <Bar dataKey="canceled" fill="#EF4444" name="Hủy Bỏ" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "revenue":
        return renderRevenueReport();
      case "profit-loss":
        return renderProfitLoss();
      case "product":
        return renderProductPerformance();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Film className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Cinema Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Cập nhật: {new Date().toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 cursor-pointer border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderTabContent()}</main>
    </div>
  );
};

export default AdminPage;

export const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-[200px] w-full">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
  </div>
);
