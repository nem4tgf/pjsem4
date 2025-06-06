// src/app/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { Stats } from 'src/app/interface/stats.interface';
import { StatsService } from 'src/app/service/stats.service';

// Import các loại từ ApexCharts cho cấu hình biểu đồ Column Chart
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexXAxis,
  ApexFill,
  ApexTooltip,
  ApexStroke,
  ApexTitleSubtitle,
  ApexLegend
} from "ng-apexcharts";


// Định nghĩa kiểu cho các options của biểu đồ Column Chart
export type ColumnChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: Stats | null = null;

  public resourceChartOptions: Partial<ColumnChartOptions> | undefined;
  // Đã bỏ userRolesChartOptions, vocabularyDifficultyChartOptions, lessonSkillChartOptions

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.statsService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        console.log('Loaded stats:', stats);
        this.initializeResourceChart(); // Chỉ gọi khởi tạo biểu đồ Resource Chart
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      }
    });
  }

  // Chỉ còn hàm initializeResourceChart()
  initializeResourceChart(): void {
    if (!this.stats) {
      return;
    }

    this.resourceChartOptions = {
      series: [
        {
          name: "Count",
          data: [
            this.stats.userCount,
            this.stats.vocabularyCount,
            this.stats.lessonCount,
            this.stats.quizCount,
            this.stats.questionCount || 0,
            this.stats.quizResultCount || 0
          ]
        }
      ],
      chart: {
        height: 350,
        type: "bar",
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%"
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: ["Users", "Vocabulary", "Lessons", "Quizzes", "Questions", "Quiz Results"]
      },
      yaxis: {
        title: {
          text: "Count"
        },
        labels: {
          formatter: function (val) {
            return Math.floor(val).toString();
          }
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "" + val + " items";
          }
        }
      },
      title: {
        text: "Resource Overview",
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      },
      legend: {
        show: false
      }
    };
  }
}
