// src/app/service/practice-activity.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ActivitySkill, ActivityType, PracticeActivity, PracticeActivityPageResponse, PracticeActivityRequest } from '../interface/pratice-activity.interface';

@Injectable({
  providedIn: 'root'
})
export class PracticeActivityService extends ApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Tạo một hoạt động luyện tập mới.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: POST /api/practice-activities
   * @param request DTO PracticeActivityRequest chứa thông tin hoạt động.
   * @returns Observable<PracticeActivity> của hoạt động đã tạo.
   */
  createPracticeActivity(request: PracticeActivityRequest): Observable<PracticeActivity> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.post<PracticeActivity>(`${this.apiUrl}/practice-activities`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy thông tin hoạt động luyện tập theo ID.
   * Có thể truy cập công khai.
   * Endpoint Backend: GET /api/practice-activities/{activityId}
   * @param activityId ID của hoạt động.
   * @returns Observable<PracticeActivity>
   */
  getPracticeActivityById(activityId: number): Observable<PracticeActivity> {
    return this.http.get<PracticeActivity>(`${this.apiUrl}/practice-activities/${activityId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Lấy danh sách các hoạt động luyện tập theo ID bài học.
   * Có thể truy cập công khai.
   * Endpoint Backend: GET /api/practice-activities/lesson/{lessonId}
   * @param lessonId ID của bài học.
   * @returns Observable<PracticeActivity[]>
   */
  getPracticeActivitiesByLessonId(lessonId: number): Observable<PracticeActivity[]> {
    return this.http.get<PracticeActivity[]>(`${this.apiUrl}/practice-activities/lesson/${lessonId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Lấy tất cả các hoạt động luyện tập hiện có trong hệ thống.
   * Có thể truy cập công khai.
   * Endpoint Backend: GET /api/practice-activities
   * @returns Observable<PracticeActivity[]>
   */
  getAllPracticeActivities(): Observable<PracticeActivity[]> {
    return this.http.get<PracticeActivity[]>(`${this.apiUrl}/practice-activities`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Tìm kiếm và phân trang các hoạt động luyện tập dựa trên các tiêu chí tùy chọn.
   * Có thể truy cập công khai.
   * Endpoint Backend: GET /api/practice-activities/search
   * @param lessonId ID bài học (tùy chọn).
   * @param title Tiêu đề (tùy chọn).
   * @param skill Kỹ năng (tùy chọn).
   * @param activityType Loại hoạt động (tùy chọn).
   * @param page Số trang (mặc định 0).
   * @param size Kích thước trang (mặc định 10).
   * @param sortBy Trường để sắp xếp (mặc định "activityId").
   * @param sortDir Hướng sắp xếp (mặc định "ASC").
   * @returns Observable<PracticeActivityPageResponse> của trang kết quả.
   */
  searchPracticeActivities(
    lessonId?: number | null,
    title?: string | null,
    skill?: ActivitySkill | null,
    activityType?: ActivityType | null,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'activityId',
    sortDir: 'ASC' | 'DESC' = 'ASC'
  ): Observable<PracticeActivityPageResponse> {
    let params = new HttpParams();

    if (lessonId !== null && lessonId !== undefined) {
      params = params.set('lessonId', lessonId.toString());
    }
    if (title !== null && title !== undefined && title !== '') {
      params = params.set('title', title);
    }
    if (skill !== null && skill !== undefined) {
      params = params.set('skill', skill as string);
    }
    if (activityType !== null && activityType !== undefined) {
      params = params.set('activityType', activityType as string);
    }

    params = params.set('page', page.toString());
    params = params.set('size', size.toString());
    params = params.set('sortBy', sortBy);
    params = params.set('sortDir', sortDir);

    return this.http.get<PracticeActivityPageResponse>(`${this.apiUrl}/practice-activities/search`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cập nhật thông tin của một hoạt động luyện tập.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: PUT /api/practice-activities/{activityId}
   * @param activityId ID của hoạt động.
   * @param request DTO PracticeActivityRequest chứa thông tin cập nhật.
   * @returns Observable<PracticeActivity>
   */
  updatePracticeActivity(activityId: number, request: PracticeActivityRequest): Observable<PracticeActivity> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.put<PracticeActivity>(`${this.apiUrl}/practice-activities/${activityId}`, request)),
      catchError(this.handleError)
    );
  }

  /**
   * Xóa một hoạt động luyện tập.
   * Yêu cầu quyền ADMIN.
   * Endpoint Backend: DELETE /api/practice-activities/{activityId}
   * @param activityId ID của hoạt động.
   * @returns Observable<void>
   */
  deletePracticeActivity(activityId: number): Observable<void> {
    return this.checkAdminRole().pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/practice-activities/${activityId}`)),
      catchError(this.handleError)
    );
  }
}
