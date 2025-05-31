// src/app/admin/pages/questions/questions.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Question } from 'src/app/interface/question.interface';
import { Quiz, Skill } from 'src/app/interface/quiz.interface';
import { QuestionService } from 'src/app/service/question.service';
import { QuizService } from 'src/app/service/quiz.service';
import { ApiService } from 'src/app/service/api.service'; // <-- Import ApiService

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
  selectedQuizId: number | null = null;
  isAdmin: boolean = false; // Thuộc tính để kiểm tra admin status

  constructor(
    private questionService: QuestionService,
    private quizService: QuizService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private apiService: ApiService // <-- Inject ApiService thay vì AuthService
  ) {
    this.questionForm = this.fb.group({
      questionId: [null],
      quizId: [null, Validators.required],
      questionText: ['', Validators.required],
      skill: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.checkAdminStatus(); // Kiểm tra trạng thái admin khi khởi tạo component
    this.loadQuizzes();
  }

  checkAdminStatus(): void {
    this.apiService.checkAdminRole().subscribe( // <-- Gọi apiService.checkAdminRole()
      (isAdmin: boolean) => {
        this.isAdmin = isAdmin;
        if (!isAdmin) {
          this.notification.warning('Permission Denied', 'Bạn không có quyền truy cập trang quản lý câu hỏi.');
        }
      },
      error => {
        console.error('Error checking admin status:', error);
        this.isAdmin = false; // Mặc định không phải admin nếu có lỗi
        this.notification.error('Error', 'Không thể kiểm tra trạng thái quản trị viên.');
      }
    );
  }

  loadQuizzes(): void {
    this.quizService.getAllQuizzes().subscribe(
      quizzes => {
        this.quizzes = quizzes;
        if (this.selectedQuizId !== null && this.selectedQuizId !== undefined) {
          this.loadQuestions(this.selectedQuizId);
        } else if (quizzes.length > 0 && quizzes[0].quizId !== undefined && quizzes[0].quizId !== null) {
          this.selectedQuizId = quizzes[0].quizId;
          this.loadQuestions(this.selectedQuizId);
        }
      },
      error => {
        this.notification.error('Error', 'Không thể tải danh sách bài kiểm tra.');
        console.error('Lỗi tải bài kiểm tra:', error);
        this.quizzes = [];
      }
    );
  }

  loadQuestions(quizId: number): void {
    this.questionService.getQuestionsByQuizId(quizId).subscribe(
      questions => {
        this.questions = questions;
      },
      error => {
        this.notification.error('Error', `Không thể tải câu hỏi cho Quiz ID: ${quizId}`);
        this.questions = [];
        console.error('Lỗi tải câu hỏi:', error);
      }
    );
  }

  showModal(isEdit: boolean, question?: Question): void {
    this.isEdit = isEdit;
    if (isEdit && question) {
      this.questionForm.patchValue({
        questionId: question.questionId,
        quizId: question.quizId,
        questionText: question.questionText,
        skill: question.skill
      });
    } else {
      this.questionForm.reset();
      if (this.selectedQuizId !== null) {
        this.questionForm.get('quizId')?.setValue(this.selectedQuizId);
      }
    }
    this.isVisible = true;
  }

  handleOk(): void {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      this.notification.error('Error', 'Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    const formValue = this.questionForm.value;
    const questionToSave: Question = {
      questionId: formValue.questionId,
      quizId: formValue.quizId,
      questionText: formValue.questionText,
      skill: formValue.skill
    };

    if (this.isEdit) {
      if (questionToSave.questionId === null || questionToSave.questionId === undefined) {
          this.notification.error('Error', 'ID câu hỏi bị thiếu để cập nhật.');
          return;
      }
      this.questionService.updateQuestion(questionToSave.questionId, questionToSave).subscribe(
        () => {
          this.notification.success('Thành công', 'Câu hỏi đã được cập nhật.');
          this.loadQuestions(questionToSave.quizId);
          this.isVisible = false;
        },
        error => {
          this.notification.error('Lỗi', 'Không thể cập nhật câu hỏi.');
          console.error('Lỗi cập nhật:', error);
        }
      );
    } else {
      this.questionService.createQuestion(questionToSave).subscribe(
        () => {
          this.notification.success('Thành công', 'Câu hỏi đã được tạo.');
          this.loadQuestions(questionToSave.quizId);
          this.isVisible = false;
        },
        error => {
          this.notification.error('Lỗi', 'Không thể tạo câu hỏi.');
          console.error('Lỗi tạo:', error);
        }
      );
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  deleteQuestion(questionId: number): void {
    this.modal.confirm({
      nzTitle: 'Bạn có chắc không?',
      nzContent: 'Hành động này không thể hoàn tác. Bạn có muốn xóa câu hỏi này không?',
      nzOkText: 'Có',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Không',
      nzOnOk: () => {
        this.questionService.deleteQuestion(questionId).subscribe(
          () => {
            this.notification.success('Thành công', 'Câu hỏi đã được xóa.');
            if (this.selectedQuizId !== null) {
              this.loadQuestions(this.selectedQuizId);
            } else {
              this.notification.warning('Cảnh báo', 'Câu hỏi đã được tải lại trong bài kiểm tra được chọn hiện tại (nếu có).');
            }
          },
          error => {
            this.notification.error('Lỗi', 'Không thể xóa câu hỏi.');
            console.error('Lỗi xóa:', error);
          }
        );
      }
    });
  }

  getQuizTitle(quizId: number): string {
    const quiz = this.quizzes.find(q => q.quizId === quizId);
    return quiz ? quiz.title : 'Quiz không xác định';
  }
}
