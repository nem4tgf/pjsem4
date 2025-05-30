import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Answer } from 'src/app/interface/answer.interface';
import { Question } from 'src/app/interface/question.interface';
import { AnswerService } from 'src/app/service/answer.service';
import { QuestionService } from 'src/app/service/question.service';

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.css']
})
export class AnswersComponent implements OnInit {
  answers: Answer[] = [];
  questions: Question[] = [];
  isVisible = false;
  isEdit = false;
  answerForm: FormGroup;
  selectedQuestionId: number | null = null; // --- THÊM DÒNG NÀY ---

  constructor(
    private answerService: AnswerService,
    private questionService: QuestionService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {
    this.answerForm = this.fb.group({
      answerId: [null],
      question: [null, Validators.required],
      answerText: ['', Validators.required],
      isCorrect: [false, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.questionService.getQuestionsByQuizId(1).subscribe(questions => {
      this.questions = questions;
    });
  }

  loadAnswers(questionId: number): void {
    this.answerService.getAnswersByQuestionId(questionId).subscribe(answers => {
      this.answers = answers;
    });
  }

  showModal(isEdit: boolean, answer?: Answer): void {
    this.isEdit = isEdit;
    if (isEdit && answer) {
      this.answerForm.patchValue({
        ...answer,
        question: answer.question.questionId
      });
    } else {
      this.answerForm.reset({ isCorrect: false });
    }
    this.isVisible = true;
  }

  handleOk(): void {
    if (this.answerForm.invalid) {
      this.answerForm.markAllAsTouched();
      return;
    }
    const answer: Answer = {
      ...this.answerForm.value,
      // Thêm kiểm tra null/undefined cho `find` nếu có thể không tìm thấy
      question: this.questions.find(q => q.questionId === this.answerForm.value.question)!
    };
    if (this.isEdit) {
      // Đảm bảo `answer.answerId` không phải `undefined` nếu bạn gọi API
      this.answerService.updateAnswer(answer.answerId!, answer).subscribe(() => {
        this.notification.success('Success', 'Answer updated');
        // Đảm bảo `answer.question.questionId` không phải `undefined`
        this.loadAnswers(answer.question.questionId!);
        this.isVisible = false;
      });
    } else {
      this.answerService.createAnswer(answer).subscribe(() => {
        this.notification.success('Success', 'Answer created');
        // Đảm bảo `answer.question.questionId` không phải `undefined`
        this.loadAnswers(answer.question.questionId!);
        this.isVisible = false;
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  deleteAnswer(answerId: number): void {
    this.modal.confirm({
      nzTitle: 'Are you sure?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        this.answerService.deleteAnswer(answerId).subscribe(() => {
          this.notification.success('Success', 'Answer deleted');
          // Đảm bảo `this.answerForm.value.question` không phải `undefined` trước khi truyền vào loadAnswers
          this.loadAnswers(this.answerForm.value.question);
        });
      }
    });
  }
}
