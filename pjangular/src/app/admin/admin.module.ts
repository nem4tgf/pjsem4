import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AdminRoutingModule } from './admin-routing.module';

// Import các module ng-zorro-antd cần thiết
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageModule } from 'ng-zorro-antd/message';

// Import các component
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AnswersComponent } from './pages/answers/answers.component';
import { FlashcardsComponent } from './pages/flashcards/flashcards.component';
import { LearningMaterialsComponent } from './pages/learning-materials/learning-materials.component';
import { LessonVocabularyComponent } from './pages/lesson-vocabulary/lesson-vocabulary.component';
import { LessonsComponent } from './pages/lessons/lessons.component';
import { ProgressComponent } from './pages/progress/progress.component';
import { QuestionsComponent } from './pages/questions/questions.component';
import { QuizResultsComponent } from './pages/quiz-results/quiz-results.component';
import { QuizzesComponent } from './pages/quizzes/quizzes.component';
import { StatsComponent } from './pages/stats/stats.component';
import { UsersComponent } from './pages/users/users.component';
import { VocabularyComponent } from './pages/vocabulary/vocabulary.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { PaymentsComponent } from './pages/payments/payments.component';

@NgModule({
  declarations: [
    AdminComponent,
    SidebarComponent,
    DashboardComponent,
    HeaderComponent,
    UsersComponent,
    VocabularyComponent,
    LessonsComponent,
    ProgressComponent,
    QuizzesComponent,
    QuestionsComponent,
    AnswersComponent,
    QuizResultsComponent,
    LearningMaterialsComponent,
    FlashcardsComponent,
    StatsComponent,
    LessonVocabularyComponent,
    OrdersComponent,
    PaymentsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AdminRoutingModule,
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
    NzMenuModule,
    NzSwitchModule,
    NzButtonModule,
    NzSpinModule,
    NzInputNumberModule,
    NzTagModule,
    NzPopoverModule,
    NzListModule,
    NzPopconfirmModule,
    NzDatePickerModule,
    NzMessageModule,
  ],
  exports: [LessonVocabularyComponent],
})
export class AdminModule {}
