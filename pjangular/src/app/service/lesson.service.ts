// src/app/service/lesson.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Lesson, LessonSearchRequest, LessonPageResponse } from '../interface/lesson.interface';
import { ApiService } from './api.service';
import { environment } from './enviroment';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private apiUrl = `${environment.apiUrl}/lessons`;

  constructor(private http: HttpClient, private apiService: ApiService) {}

  createLesson(request: Lesson): Observable<Lesson> {
    console.log('Attempting to create lesson with request:', request);
    return this.apiService.checkAuth().pipe(
      switchMap(() => {
        console.log('Authorization checked, sending POST request');
        const { createdAt, ...dataToSend } = request;
        return this.http.post<Lesson>(this.apiUrl, dataToSend);
      }),
      catchError(err => {
        console.error('Create lesson error:', err);
        return throwError(() => new Error(err.message || 'Failed to create lesson'));
      })
    );
  }

  getLessonById(lessonId: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.apiUrl}/${lessonId}`).pipe(
      catchError(err => {
        console.error(`Get lesson with ID ${lessonId} error:`, err);
        return throwError(() => new Error(err.message || `Failed to get lesson with ID ${lessonId}`));
      })
    );
  }

  getAllLessons(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(this.apiUrl).pipe(
      catchError(err => {
        console.error('Get all lessons error:', err);
        return throwError(() => new Error(err.message || 'Failed to load all lessons'));
      })
    );
  }

  updateLesson(lessonId: number, request: Lesson): Observable<Lesson> {
    console.log('Attempting to update lesson with ID:', lessonId, 'and request:', request);
    return this.apiService.checkAuth().pipe(
      switchMap(() => {
        const { createdAt, ...dataToSend } = request;
        return this.http.put<Lesson>(`${this.apiUrl}/${lessonId}`, dataToSend);
      }),
      catchError(err => {
        console.error(`Update lesson with ID ${lessonId} error:`, err);
        return throwError(() => new Error(err.message || `Failed to update lesson with ID ${lessonId}`));
      })
    );
  }

  hideLesson(lessonId: number): Observable<void> {
    console.log('Attempting to hide lesson with ID:', lessonId);
    return this.apiService.checkAuth().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/${lessonId}`)),
      catchError(err => {
        console.error(`Hide lesson with ID ${lessonId} error:`, err);
        return throwError(() => new Error(err.message || `Failed to hide lesson with ID ${lessonId}`));
      })
    );
  }

  searchLessons(request: LessonSearchRequest): Observable<LessonPageResponse> {
    console.log('Attempting to search lessons with request:', request);
    return this.http.post<LessonPageResponse>(`${this.apiUrl}/search`, request).pipe(
      catchError(err => {
        console.error('Search lessons error:', err);
        return throwError(() => new Error(err.message || 'Failed to search lessons'));
      })
    );
  }
}
