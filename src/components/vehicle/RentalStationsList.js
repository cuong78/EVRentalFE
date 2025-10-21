import { useEffect, useState } from 'react';
import { getRentalStations } from '../../service/vehicleApi';

export default function RentalStationsList() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getRentalStations()
      .then((data) => {
        if (!isMounted) return;
        setStations(Array.isArray(data) ? data : (data?.data || []));
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load rental stations');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div>Loading rental stations...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!stations || stations.length === 0) {
    return <div>No rental stations found.</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Rental Stations ({stations.length} stations)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
        {stations.map((station) => (
          <div key={station.id} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '15px',
            backgroundColor: '#f0fff0'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
              {station.name}
            </h3>
            {station.address && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Address:</strong> {station.address}
              </div>
            )}
            {station.city && (
              <div style={{ marginBottom: '8px' }}>
                <strong>City:</strong> {station.city}
              </div>
            )}
            {station.phone && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Phone:</strong> {station.phone}
              </div>
            )}
            {station.email && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Email:</strong> {station.email}
              </div>
            )}
            {station.operatingHours && (
              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                <strong>Hours:</strong> {station.operatingHours}
              </div>
            )}
            {station.capacity && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Capacity:</strong> {station.capacity} vehicles
              </div>
            )}
            {station.admin && (
              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                <strong>Admin:</strong> {station.admin.username || station.admin.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
