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
    id: string;
    name: string;
    brand: string;
    type: string;
    seats: number;
    range: string;
    trunkCapacity: string;
    pricePerDay: number;
    image: string;
    freeCharging: boolean;
    available: boolean;
    city: string;
  }
  
import type { UserDetails } from "./auth";


// export interface MovieDetailProps {
//     defaultTab?: number;
//     isNowShowing?: boolean;
//     ratings: RatingResponsePagination;
//     addRating: (data: RatingRequest) => void;
//     // addRating: (data: RatingRequest) => Promise<void>;
//     setPageNo: (pageNo: number) => void;
//     pageNo: number;
//     summary: RatingSummary;
//     onTabChange?: (tab: number) => void;
//     setActiveStep: (step: number) => void;
//   }

export interface VehicleType {
  id: number;
  name: string;
  depositAmount: number;
  rentalRate: number;
}

// export interface TopSellingMovie {
//     movieNameEn: string;
//     movieNameVi: string;
//     averageRating: number;
//     totalRevenue: number;
//     quantityTickets: number;
// }

export interface VehicleTypesResponse {
  statusCode: number;
  message: string;
  data: VehicleType[];
}

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleAdded: () => void;
}

type VehicleStatusType = {
    label: string;
    value: string;
}

export const VehicleStatusValue: VehicleStatusType[] = [
    { label: "Sẵn sàng", value: "AVAILABLE" },
    { label: "Bảo trì", value: "MAINTENANCE" },
]

//create vehicle form data
export interface VehicleFormData {
  typeId: number;
  stationId: number;
  status: 'AVAILABLE' | 'MAINTENANCE';
  conditionNotes: string;
  photos: string;
}

// export interface MovieUpdateRequest {
//     movieId: number;
//     movieNameEn: string;
//     movieNameVi: string;
//     version: string;
//     fromDate: string;
//     toDate: string;
//     position: number;
//     movieStatus: string;
//     start_time: string;
//     end_time: string;
//     actors: string;
//     director: string;
//     country: string;
//     ageRestriction: AgeRestriction;
//     duration: number;
//     trailerUrl: string;
//     cinema_room: string;
//     showtime: string;
//     discount_level: number;
//     productionCompany: string;
//     status: string;
//     description: string,
//     genre: string,
//     feature: boolean;
// }

export interface ApiResponse<T> {
    status: 'SUCCESS' | 'ERROR';
    data: T;                 // T ở đây có thể là vt cứ kiểu dữ liệu / class gì ha
    message: string;
}

// - `EmployeeResponse`: Đại diện cho Employee trong backend
// - `EmployeeCreateRequest`: Đại diện cho thêm Employee
// - `EmployeeUpdateRequest`: Đại diện cho chỉnh sửa Employee
