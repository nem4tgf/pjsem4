// src/app/interface/order.interface.ts
import { OrderDetail } from './order-detail.interface';
import { User } from './user.interface';

// Enum trạng thái Order khớp với backend
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

// Tương ứng với OrderResponse của backend
export interface Order {
  orderId: number;
  user: User; // Sử dụng User interface
  orderDate: string; // LocalDateTime từ backend -> string
  totalAmount: number; // BigDecimal từ backend -> number
  status: OrderStatus; // Enum từ backend -> string
  shippingAddress: string | null;
  items: OrderDetail[]; // Danh sách OrderDetail
}

// Tương ứng với OrderItemRequest của backend
export interface OrderItemRequest {
  lessonId: number;
  quantity: number;
}

// Tương ứng với OrderRequest của backend
export interface OrderRequest {
  userId: number;
  items: OrderItemRequest[];
}
