import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Answer, AnswerSearchRequest, AnswerPage } from 'src/app/interface/answer.interface';
import { Question } from 'src/app/interface/question.interface';
import { AnswerService } from 'src/app/service/answer.service';
import { QuestionService } from 'src/app/service/question.service';
import { ApiService } from 'src/app/service/api.service';

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
  searchForm: FormGroup;
  pageData: AnswerPage = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };
  isAdmin: boolean = false;

  constructor(
    private answerService: AnswerService,
    private questionService: QuestionService,
    private apiService: ApiService,
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
    this.searchForm = this.fb.group({
      questionId: [null],
      isCorrect: [null],
      isActive: [null],
      answerText: [''],
      page: [0],
      size: [10],
      sortBy: ['answerId'],
      sortDir: ['ASC']
    });
  }

  ngOnInit(): void {
    this.checkRoleAndLoadData();
  }

  private checkRoleAndLoadData(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        if (this.isAdmin) {
          this.loadQuestions();
        } else {
          this.notification.warning('Warning', 'You do not have administrative privileges to manage answers.');
        }
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to verify admin role.');
        console.error('Admin role check error:', err);
      }
    });
  }

  noWhitespaceValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { 'whitespace': true } : null;
  };

  loadQuestions(): void {
    this.questionService.getQuestionsByQuizId(1).subscribe({
      next: (questions) => {
        this.questions = questions;
        if (this.questions.length > 0) {
          this.searchForm.patchValue({ questionId: this.questions[0].questionId });
          this.searchAnswers();
        }
      },
      error: (error) => {
        console.error('Failed to load questions:', error);
        this.notification.error('Lỗi', 'Không thể tải danh sách câu hỏi.');
      }
    });
  }

  searchAnswers(): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to view answers.');
      return;
    }
    const request: AnswerSearchRequest = this.searchForm.value;
    this.answerService.searchAnswers(request).subscribe({
      next: (pageData) => {
        this.pageData = pageData;
        this.answers = pageData.content;
      },
      error: (error) => {
        console.error('Failed to search answers:', error);
        this.notification.error('Lỗi', 'Không thể tải câu trả lời.');
      }
    });
  }

  onPageChange(page: number): void {
    this.searchForm.patchValue({ page: page - 1 });
    this.searchAnswers();
  }

  onSizeChange(size: number): void {
    this.searchForm.patchValue({ size, page: 0 });
    this.searchAnswers();
  }

  onSortChange(sortBy: string, sortDir: 'ASC' | 'DESC'): void {
    this.searchForm.patchValue({ sortBy, sortDir, page: 0 });
    this.searchAnswers();
  }

  getQuestionText(questionId: number | undefined): string {
    if (!questionId) {
      return 'N/A';
    }
    const question = this.questions.find(q => q.questionId === questionId);
    return question ? question.questionText : 'N/A';
  }

  showModal(isEdit: boolean, answer?: Answer): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to add/edit answers.');
      return;
    }
    this.isEdit = isEdit;
    this.answerForm.reset({ isCorrect: false });

    if (isEdit && answer) {
      this.answerForm.patchValue({
        answerId: answer.answerId,
        content: answer.content,
        isCorrect: answer.isCorrect,
        questionId: answer.questionId
      });
    } else if (this.searchForm.get('questionId')?.value) {
      this.answerForm.patchValue({ questionId: this.searchForm.get('questionId')?.value });
    }
    this.isVisible = true;
  }

  handleOk(): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to add/edit answers.');
      return;
    }
    if (this.answerForm.invalid) {
      this.answerForm.markAllAsTouched();
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
      if (!answerId) {
        this.notification.error('Lỗi', 'Thiếu ID câu trả lời để cập nhật.');
        return;
      }
      this.answerService.updateAnswer(answerId, answerDataToSend).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Cập nhật câu trả lời thành công.');
          this.searchAnswers();
          this.isVisible = false;
        },
        error: (error) => {
          console.error('Failed to update answer:', error);
          this.notification.error('Lỗi', error.error?.message || 'Không thể cập nhật câu trả lời.');
        }
      });
    } else {
      this.answerService.createAnswer(answerDataToSend).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Tạo câu trả lời thành công. Vui lòng kích hoạt để sử dụng.');
          this.searchAnswers();
          this.isVisible = false;
        },
        error: (error) => {
          console.error('Failed to create answer:', error);
          this.notification.error('Lỗi', error.error?.message || 'Không thể tạo câu trả lời.');
        }
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.answerForm.reset({ isCorrect: false });
  }

  toggleAnswerStatus(answer: Answer): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to toggle answer status.');
      return;
    }
    const newStatus = !answer.isActive;
    this.modal.confirm({
      nzTitle: newStatus ? 'Bạn có chắc chắn muốn kích hoạt câu trả lời này?' : 'Bạn có chắc chắn muốn vô hiệu hóa câu trả lời này?',
      nzContent: 'Hành động này sẽ thay đổi khả năng hiển thị/sử dụng của câu trả lời.',
      nzOnOk: () => {
        if (answer.answerId) {
          this.answerService.toggleAnswerStatus(answer.answerId, newStatus).subscribe({
            next: () => {
              this.notification.success('Thành công', `Câu trả lời đã được ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} thành công.`);
              this.searchAnswers();
            },
            error: (error) => {
              console.error('Failed to toggle answer status:', error);
              this.notification.error('Lỗi', error.error?.message || `Không thể ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} câu trả lời.`);
            }
          });
        }
      }
    });
  }

  softDeleteAnswer(answer: Answer): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to delete answers.');
      return;
    }
    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa câu trả lời này?',
      nzContent: 'Câu trả lời sẽ bị vô hiệu hóa (Disabled) và không hiển thị trên giao diện quản trị viên sau khi xóa mềm, nhưng không bị xóa vĩnh viễn khỏi cơ sở dữ liệu.',
      nzOkText: 'Xóa mềm',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        if (answer.answerId) {
          this.answerService.softDeleteAnswer(answer.answerId).subscribe({
            next: () => {
              this.notification.success('Thành công', 'Câu trả lời đã được xóa mềm thành công.');
              this.searchAnswers();
            },
            error: (error) => {
              console.error('Failed to soft delete answer:', error);
              this.notification.error('Lỗi', error.error?.message || 'Không thể xóa mềm câu trả lời.');
            }
          });
        }
      }
    });
  }
}
