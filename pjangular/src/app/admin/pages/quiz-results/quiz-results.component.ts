// src/app/admin/pages/quiz-results/quiz-results.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { QuizResult } from 'src/app/interface/quiz-result.interface';
import { User } from 'src/app/interface/user.interface';
import { Quiz } from 'src/app/interface/quiz.interface'; // Đảm bảo bạn có interface Quiz này

import { QuizResultService } from 'src/app/service/quiz-result.service';
import { UserService } from 'src/app/service/user.service';
import { QuizService } from 'src/app/service/quiz.service'; // Đảm bảo bạn có QuizService này
import { ApiService } from 'src/app/service/api.service'; // Đảm bảo bạn có ApiService này

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
  isAdmin: boolean = false;

  // Biến để lưu userId đang được chọn từ dropdown
  selectedUserId: number | null = null;

  constructor(
    private resultService: QuizResultService,
    private userService: UserService,
    private quizService: QuizService, // Inject QuizService
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private apiService: ApiService
  ) {
    this.resultForm = this.fb.group({
      // resultId không cần thiết trong form khi tạo/lưu
      userId: [null, Validators.required],
      quizId: [null, Validators.required],
      score: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
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
          this.loadQuizzes();
          // loadResults() sẽ được gọi sau khi users được tải và selectedUserId được set
        } else {
          this.notification.warning('Warning', 'You do not have administrative privileges to view quiz results.');
          this.results = []; // Xóa dữ liệu cũ nếu không có quyền
        }
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to verify admin role.');
        console.error('Admin role check error:', err);
        this.isAdmin = false; // Đảm bảo isAdmin là false nếu có lỗi
        this.results = []; // Xóa dữ liệu cũ nếu có lỗi
      }
    });
  }

  loadUsers(): void {
    if (!this.isAdmin) return; // Chỉ tải nếu là admin
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Loaded all users:', this.users);
        if (this.users.length > 0) {
          // Nếu chưa có user nào được chọn hoặc user đã chọn không còn trong danh sách mới
          if (this.selectedUserId === null || !this.users.some(u => u.userId === this.selectedUserId)) {
            // SỬA LỖI TẠI ĐÂY: Kiểm tra kỹ userId của user đầu tiên trước khi gán
            if (this.users[0].userId !== undefined && this.users[0].userId !== null) {
              this.selectedUserId = this.users[0].userId; // CHỌN USER ĐẦU TIÊN LÀM MẶC ĐỊNH
              this.resultForm.get('userId')?.setValue(this.selectedUserId); // Đặt giá trị cho form control
              this.loadResults(); // GỌI loadResults() SAU KHI CÓ userId MẶC ĐỊNH
            } else {
              console.warn('First user in the list has a null or undefined userId. Cannot set as default selected user.');
              this.selectedUserId = null; // Đảm bảo selectedUserId là null nếu không thể gán
              this.resultForm.get('userId')?.setValue(null); // Reset form control
              this.results = []; // Không có user để load
              this.notification.info('Info', 'No valid user ID found to load quiz results by default.');
            }
          } else {
            // Nếu selectedUserId đã có và hợp lệ, chỉ cần cập nhật form và load lại results
            this.resultForm.get('userId')?.setValue(this.selectedUserId);
            this.loadResults();
          }
        } else {
          this.results = []; // Không có user nào thì không có kết quả
          this.selectedUserId = null; // Đảm bảo selectedUserId là null khi không có user
          this.resultForm.get('userId')?.setValue(null); // Reset form control
          this.notification.info('Info', 'No users available to display quiz results.');
        }
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to load users.');
        console.error('Load users error:', err);
      }
    });
  }

  loadQuizzes(): void {
    if (!this.isAdmin) return; // Chỉ tải nếu là admin
    this.quizService.getAllQuizzes().subscribe({ // Gọi API để lấy tất cả quiz
      next: (quizzes) => {
        this.quizzes = quizzes;
        console.log('Loaded all quizzes:', this.quizzes);
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to load quizzes.');
        console.error('Load quizzes error:', err);
      }
    });
  }

  loadResults(): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to view quiz results.');
      return;
    }
    // Lấy userId từ biến selectedUserId hoặc từ form control
    const userIdToLoad = this.selectedUserId; // Luôn dùng selectedUserId vì nó được cập nhật qua dropdown
    if (userIdToLoad !== null && userIdToLoad !== undefined) {
      this.resultService.getQuizResultsByUser(userIdToLoad).subscribe({
        next: (results) => {
          this.results = results;
          console.log(`Loaded results for user ${userIdToLoad}:`, this.results);
        },
        error: (err) => {
          this.notification.error('Error', `Failed to load results for user ${userIdToLoad}.`);
          console.error('Load results error:', err);
          this.results = []; // Xóa kết quả nếu có lỗi
        }
      });
    } else {
      this.results = [];
      this.notification.info('Info', 'Please select a user to view quiz results.');
    }
  }

  // Hàm này sẽ được gọi khi người dùng thay đổi lựa chọn trong dropdown user
  onUserChange(userId: number | null): void { // Kiểu dữ liệu có thể là number hoặc null
    this.selectedUserId = userId; // Cập nhật biến selectedUserId
    this.resultForm.get('userId')?.setValue(userId); // Cập nhật form control
    if (userId !== null) {
      this.loadResults(); // Tải lại kết quả cho user mới chọn
    } else {
      this.results = []; // Nếu không chọn user, xóa bảng kết quả
    }
  }

  saveResult(): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to save quiz results.');
      return;
    }
    if (this.resultForm.invalid) {
      this.resultForm.markAllAsTouched();
      this.notification.error('Error', 'Please fill in all required fields correctly.');
      console.error(
        'Form is invalid. Errors:',
        this.resultForm.controls['userId']?.errors,
        this.resultForm.controls['quizId']?.errors,
        this.resultForm.controls['score']?.errors
      );
      return;
    }

    const resultToSend: QuizResult = {
      userId: this.resultForm.get('userId')?.value,
      quizId: this.resultForm.get('quizId')?.value,
      score: this.resultForm.get('score')?.value
      // resultId và completedAt sẽ được backend xử lý
    };

    console.log('QuizResult object to send:', resultToSend);

    this.resultService.saveQuizResult(resultToSend).subscribe({
      next: () => {
        this.notification.success('Success', 'Quiz result saved successfully!');
        this.loadResults(); // Tải lại kết quả cho user đã chọn
        // Nếu bạn muốn reset form sau khi lưu, bạn có thể thêm:
        // this.resultForm.get('quizId')?.reset(); // Reset quizId
        // this.resultForm.get('score')?.setValue(0); // Reset score về 0
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to save quiz result: ' + (err.error?.message || 'Unknown error'));
        console.error('Save quiz result error:', err);
      }
    });
  }

  // Hàm helper để hiển thị username từ userId
  getUserUsername(userId: number | undefined): string {
    if (userId == null) { // Kiểm tra cả null và undefined
      return 'N/A';
    }
    const user = this.users.find(u => u.userId === userId);
    return user ? user.username : 'N/A';
  }

  // Hàm helper để hiển thị quiz title từ quizId
  getQuizTitle(quizId: number | undefined): string {
    if (quizId == null) { // Kiểm tra cả null và undefined
      return 'N/A';
    }
    const quiz = this.quizzes.find(q => q.quizId === quizId);
    return quiz ? quiz.title : 'N/A';
  }
}
