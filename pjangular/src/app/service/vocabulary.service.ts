// src/app/service/vocabulary.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // Import HttpParams cho search
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators'; // Thêm catchError
import { ApiService } from './api.service'; // Import ApiService
import { Vocabulary, VocabularyRequest, VocabularySearchRequest, VocabularyPage, DifficultyLevel } from '../interface/vocabulary.interface'; // Cập nhật import

@Injectable({
  providedIn: 'root'
})
// Kế thừa ApiService để sử dụng this.apiUrl và this.handleError
export class VocabularyService extends ApiService {
  // Không cần khai báo private apiUrl ở đây.
  // this.apiUrl từ ApiService sẽ là `${environment.apiUrl}`
  // và chúng ta sẽ nối thêm '/vocabulary' vào trong mỗi request.

  constructor(http: HttpClient) {
    super(http); // Gọi constructor của lớp cha
  }

  /**
   * Tạo một từ vựng mới.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: POST /api/vocabulary
   * @param request DTO VocabularyRequest chứa thông tin từ vựng.
   * @returns Observable<Vocabulary> của từ vựng đã tạo.
   */
  createVocabulary(request: VocabularyRequest): Observable<Vocabulary> { // Thay đổi kiểu tham số
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<Vocabulary>(`${this.apiUrl}/vocabulary`, request)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Lấy thông tin một từ vựng theo ID.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/vocabulary/{wordId}
   * @param wordId ID của từ vựng.
   * @returns Observable<Vocabulary>
   */
  getVocabularyById(wordId: number): Observable<Vocabulary> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // nên không cần checkAdminRole() hay checkAuth() ở đây.
    return this.http.get<Vocabulary>(`${this.apiUrl}/vocabulary/${wordId}`).pipe(
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Lấy tất cả các từ vựng HOẶC tìm kiếm/phân trang từ vựng.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/vocabulary (có thể nhận query params cho search)
   * @param searchRequest (Optional) DTO VocabularySearchRequest chứa tiêu chí tìm kiếm và thông tin phân trang/sắp xếp.
   * @returns Observable<VocabularyPage> của trang kết quả từ vựng.
   */
  searchVocabularies(searchRequest?: VocabularySearchRequest): Observable<VocabularyPage> {
    // Backend controller sử dụng @ModelAttribute để ánh xạ query params vào DTO.
    // Angular HttpClient.get có thể nhận một đối tượng làm giá trị cho 'params',
    // nó sẽ tự động chuyển đổi các thuộc tính của đối tượng đó thành query parameters.
    // Nếu searchRequest là undefined hoặc null, nó sẽ gửi request không có params,
    // backend sẽ sử dụng giá trị mặc định trong DTO của nó.
    return this.http.get<VocabularyPage>(`${this.apiUrl}/vocabulary`, { params: searchRequest as any }).pipe(
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Cập nhật thông tin một từ vựng.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: PUT /api/vocabulary/{wordId}
   * @param wordId ID của từ vựng.
   * @param request DTO VocabularyRequest chứa thông tin cập nhật.
   * @returns Observable<Vocabulary>
   */
  updateVocabulary(wordId: number, request: VocabularyRequest): Observable<Vocabulary> { // Thay đổi kiểu tham số
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.put<Vocabulary>(`${this.apiUrl}/vocabulary/${wordId}`, request)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }

  /**
   * Xóa một từ vựng.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: DELETE /api/vocabulary/{wordId}
   * @param wordId ID của từ vựng.
   * @returns Observable<void>
   */
  deleteVocabulary(wordId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/vocabulary/${wordId}`)),
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }
}
