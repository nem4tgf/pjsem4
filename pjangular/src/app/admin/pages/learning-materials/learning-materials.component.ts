// src/app/admin/pages/learning-materials/learning-materials.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';

// Đảm bảo đường dẫn interface đúng
import { LearningMaterial, MaterialType } from 'src/app/interface/learning-material.interface';
import { Lesson } from 'src/app/interface/lesson.interface'; // Vẫn cần Lesson để lấy danh sách lessons và hiển thị title

// Đảm bảo đường dẫn service đúng
import { LearningMaterialService } from 'src/app/service/learning-material.service';
import { LessonService } from 'src/app/service/lesson.service';
import { ApiService } from 'src/app/service/api.service'; // Import ApiService để kiểm tra quyền admin

@Component({
  selector: 'app-learning-materials',
  templateUrl: './learning-materials.component.html',
  styleUrls: ['./learning-materials.component.css']
})
export class LearningMaterialsComponent implements OnInit {
  materials: LearningMaterial[] = [];
  lessons: Lesson[] = []; // Danh sách tất cả các bài học để chọn và hiển thị title
  isVisible = false;    // Kiểm soát hiển thị modal
  isEdit = false;       // Kiểm soát chế độ thêm/sửa
  materialForm: FormGroup;
  materialTypes = Object.values(MaterialType);
  selectedLessonId: number | null = null; // Để lọc tài liệu theo bài học
  isAdmin: boolean = false; // Biến kiểm tra quyền admin

