import { useState, useCallback } from "react";
import { dashboardService } from "../../service/dashboardService";
import type { RevenueReportDTO } from "../../types/dashboard";

export function useDashboardRevenueByProduct() {
  const [data, setData] = useState<RevenueReportDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = useCallback(async (from?: string, to?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getRevenueByProduct(from, to);
      console.log(res);
      if (res.code === 200 && res.data) {
        setData(res.data);
      } else {
        setError(res.message || "Không lấy được dữ liệu doanh thu");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchRevenue };
} 