// src/app/admin/pages/vocabulary/vocabulary.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Vocabulary, DifficultyLevel, VocabularyRequest } from 'src/app/interface/vocabulary.interface'; // Import VocabularyRequest
import { VocabularyService } from 'src/app/service/vocabulary.service';

@Component({
  selector: 'app-vocabulary',
  templateUrl: './vocabulary.component.html',
  styleUrls: ['./vocabulary.component.css']
})
export class VocabularyComponent implements OnInit {
  vocabularies: Vocabulary[] = [];
  isVisible = false;
  isEdit = false;
  vocabularyForm: FormGroup;
  difficultyLevels = Object.values(DifficultyLevel); // Lấy giá trị của enum

  constructor(
    private vocabularyService: VocabularyService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {
    this.vocabularyForm = this.fb.group({
      wordId: [null], // Dùng để lưu wordId khi edit
      word: ['', [Validators.required, Validators.minLength(2)]], // Thêm minLength validator
      meaning: ['', [Validators.required, Validators.minLength(2)]], // Thêm minLength validator
      exampleSentence: [''],
      pronunciation: [''],
      audioUrl: [''],
      writingPrompt: [''],
      difficultyLevel: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadVocabularies();
  }

  loadVocabularies(): void {
    // Để trống searchRequest để lấy tất cả, hoặc thêm phân trang nếu muốn
    this.vocabularyService.searchVocabularies().subscribe({
      next: (pageResponse) => { // Nhận về VocabularyPage
        this.vocabularies = pageResponse.content; // Lấy mảng content từ response
        console.log('Loaded vocabularies:', this.vocabularies);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải danh sách từ vựng: ' + (err.error?.message || 'Lỗi không xác định'));
        console.error('Load vocabularies error:', err);
      }
    });
  }

  showModal(isEdit: boolean, vocabulary?: Vocabulary): void {
    this.isEdit = isEdit;
    this.vocabularyForm.reset(); // Reset form trước khi mở modal

    if (isEdit && vocabulary) {
      this.vocabularyForm.patchValue(vocabulary);
    }
    this.isVisible = true;
  }

  handleOk(): void {
    // Đánh dấu tất cả các trường là đã chạm để hiển thị lỗi validation
    for (const i in this.vocabularyForm.controls) {
      this.vocabularyForm.controls[i].markAsDirty();
      this.vocabularyForm.controls[i].updateValueAndValidity();
    }

    if (this.vocabularyForm.invalid) {
      this.notification.error('Lỗi', 'Vui lòng điền đầy đủ và đúng các trường bắt buộc.');
      return;
    }

    // Tạo payload từ form value, loại bỏ wordId nếu là tạo mới
    const vocabularyPayload: VocabularyRequest = {
        word: this.vocabularyForm.value.word,
        meaning: this.vocabularyForm.value.meaning,
        exampleSentence: this.vocabularyForm.value.exampleSentence || null,
        pronunciation: this.vocabularyForm.value.pronunciation || null,
        audioUrl: this.vocabularyForm.value.audioUrl || null,
        // imageUrl: this.vocabularyForm.value.imageUrl || null, // Thêm nếu có trong form
        writingPrompt: this.vocabularyForm.value.writingPrompt || null,
        difficultyLevel: this.vocabularyForm.value.difficultyLevel
    };

    if (this.isEdit) {
      const wordId = this.vocabularyForm.value.wordId;
      if (wordId === null) {
        this.notification.error('Lỗi', 'ID từ vựng bị thiếu để cập nhật.');
        return;
      }
      this.vocabularyService.updateVocabulary(wordId, vocabularyPayload).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Từ vựng đã được cập nhật!');
          this.loadVocabularies();
          this.isVisible = false;
        },
        error: (err) => {
          this.notification.error('Lỗi', 'Cập nhật từ vựng thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
          console.error('Update vocabulary error:', err);
        }
      });
    } else {
      this.vocabularyService.createVocabulary(vocabularyPayload).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Từ vựng đã được tạo!');
          this.loadVocabularies();
          this.isVisible = false;
        },
        error: (err) => {
          this.notification.error('Lỗi', 'Tạo từ vựng thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
          console.error('Create vocabulary error:', err);
        }
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  deleteVocabulary(wordId: number): void {
    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa từ vựng này?',
      nzContent: 'Hành động này không thể hoàn tác.',
      nzOkText: 'Có',
      nzOkDanger: true,
      nzCancelText: 'Không',
      nzOnOk: () => {
        this.vocabularyService.deleteVocabulary(wordId).subscribe({
          next: () => {
            this.notification.success('Thành công', 'Từ vựng đã được xóa!');
            this.loadVocabularies(); // Tải lại danh sách sau khi xóa
            // Không cần this.isVisible = false; ở đây vì đây là modal riêng biệt
          },
          error: (err) => {
            this.notification.error('Lỗi', 'Xóa từ vựng thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
            console.error('Delete vocabulary error:', err);
          }
        });
      }
    });
  }
}
