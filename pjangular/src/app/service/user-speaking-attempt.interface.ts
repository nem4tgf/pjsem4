// src/app/service/user-speaking-attempt.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserSpeakingAttempt, UserSpeakingAttemptPage, UserSpeakingAttemptRequest, UserSpeakingAttemptSearchRequest } from '../interface/user-speaking.interface';

@Injectable({
  providedIn: 'root'
})
export class UserSpeakingAttemptService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Lưu một lần thử nói mới của người dùng.
   * Endpoint Backend: POST /api/speaking-attempts
   * @param request DTO UserSpeakingAttemptRequest chứa thông tin lần thử nói.
   * @returns Observable<UserSpeakingAttempt> của lần thử đã lưu.
   */
  saveSpeakingAttempt(request: UserSpeakingAttemptRequest): Observable<UserSpeakingAttempt> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<UserSpeakingAttempt>(`${this.apiUrl}/speaking-attempts`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Cập nhật một lần thử nói hiện có của người dùng.
   * Endpoint Backend: PUT /api/speaking-attempts/{attemptId}
   * @param attemptId ID của lần thử nói cần cập nhật.
   * @param request DTO UserSpeakingAttemptRequest chứa thông tin cập nhật lần thử nói.
   * @returns Observable<UserSpeakingAttempt> của lần thử đã cập nhật.
   */
  updateSpeakingAttempt(attemptId: number, request: UserSpeakingAttemptRequest): Observable<UserSpeakingAttempt> {
    return this.checkAdminRole().pipe( // Giả định chỉ admin mới có quyền update
      switchMap(() => this.http.put<UserSpeakingAttempt>(`${this.apiUrl}/speaking-attempts/${attemptId}`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy thông tin chi tiết một lần thử nói theo ID.
   * Endpoint Backend: GET /api/speaking-attempts/{attemptId}
   * @param attemptId ID của lần thử nói.
   * @returns Observable<UserSpeakingAttempt>
   */
  getSpeakingAttemptById(attemptId: number): Observable<UserSpeakingAttempt> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<UserSpeakingAttempt>(`${this.apiUrl}/speaking-attempts/${attemptId}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy tất cả các lần thử nói của một người dùng cụ thể.
   * Endpoint Backend: GET /api/speaking-attempts/user/{userId}
   * @param userId ID của người dùng.
   * @returns Observable<UserSpeakingAttempt[]>
   */
  getSpeakingAttemptsByUser(userId: number): Observable<UserSpeakingAttempt[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<UserSpeakingAttempt[]>(`${this.apiUrl}/speaking-attempts/user/${userId}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy tất cả các lần thử nói cho một hoạt động luyện tập cụ thể.
   * Endpoint Backend: GET /api/speaking-attempts/practice-activity/{practiceActivityId}
   * @param practiceActivityId ID của hoạt động luyện tập.
   * @returns Observable<UserSpeakingAttempt[]>
   */
  getSpeakingAttemptsByPracticeActivity(practiceActivityId: number): Observable<UserSpeakingAttempt[]> {
    return this.http.get<UserSpeakingAttempt[]>(`${this.apiUrl}/speaking-attempts/practice-activity/${practiceActivityId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Tìm kiếm và phân trang các lần thử nói của người dùng.
   * Endpoint Backend: GET /api/speaking-attempts/search
   * Chỉ ADMIN mới có quyền truy cập.
   * @param searchRequest DTO chứa các tiêu chí tìm kiếm và thông tin phân trang.
   * @returns Observable<UserSpeakingAttemptPage>
   */
  searchSpeakingAttempts(searchRequest: UserSpeakingAttemptSearchRequest): Observable<UserSpeakingAttemptPage> {
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
      switchMap(() => this.http.get<UserSpeakingAttemptPage>(`${this.apiUrl}/speaking-attempts/search`, { params })),
      catchError(this.handleError)
    );
  }

  /**
   * Xóa một lần thử nói.
   * Endpoint Backend: DELETE /api/speaking-attempts/{attemptId}
   * @param attemptId ID của lần thử nói cần xóa.
   * @returns Observable<void>
   */
  deleteSpeakingAttempt(attemptId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/speaking-attempts/${attemptId}`)),
      catchError(this.handleError)
    );
  }
}
