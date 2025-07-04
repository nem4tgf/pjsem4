// src/app/service/question.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators'; // Thêm catchError
import { ApiService } from './api.service';
import { Question, QuestionRequest, QuestionSearchRequest, QuestionPageResponse } from '../interface/question.interface'; // Cập nhật import
// Không cần import Skill từ lesson.interface.ts nữa nếu không dùng trực tiếp trong search parameters
// import { Skill } from '../interface/lesson.interface';

@Injectable({
  providedIn: 'root'
})
export class QuestionService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Tạo một câu hỏi mới.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: POST /api/questions
   * @param request DTO QuestionRequest chứa thông tin câu hỏi.
   * @returns Observable<Question> của câu hỏi đã tạo.
   */
  createQuestion(request: QuestionRequest): Observable<Question> { // Thay đổi kiểu tham số
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<Question>(`${this.apiUrl}/questions`, request)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Lấy thông tin một câu hỏi theo ID.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/questions/{questionId}
   * @param questionId ID của câu hỏi.
   * @returns Observable<Question>
   */
  getQuestionById(questionId: number): Observable<Question> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // nên không cần checkAdminRole() hay checkAuth() ở đây.
    return this.http.get<Question>(`${this.apiUrl}/questions/${questionId}`).pipe(
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Lấy danh sách các câu hỏi thuộc một bài quiz cụ thể.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/questions/quiz/{quizId}
   * @param quizId ID của bài quiz.
   * @returns Observable<Question[]>
   */
  getQuestionsByQuizId(quizId: number): Observable<Question[]> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // nên không cần checkAdminRole() hay checkAuth() ở đây.
    return this.http.get<Question[]>(`${this.apiUrl}/questions/quiz/${quizId}`).pipe(
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Tìm kiếm và phân trang câu hỏi dựa trên các tiêu chí tùy chọn.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/questions/search
   * @param request DTO QuestionSearchRequest chứa các tiêu chí tìm kiếm và thông tin phân trang/sắp xếp.
   * @returns Observable<QuestionPageResponse> của trang kết quả.
   */
  searchQuestions(request: QuestionSearchRequest): Observable<QuestionPageResponse> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // và sử dụng @ModelAttribute để ánh xạ query params vào DTO.
    // Angular HttpClient.get có thể nhận một đối tượng làm giá trị cho 'params',
    // nó sẽ tự động chuyển đổi các thuộc tính của đối tượng đó thành query parameters.
    return this.http.get<QuestionPageResponse>(`${this.apiUrl}/questions/search`, { params: request as any }).pipe(
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Cập nhật thông tin một câu hỏi.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: PUT /api/questions/{questionId}
   * @param questionId ID của câu hỏi.
   * @param request DTO QuestionRequest chứa thông tin cập nhật.
   * @returns Observable<Question>
   */
  updateQuestion(questionId: number, request: QuestionRequest): Observable<Question> { // Thay đổi kiểu tham số
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.put<Question>(`${this.apiUrl}/questions/${questionId}`, request)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Xóa một câu hỏi.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: DELETE /api/questions/{questionId}
   * @param questionId ID của câu hỏi.
   * @returns Observable<void>
   */
  deleteQuestion(questionId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/questions/${questionId}`)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }
}
