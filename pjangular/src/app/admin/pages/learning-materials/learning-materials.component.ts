import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LearningMaterial, MaterialType, LearningMaterialSearchRequest, LearningMaterialPage, LearningMaterialRequest } from 'src/app/interface/learning-material.interface';
import { Lesson } from 'src/app/interface/lesson.interface';
import { LearningMaterialService } from 'src/app/service/learning-material.service';
import { ApiService } from 'src/app/service/api.service';
import { LessonService } from 'src/app/service/lesson.service';

@Component({
  selector: 'app-learning-materials',
  templateUrl: './learning-materials.component.html',
  styleUrls: ['./learning-materials.component.css']
})
export class LearningMaterialsComponent implements OnInit {
  materials: LearningMaterial[] = [];
  lessons: Lesson[] = [];
  isVisible = false;
  isEdit = false;
  materialForm: FormGroup;
  searchForm: FormGroup;
  materialTypes = Object.values(MaterialType);
  isAdmin: boolean = false;
  pageData: LearningMaterialPage = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };

  constructor(
    private materialService: LearningMaterialService,
    private lessonService: LessonService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private apiService: ApiService
  ) {
    // Khởi tạo form thêm/sửa tài liệu
    this.materialForm = this.fb.group({
      materialId: [null],
      lessonId: [null, Validators.required],
      materialType: [null, Validators.required],
      materialUrl: ['', [Validators.required, Validators.pattern(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i)]],
      description: [''],
      transcriptText: [''] // THÊM MỚI: Đồng bộ với backend
    });
    // Khởi tạo form tìm kiếm
    this.searchForm = this.fb.group({
      lessonId: [null],
      materialType: [''], // Đặt giá trị mặc định là chuỗi rỗng cho materialType
      description: [''],
      transcriptText: [''], // THÊM MỚI: Có thể tìm kiếm theo transcriptText
      page: [0],
      size: [10],
      sortBy: ['materialId'],
      sortDir: ['ASC']
    });
  }

  ngOnInit(): void {
    this.checkRoleAndLoadData();
  }

  /**
   * Kiểm tra vai trò của người dùng và tải dữ liệu nếu có quyền Admin.
   */
  private checkRoleAndLoadData(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        if (this.isAdmin) {
          this.loadLessons(); // Chỉ tải bài học và tài liệu nếu là Admin
          this.searchMaterials();
        } else {
          this.notification.warning('Cảnh báo', 'Bạn không có quyền quản trị để quản lý tài liệu học tập.');
        }
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể xác minh vai trò quản trị.');
        console.error('Lỗi kiểm tra vai trò Admin:', err);
      }
    });
  }

  /**
   * Tải tất cả các bài học từ LessonService.
   */
  loadLessons(): void {
    this.lessonService.getAllLessons().subscribe({
      next: (lessons) => {
        this.lessons = lessons;
        console.log('Đã tải tất cả bài học:', this.lessons);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải danh sách bài học.');
        console.error('Lỗi tải bài học:', err);
      }
    });
  }

  /**
   * Tìm kiếm và tải tài liệu học tập dựa trên các tiêu chí tìm kiếm.
   * Chỉ được gọi nếu người dùng là Admin.
   */
  searchMaterials(): void {
    if (!this.isAdmin) {
      this.notification.error('Lỗi', 'Bạn không có quyền xem tài liệu.');
      return;
    }
    const request: LearningMaterialSearchRequest = this.searchForm.value;

    // Backend đã xử lý các giá trị null/undefined tốt, Angular mặc định gửi null cho trường trống nếu type là number/enum.
    // Đối với chuỗi rỗng của `materialType` trong search form, backend DTO có thể nhận `null` nếu bạn truyền `null`,
    // hoặc xử lý chuỗi rỗng thành `null` trong service.
    // Nếu MaterialType là một enum ở backend, gửi chuỗi rỗng có thể gây lỗi.
    // Backend search query của bạn đã kiểm tra `materialType IS NULL OR lm.materialType = :materialType`.
    // Nếu bạn muốn tìm kiếm tất cả các loại khi người dùng chọn "Tất cả" (giá trị rỗng),
    // bạn cần chuyển `''` thành `undefined` hoặc `null` trước khi gửi đi.
    // Cập nhật: Backend của bạn đã có `@NotNull` cho MaterialType trong request,
    // nhưng trong search request DTO thì không có `@NotNull`, nên `null` hoặc `undefined` là chấp nhận được.
    // Vì vậy, nếu `materialType` từ form là '', hãy chuyển nó thành `undefined`.
    if (request.materialType === '') {
      request.materialType = undefined;
    }


    this.materialService.searchLearningMaterials(request).subscribe({
      next: (pageData) => {
        this.pageData = pageData;
        this.materials = pageData.content;
        console.log('Đã tải tài liệu:', this.materials);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải tài liệu.');
        console.error('Lỗi khi tìm kiếm tài liệu:', err);
      }
    });
  }

  /**
   * Xử lý sự kiện thay đổi trang.
   * @param page Số trang mới (1-indexed).
   */
  onPageChange(page: number): void {
    this.searchForm.patchValue({ page: page - 1 }); // Backend dùng 0-indexed
    this.searchMaterials();
  }

  /**
   * Xử lý sự kiện thay đổi kích thước trang.
   * @param size Kích thước trang mới.
   */
  onSizeChange(size: number): void {
    this.searchForm.patchValue({ size, page: 0 }); // Quay về trang đầu tiên khi thay đổi kích thước
    this.searchMaterials();
  }

  /**
   * Xử lý sự kiện thay đổi sắp xếp.
   * @param sortBy Trường để sắp xếp.
   * @param sortDir Hướng sắp xếp ('ASC'/'DESC').
   */
  onSortChange(sortBy: string, sortDir: 'ASC' | 'DESC'): void {
    this.searchForm.patchValue({ sortBy, sortDir, page: 0 }); // Quay về trang đầu tiên khi thay đổi sắp xếp
    this.searchMaterials();
  }

  /**
   * Hiển thị modal để thêm hoặc sửa tài liệu.
   * @param isEdit true nếu là sửa, false nếu là thêm mới.
   * @param material Đối tượng tài liệu cần sửa (chỉ khi isEdit là true).
   */
  showModal(isEdit: boolean, material?: LearningMaterial): void {
    if (!this.isAdmin) {
      this.notification.error('Lỗi', 'Bạn không có quyền thêm/sửa tài liệu.');
      return;
    }
    this.isEdit = isEdit;
    this.materialForm.reset(); // Đặt lại form trước khi điền dữ liệu

    if (isEdit && material) {
      this.materialForm.patchValue({
        materialId: material.materialId,
        lessonId: material.lessonId,
        materialType: material.materialType,
        materialUrl: material.materialUrl,
        description: material.description,
        transcriptText: material.transcriptText // THÊM MỚI: Đồng bộ với backend
      });
    } else if (this.searchForm.get('lessonId')?.value) {
      // Đặt lessonId mặc định từ form tìm kiếm nếu có
      this.materialForm.get('lessonId')?.setValue(this.searchForm.get('lessonId')?.value);
    }
    this.isVisible = true;
  }

  /**
   * Xử lý khi nhấn nút "OK" trong modal (lưu tài liệu).
   */
  handleOk(): void {
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched(); // Hiển thị lỗi validation
      this.notification.error('Lỗi', 'Vui lòng điền đầy đủ và chính xác các trường bắt buộc.');
      return;
    }

    const materialToSend: LearningMaterialRequest = this.materialForm.value; // Sử dụng LearningMaterialRequest

    if (this.isEdit) {
      const materialId = this.materialForm.get('materialId')?.value;
      if (!materialId) {
        this.notification.error('Lỗi', 'Thiếu ID tài liệu để cập nhật.');
        return;
      }
      this.materialService.updateLearningMaterial(materialId, materialToSend).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Tài liệu đã được cập nhật!');
          this.searchMaterials(); // Tải lại danh sách sau khi cập nhật
          this.isVisible = false;
          this.materialForm.reset();
        },
        error: (err) => {
          this.notification.error('Lỗi', 'Không thể cập nhật tài liệu: ' + (err.error?.message || err.message));
          console.error('Lỗi cập nhật tài liệu:', err);
        }
      });
    } else {
      this.materialService.createLearningMaterial(materialToSend).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Tài liệu đã được tạo!');
          this.searchMaterials(); // Tải lại danh sách sau khi tạo mới
          this.isVisible = false;
          this.materialForm.reset();
        },
        error: (err) => {
          this.notification.error('Lỗi', 'Không thể tạo tài liệu: ' + (err.error?.message || err.message));
          console.error('Lỗi tạo tài liệu:', err);
        }
      });
    }
  }

  /**
   * Xử lý khi nhấn nút "Cancel" trong modal.
   */
  handleCancel(): void {
    this.isVisible = false;
    this.materialForm.reset(); // Đặt lại form khi đóng modal
  }

  /**
   * Xóa một tài liệu học tập.
   * @param materialId ID của tài liệu cần xóa.
   */
  deleteMaterial(materialId: number): void {
    if (!this.isAdmin) {
      this.notification.error('Lỗi', 'Bạn không có quyền xóa tài liệu.');
      return;
    }
    this.modal.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa tài liệu này?',
      nzContent: 'Hành động này không thể hoàn tác.',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.materialService.deleteLearningMaterial(materialId).subscribe({
          next: () => {
            this.notification.success('Thành công', 'Tài liệu đã được xóa!');
            this.searchMaterials(); // Tải lại danh sách sau khi xóa
          },
          error: (err) => {
            this.notification.error('Lỗi', 'Không thể xóa tài liệu: ' + (err.error?.message || err.message));
            console.error('Lỗi xóa tài liệu:', err);
          }
        });
      }
    });
  }

  /**
   * Lấy tiêu đề bài học dựa trên lessonId.
   * @param lessonId ID của bài học.
   * @returns Tiêu đề bài học hoặc 'N/A' nếu không tìm thấy.
   */
  getLessonTitle(lessonId: number | undefined): string {
    if (lessonId == null) {
      return 'N/A';
    }
    const lesson = this.lessons.find(l => l.lessonId === lessonId);
    return lesson ? lesson.title : 'N/A';
  }
}
