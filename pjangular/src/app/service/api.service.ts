import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role, User } from '../interface/user.interface';
import { environment } from './enviroment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected apiUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  // Lấy thông tin user hiện tại từ token
  public getCurrentUser(): Observable<User> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return throwError(() => new Error('No token found'));
    }
    const username = this.extractUsernameFromToken(token);
    if (!username) {
      return throwError(() => new Error('Invalid token'));
    }
    return this.http.get<User>(`${this.apiUrl}/users/username/${username}`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }

  // Kiểm tra vai trò admin
  public checkAdminRole(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => {
        if (user.role === Role.ROLE_ADMIN) {
          return true;
        }
        throw new Error('Access denied: Admin role required');
      })
    );
  }

  // Kiểm tra xác thực (có token hợp lệ)
  public checkAuth(): Observable<boolean> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return throwError(() => new Error('No token found'));
    }
    const username = this.extractUsernameFromToken(token);
    if (!username) {
      return throwError(() => new Error('Invalid token'));
    }
    return this.http.get<User>(`${this.apiUrl}/users/username/${username}`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    }).pipe(
      map(() => true)
    );
  }

  private extractUsernameFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.username || null;
    } catch (e) {
      console.error('Failed to decode token:', e);
      return null;
    }
  }
}
