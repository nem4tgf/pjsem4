// src/app/service/order-detail.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { OrderDetail, OrderDetailRequest } from '../interface/order-detail.interface'; // Import OrderDetailRequest
import { environment } from './enviroment';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailService extends ApiService {
  private orderDetailApiUrl = `${environment.apiUrl}/order-details`;

  constructor(http: HttpClient) {
    super(http);
  }

  getOrderDetailById(id: number): Observable<OrderDetail> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<OrderDetail>(`${this.orderDetailApiUrl}/${id}`)),
      catchError(this.handleError)
    );
  }

  getOrderDetailsByOrderId(orderId: number): Observable<OrderDetail[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<OrderDetail[]>(`${this.orderDetailApiUrl}/order/${orderId}`)),
      catchError(this.handleError)
    );
  }

  getAllOrderDetails(): Observable<OrderDetail[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<OrderDetail[]>(this.orderDetailApiUrl)),
      catchError(this.handleError)
    );
  }

  // Cập nhật kiểu dữ liệu của 'request' thành OrderDetailRequest
  updateOrderDetail(id: number, request: OrderDetailRequest): Observable<OrderDetail> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.put<OrderDetail>(`${this.orderDetailApiUrl}/${id}`, request)),
      catchError(this.handleError)
    );
  }

  deleteOrderDetail(id: number): Observable<void> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.delete<void>(`${this.orderDetailApiUrl}/${id}`)),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred in OrderDetailService:', error);
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
