import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../../../utils/format";
import type { PerformanceTimeChart } from "../../../../types/dashboard";

export const ShowtimePerformanceChart = ({ data }: { data: PerformanceTimeChart }) => {
  const chartshowtimePerformancesData =
    data?.showtimePerformances?.map((item) => ({
      time: item.startTime ? item.startTime.slice(0, 5) : "N/A",
      tickets: item.totalTickets ?? 0,
      revenue: item.totalRevenue ?? 0,
    })) ?? [];
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[340px]">
      <h3 className="text-lg font-semibold mb-1">Hiệu Suất Theo Thời Gian</h3>
      <p className="text-sm text-gray-500 mb-4">Số vé bán và doanh thu theo khung giờ</p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartshowtimePerformancesData} margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" stroke="#6b7280" />
          <YAxis
            stroke="#6b7280"
            tickFormatter={(value) =>
              value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)} Tr` : value.toLocaleString("vi-VN")
            }
            width={70}
          />
          <Tooltip
            formatter={(value, name) => [
              name === "revenue" ? formatCurrency(value) : value,
              name === "revenue" ? "Doanh Thu" : "Vé Bán",
            ]}
            contentStyle={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#10B981" name="Doanh Thu" barSize={20} />
          <Bar dataKey="tickets" fill="#8b5cf6" name="Vé Bán" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
