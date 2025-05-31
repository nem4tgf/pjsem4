// src/app/service/question.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service'; // Đảm bảo đã import ApiService
import { Question } from '../interface/question.interface'; // Đã cập nhật interface này

@Injectable({
  providedIn: 'root'
})
export class QuestionService extends ApiService { // Kế thừa ApiService để có checkAdminRole
  constructor(http: HttpClient) {
    super(http);
  }

  // Các phương thức này sẽ gọi checkAdminRole() từ ApiService (lớp cha)
  // trước khi thực hiện HTTP request.
  createQuestion(request: Question): Observable<Question> {
    return this.checkAdminRole().pipe(
      // Khi gửi request, backend chỉ cần quizId, questionText, skill.
      // Interface Question hiện tại (với quizId: number) là phù hợp.
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
