// src/app/service/quiz-result.service.ts

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

  // Request body bây giờ sẽ là { userId: number, quizId: number, score: number }
  saveQuizResult(request: QuizResult): Observable<QuizResult> {
    // Đảm bảo bạn có Auth token hoặc quyền hợp lệ
    return this.checkAuth().pipe( // Sử dụng checkAuth() nếu đây là hành động của người dùng bình thường, hoặc checkAdminRole() nếu chỉ admin mới được làm
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
