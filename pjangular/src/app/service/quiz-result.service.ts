// src/app/service/quiz-result.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { QuizResult, QuizResultRequest, QuizResultSearchRequest, QuizResultPageResponse } from '../interface/quiz-result.interface';

@Injectable({
  providedIn: 'root'
})
export class QuizResultService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Lưu kết quả làm bài quiz của người dùng.
   * Endpoint Backend: POST /api/quiz-results
   * Cả USER và ADMIN đều có quyền (backend sẽ xử lý việc USER chỉ lưu kết quả của chính mình).
   * @param request DTO QuizResultRequest chứa userId, quizId, score và durationSeconds.
   * @returns Observable<QuizResult> của kết quả đã lưu.
   */
  saveQuizResult(request: QuizResultRequest): Observable<QuizResult> {
    // Backend controller cho phép cả USER và ADMIN, nên checkAuth() là phù hợp.
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<QuizResult>(`${this.apiUrl}/quiz-results`, request)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Cập nhật một kết quả bài kiểm tra hiện có.
   * Endpoint Backend: PUT /api/quiz-results/{resultId}
   * Chỉ ADMIN mới có quyền truy cập.
   * @param resultId ID của kết quả bài kiểm tra cần cập nhật.
   * @param request DTO QuizResultRequest chứa thông tin cập nhật (score, durationSeconds).
   * @returns Observable<QuizResult> của kết quả đã cập nhật.
   */
  updateQuizResult(resultId: number, request: QuizResultRequest): Observable<QuizResult> {
    // Backend controller yêu cầu quyền ADMIN
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.put<QuizResult>(`${this.apiUrl}/quiz-results/${resultId}`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy kết quả quiz cho một người dùng và một bài quiz cụ thể.
   * Endpoint Backend: GET /api/quiz-results/user/{userId}/quiz/{quizId}
   * Cả USER và ADMIN đều có quyền (backend sẽ xử lý việc USER chỉ xem được của chính mình).
   * @param userId ID của người dùng.
   * @param quizId ID của bài quiz.
   * @returns Observable<QuizResult>
   */
  getQuizResultByUserAndQuiz(userId: number, quizId: number): Observable<QuizResult> {
    // Backend controller cho phép cả USER và ADMIN, nên checkAuth() là phù hợp.
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<QuizResult>(`${this.apiUrl}/quiz-results/user/${userId}/quiz/${quizId}`)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Lấy tất cả các kết quả quiz của một người dùng.
   * Endpoint Backend: GET /api/quiz-results/user/{userId}
   * Cả USER và ADMIN đều có quyền (backend sẽ xử lý việc USER chỉ xem được của chính mình).
   * @param userId ID của người dùng.
   * @returns Observable<QuizResult[]>
   */
  getQuizResultsByUser(userId: number): Observable<QuizResult[]> {
    // Backend controller cho phép cả USER và ADMIN, nên checkAuth() là phù hợp.
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<QuizResult[]>(`${this.apiUrl}/quiz-results/user/${userId}`)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Lấy tất cả các kết quả quiz cho một bài quiz cụ thể.
   * Endpoint Backend: GET /api/quiz-results/quiz/{quizId}
   * Chỉ ADMIN mới có quyền truy cập.
   * @param quizId ID của bài quiz.
   * @returns Observable<QuizResult[]>
   */
  getQuizResultsByQuiz(quizId: number): Observable<QuizResult[]> {
    // Backend controller yêu cầu quyền ADMIN
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<QuizResult[]>(`${this.apiUrl}/quiz-results/quiz/${quizId}`)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Tìm kiếm và phân trang kết quả bài kiểm tra dựa trên các tiêu chí tùy chọn.
   * Endpoint Backend: GET /api/quiz-results/search
   * Chỉ ADMIN mới có quyền truy cập.
   * @param request DTO QuizResultSearchRequest chứa các tiêu chí tìm kiếm và thông tin phân trang/sắp xếp.
   * @returns Observable<QuizResultPageResponse> của trang kết quả.
   */
  searchQuizResults(request: QuizResultSearchRequest): Observable<QuizResultPageResponse> {
    // Backend controller yêu cầu quyền ADMIN và sử dụng @ModelAttribute để ánh xạ query params vào DTO.
    let params = new HttpParams();

    // Thêm các tham số chỉ khi chúng có giá trị hợp lệ (không null hoặc undefined)
    if (request.userId !== null && request.userId !== undefined) {
      params = params.set('userId', request.userId.toString());
    }
    if (request.quizId !== null && request.quizId !== undefined) {
      params = params.set('quizId', request.quizId.toString());
    }
    if (request.minScore !== null && request.minScore !== undefined) {
      params = params.set('minScore', request.minScore.toString());
    }
    if (request.maxScore !== null && request.maxScore !== undefined) {
      params = params.set('maxScore', request.maxScore.toString());
    }

    // Các tham số phân trang và sắp xếp luôn có giá trị mặc định từ frontend form
    // Backend QuizResultSearchRequest canonical constructor sets defaults for page, size, sortBy, sortDir
    params = params.set('page', (request.page ?? 0).toString());
    params = params.set('size', (request.size ?? 10).toString());
    params = params.set('sortBy', request.sortBy || 'completedAt'); // Default to 'completedAt' as per backend service default
    params = params.set('sortDir', request.sortDir || 'DESC'); // Default to 'DESC' as per backend service default

    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<QuizResultPageResponse>(`${this.apiUrl}/quiz-results/search`, { params })),
      catchError(this.handleError)
    );
  }

  /**
   * Xóa một kết quả quiz.
   * Endpoint Backend: DELETE /api/quiz-results/{resultId}
   * Chỉ ADMIN mới có quyền.
   * @param resultId ID của kết quả quiz cần xóa.
   * @returns Observable<void>
   */
  deleteQuizResult(resultId: number): Observable<void> {
    // Backend controller yêu cầu quyền ADMIN
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/quiz-results/${resultId}`)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }
}
