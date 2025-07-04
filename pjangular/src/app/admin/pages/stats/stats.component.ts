// src/app/stats/stats.component.ts
import { Component, OnInit } from '@angular/core';
import { Stats } from 'src/app/interface/stats.interface';
import { StatsService } from 'src/app/service/stats.service';
import { ApiService } from 'src/app/service/api.service'; // Import ApiService
import { NzNotificationService } from 'ng-zorro-antd/notification'; // Import NzNotificationService

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  stats: Stats | null = null;
  isAdmin: boolean = false; // Biến để kiểm tra quyền admin
  loadingStats = true; // Thêm biến loading cụ thể cho stats

  constructor(
    private statsService: StatsService,
    private apiService: ApiService, // Inject ApiService
    private notification: NzNotificationService // Inject NzNotificationService
  ) {}

  ngOnInit(): void {
    this.checkAdminStatusAndLoadStats();
  }

  private checkAdminStatusAndLoadStats(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        if (this.isAdmin) {
          this.loadStats(); // Chỉ tải stats nếu là admin
        } else {
          this.notification.warning('Warning', 'Bạn không có quyền truy cập trang thống kê.');
          this.loadingStats = false; // Ngừng loading nếu không có quyền
        }
      },
      error: (err) => {
        this.notification.error('Error', 'Không thể xác minh quyền quản trị.');
        console.error('Admin role check error:', err);
        this.isAdmin = false;
        this.loadingStats = false; // Ngừng loading nếu có lỗi
      }
    });
  }

  loadStats(): void {
    this.loadingStats = true; // Bắt đầu loading khi tải stats
    this.statsService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        console.log('Loaded stats:', stats);
        this.loadingStats = false; // Ngừng loading khi tải xong
      },
      error: (err) => {
        this.notification.error('Error', 'Lỗi khi tải thống kê: ' + (err.error?.message || err.message));
        console.error('Failed to load stats:', err);
        this.loadingStats = false; // Ngừng loading nếu có lỗi
      }
    });
  }

  // Hàm trợ giúp để chuyển đổi đối tượng phân phối thành mảng key-value
  getKeys(obj: { [key: string]: number } | undefined): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
