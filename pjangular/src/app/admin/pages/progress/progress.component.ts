// src/app/admin/pages/progress/progress.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { Lesson } from 'src/app/interface/lesson.interface';
import { Progress, Status, Skill } from 'src/app/interface/progress.interface';
import { User } from 'src/app/interface/user.interface';

import { LessonService } from 'src/app/service/lesson.service';
import { ProgressService } from 'src/app/service/progress.service';
import { UserService } from 'src/app/service/user.service';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {
  progressList: Progress[] = [];
  users: User[] = [];
  lessons: Lesson[] = [];
  progressForm: FormGroup;
  statuses = Object.values(Status);
  skills = Object.values(Skill);
  isAdmin: boolean = false;

  selectedUserId: number | null = null; // Biến lưu userId đang được chọn

  constructor(
    private progressService: ProgressService,
    private userService: UserService,
    private lessonService: LessonService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private apiService: ApiService
  ) {
    this.progressForm = this.fb.group({
      userId: [null, Validators.required],
      lessonId: [null, Validators.required],
      skill: [null, Validators.required],
      status: [null, Validators.required],
      completionPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
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
          this.loadUsers();
          this.loadLessons();
        } else {
          this.notification.warning('Warning', 'You do not have administrative privileges to view progress.');
          this.progressList = []; // Xóa dữ liệu cũ nếu không có quyền
        }
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to verify admin role.');
        console.error('Admin role check error:', err);
        this.isAdmin = false; // Đảm bảo isAdmin là false nếu có lỗi
        this.progressList = []; // Xóa dữ liệu cũ nếu có lỗi
      }
    });
  }

  loadUsers(): void {
    if (!this.isAdmin) return;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Loaded all users:', this.users);
        if (this.users.length > 0) {
          // Chỉ gán selectedUserId nếu nó chưa được set hoặc không tìm thấy user đó trong danh sách mới
          if (this.selectedUserId === null || !this.users.some(u => u.userId === this.selectedUserId)) {
            // Đảm bảo userId của user đầu tiên không phải undefined/null trước khi gán
            if (this.users[0].userId !== undefined && this.users[0].userId !== null) {
              this.selectedUserId = this.users[0].userId;
              this.progressForm.get('userId')?.setValue(this.selectedUserId);
              this.loadProgress(); // Tải tiến độ cho user mặc định
            } else {
              console.warn('First user has no userId or it is undefined/null. Cannot set default selected user.');
            }
          } else {
            // Nếu đã có selectedUserId và nó vẫn tồn tại trong danh sách user mới, chỉ cần tải lại progress
            this.progressForm.get('userId')?.setValue(this.selectedUserId);
            this.loadProgress();
          }
        } else {
          this.progressList = []; // Không có user nào thì không có progress
        }
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to load users.');
        console.error('Load users error:', err);
      }
    });
  }

  loadLessons(): void {
    if (!this.isAdmin) return;
    this.lessonService.getAllLessons().subscribe({
      next: (lessons) => {
        this.lessons = lessons;
        console.log('Loaded all lessons:', this.lessons);
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to load lessons.');
        console.error('Load lessons error:', err);
      }
    });
  }

  loadProgress(): void {
    if (!this.isAdmin) return;

    const userIdToLoad = this.selectedUserId || this.progressForm.get('userId')?.value;
    if (userIdToLoad !== null && userIdToLoad !== undefined) {
      this.progressService.getProgressByUser(userIdToLoad).subscribe({
        next: (progress) => {
          this.progressList = progress;
          console.log(`Loaded progress for user ${userIdToLoad}:`, this.progressList);
        },
        error: (err) => {
          this.notification.error('Error', `Failed to load progress for user ${userIdToLoad}.`);
          console.error('Load progress error:', err);
        }
      });
    } else {
      this.progressList = [];
      this.notification.info('Info', 'Please select a user to view progress.');
    }
  }

  onUserChange(userId: number): void {
    this.selectedUserId = userId; // Cập nhật biến selectedUserId
    this.loadProgress(); // Tải lại kết quả cho user mới chọn
  }

  updateProgress(): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to update progress.');
      return;
    }
    if (this.progressForm.invalid) {
      this.progressForm.markAllAsTouched();
      this.notification.error('Error', 'Please fill in all required fields correctly.');
      console.error(
        'Form is invalid. Errors:',
        this.progressForm.controls['userId']?.errors,
        this.progressForm.controls['lessonId']?.errors,
        this.progressForm.controls['skill']?.errors,
        this.progressForm.controls['status']?.errors,
        this.progressForm.controls['completionPercentage']?.errors
      );
      return;
    }

    // Tạo đối tượng Progress để gửi đi (chỉ chứa userId và lessonId, không phải User/Lesson object)
    const progressToSend: Progress = {
      userId: this.progressForm.get('userId')?.value,
      lessonId: this.progressForm.get('lessonId')?.value,
      skill: this.progressForm.get('skill')?.value,
      status: this.progressForm.get('status')?.value,
      completionPercentage: this.progressForm.get('completionPercentage')?.value
    };

    console.log('Progress object to send:', progressToSend);

    this.progressService.updateProgress(progressToSend).subscribe({
      next: () => {
        this.notification.success('Success', 'Progress updated successfully!');
        this.loadProgress(); // Tải lại tiến độ cho user đã chọn
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to update progress: ' + (err.error?.message || 'Unknown error'));
        console.error('Update progress error:', err);
      }
    });
  }

  getUserUsername(userId: number | undefined): string {
    if (userId == null) {
      return 'N/A';
    }
    const user = this.users.find(u => u.userId === userId);
    return user ? user.username : 'N/A';
  }

  getLessonTitle(lessonId: number | undefined): string {
    if (lessonId == null) {
      return 'N/A';
    }
    const lesson = this.lessons.find(l => l.lessonId === lessonId);
    return lesson ? lesson.title : 'N/A';
  }
}
