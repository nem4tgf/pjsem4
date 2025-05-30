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

  updateProgress(request: Progress): Observable<Progress> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<Progress>(`${this.apiUrl}/progress`, request))
    );
  }

  getProgressByUserAndLesson(userId: number, lessonId: number): Observable<Progress> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Progress>(`${this.apiUrl}/progress/user/${userId}/lesson/${lessonId}`))
    );
  }

  getProgressByUser(userId: number): Observable<Progress[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<Progress[]>(`${this.apiUrl}/progress/user/${userId}`))
    );
  }
}
