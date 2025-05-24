import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  isCollapsed: boolean = false;
  theme: 'light' | 'dark' = 'dark';

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  }
}
