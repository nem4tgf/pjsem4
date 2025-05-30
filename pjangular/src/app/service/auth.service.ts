import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest } from '../interface/auth.interface';
import { environment } from './enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, request);
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, request);
  }

  checkUserExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/auth/check-user/${username}`);
  }

  sendOtpForPasswordReset(email: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/auth/forgot-password`, null, { params: { email } });
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/auth/reset-password`, null, {
      params: { email, otp, newPassword }
    });
  }
}
