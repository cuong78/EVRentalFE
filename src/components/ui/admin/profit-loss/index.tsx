import React, { useState, useEffect } from "react";
import { Download, Filter, Calendar, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useProfitLoss } from "../../../../hooks/useProfitLoss";
import { formatCurrency } from "../../../../utils/format";
import type { ProfitLossFilter } from "../../../../types/profitLoss";

// Filter Bar Component
const FilterBar: React.FC<{
  filters: ProfitLossFilter;
  onFilterChange: (filters: Partial<ProfitLossFilter>) => void;
  onReset: () => void;
}> = ({ filters, onFilterChange, onReset }) => {
  const [filterType, setFilterType] = useState<string>("MONTH");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  const quarters = [
    { value: 1, label: "Quý 1" },
    { value: 2, label: "Quý 2" },
    { value: 3, label: "Quý 3" },
    { value: 4, label: "Quý 4" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year, label: `Năm ${year}` };
  });

  useEffect(() => {
    // Update filters based on filter type
    const newFilters: Partial<ProfitLossFilter> = {
      filterType: filterType as "MONTH" | "QUARTER" | "RANGE",
    };

    switch (filterType) {
      case "MONTH":
        newFilters.month = selectedMonth;
        newFilters.year = selectedYear;
        newFilters.quarter = 0;
        newFilters.startDate = undefined;
        newFilters.endDate = undefined;
        break;
      case "QUARTER":
        newFilters.quarter = selectedQuarter;
        newFilters.year = selectedYear;
        newFilters.month = 0;
        newFilters.startDate = undefined;
        newFilters.endDate = undefined;
        break;
      case "RANGE":
        newFilters.startDate = startDate;
        newFilters.endDate = endDate;
        newFilters.month = 0;
        newFilters.quarter = 0;
        newFilters.year = 0;
        break;
    }

    onFilterChange(newFilters);
  }, [filterType, selectedMonth, selectedYear, selectedQuarter, startDate, endDate, onFilterChange]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Bộ lọc</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filter Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại bộ lọc</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MONTH">Theo tháng</option>
            <option value="QUARTER">Theo quý</option>
            <option value="RANGE">Theo khoảng thời gian</option>
          </select>
        </div>

        {/* Month Filter */}
        {filterType === "MONTH" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quarter Filter */}
        {filterType === "QUARTER" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quý</label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {quarters.map((quarter) => (
                <option key={quarter.value} value={quarter.value}>
                  {quarter.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Year Filter */}
        {(filterType === "MONTH" || filterType === "QUARTER") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range Filters */}
        {filterType === "RANGE" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Đến ngày
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Đặt lại
        </button>
      </div>
    </div>
  );
};

export const ProfitLossPage: React.FC = () => {
  const { loading, profitLossData, filters, updateFilters, resetFilters, exportData, refresh } = useProfitLoss();

  const handleExportCSV = async () => {
    try {
      await exportData("csv");
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportData("excel");
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Báo Cáo Lãi/Lỗ</h1>
        <p className="text-gray-600">Theo dõi doanh thu, chi phí và lợi nhuận của rạp chiếu phim</p>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} onFilterChange={updateFilters} onReset={resetFilters} />

      {/* Export Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleExportPDF}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng Doanh Thu</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(profitLossData.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng Chi Phí</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(profitLossData.totalExpense)}</p>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lợi Nhuận Ròng</p>
              <p className={`text-2xl font-bold ${profitLossData.profit ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(profitLossData.netProfit)}
              </p>
              <p className={`text-sm font-medium ${profitLossData.profit ? "text-green-600" : "text-red-600"}`}>
                {profitLossData.profit ? "Lợi nhuận" : "Thua lỗ"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Tóm Tắt Tài Chính</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chỉ Số
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá Trị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Doanh Thu</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                    {formatCurrency(profitLossData.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Tích cực
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Chi Phí</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                    {formatCurrency(profitLossData.totalExpense)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Chi phí
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Lợi Nhuận</td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      profitLossData.profit ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(profitLossData.netProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        profitLossData.profit ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {profitLossData.profit ? "Lợi nhuận" : "Thua lỗ"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
