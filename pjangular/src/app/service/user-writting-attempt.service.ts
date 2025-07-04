// src/app/service/user-writing-attempt.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserWritingAttempt, UserWritingAttemptPage, UserWritingAttemptRequest, UserWritingAttemptSearchRequest } from '../interface/user-writting.interface';


@Injectable({
  providedIn: 'root'
})
export class UserWritingAttemptService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Lưu một lần thử viết mới của người dùng.
   * Endpoint Backend: POST /api/writing-attempts
   * @param request DTO UserWritingAttemptRequest chứa thông tin lần thử viết.
   * @returns Observable<UserWritingAttempt> của lần thử đã lưu.
   */
  saveWritingAttempt(request: UserWritingAttemptRequest): Observable<UserWritingAttempt> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<UserWritingAttempt>(`${this.apiUrl}/writing-attempts`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Cập nhật một lần thử viết hiện có của người dùng.
   * Endpoint Backend: PUT /api/writing-attempts/{attemptId}
   * @param attemptId ID của lần thử viết cần cập nhật.
   * @param request DTO UserWritingAttemptRequest chứa thông tin cập nhật lần thử viết.
   * @returns Observable<UserWritingAttempt> của lần thử đã cập nhật.
   */
  updateWritingAttempt(attemptId: number, request: UserWritingAttemptRequest): Observable<UserWritingAttempt> {
    return this.checkAdminRole().pipe( // Giả định chỉ admin mới có quyền update
      switchMap(() => this.http.put<UserWritingAttempt>(`${this.apiUrl}/writing-attempts/${attemptId}`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy thông tin chi tiết một lần thử viết theo ID.
   * Endpoint Backend: GET /api/writing-attempts/{attemptId}
   * @param attemptId ID của lần thử viết.
   * @returns Observable<UserWritingAttempt>
   */
  getWritingAttemptById(attemptId: number): Observable<UserWritingAttempt> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<UserWritingAttempt>(`${this.apiUrl}/writing-attempts/${attemptId}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy tất cả các lần thử viết của một người dùng cụ thể.
   * Endpoint Backend: GET /api/writing-attempts/user/{userId}
   * @param userId ID của người dùng.
   * @returns Observable<UserWritingAttempt[]>
   */
  getWritingAttemptsByUser(userId: number): Observable<UserWritingAttempt[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<UserWritingAttempt[]>(`${this.apiUrl}/writing-attempts/user/${userId}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy tất cả các lần thử viết cho một hoạt động luyện tập cụ thể.
   * Endpoint Backend: GET /api/writing-attempts/practice-activity/{practiceActivityId}
   * @param practiceActivityId ID của hoạt động luyện tập.
   * @returns Observable<UserWritingAttempt[]>
   */
  getWritingAttemptsByPracticeActivity(practiceActivityId: number): Observable<UserWritingAttempt[]> {
    return this.http.get<UserWritingAttempt[]>(`${this.apiUrl}/writing-attempts/practice-activity/${practiceActivityId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Tìm kiếm và phân trang các lần thử viết của người dùng.
   * Endpoint Backend: GET /api/writing-attempts/search
   * Chỉ ADMIN mới có quyền truy cập.
   * @param searchRequest DTO chứa các tiêu chí tìm kiếm và thông tin phân trang.
   * @returns Observable<UserWritingAttemptPage>
   */
  searchWritingAttempts(searchRequest: UserWritingAttemptSearchRequest): Observable<UserWritingAttemptPage> {
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
    if (searchRequest.minOverallScore !== undefined && searchRequest.minOverallScore !== null) {
      params = params.append('minOverallScore', searchRequest.minOverallScore.toString());
    }
    if (searchRequest.maxOverallScore !== undefined && searchRequest.maxOverallScore !== null) {
      params = params.append('maxOverallScore', searchRequest.maxOverallScore.toString());
    }
    // Sử dụng giá trị page và size đã được kiểm tra
    params = params.append('page', page.toString());
    params = params.append('size', size.toString());

    return this.checkAdminRole().pipe( // Giả định chỉ admin mới có quyền search
      switchMap(() => this.http.get<UserWritingAttemptPage>(`${this.apiUrl}/writing-attempts/search`, { params })),
      catchError(this.handleError)
    );
  }

  /**
   * Xóa một lần thử viết.
   * Endpoint Backend: DELETE /api/writing-attempts/{attemptId}
   * @param attemptId ID của lần thử viết cần xóa.
   * @returns Observable<void>
   */
  deleteWritingAttempt(attemptId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/writing-attempts/${attemptId}`)),
      catchError(this.handleError)
    );
  }
}
