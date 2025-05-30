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

  getAllUsers(): Observable<User[]> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<User[]>(`${this.apiUrl}/users`))
    );
  }

  getUserByUsername(username: string): Observable<User> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<User>(`${this.apiUrl}/users/username/${username}`))
    );
  }

  getUserByEmail(email: string): Observable<User> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<User>(`${this.apiUrl}/users/email/${email}`))
    );
  }

  getUserById(userId: number): Observable<User> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.get<User>(`${this.apiUrl}/users/${userId}`))
    );
  }

  createUser(request: User): Observable<User> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.post<User>(`${this.apiUrl}/users`, request))
    );
  }

  updateUser(userId: number, request: User): Observable<User> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.put<User>(`${this.apiUrl}/users/${userId}`, request))
    );
  }

  deleteUser(userId: number): Observable<void> {
    return this.checkAuth().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/users/${userId}`))
    );
  }
}
