import React, { useState, useEffect, useRef } from 'react';
import { documentService } from '../../../service/documentService';
import type { Document } from '../../../service/documentService';
import { showErrorToast, showSuccessToast } from '../../../utils/show-toast';

const DocumentManagementPage: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchUserId, setSearchUserId] = useState('');
    const [searchDocId, setSearchDocId] = useState('');
    const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    
    // Edit states
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);
    const [editDocType, setEditDocType] = useState('');
    const [editDocNumber, setEditDocNumber] = useState('');
    const [editFrontPhoto, setEditFrontPhoto] = useState<File | string | null>(null);
    const [editBackPhoto, setEditBackPhoto] = useState<File | string | null>(null);
    const [editIssueDate, setEditIssueDate] = useState('');
    const [editExpiryDate, setEditExpiryDate] = useState('');
    const [editIssuedBy, setEditIssuedBy] = useState('');
    const [editIsDefault, setEditIsDefault] = useState(false);
    const editFrontPhotoInputRef = useRef<HTMLInputElement | null>(null);
    const editBackPhotoInputRef = useRef<HTMLInputElement | null>(null);

    // Load all documents on mount
    useEffect(() => {
        handleGetAllDocuments();
    }, []);

    const handleGetAllDocuments = async () => {
        try {
            setLoading(true);
            const docs = await documentService.getAll();
            setDocuments(docs);
            setSearchUserId('');
            setSearchDocId('');
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Không thể tải danh sách giấy tờ');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchDocuments = async () => {
        if (!searchUserId) {
            showErrorToast('Vui lòng nhập User ID');
            return;
        }
        try {
            setLoading(true);
            const docs = await documentService.getByUserId(Number(searchUserId));
            setDocuments(docs);
            setSearchDocId('');
            showSuccessToast(`Tìm thấy ${docs.length} giấy tờ`);
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Không tìm thấy giấy tờ');
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchByDocId = async () => {
        if (!searchDocId) {
            showErrorToast('Vui lòng nhập Document ID');
            return;
        }
        try {
            setLoading(true);
            const doc = await documentService.getById(Number(searchDocId));
            setDocuments([doc]);
            setSearchUserId('');
            showSuccessToast('Tìm thấy giấy tờ');
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Không tìm thấy giấy tờ');
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDocument = async (docId: number) => {
        try {
            setLoadingDetail(true);
            const doc = await documentService.getById(docId);
            setViewingDoc(doc);
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Không thể tải chi tiết giấy tờ');
        } finally {
            setLoadingDetail(false);
        }
    };

    const startEditDocument = (doc: Document) => {
        setEditingDoc(doc);
        setEditDocType(doc.documentType || '');
        setEditDocNumber(doc.documentNumber || '');
        setEditFrontPhoto(doc.frontPhoto || null);
        setEditBackPhoto(doc.backPhoto || null);
        setEditIssueDate(doc.issueDate || '');
        setEditExpiryDate(doc.expiryDate || '');
        setEditIssuedBy(doc.issuedBy || '');
        setEditIsDefault(doc.default || false);
        setViewingDoc(null);
    };

    const cancelEditDocument = () => {
        setEditingDoc(null);
        setEditDocType('');
        setEditDocNumber('');
        setEditFrontPhoto(null);
        setEditBackPhoto(null);
        setEditIssueDate('');
        setEditExpiryDate('');
        setEditIssuedBy('');
        setEditIsDefault(false);
    };

    const handleUpdateDocument = async () => {
        if (!editingDoc || !editDocNumber) {
            showErrorToast('Vui lòng nhập đầy đủ thông tin bắt buộc');
            return;
        }
        
        try {
            setLoading(true);
            await documentService.update(editingDoc.id!, {
                documentType: editDocType,
                documentNumber: editDocNumber,
                frontPhoto: editFrontPhoto || undefined,
                backPhoto: editBackPhoto || undefined,
                issueDate: editIssueDate || undefined,
                expiryDate: editExpiryDate || undefined,
                issuedBy: editIssuedBy || undefined,
                default: editIsDefault,
            });
            
            showSuccessToast('Cập nhật giấy tờ thành công');
            cancelEditDocument();
            
            // Refresh list
            if (searchUserId) {
                await handleSearchDocuments();
            } else if (searchDocId) {
                await handleSearchByDocId();
            } else {
                await handleGetAllDocuments();
            }
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Cập nhật giấy tờ thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDocument = async (doc: Document) => {
        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn xóa giấy tờ #${doc.id}?\n` +
            `Loại: ${doc.documentType}\n` +
            `Số: ${doc.documentNumber}\n\n` +
            `Hành động này không thể hoàn tác!`
        );
        
        if (!confirmed) return;
        
        try {
            setLoading(true);
            await documentService.delete(doc.id!);
            showSuccessToast('Xóa giấy tờ thành công');
            
            setViewingDoc(null);
            setEditingDoc(null);
            
            // Refresh list
            if (searchUserId) {
                await handleSearchDocuments();
            } else if (searchDocId) {
                setDocuments([]);
                setSearchDocId('');
            } else {
                await handleGetAllDocuments();
            }
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Xóa giấy tờ thất bại');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status?: string) => {
        const statusMap: Record<string, { bg: string; text: string; label: string }> = {
            'VERIFIED': { bg: 'bg-green-100', text: 'text-green-700', label: '✓ Đã xác minh' },
            'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '⏳ Chờ xác minh' },
            'REJECTED': { bg: 'bg-red-100', text: 'text-red-700', label: '✗ Từ chối' },
        };
        const s = statusMap[status || 'PENDING'] || statusMap['PENDING'];
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow p-6 mb-6">
                    <h1 className="text-2xl font-bold mb-2">📋 Quản Lý Hồ Sơ Khách Hàng</h1>
                    <p className="text-gray-600">Quản lý giấy tờ tùy thân của khách hàng</p>
                </div>

                {/* Search Section */}
                <div className="bg-white rounded-2xl shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">🔍 Tìm kiếm giấy tờ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="block text-sm text-gray-600 mb-1">User ID</label>
                                <input 
                                    type="number" 
                                    value={searchUserId} 
                                    onChange={(e) => setSearchUserId(e.target.value)} 
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchDocuments()}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2" 
                                    placeholder="Tìm theo User ID..."
                                />
                            </div>
                            <button 
                                onClick={handleSearchDocuments}
                                disabled={loading || !searchUserId}
                                className={`px-5 py-2 h-10 rounded-lg text-white font-semibold whitespace-nowrap ${loading || !searchUserId ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {loading ? 'Đang tìm...' : 'Tìm'}
                            </button>
                        </div>
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="block text-sm text-gray-600 mb-1">Document ID</label>
                                <input 
                                    type="number" 
                                    value={searchDocId} 
                                    onChange={(e) => setSearchDocId(e.target.value)} 
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchByDocId()}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2" 
                                    placeholder="Tìm theo Document ID..."
                                />
                            </div>
                            <button 
                                onClick={handleSearchByDocId}
                                disabled={loading || !searchDocId}
                                className={`px-5 py-2 h-10 rounded-lg text-white font-semibold whitespace-nowrap ${loading || !searchDocId ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                            >
                                {loading ? 'Đang tìm...' : 'Tìm'}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button 
                            onClick={handleGetAllDocuments}
                            disabled={loading}
                            className={`px-5 py-2 h-10 rounded-lg font-semibold border-2 ${loading ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' : 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50'}`}
                        >
                            {loading ? 'Đang tải...' : '📋 Tất cả giấy tờ'}
                        </button>
                    </div>
                </div>

                {/* Documents Table */}
                {documents.length > 0 && (
                    <div className="bg-white rounded-2xl shadow overflow-hidden">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold">Danh sách giấy tờ ({documents.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số giấy tờ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày cấp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mặc định</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {documents.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">#{doc.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{doc.userId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{doc.username || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                    {doc.documentType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{doc.documentNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{doc.issueDate || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(doc.status)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {doc.default && <span className="text-green-600 text-lg">✓</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button 
                                                    onClick={() => handleViewDocument(doc.id!)}
                                                    disabled={loadingDetail}
                                                    className={`font-medium ${loadingDetail ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 hover:underline'}`}
                                                >
                                                    {loadingDetail ? 'Đang tải...' : 'Xem chi tiết'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && documents.length === 0 && (
                    <div className="bg-white rounded-2xl shadow p-12 text-center">
                        <div className="text-6xl mb-4">📄</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có giấy tờ nào</h3>
                        <p className="text-gray-500">Sử dụng chức năng tìm kiếm hoặc tải tất cả giấy tờ</p>
                    </div>
                )}

                {/* View Detail Modal */}
                {viewingDoc && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
                                <div>
                                    <h2 className="text-2xl font-bold">Chi tiết giấy tờ #{viewingDoc.id}</h2>
                                    <p className="text-gray-600 mt-1">User ID: {viewingDoc.userId} - Username: {viewingDoc.username || 'N/A'}</p>
                                </div>
                                <button 
                                    onClick={() => setViewingDoc(null)} 
                                    className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                {/* Document info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Loại giấy tờ</div>
                                        <div className="font-semibold text-lg">
                                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                                {viewingDoc.documentType}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Số giấy tờ</div>
                                        <div className="font-semibold text-lg">{viewingDoc.documentNumber}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Ngày cấp</div>
                                        <div className="font-medium">{viewingDoc.issueDate || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Ngày hết hạn</div>
                                        <div className="font-medium">{viewingDoc.expiryDate || '-'}</div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <div className="text-sm text-gray-500 mb-1">Nơi cấp</div>
                                        <div className="font-medium">{viewingDoc.issuedBy || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Trạng thái xác minh</div>
                                        <div className="mt-1">{getStatusBadge(viewingDoc.status)}</div>
                                    </div>
                                    {viewingDoc.default && (
                                        <div>
                                            <div className="flex items-center gap-2 text-green-600 font-semibold mt-5">
                                                <span className="text-xl">✓</span>
                                                <span>Giấy tờ mặc định</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Photos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                                            <span>📄</span>
                                            <span>Mặt trước</span>
                                        </h3>
                                        {viewingDoc.frontPhoto ? (
                                            <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                                                <img 
                                                    src={viewingDoc.frontPhoto} 
                                                    alt="Mặt trước" 
                                                    className="w-full h-auto cursor-pointer hover:opacity-90"
                                                    onClick={() => window.open(viewingDoc.frontPhoto, '_blank')}
                                                />
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
                                                Không có ảnh
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                                            <span>📄</span>
                                            <span>Mặt sau</span>
                                        </h3>
                                        {viewingDoc.backPhoto ? (
                                            <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                                                <img 
                                                    src={viewingDoc.backPhoto} 
                                                    alt="Mặt sau" 
                                                    className="w-full h-auto cursor-pointer hover:opacity-90"
                                                    onClick={() => window.open(viewingDoc.backPhoto, '_blank')}
                                                />
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
                                                Không có ảnh
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Metadata */}
                                <div className="border-t pt-4">
                                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                                        <div>
                                            <span className="font-semibold">Tạo lúc:</span>{' '}
                                            {viewingDoc.createdAt ? new Date(viewingDoc.createdAt).toLocaleString('vi-VN') : '-'}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Cập nhật:</span>{' '}
                                            {viewingDoc.updatedAt ? new Date(viewingDoc.updatedAt).toLocaleString('vi-VN') : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-between gap-3">
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => startEditDocument(viewingDoc)} 
                                        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                    >
                                        ✏️ Chỉnh sửa
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteDocument(viewingDoc)}
                                        disabled={loading}
                                        className={`px-6 py-2 rounded-lg font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white`}
                                    >
                                        🗑️ Xóa
                                    </button>
                                </div>
                                <button 
                                    onClick={() => setViewingDoc(null)} 
                                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingDoc && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
                            <div className="sticky top-0 bg-white border-b p-6 z-10 rounded-t-2xl">
                                <h2 className="text-2xl font-bold">✏️ Chỉnh sửa giấy tờ #{editingDoc.id}</h2>
                                <p className="text-gray-600 mt-1">User ID: {editingDoc.userId}</p>
                            </div>
                            
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left column - Form inputs */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Loại giấy tờ</label>
                                            <select 
                                                value={editDocType} 
                                                onChange={(e) => setEditDocType(e.target.value)} 
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                                            >
                                                <option value="CMND">CMND (Chứng minh nhân dân)</option>
                                                <option value="CCCD">CCCD (Căn cước công dân)</option>
                                                <option value="PASSPORT">Hộ chiếu</option>
                                                <option value="DRIVER_LICENSE">Giấy phép lái xe</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Số giấy tờ <span className="text-red-500">*</span></label>
                                            <input 
                                                type="text" 
                                                value={editDocNumber} 
                                                onChange={(e) => setEditDocNumber(e.target.value)} 
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2" 
                                                placeholder="Nhập số giấy tờ..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Ngày cấp</label>
                                                <input 
                                                    type="date" 
                                                    value={editIssueDate} 
                                                    onChange={(e) => setEditIssueDate(e.target.value)} 
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Ngày hết hạn</label>
                                                <input 
                                                    type="date" 
                                                    value={editExpiryDate} 
                                                    onChange={(e) => setEditExpiryDate(e.target.value)} 
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2" 
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Nơi cấp</label>
                                            <input 
                                                type="text" 
                                                value={editIssuedBy} 
                                                onChange={(e) => setEditIssuedBy(e.target.value)} 
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2" 
                                                placeholder="Ví dụ: Cục Cảnh sát ĐKQL cư trú..."
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="checkbox" 
                                                id="editIsDefault"
                                                checked={editIsDefault} 
                                                onChange={(e) => setEditIsDefault(e.target.checked)} 
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor="editIsDefault" className="text-sm text-gray-700">
                                                Đặt làm giấy tờ mặc định
                                            </label>
                                        </div>
                                    </div>

                                    {/* Right column - Photo uploads */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">Ảnh mặt trước</label>
                                            <input 
                                                ref={editFrontPhotoInputRef}
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setEditFrontPhoto(file);
                                                }}
                                                className="hidden" 
                                            />
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                                                {editFrontPhoto ? (
                                                    <div className="relative">
                                                        <img 
                                                            src={editFrontPhoto instanceof File ? URL.createObjectURL(editFrontPhoto) : editFrontPhoto} 
                                                            alt="Mặt trước" 
                                                            className="w-full h-48 object-contain rounded-lg" 
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setEditFrontPhoto(null)} 
                                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                                                        >
                                                            ×
                                                        </button>
                                                        {editFrontPhoto instanceof File && (
                                                            <div className="mt-2 text-xs text-gray-600">{editFrontPhoto.name}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="text-4xl mb-2">📷</div>
                                                        <button 
                                                            type="button"
                                                            onClick={() => editFrontPhotoInputRef.current?.click()} 
                                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                                        >
                                                            📁 Chọn ảnh
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">Ảnh mặt sau</label>
                                            <input 
                                                ref={editBackPhotoInputRef}
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setEditBackPhoto(file);
                                                }}
                                                className="hidden" 
                                            />
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                                                {editBackPhoto ? (
                                                    <div className="relative">
                                                        <img 
                                                            src={editBackPhoto instanceof File ? URL.createObjectURL(editBackPhoto) : editBackPhoto} 
                                                            alt="Mặt sau" 
                                                            className="w-full h-48 object-contain rounded-lg" 
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setEditBackPhoto(null)} 
                                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                                                        >
                                                            ×
                                                        </button>
                                                        {editBackPhoto instanceof File && (
                                                            <div className="mt-2 text-xs text-gray-600">{editBackPhoto.name}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="text-4xl mb-2">📷</div>
                                                        <button 
                                                            type="button"
                                                            onClick={() => editBackPhotoInputRef.current?.click()} 
                                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                                        >
                                                            📁 Chọn ảnh
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-between gap-3">
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleDeleteDocument(editingDoc)}
                                        disabled={loading}
                                        className={`px-6 py-2 rounded-lg font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white`}
                                    >
                                        🗑️ Xóa
                                    </button>
                                    <button 
                                        onClick={cancelEditDocument}
                                        className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Hủy
                                    </button>
                                </div>
                                <button 
                                    onClick={handleUpdateDocument}
                                    disabled={loading || !editDocNumber}
                                    className={`px-6 py-2 rounded-lg text-white font-semibold ${loading || !editDocNumber ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                                >
                                    {loading ? 'Đang lưu...' : '✓ Lưu thay đổi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentManagementPage;

