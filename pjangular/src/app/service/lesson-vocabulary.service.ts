// src/app/service/lesson-vocabulary.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LessonVocabularyRequest, LessonVocabularyResponse, LessonVocabulary } from '../interface/lesson-vocabulary.interface'; // Cập nhật import

@Injectable({
  providedIn: 'root'
})
export class LessonVocabularyService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Tạo một liên kết mới giữa một bài học và một từ vựng.
   * Endpoint Backend: POST /api/lesson-vocabulary
   * Yêu cầu quyền ADMIN.
   * @param lessonId ID của bài học.
   * @param wordId ID của từ vựng.
   * @returns Observable<LessonVocabularyResponse> của liên kết đã tạo.
   */
  createLessonVocabulary(lessonId: number, wordId: number): Observable<LessonVocabularyResponse> {
    const requestBody: LessonVocabularyRequest = { // Tạo payload đúng cấu trúc LessonVocabularyRequest
      lessonId: lessonId,
      wordId: wordId
    };
    console.log('Sending payload to backend for creation:', requestBody); // Log để kiểm tra
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<LessonVocabularyResponse>(`${this.apiUrl}/lesson-vocabulary`, requestBody)) // Gửi requestBody
    );
  }

  /**
   * Lấy danh sách từ vựng liên quan đến một bài học cụ thể.
   * Endpoint Backend: GET /api/lesson-vocabulary/lesson/{lessonId}
   * Có thể truy cập công khai (theo backend controller).
   * @param lessonId ID của bài học.
   * @returns Observable<LessonVocabularyResponse[]> Danh sách các cặp lessonId-wordId.
   */
  getLessonVocabulariesByLessonId(lessonId: number): Observable<LessonVocabularyResponse[]> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // nên không cần checkAdminRole() hay checkAuth() ở đây.
    return this.http.get<LessonVocabularyResponse[]>(`${this.apiUrl}/lesson-vocabulary/lesson/${lessonId}`);
  }

  /**
   * Lấy danh sách bài học liên quan đến một từ vựng cụ thể.
   * Endpoint Backend: GET /api/lesson-vocabulary/vocabulary/{wordId}
   * Có thể truy cập công khai (theo backend controller).
   * @param wordId ID của từ vựng.
   * @returns Observable<LessonVocabularyResponse[]> Danh sách các cặp lessonId-wordId.
   */
  getLessonVocabulariesByWordId(wordId: number): Observable<LessonVocabularyResponse[]> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // nên không cần checkAdminRole() hay checkAuth() ở đây.
    return this.http.get<LessonVocabularyResponse[]>(`${this.apiUrl}/lesson-vocabulary/vocabulary/${wordId}`);
  }

  /**
   * Xóa một liên kết cụ thể giữa bài học và từ vựng.
   * Endpoint Backend: DELETE /api/lesson-vocabulary/lesson/{lessonId}/word/{wordId}
   * Yêu cầu quyền ADMIN.
   * @param lessonId ID của bài học.
   * @param wordId ID của từ vựng.
   * @returns Observable<void>
   */
  deleteLessonVocabulary(lessonId: number, wordId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/lesson-vocabulary/lesson/${lessonId}/word/${wordId}`))
    );
  }
}
