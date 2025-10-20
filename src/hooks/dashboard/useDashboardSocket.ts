import { useDashboardTopic } from "./useDashboardTopic";
import type { DashboardSummary, RevenueBookingChart, MovieRevenueReport, PerformanceTimeChart, RoomOccupancyReport } from "../../types/dashboard";
import { WSTopics } from "../../constants/websocket-topic";


export const useDashboardSummary = () =>
  useDashboardTopic<DashboardSummary>(WSTopics.SUMMARY);

export const useRevenueBooking = () =>
  useDashboardTopic<RevenueBookingChart>(WSTopics.REVENUE_BOOKING);

export const useMovieRevenue = () =>
  useDashboardTopic<MovieRevenueReport>(WSTopics.REVENUE_BY_MOVIE);

export const usePerformanceTime = () =>
  useDashboardTopic<PerformanceTimeChart>(WSTopics.PERFORMANCE_TIME);

export const useRoomOccupancy = () =>
  useDashboardTopic<RoomOccupancyReport>(WSTopics.ROOM_OCCUPANCY);
