// src/app/service/stats.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Stats } from '../interface/stats.interface'; // Import interface Stats đầy đủ

@Injectable({
  providedIn: 'root'
})
export class StatsService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  // Cập nhật kiểu trả về của getStats() để sử dụng interface Stats
  // Và cập nhật kiểu generic cho http.get()
  getStats(): Observable<Stats> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Stats>(`${this.apiUrl}/stats`)) // Dùng <Stats> ở đây
    );
  }
}
