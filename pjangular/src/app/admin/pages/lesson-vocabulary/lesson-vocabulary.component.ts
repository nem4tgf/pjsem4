
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Vocabulary, DifficultyLevel } from 'src/app/interface/vocabulary.interface';
import { LessonVocabularyResponse } from 'src/app/interface/lesson-vocabulary.interface';
import { LessonVocabularyService } from 'src/app/service/lesson-vocabulary.service';
import { VocabularyService } from 'src/app/service/vocabulary.service';
import { ApiService } from 'src/app/service/api.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-lesson-vocabulary',
  templateUrl: './lesson-vocabulary.component.html',
  styleUrls: ['./lesson-vocabulary.component.css']
})
export class LessonVocabularyComponent implements OnInit {
  @Input() lessonId: number | null = null;
  lessonVocabularies: Vocabulary[] = [];
  allVocabularies: Vocabulary[] = [];
  isAddModalVisible = false;
  vocabularyForm: FormGroup;
  isAdmin: boolean = false;
  isLoadingVocabularies = false;
  isAddingVocabulary = false;

  // Thêm hàm lọc tùy chỉnh
  customFilterOption = (input: string, option: any): boolean => {
    return option.nzLabel.toLowerCase().includes(input.toLowerCase());
  };

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private lessonVocabularyService: LessonVocabularyService,
    private vocabularyService: VocabularyService,
    private apiService: ApiService
  ) {
    this.vocabularyForm = this.fb.group({
      wordId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.lessonId === null) {
      this.route.paramMap.subscribe(params => {
        const id = params.get('lessonId');
        if (id) {
          this.lessonId = +id;
          console.log('Lesson ID from route params:', this.lessonId);
          this.checkRoleAndLoadData();
        } else {
          this.notification.error('Lỗi', 'Không tìm thấy ID bài học trong URL.');
          console.error('Lesson ID is missing in the URL for LessonVocabularyComponent.');
        }
      });
    } else {
      console.log('Lesson ID from @Input:', this.lessonId);
      this.checkRoleAndLoadData();
    }
  }

  private checkRoleAndLoadData(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        if (this.isAdmin && this.lessonId !== null) {
          this.loadAllVocabularies();
        } else if (!this.isAdmin) {
          this.notification.warning('Cảnh báo', 'Bạn không có quyền quản trị để quản lý từ vựng bài học.');
        } else if (this.lessonId === null) {
          this.notification.error('Lỗi', 'Không có ID bài học để tải dữ liệu.');
        }
      },
      error: (err: any) => {
        this.notification.error('Lỗi', 'Không thể xác minh quyền quản trị.');
        console.error('Lỗi kiểm tra quyền Admin:', err);
      }
    });
  }

  loadLessonVocabularies(): void {
    if (this.lessonId === null) {
      this.notification.error('Lỗi', 'Không có ID bài học để tải từ vựng.');
      this.lessonVocabularies = [];
      return;
    }

    this.isLoadingVocabularies = true;
    this.lessonVocabularyService.getLessonVocabulariesByLessonId(this.lessonId).pipe(
      finalize(() => this.isLoadingVocabularies = false)
    ).subscribe({
      next: (data: LessonVocabularyResponse[]) => {
        this.lessonVocabularies = data
          .map(lv => this.allVocabularies.find(v => v.wordId === lv.wordId))
          .filter((vocab): vocab is Vocabulary => vocab !== undefined);
        console.log('Đã tải từ vựng bài học:', this.lessonVocabularies);
        if (this.lessonVocabularies.length === 0 && this.isAdmin) {
          this.notification.info('Thông báo', 'Bài học này chưa có từ vựng nào được gán.');
        }
      },
      error: (err: any) => {
        this.notification.error('Lỗi', 'Không thể tải từ vựng bài học.');
        console.error('Lỗi tải từ vựng bài học:', err);
        this.lessonVocabularies = [];
      }
    });
  }

  loadAllVocabularies(): void {
    this.vocabularyService.searchVocabularies().subscribe({
      next: (pageData) => {
        this.allVocabularies = pageData.content;
        console.log('Đã tải tất cả từ vựng để chọn:', this.allVocabularies);
        if (this.lessonId !== null) {
          this.loadLessonVocabularies();
        }
      },
      error: (err: any) => {
        this.notification.error('Lỗi', 'Không thể tải tất cả từ vựng.');
        console.error('Lỗi tải tất cả từ vựng:', err);
      }
    });
  }

  showAddModal(): void {
    if (!this.isAdmin) {
      this.notification.error('Lỗi', 'Bạn không có quyền thêm từ vựng.');
      return;
    }
    this.vocabularyForm.reset();
    this.isAddModalVisible = true;
  }

  handleAddOk(): void {
    if (this.vocabularyForm.invalid) {
      this.vocabularyForm.markAllAsTouched();
      this.notification.error('Lỗi', 'Vui lòng chọn một từ vựng để thêm.');
      return;
    }

    if (this.lessonId === null) {
      this.notification.error('Lỗi', 'Không có ID bài học. Không thể thêm từ vựng.');
      return;
    }

    const wordIdToAdd = this.vocabularyForm.get('wordId')?.value;
    if (wordIdToAdd === null || wordIdToAdd === undefined) {
      this.notification.error('Lỗi', 'Chưa chọn từ vựng hoặc lựa chọn không hợp lệ.');
      return;
    }

    const isAlreadyAdded = this.lessonVocabularies.some(v => v.wordId === wordIdToAdd);
    if (isAlreadyAdded) {
      this.notification.warning('Cảnh báo', 'Từ vựng này đã được thêm vào bài học.');
      this.handleCancel();
      return;
    }

    this.isAddingVocabulary = true;
    this.lessonVocabularyService.createLessonVocabulary(this.lessonId, wordIdToAdd).pipe(
      finalize(() => this.isAddingVocabulary = false)
    ).subscribe({
      next: () => {
        this.notification.success('Thành công', 'Từ vựng đã được thêm vào bài học!');
        this.loadLessonVocabularies();
        this.isAddModalVisible = false;
        this.vocabularyForm.reset();
      },
      error: (err: any) => {
        this.notification.error('Lỗi', 'Không thể thêm từ vựng vào bài học: ' + (err.error?.message || err.message));
        console.error('Lỗi thêm từ vựng vào bài học:', err);
      }
    });
  }

  handleCancel(): void {
    this.isAddModalVisible = false;
    this.vocabularyForm.reset();
  }

  deleteVocabularyFromLesson(wordId: number): void {
    if (!this.isAdmin) {
      this.notification.error('Lỗi', 'Bạn không có quyền xóa từ vựng.');
      return;
    }
    if (this.lessonId === null) {
      this.notification.error('Lỗi', 'Không có ID bài học. Không thể xóa từ vựng.');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa từ vựng này khỏi bài học?',
      nzContent: 'Hành động này không thể hoàn tác.',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.lessonVocabularyService.deleteLessonVocabulary(this.lessonId!, wordId).subscribe({
          next: () => {
            this.notification.success('Thành công', 'Từ vựng đã được xóa khỏi bài học!');
            this.loadLessonVocabularies();
          },
          error: (err: any) => {
            this.notification.error('Lỗi', 'Không thể xóa từ vựng khỏi bài học: ' + (err.error?.message || err.message));
            console.error('Lỗi xóa từ vựng khỏi bài học:', err);
          }
        });
      }
    });
  }

  get availableVocabularies(): Vocabulary[] {
    if (this.lessonId === null || !this.allVocabularies) {
      return [];
    }
    return this.allVocabularies.filter(
      vocab => !this.lessonVocabularies.some(lv => lv.wordId === vocab.wordId)
    );
  }
}

