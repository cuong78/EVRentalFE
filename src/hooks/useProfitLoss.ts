import { useCallback, useMemo, useState } from "react";
import type { ProfitLossFilter, ProfitLossData } from "../types/profitLoss";

export function useProfitLoss() {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ProfitLossFilter>({
    filterType: "MONTH",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    quarter: 0,
  });

  // Placeholder data to satisfy UI; integrate API later if available
  const [profitLossData, setProfitLossData] = useState<ProfitLossData>({
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
    profit: false,
  });

  const updateFilters = useCallback((patch: Partial<ProfitLossFilter>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      filterType: "MONTH",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      quarter: 0,
      startDate: undefined,
      endDate: undefined,
    });
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: fetch data from API based on filters
      // setProfitLossData(await api.fetchProfitLoss(filters))
      setProfitLossData((prev) => ({ ...prev }));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const exportData = useCallback(async (format: "csv" | "excel") => {
    // TODO: call backend export; for now, just simulate
    return Promise.resolve();
  }, []);

  return useMemo(
    () => ({ loading, profitLossData, filters, updateFilters, resetFilters, exportData, refresh }),
    [loading, profitLossData, filters, updateFilters, resetFilters, exportData, refresh]
  );
}
