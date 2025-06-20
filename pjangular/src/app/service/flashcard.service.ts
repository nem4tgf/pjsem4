import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Flashcard, MarkFlashcardRequest, FlashcardSearchRequest, FlashcardPage } from '../interface/flashcard.interface';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  getFlashcardsByLesson(lessonId: number, userId: number): Observable<Flashcard[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Flashcard[]>(`${this.apiUrl}/flashcards/lesson/${lessonId}/user/${userId}`))
    );
  }

  markFlashcard(request: MarkFlashcardRequest): Observable<any> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<any>(`${this.apiUrl}/flashcards/mark`, request))
    );
  }

  searchFlashcards(userId: number, request: FlashcardSearchRequest): Observable<FlashcardPage> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<FlashcardPage>(`${this.apiUrl}/flashcards/search/user/${userId}`, request))
    );
  }
}
