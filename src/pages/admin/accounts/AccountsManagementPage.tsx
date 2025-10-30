import React, { useEffect, useMemo, useState } from 'react';
import { userAdminService, type AdminUserDTO } from '../../../service/userAdminService';
import { showErrorToast, showSuccessToast } from '../../../utils/show-toast';
import { tokenManager } from '../../../utils/token-manager';

const AccountsManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const resp = await userAdminService.getAll({ q: search || undefined, page, size });
      setUsers(resp.data || []);
      setTotal(resp.total || 0);
    } catch (e: any) {
      showErrorToast(e?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = tokenManager.getToken();
    if (!token) return; // Chỉ fetch khi đã có token
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, tokenManager.getToken()]);

  const onSearch = () => {
    setPage(0);
    fetchUsers();
  };

  const onDelete = async (u: AdminUserDTO) => {
    const ok = window.confirm(`Xóa user #${u.userId} (${u.username})?\nHành động này sẽ xóa staff/customer tương ứng.`);
    if (!ok) return;
    try {
      setLoading(true);
      await userAdminService.remove(u.userId);
      showSuccessToast('Xóa user thành công');
      await fetchUsers();
    } catch (e: any) {
      showErrorToast(e?.message || 'Xóa user thất bại');
    } finally {
      setLoading(false);
    }
  };

  const pages = useMemo(() => Math.max(1, Math.ceil(total / Math.max(1, size))), [total, size]);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Tìm kiếm</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Tên / email / số điện thoại" />
        </div>
        <button onClick={onSearch} disabled={loading} className={`h-10 px-4 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{loading ? 'Đang tải...' : 'Tìm'}</button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Roles</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.userId} className="border-b last:border-0">
                <td className="py-2 px-4 font-mono">{u.userId}</td>
                <td className="py-2 px-4">{u.username}</td>
                <td className="py-2 px-4">{u.email}</td>
                <td className="py-2 px-4">{u.phone}</td>
                <td className="py-2 px-4">{(u.roles || []).join(', ')}</td>
                <td className="py-2 px-4">{u.status}</td>
                <td className="py-2 px-4 whitespace-nowrap">{u.createdAt || ''}</td>
                <td className="py-2 px-4 text-right">
                  {/* Giữ tối giản: chỉ cần xóa theo yêu cầu trước */}
                  <button onClick={() => onDelete(u)} className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white">Xóa</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="py-4 px-4 text-gray-500" colSpan={8}>Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Tổng: {total}</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="px-3 py-1 rounded border border-gray-200 bg-white disabled:opacity-50">Trước</button>
          <div className="text-sm">Trang {page + 1} / {pages}</div>
          <button disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border border-gray-200 bg-white disabled:opacity-50">Sau</button>
        </div>
      </div>
    </div>
  );
};

export default AccountsManagementPage;
