

import { 
  Users, Film, DollarSign, ShoppingCart} from 'lucide-react';
import { StatCard } from "./stat-card";
import { formatCurrency } from "../../../../utils/format";
import type { DashboardSummary } from '../../../../types/dashboard';

export function DashboardMainStats({ data }: { data: DashboardSummary }) {

console.log("DashboardMainStats data:", data);

  return (
 
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Tổng Doanh Thu"
        value={formatCurrency(data.totalRevenue ?? 0)}
        icon={DollarSign}
        color="green"
      />
      <StatCard
        title="Tổng Đơn Hàng"
        value={data.totalOrders || 0}
        icon={ShoppingCart}
        color="blue"
      />
      <StatCard
        title="Khách Hàng Hoạt Động"
        value={data.activeUsers || 0}
        icon={Users}
        color="purple"
      />
      <StatCard
        title="Phim Đang Chiếu"
        value={data.totalMovies || 0}
        icon={Film}
        color="orange"
      />
    </div>
  );
}