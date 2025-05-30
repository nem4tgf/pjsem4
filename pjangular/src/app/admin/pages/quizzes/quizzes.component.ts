// src/app/admin/pages/quizzes/quizzes.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { Quiz, Skill } from 'src/app/interface/quiz.interface';
import { Lesson } from 'src/app/interface/lesson.interface'; // Vẫn cần Lesson để hiển thị title và lấy danh sách
import { QuizService } from 'src/app/service/quiz.service';
import { LessonService } from 'src/app/service/lesson.service';
import { ApiService } from 'src/app/service/api.service'; // Import ApiService để kiểm tra quyền admin

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.css']
})
export class QuizzesComponent implements OnInit {
  quizzes: Quiz[] = [];
  lessons: Lesson[] = [];
  isVisible = false;
  isEdit = false;
  quizForm: FormGroup;
  skills = Object.values(Skill);
  selectedLessonId: number | null = null;
  isAdmin: boolean = false; // Biến kiểm tra quyền admin

  constructor(
    private quizService: QuizService,
    private lessonService: LessonService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private apiService: ApiService // Inject ApiService
  ) {
    this.quizForm = this.fb.group({
      quizId: [null],
      lessonId: [null, Validators.required], // <--- SỬA: form control 'lessonId' (number)
      title: ['', Validators.required],
      skill: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.checkRoleAndLoadData(); // Gọi hàm kiểm tra quyền và tải dữ liệu
  }

  private checkRoleAndLoadData(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        if (this.isAdmin) {
          this.loadLessons(); // Chỉ tải lessons nếu là admin
        } else {
          this.notification.warning('Warning', 'You do not have administrative privileges to manage quizzes.');
        }
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to verify admin role.');
        console.error('Admin role check error:', err);
      }
    });
  }

  loadLessons(): void {
    this.lessonService.getAllLessons().subscribe({
      next: (lessons) => {
        this.lessons = lessons;
        console.log('Loaded all lessons:', this.lessons);
        // Optionally, load quizzes for the first lesson or a default one
        if (this.lessons.length > 0 && this.selectedLessonId === null) {
          this.selectedLessonId = this.lessons[0].lessonId;
          this.loadQuizzes(this.selectedLessonId);
        } else if (this.selectedLessonId !== null) {
            // Nếu đã có selectedLessonId (từ lần load trước), tải quizzes cho lesson đó
            this.loadQuizzes(this.selectedLessonId);
        }
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to load lessons.');
        console.error('Load lessons error:', err);
      }
    });
  }

  loadQuizzes(lessonId: number): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to view quizzes.');
      return;
    }
    this.quizService.getQuizzesByLessonId(lessonId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        console.log(`Loaded quizzes for lesson ${lessonId}:`, this.quizzes);
      },
      error: (err) => {
        this.notification.error('Error', `Failed to load quizzes for lesson ${lessonId}.`);
        console.error('Load quizzes error:', err);
      }
    });
  }

  showModal(isEdit: boolean, quiz?: Quiz): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to add/edit quizzes.');
      return;
    }
    this.isEdit = isEdit;
    this.quizForm.reset(); // Reset form khi mở modal

    if (isEdit && quiz) {
      this.quizForm.patchValue({
        quizId: quiz.quizId,
        lessonId: quiz.lessonId, // <--- SỬA: patch vào 'lessonId'
        title: quiz.title,
        skill: quiz.skill
      });
    } else {
      // Thiết lập giá trị mặc định cho lesson nếu đang add và đã có selectedLessonId
      if (this.selectedLessonId) {
        this.quizForm.get('lessonId')?.setValue(this.selectedLessonId); // <--- SỬA: set value cho 'lessonId'
      }
    }
    this.isVisible = true;
    console.log('Quiz Form after showModal:', this.quizForm.value);
  }

  handleOk(): void {
    console.log('Attempting to submit form. Current form value:', this.quizForm.value);
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      this.notification.error('Error', 'Please fill in all required fields correctly.');
      // Thêm console.error chi tiết cho các trường bị lỗi
      console.error(
        'Form is invalid. Errors:',
        this.quizForm.controls['lessonId']?.errors, // <--- SỬA: Kiểm tra 'lessonId'
        this.quizForm.controls['title']?.errors,
        this.quizForm.controls['skill']?.errors
      );
      return;
    }

    // Lấy lessonId trực tiếp từ form control 'lessonId'
    const lessonIdFromForm = this.quizForm.get('lessonId')?.value;

    // Tạo đối tượng Quiz để gửi đi (chỉ chứa lessonId, không phải Lesson object)
    const quizToSend: Quiz = {
      quizId: this.quizForm.get('quizId')?.value, // Có thể là null/undefined khi tạo mới
      lessonId: lessonIdFromForm, // <--- SỬA: Gửi lessonId
      title: this.quizForm.get('title')?.value,
      skill: this.quizForm.get('skill')?.value
      // createdAt không cần gửi, backend sẽ tự tạo
    };

    console.log('Quiz object to send:', quizToSend);

    if (this.isEdit) {
      if (quizToSend.quizId === null || quizToSend.quizId === undefined) {
        this.notification.error('Error', 'Quiz ID is missing for update.');
        return;
      }
      this.quizService.updateQuiz(quizToSend.quizId, quizToSend).subscribe({
        next: () => {
          this.notification.success('Success', 'Quiz updated successfully!');
          this.loadQuizzes(quizToSend.lessonId); // Tải lại quizzes cho bài học này
          this.isVisible = false;
          this.quizForm.reset();
        },
        error: (err) => {
          this.notification.error('Error', 'Failed to update quiz: ' + (err.error?.message || err.message));
          console.error('Update quiz error:', err);
        }
      });
    } else {
      this.quizService.createQuiz(quizToSend).subscribe({ // Gửi quizToSend trực tiếp
        next: () => {
          this.notification.success('Success', 'Quiz created successfully!');
          this.loadQuizzes(quizToSend.lessonId); // Tải lại quizzes cho bài học này
          this.isVisible = false;
          this.quizForm.reset();
        },
        error: (err) => {
          this.notification.error('Error', 'Failed to create quiz: ' + (err.error?.message || err.message));
          console.error('Create quiz error:', err);
        }
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.quizForm.reset();
  }

  deleteQuiz(quizId: number): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to delete quizzes.');
      return;
    }
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this quiz?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        this.quizService.deleteQuiz(quizId).subscribe({
          next: () => {
            this.notification.success('Success', 'Quiz deleted successfully!');
            // Tải lại quizzes cho lesson đang được chọn, nếu có
            if (this.selectedLessonId) {
              this.loadQuizzes(this.selectedLessonId);
            }
          },
          error: (err) => {
            this.notification.error('Error', 'Failed to delete quiz: ' + (err.error?.message || err.message));
            console.error('Delete quiz error:', err);
          }
        });
      }
    });
  }

  /**
   * Helper function to get lesson title from lessonId.
   * Used in the template to display lesson title in the table.
   */
  getLessonTitle(lessonId: number | undefined): string {
    if (lessonId == null) {
      return 'N/A';
    }
    const lesson = this.lessons.find(l => l.lessonId === lessonId);
    return lesson ? lesson.title : 'N/A';
  }
}
