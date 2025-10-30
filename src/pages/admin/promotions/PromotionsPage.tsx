import React from 'react';

const PromotionsPage: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);
  const [editing, setEditing] = React.useState<number | 'new' | null>(null);

  type Promo = {
    id: number;
    code: string;
    name: string;
    type: 'PERCENT' | 'AMOUNT';
    value: number; // percent or VND
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    active: boolean;
  };

  const mockPromos = React.useMemo<Promo[]>(() => {
    const now = new Date();
    return Array.from({ length: 32 }).map((_, i) => ({
      id: i + 1,
      code: `KM${(1000 + i)}`,
      name: `Khuyến mãi ${i + 1}`,
      type: i % 2 === 0 ? 'PERCENT' : 'AMOUNT',
      value: i % 2 === 0 ? 10 + (i % 4) * 5 : 30000 + (i % 5) * 10000,
      maxDiscount: i % 2 === 0 ? 100000 : undefined,
      startDate: new Date(now.getTime() - i * 86400000).toISOString(),
      endDate: new Date(now.getTime() + (10 - (i % 10)) * 86400000).toISOString(),
      active: i % 3 !== 0,
    }));
  }, []);

  const filtered = React.useMemo(() => {
    return mockPromos.filter(p => {
      const text = `${p.code} ${p.name}`.toLowerCase();
      const okSearch = !search || text.includes(search.toLowerCase());
      const okStatus = status === 'all' || (status === 'active' ? p.active : !p.active);
      return okSearch && okStatus;
    });
  }, [mockPromos, search, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / Math.max(1, size)));
  const pageData = filtered.slice(page * size, page * size + size);

  React.useEffect(() => { setPage(0); }, [search, status, size]);

  const editingPromo = (editing && editing !== 'new') ? mockPromos.find(p => p.id === editing) || null : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Quản Lý Khuyến Mãi</h1>
        <button onClick={() => setEditing('new')} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Tạo khuyến mãi</button>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="border border-gray-200 rounded-lg px-3 py-2" placeholder="Tìm mã / tên khuyến mãi" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="border border-gray-200 rounded-lg px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
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
              <th className="py-3 px-4">Mã</th>
              <th className="py-3 px-4">Tên</th>
              <th className="py-3 px-4">Loại</th>
              <th className="py-3 px-4">Giá trị</th>
              <th className="py-3 px-4">Giảm tối đa</th>
              <th className="py-3 px-4">Bắt đầu</th>
              <th className="py-3 px-4">Kết thúc</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {pageData.map(p => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2 px-4 font-mono">{p.code}</td>
                <td className="py-2 px-4">{p.name}</td>
                <td className="py-2 px-4">{p.type === 'PERCENT' ? 'Phần trăm' : 'Số tiền'}</td>
                <td className="py-2 px-4">{p.type === 'PERCENT' ? `${p.value}%` : `${p.value.toLocaleString('vi-VN')}₫`}</td>
                <td className="py-2 px-4">{p.maxDiscount ? `${p.maxDiscount.toLocaleString('vi-VN')}₫` : '-'}</td>
                <td className="py-2 px-4 whitespace-nowrap">{new Date(p.startDate).toLocaleDateString('vi-VN')}</td>
                <td className="py-2 px-4 whitespace-nowrap">{new Date(p.endDate).toLocaleDateString('vi-VN')}</td>
                <td className="py-2 px-4">{p.active ? <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Đang hoạt động</span> : <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">Ngừng</span>}</td>
                <td className="py-2 px-4 text-right">
                  <button onClick={() => setEditing(p.id)} className="px-3 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">Sửa</button>
                </td>
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr>
                <td className="py-4 px-4 text-gray-500" colSpan={9}>Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Tổng: {filtered.length}</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="px-3 py-1 rounded border border-gray-200 bg-white disabled:opacity-50">Trước</button>
          <div className="text-sm">Trang {page + 1} / {pages}</div>
          <button disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border border-gray-200 bg-white disabled:opacity-50">Sau</button>
        </div>
      </div>

      {(editing !== null) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{editing === 'new' ? 'Tạo khuyến mãi' : `Sửa khuyến mãi ${editingPromo?.code || ''}`}</h3>
              <button onClick={() => setEditing(null)} className="px-2 py-1 text-sm rounded border">Đóng</button>
            </div>
            {/* Form stub: chỉ hiển thị thông tin, chưa submit backend */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="col-span-2">Mã
                <input className="w-full mt-1 border rounded px-2 py-1" defaultValue={editingPromo?.code || ''} />
              </label>
              <label className="col-span-2">Tên
                <input className="w-full mt-1 border rounded px-2 py-1" defaultValue={editingPromo?.name || ''} />
              </label>
              <label>Loại
                <select className="w-full mt-1 border rounded px-2 py-1" defaultValue={editingPromo?.type || 'PERCENT'}>
                  <option value="PERCENT">Phần trăm</option>
                  <option value="AMOUNT">Số tiền</option>
                </select>
              </label>
              <label>Giá trị
                <input type="number" className="w-full mt-1 border rounded px-2 py-1" defaultValue={editingPromo?.value || 0} />
              </label>
              <label className="col-span-2">Giảm tối đa (đ) (nếu loại Phần trăm)
                <input type="number" className="w-full mt-1 border rounded px-2 py-1" defaultValue={editingPromo?.maxDiscount || 0} />
              </label>
              <label>Bắt đầu
                <input type="date" className="w-full mt-1 border rounded px-2 py-1" defaultValue={editingPromo ? editingPromo.startDate.substring(0,10) : ''} />
              </label>
              <label>Kết thúc
                <input type="date" className="w-full mt-1 border rounded px-2 py-1" defaultValue={editingPromo ? editingPromo.endDate.substring(0,10) : ''} />
              </label>
            </div>
            <div className="mt-4 text-right">
              <button onClick={() => setEditing(null)} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Lưu (stub)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionsPage;
