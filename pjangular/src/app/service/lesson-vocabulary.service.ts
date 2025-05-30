// src/app/service/lesson-vocabulary.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LessonVocabulary } from '../interface/lesson-vocabulary.interface'; // Chỉ import LessonVocabulary

@Injectable({
  providedIn: 'root'
})
export class LessonVocabularyService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Thêm một từ vựng vào một bài học.
   * Backend mong đợi payload là { "lessonId": number, "wordId": number }.
   */
  createLessonVocabulary(lessonId: number, wordId: number): Observable<LessonVocabulary> { // Thay đổi tham số đầu vào
    const requestBody: LessonVocabulary = { // Tạo payload đúng cấu trúc backend mong đợi
      lessonId: lessonId,
      wordId: wordId
    };
    console.log('Sending payload to backend for creation:', requestBody); // Log để kiểm tra
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<LessonVocabulary>(`${this.apiUrl}/lesson-vocabulary`, requestBody)) // Gửi requestBody
    );
  }

  /**
   * Lấy danh sách từ vựng cho một bài học cụ thể.
   * Dựa vào endpoint backend: /api/lesson-vocabulary/lesson/{lessonId}
   * @returns Observable<LessonVocabulary[]> Nếu backend trả về chỉ lessonId và wordId.
   * Nếu backend trả về thông tin Vocabulary đầy đủ, bạn cần cập nhật kiểu trả về.
   */
  getLessonVocabulariesByLessonId(lessonId: number): Observable<LessonVocabulary[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<LessonVocabulary[]>(`${this.apiUrl}/lesson-vocabulary/lesson/${lessonId}`))
    );
  }

  /**
   * Xóa một từ vựng khỏi một bài học.
   * Dựa vào endpoint backend: /api/lesson-vocabulary/lesson/{lessonId}/word/{wordId}
   */
  deleteLessonVocabulary(lessonId: number, wordId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/lesson-vocabulary/lesson/${lessonId}/word/${wordId}`))
    );
  }
}
