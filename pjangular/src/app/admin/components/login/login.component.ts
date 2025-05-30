import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoginRequest, LoginResponse } from 'src/app/interface/auth.interface';
import { User, Role } from 'src/app/interface/user.interface';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private notification: NzNotificationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const request: LoginRequest = this.loginForm.value;

    this.authService.login(request).pipe(
      switchMap((response: LoginResponse) => {
        localStorage.setItem('authToken', response.token);
        return this.userService.getUserByUsername(request.username);
      }),
      switchMap((user: User) => {
        if (user.role === Role.ROLE_ADMIN) {
          this.notification.success('Success', 'Logged in as admin');
          return this.router.navigate(['/admin/dashboard']).then(() => user);
        } else {
          localStorage.removeItem('authToken');
          return throwError(() => new Error('Access denied: Admin role required'));
        }
      }),
      catchError(error => {
        this.notification.error('Error', error.message || 'Login failed. Please try again.');
        this.loading = false;
        return throwError(() => error);
      })
    ).subscribe({
      next: () => {
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
