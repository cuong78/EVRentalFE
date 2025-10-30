import React from 'react';

const PaymentsListPage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-4">Báo cáo Payments</h1>
      <div className="bg-white rounded-2xl shadow p-6 text-gray-600">
        Bảng danh sách payments với bộ lọc station, loại xe, date range (placeholder). Sẽ kết nối API khi backend sẵn sàng.
      </div>
    </div>
  );
};

export default PaymentsListPage;
