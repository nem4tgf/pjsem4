import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { Role } from '../interface/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.isAuthenticatedSubject.value) {
      if (route.data && route.data['roles']) {
        const requiredRoles: Role[] = route.data['roles'];
        const userRole = this.authService.getUserRole();

        if (userRole && requiredRoles.includes(userRole)) {
          return true;
        } else {
          console.warn('Bạn không có quyền truy cập vào route này.');
          return this.router.createUrlTree(['/unauthorized']);
        }
      }
      return true;
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}
