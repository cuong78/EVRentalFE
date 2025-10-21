

import React, { useEffect, useState } from 'react';

type Vehicle = {
  id: string;
  name?: string;
  status: string;
};

type Station = {
  id: string;
  name?: string;
};

type Booking = {
  id: string;
  customerName?: string;
  customerId?: string;
  vehicleName?: string;
  vehicleId?: string;
  status: string;
  totalPrice?: number;
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    vehicles: 0,
    stations: 0,
    bookings: 0,
    revenue: 0,
    activeRentals: 0,
    availableVehicles: 0,
    inUseVehicles: 0,
    maintenanceVehicles: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const vehiclesRes = await fetch('/api/vehicles');
        const vehiclesJson = await vehiclesRes.json();
        const stationsRes = await fetch('/api/rental-stations');
        const stationsJson = await stationsRes.json();
        const bookingsRes = await fetch('/api/bookings');
        const bookingsJson = await bookingsRes.json();

        const vehicleList: Vehicle[] = vehiclesJson.data || vehiclesJson;
        const stationList: Station[] = stationsJson.data || stationsJson;
        const bookingList: Booking[] = bookingsJson.data || bookingsJson;

        const activeRentals = bookingList.filter(b => b.status === 'ACTIVE').length;
        const revenue = bookingList.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const availableVehicles = vehicleList.filter(v => v.status === 'AVAILABLE').length;
        const inUseVehicles = vehicleList.filter(v => v.status === 'IN_USE').length;
        const maintenanceVehicles = vehicleList.filter(v => v.status === 'MAINTENANCE').length;

        setStats({
          vehicles: vehicleList.length,
          stations: stationList.length,
          bookings: bookingList.length,
          revenue,
          activeRentals,
          availableVehicles,
          inUseVehicles,
          maintenanceVehicles,
        });
        setRecentBookings(bookingList.slice(0, 5));
      } catch (e) {
        console.error('Failed to load dashboard data', e);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Vehicles</h3>
          <p className="text-2xl font-bold mt-2">{loading ? 'Loading...' : stats.vehicles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Active Rentals</h3>
          <p className="text-2xl font-bold mt-2">{loading ? 'Loading...' : stats.activeRentals}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Rental Stations</h3>
          <p className="text-2xl font-bold mt-2">{loading ? 'Loading...' : stats.stations}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
          <p className="text-2xl font-bold mt-2">{loading ? 'Loading...' : `$${stats.revenue}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">ID</th>
                  <th className="text-left py-2">Customer</th>
                  <th className="text-left py-2">Vehicle</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="text-center py-4">Loading...</td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-red-500">{error}</td>
                  </tr>
                )}
                {!loading && !error && recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4">No bookings found</td>
                  </tr>
                )}
                {!loading && !error && recentBookings.length > 0 && (
                  recentBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="py-2">{b.id}</td>
                      <td className="py-2">{b.customerName || b.customerId}</td>
                      <td className="py-2">{b.vehicleName || b.vehicleId}</td>
                      <td className="py-2">{b.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Vehicle Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Available</span>
              <div className="w-48 bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: loading ? '0%' : `${stats.availableVehicles / (stats.vehicles || 1) * 100}%` }}></div>
              </div>
              <span className="ml-2">{loading ? '' : stats.availableVehicles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>In Use</span>
              <div className="w-48 bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: loading ? '0%' : `${stats.inUseVehicles / (stats.vehicles || 1) * 100}%` }}></div>
              </div>
              <span className="ml-2">{loading ? '' : stats.inUseVehicles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Maintenance</span>
              <div className="w-48 bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: loading ? '0%' : `${stats.maintenanceVehicles / (stats.vehicles || 1) * 100}%` }}></div>
              </div>
              <span className="ml-2">{loading ? '' : stats.maintenanceVehicles}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;