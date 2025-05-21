import { Component } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.css']
})
export class AnswersComponent {
  filteredAnswers: any[] = [
    { answer_id: 1, question_id: 1, answer_text: 'Quả táo', is_correct: true },
    { answer_id: 2, question_id: 1, answer_text: 'Quả cam', is_correct: false }
  ];
  isEditModalVisible = false;
  selectedAnswer: any = { answer_id: 0, question_id: 0, answer_text: '', is_correct: false };

  constructor(private notification: NzNotificationService) {}

  sortByText = (a: any, b: any) => a.answer_text.localeCompare(b.answer_text);

  onCurrentPageDataChange(event: any): void {
    this.filteredAnswers = event;
  }

  showModal(answer?: any): void {
    if (answer) {
      this.selectedAnswer = { ...answer };
    } else {
      this.selectedAnswer = { answer_id: 0, question_id: 0, answer_text: '', is_correct: false };
    }
    this.isEditModalVisible = true;
  }

  handleOk(): void {
    if (this.selectedAnswer.answer_id === 0) {
      this.selectedAnswer.answer_id = this.filteredAnswers.length + 1;
      this.filteredAnswers.push({ ...this.selectedAnswer });
      this.notification.success('Thành công', 'Thêm câu trả lời thành công');
    } else {
      this.filteredAnswers = this.filteredAnswers.map(a =>
        a.answer_id === this.selectedAnswer.answer_id ? { ...this.selectedAnswer } : a
      );
      this.notification.success('Thành công', 'Cập nhật câu trả lời thành công');
    }
    this.isEditModalVisible = false;
  }

  handleCancel(): void {
    this.isEditModalVisible = false;
  }

  deleteAnswer(id: number): void {
    this.filteredAnswers = this.filteredAnswers.filter(a => a.answer_id !== id);
    this.notification.success('Thành công', 'Xóa câu trả lời thành công');
  }
}
