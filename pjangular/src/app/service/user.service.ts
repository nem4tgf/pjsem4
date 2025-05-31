// src/app/service/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../interface/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  // Lấy tất cả người dùng
  getAllUsers(): Observable<User[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<User[]>(`${this.apiUrl}/users`))
    );
  }

  // Lấy người dùng theo username
  getUserByUsername(username: string): Observable<User> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<User>(`${this.apiUrl}/users/username/${username}`))
    );
  }

  // Lấy người dùng theo email
  getUserByEmail(email: string): Observable<User> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<User>(`${this.apiUrl}/users/email/${email}`))
    );
  }

  // Lấy người dùng theo ID
  getUserById(userId: number): Observable<User> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<User>(`${this.apiUrl}/users/${userId}`))
    );
  }

  // Tạo người dùng mới
  // Request body: { username, email, password, fullName, avatarUrl, role }
  createUser(request: User): Observable<User> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<User>(`${this.apiUrl}/users`, request))
    );
  }

  // Cập nhật người dùng
  // Request body: { username, email, fullName, avatarUrl, role } (không có password)
  updateUser(userId: number, request: User): Observable<User> {
    // Để an toàn, chỉ gửi các trường mà backend UserUpdateRequest DTO mong đợi
    // (backend của bạn không cho phép update password qua đây)
    const updatePayload = {
        username: request.username,
        email: request.email,
        fullName: request.fullName,
        avatarUrl: request.avatarUrl,
        role: request.role
    };
    return this.checkAuth().pipe(
      switchMap(() => this.http.put<User>(`${this.apiUrl}/users/${userId}`, updatePayload))
    );
  }

  // Xóa người dùng
  deleteUser(userId: number): Observable<void> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/users/${userId}`))
    );
  }
}
