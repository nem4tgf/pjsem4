// src/app/admin/pages/practice-activity/practice-activity.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';

import { ApiService } from 'src/app/service/api.service';
import { ActivitySkill, ActivityType, PracticeActivity, PracticeActivityPageResponse, PracticeActivityRequest } from 'src/app/interface/pratice-activity.interface';
import { PracticeActivityService } from 'src/app/service/pratice-activity.service';


@Component({
  selector: 'app-practice-activity',
  templateUrl: './practice-activity.component.html',
  styleUrls: ['./practice-activity.component.css']
})
export class PracticeActivityComponent implements OnInit {
  // Danh sách các hoạt động luyện tập hiển thị trong bảng
  activities: PracticeActivity[] = [];
  // Form để thêm hoặc chỉnh sửa hoạt động
  activityForm!: FormGroup;
  // Form để tìm kiếm hoạt động
  searchForm!: FormGroup;

  // Trạng thái của modal thêm/sửa
  isModalVisible = false;
  isEditMode = false; // true nếu đang ở chế độ chỉnh sửa, false nếu thêm mới
  currentActivityId: number | null = null; // ID của hoạt động đang được chỉnh sửa

  // Trạng thái tải dữ liệu
  loading = false;
  // Trạng thái quyền admin
  isAdmin = false;

  // Thông tin phân trang
  total = 0;
  pageIndex = 1;
  pageSize = 10;

  // Các enum để hiển thị trong select box
  activitySkills = Object.values(ActivitySkill);
  activityTypes = Object.values(ActivityType);

