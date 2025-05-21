import { Component, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexResponsive,
  ApexNonAxisChartSeries
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: ChartOptions;
  stats = {
    userCount: 10,
    vocabularyCount: 50,
    lessonCount: 5,
    quizCount: 15
  };

  constructor() {
    this.chartOptions = {
      series: [this.stats.userCount, this.stats.vocabularyCount, this.stats.lessonCount, this.stats.quizCount],
      chart: {
        type: 'pie',
        width: 380,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      labels: ['Users', 'Vocabulary', 'Lessons', 'Quizzes'],
      colors: ['#1890ff', '#52c41a', '#f5222d', '#faad14'],
      legend: {
        position: 'bottom'
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    };
  }
}
