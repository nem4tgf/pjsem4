import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vocabulary } from '../interface/vocabulary.interface';
import { environment } from './enviroment';

@Injectable({
  providedIn: 'root'
})
export class VocabularyService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createVocabulary(request: Vocabulary): Observable<Vocabulary> {
    return this.http.post<Vocabulary>(`${this.apiUrl}/vocabulary`, request);
  }

  getVocabularyById(wordId: number): Observable<Vocabulary> {
    return this.http.get<Vocabulary>(`${this.apiUrl}/vocabulary/${wordId}`);
  }

  getAllVocabulary(): Observable<Vocabulary[]> {
    return this.http.get<Vocabulary[]>(`${this.apiUrl}/vocabulary`);
  }

  updateVocabulary(wordId: number, request: Vocabulary): Observable<Vocabulary> {
    return this.http.put<Vocabulary>(`${this.apiUrl}/vocabulary/${wordId}`, request);
  }

  deleteVocabulary(wordId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vocabulary/${wordId}`);
  }
}
