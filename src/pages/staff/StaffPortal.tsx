import React, { useMemo, useRef, useState } from 'react';
import { bookingService, type Booking } from '../../service/bookingService';
import { vehicleService, type VehicleSearchResponse, type VehicleType } from '../../service/vehicleService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import { formatNumberVN } from '../../utils/format';
import { contractService } from '../../service/contractService';
import { useNavigate } from 'react-router-dom';
import { returnTransactionService } from '../../service/returnTransactionService';
import { documentService } from '../../service/documentService';
import jsQR from 'jsqr';

interface AvailableChoice {
    id: number;
    stationAddress: string;
    typeId: number;
    typeName: string;
    vehicleId: number;
}

const StaffPortal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'booking' | 'document'>('booking');
    const [bookingId, setBookingId] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState<Booking | null>(null);
    const [available, setAvailable] = useState<VehicleType[] | null>(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
    const [conditionNotes, setConditionNotes] = useState('');
    const navigate = useNavigate();
    const [confirmed, setConfirmed] = useState<Booking[] | null>(null);
    const [active, setActive] = useState<Booking[] | null>(null);
    const [returnBookingId, setReturnBookingId] = useState<string | null>(null);
    const [returnNotes, setReturnNotes] = useState('');
    const [returnDamageFee, setReturnDamageFee] = useState<number>(0);
    const [returnDamageFeeStr, setReturnDamageFeeStr] = useState<string>('0');
    const [cameraOpen, setCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [returnFiles, setReturnFiles] = useState<File[] | null>(null);
    
    // Document upload states
    const [docUserId, setDocUserId] = useState('');
    const [docType, setDocType] = useState('CMND');
    const [docNumber, setDocNumber] = useState('');
    const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
    const [backPhoto, setBackPhoto] = useState<File | null>(null);
    const [issueDate, setIssueDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [issuedBy, setIssuedBy] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const frontPhotoInputRef = useRef<HTMLInputElement | null>(null);
    const backPhotoInputRef = useRef<HTMLInputElement | null>(null);
    
    // Document search states
    const [searchUserId, setSearchUserId] = useState('');
    const [searchDocId, setSearchDocId] = useState('');
    const [documents, setDocuments] = useState<any[]>([]);
    const [viewingDoc, setViewingDoc] = useState<any | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    
    // Document camera states
    const [docCameraOpen, setDocCameraOpen] = useState(false);
    const [docCameraType, setDocCameraType] = useState<'front' | 'back'>('front');
    
    // Document edit states
    const [editingDoc, setEditingDoc] = useState<any | null>(null);
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

    // QR Scanner states
    const [qrScannerOpen, setQrScannerOpen] = useState(false);
    const qrVideoRef = useRef<HTMLVideoElement | null>(null);
    const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const qrStreamRef = useRef<MediaStream | null>(null);
    const qrScanIntervalRef = useRef<number | null>(null);

    const matchedType = useMemo(() => {
        if (!available || !booking) return null;
        return available.find(vt => vt.typeId === booking.typeId) || null;
    }, [available, booking]);

    const loadBooking = async () => {
        if (!bookingId) return;
        setLoading(true);
        setSelectedVehicleId(null);
        try {
            const b = await bookingService.getById(bookingId);
            setBooking(b);
            // find available vehicles by station and date
            const resp: VehicleSearchResponse = await vehicleService.searchVehicles({
                stationId: b.stationId,
                startDate: b.startDate,
                endDate: b.endDate,
            });
            setAvailable(resp.data.vehicleTypes || []);
            showSuccessToast('Đã tải đơn và danh sách xe khả dụng');
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Không thể tải đơn');
            setBooking(null);
            setAvailable(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchByPhone = async () => {
        if (!phone) {
            showErrorToast('Vui lòng nhập số điện thoại');
            return;
        }
        setLoading(true);
        setBooking(null);
        setAvailable(null);
        setConfirmed(null);
        setActive(null);
        setSelectedVehicleId(null);
        try {
            const [cList, aList] = await Promise.all([
                bookingService.getConfirmedByPhone(phone),
                bookingService.getActiveByPhone(phone)
            ]);
            setConfirmed(cList || []);
            setActive(aList || []);
            if ((cList || []).length === 0 && (aList || []).length === 0) {
                showErrorToast('Không tìm thấy đơn nào cho số điện thoại này');
            } else {
                showSuccessToast('Đã tải danh sách đơn theo số điện thoại');
            }
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Không thể tải đơn theo số điện thoại');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateContract = async () => {
        if (!booking || !selectedVehicleId) {
            showErrorToast('Vui lòng chọn một xe để tạo hợp đồng');
            return;
        }
        try {
            const contract = await contractService.create({
                bookingId: booking.id,
                vehicleId: selectedVehicleId,
                conditionNotes: conditionNotes || '',
            });
            showSuccessToast('Tạo hợp đồng thành công');
            navigate(`/contracts/print/${booking.id}`);
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Tạo hợp đồng thất bại');
        }
    };

    // Removed confirm & activate flow per latest requirement
    
    // Auto-set default based on document type
    const handleDocTypeChange = (type: string) => {
        setDocType(type);
        // CCCD is default, others are not
        setIsDefault(type === 'CCCD');
    };
    
    const handleDocumentUpload = async () => {
        if (!docUserId || !docNumber) {
            showErrorToast('Vui lòng nhập đầy đủ User ID và Số giấy tờ');
            return;
        }
        if (!frontPhoto || !backPhoto) {
            showErrorToast('Vui lòng chụp/tải lên ảnh mặt trước và mặt sau');
            return;
        }
        
        try {
            setLoading(true);
            await documentService.create({
                userId: Number(docUserId),
                documentType: docType,
                documentNumber: docNumber,
                frontPhoto,
                backPhoto,
                issueDate: issueDate || undefined,
                expiryDate: expiryDate || undefined,
                issuedBy: issuedBy || undefined,
                default: isDefault,
            });
            showSuccessToast('Upload giấy tờ thành công!');
            // Reset form
            setDocUserId('');
            setDocNumber('');
            setFrontPhoto(null);
            setBackPhoto(null);
            setIssueDate('');
            setExpiryDate('');
            setIssuedBy('');
            setIsDefault(false);
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Upload giấy tờ thất bại');
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
            if (docs.length === 0) {
                showErrorToast('Không tìm thấy giấy tờ nào');
            } else {
                showSuccessToast(`Tìm thấy ${docs.length} giấy tờ`);
            }
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Không thể tải giấy tờ');
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleGetAllDocuments = async () => {
        try {
            setLoading(true);
            const docs = await documentService.getAll();
            setDocuments(docs);
            setSearchUserId(''); // Clear search input
            if (docs.length === 0) {
                showErrorToast('Không có giấy tờ nào trong hệ thống');
            } else {
                showSuccessToast(`Tìm thấy ${docs.length} giấy tờ`);
            }
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Không thể tải giấy tờ');
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
    
    const handleSearchByDocId = async () => {
        if (!searchDocId) {
            showErrorToast('Vui lòng nhập Document ID');
            return;
        }
        try {
            setLoading(true);
            const doc = await documentService.getById(Number(searchDocId));
            setDocuments([doc]); // Hiển thị 1 document trong array
            setSearchUserId(''); // Clear user ID search
            showSuccessToast('Tìm thấy giấy tờ');
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Không tìm thấy giấy tờ');
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };
    
    const openDocCamera = async (type: 'front' | 'back') => {
        try {
            if (!('mediaDevices' in navigator)) {
                showErrorToast('Trình duyệt không hỗ trợ camera');
                return;
            }
            
            // Set type và mở modal trước
            setDocCameraType(type);
            setDocCameraOpen(true);
            
            // Đợi modal render xong rồi mới bật camera
            setTimeout(async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { 
                            facingMode: { ideal: 'environment' },
                            width: { ideal: 1280 },
                            height: { ideal: 720 }
                        },
                        audio: false
                    });
                    streamRef.current = stream;
                    
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current?.play().catch(console.error);
                        };
                    }
                } catch (err: any) {
                    showErrorToast(err?.message || 'Không mở được camera');
                    setDocCameraOpen(false);
                }
            }, 100);
        } catch (e: any) {
            showErrorToast(e?.message || 'Không mở được camera');
        }
    };
    
    const captureDocPhoto = () => {
        try {
            const video = videoRef.current;
            if (!video) return;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 1280;
            canvas.height = video.videoHeight || 720;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (!blob) return;
                const file = new File([blob], `doc-${docCameraType}-${Date.now()}.jpg`, { type: 'image/jpeg' });
                
                // Nếu đang trong edit mode thì set vào edit state
                if (editingDoc) {
                    if (docCameraType === 'front') {
                        setEditFrontPhoto(file);
                    } else {
                        setEditBackPhoto(file);
                    }
                } else {
                    // Nếu đang upload mới
                    if (docCameraType === 'front') {
                        setFrontPhoto(file);
                    } else {
                        setBackPhoto(file);
                    }
                }
                closeDocCamera();
            }, 'image/jpeg', 0.9);
        } catch (e: any) {
            showErrorToast(e?.message || 'Không chụp được ảnh');
        }
    };
    
    const closeDocCamera = () => {
        setDocCameraOpen(false);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };
    
    const startEditDocument = (doc: any) => {
        setEditingDoc(doc);
        setEditDocType(doc.documentType || '');
        setEditDocNumber(doc.documentNumber || '');
        setEditFrontPhoto(doc.frontPhoto || null);
        setEditBackPhoto(doc.backPhoto || null);
        setEditIssueDate(doc.issueDate || '');
        setEditExpiryDate(doc.expiryDate || '');
        setEditIssuedBy(doc.issuedBy || '');
        setEditIsDefault(doc.default || false);
        setViewingDoc(null); // Đóng detail modal
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
            await documentService.update(editingDoc.id, {
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
            
            // Refresh danh sách nếu đang hiển thị
            if (documents.length > 0) {
                if (searchUserId) {
                    await handleSearchDocuments();
                } else if (searchDocId) {
                    await handleSearchByDocId();
                } else {
                    await handleGetAllDocuments();
                }
            }
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Cập nhật giấy tờ thất bại');
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteDocument = async (doc: any) => {
        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn xóa giấy tờ #${doc.id}?\n` +
            `Loại: ${doc.documentType}\n` +
            `Số: ${doc.documentNumber}\n\n` +
            `Hành động này không thể hoàn tác!`
        );
        
        if (!confirmed) return;
        
        try {
            setLoading(true);
            await documentService.delete(doc.id);
            showSuccessToast('Xóa giấy tờ thành công');
            
            // Đóng modal nếu đang mở
            setViewingDoc(null);
            setEditingDoc(null);
            
            // Refresh danh sách
            if (documents.length > 0) {
                if (searchUserId) {
                    await handleSearchDocuments();
                } else if (searchDocId) {
                    setDocuments([]);
                    setSearchDocId('');
                } else {
                    await handleGetAllDocuments();
                }
            }
        } catch (e: any) {
            showErrorToast(e?.response?.data?.message || e?.message || 'Xóa giấy tờ thất bại');
        } finally {
            setLoading(false);
        }
    };

    // QR Scanner functions
    const openQrScanner = async () => {
        if (!matchedType || !matchedType.availableVehicles || matchedType.availableVehicles.length === 0) {
            showErrorToast('Không có xe khả dụng để quét');
            return;
        }

        try {
            setQrScannerOpen(true);
            
            // Đợi modal render xong
            setTimeout(async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { 
                            facingMode: { ideal: 'environment' },
                            width: { ideal: 1280 },
                            height: { ideal: 720 }
                        },
                        audio: false
                    });
                    
                    qrStreamRef.current = stream;
                    
                    if (qrVideoRef.current) {
                        qrVideoRef.current.srcObject = stream;
                        qrVideoRef.current.onloadedmetadata = () => {
                            qrVideoRef.current?.play().catch(console.error);
                            startQrScanning();
                        };
                    }
                } catch (err: any) {
                    showErrorToast(err?.message || 'Không mở được camera');
                    setQrScannerOpen(false);
                }
            }, 100);
        } catch (e: any) {
            showErrorToast(e?.message || 'Không mở được camera');
        }
    };

    const startQrScanning = () => {
        if (!qrVideoRef.current || !qrCanvasRef.current) return;

        const video = qrVideoRef.current;
        const canvas = qrCanvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;

        // Scan mỗi 300ms
        qrScanIntervalRef.current = window.setInterval(() => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = scanQRCode(imageData);
                
                if (code) {
                    handleQrCodeDetected(code);
                }
            }
        }, 300);
    };

    const scanQRCode = (imageData: ImageData): string | null => {
        try {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
            return code?.data || null;
        } catch (e) {
            console.error('QR scan error:', e);
            return null;
        }
    };

    const handleQrCodeDetected = (qrData: string) => {
        try {
            // QR data có thể là: "VEHICLE:123" hoặc chỉ là "123"
            let vehicleId: number;
            
            if (qrData.includes('VEHICLE:')) {
                vehicleId = parseInt(qrData.split('VEHICLE:')[1]);
            } else if (qrData.includes('VH')) {
                // Format: VH123
                vehicleId = parseInt(qrData.replace('VH', ''));
            } else {
                vehicleId = parseInt(qrData);
            }

            if (isNaN(vehicleId)) {
                showErrorToast('Mã QR không hợp lệ');
                return;
            }

            // Kiểm tra xe có trong danh sách khả dụng không
            const availableVehicles = matchedType?.availableVehicles || [];
            const vehicle = availableVehicles.find((v: any) => v.id === vehicleId);

            if (vehicle) {
                setSelectedVehicleId(vehicleId);
                showSuccessToast(`Đã chọn xe #${vehicleId}`);
                closeQrScanner();
            } else {
                showErrorToast(`Xe #${vehicleId} không có trong danh sách khả dụng`);
            }
        } catch (e: any) {
            showErrorToast('Không thể xử lý mã QR');
        }
    };

    const closeQrScanner = () => {
        // Stop scanning interval
        if (qrScanIntervalRef.current) {
            clearInterval(qrScanIntervalRef.current);
            qrScanIntervalRef.current = null;
        }

        // Stop camera stream
        if (qrStreamRef.current) {
            qrStreamRef.current.getTracks().forEach(track => track.stop());
            qrStreamRef.current = null;
        }

        setQrScannerOpen(false);
    };

    return (
        <div className="container mx-auto px-6 py-10">
            <h1 className="text-2xl font-bold mb-6">Cổng nhân viên</h1>
            
            {/* Tabs */}
            <div className="mb-6 flex gap-2 border-b">
                <button
                    className={`px-6 py-3 font-semibold rounded-t-lg transition-all ${activeTab === 'booking' ? 'bg-white border-t-2 border-x-2 border-blue-500 text-blue-600 -mb-px' : 'text-gray-600 hover:text-gray-800'}`}
                    onClick={() => setActiveTab('booking')}
                >
                    📋 Xử lý đơn thuê
                </button>
                <button
                    className={`px-6 py-3 font-semibold rounded-t-lg transition-all ${activeTab === 'document' ? 'bg-white border-t-2 border-x-2 border-blue-500 text-blue-600 -mb-px' : 'text-gray-600 hover:text-gray-800'}`}
                    onClick={() => setActiveTab('document')}
                >
                    📄 Upload giấy tờ
                </button>
            </div>

            {activeTab === 'booking' && (<>
            <div className="bg-white rounded-2xl shadow p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 mb-1">Số điện thoại khách hàng</label>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Nhập số điện thoại..." />
                    </div>
                    <button onClick={fetchByPhone} disabled={loading || !phone} className={`px-5 h-10 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>{loading ? 'Đang tải...' : 'Tìm đơn theo SĐT'}</button>
                </div>
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2">Đơn đã xác nhận (CONFIRMED)</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b">
                                        <th className="py-2 pr-4">Mã đơn</th>
                                        <th className="py-2 pr-4">Thời gian</th>
                                        <th className="py-2 pr-4">Tổng tiền</th>
                                        <th className="py-2 pr-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(confirmed || []).map((o) => (
                                        <tr key={o.id} className="border-b last:border-0">
                                            <td className="py-2 pr-4 font-mono">{o.id}</td>
                                            <td className="py-2 pr-4 whitespace-nowrap">{o.startDate} → {o.endDate}</td>
                                            <td className="py-2 pr-4 font-medium">{formatNumberVN(o.totalPayment || 0)}đ</td>
                                            <td className="py-2 pr-0"><button onClick={() => { setBookingId(o.id); loadBooking(); }} className="text-blue-600 hover:underline">Chọn</button></td>
                                        </tr>
                                    ))}
                                    {confirmed && confirmed.length === 0 && (<tr><td className="py-2 text-gray-500" colSpan={4}>Không có đơn đã xác nhận</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Đơn đang hoạt động (ACTIVE)</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b">
                                        <th className="py-2 pr-4">Mã đơn</th>
                                        <th className="py-2 pr-4">Thời gian</th>
                                        <th className="py-2 pr-4">Tổng tiền</th>
                                        <th className="py-2 pr-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(active || []).map((o) => (
                                        <tr key={o.id} className="border-b last:border-0">
                                            <td className="py-2 pr-4 font-mono">{o.id}</td>
                                            <td className="py-2 pr-4 whitespace-nowrap">{o.startDate} → {o.endDate}</td>
                                            <td className="py-2 pr-4 font-medium">{formatNumberVN(o.totalPayment || 0)}đ</td>
                                            <td className="py-2 pr-0"><button onClick={() => { setReturnBookingId(o.id); }} className="text-blue-600 hover:underline">Trả xe</button></td>
                                        </tr>
                                    ))}
                                    {active && active.length === 0 && (<tr><td className="py-2 text-gray-500" colSpan={4}>Không có đơn đang hoạt động</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {booking && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Thông tin đơn</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                                <div><span className="text-gray-500">Mã đơn:</span> <span className="font-mono">{booking.id}</span></div>
                                <div><span className="text-gray-500">Trạng thái:</span> <span className="font-medium">{booking.status}</span></div>
                                <div><span className="text-gray-500">Thời gian:</span> {booking.startDate} → {booking.endDate}</div>
                                <div><span className="text-gray-500">Tổng tiền:</span> {formatNumberVN(booking.totalPayment || 0)}đ</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Chọn xe cho khách (đúng loại đã đặt)</h3>
                                {matchedType && (
                                    <button 
                                        onClick={openQrScanner}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                        Quét QR
                                    </button>
                                )}
                            </div>
                            {!matchedType && <div className="text-gray-600">Không tìm thấy xe phù hợp loại đã đặt.</div>}
                            {matchedType && (
                                <div className="space-y-3">
                                    {(matchedType.availableVehicles || []).map((v: any) => (
                                        <label key={v.id} className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedVehicleId === v.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                            <input type="radio" name="vehicle" checked={selectedVehicleId === v.id} onChange={() => setSelectedVehicleId(v.id)} className="w-4 h-4 text-blue-600" />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">Xe #{v.id}</div>
                                                <div className="text-sm text-gray-600">📍 {v?.station?.address || 'Chưa có địa chỉ'}</div>
                                            </div>
                                            {selectedVehicleId === v.id && (
                                                <div className="text-blue-600 font-medium">✓</div>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow p-6">
                            <h3 className="text-lg font-semibold mb-2">Ghi chú tình trạng xe</h3>
                            <textarea value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2" rows={3} placeholder="Mô tả tình trạng, phụ kiện bàn giao, ghi chú..." />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleCreateContract} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">Tạo hợp đồng</button>
                        </div>
                    </div>

                    <aside className="bg-white rounded-2xl shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Tóm tắt</h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between"><span>Loại xe</span><span className="font-medium">{matchedType?.typeName || '-'}</span></div>
                            <div className="flex justify-between"><span>Số xe khả dụng</span><span className="font-medium">{matchedType?.availableCount ?? 0}</span></div>
                            <div className="flex justify-between"><span>Đặt cọc</span><span className="font-medium">{formatNumberVN(matchedType?.depositAmount || 0)}đ</span></div>
                            <div className="flex justify-between"><span>Đơn giá/ngày</span><span className="font-medium">{formatNumberVN(matchedType?.rentalRate || 0)}đ</span></div>
                        </div>
                    </aside>
                </div>
            )}

            {returnBookingId && (
                <div className="bg-white rounded-2xl shadow p-6 mt-8">
                    <h3 className="text-lg font-semibold mb-4">Trả xe cho đơn #{returnBookingId}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Ghi chú tình trạng</label>
                            <textarea value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2" rows={3} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Phí hư hỏng (VND)</label>
                            <input
                                type="text"
                                value={returnDamageFeeStr}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/[^\d]/g, '');
                                    const num = Number(raw || '0');
                                    setReturnDamageFee(num);
                                    setReturnDamageFeeStr(new Intl.NumberFormat('vi-VN').format(num));
                                }}
                                onBlur={() => setReturnDamageFeeStr(new Intl.NumberFormat('vi-VN').format(returnDamageFee))}
                                placeholder="0"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2" />
                            <div className="text-xs text-gray-500 mt-1">= {formatNumberVN(returnDamageFee)}đ</div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-600 mb-1">Ảnh hiện trạng (chụp hoặc tải lên)</label>
                            <div className="flex gap-3 items-center">
                                {/* Hidden native file input */}
                                <input ref={fileInputRef} id="return-photos-input" type="file" multiple accept="image/*" className="hidden" onChange={(e) => setReturnFiles(prev => {
                                    const list = e.target.files ? Array.from(e.target.files) : [];
                                    return prev ? [...prev, ...list] : list;
                                })} />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-lg border border-gray-300">Tải ảnh</button>
                                <button type="button" onClick={async () => {
                                    try {
                                        if (!('mediaDevices' in navigator)) { showErrorToast('Trình duyệt không hỗ trợ camera'); return; }
                                        
                                        // Mở modal trước
                                        setCameraOpen(true);
                                        
                                        // Đợi modal render xong rồi mới bật camera
                                        setTimeout(async () => {
                                            try {
                                                const stream = await navigator.mediaDevices.getUserMedia({ 
                                                    video: { 
                                                        facingMode: { ideal: 'environment' },
                                                        width: { ideal: 1280 },
                                                        height: { ideal: 720 }
                                                    }, 
                                                    audio: false 
                                                });
                                                streamRef.current = stream;
                                                
                                                if (videoRef.current) {
                                                    videoRef.current.srcObject = stream;
                                                    videoRef.current.onloadedmetadata = () => {
                                                        videoRef.current?.play().catch(console.error);
                                                    };
                                                }
                                            } catch (err: any) {
                                                showErrorToast(err?.message || 'Không mở được camera');
                                                setCameraOpen(false);
                                            }
                                        }, 100);
                                    } catch (e: any) {
                                        showErrorToast(e?.message || 'Không mở được camera');
                                    }
                                }} className="px-3 py-2 rounded-lg border border-gray-300">Chụp ảnh</button>
                            </div>
                            {returnFiles && returnFiles.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {returnFiles.map((f, idx) => (
                                        <div key={idx} className="relative group w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border">
                                            <img src={URL.createObjectURL(f)} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                                            <button type="button" title="Xóa ảnh" onClick={() => setReturnFiles(prev => (prev ? prev.filter((_, i) => i !== idx) : prev))} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {returnFiles && returnFiles.length > 0 && (
                                <div className="text-xs text-gray-500 mt-2">Đã chọn {returnFiles.length} ảnh</div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={async () => {
                            try {
                                setLoading(true);
                                const resp = await returnTransactionService.create({
                                    bookingId: returnBookingId,
                                    conditionNotes: returnNotes,
                                    damageFee: returnDamageFee,
                                    photos: returnFiles || undefined,
                                });
                                showSuccessToast('Trả xe thành công');
                                // show refund info if available
                                if (resp?.refundAmount != null) {
                                    showSuccessToast(`Số tiền hoàn lại: ${formatNumberVN(resp.refundAmount)}đ`);
                                }
                                setReturnBookingId(null);
                                setReturnNotes('');
                                setReturnDamageFee(0);
                                setReturnFiles(null);
                                // refresh lists
                                fetchByPhone();
                            } catch (e: any) {
                                showErrorToast(e?.response?.data?.message || e?.message || 'Trả xe thất bại');
                            } finally {
                                setLoading(false);
                            }
                        }} className={`bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg ${loading ? 'opacity-60' : ''}`}>Xác nhận trả xe</button>
                        <button onClick={() => { setReturnBookingId(null); }} className="border border-gray-200 text-gray-700 px-5 py-2 rounded-lg">Hủy</button>
                    </div>
                </div>
            )}

            {cameraOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-lg">
                        <div className="relative w-full aspect-video bg-black overflow-hidden rounded-xl">
                            <video ref={videoRef} className="w-full h-full object-cover" playsInline autoPlay muted />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={async () => {
                                try {
                                    const video = videoRef.current;
                                    if (!video) return;
                                    const canvas = document.createElement('canvas');
                                    canvas.width = video.videoWidth || 1280;
                                    canvas.height = video.videoHeight || 720;
                                    const ctx = canvas.getContext('2d');
                                    if (!ctx) return;
                                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                    canvas.toBlob((blob) => {
                                        if (!blob) return;
                                        const file = new File([blob], `return-${Date.now()}.jpg`, { type: 'image/jpeg' });
                                        setReturnFiles(prev => (prev ? [...prev, file] : [file]));
                                    }, 'image/jpeg', 0.9);
                                } catch (e: any) {
                                    showErrorToast(e?.message || 'Không chụp được ảnh');
                                }
                            }} className="bg-green-600 text-white px-4 py-2 rounded-lg">Chụp</button>
                            <button onClick={() => {
                                setCameraOpen(false);
                                if (streamRef.current) {
                                    streamRef.current.getTracks().forEach(t => t.stop());
                                    streamRef.current = null;
                                }
                            }} className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg">Đóng</button>
                        </div>
                    </div>
                </div>
            )}
            </>)}

            {activeTab === 'document' && (<>
                {/* Search documents section */}
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
                    
                    {documents.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b">
                                        <th className="py-2 pr-4">ID</th>
                                        <th className="py-2 pr-4">Loại</th>
                                        <th className="py-2 pr-4">Số giấy tờ</th>
                                        <th className="py-2 pr-4">Ngày cấp</th>
                                        <th className="py-2 pr-4">Trạng thái</th>
                                        <th className="py-2 pr-4">Mặc định</th>
                                        <th className="py-2 pr-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc: any) => (
                                        <tr key={doc.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-3 pr-4 font-mono text-gray-600">#{doc.id}</td>
                                            <td className="py-3 pr-4">
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                    {doc.documentType}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 font-medium">{doc.documentNumber}</td>
                                            <td className="py-3 pr-4 text-gray-600">{doc.issueDate || '-'}</td>
                                            <td className="py-3 pr-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 
                                                    doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {doc.status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-center">
                                                {doc.default && <span className="text-green-600 text-lg">✓</span>}
                                            </td>
                                            <td className="py-3 pr-0">
                                                <button 
                                                    onClick={() => handleViewDocument(doc.id)}
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
                    )}
                </div>

                {/* Upload form section */}
                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-xl font-semibold mb-6">📤 Upload giấy tờ mới</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left column - Form inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">User ID khách hàng <span className="text-red-500">*</span></label>
                                <input 
                                    type="number" 
                                    value={docUserId} 
                                    onChange={(e) => setDocUserId(e.target.value)} 
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2" 
                                    placeholder="Nhập User ID..."
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Loại giấy tờ <span className="text-red-500">*</span></label>
                                <select 
                                    value={docType} 
                                    onChange={(e) => handleDocTypeChange(e.target.value)} 
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                                >
                                    <option value="CMND">CMND (Chứng minh nhân dân)</option>
                                    <option value="CCCD">CCCD (Căn cước công dân)</option>
                                    <option value="PASSPORT">Hộ chiếu</option>
                                    <option value="DRIVER_LICENSE">Giấy phép lái xe</option>
                                </select>
                                {docType === 'CCCD' && (
                                    <div className="mt-1 text-xs text-green-600">✓ CCCD sẽ tự động được đặt làm giấy tờ mặc định</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Số giấy tờ <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={docNumber} 
                                    onChange={(e) => setDocNumber(e.target.value)} 
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2" 
                                    placeholder="Nhập số giấy tờ..."
                                    required 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Ngày cấp</label>
                                    <input 
                                        type="date" 
                                        value={issueDate} 
                                        onChange={(e) => setIssueDate(e.target.value)} 
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Ngày hết hạn</label>
                                    <input 
                                        type="date" 
                                        value={expiryDate} 
                                        onChange={(e) => setExpiryDate(e.target.value)} 
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Nơi cấp</label>
                                <input 
                                    type="text" 
                                    value={issuedBy} 
                                    onChange={(e) => setIssuedBy(e.target.value)} 
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2" 
                                    placeholder="Ví dụ: Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="isDefault"
                                    checked={isDefault} 
                                    onChange={(e) => setIsDefault(e.target.checked)} 
                                    className="w-4 h-4"
                                    disabled={docType === 'CCCD'}
                                />
                                <label htmlFor="isDefault" className="text-sm text-gray-700">
                                    Đặt làm giấy tờ mặc định
                                    {docType === 'CCCD' && ' (tự động)'}
                                </label>
                            </div>
                        </div>

                        {/* Right column - Photo uploads */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Ảnh mặt trước <span className="text-red-500">*</span></label>
                                <input 
                                    ref={frontPhotoInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setFrontPhoto(file);
                                    }}
                                    className="hidden" 
                                />
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                                    {frontPhoto ? (
                                        <div className="relative">
                                            <img 
                                                src={URL.createObjectURL(frontPhoto)} 
                                                alt="Mặt trước" 
                                                className="w-full h-48 object-contain rounded-lg" 
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setFrontPhoto(null)} 
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                            <div className="mt-2 text-xs text-gray-600">{frontPhoto.name}</div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-4xl mb-2">📷</div>
                                            <div className="flex gap-2 justify-center">
                                                <button 
                                                    type="button"
                                                    onClick={() => frontPhotoInputRef.current?.click()} 
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                                >
                                                    📁 Chọn ảnh
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => openDocCamera('front')} 
                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                                                >
                                                    📸 Chụp ảnh
                                                </button>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2">Chọn ảnh có sẵn hoặc chụp ảnh CMND/CCCD mặt trước</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Ảnh mặt sau <span className="text-red-500">*</span></label>
                                <input 
                                    ref={backPhotoInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setBackPhoto(file);
                                    }}
                                    className="hidden" 
                                />
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                                    {backPhoto ? (
                                        <div className="relative">
                                            <img 
                                                src={URL.createObjectURL(backPhoto)} 
                                                alt="Mặt sau" 
                                                className="w-full h-48 object-contain rounded-lg" 
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setBackPhoto(null)} 
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                            <div className="mt-2 text-xs text-gray-600">{backPhoto.name}</div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-4xl mb-2">📷</div>
                                            <div className="flex gap-2 justify-center">
                                                <button 
                                                    type="button"
                                                    onClick={() => backPhotoInputRef.current?.click()} 
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                                >
                                                    📁 Chọn ảnh
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => openDocCamera('back')} 
                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                                                >
                                                    📸 Chụp ảnh
                                                </button>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2">Chọn ảnh có sẵn hoặc chụp ảnh CMND/CCCD mặt sau</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button 
                            onClick={handleDocumentUpload}
                            disabled={loading || !docUserId || !docNumber || !frontPhoto || !backPhoto}
                            className={`px-6 py-3 rounded-lg text-white font-semibold ${loading || !docUserId || !docNumber || !frontPhoto || !backPhoto ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {loading ? 'Đang upload...' : '✓ Upload giấy tờ'}
                        </button>
                        <button 
                            onClick={() => {
                                setDocUserId('');
                                setDocNumber('');
                                setFrontPhoto(null);
                                setBackPhoto(null);
                                setIssueDate('');
                                setExpiryDate('');
                                setIssuedBy('');
                                setIsDefault(false);
                            }}
                            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Làm mới
                        </button>
                    </div>
                </div>
                
                {/* Document detail modal */}
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
                                        <div className="mt-1">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                viewingDoc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 
                                                viewingDoc.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {viewingDoc.status === 'VERIFIED' ? '✓ Đã xác minh' :
                                                 viewingDoc.status === 'REJECTED' ? '✗ Từ chối' :
                                                 '⏳ Chờ xác minh'}
                                            </span>
                                        </div>
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
                
                {/* Document camera modal */}
                {docCameraOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                        <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-lg">
                            <div className="mb-3 text-center">
                                <h3 className="text-lg font-semibold">
                                    Chụp ảnh {docCameraType === 'front' ? 'mặt trước' : 'mặt sau'}
                                </h3>
                                <p className="text-sm text-gray-500">Đặt giấy tờ vào khung hình và nhấn "Chụp"</p>
                            </div>
                            <div className="relative w-full aspect-video bg-black overflow-hidden rounded-xl">
                                <video ref={videoRef} className="w-full h-full object-cover" playsInline autoPlay muted />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button 
                                    onClick={captureDocPhoto}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                                >
                                    📸 Chụp
                                </button>
                                <button 
                                    onClick={closeDocCamera}
                                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Edit document modal */}
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
                                                        <div className="flex gap-2 justify-center">
                                                            <button 
                                                                type="button"
                                                                onClick={() => editFrontPhotoInputRef.current?.click()} 
                                                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                                            >
                                                                📁 Chọn ảnh
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => openDocCamera('front')} 
                                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                                                            >
                                                                📸 Chụp ảnh
                                                            </button>
                                                        </div>
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
                                                        <div className="flex gap-2 justify-center">
                                                            <button 
                                                                type="button"
                                                                onClick={() => editBackPhotoInputRef.current?.click()} 
                                                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                                            >
                                                                📁 Chọn ảnh
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => openDocCamera('back')} 
                                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                                                            >
                                                                📸 Chụp ảnh
                                                            </button>
                                                        </div>
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
            </>)}

            {/* QR Scanner Modal */}
            {qrScannerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Quét mã QR trên xe</h3>
                            <p className="text-sm text-gray-600">Đưa camera vào mã QR dán trên xe để tự động chọn xe</p>
                        </div>
                        
                        <div className="relative w-full bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                            <video 
                                ref={qrVideoRef}
                                className="w-full h-full object-cover"
                                playsInline 
                                autoPlay 
                                muted 
                            />
                            
                            {/* QR Frame Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="relative w-64 h-64">
                                    {/* Corner decorations */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                                    
                                    {/* Scanning line animation */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse" style={{ animation: 'scan 2s linear infinite' }}></div>
                                </div>
                            </div>

                            {/* Hidden canvas for QR detection */}
                            <canvas ref={qrCanvasRef} className="hidden"></canvas>
                        </div>

                        <div className="mt-6 flex gap-3 justify-end">
                            <button 
                                onClick={closeQrScanner}
                                className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                            >
                                Đóng
                            </button>
                        </div>

                        {/* Instruction text */}
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800">
                                <span className="font-semibold">💡 Hướng dẫn:</span> Hướng camera vào mã QR trên xe. 
                                Mã QR chứa ID xe sẽ tự động được quét và xe sẽ được chọn.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffPortal;


