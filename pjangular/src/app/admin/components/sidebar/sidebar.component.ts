import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;
  @Input() theme: 'light' | 'dark' = 'dark';
  @Output() toggleTheme = new EventEmitter<void>();

  menuItems = [
    { label: 'Dashboard', link: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10...' },
    { label: 'Users', link: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292...' },
    { label: 'Vocabulary', link: '/admin/vocabulary', icon: 'M12 6.042A8.967 8.967 0 006 3.75...' },
    { label: 'Lessons', link: '/admin/lessons', icon: 'M12 6.042A8.967 8.967 0 006 3.75...' },
    { label: 'Quizzes', link: '/admin/quizzes', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2...' },
    { label: 'Questions', link: '/admin/questions', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5...' },
    { label: 'Answers', link: '/admin/answers', icon: 'M5 13l4 4L19 7' },
    { label: 'Progress', link: '/admin/progress', icon: 'M9 5H7a2 2 0 00-2 2v12...' },
    { label: 'Quiz Results', link: '/admin/quiz-results', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14...' }
  ];
}
