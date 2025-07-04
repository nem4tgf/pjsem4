import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { OrderDetail, OrderDetailRequest } from '../interface/order-detail.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Lấy chi tiết đơn hàng theo ID. Yêu cầu quyền ADMIN.
   * @param id ID của chi tiết đơn hàng.
   * @returns Observable<OrderDetail>
   */
  getOrderDetailById(id: number): Observable<OrderDetail> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<OrderDetail>(`${this.apiUrl}/order-details/${id}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy danh sách chi tiết đơn hàng cho một ID đơn hàng cụ thể. Yêu cầu quyền ADMIN.
   * @param orderId ID của đơn hàng.
   * @returns Observable<OrderDetail[]>
   */
  getOrderDetailsByOrderId(orderId: number): Observable<OrderDetail[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<OrderDetail[]>(`${this.apiUrl}/order-details/order/${orderId}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy tất cả các chi tiết đơn hàng. Yêu cầu quyền ADMIN.
   * @returns Observable<OrderDetail[]>
   */
  getAllOrderDetails(): Observable<OrderDetail[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<OrderDetail[]>(`${this.apiUrl}/order-details`)),
      catchError(this.handleError)
    );
  }

  /**
   * Cập nhật thông tin chi tiết đơn hàng. Yêu cầu quyền ADMIN.
   * @param id ID của chi tiết đơn hàng cần cập nhật.
   * @param request DTO chứa thông tin cập nhật.
   * @returns Observable<OrderDetail>
   */
  updateOrderDetail(id: number, request: OrderDetailRequest): Observable<OrderDetail> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.put<OrderDetail>(`${this.apiUrl}/order-details/${id}`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Xóa một chi tiết đơn hàng. Yêu cầu quyền ADMIN.
   * @param id ID của chi tiết đơn hàng cần xóa.
   * @returns Observable<void>
   */
  deleteOrderDetail(id: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/order-details/${id}`)),
      catchError(this.handleError)
    );
  }
}
