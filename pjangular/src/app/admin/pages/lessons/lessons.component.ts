// src/app/admin/pages/lessons/lessons.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
// CẬP NHẬT ĐƯỜNG DẪN IMPORT
import { Lesson, Level, Skill } from '../../../interface/lesson.interface';
import { ApiService } from '../../../service/api.service';
import { LessonService } from '../../../service/lesson.service';

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
  levels = Object.values(Level);
  skills = Object.values(Skill);
  isAdmin: boolean = false;

  constructor(
    private lessonService: LessonService,
    private apiService: ApiService, // Giữ lại apiService để kiểm tra quyền
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {
    this.lessonForm = this.fb.group({
      lessonId: [null],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      level: [Level.BEGINNER, Validators.required],
      skill: [Skill.VOCABULARY, Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]], // THÊM MỚI: Price
      durationMonths: [null, [Validators.min(1)]] // THÊM MỚI: DurationMonths, optional
    });
  }

  ngOnInit(): void {
    // Bạn cần triển khai logic kiểm tra vai trò admin trong ApiService.checkAuth() hoặc một phương thức riêng
    // Hiện tại, ApiService.checkAuth() chỉ trả về true, nên sẽ cần điều chỉnh.
    // Giả định bạn có một phương thức getLoggedInUser hoặc isAdmin() trong AuthService/ApiService của bạn
    this.apiService.checkAuth().subscribe({ // Gọi checkAuth hoặc một phương thức kiểm tra admin cụ thể
      next: (isAuthenticated) => {
        // Đây là nơi bạn sẽ kiểm tra vai trò thực sự của người dùng
        // Ví dụ: this.authService.isAdmin().subscribe(isAdmin => this.isAdmin = isAdmin);
        // Tạm thời gán bằng true để test nếu bạn chưa có logic kiểm tra vai trò phức tạp
        this.isAdmin = true; // THAY ĐỔI: Thay thế bằng logic kiểm tra vai trò thực tế
        console.log('User is admin:', this.isAdmin);
      },
      error: (err) => {
        console.error('Check admin role error:', err);
        this.isAdmin = false;
        this.notification.warning('Warning', 'Unable to verify admin role. Some features may be restricted.');
      }
    });
    this.loadLessons();
  }

  loadLessons(): void {
    this.lessonService.getAllLessons().subscribe({
      next: (lessons) => {
        console.log('Loaded lessons:', lessons);
        this.lessons = lessons;
      },
      error: (err) => {
        this.notification.error('Error', err.message || 'Failed to load lessons');
        console.error('Load lessons error:', err);
      }
    });
  }

  showModal(isEdit: boolean, lesson?: Lesson): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to perform this action');
      console.error('Show modal blocked: User is not admin');
      return;
    }
    this.isEdit = isEdit;
    if (isEdit && lesson) {
      console.log('Editing lesson:', lesson);
      this.lessonForm.patchValue({
        lessonId: lesson.lessonId,
        title: lesson.title,
        description: lesson.description || '',
        level: lesson.level,
        skill: lesson.skill,
        price: lesson.price, // THÊM MỚI
        durationMonths: lesson.durationMonths // THÊM MỚI
      });
    } else {
      console.log('Opening modal for new lesson');
      this.lessonForm.reset({
        lessonId: null,
        title: '',
        description: '',
        level: Level.BEGINNER,
        skill: Skill.VOCABULARY,
        price: null, // THÊM MỚI
        durationMonths: null // THÊM MỚI
      });
    }
    this.isVisible = true;
  }

  handleOk(): void {
    console.log('Form value:', this.lessonForm.value);
    console.log('Form status:', this.lessonForm.status);

    if (this.lessonForm.invalid) {
      this.lessonForm.markAllAsTouched();
      this.notification.error('Error', 'Please fill in all required fields correctly');
      return;
    }

    const lesson: Lesson = {
      lessonId: this.lessonForm.value.lessonId,
      title: this.lessonForm.value.title,
      description: this.lessonForm.value.description || undefined,
      level: this.lessonForm.value.level,
      skill: this.lessonForm.value.skill,
      price: this.lessonForm.value.price, // THÊM MỚI
      durationMonths: this.lessonForm.value.durationMonths || undefined // THÊM MỚI
      // createdAt sẽ được backend tạo/cập nhật
    };
    console.log('Submitting lesson:', lesson);

    if (this.isEdit) {
      this.lessonService.updateLesson(lesson.lessonId!, lesson).subscribe({
        next: () => {
          this.notification.success('Success', 'Lesson updated successfully');
          this.loadLessons();
          this.isVisible = false;
        },
        error: (err) => {
          this.notification.error('Error', err.message || 'Failed to update lesson');
          console.error('Update lesson error:', err);
        }
      });
    } else {
      this.lessonService.createLesson(lesson).subscribe({
        next: () => {
          this.notification.success('Success', 'Lesson created successfully');
          this.loadLessons();
          this.isVisible = false;
        },
        error: (err) => {
          this.notification.error('Error', err.message || 'Failed to create lesson');
          console.error('Create lesson error:', err);
        }
      });
    }
  }

  handleCancel(): void {
    console.log('Modal cancelled');
    this.isVisible = false;
  }

  deleteLesson(lessonId: number | undefined): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to perform this action');
      console.error('Delete blocked: User is not admin');
      return;
    }

    if (lessonId === undefined || lessonId === null) {
      this.notification.error('Error', 'Cannot delete lesson: ID is missing.');
      console.error('Delete lesson error: lessonId is undefined or null');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Are you sure?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        this.lessonService.deleteLesson(lessonId!).subscribe({
          next: () => {
            this.notification.success('Success', 'Lesson deleted successfully');
            this.loadLessons();
          },
          error: (err) => {
            this.notification.error('Error', err.message || 'Failed to delete lesson');
            console.error('Delete lesson error:', err);
          }
        });
      }
    });
  }
}
