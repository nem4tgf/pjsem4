import { Component } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  filteredUsers: any[] = [
    { user_id: 1, username: 'john_doe', email: 'john@example.com', full_name: 'John Doe', avatar_url: 'https://via.placeholder.com/50', created_at: '2025-05-01' },
    { user_id: 2, username: 'jane_smith', email: 'jane@example.com', full_name: 'Jane Smith', avatar_url: 'https://via.placeholder.com/50', created_at: '2025-05-02' }
  ];
  isEditModalVisible = false;
  selectedUser: any = { user_id: 0, username: '', email: '', full_name: '', avatar_url: '' };

  constructor(private notification: NzNotificationService) {}

  sortById = (a: any, b: any) => a.user_id - b.user_id;
  sortByName = (a: any, b: any) => a.full_name.localeCompare(b.full_name);

  onCurrentPageDataChange(event: any): void {
    this.filteredUsers = event;
  }

  showModal(user?: any): void {
    if (user) {
      this.selectedUser = { ...user };
    } else {
      this.selectedUser = { user_id: 0, username: '', email: '', full_name: '', avatar_url: '' };
    }
    this.isEditModalVisible = true;
  }

  handleOk(): void {
    if (this.selectedUser.user_id === 0) {
      this.selectedUser.user_id = this.filteredUsers.length + 1;
      this.filteredUsers.push({ ...this.selectedUser, created_at: new Date().toISOString() });
      this.notification.success('Thành công', 'Thêm người dùng thành công');
    } else {
      this.filteredUsers = this.filteredUsers.map(u =>
        u.user_id === this.selectedUser.user_id ? { ...this.selectedUser } : u
      );
      this.notification.success('Thành công', 'Cập nhật người dùng thành công');
    }
    this.isEditModalVisible = false;
  }

  handleCancel(): void {
    this.isEditModalVisible = false;
  }

  deleteUser(id: number): void {
    this.filteredUsers = this.filteredUsers.filter(u => u.user_id !== id);
    this.notification.success('Thành công', 'Xóa người dùng thành công');
  }
}
