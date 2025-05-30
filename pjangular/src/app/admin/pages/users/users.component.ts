import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { forkJoin } from 'rxjs';
import { Role, User } from 'src/app/interface/user.interface';
import { UserService } from 'src/app/service/user.service';

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

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private modalService: NzModalService,
    private notification: NzNotificationService
  ) {
    this.userForm = this.fb.group({
      userId: [null],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      fullName: [''],
      avatarUrl: [''],
      role: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    // Giả định lấy user với ID cố định vì không có getAllUsers
    const userIds = [1, 2, 3]; // Thay bằng ID thực tế hoặc logic khác
    forkJoin(
      userIds.map(id => this.userService.getUserById(id))
    ).subscribe({
      next: (users) => {
        this.users = users;
      },
      error: () => {
        this.notification.error('Error', 'Failed to load users');
      }
    });
  }

  showModal(isEdit: boolean, user?: User): void {
    this.isEdit = isEdit;
    if (isEdit && user) {
      this.userForm.patchValue(user);
      this.isVisible = true;
    } else {
      this.notification.warning('Warning', 'Create user is not supported');
      // this.userForm.reset();
      // this.isVisible = true;
    }
  }

  handleOk(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    if (!this.isEdit) {
      this.notification.warning('Warning', 'Create user is not supported');
      return;
    }
    const user: User = this.userForm.value;
    this.userService.updateUser(user.userId!, user).subscribe({
      next: () => {
        this.notification.success('Success', 'User updated');
        this.loadUsers();
        this.isVisible = false;
      },
      error: () => {
        this.notification.error('Error', 'Failed to update user');
      }
    });
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  deleteUser(userId: number): void {
    this.modalService.confirm({
      nzTitle: 'Are you sure?',
      nzContent: 'This action cannot be undone.',
      nzOnOk: () => {
        this.notification.warning('Warning', 'Delete user is not supported');
        // this.userService.deleteUser(userId).subscribe(() => {
        //   this.notification.success('Success', 'User deleted');
        //   this.loadUsers();
        // });
      }
    });
  }
}
