// src/app/admin/pages/users/users.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Role, User, UserUpdateRequest } from 'src/app/interface/user.interface'; // Import UserUpdateRequest
import { UserService } from 'src/app/service/user.service';
import { ApiService } from 'src/app/service/api.service';
import { RegisterRequest } from 'src/app/interface/auth.interface'; // Import RegisterRequest

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
  roles = Object.values(Role); // Sử dụng Object.values để lấy mảng các giá trị của enum
  isAdmin: boolean = false;
  selectedUserId: number | null = null; // Thêm để lưu ID người dùng đang chỉnh sửa/xóa

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private modalService: NzModalService,
    private notification: NzNotificationService,
    private apiService: ApiService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []], // Password sẽ có validator động
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
          this.loadUsers();
        } else {
          this.notification.warning('Cảnh báo', 'Bạn không có quyền truy cập trang quản lý người dùng.');
          this.users = []; // Xóa dữ liệu cũ nếu không có quyền
        }
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể xác minh quyền quản trị.');
        console.error('Lỗi kiểm tra quyền admin:', err);
        this.isAdmin = false;
        this.users = [];
      }
    });
  }

  loadUsers(): void {
    if (!this.isAdmin) return;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Đã tải tất cả người dùng:', this.users);
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Không thể tải danh sách người dùng.');
        console.error('Lỗi tải người dùng:', err);
      }
    });
  }

  showModal(isEdit: boolean, user?: User): void {
    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền quản lý người dùng.');
      return;
    }

    this.isEdit = isEdit;
    this.userForm.reset(); // Reset form trước khi mở modal
    this.selectedUserId = user?.userId || null; // Lưu userId cho thao tác edit

    const passwordControl = this.userForm.get('password');

    if (!isEdit) { // Chế độ tạo mới: password là bắt buộc
      passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
      passwordControl?.updateValueAndValidity();
    } else { // Chế độ chỉnh sửa: password là tùy chọn và không hiển thị/chỉnh sửa trong modal này
      passwordControl?.clearValidators();
      passwordControl?.setValue(''); // Đảm bảo trường password trống khi edit
      passwordControl?.updateValueAndValidity();
    }

    if (isEdit && user) {
      this.userForm.patchValue({
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
    // Đánh dấu tất cả các trường là đã chạm để hiển thị lỗi
    for (const i in this.userForm.controls) {
      this.userForm.controls[i].markAsDirty();
      this.userForm.controls[i].updateValueAndValidity();
    }

    if (this.userForm.invalid) {
      this.notification.error('Lỗi', 'Vui lòng điền đầy đủ và đúng các trường bắt buộc.');
      return;
    }

    const formData = this.userForm.value;

    if (this.isEdit) {
      if (this.selectedUserId === null) {
        this.notification.error('Lỗi', 'ID người dùng bị thiếu để cập nhật.');
        return;
      }
      // Dùng UserUpdateRequest cho cập nhật
      const userUpdatePayload: UserUpdateRequest = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName || null,
        avatarUrl: formData.avatarUrl || null,
        role: formData.role
      };

      // Nếu muốn thay đổi mật khẩu khi edit, bạn sẽ cần một trường input riêng biệt
      // và thêm logic để chỉ gửi password nếu nó được nhập.
      // Hiện tại, password không được gửi trong UserUpdateRequest mặc định.
      // Nếu bạn muốn hỗ trợ thay đổi mật khẩu qua modal này, bạn cần thêm logic kiểm tra
      // và gán formData.password vào userUpdatePayload.password nếu nó không rỗng.
      if (formData.password) { // Nếu người dùng nhập mật khẩu khi chỉnh sửa
          userUpdatePayload.password = formData.password;
      }

      this.userService.updateUser(this.selectedUserId, userUpdatePayload).subscribe({
        next: () => {
          this.notification.success('Thành công', 'Người dùng đã được cập nhật thành công!');
          this.loadUsers();
          this.isVisible = false;
        },
        error: (err) => {
          this.notification.error('Lỗi', 'Cập nhật người dùng thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
          console.error('Lỗi cập nhật người dùng:', err);
        }
      });
    } else {
      // Dùng RegisterRequest cho tạo mới
      const userCreatePayload: RegisterRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName || null,
        role: formData.role
      };

      this.userService.adminCreateUser(userCreatePayload).subscribe({ // Gọi adminCreateUser
        next: () => {
          this.notification.success('Thành công', 'Người dùng đã được tạo thành công!');
          this.loadUsers();
          this.isVisible = false;
        },
        error: (err) => {
          this.notification.error('Lỗi', 'Tạo người dùng thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
          console.error('Lỗi tạo người dùng:', err);
        }
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  deleteUser(userId: number | undefined): void {
    if (!this.isAdmin) {
      this.notification.warning('Cảnh báo', 'Bạn không có quyền xóa người dùng.');
      return;
    }
    if (userId === undefined || userId === null) {
      this.notification.error('Lỗi', 'ID người dùng bị thiếu để xóa.');
      return;
    }

    this.modalService.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa người dùng này?',
      nzContent: 'Hành động này không thể hoàn tác.',
      nzOkText: 'Có',
      nzOkDanger: true,
      nzCancelText: 'Không',
      nzOnOk: () => {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.notification.success('Thành công', 'Người dùng đã được xóa thành công!');
            this.loadUsers();
          },
          error: (err) => {
            this.notification.error('Lỗi', 'Xóa người dùng thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
            console.error('Lỗi xóa người dùng:', err);
          }
        });
      }
    });
  }
}
