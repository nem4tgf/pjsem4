import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import FormGroup và Validators
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';

// Đảm bảo các interface này đúng đường dẫn và cấu trúc
import { Vocabulary, DifficultyLevel } from 'src/app/interface/vocabulary.interface';
import { LessonVocabulary } from 'src/app/interface/lesson-vocabulary.interface';

// Đảm bảo các service này đúng đường dẫn
import { LessonVocabularyService } from 'src/app/service/lesson-vocabulary.service';
import { VocabularyService } from 'src/app/service/vocabulary.service';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-lesson-vocabulary',
  templateUrl: './lesson-vocabulary.component.html',
  styleUrls: ['./lesson-vocabulary.component.css']
})
export class LessonVocabularyComponent implements OnInit {
  @Input() lessonId: number | null = null;
  lessonVocabularies: Vocabulary[] = []; // Chứa các từ vựng đã được gán cho bài học (để hiển thị)
  allVocabularies: Vocabulary[] = [];   // Chứa TẤT CẢ các từ vựng có sẵn (để chọn trong dropdown)
  isAddModalVisible = false;            // Biến kiểm soát hiển thị modal thêm từ vựng
  vocabularyForm: FormGroup;             // FormGroup cho form thêm từ vựng
  isAdmin: boolean = false;              // Biến kiểm tra quyền admin

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder, // Inject FormBuilder
    private modal: NzModalService,
    private notification: NzNotificationService,
    private lessonVocabularyService: LessonVocabularyService,
    private vocabularyService: VocabularyService,
    private apiService: ApiService
  ) {
    // Khởi tạo FormGroup cho form thêm từ vựng
    this.vocabularyForm = this.fb.group({
      wordId: [null, Validators.required] // 'wordId' là FormControlName trong HTML, bắt buộc phải chọn
    });
  }

  ngOnInit(): void {
    // Lấy lessonId từ URL params
    this.route.paramMap.subscribe(params => {
      const id = params.get('lessonId');
      if (id) {
        this.lessonId = +id; // Chuyển đổi sang số
        console.log('Lesson ID from route:', this.lessonId);
        this.checkRoleAndLoadData(); // Gọi hàm kiểm tra quyền và tải dữ liệu
      } else {
        this.notification.error('Error', 'Lesson ID is missing in the URL.');
        console.error('Lesson ID is missing in the URL for LessonVocabularyComponent.');
      }
    });
  }

  private checkRoleAndLoadData(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        if (this.isAdmin && this.lessonId) {
          // Chỉ tải dữ liệu nếu là admin và có lessonId
          this.loadAllVocabularies(); // Tải tất cả từ vựng trước (cho dropdown)
          this.loadLessonVocabularies(); // Sau đó tải các từ vựng của bài học này
        } else if (!this.isAdmin) {
          this.notification.warning('Warning', 'You do not have administrative privileges to manage lesson vocabulary.');
        }
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to verify admin role.');
        console.error('Admin role check error:', err);
      }
    });
  }

  loadLessonVocabularies(): void {
    if (this.lessonId) {
      // Gọi service để lấy danh sách LessonVocabulary (chỉ chứa lessonId, wordId)
      this.lessonVocabularyService.getLessonVocabulariesByLessonId(this.lessonId).subscribe({
        next: (data: LessonVocabulary[]) => {
          // Chuyển đổi LessonVocabulary[] thành Vocabulary[] để hiển thị đầy đủ thông tin
          // bằng cách tìm kiếm trong danh sách allVocabularies đã tải
          this.lessonVocabularies = data.map(lv => {
            const fullVocab = this.allVocabularies.find(v => v.wordId === lv.wordId);
            return fullVocab
              ? fullVocab
              : {
                  // Cung cấp các giá trị mặc định nếu không tìm thấy thông tin chi tiết
                  wordId: lv.wordId,
                  word: 'N/A',
                  meaning: 'N/A',
                  difficultyLevel: DifficultyLevel.EASY // Gán một giá trị hợp lệ từ enum
                };
          });
          console.log('Loaded lesson vocabularies:', this.lessonVocabularies);
        },
        error: (err) => {
          this.notification.error('Error', 'Failed to load lesson vocabularies');
          console.error('Load lesson vocabularies error:', err);
        }
      });
    }
  }

  loadAllVocabularies(): void {
    // Gọi service để lấy TẤT CẢ các từ vựng có sẵn (cho dropdown chọn)
    this.vocabularyService.getAllVocabulary().subscribe({
      next: (data: Vocabulary[]) => { // Đảm bảo kiểu dữ liệu trả về là Vocabulary[]
        this.allVocabularies = data;
        console.log('Loaded all vocabularies for selection:', this.allVocabularies); // KIỂM TRA LOG NÀY
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to load all vocabularies');
        console.error('Load all vocabularies error:', err);
      }
    });
  }

  showAddModal(): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to add vocabulary.');
      return;
    }
    this.vocabularyForm.reset(); // Đảm bảo form được reset mỗi khi mở modal
    this.isAddModalVisible = true;
  }

  handleAddOk(): void {
    console.log('Current form value:', this.vocabularyForm.value); // LOG GIÁ TRỊ FORM TRƯỚC KHI XỬ LÝ
    if (this.vocabularyForm.invalid) {
      this.vocabularyForm.markAllAsTouched(); // Hiển thị lỗi validation trên form
      this.notification.error('Error', 'Please select a vocabulary to add.');
      console.error('Form is invalid. Errors:', this.vocabularyForm.errors); // LOG LỖI FORM NẾU CÓ
      return;
    }

    if (this.lessonId === null) {
      this.notification.error('Error', 'Lesson ID is missing. Cannot add vocabulary.');
      return;
    }

    const wordIdToAdd = this.vocabularyForm.get('wordId')?.value;
    console.log('Word ID to add from form:', wordIdToAdd); // LOG wordId TRƯỚC KHI GỌI SERVICE

    // Kiểm tra lại nếu wordIdToAdd vẫn là null/undefined sau khi lấy từ form
    if (wordIdToAdd === null || wordIdToAdd === undefined) {
      this.notification.error('Error', 'No vocabulary selected or invalid selection.');
      return;
    }

    // Kiểm tra xem từ vựng đã có trong bài học chưa
    const isAlreadyAdded = this.lessonVocabularies.some(v => v.wordId === wordIdToAdd);
    if (isAlreadyAdded) {
      this.notification.warning('Warning', 'This vocabulary is already added to this lesson.');
      this.handleCancel(); // Đóng modal và reset form
      return;
    }

    // Gọi service để thêm từ vựng vào bài học
    this.lessonVocabularyService.createLessonVocabulary(this.lessonId, wordIdToAdd).subscribe({
      next: () => {
        this.notification.success('Success', 'Vocabulary added to lesson successfully!');
        this.loadLessonVocabularies(); // Tải lại danh sách từ vựng của bài học sau khi thêm
        this.isAddModalVisible = false; // Đóng modal
        this.vocabularyForm.reset(); // Reset form
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to add vocabulary to lesson: ' + (err.error?.message || err.message));
        console.error('Add vocabulary to lesson error:', err);
      }
    });
  }

  handleCancel(): void {
    this.isAddModalVisible = false; // Đóng modal
    this.vocabularyForm.reset(); // Reset form khi hủy
  }

  deleteVocabularyFromLesson(wordId: number): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to delete vocabulary.');
      return;
    }
    if (this.lessonId === null) {
      this.notification.error('Error', 'Lesson ID is missing. Cannot delete vocabulary.');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Are you sure you want to remove this vocabulary from the lesson?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        this.lessonVocabularyService.deleteLessonVocabulary(this.lessonId!, wordId).subscribe({
          next: () => {
            this.notification.success('Success', 'Vocabulary removed from lesson successfully!');
            this.loadLessonVocabularies(); // Tải lại danh sách từ vựng sau khi xóa
          },
          error: (err) => {
            this.notification.error('Error', 'Failed to remove vocabulary from lesson: ' + (err.error?.message || err.message));
            console.error('Remove vocabulary from lesson error:', err);
          }
        });
      }
    });
  }
}
