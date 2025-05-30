import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Vocabulary, DifficultyLevel } from 'src/app/interface/vocabulary.interface';
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
  difficultyLevels = Object.values(DifficultyLevel);

  constructor(
    private vocabularyService: VocabularyService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {
    this.vocabularyForm = this.fb.group({
      wordId: [null],
      word: ['', Validators.required],
      meaning: ['', Validators.required],
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
    this.vocabularyService.getAllVocabulary().subscribe(vocabularies => {
      this.vocabularies = vocabularies;
    });
  }

  showModal(isEdit: boolean, vocabulary?: Vocabulary): void {
    this.isEdit = isEdit;
    if (isEdit && vocabulary) {
      this.vocabularyForm.patchValue(vocabulary);
    } else {
      this.vocabularyForm.reset();
    }
    this.isVisible = true;
  }

  handleOk(): void {
    if (this.vocabularyForm.invalid) {
      this.vocabularyForm.markAllAsTouched();
      return;
    }
    const vocabulary: Vocabulary = this.vocabularyForm.value;
    if (this.isEdit) {
      this.vocabularyService.updateVocabulary(vocabulary.wordId!, vocabulary).subscribe(() => {
        this.notification.success('Success', 'Vocabulary updated');
        this.loadVocabularies();
        this.isVisible = false;
      });
    } else {
      this.vocabularyService.createVocabulary(vocabulary).subscribe(() => {
        this.notification.success('Success', 'Vocabulary created');
        this.loadVocabularies();
        this.isVisible = false;
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  deleteVocabulary(wordId: number): void {
    this.modal.confirm({
      nzTitle: 'Are you sure?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        this.vocabularyService.deleteVocabulary(wordId).subscribe(() => {
          this.notification.success('Success', 'Vocabulary deleted');
          this.loadVocabularies();
          this.isVisible = false;
        });
      }
    });
  }
}
