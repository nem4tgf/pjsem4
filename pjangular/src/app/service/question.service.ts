import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Question } from '../interface/question.interface';

@Injectable({
  providedIn: 'root'
})
export class QuestionService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  createQuestion(request: Question): Observable<Question> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<Question>(`${this.apiUrl}/questions`, request))
    );
  }

  getQuestionById(questionId: number): Observable<Question> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Question>(`${this.apiUrl}/questions/${questionId}`))
    );
  }

  getQuestionsByQuizId(quizId: number): Observable<Question[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Question[]>(`${this.apiUrl}/questions/quiz/${quizId}`))
    );
  }

  updateQuestion(questionId: number, request: Question): Observable<Question> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.put<Question>(`${this.apiUrl}/questions/${questionId}`, request))
    );
  }

  deleteQuestion(questionId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/questions/${questionId}`))
    );
  }
}
