import { Lesson } from './lesson.interface';

export interface OrderDetail {
  orderDetailId: number;
  orderId: number;
  lesson: Lesson;
  quantity: number;
  priceAtPurchase: number;
}
