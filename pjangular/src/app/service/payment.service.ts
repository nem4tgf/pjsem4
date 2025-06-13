// src/app/service/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Payment, PaymentRequest, PaymentStatus } from '../interface/payment.interface'; // Import PaymentRequest
import { environment } from './enviroment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService extends ApiService {
  private paymentApiUrl = `${environment.apiUrl}/payments`;

  constructor(http: HttpClient) {
    super(http);
  }

  getAllPayments(): Observable<Payment[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Payment[]>(this.paymentApiUrl)),
      catchError(this.handleError)
    );
  }

  getPaymentById(id: number): Observable<Payment> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Payment>(`${this.paymentApiUrl}/${id}`)),
      catchError(this.handleError)
    );
  }

  getPaymentsByUserId(userId: number): Observable<Payment[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Payment[]>(`${this.paymentApiUrl}/user/${userId}`)),
      catchError(this.handleError)
    );
  }

  createPayment(request: PaymentRequest): Observable<Payment> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<Payment>(this.paymentApiUrl, request)),
      catchError(this.handleError)
    );
  }

  deletePayment(id: number): Observable<void> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.delete<void>(`${this.paymentApiUrl}/${id}`)),
      catchError(this.handleError)
    );
  }

  // THAY ĐỔI LỚN TẠI ĐÂY: initiatePayPalPayment giờ nhận cancelUrl và successUrl trong request body
  initiatePayPalPayment(userId: number, orderId: number, amount: number, cancelUrl: string, successUrl: string): Observable<string> {
    const requestBody: PaymentRequest = {
      userId: userId,
      orderId: orderId,
      amount: amount,
      paymentMethod: 'PayPal', // Đảm bảo khớp với giá trị enum/string ở backend
      description: `Thanh toán PayPal cho đơn hàng #${orderId}`,
      cancelUrl: cancelUrl, // Đã thêm vào body
      successUrl: successUrl  // Đã thêm vào body
    };

    // Không cần HttpParams nữa vì đã đưa vào body
    return this.checkAuth().pipe(
      switchMap(() => this.http.post(`${this.paymentApiUrl}/paypal/initiate`, requestBody, { responseType: 'text' })),
      catchError(this.handleError)
    );
  }

  completePayPalPayment(paymentId: string, payerId: string): Observable<Payment> {
    const params = new HttpParams()
      .set('paymentId', paymentId)
      .set('PayerID', payerId); // PayerID với chữ 'P' hoa

    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Payment>(`${this.paymentApiUrl}/paypal/complete`, { params })),
      catchError(this.handleError)
    );
  }

  cancelPayPalPayment(token: string): Observable<string> {
    const params = new HttpParams().set('token', token);
    return this.checkAuth().pipe(
      switchMap(() => this.http.get(`${this.paymentApiUrl}/paypal/cancel`, { params, responseType: 'text' })),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred in PaymentService:', error);
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
