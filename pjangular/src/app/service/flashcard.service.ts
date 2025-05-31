// src/app/service/flashcard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Flashcard, MarkFlashcardRequest } from '../interface/flashcard.interface'; // Cập nhật import

@Injectable({
  providedIn: 'root'
})
export class FlashcardService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  // API GET: Lấy danh sách flashcard (hiện tại là Vocabulary có isKnown)
  getFlashcardsByLesson(lessonId: number, userId: number): Observable<Flashcard[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Flashcard[]>(`${this.apiUrl}/flashcards/lesson/${lessonId}/user/${userId}`))
    );
  }

  // API POST: Đánh dấu flashcard
  // Đã đổi kiểu request từ Flashcard sang MarkFlashcardRequest
  markFlashcard(request: MarkFlashcardRequest): Observable<any> { // Có thể trả về Flashcard hoặc một DTO response cụ thể từ backend
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<any>(`${this.apiUrl}/flashcards/mark`, request))
    );
  }
}
