import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  isCollapsed = false;
  theme: 'light' | 'dark' = 'dark'; // Mặc định là dark

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    console.log('Theme switched to:', this.theme); // Debug
  }
}
