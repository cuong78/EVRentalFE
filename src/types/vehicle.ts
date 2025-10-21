export interface Vehicle {
  id: string;
  name: string;
  type: string;
  station: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'IN_USE';
  description?: string;
  imageUrl?: string;
  price: number;
}

export interface VehicleType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
}

export interface RentalStation {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  adminId?: string;
}