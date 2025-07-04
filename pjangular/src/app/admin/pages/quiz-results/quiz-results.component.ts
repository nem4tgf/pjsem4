// src/app/admin/pages/quiz-results/quiz-results.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';

import {
  QuizResult,
  QuizResultRequest,
  QuizResultSearchRequest,
  QuizResultPageResponse
} from 'src/app/interface/quiz-result.interface';
import { User } from 'src/app/interface/user.interface';
import { Quiz } from 'src/app/interface/quiz.interface';

import { QuizResultService } from 'src/app/service/quiz-result.service';
import { UserService } from 'src/app/service/user.service';
import { QuizService } from 'src/app/service/quiz.service';
import { ApiService } from 'src/app/service/api.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-quiz-results',
  templateUrl: './quiz-results.component.html',
  styleUrls: ['./quiz-results.component.css']
})
export class QuizResultsComponent implements OnInit {
  results: QuizResult[] = [];
  users: User[] = [];
  quizzes: Quiz[] = [];
  resultForm: FormGroup; // Form để thêm/sửa một kết quả
  searchForm: FormGroup; // Form cho các bộ lọc tìm kiếm, phân trang và sắp xếp

  isAdmin: boolean = false;
  loading = false; // Trạng thái loading cho bảng

  // Biến cho Modal
  isVisible: boolean = false;
  isEdit: boolean = false; // Xác định đang ở chế độ sửa hay thêm mới
  currentResultId: number | null = null; // Lưu ID của kết quả đang sửa

  pageData: QuizResultPageResponse = { content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 10 };

