import { Component, OnInit } from '@angular/core';
import {
  ApexChart,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexResponsive
} from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = {
    userCount: 120,
    vocabularyCount: 350,
    lessonCount: 45,
    quizCount: 80
  };

  barChartOptions: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    title: ApexTitleSubtitle;
    colors: string[];
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    responsive: ApexResponsive[];
  } = {
    series: [
      {
        name: 'Thống kê',
        data: []
      }
    ],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '30%',
        borderRadius: 8
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: ['Người dùng', 'Từ vựng', 'Bài học', 'Bài kiểm tra'],
      title: {
        text: 'Danh mục',
        style: {
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif'
        }
      },
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Số lượng',
        style: {
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif'
        }
      },
      min: 0,
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    colors: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f'],
    title: {
      text: 'Thống kê hệ thống',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif'
      }
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300
          },
          plotOptions: {
            bar: {
              columnWidth: '40%'
            }
          }
        }
      },
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 250
          },
          plotOptions: {
            bar: {
              columnWidth: '50%'
            }
          }
        }
      }
    ]
  };

  pieChartOptions: {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    colors: string[];
    dataLabels: ApexDataLabels;
    responsive: ApexResponsive[];
  } = {
    series: [],
    chart: {
      type: 'pie',
      height: 350,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    labels: ['Người dùng', 'Từ vựng', 'Bài học', 'Bài kiểm tra'],
    colors: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f'],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      },
      formatter: (val, opts) => {
        return `${opts.w.config.series[opts.seriesIndex]} (${Math.round(Number(val))}%)`;
      }
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300
          },
          legend: {
            position: 'bottom',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          }
        }
      },
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 250
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  };

  constructor() {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    // Cập nhật dữ liệu cho biểu đồ
    this.barChartOptions.series[0].data = [
      this.stats.userCount,
      this.stats.vocabularyCount,
      this.stats.lessonCount,
      this.stats.quizCount
    ];
    this.pieChartOptions.series = [
      this.stats.userCount,
      this.stats.vocabularyCount,
      this.stats.lessonCount,
      this.stats.quizCount
    ];
  }
}
