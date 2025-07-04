// src/app/service/lesson.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Lesson, LessonRequest, LessonSearchRequest, LessonPageResponse } from '../interface/lesson.interface'; // Cập nhật import LessonRequest
import { ApiService } from './api.service'; // Đảm bảo import ApiService
import { environment } from './enviroment';

@Injectable({
  providedIn: 'root'
})
// Kế thừa ApiService để sử dụng các phương thức checkAuth và checkAdminRole
export class LessonService extends ApiService {
  // apiService đã được inject qua constructor của lớp cha
  // apiUrl đã được định nghĩa trong ApiService, có thể truy cập bằng this.apiUrl
  // Không cần khai báo lại private apiUrl ở đây.

  constructor(http: HttpClient) {
    super(http); // Gọi constructor của lớp cha
  }

  /**
   * Tạo một bài học mới.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: POST /api/lessons
   * @param request DTO LessonRequest chứa thông tin bài học.
   * @returns Observable<Lesson> của bài học đã tạo.
   */
  createLesson(request: LessonRequest): Observable<Lesson> { // Thay đổi kiểu tham số
    console.log('Attempting to create lesson with request:', request);
    // Sử dụng checkAdminRole vì backend yêu cầu quyền ADMIN
    return this.checkAdminRole().pipe(
      switchMap(() => {
        console.log('Authorization checked, sending POST request');
        // Không cần bóc tách createdAt vì LessonRequest không có trường này.
        // Backend mong đợi LessonRequest DTO.
        return this.http.post<Lesson>(`${this.apiUrl}/lessons`, request);
      }),
      catchError(err => {
        console.error('Create lesson error:', err);
        return throwError(() => new Error(err.message || 'Failed to create lesson'));
      })
    );
  }

  /**
   * Lấy thông tin một bài học theo ID.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/lessons/{lessonId}
   * @param lessonId ID của bài học.
   * @returns Observable<Lesson>
   */
  getLessonById(lessonId: number): Observable<Lesson> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // nên không cần checkAuth() hay checkAdminRole() ở đây.
    return this.http.get<Lesson>(`${this.apiUrl}/lessons/${lessonId}`).pipe(
      catchError(err => {
        console.error(`Get lesson with ID ${lessonId} error:`, err);
        return throwError(() => new Error(err.message || `Failed to get lesson with ID ${lessonId}`));
      })
    );
  }

  /**
   * Lấy tất cả các bài học đang hoạt động (không bị xóa mềm).
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/lessons
   * @returns Observable<Lesson[]>
   */
  getAllLessons(): Observable<Lesson[]> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // nên không cần checkAuth() hay checkAdminRole() ở đây.
    return this.http.get<Lesson[]>(`${this.apiUrl}/lessons`).pipe(
      catchError(err => {
        console.error('Get all lessons error:', err);
        return throwError(() => new Error(err.message || 'Failed to load all lessons'));
      })
    );
  }

  /**
   * Cập nhật thông tin một bài học.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: PUT /api/lessons/{lessonId}
   * @param lessonId ID của bài học.
   * @param request DTO LessonRequest chứa thông tin cập nhật.
   * @returns Observable<Lesson>
   */
  updateLesson(lessonId: number, request: LessonRequest): Observable<Lesson> { // Thay đổi kiểu tham số
    console.log('Attempting to update lesson with ID:', lessonId, 'and request:', request);
    // Sử dụng checkAdminRole vì backend yêu cầu quyền ADMIN
    return this.checkAdminRole().pipe(
      switchMap(() => {
        // Không cần bóc tách createdAt vì LessonRequest không có trường này.
        // Backend mong đợi LessonRequest DTO.
        return this.http.put<Lesson>(`${this.apiUrl}/lessons/${lessonId}`, request);
      }),
      catchError(err => {
        console.error(`Update lesson with ID ${lessonId} error:`, err);
        return throwError(() => new Error(err.message || `Failed to update lesson with ID ${lessonId}`));
      })
    );
  }

  /**
   * Xóa mềm (soft delete) một bài học.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: DELETE /api/lessons/{lessonId}/soft
   * @param lessonId ID của bài học.
   * @returns Observable<void>
   */
  softDeleteLesson(lessonId: number): Observable<void> {
    console.log('Attempting to soft delete lesson with ID:', lessonId);
    // Sử dụng checkAdminRole vì backend yêu cầu quyền ADMIN
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/lessons/${lessonId}/soft`)), // Cập nhật endpoint
      catchError(err => {
        console.error(`Soft delete lesson with ID ${lessonId} error:`, err);
        return throwError(() => new Error(err.message || `Failed to soft delete lesson with ID ${lessonId}`));
      })
    );
  }

  /**
   * Khôi phục (restore) một bài học đã bị xóa mềm.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: PATCH /api/lessons/{lessonId}/restore
   * @param lessonId ID của bài học.
   * @returns Observable<Lesson>
   */
  restoreLesson(lessonId: number): Observable<Lesson> {
    console.log('Attempting to restore lesson with ID:', lessonId);
    // Sử dụng checkAdminRole vì backend yêu cầu quyền ADMIN
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.patch<Lesson>(`${this.apiUrl}/lessons/${lessonId}/restore`, {})), // Gửi body rỗng hoặc null
      catchError(err => {
        console.error(`Restore lesson with ID ${lessonId} error:`, err);
        return throwError(() => new Error(err.message || `Failed to restore lesson with ID ${lessonId}`));
      })
    );
  }

  /**
   * Tìm kiếm bài học với các tiêu chí và phân trang.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: POST /api/lessons/search
   * @param request DTO LessonSearchRequest chứa tiêu chí tìm kiếm và thông tin phân trang/sắp xếp.
   * @returns Observable<LessonPageResponse>
   */
  searchLessons(request: LessonSearchRequest): Observable<LessonPageResponse> {
    console.log('Attempting to search lessons with request:', request);
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // nên không cần checkAuth() hay checkAdminRole() ở đây.
    return this.http.post<LessonPageResponse>(`${this.apiUrl}/lessons/search`, request).pipe(
      catchError(err => {
        console.error('Search lessons error:', err);
        return throwError(() => new Error(err.message || 'Failed to search lessons'));
      })
    );
  }
}
