// src/app/admin/pages/flashcards/flashcards.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Giữ lại nếu bạn có form nào khác dùng FormBuilder
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Flashcard, MarkFlashcardRequest } from 'src/app/interface/flashcard.interface';
import { User } from 'src/app/interface/user.interface'; // Giữ lại nếu bạn có users: User[] = [];
import { Lesson } from 'src/app/interface/lesson.interface';
import { FlashcardService } from 'src/app/service/flashcard.service';
import { UserService } from 'src/app/service/user.service'; // Giữ lại nếu bạn có users: User[] = [];
import { LessonService } from 'src/app/service/lesson.service';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-flashcards',
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.css']
})
export class FlashcardsComponent implements OnInit {
  flashcards: Flashcard[] = [];
  // users: User[] = []; // Đã comment vì không dùng trong template hiện tại để lấy tên người dùng
  lessons: Lesson[] = [];
  currentUserId: number | null = null;
  selectedLessonId: number | null = null;

  constructor(
    private flashcardService: FlashcardService,
    // private userService: UserService, // Đã comment vì không dùng trong template hiện tại để lấy tên người dùng
    private lessonService: LessonService,
    private fb: FormBuilder, // Giữ lại nếu bạn có form nào khác
    private notification: NzNotificationService,
    private apiService: ApiService
  ) {
    // Không cần khởi tạo flashcardForm ở đây nếu đã xóa khỏi HTML
  }

  ngOnInit(): void {
    this.loadLessons();
    this.apiService.getCurrentUser().subscribe({
      next: (user) => {
        // Khắc phục lỗi: Type 'number | undefined' is not assignable to type 'number | null'.
        if (user && user.userId !== undefined && user.userId !== null) {
          this.currentUserId = user.userId;
          // Có thể load flashcards ở đây nếu có lessonId mặc định hoặc đã được chọn
          // if (this.selectedLessonId !== null) {
          //   this.loadFlashcards();
          // }
        } else {
          this.notification.error('Error', 'User ID not found. Please log in.');
          console.error('User ID is null or undefined.');
          // Có thể redirect về trang login nếu cần
        }
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to get current user information. Please log in.');
        console.error(err);
      }
    });
  }

  loadLessons(): void {
    // Khắc phục lỗi: Property 'getLessons' does not exist on type 'LessonService'. Did you mean 'getAllLessons'?
    this.lessonService.getAllLessons().subscribe({
      // Khắc phục lỗi: Parameter 'lessons' implicitly has an 'any' type.
      next: (lessons: Lesson[]) => { // Đã thêm kiểu tường minh
        this.lessons = lessons;
      },
      error: () => {
        this.notification.error('Error', 'Failed to load lessons');
      }
    });
  }

  loadFlashcards(): void {
    if (this.selectedLessonId !== null && this.currentUserId !== null) {
      this.flashcardService.getFlashcardsByLesson(this.selectedLessonId, this.currentUserId).subscribe({
        next: (flashcards) => {
          this.flashcards = flashcards;
        },
        error: () => {
          this.notification.error('Error', 'Failed to load flashcards');
        }
      });
    } else {
      this.notification.warning('Warning', 'Please select a lesson and ensure user is logged in.');
    }
  }

  toggleIsKnown(flashcard: Flashcard, isKnown: boolean): void {
    if (this.currentUserId === null) {
      this.notification.error('Error', 'User not identified. Cannot mark flashcard.');
      return;
    }

    const request: MarkFlashcardRequest = {
      id: flashcard.wordId, // GIẢ ĐỊNH: id trong MarkFlashcardRequest là wordId
      userId: this.currentUserId,
      wordId: flashcard.wordId, // Thêm lại nếu backend cần cả wordId riêng biệt
      isKnown: isKnown
    };

    this.flashcardService.markFlashcard(request).subscribe({
      next: () => {
        this.notification.success('Success', `Flashcard marked as ${isKnown ? 'Known' : 'Unknown'}.`);
        flashcard.isKnown = isKnown;
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to mark flashcard.');
        console.error('Mark Flashcard Error:', err);
      }
    });
  }


}
