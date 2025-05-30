import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { QuizResult } from 'src/app/interface/quiz-result.interface';
import { User } from 'src/app/interface/user.interface';
import { Quiz } from 'src/app/interface/quiz.interface';
import { QuizResultService } from 'src/app/service/quiz-result.service';
import { UserService } from 'src/app/service/user.service';
import { QuizService } from 'src/app/service/quiz.service';

@Component({
  selector: 'app-quiz-results',
  templateUrl: './quiz-results.component.html',
  styleUrls: ['./quiz-results.component.css']
})
export class QuizResultsComponent implements OnInit {
  results: QuizResult[] = [];
  users: User[] = [];
  quizzes: Quiz[] = [];
  resultForm: FormGroup;

  constructor(
    private resultService: QuizResultService,
    private userService: UserService,
    private quizService: QuizService,
    private fb: FormBuilder,
    private notification: NzNotificationService
  ) {
    this.resultForm = this.fb.group({
      userId: [null, Validators.required],
      quizId: [null, Validators.required],
      score: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadQuizzes();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  loadQuizzes(): void {
    this.quizService.getAllQuizzes().subscribe(quizzes => {
      this.quizzes = quizzes;
    });
  }

  loadResults(): void {
    if (this.resultForm.value.userId) {
      this.resultService.getQuizResultsByUser(this.resultForm.value.userId).subscribe(results => {
        this.results = results;
      });
    }
  }

  saveResult(): void {
    if (this.resultForm.invalid) {
      this.resultForm.markAllAsTouched();
      return;
    }
    const result: QuizResult = {
      ...this.resultForm.value,
      user: this.users.find(u => u.userId === this.resultForm.value.userId)!,
      quiz: this.quizzes.find(q => q.quizId === this.resultForm.value.quizId)!
    };
    this.resultService.saveQuizResult(result).subscribe(() => {
      this.notification.success('Success', 'Result saved');
      this.loadResults();
    });
  }
}
