import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Lesson } from 'src/app/interface/lesson.interface';
import { Progress, Status, Skill } from 'src/app/interface/progress.interface';
import { User } from 'src/app/interface/user.interface';
import { LessonService } from 'src/app/service/lesson.service';
import { ProgressService } from 'src/app/service/progress.service';
import { UserService } from 'src/app/service/user.service';

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

  constructor(
    private progressService: ProgressService,
    private userService: UserService,
    private lessonService: LessonService,
    private fb: FormBuilder,
    private notification: NzNotificationService
  ) {
    this.progressForm = this.fb.group({
      user: [null, Validators.required],
      lesson: [null, Validators.required],
      skill: [null, Validators.required],
      status: [null, Validators.required],
      completionPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadLessons();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  loadLessons(): void {
    this.lessonService.getAllLessons().subscribe(lessons => {
      this.lessons = lessons;
    });
  }

  loadProgress(): void {
    if (this.progressForm.value.userId) {
      this.progressService.getProgressByUser(this.progressForm.value.userId).subscribe(progress => {
        this.progressList = progress;
      });
    }
  }

  updateProgress(): void {
    if (this.progressForm.invalid) {
      this.progressForm.markAllAsTouched();
      return;
    }
    const progress: Progress = {
      ...this.progressForm.value,
      user: this.users.find(u => u.userId === this.progressForm.value.userId)!,
      lesson: this.lessons.find(l => l.lessonId === this.progressForm.value.lessonId)!
    };
    this.progressService.updateProgress(progress).subscribe(() => {
      this.notification.success('Success', 'Progress updated');
      this.loadProgress();
    });
  }
}
