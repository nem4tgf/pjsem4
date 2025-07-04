// src/app/service/payment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Payment, PaymentRequest, PaymentStatus, PaymentSearchRequest, PaymentPageResponse } from '../interface/payment.interface'; // Thêm PaymentSearchRequest, PaymentPageResponse
// Không cần import environment ở đây vì ApiService đã xử lý apiUrl

@Injectable({
  providedIn: 'root'
})
// Kế thừa ApiService để sử dụng this.apiUrl và this.handleError
export class PaymentService extends ApiService {
  // Không cần khai báo private paymentApiUrl ở đây.
  // this.apiUrl từ ApiService sẽ là `${environment.apiUrl}`
  // và chúng ta sẽ nối thêm '/payments' vào trong mỗi request.

  constructor(http: HttpClient) {
    super(http); // Gọi constructor của lớp cha
  }

  /**
   * Lấy tất cả các giao dịch thanh toán.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: GET /api/payments
   * @returns Observable<Payment[]>
   */
  getAllPayments(): Observable<Payment[]> {
    // Backend controller yêu cầu quyền ADMIN
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Payment[]>(`${this.apiUrl}/payments`)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Lấy thông tin thanh toán bằng ID.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: GET /api/payments/{id}
   * @param id ID của thanh toán.
   * @returns Observable<Payment>
   */
  getPaymentById(id: number): Observable<Payment> {
    // Backend controller yêu cầu quyền ADMIN
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Payment>(`${this.apiUrl}/payments/${id}`)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Lấy tất cả các giao dịch thanh toán của một người dùng cụ thể.
   * Cả USER và ADMIN đều có quyền (backend sẽ xử lý việc USER chỉ xem được của chính mình).
   * Endpoint Backend: GET /api/payments/user/{userId}
   * @param userId ID của người dùng.
   * @returns Observable<Payment[]>
   */
  getPaymentsByUserId(userId: number): Observable<Payment[]> {
    // Backend controller cho phép cả USER và ADMIN, nên checkAuth() là phù hợp.
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Payment[]>(`${this.apiUrl}/payments/user/${userId}`)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Tạo một bản ghi thanh toán trong hệ thống.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: POST /api/payments
   * @param request DTO PaymentRequest chứa thông tin thanh toán.
   * @returns Observable<Payment> của giao dịch đã tạo.
   */
  createPayment(request: PaymentRequest): Observable<Payment> {
    // Backend controller yêu cầu quyền ADMIN
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<Payment>(`${this.apiUrl}/payments`, request)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Xóa một giao dịch thanh toán.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: DELETE /api/payments/{id}
   * @param id ID của thanh toán cần xóa.
   * @returns Observable<void>
   */
  deletePayment(id: number): Observable<void> {
    // Backend controller yêu cầu quyền ADMIN
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/payments/${id}`)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Khởi tạo quá trình thanh toán PayPal, tạo bản ghi Payment ở trạng thái PENDING.
   * Yêu cầu quyền USER hoặc ADMIN.
   * Endpoint Backend: POST /api/payments/paypal/initiate
   * @param request PaymentRequest chứa userId, orderId, amount, cancelUrl và successUrl.
   * @returns Observable<string> URL phê duyệt của PayPal.
   */
  initiatePayPalPayment(request: PaymentRequest): Observable<string> {
    // Backend controller cho phép cả USER và ADMIN, nên checkAuth() là phù hợp.
    return this.checkAuth().pipe(
      switchMap(() => this.http.post(`${this.apiUrl}/payments/paypal/initiate`, request, { responseType: 'text' })),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Hoàn tất quá trình thanh toán PayPal sau khi người dùng chấp thuận.
   * Endpoint này sẽ được PayPal gọi lại.
   * KHÔNG YÊU CẦU XÁC THỰC ở frontend vì backend controller không có @PreAuthorize.
   * @param paymentId ID giao dịch PayPal.
   * @param payerId ID người thanh toán từ PayPal.
   * @returns Observable<Payment> của giao dịch đã hoàn tất.
   */
  completePayPalPayment(paymentId: string, payerId: string): Observable<Payment> {
    const params = new HttpParams()
      .set('paymentId', paymentId)
      .set('PayerID', payerId); // PayerID với chữ 'P' hoa

    // Không cần checkAuth() vì endpoint backend không yêu cầu xác thực.
    return this.http.get<Payment>(`${this.apiUrl}/payments/paypal/complete`, { params }).pipe(
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Endpoint được gọi khi người dùng hủy thanh toán trên PayPal.
   * KHÔNG YÊU CẦU XÁC THỰC ở frontend vì backend controller không có @PreAuthorize.
   * @param token Token từ PayPal.
   * @returns Observable<string> với thông báo hủy.
   */
  cancelPayPalPayment(token: string): Observable<string> {
    const params = new HttpParams().set('token', token);
    // Không cần checkAuth() vì endpoint backend không yêu cầu xác thực.
    return this.http.get(`${this.apiUrl}/payments/paypal/cancel`, { params, responseType: 'text' }).pipe(
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Tìm kiếm thanh toán với các tiêu chí và phân trang.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: POST /api/payments/search
   * @param request DTO PaymentSearchRequest chứa tiêu chí tìm kiếm và thông tin phân trang/sắp xếp.
   * @returns Observable<PaymentPageResponse> của trang kết quả.
   */
  searchPayments(request: PaymentSearchRequest): Observable<PaymentPageResponse> {
    // Backend controller yêu cầu quyền ADMIN
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<PaymentPageResponse>(`${this.apiUrl}/payments/search`, request)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }
}
