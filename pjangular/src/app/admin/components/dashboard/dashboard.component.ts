import { Component, OnInit } from '@angular/core';
import { Stats } from 'src/app/interface/stats.interface';
import { StatsService } from 'src/app/service/stats.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: Stats | null = null;

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.statsService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: () => {
        console.error('Failed to load stats');
      }
    });
  }
}
