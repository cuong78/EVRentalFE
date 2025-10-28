import React, { useState, useEffect } from 'react';
import { Download, Filter, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useProductPerformance } from '../../../../hooks/useProductPerformance';
import { formatCurrency } from '../../../../utils/format';
import { exportToCSV } from '../../../../utils/csv';
import type { ProductPerformanceFilter } from '../../../../types/productPerformance';

// Filter Bar Component
const FilterBar: React.FC<{
  filters: ProductPerformanceFilter;
  onFilterChange: (filters: Partial<ProductPerformanceFilter>) => void;
  onReset: () => void;
}> = ({ filters, onFilterChange, onReset }) => {
  const [dateRange, setDateRange] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'FOOD', label: 'Đồ Ăn' },
    { value: 'DRINK', label: 'Đồ Uống' },
    { value: 'COMBO', label: 'Combo' },
    { value: 'OTHER', label: 'Khác' }
  ];

  const sortOptions = [
    { value: 'productName', label: 'Tên sản phẩm' },
    { value: 'unitsSold', label: 'Số lượng bán' },
    { value: 'revenue', label: 'Doanh thu' },
    { value: 'returnRate', label: 'Tỷ lệ hoàn trả' }
  ];

  useEffect(() => {
    // Update date filters based on dateRange selection
    const now = new Date();
    let fromDate: string | undefined;
    let toDate: string | undefined;

    switch (dateRange) {
      case 'today':
        fromDate = now.toISOString().split('T')[0];
        toDate = now.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        fromDate = weekAgo.toISOString().split('T')[0];
        toDate = now.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        fromDate = monthAgo.toISOString().split('T')[0];
        toDate = now.toISOString().split('T')[0];
        break;
      case 'lastMonth':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        fromDate = lastMonthStart.toISOString().split('T')[0];
        toDate = lastMonthEnd.toISOString().split('T')[0];
        break;
      default:
        fromDate = undefined;
        toDate = undefined;
    }

    onFilterChange({ fromDate, toDate });
  }, [dateRange, onFilterChange]);

  useEffect(() => {
    // Update category filter
    onFilterChange({ category: selectedCategory === 'all' ? undefined : selectedCategory });
  }, [selectedCategory, onFilterChange]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Bộ lọc</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Khoảng thời gian
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="lastMonth">Tháng trước</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sắp xếp theo
          </label>
          <select
            value={filters.sortBy || 'unitsSold'}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thứ tự
          </label>
          <select
            value={filters.order || 'desc'}
            onChange={(e) => onFilterChange({ order: e.target.value as 'asc' | 'desc' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </div>
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

export const ProductPerformancePage: React.FC = () => {
  const {
    loading,
    products,
    filters,
    updateFilters,
    resetFilters,
    exportData,
    refresh
  } = useProductPerformance();

  const getPerformanceStatus = (product: any) => {
    if (product.topPerformer && !product.bottomPerformer) {
      return {
        label: 'Top Performer',
        className: 'bg-green-100 text-green-800'
      };
    } else if (product.topPerformer && product.bottomPerformer) {
      return {
        label: 'Bình Thường',
        className: 'bg-gray-100 text-gray-800'
      };
    } else if (!product.topPerformer && product.bottomPerformer) {
      return {
        label: 'Cần Cải Thiện',
        className: 'bg-red-100 text-red-800'
      };
    } else {
      return {
        label: 'Bình Thường',
        className: 'bg-gray-100 text-gray-800'
      };
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportData('csv');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const categories = [
    { value: 'FOOD', label: 'Đồ Ăn' },
    { value: 'DRINK', label: 'Đồ Uống' },
    { value: 'COMBO', label: 'Combo' },
    { value: 'OTHER', label: 'Khác' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Hiệu Suất Sản Phẩm
        </h1>
        <p className="text-gray-600">
          Theo dõi hiệu suất bán hàng và phân loại sản phẩm
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
      />

      {/* Export Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
        
        <button
          onClick={handleExportCSV}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Xuất CSV
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Không có dữ liệu hiệu suất sản phẩm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên Sản Phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đã Bán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh Thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tỷ Lệ Hoàn Trả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => {
                  const status = getPerformanceStatus(product);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categories.find(cat => cat.value === product.productType)?.label || product.productType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.unitsSold.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(product.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.returnRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}; 