  constructor(
    private materialService: LearningMaterialService,
    private lessonService: LessonService,
    private fb: FormBuilder, // Inject FormBuilder
    private modal: NzModalService,
    private notification: NzNotificationService,
    private apiService: ApiService // Inject ApiService để kiểm tra quyền admin
  ) {
    // Khởi tạo FormGroup với FormControl 'lessonId' thay vì 'lesson'
    this.materialForm = this.fb.group({
      materialId: [null], // materialId là null khi thêm mới, có giá trị khi chỉnh sửa
      lessonId: [null, Validators.required], // <--- SỬA: lessonId (number)
      materialType: [null, Validators.required],
      materialUrl: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.checkRoleAndLoadData(); // Gọi hàm kiểm tra quyền và tải dữ liệu
  }

  private checkRoleAndLoadData(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        if (this.isAdmin) {
          this.loadLessons(); // Chỉ tải lessons nếu là admin
        } else {
          this.notification.warning('Warning', 'You do not have administrative privileges to manage learning materials.');
        }
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to verify admin role.');
        console.error('Admin role check error:', err);
      }
    });
  }

  loadLessons(): void {
    this.lessonService.getAllLessons().subscribe({
      next: (lessons) => {
        this.lessons = lessons;
        console.log('Loaded all lessons:', this.lessons);
        // Sau khi tải lessons, nếu có selectedLessonId, tải materials
        if (this.selectedLessonId) {
          this.loadMaterials(this.selectedLessonId);
        }
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to load lessons.');
        console.error('Load lessons error:', err);
      }
    });
  }

  loadMaterials(lessonId: number): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to view materials.');
      return;
    }
    this.materialService.getLearningMaterialsByLessonId(lessonId).subscribe({
      next: (materials) => {
        this.materials = materials;
        console.log(`Loaded materials for lesson ${lessonId}:`, this.materials);
      },
      error: (err) => {
        this.notification.error('Error', `Failed to load materials for lesson ${lessonId}.`);
        console.error('Load materials error:', err);
      }
    });
  }

  showModal(isEdit: boolean, material?: LearningMaterial): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to add/edit materials.');
      return;
    }
    this.isEdit = isEdit;
    this.materialForm.reset(); // Đảm bảo reset form khi mở modal

    if (isEdit && material) {
      // Khi chỉnh sửa, material từ backend có thể có lesson object đầy đủ,
      // nên ta lấy lessonId từ đó để patch vào form.
      this.materialForm.patchValue({
        materialId: material.materialId,
        lessonId: material.lessonId, // <--- SỬA: patch vào 'lessonId'
        materialType: material.materialType,
        materialUrl: material.materialUrl,
        description: material.description
      });
    } else {
      // Khi thêm mới, nếu đã có lesson được chọn từ dropdown lọc, tự động điền vào form
      if (this.selectedLessonId) {
        this.materialForm.get('lessonId')?.setValue(this.selectedLessonId); // <--- SỬA: set value cho 'lessonId'
      }
    }
    this.isVisible = true;
    console.log('Material Form after showModal:', this.materialForm.value);
  }

  handleOk(): void {
    console.log('Attempting to submit form. Current form value:', this.materialForm.value);
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched(); // Đánh dấu tất cả các trường là đã chạm vào để hiển thị lỗi
      this.notification.error('Error', 'Please fill in all required fields correctly.');
      // SỬA LỖI TRUY CẬP CONTROLS: Dùng bracket notation hoặc .get()
      console.error(
        'Form is invalid. Errors:',
        this.materialForm.controls['lessonId']?.errors, // <--- SỬA: Kiểm tra 'lessonId'
        this.materialForm.controls['materialType']?.errors,
        this.materialForm.controls['materialUrl']?.errors
      );
      return;
    }

    // Lấy lessonId trực tiếp từ form control 'lessonId'
    const lessonIdFromForm = this.materialForm.get('lessonId')?.value;

    // Tạo đối tượng LearningMaterial để gửi đi (chỉ chứa lessonId, không phải Lesson object)
    const materialToSend: LearningMaterial = {
      materialId: this.materialForm.get('materialId')?.value, // Có thể là null/undefined khi tạo mới
      lessonId: lessonIdFromForm, // <--- SỬA: Gửi lessonId
      materialType: this.materialForm.get('materialType')?.value,
      materialUrl: this.materialForm.get('materialUrl')?.value,
      description: this.materialForm.get('description')?.value
    };

    console.log('Material object to send:', materialToSend);

    if (this.isEdit) {
      if (materialToSend.materialId === null || materialToSend.materialId === undefined) {
        this.notification.error('Error', 'Material ID is missing for update.');
        return;
      }
      this.materialService.updateLearningMaterial(materialToSend.materialId, materialToSend).subscribe({
        next: () => {
          this.notification.success('Success', 'Material updated successfully!');
          this.loadMaterials(materialToSend.lessonId); // Tải lại materials cho bài học này
          this.isVisible = false;
          this.materialForm.reset();
        },
        error: (err) => {
          this.notification.error('Error', 'Failed to update material: ' + (err.error?.message || err.message));
          console.error('Update material error:', err);
        }
      });
    } else {
      this.materialService.createLearningMaterial(materialToSend).subscribe({ // Gửi materialToSend trực tiếp
        next: () => {
          this.notification.success('Success', 'Material created successfully!');
          this.loadMaterials(materialToSend.lessonId); // Tải lại materials cho bài học này
          this.isVisible = false;
          this.materialForm.reset();
        },
        error: (err) => {
          this.notification.error('Error', 'Failed to create material: ' + (err.error?.message || err.message));
          console.error('Create material error:', err);
        }
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.materialForm.reset();
  }

  deleteMaterial(materialId: number): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to delete materials.');
      return;
    }
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this material?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        this.materialService.deleteLearningMaterial(materialId).subscribe({
          next: () => {
            this.notification.success('Success', 'Material deleted successfully!');
            // Tải lại materials cho lesson đang được chọn, nếu có
            if (this.selectedLessonId) {
              this.loadMaterials(this.selectedLessonId);
            }
          },
          error: (err) => {
            this.notification.error('Error', 'Failed to delete material: ' + (err.error?.message || err.message));
            console.error('Delete material error:', err);
          }
        });
      }
    });
  }

  /**
   * Helper function to get lesson title from lessonId.
   * Used in the template to display lesson title in the table.
   */
  getLessonTitle(lessonId: number | undefined): string {
    if (lessonId == null) {
      return 'N/A';
    }
    const lesson = this.lessons.find(l => l.lessonId === lessonId);
    return lesson ? lesson.title : 'N/A';
  }
}
