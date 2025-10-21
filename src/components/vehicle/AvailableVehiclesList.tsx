import { useEffect, useState } from 'react';
import { vehicleService } from '../../service/vehicleService';

export default function AvailableVehiclesList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    vehicleService.getAvailableVehicles()
      .then((data) => {
        if (!isMounted) return;
        setVehicles(Array.isArray(data) ? data : (data?.data || []));
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load available vehicles');
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
    return <div>Loading available vehicles...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!vehicles || vehicles.length === 0) {
    return <div>No available vehicles found.</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Available Vehicles ({vehicles.length} available)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
        {vehicles.map((vehicle: any) => (
          <div key={vehicle.id} style={{ 
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
              Vehicle #{vehicle.id}
            </h3>
            <p><strong>Type:</strong> {vehicle.typeName || `Type #${vehicle.typeId}`}</p>
            <p><strong>Station:</strong> {vehicle.stationName || `Station #${vehicle.stationId}`}</p>
            <p><strong>Status:</strong> 
              <span style={{ 
                color: vehicle.status === 'AVAILABLE' ? 'green' : 'orange',
                fontWeight: 'bold'
              }}>
                {vehicle.status}
              </span>
            </p>
            {vehicle.conditionNotes && (
              <p><strong>Notes:</strong> {vehicle.conditionNotes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
