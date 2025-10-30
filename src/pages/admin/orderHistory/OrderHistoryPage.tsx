import React from 'react';

const OrderHistoryPage: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");
  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);

  const mockData = React.useMemo(() => {
    const now = new Date();
    const list = Array.from({ length: 47 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      return {
        id: 1000 + i,
        orderCode: `RNT-${String(1000 + i).padStart(6, '0')}`,
        customer: `Khách ${i + 1}`,
        phone: `09${(Math.floor(Math.random() * 1_000_0000)).toString().padStart(8, '0')}`,
        vehicle: `Xe máy #${(i % 25) + 1}`,
        station: `Điểm #${(i % 8) + 1}`,
        startTime: new Date(d.getTime() - 1000 * 60 * 60 * (4 + (i % 8))).toISOString(),
        endTime: d.toISOString(),
        durationHours: 4 + (i % 8),
        amount: 50000 + (i % 8) * 15000,
        status: (['COMPLETED', 'CANCELED', 'ONGOING'] as const)[i % 3],
        createdAt: d.toISOString(),
      };
    });
    return list;
  }, []);

  const filtered = React.useMemo(() => {
    return mockData.filter((r) => {
      const text = `${r.orderCode} ${r.customer} ${r.phone} ${r.vehicle} ${r.station}`.toLowerCase();
      const okSearch = !search || text.includes(search.toLowerCase());
      const okStatus = status === 'all' || r.status === status;
      const okFrom = !from || new Date(r.startTime) >= new Date(from);
      const okTo = !to || new Date(r.endTime) <= new Date(to);
      return okSearch && okStatus && okFrom && okTo;
    });
  }, [mockData, search, status, from, to]);

  const pages = Math.max(1, Math.ceil(filtered.length / Math.max(1, size)));
  const pageData = filtered.slice(page * size, page * size + size);

  React.useEffect(() => {
    setPage(0);
  }, [search, status, from, to, size]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Lịch Sử Thuê Xe</h1>

      <div className="bg-white rounded-2xl shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="border border-gray-200 rounded-lg px-3 py-2"
            placeholder="Tìm mã đơn / khách / SĐT / xe / điểm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-200 rounded-lg px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ONGOING">Đang thuê</option>
            <option value="COMPLETED">Hoàn tất</option>
            <option value="CANCELED">Đã hủy</option>
          </select>
          <input
            type="datetime-local"
            className="border border-gray-200 rounded-lg px-3 py-2"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <input
            type="datetime-local"
            className="border border-gray-200 rounded-lg px-3 py-2"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Mỗi trang</label>
            <select className="border border-gray-200 rounded-lg px-2 py-2" value={size} onChange={(e) => setSize(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-3 px-4">Mã đơn</th>
              <th className="py-3 px-4">Khách</th>
              <th className="py-3 px-4">Điện thoại</th>
              <th className="py-3 px-4">Xe</th>
              <th className="py-3 px-4">Điểm</th>
              <th className="py-3 px-4">Bắt đầu</th>
              <th className="py-3 px-4">Kết thúc</th>
              <th className="py-3 px-4">Giờ</th>
              <th className="py-3 px-4">Số tiền</th>
              <th className="py-3 px-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2 px-4 font-mono">{r.orderCode}</td>
                <td className="py-2 px-4">{r.customer}</td>
                <td className="py-2 px-4">{r.phone}</td>
                <td className="py-2 px-4">{r.vehicle}</td>
                <td className="py-2 px-4">{r.station}</td>
                <td className="py-2 px-4 whitespace-nowrap">{new Date(r.startTime).toLocaleString('vi-VN')}</td>
                <td className="py-2 px-4 whitespace-nowrap">{new Date(r.endTime).toLocaleString('vi-VN')}</td>
                <td className="py-2 px-4">{r.durationHours}</td>
                <td className="py-2 px-4 text-green-600">{r.amount.toLocaleString('vi-VN')}₫</td>
                <td className="py-2 px-4">
                  {r.status === 'COMPLETED' && <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Hoàn tất</span>}
                  {r.status === 'CANCELED' && <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">Đã hủy</span>}
                  {r.status === 'ONGOING' && <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">Đang thuê</span>}
                </td>
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr>
                <td className="py-4 px-4 text-gray-500" colSpan={10}>Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Tổng: {filtered.length}</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-3 py-1 rounded border border-gray-200 bg-white disabled:opacity-50">Trước</button>
          <div className="text-sm">Trang {page + 1} / {pages}</div>
          <button disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded border border-gray-200 bg-white disabled:opacity-50">Sau</button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
