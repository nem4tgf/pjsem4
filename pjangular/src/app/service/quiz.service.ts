// src/app/service/quiz.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Quiz } from '../interface/quiz.interface';

@Injectable({
  providedIn: 'root'
})
export class QuizService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  // Request body bây giờ sẽ là { lessonId: number, title: string, skill: Skill }
  createQuiz(request: Quiz): Observable<Quiz> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<Quiz>(`${this.apiUrl}/quizzes`, request))
    );
  }

  getQuizById(quizId: number): Observable<Quiz> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Quiz>(`${this.apiUrl}/quizzes/${quizId}`))
    );
  }

  getQuizzesByLessonId(lessonId: number): Observable<Quiz[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Quiz[]>(`${this.apiUrl}/quizzes/lesson/${lessonId}`))
    );
  }

  getAllQuizzes(): Observable<Quiz[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Quiz[]>(`${this.apiUrl}/quizzes`))
    );
  }

  // Request body bây giờ sẽ là { lessonId: number, title: string, skill: Skill }
  updateQuiz(quizId: number, request: Quiz): Observable<Quiz> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.put<Quiz>(`${this.apiUrl}/quizzes/${quizId}`, request))
    );
  }

  deleteQuiz(quizId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/quizzes/${quizId}`))
    );
  }
}
