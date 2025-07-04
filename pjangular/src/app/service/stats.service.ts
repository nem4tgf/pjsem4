// src/app/service/stats.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators'; // Thêm catchError
import { ApiService } from './api.service';
import { Stats } from '../interface/stats.interface'; // Import interface Stats đầy đủ

@Injectable({
  providedIn: 'root'
})
export class StatsService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Lấy các số liệu thống kê toàn diện về hệ thống.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: GET /api/stats
   * @returns Observable<Stats> chứa các số liệu thống kê.
   */
  getStats(): Observable<Stats> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<Stats>(`${this.apiUrl}/stats`)), // Dùng <Stats> ở đây
      catchError(this.handleError) // Sử dụng handleError từ ApiService
    );
  }
}
