// Self-contained type definitions for dashboard
export interface SalesTrend {
  date: string;
  orders: number;
  revenue: number;
}

export interface TopSellingMovie {
  movieId?: number;
  movieNameVi: string;
  averageRating: number;
  quantityTickets: number;
  totalRevenue: number;
}

export interface AverageRatingDashBoard {
  averageRating: number;
  totalRatings: number;
}

export interface OccupancyRoomRate {
  occupancyRate: number; // overall percentage
  totalSeats: number;
  occupiedSeats: number;
  roomDetails?: Array<{
    roomName: string;
    screenType: string;
    occupancyRate: number; // percentage per room
  }>;
}

export interface ShowtimePerformances {
  startTime: string; // e.g. "14:30"
  totalTickets: number;
  totalRevenue: number;
}

interface TodayShowtimeStats {
  todayShows: number;
  peakHour: string | null;
}



export interface DashboardSummary {
  occupancyRate: OccupancyRoomRate;
  activeUsers: number;
  averageRating: AverageRatingDashBoard;
  totalOrders: number;
  totalMovies: number;
  totalRevenue: string; // BigDecimal → string
  salesTrends: SalesTrend[];
  showtimeStats: TodayShowtimeStats;
}

export interface RevenueBookingChart {
  saleTrends : SalesTrend[];
}

export interface RevenueReportDTO {
  productName: string;
  quantitySold: number; //Số Lượng Bán
  unitPrice: string; //Giá Đơn Vị
  totalRevenue: string; // quantity * unitPrice
  movieNameVi?: string;
  movieNameEn?: string;
  versionName?: string;
}



export interface MovieRevenueReport {
  // Recharts Pie expects ChartDataInput[], relax typing to be compatible
  topSellingMovie: Array<Record<string, any>>;
}

export interface PerformanceTimeChart {
  showtimePerformances: ShowtimePerformances[];
}

export interface RoomOccupancyReport {
  occupancyRate: OccupancyRoomRate;
}

