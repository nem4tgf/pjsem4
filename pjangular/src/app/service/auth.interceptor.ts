// src/app/interceptors/auth.interceptor.ts

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Lấy token từ localStorage (hoặc từ một service quản lý token của bạn)
    const authToken = localStorage.getItem('authToken');

    // Nếu có token, clone request và thêm header Authorization
    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}` // Thêm token vào header
        }
      });
    }

    // Chuyển tiếp request đã được sửa đổi (hoặc không sửa đổi)
    return next.handle(request);
  }
}
