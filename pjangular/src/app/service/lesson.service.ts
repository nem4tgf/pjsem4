// src/app/service/lesson.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Lesson, LessonSearchRequest, LessonPageResponse } from '../interface/lesson.interface'; // Updated import for LessonPageResponse
import { ApiService } from './api.service';
import { environment } from './enviroment';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private apiUrl = `${environment.apiUrl}/lessons`;

  constructor(private http: HttpClient, private apiService: ApiService) {}

  /**
   * Creates a new lesson by sending a POST request to the backend.
   * Requires ADMIN role on the backend.
   * @param request The lesson data to be created.
   * @returns An Observable of the created Lesson.
   */
  createLesson(request: Lesson): Observable<Lesson> {
    console.log('Attempting to create lesson with request:', request);
    return this.apiService.checkAuth().pipe( // Ensure user is authenticated before creating
      switchMap(() => {
        console.log('Authorization checked, sending POST request');
        // Destructure to exclude 'createdAt' from the request body as backend typically generates it.
        // 'durationMonths' is kept as it's likely a user-provided field unless backend auto-calculates it.
        const { createdAt, ...dataToSend } = request;
        return this.http.post<Lesson>(this.apiUrl, dataToSend);
      }),
      catchError(err => {
        console.error('Create lesson error:', err);
        return throwError(() => new Error(err.message || 'Failed to create lesson'));
      })
    );
  }

  /**
   * Retrieves a single lesson by its ID.
   * This endpoint is public on the backend.
   * @param lessonId The ID of the lesson to retrieve.
   * @returns An Observable of the Lesson.
   */
  getLessonById(lessonId: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.apiUrl}/${lessonId}`).pipe(
      catchError(err => {
        console.error(`Get lesson with ID ${lessonId} error:`, err);
        return throwError(() => new Error(err.message || `Failed to get lesson with ID ${lessonId}`));
      })
    );
  }

  /**
   * Retrieves all lessons.
   * This endpoint is public on the backend.
   * @returns An Observable of an array of Lessons.
   */
  getAllLessons(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(this.apiUrl).pipe(
      catchError(err => {
        console.error('Get all lessons error:', err);
        return throwError(() => new Error(err.message || 'Failed to load all lessons'));
      })
    );
  }

  /**
   * Updates an existing lesson by its ID.
   * Requires ADMIN role on the backend.
   * @param lessonId The ID of the lesson to update.
   * @param request The updated lesson data.
   * @returns An Observable of the updated Lesson.
   */
  updateLesson(lessonId: number, request: Lesson): Observable<Lesson> {
    console.log('Attempting to update lesson with ID:', lessonId, 'and request:', request);
    return this.apiService.checkAuth().pipe( // Ensure user is authenticated before updating
      switchMap(() => {
        // Destructure to exclude 'createdAt' from the request body as backend typically generates it.
        const { createdAt, ...dataToSend } = request;
        return this.http.put<Lesson>(`${this.apiUrl}/${lessonId}`, dataToSend);
      }),
      catchError(err => {
        console.error(`Update lesson with ID ${lessonId} error:`, err);
        return throwError(() => new Error(err.message || `Failed to update lesson with ID ${lessonId}`));
      })
    );
  }

  /**
   * Deletes a lesson by its ID.
   * Requires ADMIN role on the backend.
   * @param lessonId The ID of the lesson to delete.
   * @returns An Observable that emits void when the deletion is successful.
   */
  deleteLesson(lessonId: number): Observable<void> {
    console.log('Attempting to delete lesson with ID:', lessonId);
    return this.apiService.checkAuth().pipe( // Ensure user is authenticated before deleting
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/${lessonId}`)),
      catchError(err => {
        console.error(`Delete lesson with ID ${lessonId} error:`, err);
        return throwError(() => new Error(err.message || `Failed to delete lesson with ID ${lessonId}`));
      })
    );
  }

  /**
   * Searches for lessons based on provided criteria.
   * This endpoint is public on the backend.
   * @param request The search criteria (e.g., level, skill, page, size).
   * @returns An Observable of LessonPageResponse containing a list of lessons and pagination info.
   */
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
