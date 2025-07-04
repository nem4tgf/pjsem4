import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
// Thêm import này vào đây
import { NzTableSortOrder } from 'ng-zorro-antd/table';
import {
  Flashcard,
  UserFlashcardRequest,
  FlashcardSearchRequest,
  FlashcardPageResponse,
  FlashcardSet,
  FlashcardSetRequest
} from 'src/app/interface/flashcard.interface';
import { DifficultyLevel } from 'src/app/interface/vocabulary.interface';
import { FlashcardService } from 'src/app/service/flashcard.service';
import { FlashcardSetService } from 'src/app/service/flashcard-set.service';
import { ApiService } from 'src/app/service/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { User } from 'src/app/interface/user.interface';

@Component({
  selector: 'app-flashcards',
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.css']
})
export class FlashcardsComponent implements OnInit {
  flashcards: Flashcard[] = [];
  flashcardSets: FlashcardSet[] = [];
  currentUserId: number | null = null;
  searchForm: FormGroup;
  pageData: FlashcardPageResponse = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };
  isLoading: boolean = false;
  hasUserLoaded: boolean = false;

  isFlashcardSetModalVisible: boolean = false;
  flashcardSetForm: FormGroup;
  isSavingFlashcardSet: boolean = false;
  currentEditingSet: FlashcardSet | null = null;

  readonly DifficultyLevel = DifficultyLevel;
  difficultyLevels: { label: string; value: DifficultyLevel | null }[] = [
    { label: 'Tất cả độ khó', value: null },
    { label: 'Dễ', value: DifficultyLevel.EASY },
    { label: 'Trung bình', value: DifficultyLevel.MEDIUM },
    { label: 'Khó', value: DifficultyLevel.HARD },
  ];

  constructor(
    private flashcardService: FlashcardService,
    private flashcardSetService: FlashcardSetService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private apiService: ApiService,
    private modal: NzModalService
  ) {
    this.searchForm = this.fb.group({
      setId: [null],
      word: [''],
      meaning: [''],
      isKnown: [null],
      difficultyLevel: [null],
      page: [0],
      size: [10],
      sortBy: ['wordId'],
      sortDir: ['ASC']
    });
    console.log('[FlashcardsComponent] Initialized. Initial searchForm value:', this.searchForm.value);

    this.flashcardSetForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    console.log('[FlashcardsComponent] ngOnInit started.');
    this.isLoading = true;
    this.hasUserLoaded = false;

    this.loadInitialData();
  }

  private loadInitialData(): void {
    forkJoin([
      this.apiService.getCurrentUser(),
      this.flashcardSetService.getAllFlashcardSets()
    ]).pipe(
      finalize(() => {
        this.isLoading = false;
        console.log('[FlashcardsComponent] forkJoin finalize. isLoading set to false.');
      })
    ).subscribe({
      next: ([user, sets]: [User, FlashcardSet[]]) => {
        console.log('[FlashcardsComponent] User response:', user);
        console.log('[FlashcardsComponent] Flashcard sets response:', sets);

        if (user && user.userId !== undefined && user.userId !== null) {
          this.currentUserId = user.userId;
          this.hasUserLoaded = true;
          console.log('[FlashcardsComponent] currentUserId set:', this.currentUserId);
        } else {
          this.notification.error('Lỗi', 'Không thể xác định ID người dùng. Vui lòng đăng nhập lại.');
          console.error('[FlashcardsComponent] Error: currentUserId is undefined or null. User object:', user);
          return;
        }

        this.flashcardSets = sets || [];
        console.log('[FlashcardsComponent] flashcardSets assigned. Length:', this.flashcardSets.length);

        if (this.flashcardSets.length > 0) {
          const currentSetId = this.searchForm.get('setId')?.value;
          const isCurrentSetIdValid = this.flashcardSets.some(set => set.setId === currentSetId);

          if (currentSetId === null || !isCurrentSetIdValid) {
            this.searchForm.patchValue({ setId: this.flashcardSets[0].setId });
            console.log('[FlashcardsComponent] setId patched to first available set:', this.flashcardSets[0].setId);
          } else {
            console.log('[FlashcardsComponent] Current setId is valid or already set:', currentSetId);
          }
        } else {
          this.notification.info('Thông báo', 'Không có bộ flashcard nào được tìm thấy. Vui lòng tạo bộ flashcard mới để quản lý theo bộ.');
          this.searchForm.patchValue({ setId: null });
          console.log('[FlashcardsComponent] No flashcard sets found, setId set to null.');
        }

        if (this.currentUserId) {
          this.searchFlashcards();
        } else {
          console.warn('[FlashcardsComponent] Cannot search flashcards. User ID is not available after loadInitialData.');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.logAndNotifyError(
          'Lỗi tải dữ liệu khởi tạo',
          'Không thể tải thông tin người dùng hoặc danh sách bộ flashcard. Vui lòng kiểm tra kết nối hoặc đăng nhập lại.',
          err
        );
        this.hasUserLoaded = false;
      }
    });
  }

  getNoResultText(): string {
    if (this.isLoading) {
      return 'Đang tải...';
    }
    if (!this.hasUserLoaded) {
      return 'Không thể tải thông tin người dùng. Vui lòng đăng nhập.';
    }
    if (this.flashcards.length === 0) {
      const selectedSetId = this.searchForm.get('setId')?.value;
      if (selectedSetId === null || selectedSetId === undefined) {
        if (this.flashcardSets.length === 0) {
          return '📌 Không có bộ flashcard nào. Vui lòng tạo bộ mới để bắt đầu.';
        }
        return '📭 Không tìm thấy flashcard nào phù hợp với bộ lọc hiện tại.';
      }
      return '📭 Không tìm thấy flashcard nào trong bộ đã chọn.';
    }
    return '';
  }

  searchFlashcards(): void {
    console.log('[FlashcardsComponent] searchFlashcards called.');

    if (!this.currentUserId) {
      this.notification.error('Lỗi', 'Người dùng chưa được xác định. Vui lòng đăng nhập lại.');
      console.warn('[FlashcardsComponent] searchFlashcards aborted: currentUserId is null.');
      return;
    }

    this.isLoading = true;
    const rawRequest = this.searchForm.value;

    const request: FlashcardSearchRequest = {
      userId: this.currentUserId,
      setId: rawRequest.setId !== null ? rawRequest.setId : undefined,
      word: rawRequest.word ? rawRequest.word : undefined,
      meaning: rawRequest.meaning ? rawRequest.meaning : undefined,
      isKnown: rawRequest.isKnown !== null ? rawRequest.isKnown : undefined,
      difficultyLevel: rawRequest.difficultyLevel !== null ? rawRequest.difficultyLevel : undefined,
      page: rawRequest.page || 0,
      size: rawRequest.size || 10,
      sortBy: rawRequest.sortBy || 'wordId',
      sortDir: rawRequest.sortDir || 'ASC'
    };

    Object.keys(request).forEach(key => {
      if (request[key as keyof FlashcardSearchRequest] === undefined || request[key as keyof FlashcardSearchRequest] === '') {
        delete request[key as keyof FlashcardSearchRequest];
      }
    });

    console.log('[FlashcardsComponent] Search request sent to backend (sanitized):', request);

    this.flashcardService.searchFlashcards(request).pipe(
      finalize(() => {
        this.isLoading = false;
        console.log('[FlashcardsComponent] searchFlashcards finalize. isLoading set to false.');
      })
    ).subscribe({
      next: (pageData) => {
        console.log('[FlashcardsComponent] searchFlashcards success. Raw pageData:', pageData);
        this.pageData = pageData || { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };
        this.flashcards = pageData.content || [];
        console.log('[FlashcardsComponent] Updated flashcards array length:', this.flashcards.length);

        if (this.flashcards.length === 0 && !this.isLoading && this.hasUserLoaded) {
          this.notification.info('Thông báo', this.getNoResultText());
        }
      },
      error: (err: HttpErrorResponse) => {
        this.logAndNotifyError(
          'Lỗi tải Flashcards',
          'Không thể tải danh sách flashcard. Vui lòng kiểm tra kết nối hoặc thử lại sau.',
          err
        );
        this.flashcards = [];
        this.pageData = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };
        console.log('[FlashcardsComponent] Flashcards and pageData reset due to search error.');
      }
    });
  }

  onPageChange(page: number): void {
    console.log('[FlashcardsComponent] Page changed to:', page);
    this.searchForm.patchValue({ page: page - 1 });
    this.searchFlashcards();
  }

  onSizeChange(size: number): void {
    console.log('[FlashcardsComponent] Page size changed to:', size);
    this.searchForm.patchValue({ size, page: 0 });
    this.searchFlashcards();
  }

  // >>>>>> ĐÂY LÀ PHẦN THAY ĐỔI QUAN TRỌNG NHẤT <<<<<<
  onSortChange(sortBy: string, sortDir: NzTableSortOrder): void {
    console.log('[FlashcardsComponent] Sort changed: sortBy=', sortBy, 'sortDir=', sortDir);
    let backendSortDir: 'ASC' | 'DESC'; // Không cần undefined hay null ở đây vì chúng ta sẽ chuyển đổi nó

    if (sortDir === 'ascend') {
      backendSortDir = 'ASC';
    } else if (sortDir === 'descend') {
      backendSortDir = 'DESC';
    } else {
      // Khi sortDir là undefined (tức là không sắp xếp), bạn có thể chọn mặc định là 'ASC'
      // hoặc giữ nguyên giá trị sắp xếp hiện tại nếu không muốn thay đổi thứ tự khi người dùng bỏ sắp xếp
      // Nếu bạn muốn bỏ sắp xếp hoàn toàn, bạn sẽ cần một logic khác để xóa sortBy và sortDir khỏi request.
      // Tuy nhiên, theo yêu cầu của bạn, tôi sẽ giả định mặc định là 'ASC' khi không có sắp xếp.
      backendSortDir = 'ASC';
    }

    this.searchForm.patchValue({
      sortBy,
      sortDir: backendSortDir,
      page: 0 // Reset về trang đầu tiên khi sắp xếp
    });
    console.log('[FlashcardsComponent] Updated searchForm with sort:', this.searchForm.value);
    this.searchFlashcards();
  }
  // >>>>>> HẾT PHẦN THAY ĐỔI QUAN TRỌNG NHẤT <<<<<<

  toggleIsKnown(flashcard: Flashcard, isKnown: boolean): void {
    console.log(`[FlashcardsComponent] Toggling isKnown for wordId: ${flashcard.wordId} to ${isKnown}`);
    if (!this.currentUserId) {
      this.notification.error('Lỗi', 'Người dùng chưa được xác định. Vui lòng đăng nhập lại.');
      console.warn('[FlashcardsComponent] toggleIsKnown aborted: currentUserId is null.');
      return;
    }

    const request: UserFlashcardRequest = {
      userId: this.currentUserId,
      wordId: flashcard.wordId,
      isKnown
    };

    this.flashcardService.createUserFlashcard(request).subscribe({
      next: (updatedFlashcard) => {
        console.log('[FlashcardsComponent] Flashcard updated successfully:', updatedFlashcard);
        this.notification.success('Thành công', `Flashcard "${updatedFlashcard.word || 'N/A'}" đã được đánh dấu là ${isKnown ? 'Đã biết' : 'Chưa biết'}.`);
        const index = this.flashcards.findIndex(f => f.userFlashcardId === updatedFlashcard.userFlashcardId);
        if (index > -1) {
          this.flashcards[index] = updatedFlashcard;
          console.log('[FlashcardsComponent] Flashcard updated in local array at index:', index);
        } else {
          console.warn('[FlashcardsComponent] userFlashcardId not found in local array or new flashcard. Reloading flashcards.');
          this.searchFlashcards();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.logAndNotifyError(
          'Lỗi cập nhật Flashcard',
          `Không thể đánh dấu flashcard "${flashcard.word || 'N/A'}". Vui lòng thử lại.`,
          err
        );
      }
    });
  }

  resetFilters(): void {
    console.log('[FlashcardsComponent] resetFilters called.');
    this.searchForm.reset({
      setId: null,
      word: '',
      meaning: '',
      isKnown: null,
      difficultyLevel: null,
      page: 0,
      size: 10,
      sortBy: 'wordId',
      sortDir: 'ASC'
    });
    console.log('[FlashcardsComponent] Search form reset. New value:', this.searchForm.value);
    this.searchFlashcards();
  }

  openFlashcardSetModal(set?: FlashcardSet): void {
    this.currentEditingSet = set || null;
    if (set) {
      this.flashcardSetForm.patchValue({
        title: set.title,
        description: set.description || ''
      });
      console.log('[FlashcardsComponent] Opening modal for editing set:', set);
    } else {
      this.flashcardSetForm.reset();
      console.log('[FlashcardsComponent] Opening modal for creating new set.');
    }
    this.isFlashcardSetModalVisible = true;
  }

  handleFlashcardSetModalOk(): void {
    if (!this.currentUserId) {
      this.notification.error('Lỗi', 'Người dùng chưa được xác định. Vui lòng đăng nhập lại.');
      return;
    }

    for (const i in this.flashcardSetForm.controls) {
      if (this.flashcardSetForm.controls.hasOwnProperty(i)) {
        this.flashcardSetForm.controls[i].markAsDirty();
        this.flashcardSetForm.controls[i].updateValueAndValidity();
      }
    }

    if (this.flashcardSetForm.valid) {
      this.isSavingFlashcardSet = true;
      const formValue = this.flashcardSetForm.value;

      const request: FlashcardSetRequest = {
        title: formValue.title,
        description: formValue.description,
        creatorUserId: this.currentUserId,
        isSystemCreated: false,
        wordIds: []
      };

      if (request.description === '' || request.description === undefined) {
        delete request.description;
      }

      let operation: Observable<FlashcardSet>;
      let successMessage: string;
      let errorMessageTitle: string;

      if (this.currentEditingSet && this.currentEditingSet.setId) {
        operation = this.flashcardSetService.updateFlashcardSet(this.currentEditingSet.setId, request);
        successMessage = `Bộ flashcard "${request.title}" đã được cập nhật thành công!`;
        errorMessageTitle = 'Lỗi cập nhật bộ Flashcard';
        console.log('[FlashcardsComponent] Submitting update request for set:', request);
      } else {
        operation = this.flashcardSetService.createFlashcardSet(request);
        successMessage = `Bộ flashcard "${request.title}" đã được tạo thành công!`;
        errorMessageTitle = 'Lỗi tạo bộ Flashcard';
        console.log('[FlashcardsComponent] Submitting create request for set:', request);
      }

      operation.pipe(
        finalize(() => {
          this.isSavingFlashcardSet = false;
          console.log('[FlashcardsComponent] Flashcard set operation finalized.');
        })
      ).subscribe({
        next: (res) => {
          this.notification.success('Thành công', successMessage);
          this.isFlashcardSetModalVisible = false;
          this.loadInitialData();
        },
        error: (err: HttpErrorResponse) => {
          this.logAndNotifyError(errorMessageTitle, 'Không thể thực hiện thao tác với bộ flashcard. Vui lòng thử lại.', err);
        }
      });
    } else {
      this.notification.warning('Cảnh báo', 'Vui lòng điền đầy đủ và đúng thông tin bắt buộc.');
    }
  }

  handleFlashcardSetModalCancel(): void {
    this.isFlashcardSetModalVisible = false;
    this.flashcardSetForm.reset();
    this.currentEditingSet = null;
    console.log('[FlashcardsComponent] Flashcard set modal cancelled and form reset.');
  }

  confirmDeleteFlashcardSet(set: FlashcardSet): void {
    if (!set.setId) {
      this.notification.error('Lỗi', 'ID bộ flashcard không hợp lệ. Không thể xóa.');
      return;
    }
    this.modal.confirm({
      nzTitle: `Bạn có chắc chắn muốn xóa bộ flashcard "${set.title}" không?`,
      nzContent: 'Thao tác này sẽ xóa vĩnh viễn bộ flashcard và không thể hoàn tác.',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzCancelText: 'Hủy',
      nzOnOk: () => this.deleteFlashcardSet(set.setId!)
    });
  }

  deleteFlashcardSet(setId: number): void {
    if (!this.currentUserId) {
      this.notification.error('Lỗi', 'Người dùng chưa được xác định. Vui lòng đăng nhập lại.');
      return;
    }

    this.isLoading = true;
    this.flashcardSetService.deleteFlashcardSet(setId).pipe(
      finalize(() => {
        this.isLoading = false;
        console.log('[FlashcardsComponent] Delete flashcard set operation finalized.');
      })
    ).subscribe({
      next: () => {
        this.notification.success('Thành công', 'Bộ flashcard đã được xóa thành công!');
        this.loadInitialData();
      },
      error: (err: HttpErrorResponse) => {
        this.logAndNotifyError('Lỗi xóa bộ Flashcard', 'Không thể xóa bộ flashcard. Vui lòng thử lại.', err);
      }
    });
  }

  getDifficultyTagColor(level: DifficultyLevel | null | undefined): string {
    switch (level) {
      case DifficultyLevel.EASY:
        return 'blue';
      case DifficultyLevel.MEDIUM:
        return 'orange';
      case DifficultyLevel.HARD:
        return 'red';
      default:
        return 'default';
    }
  }

  getDifficultyLabel(level: DifficultyLevel | null | undefined): string {
    const foundLevel = this.difficultyLevels.find(d => d.value === level);
    return foundLevel ? foundLevel.label : 'N/A';
  }

  getIsKnownIcon(isKnown: boolean | null | undefined): string {
    return isKnown ? 'check' : 'close';
  }

  getIsKnownLabel(isKnown: boolean | null | undefined): string {
    return isKnown ? 'Đã biết' : 'Chưa biết';
  }

  private logAndNotifyError(title: string, defaultMessage: string, error: HttpErrorResponse): void {
    let errorMessage = defaultMessage;
    console.error(`--- ERROR: ${title} ---`);
    console.error('Timestamp:', new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
    console.error('Status:', error.status);
    console.error('Status Text:', error.statusText);
    console.error('Message:', error.message);
    console.error('URL:', error.url);
    if (error.error) {
      console.error('Backend Error Body:', error.error);
      if (typeof error.error === 'string') {
        try {
          const parsedError = JSON.parse(error.error);
          errorMessage = `Server: ${parsedError.message || parsedError.error || error.error}`;
        } catch (e) {
          errorMessage = `Server: ${error.error}`;
        }
      } else if (error.error.message) {
        errorMessage = `Server: ${error.error.message}`;
      } else if (error.error.error) {
        errorMessage = `Server: ${error.error.error}`;
      }
    }
    console.error('Full Error Object:', error);
    console.error('--- End Error Log ---');

    if (error.status === 0) {
      errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    } else if (error.status === 401) {
      errorMessage = 'Không được ủy quyền. Vui lòng đăng nhập lại.';
    } else if (error.status === 404) {
      errorMessage = 'Tài nguyên không tìm thấy. Vui lòng liên hệ hỗ trợ.';
    } else if (error.status === 400) {
      errorMessage = 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu nhập.';
    } else if (error.status >= 500) {
      errorMessage = `Lỗi máy chủ nội bộ (${error.status}). Vui lòng thử lại sau.`;
    }

    this.notification.error(title, errorMessage);
  }
}
