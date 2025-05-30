import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Question } from 'src/app/interface/question.interface';
import { Quiz, Skill } from 'src/app/interface/quiz.interface';
import { QuestionService } from 'src/app/service/question.service';
import { QuizService } from 'src/app/service/quiz.service';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {
  questions: Question[] = [];
  quizzes: Quiz[] = [];
  isVisible = false;
  isEdit = false;
  questionForm: FormGroup;
  skills = Object.values(Skill);
  selectedQuizId: number | null = null; // <-- ADD THIS LINE

  constructor(
    private questionService: QuestionService,
    private quizService: QuizService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {
    this.questionForm = this.fb.group({
      questionId: [null],
      quiz: [null, Validators.required],
      questionText: ['', Validators.required],
      skill: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.quizService.getAllQuizzes().subscribe(quizzes => {
      this.quizzes = quizzes;
    });
  }

  loadQuestions(quizId: number): void {
    this.questionService.getQuestionsByQuizId(quizId).subscribe(questions => {
      this.questions = questions;
    });
  }

  showModal(isEdit: boolean, question?: Question): void {
    this.isEdit = isEdit;
    if (isEdit && question) {
      this.questionForm.patchValue({
        ...question,
        quiz: question.quiz.quizId
      });
    } else {
      this.questionForm.reset();
    }
    this.isVisible = true;
  }

  handleOk(): void {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }
    const question: Question = {
      ...this.questionForm.value,
      quiz: this.quizzes.find(q => q.quizId === this.questionForm.value.quiz)!
    };
    if (this.isEdit) {
      this.questionService.updateQuestion(question.questionId!, question).subscribe(() => {
        this.notification.success('Success', 'Question updated');
        this.loadQuestions(question.quiz.quizId!);
        this.isVisible = false;
      });
    } else {
      this.questionService.createQuestion(question).subscribe(() => {
        this.notification.success('Success', 'Question created');
        this.loadQuestions(question.quiz.quizId!);
        this.isVisible = false;
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  deleteQuestion(questionId: number): void {
    this.modal.confirm({
      nzTitle: 'Are you sure?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        this.questionService.deleteQuestion(questionId).subscribe(() => {
          this.notification.success('Success', 'Question deleted');
          // Ensure this.questionForm.value.quiz is handled for potential undefined
          if (this.questionForm.value.quiz !== undefined && this.questionForm.value.quiz !== null) {
            this.loadQuestions(this.questionForm.value.quiz);
          } else {
            // Handle case where quizId might be missing, e.g., reload all questions or notify user
            this.notification.warning('Warning', 'Cannot reload questions: Quiz not selected.');
          }
        });
      }
    });
  }
}
