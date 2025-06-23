import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LearningMaterial, MaterialType, LearningMaterialSearchRequest, LearningMaterialPage } from 'src/app/interface/learning-material.interface';
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
    this.materialForm = this.fb.group({
      materialId: [null],
      lessonId: [null, Validators.required],
      materialType: [null, Validators.required],
      materialUrl: ['', Validators.required],
      description: ['']
    });
    this.searchForm = this.fb.group({
      lessonId: [null],
      materialType: [''],
      description: [''],
      page: [0],
      size: [10],
      sortBy: ['materialId'],
      sortDir: ['ASC']
    });
  }

  ngOnInit(): void {
    this.checkRoleAndLoadData();
  }

  private checkRoleAndLoadData(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        if (this.isAdmin) {
          this.loadLessons();
          this.searchMaterials();
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
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to load lessons.');
        console.error('Load lessons error:', err);
      }
    });
  }

  searchMaterials(): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to view materials.');
      return;
    }
    const request: LearningMaterialSearchRequest = this.searchForm.value;
    this.materialService.searchLearningMaterials(request).subscribe({
      next: (pageData) => {
        this.pageData = pageData;
        this.materials = pageData.content;
        console.log('Loaded materials:', this.materials);
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to load materials.');
        console.error('Search materials error:', err);
      }
    });
  }

  onPageChange(page: number): void {
    this.searchForm.patchValue({ page: page - 1 });
    this.searchMaterials();
  }

  onSizeChange(size: number): void {
    this.searchForm.patchValue({ size, page: 0 });
    this.searchMaterials();
  }

  onSortChange(sortBy: string, sortDir: 'ASC' | 'DESC'): void {
    this.searchForm.patchValue({ sortBy, sortDir, page: 0 });
    this.searchMaterials();
  }

  showModal(isEdit: boolean, material?: LearningMaterial): void {
    if (!this.isAdmin) {
      this.notification.error('Error', 'You do not have permission to add/edit materials.');
      return;
    }
    this.isEdit = isEdit;
    this.materialForm.reset();

    if (isEdit && material) {
      this.materialForm.patchValue({
        materialId: material.materialId,
        lessonId: material.lessonId,
        materialType: material.materialType,
        materialUrl: material.materialUrl,
        description: material.description
      });
    } else if (this.searchForm.get('lessonId')?.value) {
      this.materialForm.get('lessonId')?.setValue(this.searchForm.get('lessonId')?.value);
    }
    this.isVisible = true;
  }

  handleOk(): void {
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();
      this.notification.error('Error', 'Please fill in all required fields correctly.');
      console.error('Form errors:', this.materialForm.errors);
      return;
    }

    const materialToSend: LearningMaterial = this.materialForm.value;
    if (this.isEdit) {
      if (!materialToSend.materialId) {
        this.notification.error('Error', 'Material ID is missing for update.');
        return;
      }
      this.materialService.updateLearningMaterial(materialToSend.materialId, materialToSend).subscribe({
        next: () => {
          this.notification.success('Success', 'Material updated successfully!');
          this.searchMaterials();
          this.isVisible = false;
          this.materialForm.reset();
        },
        error: (err) => {
          this.notification.error('Error', 'Failed to update material: ' + (err.error?.message || err.message));
          console.error('Update material error:', err);
        }
      });
    } else {
      this.materialService.createLearningMaterial(materialToSend).subscribe({
        next: () => {
          this.notification.success('Success', 'Material created successfully!');
          this.searchMaterials();
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
            this.searchMaterials();
            this.isVisible = false; // Close modal if open (though unlikely for delete)
            this.materialForm.reset(); // Reset form (good practice)
          },
          error: (err) => {
            this.notification.error('Error', 'Failed to delete material: ' + (err.error?.message || err.message));
            console.error('Delete material error:', err);
          }
        });
      }
    });
  }

  getLessonTitle(lessonId: number | undefined): string {
    if (lessonId == null) {
      return 'N/A';
    }
    const lesson = this.lessons.find(l => l.lessonId === lessonId);
    return lesson ? lesson.title : 'N/A';
  }
}
