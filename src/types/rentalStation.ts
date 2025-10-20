export interface Station {
  id: number;
  city: string;
  address: string;
}

export interface StationResponse {
  statusCode: number;
  message: string;
  data: Station[];
}