  constructor(
    private resultService: QuizResultService,
    private userService: UserService,
    private quizService: QuizService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private apiService: ApiService,
    private modal: NzModalService
  ) {
    this.resultForm = this.fb.group({
      userId: [{ value: null, disabled: false }, Validators.required], // THAY ĐỔI: Thêm `disabled` để quản lý khi sửa
      quizId: [{ value: null, disabled: false }, Validators.required], // THAY ĐỔI: Thêm `disabled` để quản lý khi sửa
      score: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      durationSeconds: [null, [Validators.min(0)]]
    });

    this.searchForm = this.fb.group({
      userId: [null],
      quizId: [null],
      minScore: [null, [Validators.min(0), Validators.max(100)]],
      maxScore: [null, [Validators.min(0), Validators.max(100)]],
      page: [0],
      size: [10],
      sortBy: ['completedAt'],
      sortDir: ['DESC']
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
          this.loadUsers();
          this.loadQuizzes();
          this.searchQuizResults();
        } else {
          this.notification.warning('Cảnh báo', 'Bạn không có quyền quản trị để xem kết quả bài kiểm tra.');
          this.results = [];
          this.pageData = { content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 10 };
        }
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể xác minh quyền quản trị.');
        console.error('Lỗi kiểm tra quyền Admin:', err);
        this.isAdmin = false;
        this.results = [];
        this.pageData = { content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 10 };
      }
    });
  }

  loadUsers(): void {
    if (!this.isAdmin) return;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Đã tải tất cả người dùng:', this.users);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải người dùng.');
        console.error('Lỗi tải người dùng:', err);
      }
    });
  }

  loadQuizzes(): void {
    if (!this.isAdmin) return;
    this.quizService.getAllQuizzes().subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        console.log('Đã tải tất cả bài kiểm tra:', this.quizzes);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải bài kiểm tra.');
        console.error('Lỗi tải bài kiểm tra:', err);
      }
    });
  }

  searchQuizResults(): void {
    if (!this.isAdmin) {
      this.results = [];
      this.pageData = { content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 10 };
      return;
    }

    this.loading = true;
    const formValues = this.searchForm.value;

    const request: QuizResultSearchRequest = {
      userId: formValues.userId || undefined,
      quizId: formValues.quizId || undefined,
      minScore: formValues.minScore !== null ? formValues.minScore : undefined,
      maxScore: formValues.maxScore !== null ? formValues.maxScore : undefined,
      page: formValues.page,
      size: formValues.size,
      sortBy: formValues.sortBy,
      sortDir: formValues.sortDir
    };

    this.resultService.searchQuizResults(request).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (pageData: QuizResultPageResponse) => {
        this.pageData = {
          content: pageData.content,
          totalElements: pageData.totalElements,
          totalPages: pageData.totalPages,
          currentPage: pageData.currentPage,
          pageSize: pageData.pageSize
        };
        this.results = pageData.content;
        console.log('Kết quả tìm kiếm:', this.pageData);
      },
      error: (err: any) => {
        this.notification.error('Lỗi', 'Lỗi khi tìm kiếm kết quả bài kiểm tra: ' + (err.error?.message || err.message));
        console.error('Lỗi tìm kiếm kết quả bài kiểm tra:', err);
        this.results = [];
        this.pageData = { content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 10 };
      }
    });
  }

  onPageIndexChange(page: number): void {
    this.searchForm.patchValue({ page: page - 1 });
    this.searchQuizResults();
  }

  onPageSizeChange(size: number): void {
    this.searchForm.patchValue({ size: size, page: 0 });
    this.searchQuizResults();
  }

  onSortChange(sortBy: string, sortDir: 'ascend' | 'descend' | null): void {
    const direction = sortDir === 'ascend' ? 'ASC' : (sortDir === 'descend' ? 'DESC' : 'DESC');
    this.searchForm.patchValue({ sortBy, sortDir: direction, page: 0 });
    this.searchQuizResults();
  }

  resetFilters(): void {
    this.searchForm.reset({
      userId: null,
      quizId: null,
      minScore: null,
      maxScore: null,
      page: 0,
      size: 10,
      sortBy: 'completedAt',
      sortDir: 'DESC'
    });
    this.searchQuizResults();
  }

  /**
   * Hiển thị modal để thêm mới hoặc chỉnh sửa kết quả.
   * @param isEditMode True nếu là chế độ chỉnh sửa, False nếu là thêm mới.
   * @param result Đối tượng QuizResult nếu ở chế độ chỉnh sửa.
   */
  showResultModal(isEditMode: boolean, result?: QuizResult): void {
    if (!this.isAdmin) {
      this.notification.error('Lỗi', 'Bạn không có quyền thực hiện hành động này.');
      return;
    }
    this.isVisible = true;
    this.isEdit = isEditMode;
    this.resultForm.reset({ score: 0, durationSeconds: null }); // Reset form trước khi điền dữ liệu

    if (isEditMode && result) {
      this.currentResultId = result.resultId!;
      this.resultForm.patchValue({
        userId: result.userId,
        quizId: result.quizId,
        score: result.score,
        durationSeconds: result.durationSeconds
      });
      // Vô hiệu hóa userId và quizId khi chỉnh sửa
      this.resultForm.get('userId')?.disable();
      this.resultForm.get('quizId')?.disable();
    } else {
      this.currentResultId = null;
      // Bật lại userId và quizId khi thêm mới
      this.resultForm.get('userId')?.enable();
      this.resultForm.get('quizId')?.enable();
    }
  }

  /**
   * Xử lý khi nhấn nút "OK" trong modal.
   */
  handleResultModalOk(): void {
    if (this.resultForm.invalid) {
      this.resultForm.markAllAsTouched();
      this.notification.error('Lỗi', 'Vui lòng điền đầy đủ và đúng các trường bắt buộc.');
      return;
    }

    const formValue = this.resultForm.getRawValue(); // Sử dụng getRawValue() để lấy cả giá trị của các trường bị disable
    const resultData: QuizResultRequest = {
      userId: formValue.userId,
      quizId: formValue.quizId,
      score: formValue.score,
      durationSeconds: formValue.durationSeconds
    };

    if (this.isEdit && this.currentResultId) {
      this.resultService.updateQuizResult(this.currentResultId, resultData).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Kết quả bài kiểm tra đã được cập nhật!');
          this.isVisible = false;
          this.searchQuizResults(); // Tải lại danh sách sau khi cập nhật
        },
        error: (err) => {
          this.notification.error('Lỗi', 'Không thể cập nhật kết quả bài kiểm tra: ' + (err.error?.message || err.message));
          console.error('Lỗi cập nhật kết quả bài kiểm tra:', err);
        }
      });
    } else {
      this.resultService.saveQuizResult(resultData).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Kết quả bài kiểm tra đã được lưu!');
          this.isVisible = false;
          this.searchQuizResults(); // Tải lại danh sách sau khi lưu
        },
        error: (err) => {
          this.notification.error('Lỗi', 'Không thể lưu kết quả bài kiểm tra: ' + (err.error?.message || err.message));
          console.error('Lỗi lưu kết quả bài kiểm tra:', err);
        }
      });
    }
  }

  /**
   * Xử lý khi nhấn nút "Hủy" trong modal.
   */
  handleResultModalCancel(): void {
    this.isVisible = false;
    this.resultForm.reset({ score: 0, durationSeconds: null }); // Reset form
    // Đảm bảo bật lại các trường userId và quizId sau khi đóng modal
    this.resultForm.get('userId')?.enable();
    this.resultForm.get('quizId')?.enable();
  }

  deleteResult(resultId: number | undefined): void {
    if (resultId === undefined) {
      this.notification.error('Lỗi', 'ID kết quả không hợp lệ để xóa.');
      return;
    }
    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa?',
      nzContent: 'Hành động này không thể hoàn tác. Bạn có muốn xóa kết quả bài kiểm tra này không?',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.resultService.deleteQuizResult(resultId).subscribe({
          next: () => {
            this.notification.success('Thành công', 'Kết quả bài kiểm tra đã được xóa.');
            this.searchQuizResults();
          },
          error: (err) => {
            this.notification.error('Lỗi', 'Không thể xóa kết quả bài kiểm tra: ' + (err.error?.message || err.message));
            console.error('Lỗi xóa kết quả bài kiểm tra:', err);
          }
        });
      }
    });
  }

  getUserUsername(userId: number | undefined): string {
    if (userId == null) {
      return 'N/A';
    }
    const user = this.users.find(u => u.userId === userId);
    return user ? user.username : 'N/A';
  }

  getQuizTitle(quizId: number | undefined): string {
    if (quizId == null) {
      return 'N/A';
    }
    const quiz = this.quizzes.find(q => q.quizId === quizId);
    return quiz ? quiz.title : 'N/A';
  }
}
