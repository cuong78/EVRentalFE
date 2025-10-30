import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { RentalStation } from '../../types/vehicle';

const RentalStationManagement: React.FC = () => {
  const [stations, setStations] = useState<RentalStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await axios.get('/api/rental-stations');
      // backend may return { data: [...] } or the array directly
      const payload = response.data && (response.data.data ?? response.data);
      setStations(payload ?? []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stations:', error);
      setError('Failed to fetch rental stations');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/rental-stations/${id}`);
      fetchStations();
    } catch (error) {
      console.error('Error deleting station:', error);
      setError('Failed to delete rental station');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Rental Station Management</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add New Station
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stations.map((station) => (
              <tr key={station.id}>
                <td className="px-6 py-4 whitespace-nowrap">{station.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{station.address}</td>
                <td className="px-6 py-4 whitespace-nowrap">{station.city}</td>
                <td className="px-6 py-4 whitespace-nowrap">{station.capacity}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {station.adminId || 'No admin assigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    onClick={() => {/* Handle edit */}}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDelete(station.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentalStationManagement;