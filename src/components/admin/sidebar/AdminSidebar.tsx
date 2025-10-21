import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

interface SidebarItem {
  title: string;
  path: string;
  icon: string;
  permissions?: string[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    path: '/admin',
    icon: '📊',
  },
  {
    title: 'Vehicles',
    path: '/admin/vehicles',
    icon: '🚗',
  },
  {
    title: 'Vehicle Types',
    path: '/admin/vehicle-types',
    icon: '🚘',
  },
  {
    title: 'Rental Stations',
    path: '/admin/rental-stations',
    icon: '🏢',
  },
  {
    title: 'Bookings',
    path: '/admin/bookings',
    icon: '📝',
  },
  {
    title: 'Users',
    path: '/admin/users',
    icon: '👥',
  },
  {
    title: 'Reports',
    path: '/admin/reports',
    icon: '📈',
  }
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const username = user?.username || 'Admin';

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white w-64">
      {/* Admin Profile Section */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            {username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold">{username}</h2>
            <p className="text-sm text-gray-400">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-6 py-3 text-sm ${
              isActive(item.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-800">
        <Link
          to="/settings"
          className="flex items-center space-x-3 px-2 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded"
        >
          <span className="text-xl">⚙️</span>
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;