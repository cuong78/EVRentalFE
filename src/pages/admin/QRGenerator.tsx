import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

const QRGenerator: React.FC = () => {
    const [vehicleId, setVehicleId] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generateQRCode = async () => {
        if (!vehicleId) {
            alert('Vui lòng nhập ID xe');
            return;
        }

        try {
            // Format: VEHICLE:123
            const qrData = `VEHICLE:${vehicleId}`;
            
            // Generate QR code to canvas
            if (canvasRef.current) {
                await QRCode.toCanvas(canvasRef.current, qrData, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF',
                    },
                });

                // Convert to data URL for download
                const url = canvasRef.current.toDataURL('image/png');
                setQrCodeUrl(url);
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('Không thể tạo mã QR');
        }
    };

    const downloadQRCode = () => {
        if (!qrCodeUrl) return;

        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `vehicle-${vehicleId}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generateMultiple = async () => {
        const start = parseInt(prompt('ID xe bắt đầu:') || '1');
        const end = parseInt(prompt('ID xe kết thúc:') || '10');

        for (let id = start; id <= end; id++) {
            const qrData = `VEHICLE:${id}`;
            const canvas = document.createElement('canvas');
            
            await QRCode.toCanvas(canvas, qrData, {
                width: 300,
                margin: 2,
            });

            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = url;
            link.download = `vehicle-${id}-qr.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Delay to avoid browser blocking downloads
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        alert(`Đã tạo ${end - start + 1} mã QR!`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo mã QR cho xe</h1>
                    <p className="text-gray-600 mb-8">
                        Tạo mã QR để dán lên xe, giúp nhân viên quét và chọn xe nhanh chóng
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left side - Input */}
                        <div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ID Xe
                                </label>
                                <input
                                    type="number"
                                    value={vehicleId}
                                    onChange={(e) => setVehicleId(e.target.value)}
                                    placeholder="Nhập ID xe (ví dụ: 123)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onKeyPress={(e) => e.key === 'Enter' && generateQRCode()}
                                />
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={generateQRCode}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    🎨 Tạo mã QR
                                </button>

                                {qrCodeUrl && (
                                    <button
                                        onClick={downloadQRCode}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-5 h-5" />
                                        Tải về
                                    </button>
                                )}

                                <button
                                    onClick={generateMultiple}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    📦 Tạo hàng loạt
                                </button>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="font-semibold text-blue-900 mb-2">💡 Hướng dẫn:</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Nhập ID xe và nhấn "Tạo mã QR"</li>
                                    <li>• Tải về và in mã QR</li>
                                    <li>• Dán mã QR lên xe ở vị trí dễ thấy</li>
                                    <li>• Nhân viên quét mã để chọn xe tự động</li>
                                </ul>
                            </div>
                        </div>

                        {/* Right side - Preview */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="bg-gray-100 p-8 rounded-xl border-2 border-dashed border-gray-300">
                                {qrCodeUrl ? (
                                    <div className="text-center">
                                        <canvas ref={canvasRef} className="mx-auto"></canvas>
                                        <p className="mt-4 text-sm font-medium text-gray-600">
                                            Mã QR cho xe #{vehicleId}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="w-64 h-64 flex items-center justify-center text-gray-400">
                                        <div className="text-center">
                                            <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                            </svg>
                                            <p className="text-sm">Mã QR sẽ hiển thị ở đây</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Format info */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-2">📋 Định dạng mã QR:</h3>
                        <div className="text-sm text-gray-700 space-y-1">
                            <p>• <code className="bg-gray-200 px-2 py-1 rounded">VEHICLE:123</code> - Format chuẩn (khuyên dùng)</p>
                            <p>• <code className="bg-gray-200 px-2 py-1 rounded">VH123</code> - Format ngắn gọn</p>
                            <p>• <code className="bg-gray-200 px-2 py-1 rounded">123</code> - Chỉ số ID</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRGenerator;

