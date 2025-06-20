// src/app/service/question.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // Import HttpParams
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Question } from '../interface/question.interface';
import { Skill } from '../interface/lesson.interface'; // Import Skill để dùng trong tham số tìm kiếm

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

  /**
   * Phương thức tìm kiếm câu hỏi với các tham số tùy chọn.
   * @param quizId ID Quiz (tùy chọn)
   * @param skill Kỹ năng (tùy chọn)
   * @param questionText Văn bản câu hỏi (tùy chọn)
   * @returns Observable của mảng Question.
   */
  searchQuestions(quizId?: number, skill?: Skill, questionText?: string): Observable<Question[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => {
        let params = new HttpParams();
        if (quizId) {
          params = params.append('quizId', quizId.toString());
        }
        if (skill) {
          params = params.append('skill', skill);
        }
        if (questionText) {
          params = params.append('questionText', questionText);
        }
        // Gọi endpoint search mới ở backend
        return this.http.get<Question[]>(`${this.apiUrl}/questions/search`, { params });
      })
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
