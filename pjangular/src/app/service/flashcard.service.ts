// src/app/service/flashcard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  // Đảm bảo các Interface này khớp với DTO của Backend
  // FlashcardService Backend DTOs:
  // - FlashcardResponse -> Flashcard
  // - UserFlashcardRequest
  // - FlashcardSearchRequest
  // - FlashcardPageResponse
  Flashcard, // Tên local của FlashcardResponse từ backend
  UserFlashcardRequest,
  FlashcardSearchRequest,
  FlashcardPageResponse
} from '../interface/flashcard.interface'; // Đảm bảo đã import đúng

@Injectable({
  providedIn: 'root'
})
export class FlashcardService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  // POST /api/flashcards
  // Tương ứng với createUserFlashcard DTO của backend
  // Backend trả về FlashcardResponse (Flashcard)
  createUserFlashcard(request: UserFlashcardRequest): Observable<Flashcard> { // Đổi tên từ createOrUpdateUserFlashcard
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<Flashcard>(`${this.apiUrl}/flashcards`, this.sanitizeRequest(request))),
      catchError(this.handleError)
    );
  }

  // GET /api/flashcards/{userFlashcardId}
  // Tương ứng với việc lấy một FlashcardResponse theo ID
  getUserFlashcardById(userFlashcardId: number): Observable<Flashcard> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Flashcard>(`${this.apiUrl}/flashcards/${userFlashcardId}`)),
      catchError(this.handleError)
    );
  }

  // POST /api/flashcards/search
  // Tương ứng với FlashcardSearchRequest và FlashcardPageResponse DTO của backend
  searchFlashcards(request: FlashcardSearchRequest): Observable<FlashcardPageResponse> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<FlashcardPageResponse>(`${this.apiUrl}/flashcards/search`, this.sanitizeRequest(request))),
      catchError(this.handleError)
    );
  }

  // DELETE /api/flashcards/{userFlashcardId}
  // Tương ứng với việc xóa một UserFlashcard
  deleteUserFlashcard(userFlashcardId: number): Observable<void> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/flashcards/${userFlashcardId}`)),
      catchError(this.handleError)
    );
  }

  // Hàm tiện ích để loại bỏ các trường undefined hoặc null khỏi đối tượng yêu cầu
  private sanitizeRequest(request: any): any {
    const sanitized = { ...request };
    Object.keys(sanitized).forEach(key => {
      // Giữ lại `false` và `0` nếu chúng là giá trị hợp lệ
      if (sanitized[key] === undefined || sanitized[key] === null) {
        delete sanitized[key];
      }
    });
    return sanitized;
  }
}
