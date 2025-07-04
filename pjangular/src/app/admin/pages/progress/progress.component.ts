import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { HttpErrorResponse } from '@angular/common/http';
import { NzOptionComponent } from 'ng-zorro-antd/select'; // Import này có thể không cần nếu không dùng đến type của nó, nhưng là một practice tốt
import { NzFilterOptionType } from 'ng-zorro-antd/select'; // <-- Import này là quan trọng

import { Lesson } from 'src/app/interface/lesson.interface';
import { Progress, Status, ActivityType, ProgressSearchRequest, ProgressPageResponse, ProgressRequest } from 'src/app/interface/progress.interface';
import { User } from 'src/app/interface/user.interface';

import { LessonService } from 'src/app/service/lesson.service';
import { ProgressService } from 'src/app/service/progress.service';
import { UserService } from 'src/app/service/user.service';
import { ApiService } from 'src/app/service/api.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {
  progressList: Progress[] = [];
  users: User[] = [];
  lessons: Lesson[] = [];
  progressForm: FormGroup;
  searchForm: FormGroup;

  statuses = Object.values(Status);
  activityTypes = Object.values(ActivityType);
  isAdmin: boolean = false;
  loading = false;

  isProgressModalVisible = false;
  isEditMode = false;
  currentProgressId: number | undefined = undefined; // ID của bản ghi đang được chỉnh sửa

  pageData: ProgressPageResponse = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };

  // Khai báo các hàm lọc
  // Có thể tường minh kiểu dữ liệu cho option nếu muốn, ví dụ: (inputValue: string, option: NzOptionComponent)
  filterUserOption: NzFilterOptionType = (inputValue: string, option: any) => {
    // Kiểm tra option.nzValue hoặc option.nzLabel
    // option.nzLabel là nội dung hiển thị của option (ở đây là username)
    // option.nzValue là giá trị của option (ở đây là userId)
    return option.nzLabel.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
  };

  filterLessonOption: NzFilterOptionType = (inputValue: string, option: any) => {
    // Kiểm tra option.nzLabel là title của bài học
    return option.nzLabel.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
  };


  constructor(
    private progressService: ProgressService,
    private userService: UserService,
    private lessonService: LessonService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef,
    private modal: NzModalService
  ) {
    this.progressForm = this.fb.group({
      progressId: [null],
      userId: [null, Validators.required],
      lessonId: [null, Validators.required],
      activityType: [null, Validators.required],
      status: [null, Validators.required],
      completionPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    this.searchForm = this.fb.group({
      userId: [null],
      lessonId: [null],
      activityType: [null],
      status: [null],
      minCompletionPercentage: [null, [Validators.min(0), Validators.max(100)]],
      maxCompletionPercentage: [null, [Validators.min(0), Validators.max(100)]],
      page: [0],
      size: [10],
      sortBy: ['lastUpdated'],
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
        this.cdRef.detectChanges();

        if (this.isAdmin) {
          this.loadUsers();
          this.loadLessons();
          this.searchProgress();
        } else {
          this.notification.warning('Warning', 'Bạn không có đặc quyền quản trị để xem tiến độ.');
          this.progressList = [];
          this.pageData = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };
        }
      },
      error: (err: HttpErrorResponse) => {
        this.notification.error('Error', 'Không thể xác minh vai trò quản trị.');
        console.error('Lỗi kiểm tra vai trò quản trị:', err);
        this.isAdmin = false;
        this.progressList = [];
        this.pageData = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };
        this.cdRef.detectChanges();
      }
    });
  }

  loadUsers(): void {
    if (!this.isAdmin || this.users.length > 0) return;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Đã tải tất cả người dùng:', this.users);
      },
      error: (err: HttpErrorResponse) => {
        this.notification.error('Error', 'Không thể tải người dùng.');
        console.error('Lỗi tải người dùng:', err);
      }
    });
  }

  loadLessons(): void {
    if (!this.isAdmin || this.lessons.length > 0) return;
    this.lessonService.getAllLessons().subscribe({
      next: (lessons) => {
        this.lessons = lessons;
        console.log('Đã tải tất cả bài học:', this.lessons);
      },
      error: (err: HttpErrorResponse) => {
        this.notification.error('Error', 'Không thể tải bài học.');
        console.error('Lỗi tải bài học:', err);
      }
    });
  }

  searchProgress(): void {
    if (!this.isAdmin) {
      this.notification.warning('Warning', 'Bạn không có quyền xem tiến độ.');
      this.progressList = [];
      this.pageData = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };
      return;
    }

    this.loading = true;
    const formValues = this.searchForm.value;

    const request: ProgressSearchRequest = {
      userId: formValues.userId || undefined,
      lessonId: formValues.lessonId || undefined,
      activityType: formValues.activityType || undefined,
      status: formValues.status || undefined,
      minCompletionPercentage: formValues.minCompletionPercentage || undefined,
      maxCompletionPercentage: formValues.maxCompletionPercentage || undefined,
      page: formValues.page,
      size: formValues.size,
      sortBy: formValues.sortBy,
      sortDir: formValues.sortDir
    };

    this.progressService.searchProgress(request).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (pageData: ProgressPageResponse) => {
        this.pageData = pageData;
        this.progressList = pageData.content;
      },
      error: (err: HttpErrorResponse) => {
        this.notification.error('Error', 'Lỗi khi tìm kiếm tiến độ: ' + (err.error?.message || err.message));
        console.error('Lỗi tìm kiếm tiến độ:', err);
        this.progressList = [];
        this.pageData = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };
      }
    });
  }

  onPageIndexChange(page: number): void {
    this.searchForm.patchValue({ page: page - 1 });
    this.searchProgress();
  }

  onPageSizeChange(size: number): void {
    this.searchForm.patchValue({ size: size, page: 0 });
    this.searchProgress();
  }

  onSortChange(sortBy: string, sortDir: 'ASC' | 'DESC'): void {
    this.searchForm.patchValue({ sortBy, sortDir, page: 0 });
    this.searchProgress();
  }

  resetFilters(): void {
    this.searchForm.reset({
      userId: null,
      lessonId: null,
      activityType: null,
      status: null,
      minCompletionPercentage: null,
      maxCompletionPercentage: null,
      page: 0,
      size: 10,
      sortBy: 'lastUpdated',
      sortDir: 'DESC'
    });
    this.searchProgress();
  }

  showAddProgressModal(): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'Bạn không có quyền thêm tiến độ.');
      return;
    }
    this.isEditMode = false;
    this.currentProgressId = undefined; // Đảm bảo không có ID khi thêm mới
    this.progressForm.reset({ completionPercentage: 0 }); // Reset form và đặt % hoàn thành mặc định

    // Đảm bảo dữ liệu users và lessons đã được tải trước khi đặt giá trị mặc định
    if (this.users.length > 0 && this.users[0].userId !== undefined && this.users[0].userId !== null) {
      this.progressForm.get('userId')?.setValue(this.users[0].userId);
    }
    if (this.lessons.length > 0 && this.lessons[0].lessonId !== undefined && this.lessons[0].lessonId !== null) {
      this.progressForm.get('lessonId')?.setValue(this.lessons[0].lessonId);
    }

    this.isProgressModalVisible = true;
    this.cdRef.detectChanges();
  }

  showEditProgressModal(progress: Progress): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'Bạn không có quyền chỉnh sửa tiến độ.');
      return;
    }
    this.isEditMode = true;
    this.currentProgressId = progress.progressId;
    if (this.currentProgressId === undefined) {
      this.notification.error('Error', 'Không thể chỉnh sửa tiến độ không có ID.');
      return;
    }
    this.progressForm.patchValue({
      progressId: progress.progressId,
      userId: progress.userId,
      lessonId: progress.lessonId,
      activityType: progress.activityType,
      status: progress.status,
      completionPercentage: progress.completionPercentage
    });
    this.isProgressModalVisible = true;
    this.cdRef.detectChanges();
  }

  handleProgressModalOk(): void {
    if (this.progressForm.invalid) {
      this.progressForm.markAllAsTouched();
      this.notification.error('Error', 'Vui lòng điền đầy đủ và đúng các trường bắt buộc.');
      return;
    }

    const progressRequest: ProgressRequest = {
      userId: this.progressForm.get('userId')?.value,
      lessonId: this.progressForm.get('lessonId')?.value,
      activityType: this.progressForm.get('activityType')?.value,
      status: this.progressForm.get('status')?.value,
      completionPercentage: this.progressForm.get('completionPercentage')?.value
    };

    console.log('Đối tượng tiến độ để gửi:', progressRequest);

    if (this.isEditMode && this.currentProgressId !== undefined) {
      this.progressService.updateProgress(this.currentProgressId, progressRequest).subscribe({
        next: () => {
          this.notification.success('Success', 'Tiến độ đã được cập nhật thành công!');
          this.isProgressModalVisible = false;
          this.searchProgress();
        },
        error: (err: HttpErrorResponse) => {
          this.notification.error('Error', 'Lỗi khi cập nhật tiến độ: ' + (err.error?.message || 'Lỗi không xác định'));
          console.error('Lỗi cập nhật tiến độ:', err);
        }
      });
    } else {
      this.progressService.createProgress(progressRequest).subscribe({
        next: () => {
          this.notification.success('Success', 'Tiến độ đã được thêm mới thành công!');
          this.isProgressModalVisible = false;
          this.searchProgress();
        },
        error: (err: HttpErrorResponse) => {
          this.notification.error('Error', 'Lỗi khi thêm mới tiến độ: ' + (err.error?.message || 'Lỗi không xác định'));
          console.error('Lỗi thêm mới tiến độ:', err);
        }
      });
    }
  }

  handleProgressModalCancel(): void {
    this.isProgressModalVisible = false;
    this.progressForm.reset();
  }

  deleteProgress(progressId: number): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'Bạn không có quyền xóa tiến độ.');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa tiến độ này?',
      nzContent: 'Hành động này không thể hoàn tác.',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.progressService.deleteProgress(progressId).subscribe({
          next: () => {
            this.notification.success('Success', 'Tiến độ đã được xóa thành công!');
            this.searchProgress();
          },
          error: (err: HttpErrorResponse) => {
            this.notification.error('Error', 'Lỗi khi xóa tiến độ: ' + (err.error?.message || 'Lỗi không xác định'));
            console.error('Lỗi xóa tiến độ:', err);
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

  getLessonTitle(lessonId: number | undefined): string {
    if (lessonId == null) {
      return 'N/A';
    }
    const lesson = this.lessons.find(l => l.lessonId === lessonId);
    return lesson ? lesson.title : 'N/A';
  }

  getProgressStatusTagColor(status: Status): string {
    switch (status) {
      case Status.NOT_STARTED: return 'default';
      case Status.IN_PROGRESS: return 'blue';
      case Status.COMPLETED: return 'green';
      default: return 'default';
    }
  }
}
