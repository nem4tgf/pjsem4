// src/app/admin/pages/quizzes/quizzes.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { throwError, catchError } from 'rxjs';

// ĐÃ THAY ĐỔI: Import QuizType thay vì QuizSkill
import { Quiz, QuizRequest, QuizSearchRequest, QuizPageResponse, QuizType } from 'src/app/interface/quiz.interface';
import { Lesson } from 'src/app/interface/lesson.interface';
import { ApiService } from 'src/app/service/api.service';
import { LessonService } from 'src/app/service/lesson.service';
import { QuizService } from 'src/app/service/quiz.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.css']
})
export class QuizzesComponent implements OnInit {
  quizzes: Quiz[] = [];
  lessons: Lesson[] = [];

  quizForm: FormGroup;
  searchForm: FormGroup;

  isAdmin: boolean = false;
  loading = false;
  isEditing = false;
  currentQuizId: number | null = null;

  pageData: QuizPageResponse = { content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 10 };

  currentSortBy: string = 'createdAt';
  currentSortDir: 'ASC' | 'DESC' = 'DESC';

  // ĐÃ THAY ĐỔI: Sử dụng QuizType
  quizTypes = Object.values(QuizType); // ĐÃ THAY ĐỔI: quizSkills -> quizTypes, QuizSkill -> QuizType

  isModalVisible = false;

  constructor(
    private quizService: QuizService,
    private lessonService: LessonService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private apiService: ApiService,
    private modal: NzModalService
  ) {
    this.quizForm = this.fb.group({
      lessonId: [null, [Validators.required]],
      title: [null, [Validators.required, Validators.maxLength(255)]],
      quizType: [null, [Validators.required]] // ĐÃ THAY ĐỔI: skill -> quizType
    });

    this.searchForm = this.fb.group({
      lessonId: [null],
      title: [null],
      quizType: [null] // ĐÃ THAY ĐỔI: skill -> quizType
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
          this.loadLessons();
          this.onQueryParamsChange({
            pageIndex: 1,
            pageSize: 10,
            sort: [{ key: 'createdAt', value: 'descend' }],
            filter: []
          });
        } else {
          this.notification.warning('Cảnh báo', 'Bạn không có quyền quản trị để xem và quản lý bài kiểm tra.');
        }
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể xác minh quyền quản trị.');
        console.error('Admin role check error:', err);
        this.isAdmin = false;
      }
    });
  }

  loadLessons(): void {
    this.lessonService.getAllLessons().pipe(
      catchError(err => {
        this.notification.error('Lỗi', 'Không thể tải danh sách bài học.');
        console.error('Load lessons error:', err);
        return throwError(() => err);
      })
    ).subscribe(lessons => {
      this.lessons = lessons;
    });
  }

  searchQuizzes(): void {
    if (!this.isAdmin) return;

    this.loading = true;
    const formValues = this.searchForm.value;

    const request: QuizSearchRequest = {
      lessonId: formValues.lessonId || undefined,
      title: formValues.title || undefined,
      quizType: formValues.quizType || undefined, // ĐÃ THAY ĐỔI: skill -> quizType
      page: this.pageData.currentPage,
      size: this.pageData.pageSize,
      sortBy: this.currentSortBy,
      sortDir: this.currentSortDir
    };

    this.quizService.searchQuizzes(request).pipe(
      finalize(() => this.loading = false),
      catchError((err: any) => {
        this.notification.error('Lỗi', 'Lỗi khi tìm kiếm bài kiểm tra: ' + (err.error?.message || err.message));
        return throwError(() => err);
      })
    ).subscribe(pageData => {
      this.pageData = pageData;
      this.quizzes = pageData.content;
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort } = params;
    const currentSort = sort.find(item => item.value !== null);

    this.pageData.currentPage = pageIndex - 1;
    this.pageData.pageSize = pageSize;

    if (currentSort) {
      this.currentSortBy = currentSort.key;
      this.currentSortDir = currentSort.value === 'ascend' ? 'ASC' : 'DESC';
    } else {
      this.currentSortBy = 'createdAt';
      this.currentSortDir = 'DESC';
    }

    this.searchQuizzes();
  }

  resetFilters(): void {
    this.searchForm.reset();
    this.onQueryParamsChange({
      pageIndex: 1,
      pageSize: 10,
      sort: [{ key: 'createdAt', value: 'descend' }],
      filter: []
    });
  }

  openCreateForm(): void {
    if (!this.isAdmin) return;
    this.isEditing = false;
    this.currentQuizId = null;
    this.quizForm.reset();
    this.isModalVisible = true;
  }

  openEditForm(quiz: Quiz): void {
    if (!this.isAdmin) return;
    this.isEditing = true;
    this.currentQuizId = quiz.quizId!;
    // ĐẢM BẢO patchValue đúng với tên trường mới quizType
    this.quizForm.patchValue({
      lessonId: quiz.lessonId,
      title: quiz.title,
      quizType: quiz.quizType // ĐÃ THAY ĐỔI: skill -> quizType
    });
    this.isModalVisible = true;
  }

  submitQuizForm(): void {
    if (!this.isAdmin) return;

    Object.values(this.quizForm.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });

    if (this.quizForm.invalid) {
      this.notification.error('Lỗi', 'Vui lòng điền đầy đủ và đúng các trường yêu cầu.');
      return;
    }

    const quizData: QuizRequest = this.quizForm.value;
    this.loading = true;

    const action = this.isEditing
      ? this.quizService.updateQuiz(this.currentQuizId!, quizData)
      : this.quizService.createQuiz(quizData);

    action.pipe(
      finalize(() => this.loading = false),
      catchError((err: any) => {
        const actionText = this.isEditing ? 'cập nhật' : 'tạo';
        this.notification.error('Lỗi', `Không thể ${actionText} bài kiểm tra: ` + (err.error?.message || err.message));
        return throwError(() => err);
      })
    ).subscribe(() => {
      const actionText = this.isEditing ? 'cập nhật' : 'tạo';
      this.notification.success('Thành công', `Bài kiểm tra đã được ${actionText}.`);
      this.handleCancel();
      this.searchQuizzes();
    });
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  deleteQuiz(quizId: number | undefined): void {
    if (!this.isAdmin || quizId === undefined) return;

    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa bài kiểm tra này?',
      nzContent: 'Hành động này không thể hoàn tác.',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.loading = true;
        this.quizService.deleteQuiz(quizId).pipe(
          finalize(() => this.loading = false),
          catchError((err: any) => {
            this.notification.error('Lỗi', 'Không thể xóa bài kiểm tra: ' + (err.error?.message || err.message));
            return throwError(() => err);
          })
        ).subscribe(() => {
          this.notification.success('Thành công', 'Bài kiểm tra đã được xóa.');
          this.searchQuizzes();
        });
      }
    });
  }

  getLessonTitle(lessonId: number | undefined): string {
    if (lessonId == null) return 'N/A';
    const lesson = this.lessons.find(l => l.lessonId === lessonId);
    return lesson ? lesson.title : 'Không xác định';
  }

}
