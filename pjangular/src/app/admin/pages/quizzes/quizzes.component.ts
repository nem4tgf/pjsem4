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
      lessonId: [null, Validators.required],
      title: ['', Validators.required],
      skill: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.checkRoleAndLoadData();
  }

  private checkRoleAndLoadData(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        if (this.isAdmin) {
          this.loadLessons();
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

        // THAY ĐỔI TẠI ĐÂY: Xử lý gán selectedLessonId an toàn hơn
        if (this.lessons.length > 0) {
          // Nếu chưa có lesson nào được chọn, hoặc lesson đã chọn không còn tồn tại,
          // thì chọn lesson đầu tiên trong danh sách (nếu nó có lessonId)
          if (this.selectedLessonId === null || !this.lessons.some(l => l.lessonId === this.selectedLessonId)) {
            if (this.lessons[0].lessonId !== undefined) {
              this.selectedLessonId = this.lessons[0].lessonId;
            } else {
              // Trường hợp lesson đầu tiên không có ID (ít khả năng xảy ra nếu backend hoạt động đúng)
              console.warn('First lesson has no ID. Cannot auto-select for quizzes.');
              this.selectedLessonId = null;
            }
          }
          // Nếu đã có lessonId được chọn hợp lệ hoặc vừa gán được, tải quizzes
          if (this.selectedLessonId !== null) {
            this.loadQuizzes(this.selectedLessonId);
          }
        } else {
          this.selectedLessonId = null; // Không có bài học nào
          this.quizzes = []; // Đảm bảo danh sách quiz rỗng
        }
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to load lessons.');
        console.error('Load lessons error:', err);
      }
    });
  }

  // Giữ nguyên loadQuizzes(lessonId: number): vì nó mong đợi một number
  loadQuizzes(lessonId: number): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to view quizzes.');
      return;
    }
    // Đảm bảo lessonId không phải null/undefined trước khi gọi service
    if (lessonId == null) {
      this.notification.error('Error', 'Lesson ID is missing for loading quizzes.');
      console.error('loadQuizzes: lessonId is null or undefined.');
      this.quizzes = [];
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
        lessonId: quiz.lessonId,
        title: quiz.title,
        skill: quiz.skill
      });
    } else {
      if (this.selectedLessonId !== null) { // THAY ĐỔI: Sử dụng !== null
        this.quizForm.get('lessonId')?.setValue(this.selectedLessonId);
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
      console.error(
        'Form is invalid. Errors:',
        this.quizForm.controls['lessonId']?.errors,
        this.quizForm.controls['title']?.errors,
        this.quizForm.controls['skill']?.errors
      );
      return;
    }

    const quizToSend: Quiz = {
      quizId: this.quizForm.get('quizId')?.value,
      // THAY ĐỔI: Ép kiểu để đảm bảo nó là number khi gọi service, vì validator đã đảm bảo nó có giá trị
      lessonId: this.quizForm.get('lessonId')?.value as number,
      title: this.quizForm.get('title')?.value,
      skill: this.quizForm.get('skill')?.value
    };

    console.log('Quiz object to send:', quizToSend);

    if (this.isEdit) {
      // THAY ĐỔI: Kiểm tra quizId có tồn tại và dùng non-null assertion
      if (quizToSend.quizId == null) { // Dùng == null để bắt cả null và undefined
        this.notification.error('Error', 'Quiz ID is missing for update.');
        return;
      }
      this.quizService.updateQuiz(quizToSend.quizId, quizToSend).subscribe({
        next: () => {
          this.notification.success('Success', 'Quiz updated successfully!');
          this.loadQuizzes(quizToSend.lessonId);
          this.isVisible = false;
          this.quizForm.reset();
        },
        error: (err) => {
          this.notification.error('Error', 'Failed to update quiz: ' + (err.error?.message || err.message));
          console.error('Update quiz error:', err);
        }
      });
    } else {
      this.quizService.createQuiz(quizToSend).subscribe({
        next: () => {
          this.notification.success('Success', 'Quiz created successfully!');
          this.loadQuizzes(quizToSend.lessonId);
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
            if (this.selectedLessonId !== null) { // THAY ĐỔI: Chỉ tải lại nếu có lesson được chọn
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

  getLessonTitle(lessonId: number | undefined): string { // Giữ nguyên, nhận number | undefined
    if (lessonId == null) { // Dùng == null để bắt cả null và undefined
      return 'N/A';
    }
    const lesson = this.lessons.find(l => l.lessonId === lessonId);
    return lesson ? lesson.title : 'N/A';
  }
}
