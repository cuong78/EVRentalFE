import React from 'react';

const DocumentsManagementPage: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const [verified, setVerified] = React.useState<string>("all");
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  type DocItem = {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    identityCard: string;
    address: string;
    verified: boolean;
    createdAt: string;
  };

  const mockDocs = React.useMemo<DocItem[]>(() => {
    const now = new Date();
    return Array.from({ length: 63 }).map((_, i) => ({
      id: i + 1,
      fullName: `Khách hàng ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `09${(Math.floor(Math.random() * 1_000_0000)).toString().padStart(8, '0')}`,
      identityCard: `${(Math.floor(Math.random() * 1_000_000_000)).toString().padStart(9, '0')}`,
      address: `Số ${10 + i}, Đường ABC, Quận ${1 + (i % 10)}, TP.HCM`,
      verified: i % 3 !== 0,
      createdAt: new Date(now.getTime() - i * 86400000).toISOString(),
    }));
  }, []);

  const filtered = React.useMemo(() => {
    return mockDocs.filter((d) => {
      const text = `${d.fullName} ${d.email} ${d.phone} ${d.identityCard} ${d.address}`.toLowerCase();
      const okSearch = !search || text.includes(search.toLowerCase());
      const okVerified = verified === 'all' || (verified === 'verified' ? d.verified : !d.verified);
      return okSearch && okVerified;
    });
  }, [mockDocs, search, verified]);

  const pages = Math.max(1, Math.ceil(filtered.length / Math.max(1, size)));
  const pageData = filtered.slice(page * size, page * size + size);

  React.useEffect(() => {
    setPage(0);
  }, [search, verified, size]);

  const selected = selectedId ? mockDocs.find(d => d.id === selectedId) || null : null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Quản Lý Hồ Sơ Khách Hàng</h1>

      <div className="bg-white rounded-2xl shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="border border-gray-200 rounded-lg px-3 py-2"
            placeholder="Tìm tên / email / SĐT / CMND / địa chỉ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-200 rounded-lg px-3 py-2"
            value={verified}
            onChange={(e) => setVerified(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="verified">Đã xác minh</option>
            <option value="unverified">Chưa xác minh</option>
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
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Họ tên</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">SĐT</th>
              <th className="py-3 px-4">CMND/CCCD</th>
              <th className="py-3 px-4">Địa chỉ</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4">Ngày tạo</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((d) => (
              <tr key={d.id} className="border-b last:border-0">
                <td className="py-2 px-4 font-mono">{d.id}</td>
                <td className="py-2 px-4">{d.fullName}</td>
                <td className="py-2 px-4">{d.email}</td>
                <td className="py-2 px-4">{d.phone}</td>
                <td className="py-2 px-4">{d.identityCard}</td>
                <td className="py-2 px-4">{d.address}</td>
                <td className="py-2 px-4">{d.verified ? <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Đã xác minh</span> : <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">Chưa xác minh</span>}</td>
                <td className="py-2 px-4 whitespace-nowrap">{new Date(d.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="py-2 px-4 text-right">
                  <button onClick={() => setSelectedId(d.id)} className="px-3 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">Chi tiết</button>
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
          <button disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-3 py-1 rounded border border-gray-200 bg-white disabled:opacity-50">Trước</button>
          <div className="text-sm">Trang {page + 1} / {pages}</div>
          <button disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded border border-gray-200 bg-white disabled:opacity-50">Sau</button>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setSelectedId(null)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Chi tiết hồ sơ #{selected.id}</h3>
              <button onClick={() => setSelectedId(null)} className="px-2 py-1 text-sm rounded border">Đóng</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Họ tên</div>
                <div>{selected.fullName}</div>
              </div>
              <div>
                <div className="text-gray-500">Email</div>
                <div>{selected.email}</div>
              </div>
              <div>
                <div className="text-gray-500">SĐT</div>
                <div>{selected.phone}</div>
              </div>
              <div>
                <div className="text-gray-500">CMND/CCCD</div>
                <div>{selected.identityCard}</div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-500">Địa chỉ</div>
                <div>{selected.address}</div>
              </div>
              <div>
                <div className="text-gray-500">Trạng thái</div>
                <div>{selected.verified ? 'Đã xác minh' : 'Chưa xác minh'}</div>
              </div>
              <div>
                <div className="text-gray-500">Ngày tạo</div>
                <div>{new Date(selected.createdAt).toLocaleString('vi-VN')}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsManagementPage;
