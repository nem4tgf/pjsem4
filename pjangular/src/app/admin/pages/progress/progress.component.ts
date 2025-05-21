import { Component } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent {
  filteredProgress: any[] = [
    { progress_id: 1, user_id: 1, lesson_id: 1, status: 'in_progress', last_updated: '2025-05-01' },
    { progress_id: 2, user_id: 2, lesson_id: 2, status: 'completed', last_updated: '2025-05-02' }
  ];
  isEditModalVisible = false;
  selectedProgress: any = { progress_id: 0, user_id: 0, lesson_id: 0, status: 'not_started' };

  constructor(private notification: NzNotificationService) {}

  sortById = (a: any, b: any) => a.progress_id - b.progress_id;

  onCurrentPageDataChange(event: any): void {
    this.filteredProgress = event;
  }

  showModal(progress?: any): void {
    if (progress) {
      this.selectedProgress = { ...progress };
    } else {
      this.selectedProgress = { progress_id: 0, user_id: 0, lesson_id: 0, status: 'not_started' };
    }
    this.isEditModalVisible = true;
  }

  handleOk(): void {
    if (this.selectedProgress.progress_id === 0) {
      this.selectedProgress.progress_id = this.filteredProgress.length + 1;
      this.filteredProgress.push({ ...this.selectedProgress, last_updated: new Date().toISOString() });
      this.notification.success('Thành công', 'Thêm tiến độ thành công');
    } else {
      this.filteredProgress = this.filteredProgress.map(p =>
        p.progress_id === this.selectedProgress.progress_id ? { ...this.selectedProgress } : p
      );
      this.notification.success('Thành công', 'Cập nhật tiến độ thành công');
    }
    this.isEditModalVisible = false;
  }

  handleCancel(): void {
    this.isEditModalVisible = false;
  }

  deleteProgress(id: number): void {
    this.filteredProgress = this.filteredProgress.filter(p => p.progress_id !== id);
    this.notification.success('Thành công', 'Xóa tiến độ thành công');
  }
}
