import { apiClient } from "./api";

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface BookingRequest {
  stationId: number;
  typeId: number;
  startDate: string; // ISO string, e.g. "2025-10-21"
  endDate: string;
  customerInfo?: CustomerInfo; // Thông tin khách hàng tại thời điểm đặt hàng
}

export interface Booking {
  id: string; // Backend returns string ID
  userId: number;
  stationId: number;
  typeId: number;
  startDate: string;
  endDate: string;
  totalPayment: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentMethod?: string;
  paymentExpiryTime?: string;
  createdAt: string;
  updatedAt: string;
  rentalDays?: number;
  isPaymentExpired?: boolean;
  canCancel?: boolean;
  totalPaid?: number;
  isFullyPaid?: boolean;
  stationName?: string;
  typeName?: string;
  // Thông tin khách hàng tại thời điểm đặt hàng (snapshot)
  customerInfo?: CustomerInfo;
}

// Alias for backward compatibility
export interface BookingResponse extends Booking {}

export const bookingService = {
  /** Create a new booking */
  createBooking: async (payload: BookingRequest): Promise<Booking> => {
    const resp = await apiClient.post("/api/bookings", payload);
    return resp.data?.data ?? resp.data;
  },

  /** Get all bookings of a specific user */
  getBookingsByUser: async (userId: string): Promise<Booking[]> => {
    const resp = await apiClient.get(`/api/bookings/user/${userId}`);
    return resp.data?.data ?? resp.data ?? [];
  },

  /** Get booking by ID */
  getBookingById: async (id: string): Promise<Booking> => {
    const resp = await apiClient.get(`/api/bookings/${id}`);
    return resp.data?.data ?? resp.data;
  },

  /** Get current user's bookings by user ID */
  getMyBookings: async (userId: number): Promise<Booking[]> => {
    const resp = await apiClient.get(`/api/bookings/user/${userId}`);
    return resp.data?.data ?? resp.data ?? [];
  },

  /** Get confirmed bookings by phone */
  getConfirmedByPhone: async (phone: string): Promise<Booking[]> => {
    const resp = await apiClient.get(`/api/bookings/phone/${phone}/confirmed`);
    return resp.data?.data ?? resp.data ?? [];
  },

  /** Get active bookings by phone */
  getActiveByPhone: async (phone: string): Promise<Booking[]> => {
    const resp = await apiClient.get(`/api/bookings/phone/${phone}/active`);
    return resp.data?.data ?? resp.data ?? [];
  },

  /** Cancel booking */
  cancelBooking: async (id: string): Promise<void> => {
    await apiClient.put(`/api/bookings/${id}/cancel`);
  },

  /** Cancel booking with refund */
  cancelBookingWithRefund: async (id: string, refundMethod: 'ONLINE' | 'DIRECT') => {
    // Create return transaction (backend should handle booking cancellation automatically)
    const response = await apiClient.post(`/api/return-transactions`, {
      bookingId: id,
      refundMethod: refundMethod,
      reason: 'Customer cancellation'
    });
    return response.data;
  },

  /** Get return transaction by booking ID */
  getReturnTransaction: async (bookingId: string) => {
    const response = await apiClient.get(`/api/return-transactions/booking/${bookingId}`);
    return response.data;
  },

  /** Confirm booking */
  confirmBooking: async (id: string): Promise<void> => {
    await apiClient.put(`/api/bookings/${id}/confirm`);
  },

  /** Complete booking */
  completeBooking: async (id: string): Promise<void> => {
    await apiClient.put(`/api/bookings/${id}/complete`);
  },
};

export default bookingService;
