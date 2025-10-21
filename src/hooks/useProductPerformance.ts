import { useState, useCallback, useEffect } from 'react';
import { productPerformanceService } from '../service/productPerformanceService';
import type { ProductPerformance, ProductPerformanceFilter } from '../types/productPerformance';

export const useProductPerformance = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductPerformance[]>([]);
  const [filters, setFilters] = useState<ProductPerformanceFilter>({});

  const getProductPerformance = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productPerformanceService.getProductPerformance(filters);
      
      // Kiểm tra nếu response có format {code, message, data}
      if (response.code === 200) {
        setProducts(response.data || []);
      } 
      // Kiểm tra nếu response là array trực tiếp
      else if (Array.isArray(response)) {
        setProducts(response);
      }
      // Kiểm tra nếu response.data là array
      else if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      }
      else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<ProductPerformanceFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const exportData = useCallback(async (format: 'csv' | 'excel' = 'csv') => {
    try {
      const blob = await productPerformanceService.exportProductPerformance(filters, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product-performance.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw error;
    }
  }, [filters]);

  const refresh = useCallback(() => {
    getProductPerformance();
  }, [getProductPerformance]);

  // Auto fetch khi filters thay đổi
  useEffect(() => {
    getProductPerformance();
  }, [getProductPerformance]);

  return {
    loading,
    products,
    filters,
    updateFilters,
    resetFilters,
    exportData,
    refresh
  };
}; 