  constructor(
    private fb: FormBuilder,
    private practiceActivityService: PracticeActivityService,
    private apiService: ApiService,
    private notification: NzNotificationService,
    private modal: NzModalService
  ) {
    // Khởi tạo form thêm/sửa hoạt động
    this.activityForm = this.fb.group({
      lessonId: [null, [Validators.required, Validators.min(1)]],
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required]],
      activitySkill: [null, [Validators.required]],
      activityType: [null, [Validators.required]],
      contentUrl: [null]
    });

    // Khởi tạo form tìm kiếm
    this.searchForm = this.fb.group({
      lessonId: [null],
      title: [''],
      skill: [null],
      activityType: [null]
    });
  }

  ngOnInit(): void {
    this.checkAdminStatusAndLoadData();
  }

  /**
   * Kiểm tra quyền admin và tải dữ liệu ban đầu.
   */
  private checkAdminStatusAndLoadData(): void {
    this.loading = true;
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        if (this.isAdmin) {
          this.loadActivities(); // Tải danh sách hoạt động nếu là admin
        } else {
          this.notification.warning('Cảnh báo', 'Bạn không có quyền truy cập trang quản lý hoạt động luyện tập.');
          this.loading = false;
        }
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể xác minh quyền quản trị.');
        console.error('Lỗi kiểm tra quyền admin:', err);
        this.isAdmin = false;
        this.loading = false;
      }
    });
  }

  /**
   * Tải danh sách các hoạt động luyện tập dựa trên các tiêu chí tìm kiếm và phân trang.
   */
  loadActivities(): void {
    if (!this.isAdmin) {
      this.activities = [];
      return;
    }

    this.loading = true;
    const searchValues = this.searchForm.value;

    this.practiceActivityService.searchPracticeActivities(
      searchValues.lessonId,
      searchValues.title,
      searchValues.skill,
      searchValues.activityType,
      this.pageIndex - 1, // Backend thường dùng page 0-indexed
      this.pageSize
    ).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response: PracticeActivityPageResponse) => {
        this.activities = response.content;
        this.total = response.totalElements;
        this.pageIndex = response.currentPage + 1; // Cập nhật lại pageIndex nếu backend trả về 0-indexed
        this.pageSize = response.pageSize;
        console.log('Loaded practice activities:', this.activities);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải danh sách hoạt động luyện tập: ' + (err.error?.message || 'Lỗi không xác định'));
        console.error('Lỗi tải hoạt động luyện tập:', err);
        this.activities = [];
      }
    });
  }

  /**
   * Xử lý khi thay đổi số trang.
   * @param index Số trang mới.
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadActivities();
  }

  /**
   * Xử lý khi thay đổi kích thước trang.
   * @param size Kích thước trang mới.
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.loadActivities();
  }

  /**
   * Áp dụng các bộ lọc tìm kiếm và tải lại dữ liệu.
   */
  applySearchFilters(): void {
    this.pageIndex = 1; // Reset về trang đầu tiên khi áp dụng bộ lọc mới
    this.loadActivities();
  }

  /**
   * Đặt lại các bộ lọc tìm kiếm về giá trị mặc định.
   */
  resetSearchFilters(): void {
    this.searchForm.reset({
      lessonId: null,
      title: '',
      skill: null,
      activityType: null
    });
    this.pageIndex = 1;
    this.loadActivities();
  }

  /**
   * Mở modal để thêm hoạt động mới.
   */
  openCreateModal(): void {
    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền thêm hoạt động.');
      return;
    }
    this.isEditMode = false;
    this.currentActivityId = null;
    this.activityForm.reset(); // Reset form về trạng thái ban đầu
    this.isModalVisible = true;
  }

  /**
   * Mở modal để chỉnh sửa hoạt động hiện có.
   * @param activity Hoạt động cần chỉnh sửa.
   */
  openEditModal(activity: PracticeActivity): void {
    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền chỉnh sửa hoạt động.');
      return;
    }
    this.isEditMode = true;
    this.currentActivityId = activity.activityId!; // Lưu ID của hoạt động đang chỉnh sửa
    // Điền dữ liệu của hoạt động vào form
    this.activityForm.patchValue({
      lessonId: activity.lessonId,
      title: activity.title,
      description: activity.description,
      activitySkill: activity.activitySkill,
      activityType: activity.activityType,
      contentUrl: activity.contentUrl
    });
    this.isModalVisible = true;
  }

  /**
   * Xử lý khi người dùng nhấn nút OK trong modal (thêm/sửa).
   */
  handleOk(): void {
    if (this.activityForm.valid) {
      const request: PracticeActivityRequest = this.activityForm.value;
      if (this.isEditMode && this.currentActivityId !== null) {
        // Chế độ chỉnh sửa
        this.practiceActivityService.updatePracticeActivity(this.currentActivityId, request).subscribe({
          next: (updatedActivity) => {
            this.notification.success('Thành công', 'Cập nhật hoạt động luyện tập thành công!');
            this.isModalVisible = false;
            this.loadActivities(); // Tải lại danh sách sau khi cập nhật
          },
          error: (err) => {
            this.notification.error('Lỗi', 'Cập nhật hoạt động luyện tập thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
            console.error('Lỗi cập nhật hoạt động:', err);
          }
        });
      } else {
        // Chế độ thêm mới
        this.practiceActivityService.createPracticeActivity(request).subscribe({
          next: (newActivity) => {
            this.notification.success('Thành công', 'Thêm hoạt động luyện tập mới thành công!');
            this.isModalVisible = false;
            this.loadActivities(); // Tải lại danh sách sau khi thêm mới
          },
          error: (err) => {
            this.notification.error('Lỗi', 'Thêm hoạt động luyện tập thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
            console.error('Lỗi thêm hoạt động:', err);
          }
        });
      }
    } else {
      // Nếu form không hợp lệ, hiển thị lỗi
      Object.values(this.activityForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.notification.warning('Cảnh báo', 'Vui lòng điền đầy đủ và chính xác thông tin.');
    }
  }

  /**
   * Xử lý khi người dùng nhấn nút Cancel trong modal.
   */
  handleCancel(): void {
    this.isModalVisible = false;
    this.activityForm.reset();
  }

  /**
   * Xóa một hoạt động luyện tập.
   * @param activityId ID của hoạt động cần xóa.
   */
  deleteActivity(activityId: number): void {
    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền xóa hoạt động.');
      return;
    }
    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa hoạt động luyện tập này?',
      nzContent: 'Hành động này không thể hoàn tác.',
      nzOkText: 'Có',
      nzOkDanger: true,
      nzCancelText: 'Không',
      nzOnOk: () => {
        this.practiceActivityService.deletePracticeActivity(activityId).subscribe({
          next: () => {
            this.notification.success('Thành công', 'Hoạt động luyện tập đã được xóa!');
            this.loadActivities(); // Tải lại danh sách sau khi xóa
          },
          error: (err) => {
            this.notification.error('Lỗi', 'Xóa hoạt động luyện tập thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
            console.error('Lỗi xóa hoạt động:', err);
          }
        });
      }
    });
  }

  /**
   * Helper function để lấy các key của enum (dùng cho nz-select).
   * @param enumObj Đối tượng enum.
   * @returns Mảng các key của enum.
   */
  getEnumKeys(enumObj: any): string[] {
    return Object.keys(enumObj);
  }
}
