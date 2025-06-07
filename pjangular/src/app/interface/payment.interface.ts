import { User } from './user.interface';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

export interface Payment {
  paymentId: number;
  user: User;
  orderId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId: string;
  status: PaymentStatus;
  description?: string;
}

export interface PaymentRequest {
  userId: number;
  orderId: number;
  amount: number;
  paymentMethod?: string;
  description?: string;
}
