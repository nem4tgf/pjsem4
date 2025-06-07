import { OrderDetail } from './order-detail.interface';
import { User } from './user.interface';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  orderId: number;
  user: User;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string | null;
  items: OrderDetail[];
}

export interface OrderItemRequest {
  lessonId: number;
  quantity: number;
}

export interface OrderRequest {
  userId: number;
  items: OrderItemRequest[];
}
