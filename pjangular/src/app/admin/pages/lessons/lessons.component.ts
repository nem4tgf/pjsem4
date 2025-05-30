import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Lesson, Level, Skill } from 'src/app/interface/lesson.interface';
import { ApiService } from 'src/app/service/api.service';
import { LessonService } from 'src/app/service/lesson.service';

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
    private apiService: ApiService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {
    this.lessonForm = this.fb.group({
      lessonId: [null],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      level: [Level.BEGINNER, Validators.required], // Giá trị mặc định
      skill: [Skill.VOCABULARY, Validators.required] // Giá trị mặc định
    });
  }

  ngOnInit(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        console.log('User is admin:', isAdmin);
        this.isAdmin = isAdmin;
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
        skill: lesson.skill
      });
    } else {
      console.log('Opening modal for new lesson');
      this.lessonForm.reset({
        lessonId: null,
        title: '',
        description: '',
        level: Level.BEGINNER, // Giá trị mặc định
        skill: Skill.VOCABULARY // Giá trị mặc định
      });
    }
    this.isVisible = true;
  }

  handleOk(): void {
    console.log('Form value:', this.lessonForm.value);
    console.log('Form status:', this.lessonForm.status);
    console.log('Form errors:', this.lessonForm.errors);
    console.log('Title errors:', this.lessonForm.get('title')?.errors);
    console.log('Level errors:', this.lessonForm.get('level')?.errors);
    console.log('Skill errors:', this.lessonForm.get('skill')?.errors);

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
      createdAt: undefined
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

  deleteLesson(lessonId: number): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to perform this action');
      console.error('Delete blocked: User is not admin');
      return;
    }
    this.modal.confirm({
      nzTitle: 'Are you sure?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        this.lessonService.deleteLesson(lessonId).subscribe({
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
