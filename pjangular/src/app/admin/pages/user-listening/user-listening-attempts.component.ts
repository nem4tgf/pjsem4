import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Validators
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { UserListeningAttempt, UserListeningAttemptPage, UserListeningAttemptRequest, UserListeningAttemptSearchRequest } from 'src/app/interface/user_listening.interface';
import { User } from 'src/app/interface/user.interface';
import { PracticeActivity } from 'src/app/interface/pratice-activity.interface';
import { UserListeningAttemptService } from 'src/app/service/user-listening-attempt.service';
import { UserService } from 'src/app/service/user.service';
import { PracticeActivityService } from 'src/app/service/pratice-activity.service';
import { ApiService } from 'src/app/service/api.service';


@Component({
  selector: 'app-user-listening-attempts',
  templateUrl: './user-listening-attempts.component.html',
  styleUrls: ['./user-listening-attempts.component.css']
})
export class UserListeningAttemptsComponent implements OnInit {
  pageData: UserListeningAttemptPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    page: 0, // Giá trị mặc định ban đầu là 0 (0-based)
    size: 10, // Giá trị mặc định ban đầu là 10
    number: 0,
    first: true,
    last: false,
    empty: true
  };
  users: User[] = [];
  practiceActivities: PracticeActivity[] = [];
  isAdmin: boolean = false;
  loading: boolean = false; // Loading cho bảng chính
  filterForm: FormGroup;

  // Biến cho chức năng sửa
  isVisibleEditModal = false;
  editForm: FormGroup;
  currentAttemptId: number | null = null;
  isEditLoading = false; // Biến loading cho modal sửa

  // Biến cho chức năng thêm mới (NEW ADDITION)
  isVisibleCreateModal = false;
  createForm: FormGroup;
  isCreateLoading = false; // Biến loading cho modal thêm mới

  // Biến để theo dõi xem có phải lần đầu tải hay không để tránh gọi loadAttempts quá sớm
  private initialLoadComplete: boolean = false;

  constructor(
    private listeningAttemptService: UserListeningAttemptService,
    private userService: UserService,
    private practiceActivityService: PracticeActivityService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private modal: NzModalService
  ) {
    this.filterForm = this.fb.group({
      userId: [null],
      practiceActivityId: [null],
      minAccuracyScore: [null],
      maxAccuracyScore: [null]
    });

    // Khởi tạo editForm với các validation
    this.editForm = this.fb.group({
      userId: [null, [Validators.required]],
      practiceActivityId: [null, [Validators.required]],
      userTranscribedText: [null, [Validators.required]],
      accuracyScore: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      // attemptDate có thể không cần chỉnh sửa hoặc chỉnh sửa thông qua DatePicker nếu cần
      // tạm thời không thêm vào form sửa nếu backend tự sinh hoặc không cho phép sửa
      // nếu có, sẽ là attemptDate: [null, [Validators.required]]
    });

    // Khởi tạo createForm với các validation (NEW ADDITION)
    this.createForm = this.fb.group({
      userId: [null, [Validators.required]],
      practiceActivityId: [null, [Validators.required]],
      userTranscribedText: [null, [Validators.required]],
      accuracyScore: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      // attemptDate có thể được backend tự sinh, nếu không, cần thêm vào đây
    });
  }

  ngOnInit(): void {
    console.log('UserListeningAttemptsComponent: ngOnInit - Khởi tạo component.');
    this.checkAdminStatusAndLoadData();
  }

  /**
   * Kiểm tra quyền admin và tải dữ liệu ban đầu nếu là admin.
   */
  private checkAdminStatusAndLoadData(): void {
    console.log('UserListeningAttemptsComponent: checkAdminStatusAndLoadData - Bắt đầu kiểm tra quyền admin.');
    this.loading = true; // Bắt đầu hiển thị loading khi kiểm tra quyền
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        console.log('UserListeningAttemptsComponent: Quyền admin =', isAdmin);
        if (this.isAdmin) {
          this.loadUsers();
          this.loadPracticeActivities();
          // Gọi loadAttempts sau khi các select box đã có dữ liệu để tránh lỗi hiển thị
          this.loadAttempts();
        } else {
          this.notification.warning('Cảnh báo', 'Bạn không có quyền truy cập trang quản lý lần thử nghe.');
          this.loading = false; // Tắt loading nếu không có quyền
        }
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể xác minh quyền quản trị.');
        console.error('UserListeningAttemptsComponent: Lỗi kiểm tra quyền admin:', err);
        this.isAdmin = false;
        this.loading = false; // Tắt loading nếu có lỗi
      }
    });
  }

  /**
   * Tải danh sách người dùng.
   */
  loadUsers(): void {
    console.log('UserListeningAttemptsComponent: loadUsers - Đang tải danh sách người dùng.');
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('UserListeningAttemptsComponent: Đã tải người dùng:', users);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải danh sách người dùng.');
        console.error('UserListeningAttemptsComponent: Lỗi tải người dùng:', err);
      }
    });
  }

  /**
   * Tải danh sách hoạt động luyện tập.
   */
  loadPracticeActivities(): void {
    console.log('UserListeningAttemptsComponent: loadPracticeActivities - Đang tải danh sách hoạt động luyện tập.');
    this.practiceActivityService.getAllPracticeActivities().subscribe({
      next: (activities) => {
        this.practiceActivities = activities;
        console.log('UserListeningAttemptsComponent: Đã tải hoạt động luyện tập:', activities);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải danh sách hoạt động luyện tập.');
        console.error('UserListeningAttemptsComponent: Lỗi tải hoạt động luyện tập:', err);
      }
    });
  }

  /**
   * Tải các lần thử nghe dựa trên các tiêu chí tìm kiếm và phân trang hiện tại.
   */
  loadAttempts(): void {
    console.log('UserListeningAttemptsComponent: loadAttempts - Bắt đầu tải lần thử nghe.');
    if (!this.isAdmin) {
      console.warn('UserListeningAttemptsComponent: Không có quyền admin, không tải lần thử nghe.');
      this.pageData.content = [];
      this.pageData.totalElements = 0;
      this.loading = false;
      return;
    }

    this.loading = true;
    const filterValue = this.filterForm.value;

    const searchRequest: UserListeningAttemptSearchRequest = {
      userId: filterValue.userId,
      practiceActivityId: filterValue.practiceActivityId,
      minAccuracyScore: filterValue.minAccuracyScore,
      maxAccuracyScore: filterValue.maxAccuracyScore,
      page: this.pageData.page,
      size: this.pageData.size
    };

    console.log('UserListeningAttemptsComponent: searchRequest được gửi:', searchRequest);

    this.listeningAttemptService.searchListeningAttempts(searchRequest).pipe(
      finalize(() => {
        this.loading = false;
        console.log('UserListeningAttemptsComponent: loadAttempts - Hoàn tất tải lần thử nghe, loading = false.');
        // Đánh dấu là đã tải lần đầu thành công
        this.initialLoadComplete = true;
      })
    ).subscribe({
      next: (response: UserListeningAttemptPage) => {
        console.log('UserListeningAttemptsComponent: Phản hồi API thành công:', response);
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

        console.log('UserListeningAttemptsComponent: pageData sau cập nhật và làm sạch:', this.pageData);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải lần thử nghe: ' + (err.error?.message || 'Lỗi không xác định'));
        console.error('UserListeningAttemptsComponent: Lỗi tải lần thử nghe:', err);
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
   * Áp dụng bộ lọc và tải lại dữ liệu.
   */
  applyFilters(): void {
    console.log('UserListeningAttemptsComponent: applyFilters - Áp dụng bộ lọc.');
    this.pageData.page = 0; // Reset về trang đầu tiên khi áp dụng bộ lọc
    this.loadAttempts();
  }

  /**
   * Đặt lại các bộ lọc về giá trị mặc định và tải lại dữ liệu.
   */
  resetFilters(): void {
    console.log('UserListeningAttemptsComponent: resetFilters - Đặt lại bộ lọc.');
    this.filterForm.reset({
      userId: null,
      practiceActivityId: null,
      minAccuracyScore: null,
      maxAccuracyScore: null
    });
    this.pageData.page = 0; // Reset về trang đầu tiên khi đặt lại bộ lọc
    this.loadAttempts();
  }

  /**
   * Xóa một lần thử nghe.
   * @param attemptId ID của lần thử nghe cần xóa.
   */
  deleteAttempt(attemptId: number | undefined): void {
    console.log('UserListeningAttemptsComponent: deleteAttempt - Yêu cầu xóa lần thử:', attemptId);
    if (attemptId === undefined || attemptId === null) {
      this.notification.error('Lỗi', 'Không tìm thấy ID lần thử nghe để xóa.');
      return;
    }

    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền xóa lần thử nghe.');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa lần thử nghe này?',
      nzContent: 'Hành động này không thể hoàn tác.',
      nzOkText: 'Có',
      nzOkDanger: true,
      nzCancelText: 'Không',
      nzOnOk: () => {
        console.log('UserListeningAttemptsComponent: Xác nhận xóa lần thử:', attemptId);
        this.listeningAttemptService.deleteListeningAttempt(attemptId).subscribe({
          next: () => {
            this.notification.success('Thành công', 'Lần thử nghe đã được xóa!');
            console.log('UserListeningAttemptsComponent: Xóa thành công, tải lại dữ liệu.');
            this.loadAttempts();
          },
          error: (err) => {
            this.notification.error('Lỗi', 'Xóa lần thử nghe thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
            console.error('UserListeningAttemptsComponent: Lỗi xóa lần thử nghe:', err);
          }
        });
      }
    });
  }

  /**
   * Mở modal chỉnh sửa và điền dữ liệu của lần thử nghe vào form.
   * @param attempt Lần thử nghe cần chỉnh sửa.
   */
  openEditModal(attempt: UserListeningAttempt): void {
    console.log('UserListeningAttemptsComponent: openEditModal - Mở modal sửa cho lần thử:', attempt.attemptId);
    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền chỉnh sửa lần thử nghe.');
      return;
    }

    this.currentAttemptId = attempt.attemptId || null;
    this.editForm.patchValue({
      userId: attempt.userId,
      practiceActivityId: attempt.practiceActivityId,
      userTranscribedText: attempt.userTranscribedText,
      accuracyScore: attempt.accuracyScore
    });
    this.isVisibleEditModal = true;
  }

  /**
   * Xử lý khi người dùng nhấn OK trên modal sửa.
   */
  handleEditOk(): void {
    console.log('UserListeningAttemptsComponent: handleEditOk - Xử lý lưu chỉnh sửa.');
    if (!this.currentAttemptId) {
      this.notification.error('Lỗi', 'Không tìm thấy ID lần thử nghe để cập nhật.');
      return;
    }

    if (this.editForm.valid) {
      this.isEditLoading = true;
      const request: UserListeningAttemptRequest = this.editForm.value;
      console.log('UserListeningAttemptsComponent: Yêu cầu cập nhật:', request);

      this.listeningAttemptService.updateListeningAttempt(this.currentAttemptId, request).pipe(
        finalize(() => {
          this.isEditLoading = false;
        })
      ).subscribe({
        next: (updatedAttempt) => {
          this.notification.success('Thành công', 'Lần thử nghe đã được cập nhật!');
          console.log('UserListeningAttemptsComponent: Cập nhật thành công:', updatedAttempt);
          this.isVisibleEditModal = false;
          this.loadAttempts(); // Tải lại dữ liệu để hiển thị thay đổi
        },
        error: (err) => {
          this.notification.error('Lỗi', 'Cập nhật lần thử nghe thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
          console.error('UserListeningAttemptsComponent: Lỗi cập nhật lần thử nghe:', err);
        }
      });
    } else {
      this.notification.warning('Cảnh báo', 'Vui lòng điền đầy đủ và chính xác các trường trong form.');
      Object.values(this.editForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  /**
   * Xử lý khi người dùng hủy modal sửa.
   */
  handleEditCancel(): void {
    console.log('UserListeningAttemptsComponent: handleEditCancel - Hủy chỉnh sửa.');
    this.isVisibleEditModal = false;
    this.editForm.reset();
    this.currentAttemptId = null;
  }

  // NEW ADDITIONS FOR CREATE FUNCTIONALITY
  /**
   * Mở modal thêm mới lần thử nghe.
   */
  openCreateModal(): void {
    console.log('UserListeningAttemptsComponent: openCreateModal - Mở modal thêm mới.');
    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền thêm mới lần thử nghe.');
      return;
    }
    this.createForm.reset(); // Đảm bảo form sạch khi mở
    this.isVisibleCreateModal = true;
  }

  /**
   * Xử lý khi người dùng nhấn OK trên modal thêm mới.
   */
  handleCreateOk(): void {
    console.log('UserListeningAttemptsComponent: handleCreateOk - Xử lý lưu tạo mới.');
    if (this.createForm.valid) {
      this.isCreateLoading = true;
      const request: UserListeningAttemptRequest = this.createForm.value;
      console.log('UserListeningAttemptsComponent: Yêu cầu tạo mới:', request);

      this.listeningAttemptService.saveListeningAttempt(request).pipe(
        finalize(() => {
          this.isCreateLoading = false;
        })
      ).subscribe({
        next: (newAttempt) => {
          this.notification.success('Thành công', 'Lần thử nghe mới đã được thêm!');
          console.log('UserListeningAttemptsComponent: Thêm mới thành công:', newAttempt);
          this.isVisibleCreateModal = false;
          this.loadAttempts(); // Tải lại dữ liệu để hiển thị lần thử mới
        },
        error: (err) => {
          this.notification.error('Lỗi', 'Thêm mới lần thử nghe thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
          console.error('UserListeningAttemptsComponent: Lỗi thêm mới lần thử nghe:', err);
        }
      });
    } else {
      this.notification.warning('Cảnh báo', 'Vui lòng điền đầy đủ và chính xác các trường trong form.');
      Object.values(this.createForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  /**
   * Xử lý khi người dùng hủy modal thêm mới.
   */
  handleCreateCancel(): void {
    console.log('UserListeningAttemptsComponent: handleCreateCancel - Hủy thêm mới.');
    this.isVisibleCreateModal = false;
    this.createForm.reset();
  }
  // END NEW ADDITIONS

  /**
   * Lấy tên người dùng dựa trên userId.
   * @param userId ID của người dùng.
   * @returns Tên người dùng hoặc 'N/A' nếu không tìm thấy.
   */
  getUserUsername(userId: number | undefined): string {
    const user = this.users.find(u => u.userId === userId);
    return user ? user.username : 'N/A';
  }

  /**
   * Lấy tiêu đề hoạt động luyện tập dựa trên practiceActivityId.
   * @param practiceActivityId ID của hoạt động luyện tập.
   * @returns Tiêu đề hoạt động luyện tập hoặc 'N/A' nếu không tìm thấy.
   */
  getPracticeActivityTitle(practiceActivityId: number | undefined): string {
    const activity = this.practiceActivities.find(pa => pa.activityId === practiceActivityId);
    return activity ? activity.title : 'N/A';
  }

  /**
   * Xử lý sự kiện thay đổi tham số bảng (phân trang, sắp xếp).
   * @param params Các tham số thay đổi từ bảng NzTable.
   */
  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    console.log('UserListeningAttemptsComponent: onQueryParamsChange - params từ bảng:', { pageIndex, pageSize });

    // Chuyển đổi pageIndex từ 1-based (NzTable) sang 0-based (Backend)
    const newPage = (pageIndex !== undefined && pageIndex > 0) ? (pageIndex - 1) : 0;
    const newSize = (pageSize !== undefined && pageSize > 0) ? pageSize : 10;

    // Kiểm tra nếu không phải lần tải ban đầu và không có sự thay đổi page/size thì không gọi lại API
    // Điều kiện !isNaN(pageIndex) để tránh lỗi khi pageIndex là NaN (có thể xảy ra trong một số trường hợp khởi tạo)
    if (this.initialLoadComplete && !isNaN(pageIndex) && newPage === this.pageData.page && newSize === this.pageData.size) {
      console.log('UserListeningAttemptsComponent: onQueryParamsChange - Không có thay đổi page/size, bỏ qua tải lại.');
      return;
    }

    // Cập nhật pageData và gọi tải dữ liệu
    this.pageData.page = newPage;
    this.pageData.size = newSize;
    console.log('UserListeningAttemptsComponent: pageData.page (0-based) =', this.pageData.page);
    console.log('UserListeningAttemptsComponent: pageData.size =', this.pageData.size);
    this.loadAttempts();
  }
}
