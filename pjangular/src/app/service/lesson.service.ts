// src/app/service/lesson.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Lesson } from '../interface/lesson.interface'; // Đường dẫn này có thể khác tùy thuộc cấu trúc của bạn
import { ApiService } from './api.service';
import { environment } from './enviroment';
@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private apiUrl = `${environment.apiUrl}/lessons`;

  constructor(private http: HttpClient, private apiService: ApiService) {}

  createLesson(request: Lesson): Observable<Lesson> {
    console.log('Attempting to create lesson with request:', request);
    return this.apiService.checkAuth().pipe( // Sử dụng checkAuth từ ApiService
      switchMap(() => {
        console.log('Authorization checked, sending POST request');
        // Đảm bảo request chỉ chứa các trường mà backend mong đợi (createdAt sẽ bị bỏ qua)
        const { createdAt, durationMonths, ...dataToSend } = request; // Loại bỏ createdAt và durationMonths nếu backend tự xử lý
        return this.http.post<Lesson>(this.apiUrl, dataToSend);
      }),
      catchError(err => {
        console.error('Create lesson error:', err);
        return throwError(() => new Error(err.message || 'Failed to create lesson'));
      })
    );
  }

  getLessonById(lessonId: number): Observable<Lesson> {
    // Không cần checkAuth() ở đây nếu đây là API public hoặc bạn muốn nó luôn khả dụng
    // Nếu bạn muốn yêu cầu xác thực, hãy thêm checkAuth()
    return this.http.get<Lesson>(`${this.apiUrl}/${lessonId}`).pipe(
      catchError(err => {
        console.error('Get lesson error:', err);
        return throwError(() => new Error(err.message || 'Failed to get lesson'));
      })
    );
  }

  getAllLessons(): Observable<Lesson[]> {
    // Tương tự như getLessonById, cân nhắc việc checkAuth() ở đây
    return this.http.get<Lesson[]>(this.apiUrl).pipe(
      catchError(err => {
        console.error('Get all lessons error:', err);
        return throwError(() => new Error(err.message || 'Failed to load lessons'));
      })
    );
  }

  updateLesson(lessonId: number, request: Lesson): Observable<Lesson> {
    console.log('Attempting to update lesson with ID:', lessonId, 'and request:', request);
    return this.apiService.checkAuth().pipe( // Sử dụng checkAuth từ ApiService
      switchMap(() => {
        // Đảm bảo request chỉ chứa các trường mà backend mong đợi
        const { createdAt, durationMonths, ...dataToSend } = request; // Loại bỏ createdAt và durationMonths
        return this.http.put<Lesson>(`${this.apiUrl}/${lessonId}`, dataToSend);
      }),
      catchError(err => {
        console.error('Update lesson error:', err);
        return throwError(() => new Error(err.message || 'Failed to update lesson'));
      })
    );
  }

  deleteLesson(lessonId: number): Observable<void> {
    console.log('Attempting to delete lesson with ID:', lessonId);
    return this.apiService.checkAuth().pipe( // Sử dụng checkAuth từ ApiService
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/${lessonId}`)),
      catchError(err => {
        console.error('Delete lesson error:', err);
        return throwError(() => new Error(err.message || 'Failed to delete lesson'));
      })
    );
  }
}
