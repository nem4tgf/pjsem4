import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Flashcard } from '../interface/flashcard.interface';

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

  markFlashcard(request: Flashcard): Observable<Flashcard> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<Flashcard>(`${this.apiUrl}/flashcards/mark`, request))
    );
  }
}
