import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Validators
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { UserWritingAttempt, UserWritingAttemptPage, UserWritingAttemptRequest, UserWritingAttemptSearchRequest } from 'src/app/interface/user-writting.interface';
import { User } from 'src/app/interface/user.interface';
import { PracticeActivity } from 'src/app/interface/pratice-activity.interface';
import { UserWritingAttemptService } from 'src/app/service/user-writting-attempt.service';
import { UserService } from 'src/app/service/user.service';
import { PracticeActivityService } from 'src/app/service/pratice-activity.service';
import { ApiService } from 'src/app/service/api.service';


@Component({
  selector: 'app-user-writing-attempts',
  templateUrl: './user-writing-attempts.component.html',
  styleUrls: ['./user-writing-attempts.component.css']
})
export class UserWritingAttemptsComponent implements OnInit {
  // Dữ liệu bảng và phân trang
  pageData: UserWritingAttemptPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    page: 0,
    size: 10,
    number: 0,
    first: true,
    last: false,
    empty: true
  };

  // Danh sách dữ liệu cho các dropdown
  users: User[] = [];
  practiceActivities: PracticeActivity[] = [];

  // Trạng thái quyền và tải dữ liệu
  isAdmin: boolean = false;
  loading: boolean = false;

  // Form lọc dữ liệu
  filterForm: FormGroup;

  // Biến cho Modal chỉnh sửa
  isVisibleEditModal = false;
  isEditLoading = false;
  editForm!: FormGroup;
  currentEditingAttemptId: number | null = null; // Lưu ID của lần thử đang chỉnh sửa

  // Biến cho Modal thêm mới
  isVisibleCreateModal = false;
  isCreateLoading = false;
  createForm!: FormGroup;

  // Biến để theo dõi xem có phải lần đầu tải hay không để tránh gọi loadAttempts quá sớm
  private initialLoadComplete: boolean = false;

  constructor(
    private writingAttemptService: UserWritingAttemptService,
    private userService: UserService,
    private practiceActivityService: PracticeActivityService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private modal: NzModalService
  ) {
    // Khởi tạo filter form
    this.filterForm = this.fb.group({
      userId: [null],
      practiceActivityId: [null],
      minOverallScore: [null],
      maxOverallScore: [null]
    });

    // Khởi tạo edit form với các Validators
    this.editForm = this.fb.group({
      userId: [null, Validators.required],
      practiceActivityId: [null, Validators.required],
      userWrittenText: ['', Validators.required],
      grammarFeedback: [''], // Có thể không bắt buộc
      spellingFeedback: [''], // Có thể không bắt buộc
      cohesionFeedback: [''], // Có thể không bắt buộc
      overallScore: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    // Khởi tạo create form (tương tự edit form)
    this.createForm = this.fb.group({
      userId: [null, Validators.required],
      practiceActivityId: [null, Validators.required],
      userWrittenText: ['', Validators.required],
      grammarFeedback: [''],
      spellingFeedback: [''],
      cohesionFeedback: [''],
      overallScore: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    console.log('UserWritingAttemptsComponent: ngOnInit - Khởi tạo component.');
    this.checkAdminStatusAndLoadData();
  }

  /**
   * Kiểm tra quyền admin và tải dữ liệu ban đầu.
   */
  private checkAdminStatusAndLoadData(): void {
    console.log('UserWritingAttemptsComponent: checkAdminStatusAndLoadData - Bắt đầu kiểm tra quyền admin.');
    this.loading = true;
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        console.log('UserWritingAttemptsComponent: Quyền admin =', isAdmin);
        if (this.isAdmin) {
          this.loadUsers();
          this.loadPracticeActivities();
          this.loadAttempts(); // Tải dữ liệu lần thử viết nếu là admin
        } else {
          this.notification.warning('Cảnh báo', 'Bạn không có quyền truy cập trang quản lý lần thử viết.');
          this.loading = false;
        }
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể xác minh quyền quản trị.');
        console.error('UserWritingAttemptsComponent: Lỗi kiểm tra quyền admin:', err);
        this.isAdmin = false;
        this.loading = false;
      }
    });
  }

  /**
   * Tải danh sách người dùng cho dropdown.
   */
  loadUsers(): void {
    console.log('UserWritingAttemptsComponent: loadUsers - Đang tải danh sách người dùng.');
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('UserWritingAttemptsComponent: Đã tải người dùng:', users);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải danh sách người dùng.');
        console.error('UserWritingAttemptsComponent: Lỗi tải người dùng:', err);
      }
    });
  }

  /**
   * Tải danh sách hoạt động luyện tập cho dropdown.
   */
  loadPracticeActivities(): void {
    console.log('UserWritingAttemptsComponent: loadPracticeActivities - Đang tải danh sách hoạt động luyện tập.');
    this.practiceActivityService.getAllPracticeActivities().subscribe({
      next: (activities) => {
        this.practiceActivities = activities;
        console.log('UserWritingAttemptsComponent: Đã tải hoạt động luyện tập:', activities);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải danh sách hoạt động luyện tập.');
        console.error('UserWritingAttemptsComponent: Lỗi tải hoạt động luyện tập:', err);
      }
    });
  }

  /**
   * Tải các lần thử viết dựa trên bộ lọc và phân trang hiện tại.
   */
  loadAttempts(): void {
    console.log('UserWritingAttemptsComponent: loadAttempts - Bắt đầu tải lần thử viết.');
    if (!this.isAdmin) {
      console.warn('UserWritingAttemptsComponent: Không có quyền admin, không tải lần thử viết.');
      this.pageData.content = [];
      this.pageData.totalElements = 0;
      this.loading = false;
      return;
    }

    this.loading = true;
    const filterValue = this.filterForm.value;

    const searchRequest: UserWritingAttemptSearchRequest = {
      userId: filterValue.userId,
      practiceActivityId: filterValue.practiceActivityId,
      minOverallScore: filterValue.minOverallScore,
      maxOverallScore: filterValue.maxOverallScore,
      page: this.pageData.page,
      size: this.pageData.size
    };

    console.log('UserWritingAttemptsComponent: searchRequest được gửi:', searchRequest);

    this.writingAttemptService.searchWritingAttempts(searchRequest).pipe(
      finalize(() => {
        this.loading = false;
        console.log('UserWritingAttemptsComponent: loadAttempts - Hoàn tất tải lần thử viết, loading = false.');
        // Đánh dấu là đã tải lần đầu thành công
        this.initialLoadComplete = true;
      })
    ).subscribe({
      next: (response: UserWritingAttemptPage) => {
        console.log('UserWritingAttemptsComponent: Phản hồi API thành công:', response);
        // Đảm bảo các giá trị số từ phản hồi API là hợp lệ trước khi gán
        this.pageData.content = response.content || [];
        this.pageData.totalElements = !isNaN(response.totalElements) ? response.totalElements : 0;
        this.pageData.totalPages = !isNaN(response.totalPages) ? response.totalPages : 0;
        this.pageData.page = !isNaN(response.page) ? response.page : 0;
        this.pageData.size = !isNaN(response.size) ? response.size : 10;
        this.pageData.number = !isNaN(response.number) ? response.number : 0;
        this.pageData.first = response.first !== undefined ? response.first : true;
        this.pageData.last = response.last !== undefined ? response.last : false;
        this.pageData.empty = response.empty !== undefined ? response.empty : true;

        console.log('UserWritingAttemptsComponent: pageData sau cập nhật và làm sạch:', this.pageData);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải lần thử viết: ' + (err.error?.message || 'Lỗi không xác định'));
        console.error('UserWritingAttemptsComponent: Lỗi tải lần thử viết:', err);
        this.pageData.content = [];
        this.pageData.totalElements = 0;
        // Đảm bảo các giá trị phân trang cũng được reset về mặc định hợp lệ khi có lỗi
        this.pageData.page = 0;
        this.pageData.size = 10;
        this.pageData.totalPages = 0;
        this.pageData.number = 0;
        this.pageData.first = true;
        this.pageData.last = false;
        this.pageData.empty = true;
      }
    });
  }

  /**
   * Áp dụng các bộ lọc và tải lại dữ liệu từ trang đầu tiên.
   */
  applyFilters(): void {
    console.log('UserWritingAttemptsComponent: applyFilters - Áp dụng bộ lọc.');
    this.pageData.page = 0; // Reset về trang đầu tiên khi áp dụng bộ lọc
    this.loadAttempts();
  }

  /**
   * Đặt lại tất cả các bộ lọc về trạng thái ban đầu và tải lại dữ liệu.
   */
  resetFilters(): void {
    console.log('UserWritingAttemptsComponent: resetFilters - Đặt lại bộ lọc.');
    this.filterForm.reset({
      userId: null,
      practiceActivityId: null,
      minOverallScore: null,
      maxOverallScore: null
    });
    this.pageData.page = 0; // Reset về trang đầu tiên khi đặt lại bộ lọc
    this.loadAttempts();
  }

  /**
   * Mở modal chỉnh sửa và điền dữ liệu của lần thử đã chọn.
   * @param attempt Lần thử viết cần chỉnh sửa.
   */
  openEditModal(attempt: UserWritingAttempt): void {
    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền chỉnh sửa lần thử viết.');
      return;
    }
    this.currentEditingAttemptId = attempt.attemptId || null;
    this.editForm.patchValue({
      userId: attempt.userId,
      practiceActivityId: attempt.practiceActivityId,
      userWrittenText: attempt.userWrittenText,
      grammarFeedback: attempt.grammarFeedback,
      spellingFeedback: attempt.spellingFeedback,
      cohesionFeedback: attempt.cohesionFeedback,
      overallScore: attempt.overallScore
    });
    this.isVisibleEditModal = true;
  }

  /**
   * Xử lý khi nhấn nút "Lưu thay đổi" trong modal chỉnh sửa.
   */
  handleEditOk(): void {
    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền chỉnh sửa lần thử viết.');
      return;
    }
    if (this.editForm.valid && this.currentEditingAttemptId !== null) {
      this.isEditLoading = true;
      const request: UserWritingAttemptRequest = this.editForm.value;
      this.writingAttemptService.updateWritingAttempt(this.currentEditingAttemptId, request)
        .pipe(finalize(() => this.isEditLoading = false))
        .subscribe({
          next: () => {
            this.notification.success('Thành công', 'Lần thử viết đã được cập nhật thành công!');
            this.isVisibleEditModal = false;
            this.loadAttempts(); // Tải lại dữ liệu sau khi cập nhật
          },
          error: (err) => {
            this.notification.error('Lỗi', 'Cập nhật lần thử viết thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
            console.error('Lỗi cập nhật lần thử viết:', err);
          }
        });
    } else {
      this.editForm.markAllAsTouched(); // Đánh dấu tất cả các trường là đã chạm để hiển thị lỗi
      this.notification.warning('Cảnh báo', 'Vui lòng điền đầy đủ và chính xác thông tin.');
    }
  }

  /**
   * Xử lý khi hủy bỏ modal chỉnh sửa.
   */
  handleEditCancel(): void {
    this.isVisibleEditModal = false;
    this.editForm.reset(); // Reset form khi đóng modal
    this.currentEditingAttemptId = null;
  }

  /**
   * Mở modal thêm mới lần thử viết.
   */
  openCreateModal(): void {
    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền thêm mới lần thử viết.');
      return;
    }
    this.createForm.reset(); // Đảm bảo form trống khi mở
    this.isVisibleCreateModal = true;
  }

  /**
   * Xử lý khi nhấn nút "Tạo mới" trong modal thêm mới.
   */
  handleCreateOk(): void {
    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền thêm mới lần thử viết.');
      return;
    }
    if (this.createForm.valid) {
      this.isCreateLoading = true;
      const request: UserWritingAttemptRequest = this.createForm.value;
      this.writingAttemptService.saveWritingAttempt(request)
        .pipe(finalize(() => this.isCreateLoading = false))
        .subscribe({
          next: () => {
            this.notification.success('Thành công', 'Lần thử viết mới đã được tạo thành công!');
            this.isVisibleCreateModal = false;
            this.loadAttempts(); // Tải lại dữ liệu sau khi thêm mới
          },
          error: (err) => {
            this.notification.error('Lỗi', 'Tạo mới lần thử viết thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
            console.error('Lỗi tạo mới lần thử viết:', err);
          }
        });
    } else {
      this.createForm.markAllAsTouched(); // Đánh dấu tất cả các trường là đã chạm để hiển thị lỗi
      this.notification.warning('Cảnh báo', 'Vui lòng điền đầy đủ và chính xác thông tin.');
    }
  }

  /**
   * Xử lý khi hủy bỏ modal thêm mới.
   */
  handleCreateCancel(): void {
    this.isVisibleCreateModal = false;
    this.createForm.reset(); // Reset form khi đóng modal
  }

  /**
   * Xóa một lần thử viết.
   * @param attemptId ID của lần thử viết cần xóa.
   */
  deleteAttempt(attemptId: number | undefined): void {
    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền xóa lần thử viết.');
      return;
    }
    if (attemptId === undefined || attemptId === null) {
      this.notification.error('Lỗi', 'ID lần thử không hợp lệ để xóa.');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa lần thử viết này?',
      nzContent: 'Hành động này không thể hoàn tác.',
      nzOkText: 'Có',
      nzOkDanger: true,
      nzCancelText: 'Không',
      nzOnOk: () => {
        console.log('UserWritingAttemptsComponent: Xác nhận xóa lần thử:', attemptId);
        this.writingAttemptService.deleteWritingAttempt(attemptId).subscribe({
          next: () => {
            this.notification.success('Thành công', 'Lần thử viết đã được xóa!');
            console.log('UserWritingAttemptsComponent: Xóa thành công, tải lại dữ liệu.');
            this.loadAttempts();
          },
          error: (err) => {
            this.notification.error('Lỗi', 'Xóa lần thử viết thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
            console.error('UserWritingAttemptsComponent: Lỗi xóa lần thử viết:', err);
          }
        });
      }
    });
  }

  /**
   * Lấy username từ userId.
   * @param userId ID của người dùng.
   * @returns Tên người dùng hoặc 'N/A' nếu không tìm thấy.
   */
  getUserUsername(userId: number | undefined): string {
    const user = this.users.find(u => u.userId === userId);
    return user ? user.username : 'N/A';
  }

  /**
   * Lấy tiêu đề hoạt động luyện tập từ practiceActivityId.
   * @param practiceActivityId ID của hoạt động luyện tập.
   * @returns Tiêu đề hoạt động hoặc 'N/A' nếu không tìm thấy.
   */
  getPracticeActivityTitle(practiceActivityId: number | undefined): string {
    const activity = this.practiceActivities.find(pa => pa.activityId === practiceActivityId);
    return activity ? activity.title : 'N/A';
  }

  /**
   * Xử lý thay đổi tham số bảng (phân trang, sắp xếp).
   * @param params Các tham số thay đổi từ bảng.
   */
  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    console.log('UserWritingAttemptsComponent: onQueryParamsChange - params từ bảng:', { pageIndex, pageSize });

    // Cập nhật pageData.page và pageData.size với giá trị hợp lệ
    // pageIndex từ nz-table là 1-based, cần chuyển về 0-based cho API
    const newPage = (!isNaN(pageIndex) && pageIndex > 0) ? (pageIndex - 1) : 0;
    const newSize = (!isNaN(pageSize) && pageSize > 0) ? pageSize : 10;

    // Kiểm tra nếu pageIndex là NaN và đã hoàn thành tải ban đầu, thì bỏ qua
    if (isNaN(pageIndex) && this.initialLoadComplete) {
      console.log('UserWritingAttemptsComponent: onQueryParamsChange - Bỏ qua pageIndex NaN sau khi tải ban đầu.');
      return;
    }

    // Chỉ gọi loadAttempts nếu có sự thay đổi thực sự trong page hoặc size
    // Hoặc nếu đây là lần đầu tiên onQueryParamsChange được gọi (initialLoadComplete là false)
    if (newPage !== this.pageData.page || newSize !== this.pageData.size || !this.initialLoadComplete) {
      this.pageData.page = newPage;
      this.pageData.size = newSize;
      console.log('UserWritingAttemptsComponent: pageData.page (0-based) =', this.pageData.page);
      console.log('UserWritingAttemptsComponent: pageData.size =', this.pageData.size);
      this.loadAttempts();
    } else {
      console.log('UserWritingAttemptsComponent: onQueryParamsChange - Không có thay đổi page/size hợp lệ, không gọi loadAttempts.');
    }
  }
}
