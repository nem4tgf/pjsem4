import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Answer } from '../interface/answer.interface';

@Injectable({
  providedIn: 'root'
})
export class AnswerService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  createAnswer(request: Answer): Observable<Answer> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<Answer>(`${this.apiUrl}/answers`, request))
    );
  }

  getAnswerById(answerId: number): Observable<Answer> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Answer>(`${this.apiUrl}/answers/${answerId}`))
    );
  }

  getAnswersByQuestionId(questionId: number): Observable<Answer[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Answer[]>(`${this.apiUrl}/answers/question/${questionId}`))
    );
  }

  updateAnswer(answerId: number, request: Answer): Observable<Answer> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.put<Answer>(`${this.apiUrl}/answers/${answerId}`, request))
    );
  }

  deleteAnswer(answerId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/answers/${answerId}`))
    );
  }
}
