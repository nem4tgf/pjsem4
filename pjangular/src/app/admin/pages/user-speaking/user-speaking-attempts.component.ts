import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Validators
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { UserSpeakingAttempt, UserSpeakingAttemptPage, UserSpeakingAttemptRequest, UserSpeakingAttemptSearchRequest } from 'src/app/interface/user-speaking.interface';
import { User } from 'src/app/interface/user.interface';
import { PracticeActivity } from 'src/app/interface/pratice-activity.interface';
import { UserService } from 'src/app/service/user.service';
import { PracticeActivityService } from 'src/app/service/pratice-activity.service';
import { ApiService } from 'src/app/service/api.service';
import { UserSpeakingAttemptService } from 'src/app/service/user-speaking-attempt.interface';
// Đã sửa lỗi import từ .interface sang .service


@Component({
  selector: 'app-user-speaking-attempts',
  templateUrl: './user-speaking-attempts.component.html',
  styleUrls: ['./user-speaking-attempts.component.css']
})
export class UserSpeakingAttemptsComponent implements OnInit {
  pageData: UserSpeakingAttemptPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    page: 0, // Giá trị mặc định ban đầu là 0
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

  // Biến cho chức năng thêm mới
  isVisibleCreateModal = false;
  createForm: FormGroup;
  isCreateLoading = false; // Biến loading cho modal thêm mới

  // Biến để theo dõi xem có phải lần đầu tải hay không để tránh gọi loadAttempts quá sớm
  private initialLoadComplete: boolean = false;

