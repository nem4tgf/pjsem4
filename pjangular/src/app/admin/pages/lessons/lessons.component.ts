// src/app/admin/lessons/lessons.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Lesson, LessonRequest, LessonSearchRequest, LessonPageResponse, Level, Skill } from '../../../interface/lesson.interface';
import { LessonService } from '../../../service/lesson.service';
import { ApiService } from '../../../service/api.service';

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.css']
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
  pageData: LessonPageResponse = { content: [], totalElements: 0, totalPages: 0, pageNo: 0, pageSize: 10 };

  constructor(
    private lessonService: LessonService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {
    this.lessonForm = this.fb.group({
      lessonId: [null],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      level: [null, Validators.required],
      skill: [null, Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]]
      // Loại bỏ durationMonths vì backend tự tính
    });
    this.searchForm = this.fb.group({
      title: [''],
      level: [null],
      skill: [null],
      minPrice: [null, [Validators.min(0)]],
      maxPrice: [null, [Validators.min(0)]],
      pageNo: [0],
      pageSize: [10],
      sortBy: ['lessonId'],
      sortDir: ['ASC']
    });
  }

  ngOnInit(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        this.searchLessons();
      },
      error: (err) => {
        this.notification.warning('Warning', 'Unable to verify admin role.');
        console.error('Admin role check error:', err);
        this.searchLessons();
      }
    });
  }

  searchLessons(): void {
    const request: LessonSearchRequest = this.searchForm.value;
    this.lessonService.searchLessons(request).subscribe({
      next: (pageData) => {
        this.pageData = pageData;
        this.lessons = pageData.content;
      },
      error: (err) => {
        this.notification.error('Error', err.message || 'Failed to load lessons');
        console.error('Search lessons error:', err);
      }
    });
  }

  onPageChange(page: number): void {
    this.searchForm.patchValue({ pageNo: page - 1 });
    this.searchLessons();
  }

  onSizeChange(size: number): void {
    this.searchForm.patchValue({ pageSize: size, pageNo: 0 });
    this.searchLessons();
  }

  onSortChange(sortBy: string, sortDir: 'ASC' | 'DESC'): void {
    this.searchForm.patchValue({ sortBy, sortDir, pageNo: 0 });
    this.searchLessons();
  }

  showModal(isEdit: boolean, lesson?: Lesson): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to perform this action');
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
        price: lesson.price
      });
    } else {
      this.lessonForm.reset({
        lessonId: null,
        title: '',
        description: '',
        level: Level.BEGINNER,
        skill: Skill.VOCABULARY,
        price: null
      });
    }
    this.isVisible = true;
  }

  handleOk(): void {
    if (this.lessonForm.invalid) {
      this.lessonForm.markAllAsTouched();
      this.notification.error('Error', 'Please fill in all required fields correctly');
      return;
    }

    const formValue = this.lessonForm.value;
    const lessonRequest: LessonRequest = {
      title: formValue.title,
      description: formValue.description || undefined,
      level: formValue.level,
      skill: formValue.skill,
      price: formValue.price
    };

    if (this.isEdit) {
      const lessonId = formValue.lessonId;
      if (!lessonId) {
        this.notification.error('Error', 'Missing lesson ID for update.');
        return;
      }
      this.lessonService.updateLesson(lessonId, lessonRequest).subscribe({
        next: () => {
          this.notification.success('Success', 'Lesson updated successfully');
          this.searchLessons();
          this.isVisible = false;
        },
        error: (err) => {
          this.notification.error('Error', err.error?.message || 'Failed to update lesson');
          console.error('Update lesson error:', err);
        }
      });
    } else {
      this.lessonService.createLesson(lessonRequest).subscribe({
        next: () => {
          this.notification.success('Success', 'Lesson created successfully');
          this.searchLessons();
          this.isVisible = false;
        },
        error: (err) => {
          this.notification.error('Error', err.error?.message || 'Failed to create lesson');
          console.error('Create lesson error:', err);
        }
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.lessonForm.reset();
  }

  hideLesson(lessonId: number | undefined): void {
    if (!this.isAdmin || !lessonId) {
      this.notification.error('Error', 'You do not have permission or invalid lesson ID');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Are you sure?',
      nzContent: 'The lesson will be hidden but can be restored later.',
      nzOkText: 'Hide',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.lessonService.hideLesson(lessonId).subscribe({
          next: () => {
            this.notification.success('Success', 'Lesson hidden successfully');
            this.searchLessons();
          },
          error: (err) => {
            this.notification.error('Error', err.error?.message || 'Failed to hide lesson');
            console.error('Hide lesson error:', err);
          }
        });
      }
    });
  }
}
