// src/app/service/learning-material.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LearningMaterial, LearningMaterialRequest, LearningMaterialSearchRequest, LearningMaterialPage } from '../interface/learning-material.interface';

@Injectable({
  providedIn: 'root'
})
export class LearningMaterialService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Tạo một tài liệu học tập mới.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: POST /api/learning-materials
   * @param request DTO chứa thông tin tài liệu.
   */
  createLearningMaterial(request: LearningMaterialRequest): Observable<LearningMaterial> {
    // Backend mong đợi LearningMaterialRequest DTO
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<LearningMaterial>(`${this.apiUrl}/learning-materials`, request))
    );
  }

  /**
   * Lấy thông tin một tài liệu học tập theo ID.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/learning-materials/{materialId}
   * @param materialId ID của tài liệu.
   */
  getLearningMaterialById(materialId: number): Observable<LearningMaterial> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // nên không cần checkAdminRole() hay checkAuth() ở đây.
    return this.http.get<LearningMaterial>(`${this.apiUrl}/learning-materials/${materialId}`);
  }

  /**
   * Lấy danh sách tài liệu học tập theo ID bài học.
   * Có thể truy cập công khai (theo backend controller).
   * Endpoint Backend: GET /api/learning-materials/lesson/{lessonId}
   * @param lessonId ID của bài học.
   */
  getLearningMaterialsByLessonId(lessonId: number): Observable<LearningMaterial[]> {
    // Backend controller cho phép truy cập công khai (không @PreAuthorize),
    // nên không cần checkAdminRole() hay checkAuth() ở đây.
    return this.http.get<LearningMaterial[]>(`${this.apiUrl}/learning-materials/lesson/${lessonId}`);
  }

  /**
   * Cập nhật thông tin một tài liệu học tập.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: PUT /api/learning-materials/{materialId}
   * @param materialId ID của tài liệu.
   * @param request DTO chứa thông tin cập nhật.
   */
  updateLearningMaterial(materialId: number, request: LearningMaterialRequest): Observable<LearningMaterial> {
    // Backend mong đợi LearningMaterialRequest DTO
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.put<LearningMaterial>(`${this.apiUrl}/learning-materials/${materialId}`, request))
    );
  }

  /**
   * Xóa một tài liệu học tập.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: DELETE /api/learning-materials/{materialId}
   * @param materialId ID của tài liệu.
   */
  deleteLearningMaterial(materialId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/learning-materials/${materialId}`))
    );
  }

  /**
   * Tìm kiếm tài liệu học tập với các tiêu chí và phân trang.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: POST /api/learning-materials/search
   * @param request DTO chứa tiêu chí tìm kiếm và thông tin phân trang/sắp xếp.
   */
  searchLearningMaterials(request: LearningMaterialSearchRequest): Observable<LearningMaterialPage> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<LearningMaterialPage>(`${this.apiUrl}/learning-materials/search`, request))
    );
  }
}
