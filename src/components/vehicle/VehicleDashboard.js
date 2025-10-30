import { useState } from 'react';
import VehicleList from './VehicleList';
import VehicleTypesList from './VehicleTypesList';
import RentalStationsList from './RentalStationsList';
import AvailableVehiclesList from './AvailableVehiclesList';

export default function VehicleDashboard() {
  const [activeTab, setActiveTab] = useState('vehicles');

  const tabs = [
    { id: 'vehicles', label: 'All Vehicles', component: VehicleList },
    { id: 'available', label: 'Available Vehicles', component: AvailableVehiclesList },
    { id: 'types', label: 'Vehicle Types', component: VehicleTypesList },
    { id: 'stations', label: 'Rental Stations', component: RentalStationsList }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || VehicleList;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px', color: '#333' }}>EV Rental Dashboard</h1>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '2px solid #ddd',
        marginBottom: '20px'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#4CAF50' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              marginRight: '2px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '400px' }}>
        <ActiveComponent />
      </div>

      {/* API Info */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>API Endpoints Used:</h3>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li><strong>GET /api/vehicles</strong> - All vehicles</li>
          <li><strong>GET /api/vehicles/available</strong> - Available vehicles only</li>
          <li><strong>GET /api/vehicle-types</strong> - Vehicle types</li>
          <li><strong>GET /api/rental-stations</strong> - Rental stations</li>
        </ul>
        <p style={{ margin: '10px 0 0 0', color: '#666' }}>
          All requests include Authorization header with Bearer token from localStorage.
        </p>
      </div>
    </div>
  );
}
