import { Component } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-quiz-results',
  templateUrl: './quiz-results.component.html',
  styleUrls: ['./quiz-results.component.css']
})
export class QuizResultsComponent {
  filteredQuizResults: any[] = [
    { result_id: 1, user_id: 1, quiz_id: 1, score: 80, completed_at: '2025-05-01' },
    { result_id: 2, user_id: 2, quiz_id: 2, score: 90, completed_at: '2025-05-02' }
  ];
  isEditModalVisible = false;
  selectedResult: any = { result_id: 0, user_id: 0, quiz_id: 0, score: 0 };

  constructor(private notification: NzNotificationService) {}

  sortById = (a: any, b: any) => a.result_id - b.result_id;

  onCurrentPageDataChange(event: any): void {
    this.filteredQuizResults = event;
  }

  showModal(result?: any): void {
    if (result) {
      this.selectedResult = { ...result };
    } else {
      this.selectedResult = { result_id: 0, user_id: 0, quiz_id: 0, score: 0 };
    }
    this.isEditModalVisible = true;
  }

  handleOk(): void {
    if (this.selectedResult.result_id === 0) {
      this.selectedResult.result_id = this.filteredQuizResults.length + 1;
      this.filteredQuizResults.push({ ...this.selectedResult, completed_at: new Date().toISOString() });
      this.notification.success('Thành công', 'Thêm kết quả thành công');
    } else {
      this.filteredQuizResults = this.filteredQuizResults.map(r =>
        r.result_id === this.selectedResult.result_id ? { ...this.selectedResult } : r
      );
      this.notification.success('Thành công', 'Cập nhật kết quả thành công');
    }
    this.isEditModalVisible = false;
  }

  handleCancel(): void {
    this.isEditModalVisible = false;
  }

  deleteResult(id: number): void {
    this.filteredQuizResults = this.filteredQuizResults.filter(r => r.result_id !== id);
    this.notification.success('Thành công', 'Xóa kết quả thành công');
  }
}
