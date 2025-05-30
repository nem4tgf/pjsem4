import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { QuizResult } from '../interface/quiz-result.interface';

@Injectable({
  providedIn: 'root'
})
export class QuizResultService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  saveQuizResult(request: QuizResult): Observable<QuizResult> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<QuizResult>(`${this.apiUrl}/quiz-results`, request))
    );
  }

  getQuizResultByUserAndQuiz(userId: number, quizId: number): Observable<QuizResult> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<QuizResult>(`${this.apiUrl}/quiz-results/user/${userId}/quiz/${quizId}`))
    );
  }

  getQuizResultsByUser(userId: number): Observable<QuizResult[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<QuizResult[]>(`${this.apiUrl}/quiz-results/user/${userId}`))
    );
  }

  getQuizResultsByQuiz(quizId: number): Observable<QuizResult[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<QuizResult[]>(`${this.apiUrl}/quiz-results/quiz/${quizId}`))
    );
  }
}
