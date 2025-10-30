export type ProfitLossFilter = {
  filterType: "MONTH" | "QUARTER" | "RANGE";
  month?: number;
  quarter?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
};

export type ProfitLossData = {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  profit: boolean;
};
