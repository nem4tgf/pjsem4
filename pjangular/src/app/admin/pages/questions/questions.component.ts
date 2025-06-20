// src/app/admin/pages/questions/questions.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Question } from 'src/app/interface/question.interface';
import { Quiz, Skill } from 'src/app/interface/quiz.interface'; // Giả sử Skill cũng có trong quiz.interface
import { QuestionService } from 'src/app/service/question.service';
import { QuizService } from 'src/app/service/quiz.service';
import { ApiService } from 'src/app/service/api.service';

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
  isAdmin: boolean = false;

  // Thuộc tính cho chức năng tìm kiếm
  searchText: string = '';
  selectedSearchSkill: Skill | null = null;
  selectedSearchQuizId: number | null = null; // Dùng riêng cho tìm kiếm nếu muốn lọc độc lập

  constructor(
    private questionService: QuestionService,
    private quizService: QuizService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private apiService: ApiService
  ) {
    this.questionForm = this.fb.group({
      questionId: [null],
      quizId: [null, Validators.required],
      questionText: ['', Validators.required],
      skill: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.checkAdminStatus();
    this.loadQuizzes();
    // Ban đầu tải tất cả câu hỏi hoặc không tải gì cho đến khi có bộ lọc
    // Để hiển thị tất cả ban đầu, gọi searchQuestions() không có tham số
    this.searchQuestions();
  }

  checkAdminStatus(): void {
    this.apiService.checkAdminRole().subscribe(
      (isAdmin: boolean) => {
        this.isAdmin = isAdmin;
        if (!isAdmin) {
          this.notification.warning('Permission Denied', 'Bạn không có quyền truy cập trang quản lý câu hỏi.');
        }
      },
      error => {
        console.error('Error checking admin status:', error);
        this.isAdmin = false;
        this.notification.error('Error', 'Không thể kiểm tra trạng thái quản trị viên.');
      }
    );
  }

  loadQuizzes(): void {
    this.quizService.getAllQuizzes().subscribe(
      quizzes => {
        this.quizzes = quizzes;
        // Cập nhật selectedSearchQuizId nếu có quiz để hiển thị trong bộ lọc
        if (quizzes.length > 0 && this.selectedSearchQuizId === null) {
          // Bạn có thể chọn để mặc định chọn quiz đầu tiên hoặc để trống
          // this.selectedSearchQuizId = quizzes[0].quizId;
        }
      },
      error => {
        this.notification.error('Error', 'Không thể tải danh sách bài kiểm tra.');
        console.error('Lỗi tải bài kiểm tra:', error);
        this.quizzes = [];
      }
    );
  }

  // Phương thức này hiện tại chỉ tải câu hỏi theo Quiz ID CỤ THỂ
  // Giữ lại nếu bạn vẫn muốn chức năng "hiển thị theo Quiz" riêng biệt.
  // Nếu bạn muốn chức năng này là một phần của tìm kiếm chung, có thể bỏ qua.
  loadQuestions(quizId: number): void {
     // Khi chọn Quiz từ dropdown, hãy cập nhật bộ lọc tìm kiếm và gọi searchQuestions
     this.selectedSearchQuizId = quizId;
     this.searchQuestions();
  }


  /**
   * Phương thức để thực hiện tìm kiếm câu hỏi dựa trên các tiêu chí.
   * Nó sẽ sử dụng các thuộc tính `searchText`, `selectedSearchSkill`, `selectedSearchQuizId`
   * của component để truyền vào service.
   */
  searchQuestions(): void {
    this.questionService.searchQuestions(
      this.selectedSearchQuizId || undefined, // Truyền undefined nếu null
      this.selectedSearchSkill || undefined, // Truyền undefined nếu null
      this.searchText || undefined // Truyền undefined nếu rỗng
    ).subscribe(
      questions => {
        this.questions = questions;
      },
      error => {
        this.notification.error('Error', `Không thể tải câu hỏi.`);
        this.questions = [];
        console.error('Lỗi tải câu hỏi:', error);
      }
    );
  }

  // Khi người dùng thay đổi Quiz trong dropdown lọc, gọi searchQuestions
  onSearchQuizChange(quizId: number | null): void {
    this.selectedSearchQuizId = quizId;
    this.searchQuestions();
  }

  // Khi người dùng thay đổi Skill trong dropdown lọc, gọi searchQuestions
  onSearchSkillChange(skill: Skill | null): void {
    this.selectedSearchSkill = skill;
    this.searchQuestions();
  }

  // Khi người dùng gõ vào ô tìm kiếm văn bản, có thể sử dụng (keyup) hoặc (ngModelChange)
  // và gọi searchQuestions
  onSearchTextChange(): void {
    // Để tránh quá nhiều request khi người dùng đang gõ, bạn có thể cân nhắc debounceTime ở đây
    this.searchQuestions();
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
      // Khi thêm mới, mặc định chọn Quiz đang được chọn trong bộ lọc (nếu có)
      if (this.selectedSearchQuizId !== null) {
        this.questionForm.get('quizId')?.setValue(this.selectedSearchQuizId);
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
          // Sau khi cập nhật, gọi searchQuestions để tải lại danh sách với các bộ lọc hiện tại
          this.searchQuestions();
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
          // Sau khi tạo, gọi searchQuestions để tải lại danh sách với các bộ lọc hiện tại
          this.searchQuestions();
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
            // Sau khi xóa, gọi searchQuestions để tải lại danh sách với các bộ lọc hiện tại
            this.searchQuestions();
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
