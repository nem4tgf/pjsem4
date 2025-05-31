// src/app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Stats } from 'src/app/interface/stats.interface';
import { StatsService } from 'src/app/service/stats.service';

// Import các loại từ ApexCharts cho cấu hình biểu đồ Column Chart
import {
  ApexAxisChartSeries, // Dùng cho biểu đồ có trục X, Y
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
  title: ApexTitleSubtitle; // Thêm title cho biểu đồ
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

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.statsService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.initializeResourceChart(); // Khởi tạo biểu đồ cột
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      }
    });
  }

  initializeResourceChart(): void {
    if (!this.stats) {
      return;
    }

    this.resourceChartOptions = {
      series: [
        {
          name: "Count", // Tên của series (có thể là "Số lượng" hoặc "Số lượng")
          data: [
            this.stats.userCount,
            this.stats.vocabularyCount,
            this.stats.lessonCount,
            this.stats.quizCount
          ]
        }
      ],
      chart: {
        height: 350,
        type: "bar", // Loại biểu đồ: "bar" (cột dọc)
        toolbar: {
          show: false // Không hiển thị thanh công cụ của biểu đồ
        }
      },
      plotOptions: {
        bar: {
          horizontal: false, // Cột dọc
          columnWidth: "55%" // Chiều rộng của cột
        }
      },
      dataLabels: {
        enabled: false // Không hiển thị số liệu trực tiếp trên cột (tùy chọn, bạn có thể bật lên)
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: ["Users", "Vocabulary", "Lessons", "Quizzes"] // Các danh mục trên trục X
      },
      yaxis: {
        title: {
          text: "Count" // Tiêu đề trục Y
        },
        labels: {
          formatter: function (val) {
            return Math.floor(val).toString(); // Đảm bảo nhãn trục Y là số nguyên
          }
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "" + val + " items"; // Định dạng tooltip khi hover
          }
        }
      },
      title: {
        text: "Resource Overview", // Tiêu đề cho biểu đồ chính
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      },
      legend: {
        show: false // Không hiển thị chú giải nếu chỉ có một series
      }
    };
  }
}
