import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { User } from 'src/app/interface/user.interface';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.apiService.getCurrentUser().pipe(
      catchError(error => {
        this.notification.error('Error', 'Failed to load user information.');
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
