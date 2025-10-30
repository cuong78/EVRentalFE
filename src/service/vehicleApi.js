const BASE_URL = 'http://localhost:8080';

function buildHeaders() {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  const token = typeof window !== 'undefined' && window.localStorage
    ? window.localStorage.getItem('authToken')
    : null;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch (e) {
    return null;
  }
}

async function parseTextSafe(response) {
  try {
    return await response.text();
  } catch (e) {
    return '';
  }
}

async function buildErrorFromResponse(response, isJson) {
  let message = `HTTP ${response.status}`;
  if (isJson) {
    const data = await parseJsonSafe(response.clone());
    if (data && (data.message || data.error)) {
      message = data.message || data.error;
    }
  } else {
    const text = await parseTextSafe(response.clone());
    if (text) message = text;
  }
  const error = new Error(message);
  error.status = response.status;
  return error;
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    throw await buildErrorFromResponse(response, isJson);
  }

  if (response.status === 204) return null;
  if (isJson) return parseJsonSafe(response);
  return parseTextSafe(response);
}

export async function request(method, url, data) {
  const options = {
    method: method.toUpperCase(),
    headers: buildHeaders()
  };

  if (data !== undefined && data !== null) {
    options.body = typeof data === 'string' ? data : JSON.stringify(data);
  }

  const absoluteUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const response = await fetch(absoluteUrl, options);
  return handleResponse(response);
}

// Vehicle API functions
export function getVehicles() {
  return request('GET', '/api/vehicles');
}

export function getVehicleById(id) {
  if (id === undefined || id === null) {
    return Promise.reject(new Error('Vehicle id is required'));
  }
  return request('GET', `/api/vehicles/${encodeURIComponent(id)}`);
}

export function createVehicle(vehicleData) {
  return request('POST', '/api/vehicles', vehicleData);
}

export function updateVehicle(id, vehicleData) {
  if (id === undefined || id === null) {
    return Promise.reject(new Error('Vehicle id is required'));
  }
  return request('PUT', `/api/vehicles/${encodeURIComponent(id)}`, vehicleData);
}

export function deleteVehicle(id) {
  if (id === undefined || id === null) {
    return Promise.reject(new Error('Vehicle id is required'));
  }
  return request('DELETE', `/api/vehicles/${encodeURIComponent(id)}`);
}

export function getVehiclesByType(typeId) {
  if (typeId === undefined || typeId === null) {
    return Promise.reject(new Error('Type id is required'));
  }
  return request('GET', `/api/vehicles/type/${encodeURIComponent(typeId)}`);
}

export function getVehiclesByStation(stationId) {
  if (stationId === undefined || stationId === null) {
    return Promise.reject(new Error('Station id is required'));
  }
  return request('GET', `/api/vehicles/station/${encodeURIComponent(stationId)}`);
}

export function getVehiclesByStationAndType(stationId, typeId) {
  if (stationId === undefined || stationId === null || typeId === undefined || typeId === null) {
    return Promise.reject(new Error('Station id and Type id are required'));
  }
  return request('GET', `/api/vehicles/station/${encodeURIComponent(stationId)}/type/${encodeURIComponent(typeId)}`);
}

export function getAvailableVehicles() {
  return request('GET', '/api/vehicles/available');
}

export function getAvailableVehiclesByStation(stationId) {
  if (stationId === undefined || stationId === null) {
    return Promise.reject(new Error('Station id is required'));
  }
  return request('GET', `/api/vehicles/available/station/${encodeURIComponent(stationId)}`);
}

// Vehicle Type API functions
export function getVehicleTypes() {
  return request('GET', '/api/vehicle-types');
}

export function getVehicleTypeById(id) {
  if (id === undefined || id === null) {
    return Promise.reject(new Error('Vehicle type id is required'));
  }
  return request('GET', `/api/vehicle-types/${encodeURIComponent(id)}`);
}

export function createVehicleType(typeData) {
  return request('POST', '/api/vehicle-types', typeData);
}

export function updateVehicleType(id, typeData) {
  if (id === undefined || id === null) {
    return Promise.reject(new Error('Vehicle type id is required'));
  }
  return request('PUT', `/api/vehicle-types/${encodeURIComponent(id)}`, typeData);
}

export function deleteVehicleType(id) {
  if (id === undefined || id === null) {
    return Promise.reject(new Error('Vehicle type id is required'));
  }
  return request('DELETE', `/api/vehicle-types/${encodeURIComponent(id)}`);
}

export function getVehicleTypesByStation(stationId) {
  if (stationId === undefined || stationId === null) {
    return Promise.reject(new Error('Station id is required'));
  }
  return request('GET', `/api/vehicle-types/by-station/${encodeURIComponent(stationId)}`);
}

// Rental Station API functions
export function getRentalStations() {
  return request('GET', '/api/rental-stations');
}

export function getRentalStationById(id) {
  if (id === undefined || id === null) {
    return Promise.reject(new Error('Rental station id is required'));
  }
  return request('GET', `/api/rental-stations/${encodeURIComponent(id)}`);
}

export function createRentalStation(stationData) {
  return request('POST', '/api/rental-stations', stationData);
}

export function updateRentalStation(id, stationData) {
  if (id === undefined || id === null) {
    return Promise.reject(new Error('Rental station id is required'));
  }
  return request('PUT', `/api/rental-stations/${encodeURIComponent(id)}`, stationData);
}

export function deleteRentalStation(id) {
  if (id === undefined || id === null) {
    return Promise.reject(new Error('Rental station id is required'));
  }
  return request('DELETE', `/api/rental-stations/${encodeURIComponent(id)}`);
}

export function removeStationAdmin(stationId) {
  if (stationId === undefined || stationId === null) {
    return Promise.reject(new Error('Station id is required'));
  }
  return request('POST', `/api/rental-stations/${encodeURIComponent(stationId)}/remove-admin`);
}

export function assignStationAdmin(stationId, adminId) {
  if (stationId === undefined || stationId === null || adminId === undefined || adminId === null) {
    return Promise.reject(new Error('Station id and Admin id are required'));
  }
  return request('POST', `/api/rental-stations/${encodeURIComponent(stationId)}/assign-admin/${encodeURIComponent(adminId)}`);
}

export function getStationsWithoutAdmin() {
  return request('GET', '/api/rental-stations/without-admin');
}

export function getStationsByCity(city) {
  if (city === undefined || city === null) {
    return Promise.reject(new Error('City is required'));
  }
  return request('GET', `/api/rental-stations/city/${encodeURIComponent(city)}`);
}

export default {
  request,
  // Vehicle functions
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehiclesByType,
  getVehiclesByStation,
  getVehiclesByStationAndType,
  getAvailableVehicles,
  getAvailableVehiclesByStation,
  // Vehicle Type functions
  getVehicleTypes,
  getVehicleTypeById,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
  getVehicleTypesByStation,
  // Rental Station functions
  getRentalStations,
  getRentalStationById,
  createRentalStation,
  updateRentalStation,
  deleteRentalStation,
  removeStationAdmin,
  assignStationAdmin,
  getStationsWithoutAdmin,
  getStationsByCity
};


