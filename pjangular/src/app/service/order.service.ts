// src/app/service/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Order, OrderRequest, OrderStatus } from '../interface/order.interface';
import { environment } from './enviroment';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends ApiService {
  private orderApiUrl = `${environment.apiUrl}/orders`;

  constructor(http: HttpClient) {
    super(http);
  }

  getAllOrders(): Observable<Order[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Order[]>(this.orderApiUrl)),
      catchError(this.handleError)
    );
  }

  getOrderById(id: number): Observable<Order> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Order>(`${this.orderApiUrl}/${id}`)),
      catchError(this.handleError)
    );
  }

  getOrdersByUserId(userId: number): Observable<Order[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Order[]>(`${this.orderApiUrl}/user/${userId}`)),
      catchError(this.handleError)
    );
  }

  createOrder(request: OrderRequest): Observable<Order> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<Order>(this.orderApiUrl, request)),
      catchError(this.handleError)
    );
  }

  updateOrderStatus(orderId: number, newStatus: OrderStatus): Observable<Order> {
    const params = new HttpParams().set('status', newStatus);
    return this.checkAuth().pipe(
      switchMap(() => this.http.put<Order>(`${this.orderApiUrl}/${orderId}/status`, null, { params })),
      catchError(this.handleError)
    );
  }

  deleteOrder(id: number): Observable<void> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.delete<void>(`${this.orderApiUrl}/${id}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Phương thức tìm kiếm đơn hàng với các tham số tùy chọn.
   * @param userId ID người dùng
   * @param status Trạng thái đơn hàng
   * @param minDate Ngày bắt đầu (ISO string)
   * @param maxDate Ngày kết thúc (ISO string)
   * @param minTotalAmount Tổng tiền tối thiểu
   * @param maxTotalAmount Tổng tiền tối đa
   * @param username Tên người dùng để tìm kiếm
   * @returns Observable của mảng Order.
   */
  searchOrders(
    userId?: number | null,
    status?: OrderStatus | null,
    minDate?: string | null, // LocalDateTime ở backend, gửi string ISO format
    maxDate?: string | null, // LocalDateTime ở backend, gửi string ISO format
    minTotalAmount?: number | null,
    maxTotalAmount?: number | null,
    username?: string | null
  ): Observable<Order[]> {
    return this.checkAuth().pipe(
      switchMap(() => {
        let params = new HttpParams();

        if (userId !== null && userId !== undefined) {
          params = params.append('userId', userId.toString());
        }
        if (status !== null && status !== undefined) {
          params = params.append('status', status);
        }
        if (minDate !== null && minDate !== undefined && minDate !== '') {
          params = params.append('minDate', minDate);
        }
        if (maxDate !== null && maxDate !== undefined && maxDate !== '') {
          params = params.append('maxDate', maxDate);
        }
        if (minTotalAmount !== null && minTotalAmount !== undefined) {
          params = params.append('minTotalAmount', minTotalAmount.toString());
        }
        if (maxTotalAmount !== null && maxTotalAmount !== undefined) {
          params = params.append('maxTotalAmount', maxTotalAmount.toString());
        }
        if (username !== null && username !== undefined && username.trim() !== '') {
          params = params.append('username', username);
        }

        return this.http.get<Order[]>(`${this.orderApiUrl}/search`, { params });
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred in OrderService:', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
