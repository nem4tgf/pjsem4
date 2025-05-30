import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Flashcard } from 'src/app/interface/flashcard.interface';
import { User } from 'src/app/interface/user.interface';
import { Vocabulary } from 'src/app/interface/vocabulary.interface';
import { FlashcardService } from 'src/app/service/flashcard.service';
import { UserService } from 'src/app/service/user.service';
import { VocabularyService } from 'src/app/service/vocabulary.service';

@Component({
  selector: 'app-flashcards',
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.css']
})
export class FlashcardsComponent implements OnInit {
  flashcards: Flashcard[] = [];
  users: User[] = [];
  vocabulary: Vocabulary[] = [];
  flashcardForm: FormGroup;
  selectedLessonId: number | null = null;

  constructor(
    private flashcardService: FlashcardService,
    private userService: UserService,
    private vocabularyService: VocabularyService,
    private fb: FormBuilder,
    private notification: NzNotificationService
  ) {
    this.flashcardForm = this.fb.group({
      userId: [null, Validators.required],
      wordId: [null, Validators.required],
      isKnown: [false, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadVocabulary();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: () => {
        this.notification.error('Error', 'Failed to load users');
      }
    });
  }

  loadVocabulary(): void {
    this.vocabularyService.getAllVocabulary().subscribe({
      next: (vocabulary) => {
        this.vocabulary = vocabulary;
      },
      error: () => {
        this.notification.error('Error', 'Failed to load vocabulary');
      }
    });
  }

  loadFlashcards(): void {
    if (this.selectedLessonId && this.flashcardForm.value.userId) {
      this.flashcardService.getFlashcardsByLesson(this.selectedLessonId, this.flashcardForm.value.userId).subscribe({
        next: (flashcards) => {
          this.flashcards = flashcards;
        },
        error: () => {
          this.notification.error('Error', 'Failed to load flashcards');
        }
      });
    }
  }

  markFlashcard(): void {
    if (this.flashcardForm.invalid) {
      this.flashcardForm.markAllAsTouched();
      return;
    }
    const flashcard: Flashcard = this.flashcardForm.value;
    this.flashcardService.markFlashcard(flashcard).subscribe({
      next: () => {
        this.notification.success('Success', 'Flashcard marked');
        this.loadFlashcards();
      },
      error: () => {
        this.notification.error('Error', 'Failed to mark flashcard');
      }
    });
  }

  // --- THÊM HAI PHƯƠNG THỨC NÀY ---
  getUserName(userId: number | undefined): string {
    const user = this.users.find(u => u.userId === userId);
    return user?.username || 'Unknown'; // Sử dụng optional chaining và nullish coalescing
  }

  getWord(wordId: number | undefined): string {
    const vocab = this.vocabulary.find(v => v.wordId === wordId);
    return vocab?.word || 'Unknown'; // Sử dụng optional chaining và nullish coalescing
  }
}
