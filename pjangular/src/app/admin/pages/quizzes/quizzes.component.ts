import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Quiz, Skill } from 'src/app/interface/quiz.interface';
import { Lesson } from 'src/app/interface/lesson.interface'; // Assuming you import Lesson interface
import { QuizService } from 'src/app/service/quiz.service';
import { LessonService } from 'src/app/service/lesson.service'; // Assuming you import LessonService

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.css']
})
export class QuizzesComponent implements OnInit {
  quizzes: Quiz[] = [];
  lessons: Lesson[] = []; // Assuming you have a lessons array
  isVisible = false;
  isEdit = false;
  quizForm: FormGroup;
  skills = Object.values(Skill);
  selectedLessonId: number | null = null; // <-- ADD THIS LINE

  constructor(
    private quizService: QuizService,
    private lessonService: LessonService, // Assuming you inject LessonService
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {
    this.quizForm = this.fb.group({
      quizId: [null],
      lesson: [null, Validators.required],
      title: ['', Validators.required],
      skill: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadLessons(); // You likely load lessons here
  }

  loadLessons(): void {
    this.lessonService.getAllLessons().subscribe(lessons => {
      this.lessons = lessons;
      // Optionally, load quizzes for the first lesson or a default one
      if (this.lessons.length > 0 && this.selectedLessonId === null) {
         this.selectedLessonId = this.lessons[0].lessonId;
         this.loadQuizzes(this.selectedLessonId);
      }
    });
  }

  loadQuizzes(lessonId: number): void {
    this.quizService.getQuizzesByLessonId(lessonId).subscribe(quizzes => {
      this.quizzes = quizzes;
    });
  }

  showModal(isEdit: boolean, quiz?: Quiz): void {
    this.isEdit = isEdit;
    if (isEdit && quiz) {
      this.quizForm.patchValue({
        ...quiz,
        lesson: quiz.lesson.lessonId
      });
    } else {
      this.quizForm.reset();
    }
    this.isVisible = true;
  }

  handleOk(): void {
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      return;
    }
    const quiz: Quiz = {
      ...this.quizForm.value,
      lesson: this.lessons.find(l => l.lessonId === this.quizForm.value.lesson)!
    };
    if (this.isEdit) {
      this.quizService.updateQuiz(quiz.quizId!, quiz).subscribe(() => {
        this.notification.success('Success', 'Quiz updated');
        this.loadQuizzes(quiz.lesson.lessonId!);
        this.isVisible = false;
      });
    } else {
      this.quizService.createQuiz(quiz).subscribe(() => {
        this.notification.success('Success', 'Quiz created');
        this.loadQuizzes(quiz.lesson.lessonId!);
        this.isVisible = false;
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  deleteQuiz(quizId: number): void {
    this.modal.confirm({
      nzTitle: 'Are you sure?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        this.quizService.deleteQuiz(quizId).subscribe(() => {
          this.notification.success('Success', 'Quiz deleted');
          // Ensure this.quizForm.value.lesson is handled for potential undefined
          if (this.quizForm.value.lesson !== undefined && this.quizForm.value.lesson !== null) {
            this.loadQuizzes(this.quizForm.value.lesson);
          } else if (this.selectedLessonId !== null) { // Fallback to current selected lesson
             this.loadQuizzes(this.selectedLessonId);
          } else {
             this.notification.warning('Warning', 'Cannot reload quizzes: Lesson not selected.');
          }
        });
      }
    });
  }
}
