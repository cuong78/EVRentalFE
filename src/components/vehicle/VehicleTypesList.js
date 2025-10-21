import { useEffect, useState } from 'react';
import { getVehicleTypes } from '../../service/vehicleApi';

export default function VehicleTypesList() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getVehicleTypes()
      .then((data) => {
        if (!isMounted) return;
        setTypes(Array.isArray(data) ? data : (data?.data || []));
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load vehicle types');
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
    return <div>Loading vehicle types...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!types || types.length === 0) {
    return <div>No vehicle types found.</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Vehicle Types ({types.length} types)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {types.map((type) => (
          <div key={type.id} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '15px',
            backgroundColor: '#f0f8ff'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
              {type.name}
            </h3>
            {type.description && (
              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                <strong>Description:</strong> {type.description}
              </div>
            )}
            {type.hourlyRate && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Hourly Rate:</strong> ${type.hourlyRate}
              </div>
            )}
            {type.dailyRate && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Daily Rate:</strong> ${type.dailyRate}
              </div>
            )}
            {type.maxSpeed && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Max Speed:</strong> {type.maxSpeed} km/h
              </div>
            )}
            {type.batteryCapacity && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Battery:</strong> {type.batteryCapacity} kWh
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
