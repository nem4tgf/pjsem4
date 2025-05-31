// src/app/admin/pages/users/users.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Role, User } from 'src/app/interface/user.interface';
import { UserService } from 'src/app/service/user.service';
import { ApiService } from 'src/app/service/api.service'; // Import ApiService để kiểm tra quyền admin

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  isVisible = false;
  isEdit = false;
  userForm: FormGroup;
  roles = Object.values(Role);
  isAdmin: boolean = false; // Biến kiểm tra quyền admin

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private modalService: NzModalService,
    private notification: NzNotificationService,
    private apiService: ApiService // Inject ApiService
  ) {
    this.userForm = this.fb.group({
      userId: [null], // Dùng để lưu userId khi edit
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []], // Trường password, validator sẽ được thêm/bỏ động
      fullName: [''],
      avatarUrl: [''],
      role: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.checkRoleAndLoadUsers();
  }

  private checkRoleAndLoadUsers(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        if (this.isAdmin) {
          this.loadUsers(); // Chỉ tải users nếu là admin
        } else {
          this.notification.warning('Warning', 'You do not have administrative privileges to view users.');
          this.users = []; // Xóa dữ liệu cũ nếu không có quyền
        }
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to verify admin role.');
        console.error('Admin role check error:', err);
        this.isAdmin = false; // Đảm bảo isAdmin là false nếu có lỗi
        this.users = []; // Xóa dữ liệu cũ nếu có lỗi
      }
    });
  }

  loadUsers(): void {
    if (!this.isAdmin) return; // Không tải nếu không phải admin
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Loaded all users:', this.users);
      },
      error: (err) => {
        this.notification.error('Error', 'Failed to load users.');
        console.error('Load users error:', err);
      }
    });
  }

  showModal(isEdit: boolean, user?: User): void {
    if (!this.isAdmin) {
      this.notification.warning('Warning', 'You do not have permission to manage users.');
      return;
    }

    this.isEdit = isEdit;
    this.userForm.reset(); // Reset form trước khi mở modal

    const passwordControl = this.userForm.get('password');
    if (!isEdit) { // Chế độ tạo mới: password là bắt buộc
      passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
    } else { // Chế độ chỉnh sửa: password là tùy chọn
      passwordControl?.clearValidators();
    }
    passwordControl?.updateValueAndValidity(); // Áp dụng thay đổi validator

    if (isEdit && user) {
      // Đảm bảo không patchValue cho password khi edit
      this.userForm.patchValue({
        userId: user.userId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role
      });
    }
    this.isVisible = true;
  }

  handleOk(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.notification.error('Error', 'Please fill in all required fields correctly.');
      return;
    }

    const userData = this.userForm.value;
    const commonUserFields = {
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName || null, // Gửi null nếu không có giá trị
      avatarUrl: userData.avatarUrl || null, // Gửi null nếu không có giá trị
      role: userData.role
    };

    if (this.isEdit) {
      // Cập nhật người dùng
      if (userData.userId === null) {
          this.notification.error('Error', 'User ID is missing for update.');
          return;
      }
      this.userService.updateUser(userData.userId, commonUserFields).subscribe({
        next: () => {
          this.notification.success('Success', 'User updated successfully!');
          this.loadUsers();
          this.isVisible = false;
        },
        error: (err) => {
          this.notification.error('Error', 'Failed to update user: ' + (err.error?.message || 'Unknown error'));
          console.error('Update user error:', err);
        }
      });
    } else {
      // Tạo người dùng mới
      const userToCreate: User = {
        ...commonUserFields,
        password: userData.password // Chỉ thêm password khi tạo mới
      };

      this.userService.createUser(userToCreate).subscribe({
        next: () => {
          this.notification.success('Success', 'User created successfully!');
          this.loadUsers();
          this.isVisible = false;
        },
        error: (err) => {
          this.notification.error('Error', 'Failed to create user: ' + (err.error?.message || 'Unknown error'));
          console.error('Create user error:', err);
        }
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  deleteUser(userId: number | undefined): void {
    if (!this.isAdmin) {
      this.notification.warning('Warning', 'You do not have permission to delete users.');
      return;
    }
    if (userId === undefined || userId === null) {
      this.notification.error('Error', 'User ID is missing for deletion.');
      return;
    }

    this.modalService.confirm({
      nzTitle: 'Are you sure you want to delete this user?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOkDanger: true, // Để nút OK có màu đỏ
      nzCancelText: 'No',
      nzOnOk: () => {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.notification.success('Success', 'User deleted successfully!');
            this.loadUsers();
          },
          error: (err) => {
            this.notification.error('Error', 'Failed to delete user: ' + (err.error?.message || 'Unknown error'));
            console.error('Delete user error:', err);
          }
        });
      }
    });
  }
}
