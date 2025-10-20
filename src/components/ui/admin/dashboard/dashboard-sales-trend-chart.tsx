import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenueBookingChart } from "../../../../types/dashboard";
import { formatCurrency } from "../../../../utils/format";

export const SalesTrendChart = ({ data }: { data: RevenueBookingChart }) => {

  
  // Giả định đổi tên trường 'orders' thành 'bookings' cho đúng
   const chartData: { date: string; bookings: number; revenue: number }[] =
  data?.saleTrends?.map((item) => ({
    date: item.date,
    bookings: item.orders ?? 0,
    revenue: item.revenue ?? 0,

  })) ?? [];

  //  const chartData = data?.salesTrends.map((item) => ({
  //   ...item,
  //   bookings: item.orders, // alias lại để biểu đồ dùng key mới
  // }));
  


  
  
    

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 select-none pointer-events-none">Doanh Thu & Lượt Đặt Vé</h3>
          <p className="text-sm text-gray-500 mt-1 select-none pointer-events-none">
            Biểu đồ thể hiện xu hướng doanh thu và lượt đặt vé theo từng ngày trong tháng
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block select-none pointer-events-none" />
            <span>Doanh thu</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block select-none pointer-events-none" />
            <span>Lượt đặt</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px]">
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                className="select-none pointer-events-none"
                dataKey="date"
                stroke="#6b7280"
                angle={-35}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                stroke="#6b7280"
                tickFormatter={(value) => `${value} lượt`}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#6b7280"
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === "revenue"
                    ? formatCurrency(value as number)
                    : `${value} lượt`,
                  name === "revenue" ? "Doanh thu" : "Lượt đặt",
                ]}
                contentStyle={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "#374151", fontWeight: 500 }}
                itemStyle={{ color: "#4b5563" }}
              />
              <Legend
                formatter={(value) =>
                  value === "revenue" ? "Doanh thu" : "Lượt đặt"
                }
                wrapperStyle={{ paddingTop: 10 }}
              />
              <Bar
                yAxisId="right"
                dataKey="revenue"
                fill="#3B82F6"
                radius={[6, 6, 0, 0]}
                animationDuration={600}
              />
              <Bar
                yAxisId="left"
                dataKey="bookings"
                fill="#10B981"
                radius={[6, 6, 0, 0]}
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
