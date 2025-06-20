// src/app/admin/lessons/lessons.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Lesson, LessonRequest, LessonSearchRequest, LessonPageResponse, Level, Skill } from '../../../interface/lesson.interface'; // Updated import for LessonPageResponse
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
  pageData: LessonPageResponse = { content: [], totalElements: 0, totalPages: 0, pageNo: 0, pageSize: 10 }; // Updated type to LessonPageResponse

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
      price: [null, [Validators.required, Validators.min(0.01)]],
      durationMonths: [null, [Validators.min(1)]] // durationMonths is derived on backend, but kept in form for user input consistency if needed
    });
    this.searchForm = this.fb.group({
      title: [''],
      level: [null],
      skill: [null],
      minPrice: [null, [Validators.min(0)]],
      maxPrice: [null, [Validators.min(0)]],
      pageNo: [0], // Changed from 'page' to 'pageNo'
      pageSize: [10], // Changed from 'size' to 'pageSize'
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
        this.searchLessons(); // Still attempt to load lessons even if admin check fails
      }
    });
  }

  /**
   * Performs a lesson search based on the current search form values.
   */
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

  /**
   * Handles page index changes from the pagination component.
   * @param page The new page index (1-based).
   */
  onPageChange(page: number): void {
    this.searchForm.patchValue({ pageNo: page - 1 }); // Update pageNo (0-based)
    this.searchLessons();
  }

  /**
   * Handles page size changes from the pagination component.
   * @param size The new page size.
   */
  onSizeChange(size: number): void {
    this.searchForm.patchValue({ pageSize: size, pageNo: 0 }); // Update pageSize and reset pageNo to 0
    this.searchLessons();
  }

  /**
   * Handles sort changes from the table headers.
   * @param sortBy The field to sort by.
   * @param sortDir The sort direction ('ASC' or 'DESC').
   */
  onSortChange(sortBy: string, sortDir: 'ASC' | 'DESC'): void {
    this.searchForm.patchValue({ sortBy, sortDir, pageNo: 0 }); // Update sort and reset pageNo to 0
    this.searchLessons();
  }

  /**
   * Shows the add/edit lesson modal.
   * @param isEdit Boolean indicating if the modal is for editing or adding.
   * @param lesson Optional lesson object to pre-fill the form in edit mode.
   */
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
        price: lesson.price,
        durationMonths: lesson.durationMonths
      });
    } else {
      this.lessonForm.reset({
        lessonId: null,
        title: '',
        description: '',
        level: Level.BEGINNER,
        skill: Skill.VOCABULARY,
        price: null,
        durationMonths: null
      });
    }
    this.isVisible = true;
  }

  /**
   * Handles the OK button click in the add/edit lesson modal.
   * Creates or updates a lesson based on `isEdit` flag.
   */
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
          this.searchLessons(); // Refresh list after update
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
          this.searchLessons(); // Refresh list after creation
          this.isVisible = false;
        },
        error: (err) => {
          this.notification.error('Error', err.error?.message || 'Failed to create lesson');
          console.error('Create lesson error:', err);
        }
      });
    }
  }

  /**
   * Handles the Cancel button click in the add/edit lesson modal.
   */
  handleCancel(): void {
    this.isVisible = false;
    this.lessonForm.reset();
  }

  /**
   * Deletes a lesson after user confirmation.
   * @param lessonId The ID of the lesson to delete.
   */
  deleteLesson(lessonId: number | undefined): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to perform this action');
      return;
    }
    if (lessonId === undefined || lessonId === null) {
      this.notification.error('Error', 'Cannot delete lesson: ID is missing.');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Are you sure?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.lessonService.deleteLesson(lessonId).subscribe({
          next: () => {
            this.notification.success('Success', 'Lesson deleted successfully');
            this.searchLessons(); // Refresh list after deletion
          },
          error: (err) => {
            this.notification.error('Error', err.error?.message || 'Failed to delete lesson');
            console.error('Delete lesson error:', err);
          }
        });
      }
    });
  }
}
