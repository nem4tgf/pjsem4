import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { User } from 'src/app/interface/user.interface';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  isCollapsed = false;
  currentUser: User | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  loadCurrentUser(): void {
    this.apiService.getCurrentUser().pipe(
      catchError(error => {
        this.notification.error('Error', 'Failed to load user information. Please log in again.');
        this.logout();
        return throwError(() => error);
      })
    ).subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    this.currentUser = null;
    this.notification.success('Success', 'Logged out successfully');
    this.router.navigate(['/login']);
  }
}
