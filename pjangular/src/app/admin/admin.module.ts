import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AdminRoutingModule } from './admin-routing.module';

// --- Import TẤT CẢ các module Ng-Zorro Ant Design được sử dụng TRONG ADMIN MODULE ---
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
import { NzModalModule } from 'ng-zorro-antd/modal'; // <-- Cần cho NzModalService và nz-modal
import { NzNotificationModule } from 'ng-zorro-antd/notification'; // <-- Cần cho NzNotificationService
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSelectModule } from 'ng-zorro-antd/select'; // <-- Cần cho nz-select (nếu bạn dùng nó trong template của LessonVocabularyComponent)
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzUploadModule } from 'ng-zorro-antd/upload';

// --- Import các component của AdminModule ---
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
    LessonVocabularyComponent, // <-- KHAI BÁO COMPONENT MỚI Ở ĐÂY
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AdminRoutingModule,
    NgApexchartsModule,

    // --- Đảm bảo các module Ng-Zorro này được import đầy đủ ---
    NzLayoutModule,
    NzTableModule,
    NzInputModule,
    NzModalModule, // Quan trọng: Cần có NzModalModule
    NzFormModule,
    NzCardModule,
    NzProgressModule,
    NzDividerModule,
    NzIconModule,
    NzBadgeModule,
    NzDropDownModule,
    NzAvatarModule,
    NzNotificationModule, // Quan trọng: Cần có NzNotificationModule
    NzSelectModule, // Quan trọng: Cần có NzSelectModule nếu template của LessonVocabularyComponent sử dụng nz-select
    NzUploadModule,
    NzMenuModule,
    NzSwitchModule,
    NzButtonModule,
    NzSpinModule,
    NzInputNumberModule,
  ],
  exports: [
    // Export LessonVocabularyComponent nếu nó sẽ được sử dụng bởi các component từ các module khác
    // nhưng thường thì không cần nếu nó chỉ được sử dụng trong AdminModule
    LessonVocabularyComponent, // <-- Có thể cần export nếu LessonsComponent là cha và cần dùng LessonVocabularyComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminModule {}
