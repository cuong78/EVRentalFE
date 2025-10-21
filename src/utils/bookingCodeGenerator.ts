// Utility to generate booking codes with format: [Station][VehicleType][ID]
// Example: HCMCAR001234, HNIMOT005678

interface BookingCodeParams {
    stationName?: string;
    stationId?: number;
    vehicleTypeName?: string;
    vehicleTypeId?: number;
    bookingId: string | number;
}

const STATION_CODES: Record<string, string> = {
    'Ho Chi Minh': 'HCM',
    'Hanoi': 'HNI',
    'Da Nang': 'DNA',
    'Can Tho': 'CTO',
    'Hai Phong': 'HPG',
    'Nha Trang': 'NTR',
    'Hue': 'HUE',
    'Vung Tau': 'VTU',
    'Da Lat': 'DLT',
    'Phu Quoc': 'PQC'
};

const VEHICLE_TYPE_CODES: Record<string, string> = {
    'Car': 'CAR',
    'Motorbike': 'MOT',
    'Bicycle': 'BIC',
    'Scooter': 'SCO',
    'Electric Car': 'ECA',
    'Electric Bike': 'EBI',
    'SUV': 'SUV',
    'Sedan': 'SED',
    'Hatchback': 'HAT',
    'Truck': 'TRU'
};

export const generateBookingCode = (params: BookingCodeParams): string => {
    // Get station code
    let stationCode = 'STN'; // Default
    if (params.stationName) {
        // Try to find exact match first
        stationCode = STATION_CODES[params.stationName] || 
                     // Try to find partial match
                     Object.keys(STATION_CODES).find(key => 
                         params.stationName!.toLowerCase().includes(key.toLowerCase())
                     )?.let(key => STATION_CODES[key]) ||
                     // Generate from first 3 characters
                     params.stationName.substring(0, 3).toUpperCase();
    } else if (params.stationId) {
        stationCode = `ST${params.stationId.toString().padStart(1, '0')}`;
    }

    // Get vehicle type code
    let vehicleCode = 'VEH'; // Default
    if (params.vehicleTypeName) {
        vehicleCode = VEHICLE_TYPE_CODES[params.vehicleTypeName] ||
                     // Try partial match
                     Object.keys(VEHICLE_TYPE_CODES).find(key =>
                         params.vehicleTypeName!.toLowerCase().includes(key.toLowerCase())
                     )?.let(key => VEHICLE_TYPE_CODES[key]) ||
                     // Generate from first 3 characters
                     params.vehicleTypeName.substring(0, 3).toUpperCase();
    } else if (params.vehicleTypeId) {
        vehicleCode = `VT${params.vehicleTypeId.toString().padStart(1, '0')}`;
    }

    // Generate random 6-digit number instead of using booking ID
    const randomNumber = Math.floor(Math.random() * 900000) + 100000; // 6 digits: 100000-999999
    
    return `${stationCode}${vehicleCode}${randomNumber}`;
};

export const parseBookingCode = (code: string): { stationCode: string; vehicleCode: string; bookingId: string } | null => {
    if (code.length < 9) return null;
    
    const stationCode = code.substring(0, 3);
    const vehicleCode = code.substring(3, 6);
    const bookingId = code.substring(6);
    
    return { stationCode, vehicleCode, bookingId };
};

// Helper function for TypeScript
declare global {
    interface String {
        let<T>(fn: (value: string) => T): T;
    }
}

String.prototype.let = function<T>(fn: (value: string) => T): T {
    return fn(this.toString());
};
