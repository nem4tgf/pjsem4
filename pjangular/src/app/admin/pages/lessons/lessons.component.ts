import { Component } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.css']
})
export class LessonsComponent {
  filteredLessons: any[] = [
    { lesson_id: 1, title: 'Basic Vocabulary', description: 'Learn basic English words.', level: 'beginner', created_at: '2025-05-01' },
    { lesson_id: 2, title: 'Intermediate Grammar', description: 'Understand English grammar.', level: 'intermediate', created_at: '2025-05-02' }
  ];
  isEditModalVisible = false;
  selectedLesson: any = { lesson_id: 0, title: '', description: '', level: 'beginner' };

  constructor(private notification: NzNotificationService) {}

  sortByTitle = (a: any, b: any) => a.title.localeCompare(b.title);

  onCurrentPageDataChange(event: any): void {
    this.filteredLessons = event;
  }

  showModal(lesson?: any): void {
    if (lesson) {
      this.selectedLesson = { ...lesson };
    } else {
      this.selectedLesson = { lesson_id: 0, title: '', description: '', level: 'beginner' };
    }
    this.isEditModalVisible = true;
  }

  handleOk(): void {
    if (this.selectedLesson.lesson_id === 0) {
      this.selectedLesson.lesson_id = this.filteredLessons.length + 1;
      this.filteredLessons.push({ ...this.selectedLesson, created_at: new Date().toISOString() });
      this.notification.success('Thành công', 'Thêm bài học thành công');
    } else {
      this.filteredLessons = this.filteredLessons.map(l =>
        l.lesson_id === this.selectedLesson.lesson_id ? { ...this.selectedLesson } : l
      );
      this.notification.success('Thành công', 'Cập nhật bài học thành công');
    }
    this.isEditModalVisible = false;
  }

  handleCancel(): void {
    this.isEditModalVisible = false;
  }

  deleteLesson(id: number): void {
    this.filteredLessons = this.filteredLessons.filter(l => l.lesson_id !== id);
    this.notification.success('Thành công', 'Xóa bài học thành công');
  }
}
