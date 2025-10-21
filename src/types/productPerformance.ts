export interface ProductPerformance {
  productName: string;
  productType: 'FOOD' | 'DRINK' | 'COMBO' | 'OTHER';
  unitsSold: number;
  revenue: number;
  returnRate: number;
  topPerformer: boolean;
  bottomPerformer: boolean;
}

export interface ProductPerformanceFilter {
  fromDate?: string;
  toDate?: string;
  category?: string;
  sortBy?: 'unitsSold' | 'revenue' | 'returnRate' | 'productName';
  order?: 'asc' | 'desc';
}

export interface ProductPerformanceStats {
  totalProducts: number;
  totalRevenue: number;
  totalUnitsSold: number;
  averageReturnRate: number;
  topPerformers: number;
  bottomPerformers: number;
}

export interface ProductPerformanceResponse {
  data: ProductPerformance[];
  stats?: ProductPerformanceStats;
} 