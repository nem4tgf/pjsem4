// src/app/service/answer.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Answer } from '../interface/answer.interface';

interface AnswerApiRequest {
  questionId: number;
  content: string;
  isCorrect: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AnswerService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  createAnswer(request: AnswerApiRequest): Observable<Answer> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<Answer>(`${this.apiUrl}/answers`, request))
    );
  }

  getAnswerById(answerId: number): Observable<Answer> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Answer>(`${this.apiUrl}/answers/${answerId}`))
    );
  }

  // Phương thức này để lấy các câu trả lời active cho người dùng cuối
  getActiveAnswersByQuestionId(questionId: number): Observable<Answer[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Answer[]>(`${this.apiUrl}/answers/question/${questionId}/active`))
    );
  }

  // Phương thức này để lấy TẤT CẢ các câu trả lời (active và inactive) cho trang quản trị.
  // Các câu bị "xóa mềm" cũng sẽ có isActive: false.
  getAllAnswersForAdminByQuestionId(questionId: number): Observable<Answer[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Answer[]>(`${this.apiUrl}/answers/question/${questionId}/all`))
    );
  }

  updateAnswer(answerId: number, request: AnswerApiRequest): Observable<Answer> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.put<Answer>(`${this.apiUrl}/answers/${answerId}`, request))
    );
  }

  toggleAnswerStatus(answerId: number, newStatus: boolean): Observable<Answer> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.patch<Answer>(`${this.apiUrl}/answers/${answerId}/status?newStatus=${newStatus}`, {}))
    );
  }

  softDeleteAnswer(answerId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      // Backend sẽ đặt isActive = false cho câu trả lời này
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/answers/${answerId}`))
    );
  }
}
