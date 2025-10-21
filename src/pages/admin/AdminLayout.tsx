import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminGuard from '../../components/auth/guards/AdminGuard';
import AdminSidebar from '../../components/admin/sidebar/AdminSidebar';

const AdminLayout: React.FC = () => {
  return (
    <AdminGuard>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminLayout;