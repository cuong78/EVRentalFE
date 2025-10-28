import { Dashboard } from "@mui/icons-material";
import type { DashboardSummary } from "../../../../types/dashboard";
import { Users, Film, Star, Clock, TrendingUp } from "lucide-react";

export function DashboardSecondaryStats({ data }: { data: DashboardSummary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tỷ Lệ Lấp Đầy</p>
            <p className="text-2xl font-bold text-gray-900">{data?.occupancyRate?.occupancyRate ?? 0}%</p>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data?.occupancyRate?.occupancyRate ?? 0}%` }}
              ></div>
            </div>
          </div>
          <div className="p-3 rounded-full bg-blue-100">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Đánh Giá Trung Bình</p>
            <div className="flex items-center mt-1">
              <p className="text-2xl font-bold text-gray-900">{data?.averageRating?.averageRating?.toFixed(1) ?? 0}</p>
              <div className="flex ml-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(data?.averageRating.averageRating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                      }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Từ {data?.averageRating.totalRatings || 0} đánh giá</p>
          </div>
          <div className="p-3 rounded-full bg-yellow-100">
            <Star className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Suất Chiếu Hôm Nay</p>
            <p className="text-2xl font-bold text-gray-900">{data?.showtimeStats?.todayShows}</p>
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>
                Cao điểm:{" "}
                {data.showtimeStats?.peakHour ? data.showtimeStats?.peakHour.slice(0, 5) : "Không có xuất chiếu"}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-full bg-indigo-100">
            <Clock className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Ghế Trống/Tổng</p>
            <p className="text-2xl font-bold text-gray-900">
              {(data?.occupancyRate?.totalSeats ?? 0) - (data?.occupancyRate?.occupiedSeats ?? 0)}/
              {data?.occupancyRate?.totalSeats ?? 0}
            </p>
            <div className="flex items-center mt-2 text-sm text-green-600">
              {/* <TrendingUp className="w-4 h-4 mr-1" /> */}
              {/* <span>+125 từ hôm qua</span> */}
            </div>
          </div>
          <div className="p-3 rounded-full bg-green-100">
            <Film className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
