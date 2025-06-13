import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LearningMaterial, LearningMaterialSearchRequest, LearningMaterialPage } from '../interface/learning-material.interface';

@Injectable({
  providedIn: 'root'
})
export class LearningMaterialService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  createLearningMaterial(request: LearningMaterial): Observable<LearningMaterial> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<LearningMaterial>(`${this.apiUrl}/learning-materials`, request))
    );
  }

  getLearningMaterialById(materialId: number): Observable<LearningMaterial> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<LearningMaterial>(`${this.apiUrl}/learning-materials/${materialId}`))
    );
  }

  getLearningMaterialsByLessonId(lessonId: number): Observable<LearningMaterial[]> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.get<LearningMaterial[]>(`${this.apiUrl}/learning-materials/lesson/${lessonId}`))
    );
  }

  updateLearningMaterial(materialId: number, request: LearningMaterial): Observable<LearningMaterial> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.put<LearningMaterial>(`${this.apiUrl}/learning-materials/${materialId}`, request))
    );
  }

  deleteLearningMaterial(materialId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/learning-materials/${materialId}`))
    );
  }

  searchLearningMaterials(request: LearningMaterialSearchRequest): Observable<LearningMaterialPage> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<LearningMaterialPage>(`${this.apiUrl}/learning-materials/search`, request))
    );
  }
}
