import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const VehicleManagement = lazy(() => import('../pages/admin/VehicleManagement'));
const VehicleTypeManagement = lazy(() => import('../pages/admin/VehicleTypeManagement'));
const RentalStationManagement = lazy(() => import('../pages/admin/RentalStationManagement'));

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      {
        path: '', // /admin will show dashboard
        Component: AdminDashboard,
        index: true,
      },
      {
        path: 'vehicles',
        Component: VehicleManagement,
      },
      {
        path: 'vehicle-types',
        Component: VehicleTypeManagement,
      },
      {
        path: 'rental-stations',
        Component: RentalStationManagement,
      },
    ],
  },
];
