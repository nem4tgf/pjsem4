// src/app/service/learning-material.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LearningMaterial } from '../interface/learning-material.interface'; // Đảm bảo đường dẫn đúng

@Injectable({
  providedIn: 'root'
})
export class LearningMaterialService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  createLearningMaterial(request: LearningMaterial): Observable<LearningMaterial> {
    // Backend mong đợi một LearningMaterial object với lessonId (number)
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<LearningMaterial>(`${this.apiUrl}/learning-materials`, request))
    );
  }

  getLearningMaterialById(materialId: number): Observable<LearningMaterial> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<LearningMaterial>(`${this.apiUrl}/learning-materials/${materialId}`))
    );
  }

  // Phương thức này có thể trả về LearningMaterial[] mà trong đó lesson là một object đầy đủ (tùy vào Response DTO của backend)
  // Nhưng khi gọi từ frontend, chúng ta chỉ cần lessonId để hiển thị và xử lý
  getLearningMaterialsByLessonId(lessonId: number): Observable<LearningMaterial[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<LearningMaterial[]>(`${this.apiUrl}/learning-materials/lesson/${lessonId}`))
    );
  }

  updateLearningMaterial(materialId: number, request: LearningMaterial): Observable<LearningMaterial> {
    // Backend mong đợi một LearningMaterial object với lessonId (number)
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.put<LearningMaterial>(`${this.apiUrl}/learning-materials/${materialId}`, request))
    );
  }

  deleteLearningMaterial(materialId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/learning-materials/${materialId}`))
    );
  }
}
