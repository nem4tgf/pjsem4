import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { User } from 'src/app/interface/user.interface';
import { catchError, takeUntil } from 'rxjs/operators';
import { throwError, Subject, interval } from 'rxjs'; // Import Subject và interval
import { ApiService } from '../service/api.service';
import { EnrollmentService } from '../service/enrollment.service'; // Import EnrollmentService
import { Enrollment } from '../interface/enrollment.interface';   // Import Enrollment interface
import { Role } from 'src/app/interface/user.interface'; // Import Role để kiểm tra quyền

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  currentUser: User | null = null;
  expiringEnrollments: Enrollment[] = []; // Danh sách các đăng ký sắp hết hạn/đã hết hạn
  private destroy$ = new Subject<void>(); // Subject để hủy bỏ tất cả các subscriptions khi component bị hủy
  private pollingInterval = 60 * 1000; // Tần suất kiểm tra (60 giây = 1 phút)

  constructor(
    private apiService: ApiService,
    private router: Router,
    private notification: NzNotificationService,
    private enrollmentService: EnrollmentService // Inject EnrollmentService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();

    // Kiểm tra quyền admin và bắt đầu tải thông báo nếu có
    this.apiService.checkAdminRole().subscribe(isAdmin => {
      if (isAdmin) {
        this.loadExpiringEnrollments();
        // Cứ mỗi `pollingInterval` (ví dụ 1 phút), kiểm tra lại các khóa học sắp hết hạn
        interval(this.pollingInterval)
          .pipe(takeUntil(this.destroy$)) // Hủy bỏ subscription khi component bị hủy
          .subscribe(() => this.loadExpiringEnrollments());
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();    // Phát tín hiệu hủy bỏ
    this.destroy$.complete(); // Hoàn thành Subject
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  loadCurrentUser(): void {
    this.apiService.getCurrentUser().pipe(
      catchError(error => {
        this.notification.error('Lỗi', 'Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.');
        this.logout(); // Đăng xuất nếu không thể tải thông tin người dùng
        return throwError(() => error);
      })
    ).subscribe(user => {
      this.currentUser = user;
    });
  }

  // Phương thức để tải các đăng ký sắp hết hạn
  loadExpiringEnrollments(): void {
    // Chỉ tải nếu người dùng hiện tại là ADMIN
    if (this.currentUser && this.currentUser.role === Role.ROLE_ADMIN) {
      this.enrollmentService.getExpiringEnrollments().pipe(
        catchError(error => {
          console.error('Lỗi khi tải các đăng ký sắp hết hạn:', error);
          // Không hiển thị NzNotification cho lỗi này để tránh làm phiền người dùng
          // nếu lỗi không quá nghiêm trọng (ví dụ: mất mạng tạm thời)
          return throwError(() => error);
        })
      ).subscribe(enrollments => {
        this.expiringEnrollments = enrollments;
        // console.log('Các đăng ký sắp hết hạn:', this.expiringEnrollments); // Để debug
      });
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    this.currentUser = null;
    this.notification.success('Thành công', 'Đăng xuất thành công');
    this.router.navigate(['/login']);
  }
}
