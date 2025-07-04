import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { User, Role } from 'src/app/interface/user.interface';
import { catchError, takeUntil } from 'rxjs/operators';
import { throwError, Subject, interval } from 'rxjs';
import { ApiService } from '../service/api.service';
import { EnrollmentService } from '../service/enrollment.service';
import { Enrollment } from '../interface/enrollment.interface';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  currentUser: User | null = null;
  expiringEnrollments: Enrollment[] = [];
  private destroy$ = new Subject<void>();
  private pollingInterval = 60 * 1000; // 1 phút

  constructor(
    private apiService: ApiService,
    private router: Router,
    private notification: NzNotificationService,
    private enrollmentService: EnrollmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();

    this.apiService.checkAdminRole().pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.warn('Người dùng không phải Admin, bỏ qua tải thông báo đăng ký.');
        this.expiringEnrollments = [];
        return throwError(() => err);
      })
    ).subscribe(isAdmin => {
      if (isAdmin) {
        this.loadExpiringEnrollments();
        interval(this.pollingInterval)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => this.loadExpiringEnrollments());
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  loadCurrentUser(): void {
    this.apiService.getCurrentUser().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.notification.error('Lỗi', 'Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.');
        this.logout();
        return throwError(() => error);
      })
    ).subscribe(user => {
      this.currentUser = user;
    });
  }

  loadExpiringEnrollments(): void {
    if (this.currentUser && this.currentUser.role === Role.ROLE_ADMIN) {
      this.enrollmentService.getExpiringEnrollments().pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Lỗi khi tải các đăng ký sắp hết hạn:', error);
          this.expiringEnrollments = [];
          return throwError(() => error);
        })
      ).subscribe((enrollments: Enrollment[]) => {
        this.expiringEnrollments = enrollments;
      });
    } else {
      this.expiringEnrollments = [];
    }
  }

  logout(): void {
    this.authService.logout();
    this.currentUser = null;
    this.notification.success('Thành công', 'Đăng xuất thành công');
    this.router.navigate(['/login']);
  }
}
