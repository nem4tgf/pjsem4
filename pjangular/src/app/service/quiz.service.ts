// src/app/service/quiz.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
// ĐÃ THAY ĐỔI: Import QuizType thay vì QuizSkill
import { Quiz, QuizRequest, QuizSearchRequest, QuizPageResponse, QuizType } from '../interface/quiz.interface';

@Injectable({
  providedIn: 'root'
})
export class QuizService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Tạo một bài kiểm tra mới.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: POST /api/quizzes
   * @param request DTO QuizRequest chứa thông tin bài kiểm tra.
   * @returns Observable<Quiz> của bài kiểm tra đã tạo.
   */
  createQuiz(request: QuizRequest): Observable<Quiz> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<Quiz>(`${this.apiUrl}/quizzes`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy thông tin bài kiểm tra theo ID.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/quizzes/{quizId}
   * @param quizId ID của bài kiểm tra.
   * @returns Observable<Quiz>
   */
  getQuizById(quizId: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/quizzes/${quizId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Lấy danh sách các bài kiểm tra theo ID bài học.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/quizzes/lesson/{lessonId}
   * @param lessonId ID của bài học.
   * @returns Observable<Quiz[]>
   */
  getQuizzesByLessonId(lessonId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/quizzes/lesson/${lessonId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Lấy tất cả các bài kiểm tra hiện có trong hệ thống.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/quizzes
   * @returns Observable<Quiz[]>
   */
  getAllQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/quizzes`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Tìm kiếm và phân trang các bài kiểm tra dựa trên các tiêu chí tùy chọn.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/quizzes/search
   * @param request DTO QuizSearchRequest chứa các tiêu chí tìm kiếm và thông tin phân trang/sắp xếp.
   * @returns Observable<QuizPageResponse> của trang kết quả.
   */
  searchQuizzes(request: QuizSearchRequest): Observable<QuizPageResponse> {
    let params = new HttpParams();

    if (request.lessonId !== null && request.lessonId !== undefined) {
      params = params.set('lessonId', request.lessonId.toString());
    }
    if (request.title !== null && request.title !== undefined && request.title !== '') {
      params = params.set('title', request.title);
    }
    // ĐÃ THAY ĐỔI: Sử dụng quizType thay vì skill
    if (request.quizType !== null && request.quizType !== undefined) {
      params = params.set('quizType', request.quizType as string);
    }

    params = params.set('page', (request.page ?? 0).toString());
    params = params.set('size', (request.size ?? 10).toString());
    params = params.set('sortBy', request.sortBy || 'createdAt');
    params = params.set('sortDir', request.sortDir || 'DESC');

    return this.http.get<QuizPageResponse>(`${this.apiUrl}/quizzes/search`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cập nhật thông tin của một bài kiểm tra.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: PUT /api/quizzes/{quizId}
   * @param quizId ID của bài kiểm tra.
   * @param request DTO QuizRequest chứa thông tin cập nhật.
   * @returns Observable<Quiz>
   */
  updateQuiz(quizId: number, request: QuizRequest): Observable<Quiz> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.put<Quiz>(`${this.apiUrl}/quizzes/${quizId}`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Xóa một bài kiểm tra.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: DELETE /api/quizzes/{quizId}
   * @param quizId ID của bài kiểm tra.
   * @returns Observable<void>
   */
  deleteQuiz(quizId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/quizzes/${quizId}`)),
      catchError(this.handleError)
    );
  }
}
