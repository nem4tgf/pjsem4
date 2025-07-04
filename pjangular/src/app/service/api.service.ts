// src/app/service/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Role, User } from '../interface/user.interface';
import { environment } from './enviroment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected apiUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  protected handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    let errorMessage = 'Đã xảy ra lỗi không xác định!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi: ${error.error.message}`;
    } else if (error.error && typeof error.error === 'string') {
      errorMessage = `Lỗi từ server: ${error.error}`;
    } else if (error.error && error.error.message) {
      errorMessage = `Lỗi từ server: ${error.error.message}`;
    } else {
      errorMessage = `Mã lỗi: ${error.status}\nThông báo: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  public getCurrentUser(): Observable<User> {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      return throwError(() => new Error('Không tìm thấy token.'));
    }
    return this.http.get<User>(`${this.apiUrl}/users/current`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    }).pipe(
      catchError(this.handleError)
    );
  }

  public checkAdminRole(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => {
        if (user.role === Role.ROLE_ADMIN) {
          return true;
        }
        throw new Error('Từ chối truy cập: Yêu cầu quyền Admin.');
      }),
      catchError(error => {
        if (error instanceof Error && error.message.includes('Yêu cầu quyền Admin')) {
          console.warn(error.message);
          return throwError(() => error);
        }
        return this.handleError(error);
      })
    );
  }

  public checkAuth(): Observable<boolean> {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      return throwError(() => new Error('Không tìm thấy token.'));
    }
    return this.getCurrentUser().pipe(
      map(() => true),
      catchError(this.handleError)
    );
  }

  private extractUsernameFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.username || null;
    } catch (e) {
      console.error('Không thể giải mã token:', e);
      return null;
    }
  }
}
