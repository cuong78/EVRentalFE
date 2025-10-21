import { useEffect, useState } from 'react';
import { getVehicles } from '../../service/vehicleApi';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getVehicles()
      .then((data) => {
        if (!isMounted) return;
        setVehicles(Array.isArray(data) ? data : (data?.content || []));
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load vehicles');
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
    return <div>Loading vehicles...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!vehicles || vehicles.length === 0) {
    return <div>No vehicles found.</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Vehicle List ({vehicles.length} vehicles)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '15px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
              {vehicle.type?.name || 'Unknown Type'} #{vehicle.id}
            </h3>
            <div style={{ marginBottom: '8px' }}>
              <strong>Status:</strong> 
              <span style={{ 
                color: vehicle.status === 'AVAILABLE' ? 'green' : 
                       vehicle.status === 'MAINTENANCE' ? 'orange' : 'red',
                marginLeft: '5px'
              }}>
                {vehicle.status}
              </span>
            </div>
            {vehicle.station && (
              <div style={{ marginBottom: '8px' }}>
                <strong>Station:</strong> {vehicle.station.name}
              </div>
            )}
            {vehicle.conditionNotes && (
              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                <strong>Notes:</strong> {vehicle.conditionNotes}
              </div>
            )}
            {vehicle.photos && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={vehicle.photos} 
                  alt={`Vehicle ${vehicle.id}`}
                  style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


