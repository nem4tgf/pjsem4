// src/app/service/enrollment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Enrollment } from '../interface/enrollment.interface';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService extends ApiService {
  // Bỏ khai báo 'private apiUrl' ở đây.
  // 'apiUrl' đã được định nghĩa là 'protected' trong ApiService
  // nên EnrollmentService có thể truy cập trực tiếp `this.apiUrl`
  // Hoặc bạn có thể định nghĩa lại nó là protected nếu cần ghi đè,
  // nhưng trong trường hợp này không cần thiết.

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Lấy danh sách tất cả các đăng ký khóa học.
   * Yêu cầu quyền ADMIN.
   */
  getAllEnrollments(): Observable<Enrollment[]> {
    return this.checkAdminRole().pipe( // Đảm bảo chỉ admin mới có thể gọi
      switchMap(() => this.http.get<Enrollment[]>(`${this.apiUrl}/enrollments`)) // Sử dụng this.apiUrl từ lớp cha
    );
  }

  /**
   * Lấy danh sách các đăng ký khóa học sắp hết hạn hoặc đã hết hạn.
   * Yêu cầu quyền ADMIN.
   */
  getExpiringEnrollments(): Observable<Enrollment[]> {
    return this.checkAdminRole().pipe( // Đảm bảo chỉ admin mới có thể gọi
      switchMap(() => this.http.get<Enrollment[]>(`${this.apiUrl}/enrollments/expiring`)) // Sử dụng this.apiUrl từ lớp cha
    );
  }

  /**
   * Đăng ký người dùng vào một khóa học.
   * Có thể được gọi bởi USER hoặc ADMIN.
   */
  enrollUserInLesson(userId: number, lessonId: number): Observable<Enrollment> {
    const requestBody = { userId, lessonId };
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<Enrollment>(`${this.apiUrl}/enrollments/enroll`, requestBody)) // Sử dụng this.apiUrl từ lớp cha
    );
  }

  /**
   * Xóa một đăng ký khóa học.
   * Yêu cầu quyền ADMIN.
   */
  deleteEnrollment(enrollmentId: number): Observable<void> {
    return this.checkAdminRole().pipe( // Đảm bảo chỉ admin mới có thể gọi
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/enrollments/${enrollmentId}`)) // Sử dụng this.apiUrl từ lớp cha
    );
  }
}
