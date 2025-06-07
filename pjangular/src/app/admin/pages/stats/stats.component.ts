// src/app/stats/stats.component.ts

import { Component, OnInit } from '@angular/core';
import { Stats } from 'src/app/interface/stats.interface'; // Đảm bảo interface này đã được cập nhật
import { StatsService } from 'src/app/service/stats.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  stats: Stats | null = null;

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.statsService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        console.log('Loaded stats:', stats); // Log để kiểm tra dữ liệu nhận được
      },
      error: (err) => { // Thay đổi sang (err) để có thể log lỗi chi tiết hơn
        console.error('Failed to load stats:', err); // Log lỗi chi tiết
      }
    });
  }
}
