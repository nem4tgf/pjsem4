// src/app/interface/order-detail.interface.ts

import { Lesson } from './lesson.interface'; // Đảm bảo đã import Lesson interface

// Tương ứng với OrderDetailResponse của backend
export interface OrderDetail {
  orderDetailId: number;
  orderId: number;
  lesson: Lesson; // Sử dụng Lesson interface
  quantity: number;
  priceAtPurchase: number; // BigDecimal từ backend -> number
}

// Tương ứng với OrderDetailRequest của backend (dùng cho update)
// DTO này được sử dụng khi bạn cần gửi thông tin chi tiết để cập nhật một OrderDetail đã tồn tại.
export interface OrderDetailRequest {
  orderId: number;
  lessonId: number;
  quantity: number;
  priceAtPurchase: number;
}
