// src/app/interface/payment.interface.ts

import { User } from './user.interface'; // Đảm bảo đã import User interface

// Enum trạng thái Payment khớp với backend
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

// Tương ứng với PaymentResponse của backend
export interface Payment {
  paymentId: number;
  user: User; // Sử dụng User interface
  orderId: number; // KHỚP: Backend DTO sử dụng orderId
  amount: number; // BigDecimal từ backend -> number
  paymentDate: string; // LocalDateTime từ backend -> string (ISO 8601)
  paymentMethod?: string; // Optional
  transactionId?: string; // Optional vì trong entity có thể là null và unique
  status: PaymentStatus;
  description?: string; // Optional
}

// Tương ứng với PaymentRequest của backend
export interface PaymentRequest {
  userId: number;
  orderId: number;
  amount: number; // BigDecimal từ backend -> number
  paymentMethod?: string;
  description?: string;
  cancelUrl: string; // BẮT BUỘC theo backend DTO
  successUrl: string; // BẮT BUỘC theo backend DTO
}

// Tương ứng với PaymentSearchRequest của backend
export interface PaymentSearchRequest {
  userId?: number;
  orderId?: number;
  status?: PaymentStatus;
  minDate?: string;    // LocalDateTime từ backend -> string (ISO 8601)
  maxDate?: string;    // LocalDateTime từ backend -> string (ISO 8601)
  minAmount?: number;  // BigDecimal từ backend -> number
  maxAmount?: number;  // BigDecimal từ backend -> number
  paymentMethod?: string;
  transactionId?: string; // Đồng bộ với backend DTO

  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// Tương ứng với PaymentPageResponse (đã thêm vào để đồng bộ)
export interface PaymentPageResponse {
  content: Payment[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
