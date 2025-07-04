// src/app/service/user-listening-attempt.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserListeningAttempt, UserListeningAttemptPage, UserListeningAttemptRequest, UserListeningAttemptSearchRequest } from '../interface/user_listening.interface';


@Injectable({
  providedIn: 'root'
})
export class UserListeningAttemptService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Lưu một lần thử nghe của người dùng.
   * Endpoint Backend: POST /api/listening-attempts
   * @param request DTO UserListeningAttemptRequest chứa dữ liệu lần thử nghe.
   * @returns Observable<UserListeningAttempt> đã lưu.
   */
  saveListeningAttempt(request: UserListeningAttemptRequest): Observable<UserListeningAttempt> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<UserListeningAttempt>(`${this.apiUrl}/listening-attempts`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Cập nhật một lần thử nghe hiện có của người dùng.
   * Endpoint Backend: PUT /api/listening-attempts/{attemptId}
   * @param attemptId ID của lần thử nghe cần cập nhật.
   * @param request DTO UserListeningAttemptRequest chứa thông tin cập nhật lần thử nghe.
   * @returns Observable<UserListeningAttempt> đã cập nhật.
   */
  updateListeningAttempt(attemptId: number, request: UserListeningAttemptRequest): Observable<UserListeningAttempt> {
    return this.checkAdminRole().pipe( // Giả định chỉ admin mới có quyền update
      switchMap(() => this.http.put<UserListeningAttempt>(`${this.apiUrl}/listening-attempts/${attemptId}`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy thông tin một lần thử nghe bằng ID.
   * Endpoint Backend: GET /api/listening-attempts/{id}
   * @param id ID của lần thử nghe.
   * @returns Observable<UserListeningAttempt>
   */
  getListeningAttemptById(id: number): Observable<UserListeningAttempt> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<UserListeningAttempt>(`${this.apiUrl}/listening-attempts/${id}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy tất cả các lần thử nghe của một người dùng cụ thể.
   * Endpoint Backend: GET /api/listening-attempts/user/{userId}
   * @param userId ID của người dùng.
   * @returns Observable<UserListeningAttempt[]>
   */
  getListeningAttemptsByUser(userId: number): Observable<UserListeningAttempt[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<UserListeningAttempt[]>(`${this.apiUrl}/listening-attempts/user/${userId}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy tất cả các lần thử nghe cho một hoạt động luyện tập cụ thể.
   * Endpoint Backend: GET /api/listening-attempts/practice-activity/{practiceActivityId}
   * @param practiceActivityId ID của hoạt động luyện tập.
   * @returns Observable<UserListeningAttempt[]>
   */
  getListeningAttemptsByPracticeActivity(practiceActivityId: number): Observable<UserListeningAttempt[]> {
    return this.http.get<UserListeningAttempt[]>(`${this.apiUrl}/listening-attempts/practice-activity/${practiceActivityId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Tìm kiếm và phân trang các lần thử nghe của người dùng.
   * Endpoint Backend: GET /api/listening-attempts/search
   * Chỉ ADMIN mới có quyền truy cập.
   * @param searchRequest DTO chứa các tiêu chí tìm kiếm và thông tin phân trang.
   * @returns Observable<UserListeningAttemptPage>
   */
  searchListeningAttempts(searchRequest: UserListeningAttemptSearchRequest): Observable<UserListeningAttemptPage> {
    let params = new HttpParams();

    // Thêm kiểm tra và gán giá trị mặc định cho page và size
    const page = (searchRequest.page !== undefined && searchRequest.page !== null && !isNaN(searchRequest.page)) ? searchRequest.page : 0; // Mặc định là trang 0
    const size = (searchRequest.size !== undefined && searchRequest.size !== null && !isNaN(searchRequest.size)) ? searchRequest.size : 10; // Mặc định là 10 bản ghi mỗi trang

    if (searchRequest.userId !== undefined && searchRequest.userId !== null) {
      params = params.append('userId', searchRequest.userId.toString());
    }
    if (searchRequest.practiceActivityId !== undefined && searchRequest.practiceActivityId !== null) {
      params = params.append('practiceActivityId', searchRequest.practiceActivityId.toString());
    }
    if (searchRequest.minAccuracyScore !== undefined && searchRequest.minAccuracyScore !== null) {
      params = params.append('minAccuracyScore', searchRequest.minAccuracyScore.toString());
    }
    if (searchRequest.maxAccuracyScore !== undefined && searchRequest.maxAccuracyScore !== null) {
      params = params.append('maxAccuracyScore', searchRequest.maxAccuracyScore.toString());
    }
    // Sử dụng giá trị page và size đã được kiểm tra
    params = params.append('page', page.toString());
    params = params.append('size', size.toString());

    return this.checkAdminRole().pipe( // Giả định chỉ admin mới có quyền search
      switchMap(() => this.http.get<UserListeningAttemptPage>(`${this.apiUrl}/listening-attempts/search`, { params })),
      catchError(this.handleError)
    );
  }


  /**
   * Xóa một lần thử nghe.
   * Endpoint Backend: DELETE /api/listening-attempts/{id}
   * @param id ID của lần thử nghe cần xóa.
   * @returns Observable<void>
   */
  deleteListeningAttempt(id: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/listening-attempts/${id}`)),
      catchError(this.handleError)
    );
  }
}