  constructor(
    private speakingAttemptService: UserSpeakingAttemptService,
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
      minOverallScore: [null],
      maxOverallScore: [null]
    });

    // Khởi tạo editForm với các validation
    this.editForm = this.fb.group({
      userId: [null, [Validators.required]],
      practiceActivityId: [null, [Validators.required]],
      userAudioUrl: [null, [Validators.required, Validators.pattern('https?://.+')]], // Yêu cầu URL hợp lệ
      userTranscribedBySTT: [null, [Validators.required]],
      pronunciationScore: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      fluencyScore: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      overallScore: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      // attemptDate thường được backend tự sinh hoặc không cho phép sửa
      // Nếu cần sửa, sẽ là attemptDate: [null, [Validators.required]]
    });

    // Khởi tạo createForm với các validation
    this.createForm = this.fb.group({
      userId: [null, [Validators.required]],
      practiceActivityId: [null, [Validators.required]],
      userAudioUrl: [null, [Validators.required, Validators.pattern('https?://.+')]], // Yêu cầu URL hợp lệ
      userTranscribedBySTT: [null, [Validators.required]],
      pronunciationScore: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      fluencyScore: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      overallScore: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      // attemptDate sẽ được backend tự sinh
    });
  }

  ngOnInit(): void {
    console.log('UserSpeakingAttemptsComponent: ngOnInit - Khởi tạo component.');
    this.checkAdminStatusAndLoadData();
  }

  /**
   * Kiểm tra quyền admin và tải dữ liệu ban đầu nếu là admin.
   */
  private checkAdminStatusAndLoadData(): void {
    console.log('UserSpeakingAttemptsComponent: checkAdminStatusAndLoadData - Bắt đầu kiểm tra quyền admin.');
    this.loading = true; // Bắt đầu hiển thị loading khi kiểm tra quyền
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        console.log('UserSpeakingAttemptsComponent: Quyền admin =', isAdmin);
        if (this.isAdmin) {
          this.loadUsers();
          this.loadPracticeActivities();
          // Gọi loadAttempts sau khi các select box đã có dữ liệu để tránh lỗi hiển thị
          this.loadAttempts();
        } else {
          this.notification.warning('Cảnh báo', 'Bạn không có quyền truy cập trang quản lý lần thử nói.');
          this.loading = false; // Tắt loading nếu không có quyền
        }
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể xác minh quyền quản trị.');
        console.error('UserSpeakingAttemptsComponent: Lỗi kiểm tra quyền admin:', err);
        this.isAdmin = false;
        this.loading = false; // Tắt loading nếu có lỗi
      }
    });
  }

  /**
   * Tải danh sách người dùng.
   */
  loadUsers(): void {
    console.log('UserSpeakingAttemptsComponent: loadUsers - Đang tải danh sách người dùng.');
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('UserSpeakingAttemptsComponent: Đã tải người dùng:', users);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải danh sách người dùng.');
        console.error('UserSpeakingAttemptsComponent: Lỗi tải người dùng:', err);
      }
    });
  }

  /**
   * Tải danh sách hoạt động luyện tập.
   */
  loadPracticeActivities(): void {
    console.log('UserSpeakingAttemptsComponent: loadPracticeActivities - Đang tải danh sách hoạt động luyện tập.');
    this.practiceActivityService.getAllPracticeActivities().subscribe({
      next: (activities) => {
        this.practiceActivities = activities;
        console.log('UserSpeakingAttemptsComponent: Đã tải hoạt động luyện tập:', activities);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải danh sách hoạt động luyện tập.');
        console.error('UserSpeakingAttemptsComponent: Lỗi tải hoạt động luyện tập:', err);
      }
    });
  }

  /**
   * Tải các lần thử nói dựa trên các tiêu chí tìm kiếm và phân trang hiện tại.
   */
  loadAttempts(): void {
    console.log('UserSpeakingAttemptsComponent: loadAttempts - Bắt đầu tải lần thử nói.');
    if (!this.isAdmin) {
      console.warn('UserSpeakingAttemptsComponent: Không có quyền admin, không tải lần thử nói.');
      this.pageData.content = [];
      this.pageData.totalElements = 0;
      this.loading = false;
      return;
    }

    this.loading = true;
    const filterValue = this.filterForm.value;

    const searchRequest: UserSpeakingAttemptSearchRequest = {
      userId: filterValue.userId,
      practiceActivityId: filterValue.practiceActivityId,
      minOverallScore: filterValue.minOverallScore,
      maxOverallScore: filterValue.maxOverallScore,
      page: this.pageData.page,
      size: this.pageData.size
    };

    console.log('UserSpeakingAttemptsComponent: searchRequest được gửi:', searchRequest);

    this.speakingAttemptService.searchSpeakingAttempts(searchRequest).pipe(
      finalize(() => {
        this.loading = false;
        console.log('UserSpeakingAttemptsComponent: loadAttempts - Hoàn tất tải lần thử nói, loading = false.');
        // Đánh dấu là đã tải lần đầu thành công
        this.initialLoadComplete = true;
      })
    ).subscribe({
      next: (response: UserSpeakingAttemptPage) => {
        console.log('UserSpeakingAttemptsComponent: Phản hồi API thành công:', response);
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

        console.log('UserSpeakingAttemptsComponent: pageData sau cập nhật và làm sạch:', this.pageData);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải lần thử nói: ' + (err.error?.message || 'Lỗi không xác định'));
        console.error('UserSpeakingAttemptsComponent: Lỗi tải lần thử nói:', err);
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
    console.log('UserSpeakingAttemptsComponent: applyFilters - Áp dụng bộ lọc.');
    this.pageData.page = 0; // Reset về trang đầu tiên khi áp dụng bộ lọc
    this.loadAttempts();
  }

  /**
   * Đặt lại các bộ lọc về giá trị mặc định và tải lại dữ liệu.
   */
  resetFilters(): void {
    console.log('UserSpeakingAttemptsComponent: resetFilters - Đặt lại bộ lọc.');
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
   * Xóa một lần thử nói.
   * @param attemptId ID của lần thử nói cần xóa.
   */
  deleteAttempt(attemptId: number | undefined): void {
    console.log('UserSpeakingAttemptsComponent: deleteAttempt - Yêu cầu xóa lần thử:', attemptId);
    if (attemptId === undefined || attemptId === null) {
      this.notification.error('Lỗi', 'Không tìm thấy ID lần thử nói để xóa.');
      return;
    }

    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền xóa lần thử nói.');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa lần thử nói này?',
      nzContent: 'Hành động này không thể hoàn tác.',
      nzOkText: 'Có',
      nzOkDanger: true,
      nzCancelText: 'Không',
      nzOnOk: () => {
        console.log('UserSpeakingAttemptsComponent: Xác nhận xóa lần thử:', attemptId);
        this.speakingAttemptService.deleteSpeakingAttempt(attemptId).subscribe({
          next: () => {
            this.notification.success('Thành công', 'Lần thử nói đã được xóa!');
            console.log('UserSpeakingAttemptsComponent: Xóa thành công, tải lại dữ liệu.');
            this.loadAttempts();
          },
          error: (err) => {
            this.notification.error('Lỗi', 'Xóa lần thử nói thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
            console.error('UserSpeakingAttemptsComponent: Lỗi xóa lần thử nói:', err);
          }
        });
      }
    });
  }

  /**
   * Mở modal chỉnh sửa và điền dữ liệu của lần thử nói vào form.
   * @param attempt Lần thử nói cần chỉnh sửa.
   */
  openEditModal(attempt: UserSpeakingAttempt): void {
    console.log('UserSpeakingAttemptsComponent: openEditModal - Mở modal sửa cho lần thử:', attempt.attemptId);
    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền chỉnh sửa lần thử nói.');
      return;
    }

    this.currentAttemptId = attempt.attemptId || null;
    this.editForm.patchValue({
      userId: attempt.userId,
      practiceActivityId: attempt.practiceActivityId,
      userAudioUrl: attempt.userAudioUrl,
      userTranscribedBySTT: attempt.userTranscribedBySTT,
      pronunciationScore: attempt.pronunciationScore,
      fluencyScore: attempt.fluencyScore,
      overallScore: attempt.overallScore
    });
    this.isVisibleEditModal = true;
  }

  /**
   * Xử lý khi người dùng nhấn OK trên modal sửa.
   */
  handleEditOk(): void {
    console.log('UserSpeakingAttemptsComponent: handleEditOk - Xử lý lưu chỉnh sửa.');
    if (!this.currentAttemptId) {
      this.notification.error('Lỗi', 'Không tìm thấy ID lần thử nói để cập nhật.');
      return;
    }

    if (this.editForm.valid) {
      this.isEditLoading = true;
      const request: UserSpeakingAttemptRequest = this.editForm.value;
      console.log('UserSpeakingAttemptsComponent: Yêu cầu cập nhật:', request);

      this.speakingAttemptService.updateSpeakingAttempt(this.currentAttemptId, request).pipe(
        finalize(() => {
          this.isEditLoading = false;
        })
      ).subscribe({
        next: (updatedAttempt) => {
          this.notification.success('Thành công', 'Lần thử nói đã được cập nhật!');
          console.log('UserSpeakingAttemptsComponent: Cập nhật thành công:', updatedAttempt);
          this.isVisibleEditModal = false;
          this.loadAttempts(); // Tải lại dữ liệu để hiển thị thay đổi
        },
        error: (err) => {
          this.notification.error('Lỗi', 'Cập nhật lần thử nói thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
          console.error('UserSpeakingAttemptsComponent: Lỗi cập nhật lần thử nói:', err);
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
    console.log('UserSpeakingAttemptsComponent: handleEditCancel - Hủy chỉnh sửa.');
    this.isVisibleEditModal = false;
    this.editForm.reset();
    this.currentAttemptId = null;
  }

  /**
   * Mở modal thêm mới lần thử nói.
   */
  openCreateModal(): void {
    console.log('UserSpeakingAttemptsComponent: openCreateModal - Mở modal thêm mới.');
    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền thêm mới lần thử nói.');
      return;
    }
    this.createForm.reset(); // Đảm bảo form sạch khi mở
    this.isVisibleCreateModal = true;
  }

  /**
   * Xử lý khi người dùng nhấn OK trên modal thêm mới.
   */
  handleCreateOk(): void {
    console.log('UserSpeakingAttemptsComponent: handleCreateOk - Xử lý lưu tạo mới.');
    if (this.createForm.valid) {
      this.isCreateLoading = true;
      const request: UserSpeakingAttemptRequest = this.createForm.value;
      console.log('UserSpeakingAttemptsComponent: Yêu cầu tạo mới:', request);

      this.speakingAttemptService.saveSpeakingAttempt(request).pipe(
        finalize(() => {
          this.isCreateLoading = false;
        })
      ).subscribe({
        next: (newAttempt) => {
          this.notification.success('Thành công', 'Lần thử nói mới đã được thêm!');
          console.log('UserSpeakingAttemptsComponent: Thêm mới thành công:', newAttempt);
          this.isVisibleCreateModal = false;
          this.loadAttempts(); // Tải lại dữ liệu để hiển thị lần thử mới
        },
        error: (err) => {
          this.notification.error('Lỗi', 'Thêm mới lần thử nói thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
          console.error('UserSpeakingAttemptsComponent: Lỗi thêm mới lần thử nói:', err);
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
    console.log('UserSpeakingAttemptsComponent: handleCreateCancel - Hủy thêm mới.');
    this.isVisibleCreateModal = false;
    this.createForm.reset();
  }

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
    console.log('UserSpeakingAttemptsComponent: onQueryParamsChange - params từ bảng:', { pageIndex, pageSize });

    // Chuyển đổi pageIndex từ 1-based (NzTable) sang 0-based (Backend)
    const newPage = (pageIndex !== undefined && pageIndex > 0) ? (pageIndex - 1) : 0;
    const newSize = (pageSize !== undefined && pageSize > 0) ? pageSize : 10;

    // Kiểm tra nếu không phải lần tải ban đầu và không có sự thay đổi page/size thì không gọi lại API
    // Điều kiện !isNaN(pageIndex) để tránh lỗi khi pageIndex là NaN (có thể xảy ra trong một số trường hợp khởi tạo)
    if (this.initialLoadComplete && !isNaN(pageIndex) && newPage === this.pageData.page && newSize === this.pageData.size) {
      console.log('UserSpeakingAttemptsComponent: onQueryParamsChange - Không có thay đổi page/size, bỏ qua tải lại.');
      return;
    }

    // Cập nhật pageData và gọi tải dữ liệu
    this.pageData.page = newPage;
    this.pageData.size = newSize;
    console.log('UserSpeakingAttemptsComponent: pageData.page (0-based) =', this.pageData.page);
    console.log('UserSpeakingAttemptsComponent: pageData.size =', this.pageData.size);
    this.loadAttempts();
  }
}
