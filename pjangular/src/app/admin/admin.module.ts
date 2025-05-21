import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AdminComponent } from './admin.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { VocabularyComponent } from './pages/vocabulary/vocabulary.component';
import { LessonsComponent } from './pages/lessons/lessons.component';
import { QuizzesComponent } from './pages/quizzes/quizzes.component';
import { QuestionsComponent } from './pages/questions/questions.component';
import { AnswersComponent } from './pages/answers/answers.component';
import { ProgressComponent } from './pages/progress/progress.component';
import { QuizResultsComponent } from './pages/quiz-results/quiz-results.component';

@NgModule({
  declarations: [
    AdminComponent,
    SidebarComponent,
    DashboardComponent,
    UsersComponent,
    VocabularyComponent,
    LessonsComponent,
    QuizzesComponent,
    QuestionsComponent,
    AnswersComponent,
    ProgressComponent,
    QuizResultsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgApexchartsModule,
    NzLayoutModule,
    NzTableModule,
    NzInputModule,
    NzModalModule,
    NzFormModule,
    NzCardModule,
    NzProgressModule,
    NzDividerModule,
    NzIconModule,
    NzBadgeModule,
    NzDropDownModule,
    NzAvatarModule,
    NzNotificationModule,
    NzSelectModule,
    NzUploadModule,
    NzMenuModule
  ],
  exports: [AdminComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminModule {}
