import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NzMenuThemeType } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;
  @Input() theme: NzMenuThemeType = 'dark';
  @Output() toggleTheme = new EventEmitter<void>();
}
