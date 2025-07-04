
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { ApiService } from 'src/app/service/api.service';
import { LessonService } from 'src/app/service/lesson.service';
import { Router } from '@angular/router'; // <--- Import Router

import {
  Lesson,
  LessonPageResponse,
  LessonRequest,
  LessonSearchRequest,
  Level,
  Skill,
} from 'src/app/interface/lesson.interface';

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.css'],
})
export class LessonsComponent implements OnInit {
  lessons: Lesson[] = [];
  isVisible = false;
  isEdit = false;
  lessonForm: FormGroup;
  searchForm: FormGroup;
  levels = Object.values(Level);
  skills = Object.values(Skill);
  isAdmin: boolean = false;
  pageData: LessonPageResponse = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    page: 0,
    size: 10,
  };

  get titleControl(): AbstractControl | null {
    return this.lessonForm.get('title');
  }

  get levelControl(): AbstractControl | null {
    return this.lessonForm.get('level');
  }

  get skillControl(): AbstractControl | null {
    return this.lessonForm.get('skill');
  }

  get priceControl(): AbstractControl | null {
    return this.lessonForm.get('price');
  }

  constructor(
    private lessonService: LessonService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private router: Router // <--- Inject Router vào constructor
  ) {
    this.lessonForm = this.fb.group({
      lessonId: [null],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      level: [null, Validators.required],
      skill: [null, Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
    });

    this.searchForm = this.fb.group({
      title: [''],
      level: [null],
      skill: [null],
      minPrice: [null, [Validators.min(0)]],
      maxPrice: [null, [Validators.min(0)]],
      page: [0],
      size: [10],
      sortBy: ['lessonId'],
      sortDir: ['ASC'],
    });
  }

  ngOnInit(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        this.searchLessons();
      },
      error: (err: any) => {
        this.notification.warning('Cảnh báo', 'Không thể xác minh quyền admin.');
        console.error('Lỗi kiểm tra quyền admin:', err);
        this.searchLessons();
      },
    });
  }

  // Hàm sắp xếp cho cột title
  sortTitleFn: NzTableSortFn<Lesson> = (a: Lesson, b: Lesson) => {
    return a.title.localeCompare(b.title);
  };

  // Hàm sắp xếp cho cột level
  sortLevelFn: NzTableSortFn<Lesson> = (a: Lesson, b: Lesson) => {
    return a.level.localeCompare(b.level);
  };

  // Hàm sắp xếp cho cột skill
  sortSkillFn: NzTableSortFn<Lesson> = (a: Lesson, b: Lesson) => {
    return a.skill.localeCompare(b.skill);
  };

  // Hàm sắp xếp cho cột price
  sortPriceFn: NzTableSortFn<Lesson> = (a: Lesson, b: Lesson) => {
    return a.price - b.price;
  };

  searchLessons(): void {
    const request: LessonSearchRequest = {
      title: this.searchForm.get('title')?.value || undefined,
      level: this.searchForm.get('level')?.value || undefined,
      skill: this.searchForm.get('skill')?.value || undefined,
      minPrice: this.searchForm.get('minPrice')?.value || undefined,
      maxPrice: this.searchForm.get('maxPrice')?.value || undefined,
      page: this.searchForm.get('page')?.value,
      size: this.searchForm.get('size')?.value,
      sortBy: this.searchForm.get('sortBy')?.value,
      sortDir: this.searchForm.get('sortDir')?.value,
    };

    this.lessonService.searchLessons(request).subscribe({
      next: (pageData) => {
        this.pageData = pageData;
        this.lessons = pageData.content;
      },
      error: (err: any) => {
        this.notification.error('Lỗi', err.error?.message || 'Không thể tải bài học');
        console.error('Lỗi tìm kiếm bài học:', err);
      },
    });
  }

  resetSearch(): void {
    this.searchForm.reset({
      title: '',
      level: null,
      skill: null,
      minPrice: null,
      maxPrice: null,
      page: 0,
      size: 10,
      sortBy: 'lessonId',
      sortDir: 'ASC',
    });
    this.searchLessons();
  }

  onPageChange(page: number): void {
    this.searchForm.patchValue({ page: page - 1 });
    this.searchLessons();
  }

  onSizeChange(size: number): void {
    this.searchForm.patchValue({ size: size, page: 0 });
    this.searchLessons();
  }

  onSortChange(sortBy: string, sortDir: NzTableSortOrder): void {
    if (sortDir === null) {
      this.searchForm.patchValue({ sortBy: 'lessonId', sortDir: 'ASC', page: 0 });
    } else {
      const direction = sortDir === 'ascend' ? 'ASC' : (sortDir === 'descend' ? 'DESC' : null);
      if (direction) {
        this.searchForm.patchValue({ sortBy, sortDir: direction, page: 0 });
      } else {
        this.searchForm.patchValue({ sortBy: 'lessonId', sortDir: 'ASC', page: 0 });
      }
    }
    this.searchLessons();
  }

  showModal(isEdit: boolean, lesson?: Lesson): void {
    if (!this.isAdmin) {
      this.notification.error('Lỗi', 'Bạn không có quyền thực hiện hành động này');
      return;
    }

    this.isEdit = isEdit;
    if (isEdit && lesson) {
      this.lessonForm.patchValue({
        lessonId: lesson.lessonId,
        title: lesson.title,
        description: lesson.description || '',
        level: lesson.level,
        skill: lesson.skill,
        price: lesson.price,
      });
    } else {
      this.lessonForm.reset({
        lessonId: null,
        title: '',
        description: '',
        level: Level.BEGINNER,
        skill: Skill.GENERAL,
        price: null,
      });
    }
    this.isVisible = true;
  }

  handleOk(): void {
    if (this.lessonForm.invalid) {
      Object.values(this.lessonForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.notification.error('Lỗi', 'Vui lòng điền đầy đủ và đúng các trường bắt buộc');
      return;
    }

    const formValue = this.lessonForm.value;
    const lessonRequest: LessonRequest = {
      title: formValue.title,
      description: formValue.description || undefined,
      level: formValue.level,
      skill: formValue.skill,
      price: formValue.price,
    };

    if (this.isEdit) {
      const lessonId = formValue.lessonId;
      if (!lessonId) {
        this.notification.error('Lỗi', 'Thiếu ID bài học để cập nhật.');
        return;
      }
      this.lessonService.updateLesson(lessonId, lessonRequest).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Cập nhật bài học thành công');
          this.searchLessons();
          this.isVisible = false;
        },
        error: (err: any) => {
          this.notification.error('Lỗi', err.error?.message || 'Cập nhật bài học thất bại');
          console.error('Lỗi cập nhật bài học:', err);
        },
      });
    } else {
      this.lessonService.createLesson(lessonRequest).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Tạo bài học thành công');
          this.searchLessons();
          this.isVisible = false;
        },
        error: (err: any) => {
          this.notification.error('Lỗi', err.error?.message || 'Tạo bài học thất bại');
          console.error('Lỗi tạo bài học:', err);
        },
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.lessonForm.reset();
  }

  softDeleteLesson(lessonId: number | undefined): void {
    if (!this.isAdmin || !lessonId) {
      this.notification.error('Lỗi', 'Bạn không có quyền hoặc ID bài học không hợp lệ');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: 'Bạn có chắc chắn muốn ẩn bài học này không? (Điều này sẽ ẩn nó khỏi người dùng)',
      nzOkText: 'Có',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.lessonService.softDeleteLesson(lessonId).subscribe({
          next: () => {
            this.notification.success('Thành công', 'Bài học đã được ẩn thành công');
            this.searchLessons();
          },
          error: (err: any) => {
            this.notification.error('Lỗi', err.error?.message || 'Ẩn bài học thất bại');
            console.error('Lỗi ẩn bài học:', err);
          },
        });
      },
      nzCancelText: 'Không',
      nzOnCancel: () => this.notification.info('Thông báo', 'Hủy bỏ thao tác ẩn bài học.'),
    });
  }

  // <--- THÊM PHƯƠNG THỨC ĐIỀU HƯỚNG MỚI NÀY
  navigateToLessonVocabulary(lessonId: number | undefined): void {
    if (lessonId) {
      this.router.navigate(['/admin/lesson-vocabulary', lessonId]);
    } else {
      this.notification.warning('Cảnh báo', 'Không tìm thấy ID bài học để xem từ vựng.');
    }
  }
  // THÊM PHƯƠNG THỨC ĐIỀU HƯỚNG MỚI NÀY --->
}
