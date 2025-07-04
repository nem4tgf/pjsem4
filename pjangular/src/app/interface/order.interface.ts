// src/app/interface/order.interface.ts

import { OrderDetail } from './order-detail.interface'; // Đảm bảo đã import
import { User } from './user.interface';               // Đảm bảo đã import

// Enum trạng thái Order khớp với backend entity
export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PROCESSING = 'PROCESSING'
}

// Tương ứng với OrderResponse của backend
export interface Order {
  orderId: number;
  user: User; // Sử dụng User interface
  orderDate: string; // LocalDateTime từ backend -> string (ISO 8601)
  totalAmount: number; // BigDecimal từ backend -> number
  status: OrderStatus; // Enum từ backend
  shippingAddress?: string; // Optional vì trong entity có thể là null
  items: OrderDetail[]; // Danh sách OrderDetailResponse
}

// Tương ứng với OrderItemRequest của backend
export interface OrderItemRequest {
  lessonId: number;
  quantity: number;
}

// Tương ứng với OrderRequest của backend
export interface OrderRequest {
  userId: number;
  shippingAddress?: string; // Đồng bộ với Order entity/dto nếu có gửi lên khi tạo order
  items: OrderItemRequest[];
}

// Tương ứng với OrderSearchRequest của backend
export interface OrderSearchRequest {
  userId?: number;
  status?: OrderStatus; // Trạng thái đơn hàng
  minDate?: string;     // LocalDateTime từ backend -> string (ISO 8601)
  maxDate?: string;     // LocalDateTime từ backend -> string (ISO 8601)
  minTotalAmount?: number; // BigDecimal từ backend -> number
  maxTotalAmount?: number; // BigDecimal từ backend -> number
  username?: string;    // Tên người dùng để tìm kiếm

  page?: number;        // Mặc định 0
  size?: number;        // Mặc định 10
  sortBy?: string;      // Mặc định "orderId"
  sortDir?: 'ASC' | 'DESC'; // Mặc định "ASC"
}

// Tương ứng với Page<OrderResponse> của backend
// Spring Data JPA Page trả về các trường như 'content', 'totalElements', 'totalPages', v.v.
export interface OrderPageResponse {
  content: Order[];
  totalElements: number;
  totalPages: number;
  number: number; // Tương ứng với 'page' (trang hiện tại, 0-indexed)
  size: number;   // Kích thước trang
  // Thêm các trường khác nếu cần từ Page interface của Spring, ví dụ:
  // first: boolean;
  // last: boolean;
  // empty: boolean;
  // numberOfElements: number;
}
