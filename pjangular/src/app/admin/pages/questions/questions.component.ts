import { Component } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent {
  filteredQuestions: any[] = [
    { question_id: 1, quiz_id: 1, question_text: 'What is the meaning of "apple"?', type: 'multiple_choice' },
    { question_id: 2, quiz_id: 2, question_text: 'Fill in: The sunset is ___.', type: 'fill_in_the_blank' }
  ];
  isEditModalVisible = false;
  selectedQuestion: any = { question_id: 0, quiz_id: 0, question_text: '', type: 'multiple_choice' };

  constructor(private notification: NzNotificationService) {}

  sortByText = (a: any, b: any) => a.question_text.localeCompare(b.question_text);

  onCurrentPageDataChange(event: any): void {
    this.filteredQuestions = event;
  }

  showModal(question?: any): void {
    if (question) {
      this.selectedQuestion = { ...question };
    } else {
      this.selectedQuestion = { question_id: 0, quiz_id: 0, question_text: '', type: 'multiple_choice' };
    }
    this.isEditModalVisible = true;
  }

  handleOk(): void {
    if (this.selectedQuestion.question_id === 0) {
      this.selectedQuestion.question_id = this.filteredQuestions.length + 1;
      this.filteredQuestions.push({ ...this.selectedQuestion });
      this.notification.success('Thành công', 'Thêm câu hỏi thành công');
    } else {
      this.filteredQuestions = this.filteredQuestions.map(q =>
        q.question_id === this.selectedQuestion.question_id ? { ...this.selectedQuestion } : q
      );
      this.notification.success('Thành công', 'Cập nhật câu hỏi thành công');
    }
    this.isEditModalVisible = false;
  }

  handleCancel(): void {
    this.isEditModalVisible = false;
  }

  deleteQuestion(id: number): void {
    this.filteredQuestions = this.filteredQuestions.filter(q => q.question_id !== id);
    this.notification.success('Thành công', 'Xóa câu hỏi thành công');
  }
}
