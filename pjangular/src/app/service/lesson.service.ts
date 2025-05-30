import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Lesson } from '../interface/lesson.interface';
import { environment } from './enviroment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private apiUrl = `${environment.apiUrl}/lessons`;

  constructor(private http: HttpClient, private apiService: ApiService) {}

  createLesson(request: Lesson): Observable<Lesson> {
    console.log('Attempting to create lesson with request:', request);
    return this.apiService.checkAdminRole().pipe(
      switchMap(() => {
        console.log('Admin role verified, sending POST request');
        return this.http.post<Lesson>(this.apiUrl, request);
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
        console.error('Get lesson error:', err);
        return throwError(() => new Error(err.message || 'Failed to get lesson'));
      })
    );
  }

  getAllLessons(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(this.apiUrl).pipe(
      catchError(err => {
        console.error('Get all lessons error:', err);
        return throwError(() => new Error(err.message || 'Failed to load lessons'));
      })
    );
  }

  updateLesson(lessonId: number, request: Lesson): Observable<Lesson> {
    console.log('Attempting to update lesson with ID:', lessonId, 'and request:', request);
    return this.apiService.checkAdminRole().pipe(
      switchMap(() => this.http.put<Lesson>(`${this.apiUrl}/${lessonId}`, request)),
      catchError(err => {
        console.error('Update lesson error:', err);
        return throwError(() => new Error(err.message || 'Failed to update lesson'));
      })
    );
  }

  deleteLesson(lessonId: number): Observable<void> {
    console.log('Attempting to delete lesson with ID:', lessonId);
    return this.apiService.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/${lessonId}`)),
      catchError(err => {
        console.error('Delete lesson error:', err);
        return throwError(() => new Error(err.message || 'Failed to delete lesson'));
      })
    );
  }
}
