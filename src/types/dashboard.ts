import { number } from "framer-motion";
import type { SalesTrend } from "./booking";
import type { TopSellingMovie } from "./movie";
import type { AverageRatingDashBoard } from "./rating";
import type { OccupancyRoomRate } from "./room";
import type { ShowtimePerformances } from "./showtime";

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
  topSellingMovie: TopSellingMovie[];
}

export interface PerformanceTimeChart {
  showtimePerformances: ShowtimePerformances[];
}

export interface RoomOccupancyReport {
  occupancyRate: OccupancyRoomRate;
}

