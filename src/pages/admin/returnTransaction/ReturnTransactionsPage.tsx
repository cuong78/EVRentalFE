import React from 'react';

const ReturnTransactionsPage: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");
  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);

  type ReturnItem = {
    id: number;
    returnCode: string;
    orderCode: string;
    customer: string;
    phone: string;
    station: string;
    inspectedBy: string;
    penalty: number;
    refundAmount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
  };

  const mockData = React.useMemo<ReturnItem[]>(() => {
    const now = new Date();
    return Array.from({ length: 38 }).map((_, i) => ({
      id: i + 1,
      returnCode: `RET-${String(2000 + i).padStart(6, '0')}`,
      orderCode: `RNT-${String(1000 + i).padStart(6, '0')}`,
      customer: `Khách ${i + 1}`,
      phone: `09${(Math.floor(Math.random() * 1_000_0000)).toString().padStart(8, '0')}`,
      station: `Điểm #${(i % 8) + 1}`,
      inspectedBy: `NV${(i % 5) + 1}`,
      penalty: (i % 4 === 0) ? 100000 : 0,
      refundAmount: 200000 - ((i % 4 === 0) ? 100000 : 0),
      status: (['PENDING', 'APPROVED', 'REJECTED'] as const)[i % 3],
      createdAt: new Date(now.getTime() - i * 3600_000).toISOString(),
    }));
  }, []);

  const filtered = React.useMemo(() => {
    return mockData.filter((r) => {
      const text = `${r.returnCode} ${r.orderCode} ${r.customer} ${r.phone} ${r.station}`.toLowerCase();
      const okSearch = !search || text.includes(search.toLowerCase());
      const okStatus = status === 'all' || r.status === status;
      const okFrom = !from || new Date(r.createdAt) >= new Date(from);
      const okTo = !to || new Date(r.createdAt) <= new Date(to);
      return okSearch && okStatus && okFrom && okTo;
    });
  }, [mockData, search, status, from, to]);

  const pages = Math.max(1, Math.ceil(filtered.length / Math.max(1, size)));
  const pageData = filtered.slice(page * size, page * size + size);

  React.useEffect(() => { setPage(0); }, [search, status, from, to, size]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Quản Lý Hoàn Trả</h1>

      <div className="bg-white rounded-2xl shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input className="border border-gray-200 rounded-lg px-3 py-2" placeholder="Tìm mã hoàn / mã đơn / khách / SĐT / điểm"
                 value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="border border-gray-200 rounded-lg px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
          <input type="datetime-local" className="border border-gray-200 rounded-lg px-3 py-2" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="datetime-local" className="border border-gray-200 rounded-lg px-3 py-2" value={to} onChange={(e) => setTo(e.target.value)} />
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
              <th className="py-3 px-4">Mã hoàn</th>
              <th className="py-3 px-4">Mã đơn</th>
              <th className="py-3 px-4">Khách</th>
              <th className="py-3 px-4">SĐT</th>
              <th className="py-3 px-4">Điểm</th>
              <th className="py-3 px-4">Nhân viên</th>
              <th className="py-3 px-4">Phạt</th>
              <th className="py-3 px-4">Hoàn</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2 px-4 font-mono">{r.returnCode}</td>
                <td className="py-2 px-4 font-mono">{r.orderCode}</td>
                <td className="py-2 px-4">{r.customer}</td>
                <td className="py-2 px-4">{r.phone}</td>
                <td className="py-2 px-4">{r.station}</td>
                <td className="py-2 px-4">{r.inspectedBy}</td>
                <td className="py-2 px-4 text-red-600">{r.penalty.toLocaleString('vi-VN')}₫</td>
                <td className="py-2 px-4 text-green-600">{r.refundAmount.toLocaleString('vi-VN')}₫</td>
                <td className="py-2 px-4">
                  {r.status === 'PENDING' && <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">Chờ duyệt</span>}
                  {r.status === 'APPROVED' && <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Đã duyệt</span>}
                  {r.status === 'REJECTED' && <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">Từ chối</span>}
                </td>
                <td className="py-2 px-4 whitespace-nowrap">{new Date(r.createdAt).toLocaleString('vi-VN')}</td>
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

export default ReturnTransactionsPage;
