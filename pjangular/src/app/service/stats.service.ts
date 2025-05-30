import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StatsService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  getStats(): Observable<{ userCount: number; vocabularyCount: number; lessonCount: number; quizCount: number }> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<{ userCount: number; vocabularyCount: number; lessonCount: number; quizCount: number }>(`${this.apiUrl}/stats`))
    );
  }
}
