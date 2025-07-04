import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Order, OrderRequest, OrderStatus, OrderSearchRequest, OrderPageResponse } from '../interface/order.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Lấy tất cả các đơn hàng. Chỉ ADMIN mới có quyền truy cập.
   * Backend endpoint: GET /api/orders/all
   * @returns Observable<Order[]>
   */
  getAllOrders(): Observable<Order[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Order[]>(`${this.apiUrl}/orders/all`)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy thông tin đơn hàng bằng ID. Chỉ ADMIN mới có quyền truy cập.
   * Backend endpoint: GET /api/orders/{id}
   * @param id ID của đơn hàng.
   * @returns Observable<Order>
   */
  getOrderById(id: number): Observable<Order> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Order>(`${this.apiUrl}/orders/${id}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy tất cả các đơn hàng của một người dùng cụ thể.
   * Cả USER và ADMIN đều có quyền (USER chỉ xem được của chính mình, ADMIN xem được của bất kỳ ai).
   * Backend endpoint: GET /api/orders/user/{userId}
   * @param userId ID của người dùng.
   * @returns Observable<Order[]>
   */
  getOrdersByUserId(userId: number): Observable<Order[]> {
    // Backend @PreAuthorize đã được cập nhật để cho phép USER truy cập đơn hàng của chính họ.
    // Frontend cần đảm bảo người dùng đã xác thực.
    return this.checkAuth().pipe( // Sử dụng checkAuth thay vì checkAdminRole
      switchMap(() => this.http.get<Order[]>(`${this.apiUrl}/orders/user/${userId}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Tạo một đơn hàng mới. Cả USER và ADMIN đều có quyền.
   * Backend endpoint: POST /api/orders
   * @param request DTO chứa thông tin đơn hàng.
   * @returns Observable<Order>
   */
  createOrder(request: OrderRequest): Observable<Order> {
    return this.checkAuth().pipe( // Sử dụng checkAuth vì cả USER và ADMIN đều có thể tạo
      switchMap(() => this.http.post<Order>(`${this.apiUrl}/orders`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Cập nhật trạng thái đơn hàng. Chỉ ADMIN mới có quyền.
   * Backend endpoint: PUT /api/orders/{id}/status
   * @param orderId ID của đơn hàng.
   * @param newStatus Trạng thái mới.
   * @returns Observable<Order>
   */
  updateOrderStatus(orderId: number, newStatus: OrderStatus): Observable<Order> {
    const params = new HttpParams().set('status', newStatus);
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/status`, null, { params })),
      catchError(this.handleError)
    );
  }

  /**
   * Xóa một đơn hàng. Chỉ ADMIN mới có quyền.
   * Backend endpoint: DELETE /api/orders/{id}
   * @param id ID của đơn hàng cần xóa.
   * @returns Observable<void>
   */
  deleteOrder(id: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/orders/${id}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Tìm kiếm và phân trang đơn hàng với các tiêu chí tùy chọn. Chỉ ADMIN mới có quyền.
   * Backend endpoint: GET /api/orders/search
   * @param request DTO chứa các tiêu chí tìm kiếm và thông tin phân trang/sắp xếp.
   * @returns Observable<OrderPageResponse>
   */
  searchOrders(request: OrderSearchRequest): Observable<OrderPageResponse> {
    return this.checkAdminRole().pipe(
      switchMap(() => {
        let params = new HttpParams();
        // Thêm tất cả các tham số từ OrderSearchRequest vào HttpParams
        if (request.username) params = params.set('username', request.username);
        if (request.userId) params = params.set('userId', request.userId.toString());
        if (request.status) params = params.set('status', request.status);
        // Chú ý: Backend sử dụng LocalDateTime, nên cần truyền chuỗi ISO 8601
        if (request.minDate) params = params.set('minDate', request.minDate);
        if (request.maxDate) params = params.set('maxDate', request.maxDate);
        if (request.minTotalAmount) params = params.set('minTotalAmount', request.minTotalAmount.toString());
        if (request.maxTotalAmount) params = params.set('maxTotalAmount', request.maxTotalAmount.toString());

        // Tham số phân trang và sắp xếp
        if (request.page !== undefined) params = params.set('page', request.page.toString());
        if (request.size !== undefined) params = params.set('size', request.size.toString());
        if (request.sortBy) params = params.set('sortBy', request.sortBy);
        if (request.sortDir) {
          params = params.set('sortDir', request.sortDir);
        }

        return this.http.get<OrderPageResponse>(`${this.apiUrl}/orders/search`, { params });
      }),
      catchError(this.handleError)
    );
  }
}
