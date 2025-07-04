import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms'; // Đã thêm AbstractControl
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { HttpErrorResponse } from '@angular/common/http';
import { NzFilterOptionType } from 'ng-zorro-antd/select';

import { ApiService } from 'src/app/service/api.service';
import { QuestionService } from 'src/app/service/question.service';
import { QuizService } from 'src/app/service/quiz.service';
import { Quiz } from 'src/app/interface/quiz.interface';
import {
  Question,
  QuestionPageResponse,
  QuestionRequest,
  QuestionSearchRequest,
  QuestionType,
} from 'src/app/interface/question.interface';
import { finalize } from 'rxjs/operators'; // Đảm bảo đã import finalize

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
})
export class QuestionsComponent implements OnInit {
  questions: Question[] = [];
  quizzes: Quiz[] = [];
  questionForm: FormGroup;
  searchForm: FormGroup;

  questionTypes = Object.values(QuestionType);
  isAdmin: boolean = false;
  loading = false;

  isVisible = false;
  isEdit = false;
  currentQuestionId: number | undefined;

  pageData: QuestionPageResponse = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
  };

  constructor(
    private questionService: QuestionService,
    private quizService: QuizService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef // Đã thêm ChangeDetectorRef
  ) {
    this.questionForm = this.fb.group({
      questionId: [null],
      quizId: [null, Validators.required],
      questionText: ['', [Validators.required, Validators.minLength(5)]],
      questionType: [null, Validators.required],
      audioUrl: [null],
      imageUrl: [null],
      correctAnswerText: [null],
    });

    this.searchForm = this.fb.group({
      quizId: [null],
      questionText: [''],
      questionType: [null],
      page: [0],
      size: [10],
      sortBy: ['questionId'],
      sortDir: ['ASC'],
    });
  }

  ngOnInit(): void {
    this.checkAdminStatus();
    this.loadQuizzes();
    this.searchQuestions();
  }

  checkAdminStatus(): void {
    this.apiService.checkAdminRole().subscribe(
      (isAdmin: boolean) => {
        this.isAdmin = isAdmin;
        this.cdRef.detectChanges();
      },
      (error: HttpErrorResponse) => {
        console.error('Lỗi kiểm tra trạng thái quản trị viên:', error);
        this.isAdmin = false;
        this.notification.error('Lỗi', 'Không thể kiểm tra trạng thái quản trị viên.');
        this.cdRef.detectChanges();
      }
    );
  }

  loadQuizzes(): void {
    this.quizService.getAllQuizzes().subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
      },
      error: (err: HttpErrorResponse) => {
        this.notification.error('Lỗi', 'Không thể tải danh sách Quiz.');
        console.error('Lỗi tải Quiz:', err);
        this.quizzes = [];
      }
    });
  }

  sortQuestionIdFn: NzTableSortFn<Question> = (a: Question, b: Question) => {
    return (a.questionId || 0) - (b.questionId || 0);
  };
  sortQuestionTextFn: NzTableSortFn<Question> = (a: Question, b: Question) => a.questionText.localeCompare(b.questionText);
  sortQuestionTypeFn: NzTableSortFn<Question> = (a: Question, b: Question) => a.questionType.localeCompare(b.questionType);
  sortQuizIdFn: NzTableSortFn<Question> = (a: Question, b: Question) => a.quizId - b.quizId;

  filterQuizOption: NzFilterOptionType = (inputValue: string, option: any) => {
    return option.nzLabel.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
  };

  searchQuestions(): void {
    this.loading = true;
    const formValues = this.searchForm.value;

    // Khởi tạo một đối tượng request cơ bản với các trường luôn có
    const request: QuestionSearchRequest = {
      page: formValues.page,
      size: formValues.size,
      sortBy: formValues.sortBy,
      sortDir: formValues.sortDir
    };

    // Thêm các trường tùy chọn chỉ khi chúng có giá trị hợp lệ
    if (formValues.quizId !== null && formValues.quizId !== undefined) {
      request.quizId = formValues.quizId;
    }
    if (formValues.questionText && formValues.questionText.trim() !== '') { // Kiểm tra cả chuỗi rỗng sau khi trim
      request.questionText = formValues.questionText;
    }
    if (formValues.questionType !== null && formValues.questionType !== undefined) {
      request.questionType = formValues.questionType;
    }

    this.questionService.searchQuestions(request).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (pageData: QuestionPageResponse) => {
        this.pageData = pageData;
        this.questions = pageData.content;
      },
      error: (err: HttpErrorResponse) => {
        this.notification.error('Lỗi', 'Lỗi khi tìm kiếm câu hỏi: ' + (err.error?.message || err.message));
        console.error('Search questions error:', err);
        this.questions = [];
        this.pageData = { content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 10 };
      }
    });
  }

  onPageIndexChange(page: number): void {
    this.searchForm.patchValue({ page: page - 1 });
    this.searchQuestions();
  }

  onPageSizeChange(size: number): void {
    this.searchForm.patchValue({ size: size, page: 0 });
    this.searchQuestions();
  }

  onSortChange(sortBy: string, sortDir: 'ascend' | 'descend' | null): void {
    const direction = sortDir === 'ascend' ? 'ASC' : (sortDir === 'descend' ? 'DESC' : 'ASC');
    this.searchForm.patchValue({ sortBy, sortDir: direction, page: 0 });
    this.searchQuestions();
  }

  resetFilters(): void {
    this.searchForm.reset({
      quizId: null,
      questionText: '',
      questionType: null,
      page: 0,
      size: 10,
      sortBy: 'questionId',
      sortDir: 'ASC'
    });
    this.searchQuestions();
  }

  showQuestionModal(isEdit: boolean, question?: Question): void {
    if (!this.isAdmin) {
      this.notification.error('Lỗi', 'Bạn không có quyền thực hiện hành động này');
      return;
    }

    this.isEdit = isEdit;
    this.questionForm.reset();

    if (isEdit && question) {
      this.currentQuestionId = question.questionId;
      this.questionForm.patchValue({
        questionId: question.questionId,
        quizId: question.quizId,
        questionText: question.questionText,
        questionType: question.questionType,
        audioUrl: question.audioUrl,
        imageUrl: question.imageUrl,
        correctAnswerText: question.correctAnswerText,
      });
    } else {
      this.currentQuestionId = undefined;
      if (this.searchForm.get('quizId')?.value !== null) {
        this.questionForm.get('quizId')?.setValue(this.searchForm.get('quizId')?.value);
      }
      this.questionForm.get('questionType')?.setValue(QuestionType.MULTIPLE_CHOICE);
    }
    this.isVisible = true;
    this.cdRef.detectChanges();
  }

  handleQuestionModalOk(): void {
    if (this.questionForm.invalid) {
      Object.values(this.questionForm.controls).forEach((control: AbstractControl) => { // Sử dụng AbstractControl
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.notification.error('Lỗi', 'Vui lòng điền đầy đủ và đúng các trường bắt buộc');
      return;
    }

    const formValue = this.questionForm.value;
    const questionToSave: QuestionRequest = {
      quizId: formValue.quizId,
      questionText: formValue.questionText,
      questionType: formValue.questionType,
      audioUrl: formValue.audioUrl || undefined,
      imageUrl: formValue.imageUrl || undefined,
      correctAnswerText: formValue.correctAnswerText || undefined
    };

    if (this.isEdit && this.currentQuestionId !== undefined) {
      this.questionService.updateQuestion(this.currentQuestionId, questionToSave).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Câu hỏi đã được cập nhật.');
          this.searchQuestions();
          this.isVisible = false;
        },
        error: (err: HttpErrorResponse) => {
          this.notification.error('Lỗi', 'Không thể cập nhật câu hỏi: ' + (err.error?.message || err.message));
          console.error('Lỗi cập nhật:', err);
        },
      });
    } else {
      this.questionService.createQuestion(questionToSave).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Câu hỏi đã được tạo.');
          this.searchQuestions();
          this.isVisible = false;
        },
        error: (err: HttpErrorResponse) => {
          this.notification.error('Lỗi', 'Không thể tạo câu hỏi: ' + (err.error?.message || err.message));
          console.error('Lỗi tạo:', err);
        },
      });
    }
  }

  handleQuestionModalCancel(): void {
    this.isVisible = false;
    this.questionForm.reset();
  }

  deleteQuestion(questionId: number | undefined): void {
    if (!this.isAdmin || questionId === undefined) {
      this.notification.error('Lỗi', 'Bạn không có quyền hoặc ID câu hỏi không hợp lệ');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: 'Bạn có chắc chắn muốn xóa câu hỏi này không?',
      nzOkText: 'Có',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.questionService.deleteQuestion(questionId).subscribe({
          next: () => {
            this.notification.success('Thành công', 'Câu hỏi đã được xóa thành công');
            this.searchQuestions();
            // The following line was misplaced and has been removed from here.
            // this.notification.info('Thông báo', 'Hủy bỏ thao tác xóa câu hỏi.');
          },
          error: (err: HttpErrorResponse) => {
            this.notification.error('Lỗi', err.error?.message || 'Xóa câu hỏi thất bại');
            console.error('Lỗi xóa câu hỏi:', err);
          },
        });
      },
      nzCancelText: 'Không',
      nzOnCancel: () => this.notification.info('Thông báo', 'Hủy bỏ thao tác xóa câu hỏi.'),
    });
  }

  getQuizTitle(quizId: number): string {
    const quiz = this.quizzes.find(q => q.quizId === quizId);
    return quiz ? quiz.title : 'Quiz không xác định';
  }
}
