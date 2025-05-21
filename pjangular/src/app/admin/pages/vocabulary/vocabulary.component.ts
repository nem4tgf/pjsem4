import { Component } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-vocabulary',
  templateUrl: './vocabulary.component.html',
  styleUrls: ['./vocabulary.component.css']
})
export class VocabularyComponent {
  filteredVocabulary: any[] = [
    { word_id: 1, word: 'apple', meaning: 'Quả táo', example_sentence: 'I eat an apple every day.', pronunciation: '/ˈæpəl/', audio_url: 'https://example.com/apple.mp3', difficulty_level: 'easy' },
    { word_id: 2, word: 'beautiful', meaning: 'Đẹp', example_sentence: 'The sunset is beautiful.', pronunciation: '/ˈbjuːtɪfl/', audio_url: 'https://example.com/beautiful.mp3', difficulty_level: 'medium' }
  ];
  isEditModalVisible = false;
  selectedVocab: any = { word_id: 0, word: '', meaning: '', example_sentence: '', pronunciation: '', audio_url: '', difficulty_level: 'medium' };

  constructor(private notification: NzNotificationService) {}

  sortByWord = (a: any, b: any) => a.word.localeCompare(b.word);

  onCurrentPageDataChange(event: any): void {
    this.filteredVocabulary = event;
  }

  showModal(vocab?: any): void {
    if (vocab) {
      this.selectedVocab = { ...vocab };
    } else {
      this.selectedVocab = { word_id: 0, word: '', meaning: '', example_sentence: '', pronunciation: '', audio_url: '', difficulty_level: 'medium' };
    }
    this.isEditModalVisible = true;
  }

  handleOk(): void {
    if (this.selectedVocab.word_id === 0) {
      this.selectedVocab.word_id = this.filteredVocabulary.length + 1;
      this.filteredVocabulary.push({ ...this.selectedVocab });
      this.notification.success('Thành công', 'Thêm từ vựng thành công');
    } else {
      this.filteredVocabulary = this.filteredVocabulary.map(v =>
        v.word_id === this.selectedVocab.word_id ? { ...this.selectedVocab } : v
      );
      this.notification.success('Thành công', 'Cập nhật từ vựng thành công');
    }
    this.isEditModalVisible = false;
  }

  handleCancel(): void {
    this.isEditModalVisible = false;
  }

  deleteVocab(id: number): void {
    this.filteredVocabulary = this.filteredVocabulary.filter(v => v.word_id !== id);
    this.notification.success('Thành công', 'Xóa từ vựng thành công');
  }
}
