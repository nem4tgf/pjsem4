// src/app/service/progress.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
// Đảm bảo import ProgressRequest vì nó là DTO bạn sẽ gửi đi
import { Progress, ProgressRequest, ProgressSearchRequest, ProgressPageResponse, ActivityType } from '../interface/progress.interface';

@Injectable({
  providedIn: 'root'
})
export class ProgressService extends ApiService {
  // Base URL cho các API liên quan đến tiến độ
  // Đảm bảo rằng `environment.apiUrl` của bạn trỏ đến `http://localhost:8080/api`
  // để đường dẫn cuối cùng là `http://localhost:8080/api/progress`
  private progressApiUrl = `${this.apiUrl}/progress`;

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Tạo mới một bản ghi tiến độ.
   * Endpoint Backend: POST /api/progress
   * Yêu cầu quyền USER hoặc ADMIN.
   * @param request DTO ProgressRequest chứa thông tin tiến độ cần tạo.
   * @returns Observable<Progress> của bản ghi tiến độ đã được tạo.
   */
  createProgress(request: ProgressRequest): Observable<Progress> {
    return this.checkAuth().pipe(
      // Gửi POST request đến /api/progress
      switchMap(() => this.http.post<Progress>(this.progressApiUrl, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Cập nhật một bản ghi tiến độ hiện có.
   * Endpoint Backend: PUT /api/progress/{progressId}
   * Yêu cầu quyền USER hoặc ADMIN.
   * @param progressId ID của bản ghi tiến độ cần cập nhật.
   * @param request DTO ProgressRequest chứa thông tin tiến độ cần cập nhật.
   * @returns Observable<Progress> của bản ghi tiến độ đã được cập nhật.
   */
  updateProgress(progressId: number, request: ProgressRequest): Observable<Progress> {
    return this.checkAuth().pipe(
      // Gửi PUT request đến /api/progress/{progressId}
      switchMap(() => this.http.put<Progress>(`${this.progressApiUrl}/${progressId}`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy tiến độ của một loại hoạt động cụ thể trong một bài học của người dùng.
   * Endpoint Backend: GET /api/progress/user/{userId}/lesson/{lessonId}/activity/{activityType}
   * Yêu cầu quyền USER hoặc ADMIN.
   * @param userId ID của người dùng.
   * @param lessonId ID của bài học.
   * @param activityType Loại hoạt động (enum ActivityType).
   * @returns Observable<Progress> của tiến độ hoạt động cụ thể.
   */
  getProgressByActivity(userId: number, lessonId: number, activityType: ActivityType): Observable<Progress> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Progress>(`${this.progressApiUrl}/user/${userId}/lesson/${lessonId}/activity/${activityType}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy tổng phần trăm hoàn thành của một bài học cho một người dùng (tổng thể).
   * Endpoint Backend: GET /api/progress/user/{userId}/lesson/{lessonId}/overall
   * Yêu cầu quyền USER hoặc ADMIN.
   * @param userId ID của người dùng.
   * @param lessonId ID của bài học.
   * @returns Observable<Progress> tổng thể của bài học.
   */
  getOverallLessonProgress(userId: number, lessonId: number): Observable<Progress> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Progress>(`${this.progressApiUrl}/user/${userId}/lesson/${lessonId}/overall`)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy tất cả các bản ghi tiến độ của một người dùng.
   * Sẽ trả về danh sách các bản ghi tiến độ cho TỪNG hoạt động mà người dùng đã thực hiện.
   * Endpoint Backend: GET /api/progress/user/{userId}
   * Yêu cầu quyền USER hoặc ADMIN.
   * @param userId ID của người dùng.
   * @returns Observable<Progress[]> chứa danh sách ProgressResponse của người dùng.
   */
  getProgressByUser(userId: number): Observable<Progress[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Progress[]>(`${this.progressApiUrl}/user/${userId}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Xóa một bản ghi tiến độ.
   * Endpoint Backend: DELETE /api/progress/{progressId}
   * Chỉ ADMIN mới có quyền.
   * @param progressId ID của bản ghi tiến độ cần xóa.
   * @returns Observable<void>
   */
  deleteProgress(progressId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.progressApiUrl}/${progressId}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Tìm kiếm và phân trang các bản ghi tiến độ dựa trên các tiêu chí tùy chọn.
   * Endpoint Backend: POST /api/progress/search
   * Chỉ ADMIN mới có quyền.
   * @param request DTO ProgressSearchRequest chứa các tiêu chí tìm kiếm và thông tin phân trang/sắp xếp.
   * @returns Observable<ProgressPageResponse> của trang kết quả.
   */
  searchProgress(request: ProgressSearchRequest): Observable<ProgressPageResponse> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<ProgressPageResponse>(`${this.progressApiUrl}/search`, request)),
      catchError(this.handleError)
    );
  }
}
