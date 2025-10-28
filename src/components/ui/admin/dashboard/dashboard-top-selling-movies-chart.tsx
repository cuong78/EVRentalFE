
import {
    Tooltip, Legend,
    ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { formatCurrency } from "../../../../utils/format";
import { Star } from "lucide-react";
import type { MovieRevenueReport } from '../../../../types/dashboard';

export function TopSellingMoviesChart({ data }: { data: MovieRevenueReport }) {
  console.log("TopSellingMoviesChart data:", data);
  
    return (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top 5 Phim */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[340px]">
            <h3 className="text-lg font-semibold mb-1">Top 5 Phim Bán Chạy</h3>
            <p className="text-sm text-gray-500 mb-4">Xếp hạng theo số vé và doanh thu</p>
            <div className="space-y-4">
              {data?.topSellingMovie?.map((movie, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                    }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{movie.movieNameVi}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(movie.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">{movie.averageRating.toFixed(1) || 0}</span>
                    </div>
                    <p className="text-xs text-gray-500">{movie.quantityTickets.toLocaleString()} vé</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(movie.totalRevenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tỷ lệ doanh thu của Top 5 Phim */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[340px]">
            <h3 className="text-lg font-semibold mb-1">Tỷ Lệ Doanh Thu Theo Phim</h3>
            <p className="text-sm text-gray-500 mb-4">So sánh tổng doanh thu của Top 5 phim bán chạy</p>
   <ResponsiveContainer width="100%" height={280}>
  <PieChart>
    <Pie
      data={data?.topSellingMovie}
      dataKey="totalRevenue"
      nameKey="movieNameVi"
      cx="40%"
      cy="50%"
      outerRadius={90}
      label={false}
    >
      {data?.topSellingMovie?.map((_, index) => (
        <Cell
          key={index}
          fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'][index % 5]}
        />
      ))}
    </Pie>
    <Tooltip formatter={(value: number) => formatCurrency(value)} />
    <Legend layout="vertical" verticalAlign="middle" align="right" />
  </PieChart>
</ResponsiveContainer>
          </div>


          {/* Hiệu Suất Theo Thời Gian */}

        </div>
    )

}