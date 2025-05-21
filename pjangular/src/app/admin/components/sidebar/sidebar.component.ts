import { Component, Input } from '@angular/core';
import { NzMenuThemeType } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() theme: NzMenuThemeType = 'dark';

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
  }
}
