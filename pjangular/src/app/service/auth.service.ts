import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, Role } from '../interface/auth.interface';
import { environment } from './enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_ROLE_KEY = 'user_role';

  public isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.hasToken());
  public currentUserRole: BehaviorSubject<Role | null> = new BehaviorSubject<Role | null>(this.getStoredUserRole());

  constructor(private http: HttpClient) {
    this.checkInitialAuthState();
  }

  private checkInitialAuthState(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.isAuthenticatedSubject.next(true);
      this.extractRoleFromToken(token);
    } else {
      this.isAuthenticatedSubject.next(false);
      this.currentUserRole.next(null);
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.isAuthenticatedSubject.next(true);
    this.extractRoleFromToken(token);
  }

  private getStoredUserRole(): Role | null {
    const role = localStorage.getItem(this.USER_ROLE_KEY);
    if (role && Object.values(Role).includes(role as Role)) {
      return role as Role;
    }
    return null;
  }

  private setUserRole(role: Role): void {
    localStorage.setItem(this.USER_ROLE_KEY, role);
    this.currentUserRole.next(role);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ROLE_KEY);
    this.isAuthenticatedSubject.next(false);
    this.currentUserRole.next(null);
    console.log('Người dùng đã đăng xuất.');
  }

  getUserRole(): Role | null {
    return this.currentUserRole.value;
  }

  private extractRoleFromToken(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role || null;
      if (role && Object.values(Role).includes(role)) {
        this.setUserRole(role as Role);
      } else {
        console.warn('Không tìm thấy vai trò hợp lệ trong token. Mặc định là ROLE_USER.');
        this.setUserRole(Role.ROLE_USER);
      }
    } catch (e) {
      console.error('Lỗi khi giải mã token:', e);
      this.setUserRole(Role.ROLE_USER);
    }
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
          console.log('Đăng nhập thành công, token đã được lưu.');
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, request).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
          console.log('Đăng ký thành công, token đã được lưu và tự động đăng nhập.');
        }
      })
    );
  }

  checkUserExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/auth/check-user/${username}`);
  }

  sendOtpForPasswordReset(email: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/auth/forgot-password`, null, {
      params: { email },
      responseType: 'text' as 'json'
    });
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/auth/reset-password`, null, {
      params: { email, otp, newPassword },
      responseType: 'text' as 'json'
    });
  }
}
