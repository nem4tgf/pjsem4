// src/app/service/answer.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Answer, AnswerSearchRequest, AnswerPage } from '../interface/answer.interface';

// AnswerRequest DTO của backend sẽ được sử dụng cho create và update
// Đảm bảo interface này khớp chính xác với org.example.projetc_backend.dto.AnswerRequest
// QUAN TRỌNG: Đã đổi 'answerText' thành 'content' để khớp với @JsonProperty("content") trong backend DTO
export interface AnswerRequest {
  questionId: number;
  content: string; // ĐÃ THAY ĐỔI: Đổi từ 'answerText' thành 'content' để khớp với JSON key từ @JsonProperty
  isCorrect: boolean;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AnswerService extends ApiService {
  // baseUrl cho answers
  private answersBaseUrl = `${this.apiUrl}/answers`;

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Tạo một câu trả lời mới. Yêu cầu quyền ADMIN.
   * @param request DTO chứa thông tin câu trả lời mới.
   * @returns Observable của Answer đã tạo.
   */
  createAnswer(request: AnswerRequest): Observable<Answer> {
    return this.checkAdminRole().pipe( // Backend Controller: @PreAuthorize("hasRole('ADMIN')")
      switchMap(() => this.http.post<Answer>(this.answersBaseUrl, request))
    );
  }

  /**
   * Lấy thông tin một câu trả lời theo ID.
   * Yêu cầu quyền ADMIN hoặc USER.
   * @param answerId ID của câu trả lời.
   * @returns Observable của Answer.
   */
  getAnswerById(answerId: number): Observable<Answer> {
    // Backend Controller: @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    // Giả định ApiService.checkUserRole() hoặc tương tự sẽ được sử dụng nếu có
    // Nếu không, có thể bỏ checkRole ở đây nếu endpoint này công khai cho người dùng đã đăng nhập.
    // Vì backend cho phép cả USER và ADMIN, chúng ta sẽ để nó không có checkAdminRole cứng nhắc.
    // Nếu ApiService của bạn có một phương thức chung để kiểm tra người dùng đã xác thực, hãy sử dụng nó.
    // Ví dụ: return this.checkAuthenticatedUser().pipe(...);
    // Hiện tại, bỏ qua kiểm tra vai trò cụ thể ở đây để khớp với hasAnyRole của backend.
    return this.http.get<Answer>(`${this.answersBaseUrl}/${answerId}`);
  }

  /**
   * Lấy danh sách các câu trả lời ĐANG HOẠT ĐỘNG và CHƯA BỊ XÓA MỀM của một câu hỏi cụ thể.
   * Tương ứng với `getAnswersByQuestionIdForUser` ở backend. Endpoint này là PUBLIC ở backend.
   * @param questionId ID của câu hỏi.
   * @returns Observable của một mảng Answer.
   */
  getActiveAnswersByQuestionId(questionId: number): Observable<Answer[]> {
    // Backend Controller: Không có @PreAuthorize (public)
    // Do đó, không cần checkAdminRole ở frontend
    return this.http.get<Answer[]>(`${this.answersBaseUrl}/question/${questionId}/active`);
  }

  /**
   * Lấy TẤT CẢ các câu trả lời (kể cả inactive) CHƯA BỊ XÓA MỀM của một câu hỏi cụ thể.
   * Tương ứng với `getAllAnswersForAdminByQuestionId` ở backend. Yêu cầu quyền ADMIN.
   * @param questionId ID của câu hỏi.
   * @returns Observable của một mảng Answer.
   */
  getAllAnswersForAdminByQuestionId(questionId: number): Observable<Answer[]> {
    return this.checkAdminRole().pipe( // Backend Controller: @PreAuthorize("hasRole('ADMIN')")
      switchMap(() => this.http.get<Answer[]>(`${this.answersBaseUrl}/question/${questionId}/admin`))
    );
  }

  /**
   * Cập nhật thông tin một câu trả lời. Yêu cầu quyền ADMIN.
   * @param answerId ID của câu trả lời cần cập nhật.
   * @param request DTO chứa thông tin cập nhật.
   * @returns Observable của Answer đã cập nhật.
   */
  updateAnswer(answerId: number, request: AnswerRequest): Observable<Answer> {
    return this.checkAdminRole().pipe( // Backend Controller: @PreAuthorize("hasRole('ADMIN')")
      switchMap(() => this.http.put<Answer>(`${this.answersBaseUrl}/${answerId}`, request))
    );
  }

  /**
   * Thay đổi trạng thái hoạt động (active/inactive) của một câu trả lời. Yêu cầu quyền ADMIN.
   * @param answerId ID của câu trả lời.
   * @param newStatus Trạng thái mới (true: active, false: inactive).
   * @returns Observable của Answer đã cập nhật trạng thái.
   */
  toggleAnswerStatus(answerId: number, newStatus: boolean): Observable<Answer> {
    // Sử dụng HttpParams để gửi newStatus dưới dạng query parameter
    let params = new HttpParams().set('newStatus', newStatus.toString());
    return this.checkAdminRole().pipe( // Backend Controller: @PreAuthorize("hasRole('ADMIN')")
      switchMap(() => this.http.patch<Answer>(`${this.answersBaseUrl}/${answerId}/status`, {}, { params }))
    );
  }

  /**
   * Xóa mềm (soft delete) một câu trả lời. Yêu cầu quyền ADMIN.
   * Backend endpoint là /answers/{answerId}/soft
   * @param answerId ID của câu trả lời.
   * @returns Observable<void>.
   */
  softDeleteAnswer(answerId: number): Observable<void> {
    return this.checkAdminRole().pipe( // Backend Controller: @PreAuthorize("hasRole('ADMIN')")
      switchMap(() => this.http.delete<void>(`${this.answersBaseUrl}/${answerId}/soft`))
    );
  }

  /**
   * Khôi phục (restore) một câu trả lời đã bị xóa mềm. Yêu cầu quyền ADMIN.
   * Backend endpoint là /answers/{answerId}/restore
   * @param answerId ID của câu trả lời.
   * @returns Observable của Answer đã khôi phục.
   */
  restoreAnswer(answerId: number): Observable<Answer> {
    return this.checkAdminRole().pipe( // Backend Controller: @PreAuthorize("hasRole('ADMIN')")
      switchMap(() => this.http.patch<Answer>(`${this.answersBaseUrl}/${answerId}/restore`, {}))
    );
  }

  /**
   * Tìm kiếm câu trả lời với các tiêu chí và phân trang. Yêu cầu quyền ADMIN.
   * Backend endpoint là /answers/search (POST request với body).
   * @param request DTO chứa tiêu chí tìm kiếm và thông tin phân trang/sắp xếp.
   * @returns Observable của AnswerPage (phân trang các Answer).
   */
  searchAnswers(request: AnswerSearchRequest): Observable<AnswerPage> {
    return this.checkAdminRole().pipe( // Backend Controller: @PreAuthorize("hasRole('ADMIN')")
      switchMap(() => this.http.post<AnswerPage>(`${this.answersBaseUrl}/search`, request))
    );
  }
}
