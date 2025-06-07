// src/app/admin/pages/answers/answers.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Answer } from 'src/app/interface/answer.interface';
import { Question } from 'src/app/interface/question.interface';
import { AnswerService } from 'src/app/service/answer.service';
import { QuestionService } from 'src/app/service/question.service';

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.css']
})
export class AnswersComponent implements OnInit {
  answers: Answer[] = [];
  questions: Question[] = [];
  isVisible = false;
  isEdit = false;
  answerForm: FormGroup;
  selectedQuestionId: number | null = null;

  constructor(
    private answerService: AnswerService,
    private questionService: QuestionService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {
    this.answerForm = this.fb.group({
      answerId: [null],
      questionId: [null, Validators.required],
      content: ['', [Validators.required, this.noWhitespaceValidator]],
      isCorrect: [false]
    });
  }

  ngOnInit(): void {
    this.loadQuestions();
  }

  noWhitespaceValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  };

  loadQuestions(): void {
    this.questionService.getQuestionsByQuizId(1).subscribe(questions => {
      this.questions = questions;
      if (this.selectedQuestionId) {
        this.loadAnswers(this.selectedQuestionId);
      } else if (this.questions.length > 0) {
        this.selectedQuestionId = this.questions[0].questionId;
        this.loadAnswers(this.selectedQuestionId);
      }
    }, error => {
      console.error('Failed to load questions:', error);
      this.notification.error('Lỗi', 'Không thể tải danh sách câu hỏi.');
    });
  }

  // Tải danh sách câu trả lời cho câu hỏi đã chọn (bao gồm cả active và disabled)
  loadAnswers(questionId: number): void {
    if (questionId === null) {
      this.answers = [];
      return;
    }
    // Vẫn gọi endpoint lấy TẤT CẢ các câu trả lời từ backend
    this.answerService.getAllAnswersForAdminByQuestionId(questionId).subscribe(answers => {
      // THAY ĐỔI LỚN Ở ĐÂY: Lọc bỏ những câu trả lời có isActive = false khi tải lần đầu
      // nếu bạn muốn chúng không bao giờ xuất hiện sau khi "xóa mềm".
      // Tuy nhiên, nếu bạn muốn "Disabled" vẫn xuất hiện (để có thể kích hoạt lại),
      // thì không cần lọc ở đây. Tôi sẽ giữ nguyên như trước, nghĩa là Disabled vẫn hiện.
      // Dưới đây là cách nếu bạn muốn ẩn cả Disabled:
      // this.answers = answers.filter(answer => answer.isActive);
      this.answers = answers; // Giữ nguyên để hiển thị cả Active và Disabled
    }, error => {
      console.error('Failed to load answers:', error);
      this.notification.error('Lỗi', 'Không thể tải câu trả lời.');
    });
  }

  getQuestionText(questionId: number | undefined): string {
    if (questionId === undefined || questionId === null) {
      return 'N/A';
    }
    const question = this.questions.find(q => q.questionId === questionId);
    return question ? question.questionText : 'N/A';
  }

  showModal(isEdit: boolean, answer?: Answer): void {
    this.isEdit = isEdit;
    if (isEdit && answer) {
      this.answerForm.patchValue({
        answerId: answer.answerId,
        content: answer.content,
        isCorrect: answer.isCorrect,
        questionId: answer.questionId
      });
      this.selectedQuestionId = answer.questionId;
    } else {
      this.answerForm.reset();
      this.answerForm.get('isCorrect')?.setValue(false);
      if (this.selectedQuestionId !== null) {
        this.answerForm.get('questionId')?.setValue(this.selectedQuestionId);
      }
    }
    this.isVisible = true;
  }

  handleOk(): void {
    for (const i in this.answerForm.controls) {
      this.answerForm.controls[i].markAsDirty();
      this.answerForm.controls[i].updateValueAndValidity();
    }

    if (this.answerForm.invalid) {
      this.notification.warning('Cảnh báo', 'Vui lòng điền đầy đủ và đúng thông tin.');
      return;
    }

    const formValue = this.answerForm.value;

    const answerDataToSend = {
      content: formValue.content,
      isCorrect: formValue.isCorrect,
      questionId: formValue.questionId
    };

    if (this.isEdit) {
      const answerId = formValue.answerId;
      if (answerId === null || answerId === undefined) {
        this.notification.error('Lỗi', 'Thiếu ID câu trả lời để cập nhật.');
        return;
      }
      this.answerService.updateAnswer(answerId, answerDataToSend).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Cập nhật câu trả lời thành công.');
          this.loadAnswers(this.selectedQuestionId!);
          this.isVisible = false;
        },
        error: error => {
          console.error('Failed to update answer:', error);
          const errorMessage = error.error?.message || 'Không thể cập nhật câu trả lời.';
          this.notification.error('Lỗi', errorMessage);
        }
      });
    } else {
      this.answerService.createAnswer(answerDataToSend).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Tạo câu trả lời thành công. Vui lòng kích hoạt để sử dụng.');
          this.loadAnswers(this.selectedQuestionId!);
          this.isVisible = false;
        },
        error: error => {
          console.error('Failed to create answer:', error);
          const errorMessage = error.error?.message || 'Không thể tạo câu trả lời.';
          this.notification.error('Lỗi', errorMessage);
        }
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.answerForm.reset({ isCorrect: false });
  }

  toggleAnswerStatus(answer: Answer): void {
    const newStatus = !answer.isActive;
    this.modal.confirm({
      nzTitle: newStatus ? 'Bạn có chắc chắn muốn kích hoạt câu trả lời này?' : 'Bạn có chắc chắn muốn vô hiệu hóa câu trả lời này?',
      nzContent: 'Hành động này sẽ thay đổi khả năng hiển thị/sử dụng của câu trả lời.',
      nzOnOk: () => {
        if (answer.answerId !== undefined) {
          this.answerService.toggleAnswerStatus(answer.answerId, newStatus).subscribe({
            next: () => {
              this.notification.success('Thành công', `Câu trả lời đã được ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} thành công.`);
              answer.isActive = newStatus; // Cập nhật trạng thái ngay lập tức trên UI
            },
            error: error => {
              console.error('Failed to toggle answer status:', error);
              const errorMessage = error.error?.message || `Không thể ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} câu trả lời.`;
              this.notification.error('Lỗi', errorMessage);
            }
          });
        }
      }
    });
  }

  softDeleteAnswer(answer: Answer): void {
    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa câu trả lời này?',
      nzContent: 'Câu trả lời sẽ bị vô hiệu hóa (Disabled) và không hiển thị trên giao diện quản trị viên sau khi xóa mềm, nhưng không bị xóa vĩnh viễn khỏi cơ sở dữ liệu.',
      nzOkText: 'Xóa mềm',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        if (answer.answerId !== undefined) {
          this.answerService.softDeleteAnswer(answer.answerId).subscribe({
            next: () => {
              this.notification.success('Thành công', 'Câu trả lời đã được xóa mềm thành công.');
              // THAY ĐỔI QUAN TRỌNG: Lọc bỏ câu trả lời khỏi danh sách hiển thị
              this.answers = this.answers.filter(a => a.answerId !== answer.answerId);
            },
            error: error => {
              console.error('Failed to soft delete answer:', error);
              this.notification.error('Lỗi', 'Không thể xóa mềm câu trả lời.');
            }
          });
        }
      }
    });
  }
}
