import { Component, OnInit } from '@angular/core';
import { NzTableSortFn } from 'ng-zorro-antd/table';

interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'] // Đổi sang .css
})
export class UsersComponent implements OnInit {
  users: User[] = [
    { id: 1, name: 'Nguyễn Văn A' },
    { id: 2, name: 'Trần Thị B' }
  ];
  filteredUsers: User[] = [...this.users];
  searchValue = '';
  isEditModalVisible = false;
  selectedUser: User = { id: 0, name: '' };

  sortById: NzTableSortFn<User> = (a, b) => a.id - b.id;
  sortByName: NzTableSortFn<User> = (a, b) => a.name.localeCompare(b.name);

  ngOnInit() {}

  filterUsers() {
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchValue.toLowerCase())
    );
  }

  onCurrentPageDataChange(data: readonly User[]) {
    // Xử lý dữ liệu trang hiện tại
  }

  openEditModal(user: User) {
    this.selectedUser = { ...user };
    this.isEditModalVisible = true;
  }

  handleOk() {
    this.users = this.users.map(u => (u.id === this.selectedUser.id ? this.selectedUser : u));
    this.filteredUsers = [...this.users];
    this.isEditModalVisible = false;
  }

  handleCancel() {
    this.isEditModalVisible = false;
  }

  deleteUser(id: number) {
    this.users = this.users.filter(u => u.id !== id);
    this.filteredUsers = [...this.users];
  }
}
