// src/app/service/progress.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Progress } from '../interface/progress.interface';

@Injectable({
  providedIn: 'root'
})
export class ProgressService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  // Update hoặc tạo mới tiến độ (backend xử lý upsert)
  // Request body: { userId: number, lessonId: number, skill: Skill, status: Status, completionPercentage: number }
  updateProgress(request: Progress): Observable<Progress> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<Progress>(`${this.apiUrl}/progress`, request))
    );
  }

  // Lấy tiến độ theo User và Lesson (nếu có API này)
  getProgressByUserAndLesson(userId: number, lessonId: number): Observable<Progress> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Progress>(`${this.apiUrl}/progress/user/${userId}/lesson/${lessonId}`))
    );
  }

  // Lấy tất cả tiến độ của một User
  getProgressByUser(userId: number): Observable<Progress[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Progress[]>(`${this.apiUrl}/progress/user/${userId}`))
    );
  }
}
