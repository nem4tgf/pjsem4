import { Component } from '@angular/core';
import { NzMenuThemeType } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  isCollapsed = false;
  theme: NzMenuThemeType = 'dark';

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
  }
}
