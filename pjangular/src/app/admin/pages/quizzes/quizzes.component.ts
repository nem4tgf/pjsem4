import { Component } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.css']
})
export class QuizzesComponent {
  filteredQuizzes: any[] = [
    { quiz_id: 1, lesson_id: 1, title: 'Basic Vocabulary Quiz', created_at: '2025-05-01' },
    { quiz_id: 2, lesson_id: 2, title: 'Grammar Quiz', created_at: '2025-05-02' }
  ];
  isEditModalVisible = false;
  selectedQuiz: any = { quiz_id: 0, lesson_id: 0, title: '' };

  constructor(private notification: NzNotificationService) {}

  sortByTitle = (a: any, b: any) => a.title.localeCompare(b.title);

  onCurrentPageDataChange(event: any): void {
    this.filteredQuizzes = event;
  }

  showModal(quiz?: any): void {
    if (quiz) {
      this.selectedQuiz = { ...quiz };
    } else {
      this.selectedQuiz = { quiz_id: 0, lesson_id: 0, title: '' };
    }
    this.isEditModalVisible = true;
  }

  handleOk(): void {
    if (this.selectedQuiz.quiz_id === 0) {
      this.selectedQuiz.quiz_id = this.filteredQuizzes.length + 1;
      this.filteredQuizzes.push({ ...this.selectedQuiz, created_at: new Date().toISOString() });
      this.notification.success('Thành công', 'Thêm bài kiểm tra thành công');
    } else {
      this.filteredQuizzes = this.filteredQuizzes.map(q =>
        q.quiz_id === this.selectedQuiz.quiz_id ? { ...this.selectedQuiz } : q
      );
      this.notification.success('Thành công', 'Cập nhật bài kiểm tra thành công');
    }
    this.isEditModalVisible = false;
  }

  handleCancel(): void {
    this.isEditModalVisible = false;
  }

  deleteQuiz(id: number): void {
    this.filteredQuizzes = this.filteredQuizzes.filter(q => q.quiz_id !== id);
    this.notification.success('Thành công', 'Xóa bài kiểm tra thành công');
  }
}
