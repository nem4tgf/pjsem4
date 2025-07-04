// src/app/service/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // Import HttpParams cho search
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, UserUpdateRequest, UserSearchRequest, UserPageResponse, Role } from '../interface/user.interface'; // Cập nhật import
import { RegisterRequest } from '../interface/auth.interface'; // Import RegisterRequest cho adminCreateUser

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Lấy tất cả người dùng.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/users
   * @returns Observable<User[]>
   */
  getAllUsers(): Observable<User[]> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // nên không cần checkAuth() hay checkAdminRole() ở đây.
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Lấy người dùng theo username.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/users/username/{username}
   * @param username Tên người dùng.
   * @returns Observable<User>
   */
  getUserByUsername(username: string): Observable<User> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // nên không cần checkAuth() hay checkAdminRole() ở đây.
    return this.http.get<User>(`${this.apiUrl}/users/username/${username}`).pipe(
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Lấy người dùng theo email.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/users/email/{email}
   * @param email Email người dùng.
   * @returns Observable<User>
   */
  getUserByEmail(email: string): Observable<User> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // nên không cần checkAuth() hay checkAdminRole() ở đây.
    return this.http.get<User>(`${this.apiUrl}/users/email/${email}`).pipe(
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Lấy người dùng theo ID.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/users/{userId}
   * @param userId ID người dùng.
   * @returns Observable<User>
   */
  getUserById(userId: number): Observable<User> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // nên không cần checkAuth() hay checkAdminRole() ở đây.
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`).pipe(
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * ADMIN tạo người dùng mới (bao gồm cả ADMIN khác).
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: POST /api/users/admin-create
   * @param request DTO RegisterRequest chứa thông tin người dùng mới (bao gồm vai trò).
   * @returns Observable<User> của người dùng đã tạo.
   */
  adminCreateUser(request: RegisterRequest): Observable<User> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<User>(`${this.apiUrl}/users/admin-create`, request)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Cập nhật thông tin người dùng.
   * Endpoint Backend: PUT /api/users/{userId}
   * Cả USER và ADMIN đều có quyền (USER chỉ có thể cập nhật thông tin của chính mình).
   * @param userId ID người dùng cần cập nhật.
   * @param request DTO UserUpdateRequest chứa các trường cần cập nhật (username, email, fullName, avatarUrl, role, password).
   * @returns Observable<User> đã cập nhật.
   */
  updateUser(userId: number, request: UserUpdateRequest): Observable<User> { // Thay đổi kiểu tham số
    // Backend controller không có @PreAuthorize cho endpoint này,
    // nhưng việc này thường được bảo vệ để user chỉ update của chính họ,
    // hoặc admin update bất kỳ ai. Dùng checkAuth() để đảm bảo user đã đăng nhập.
    return this.checkAuth().pipe(
      switchMap(() => this.http.put<User>(`${this.apiUrl}/users/${userId}`, request)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Xóa người dùng.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: DELETE /api/users/{userId}
   * @param userId ID người dùng cần xóa.
   * @returns Observable<void>
   */
  deleteUser(userId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/users/${userId}`)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Tìm kiếm và phân trang người dùng dựa trên các tiêu chí tùy chọn.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/users/search
   * @param request DTO UserSearchRequest chứa các tiêu chí tìm kiếm và thông tin phân trang/sắp xếp.
   * @returns Observable<UserPageResponse> của trang kết quả.
   */
  searchUsers(request: UserSearchRequest): Observable<UserPageResponse> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // và sử dụng @ModelAttribute để ánh xạ query params vào DTO.
    // Angular HttpClient.get có thể nhận một đối tượng làm giá trị cho 'params',
    // nó sẽ tự động chuyển đổi các thuộc tính của đối tượng đó thành query parameters.
    return this.http.get<UserPageResponse>(`${this.apiUrl}/users/search`, { params: request as any }).pipe(
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }
}
