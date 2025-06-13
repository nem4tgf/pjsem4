// src/app/interface/order-detail.interface.ts
import { Lesson } from './lesson.interface';

// Tương ứng với OrderDetailResponse của backend
export interface OrderDetail {
  orderDetailId: number;
  orderId: number;
  lesson: Lesson; // Sử dụng Lesson interface
  quantity: number;
  priceAtPurchase: number; // BigDecimal từ backend -> number
}

// Tương ứng với OrderDetailRequest của backend (dùng cho update)
export interface OrderDetailRequest {
  orderId: number; // Backend DTO vẫn có orderId
  lessonId: number;
  quantity: number;
  priceAtPurchase: number; // BigDecimal từ backend -> number
}
