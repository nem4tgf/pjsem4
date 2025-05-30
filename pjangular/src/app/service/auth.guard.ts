import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service'; // Giả định bạn có AuthService

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const authToken = localStorage.getItem('authToken'); // Hoặc lấy từ AuthService của bạn

    if (authToken) {
      // Người dùng đã đăng nhập
      return true;
    } else {
      // Người dùng chưa đăng nhập, chuyển hướng về trang login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
