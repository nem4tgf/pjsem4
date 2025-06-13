// src/app/interface/payment.interface.ts
import { User } from './user.interface';

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
  orderId: number;
  amount: number; // BigDecimal từ backend -> number
  paymentDate: string; // LocalDateTime từ backend -> string
  paymentMethod: string;
  transactionId: string;
  status: PaymentStatus;
  description?: string;
}

// Tương ứng với PaymentRequest của backend
export interface PaymentRequest {
  userId: number;
  orderId: number;
  amount: number; // BigDecimal từ backend -> number
  paymentMethod?: string;
  description?: string;
  // BỔ SUNG: Hai trường này giờ là BẮT BUỘC và nằm trong request body
  cancelUrl: string;
  successUrl: string;
}
