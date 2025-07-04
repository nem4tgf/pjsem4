// src/app/service/flashcard-set.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; // Import throwError
import { switchMap, catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  // Đảm bảo các Interface này khớp với DTO của Backend
  // FlashcardSetService Backend DTOs:
  // - FlashcardSetResponse -> FlashcardSet
  // - FlashcardSetRequest
  // - FlashcardSetSearchRequest
  // - FlashcardSetPageResponse
  FlashcardSet, // Tên local của FlashcardSetResponse từ backend
  FlashcardSetRequest,
  FlashcardSetSearchRequest,
  FlashcardSetPageResponse
} from '../interface/flashcard.interface'; // Đảm bảo đã import đúng

@Injectable({
  providedIn: 'root'
})
export class FlashcardSetService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Lấy tất cả các bộ flashcard hiện có.
   * Sử dụng endpoint search với kích thước lớn để lấy toàn bộ danh sách.
   * Đồng nhất với backend: GET /api/flashcard-sets (được wrap qua POST /api/flashcard-sets/search)
   * @returns Observable<FlashcardSet[]> danh sách các bộ flashcard.
   */
  getAllFlashcardSets(): Observable<FlashcardSet[]> {
    const request: FlashcardSetSearchRequest = {
      page: 0,
      size: 1000, // Lấy một số lượng đủ lớn để bao gồm hầu hết các bộ
      sortBy: 'setId',
      sortDir: 'ASC'
      // title, isSystemCreated, creatorUserId sẽ là null/undefined để lấy tất cả
    };
    return this.checkAuth().pipe(
      switchMap(() => this.searchFlashcardSets(request)), // Gọi lại searchFlashcardSets
      map(page => page.content || []), // Chỉ lấy mảng content
      catchError(error => {
        console.error('Lỗi khi lấy danh sách bộ flashcard:', error);
        // Có thể muốn ném lại lỗi hoặc trả về mảng rỗng tùy theo logic ứng dụng
        return throwError(() => new Error('Không thể tải bộ flashcard.')); // Sử dụng throwError từ rxjs
      })
    );
  }

  /**
   * Tìm kiếm và phân trang các bộ flashcard dựa trên các tiêu chí.
   * Đồng nhất với backend: POST /api/flashcard-sets/search
   * @param request FlashcardSetSearchRequest chứa các tiêu chí tìm kiếm.
   * @returns Observable<FlashcardSetPageResponse> kết quả tìm kiếm phân trang.
   */
  searchFlashcardSets(request: FlashcardSetSearchRequest): Observable<FlashcardSetPageResponse> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<FlashcardSetPageResponse>(`${this.apiUrl}/flashcard-sets/search`, this.sanitizeRequest(request))),
      catchError(error => {
        console.error('Lỗi khi tìm kiếm bộ flashcard:', error);
        return throwError(() => new Error('Không thể tìm kiếm bộ flashcard.'));
      })
    );
  }

  /**
   * Tạo một bộ flashcard mới.
   * Đồng nhất với backend: POST /api/flashcard-sets
   * @param request FlashcardSetRequest chứa thông tin bộ flashcard mới.
   * @returns Observable<FlashcardSet> bộ flashcard đã được tạo.
   */
  createFlashcardSet(request: FlashcardSetRequest): Observable<FlashcardSet> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<FlashcardSet>(`${this.apiUrl}/flashcard-sets`, this.sanitizeRequest(request))),
      catchError(error => {
        console.error('Lỗi khi tạo bộ flashcard:', error);
        return throwError(() => new Error('Không thể tạo bộ flashcard.'));
      })
    );
  }

  /**
   * Lấy thông tin chi tiết của một bộ flashcard theo ID.
   * Đồng nhất với backend: GET /api/flashcard-sets/{setId}
   * @param setId ID của bộ flashcard.
   * @returns Observable<FlashcardSet> bộ flashcard tìm được.
   */
  getFlashcardSetById(setId: number): Observable<FlashcardSet> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<FlashcardSet>(`${this.apiUrl}/flashcard-sets/${setId}`)),
      catchError(error => {
        console.error('Lỗi khi lấy bộ flashcard theo ID:', error);
        return throwError(() => new Error('Không tìm thấy bộ flashcard.'));
      })
    );
  }

  /**
   * Cập nhật thông tin của một bộ flashcard.
   * Đồng nhất với backend: PUT /api/flashcard-sets/{setId}
   * @param setId ID của bộ flashcard cần cập nhật.
   * @param request FlashcardSetRequest chứa thông tin cập nhật.
   * @returns Observable<FlashcardSet> bộ flashcard đã được cập nhật.
   */
  updateFlashcardSet(setId: number, request: FlashcardSetRequest): Observable<FlashcardSet> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.put<FlashcardSet>(`${this.apiUrl}/flashcard-sets/${setId}`, this.sanitizeRequest(request))),
      catchError(error => {
        console.error('Lỗi khi cập nhật bộ flashcard:', error);
        return throwError(() => new Error('Không thể cập nhật bộ flashcard.'));
      })
    );
  }

  /**
   * Xóa một bộ flashcard.
   * Đồng nhất với backend: DELETE /api/flashcard-sets/{setId}
   * @param setId ID của bộ flashcard cần xóa.
   * @returns Observable<void>
   */
  deleteFlashcardSet(setId: number): Observable<void> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/flashcard-sets/${setId}`)),
      catchError(error => {
        console.error('Lỗi khi xóa bộ flashcard:', error);
        return throwError(() => new Error('Không thể xóa bộ flashcard.'));
      })
    );
  }

  /**
   * Thêm một từ vựng vào một bộ flashcard.
   * Đồng nhất với backend: POST /api/flashcard-sets/{setId}/vocabulary/{wordId}
   * @param setId ID của bộ flashcard.
   * @param wordId ID của từ vựng.
   * @returns Observable<void>
   */
  addVocabularyToSet(setId: number, wordId: number): Observable<void> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<void>(`${this.apiUrl}/flashcard-sets/${setId}/vocabulary/${wordId}`, {})),
      catchError(error => {
        console.error('Lỗi khi thêm từ vựng vào bộ flashcard:', error);
        return throwError(() => new Error('Không thể thêm từ vựng vào bộ flashcard.'));
      })
    );
  }

  /**
   * Xóa một từ vựng khỏi một bộ flashcard.
   * Đồng nhất với backend: DELETE /api/flashcard-sets/{setId}/vocabulary/{wordId}
   * @param setId ID của bộ flashcard.
   * @param wordId ID của từ vựng.
   * @returns Observable<void>
   */
  removeVocabularyFromSet(setId: number, wordId: number): Observable<void> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/flashcard-sets/${setId}/vocabulary/${wordId}`)),
      catchError(error => {
        console.error('Lỗi khi xóa từ vựng khỏi bộ flashcard:', error);
        return throwError(() => new Error('Không thể xóa từ vựng khỏi bộ flashcard.'));
      })
    );
  }

  // Hàm tiện ích để loại bỏ các trường undefined hoặc null khỏi đối tượng yêu cầu
  private sanitizeRequest(request: any): any {
    const sanitized = { ...request };
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined || sanitized[key] === null) {
        delete sanitized[key];
      }
    });
    return sanitized;
  }
}
