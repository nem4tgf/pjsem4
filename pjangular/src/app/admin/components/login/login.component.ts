import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoginRequest } from 'src/app/interface/auth.interface';
import { Role } from 'src/app/interface/user.interface';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';

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
      this.notification.warning('Cảnh báo', 'Vui lòng điền đầy đủ thông tin đăng nhập.');
      return;
    }

    this.loading = true;
    const request: LoginRequest = this.loginForm.value;

    this.authService.login(request).pipe(
      catchError(error => {
        const errorMessage = error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        this.notification.error('Lỗi', errorMessage);
        this.loading = false;
        return throwError(() => new Error(errorMessage));
      })
    ).subscribe({
      next: () => {
        const userRole = this.authService.getUserRole();
        if (userRole === Role.ROLE_ADMIN) {
          this.notification.success('Thành công', 'Đăng nhập với tư cách quản trị viên.');
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.authService.logout();
          this.notification.error('Truy cập bị từ chối', 'Bạn không có quyền truy cập vào khu vực quản trị. Vui lòng đăng nhập bằng tài khoản quản trị.');
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
