import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Flashcard, MarkFlashcardRequest, FlashcardSearchRequest, FlashcardPage } from 'src/app/interface/flashcard.interface';
import { Lesson } from 'src/app/interface/lesson.interface';
import { FlashcardService } from 'src/app/service/flashcard.service';
import { LessonService } from 'src/app/service/lesson.service';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-flashcards',
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.css']
})
export class FlashcardsComponent implements OnInit {
  flashcards: Flashcard[] = [];
  lessons: Lesson[] = [];
  currentUserId: number | null = null;
  searchForm: FormGroup;
  pageData: FlashcardPage = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };

  constructor(
    private flashcardService: FlashcardService,
    private lessonService: LessonService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private apiService: ApiService
  ) {
    this.searchForm = this.fb.group({
      lessonId: [null],
      word: [''],
      meaning: [''],
      isKnown: [null],
      difficultyLevel: [null],
      page: [0],
      size: [10],
      sortBy: ['wordId'],
      sortDir: ['ASC']
    });
  }

  ngOnInit(): void {
    this.loadLessons();
    this.apiService.getCurrentUser().subscribe({
      next: (user) => {
        if (user?.userId) {
          this.currentUserId = user.userId;
          // Gọi searchFlashcards() sau khi có userId và sau khi loadLessons() có thể đã chọn lessonId đầu tiên
          // Tuy nhiên, việc gọi lại searchFlashcards ở đây sẽ đảm bảo dữ liệu được tải ngay cả khi không có bài học nào
          this.searchFlashcards();
        } else {
          this.notification.error('Lỗi', 'Không tìm thấy ID người dùng. Vui lòng đăng nhập.');
        }
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể lấy thông tin người dùng hiện tại.');
        console.error(err);
      }
    });
  }

  loadLessons(): void {
    this.lessonService.getAllLessons().subscribe({
      next: (lessons: Lesson[]) => {
        this.lessons = lessons;
        // Tùy chọn: nếu có bài học, chọn bài học đầu tiên làm mặc định
        if (lessons.length > 0 && this.searchForm.get('lessonId')?.value === null) {
          this.searchForm.patchValue({ lessonId: lessons[0].lessonId });
          // Không gọi searchFlashcards ở đây để tránh gọi 2 lần nếu ngOnInit cũng gọi
          // searchFlashcards sẽ được gọi một lần duy nhất sau khi có currentUserId
        } else if (lessons.length === 0) {
          this.notification.info('Thông báo', 'Không có bài học nào được tìm thấy.');
        }
      },
      error: () => {
        this.notification.error('Lỗi', 'Không thể tải danh sách bài học');
      }
    });
  }

  searchFlashcards(): void {
    if (!this.currentUserId) {
      this.notification.error('Lỗi', 'Người dùng chưa được xác định.');
      return;
    }
    const request: FlashcardSearchRequest = this.searchForm.value;
    this.flashcardService.searchFlashcards(this.currentUserId, request).subscribe({
      next: (pageData) => {
        this.pageData = pageData;
        this.flashcards = pageData.content;
      },
      error: () => {
        this.notification.error('Lỗi', 'Không thể tải flashcards');
      }
    });
  }

  onPageChange(page: number): void {
    this.searchForm.patchValue({ page: page - 1 });
    this.searchFlashcards();
  }

  onSizeChange(size: number): void {
    this.searchForm.patchValue({ size, page: 0 });
    this.searchFlashcards();
  }

  onSortChange(sortBy: string, sortDir: 'ASC' | 'DESC'): void {
    this.searchForm.patchValue({ sortBy, sortDir, page: 0 });
    this.searchFlashcards();
  }

  toggleIsKnown(flashcard: Flashcard, isKnown: boolean): void {
    if (!this.currentUserId) {
      this.notification.error('Lỗi', 'Người dùng chưa được xác định.');
      return;
    }
    const request: MarkFlashcardRequest = {
      userId: this.currentUserId,
      wordId: flashcard.wordId,
      isKnown
    };
    this.flashcardService.markFlashcard(request).subscribe({
      next: () => {
        this.notification.success('Thành công', `Flashcard đã được đánh dấu là ${isKnown ? 'Đã biết' : 'Chưa biết'}.`);
        flashcard.isKnown = isKnown; // Cập nhật trạng thái ngay lập tức trên UI
      },
      error: () => {
        this.notification.error('Lỗi', 'Không thể đánh dấu flashcard.');
      }
    });
  }

  /**
   * Đặt lại tất cả các bộ lọc tìm kiếm về trạng thái mặc định
   * và tải lại danh sách flashcards.
   */
  resetFilters(): void {
    this.searchForm.reset({
      lessonId: null, // Đặt về null để cho phép chọn lại
      word: '',
      meaning: '',
      isKnown: null,
      difficultyLevel: null,
      page: 0,
      size: 10,
      sortBy: 'wordId',
      sortDir: 'ASC'
    });

    // Nếu có lessons, chọn lessonId đầu tiên làm mặc định sau khi reset
    if (this.lessons.length > 0) {
      this.searchForm.patchValue({ lessonId: this.lessons[0].lessonId });
    }
    this.searchFlashcards(); // Tải lại flashcards với bộ lọc đã reset
  }
}
