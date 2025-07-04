import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Enrollment, EnrollmentRequest, EnrollmentPage, EnrollmentSearchRequest } from '../interface/enrollment.interface';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Lấy danh sách tất cả các đăng ký khóa học.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: GET /api/enrollments
   */
  getAllEnrollments(): Observable<Enrollment[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Enrollment[]>(`${this.apiUrl}/enrollments`)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy thông tin một đăng ký theo ID.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: GET /api/enrollments/{enrollmentId}
   */
  getEnrollmentById(enrollmentId: number): Observable<Enrollment> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Enrollment>(`${this.apiUrl}/enrollments/${enrollmentId}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy danh sách các đăng ký của một người dùng cụ thể.
   * Sử dụng endpoint search để lọc theo userId.
   * Có thể được gọi bởi USER (cho chính họ) hoặc ADMIN.
   * Endpoint Backend: POST /api/enrollments/search
   */
  getUserEnrollments(userId: number): Observable<Enrollment[]> {
    const request: EnrollmentSearchRequest = {
      userId,
      page: 0,
      size: 1000, // Lấy số lượng lớn để đảm bảo lấy hết
      sortBy: 'enrollmentId',
      sortDir: 'ASC'
    };
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<EnrollmentPage>(`${this.apiUrl}/enrollments/search`, request)),
      map(page => page.content || []),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy danh sách các đăng ký sắp hết hạn hoặc đã hết hạn.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: POST /api/enrollments/search
   */
  getExpiringEnrollments(): Observable<Enrollment[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<EnrollmentPage>(`${this.apiUrl}/enrollments/search`, {
        page: 0,
        size: 1000,
        sortBy: 'enrollmentDate',
        sortDir: 'ASC'
      })),
      map(page => {
        const now = new Date();
        return (page.content || []).filter(enrollment => {
          const expiryDate = new Date(enrollment.expiryDate);
          // Lọc các đăng ký đã hết hạn hoặc sắp hết hạn (trong vòng 7 ngày)
          const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
          return enrollment.status === 'EXPIRED' || (enrollment.status === 'ACTIVE' && daysUntilExpiry <= 7);
        });
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy danh sách đăng ký cho một bài học cụ thể.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: GET /api/enrollments/lesson/{lessonId}
   */
  getEnrollmentsByLessonId(lessonId: number): Observable<Enrollment[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Enrollment[]>(`${this.apiUrl}/enrollments/lesson/${lessonId}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Đăng ký người dùng vào một khóa học.
   * Có thể được gọi bởi USER hoặc ADMIN.
   * Endpoint Backend: POST /api/enrollments
   */
  enrollUserInLesson(request: EnrollmentRequest): Observable<Enrollment> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<Enrollment>(`${this.apiUrl}/enrollments`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Xóa một đăng ký khóa học.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: DELETE /api/enrollments/{enrollmentId}
   */
  deleteEnrollment(enrollmentId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/enrollments/${enrollmentId}`)),
      catchError(this.handleError)
    );
  }

  /**
   * Tìm kiếm đăng ký với các tiêu chí và phân trang.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: POST /api/enrollments/search
   */
  searchEnrollments(searchRequest: EnrollmentSearchRequest): Observable<EnrollmentPage> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<EnrollmentPage>(`${this.apiUrl}/enrollments/search`, searchRequest)),
      catchError(this.handleError)
    );
  }
}
