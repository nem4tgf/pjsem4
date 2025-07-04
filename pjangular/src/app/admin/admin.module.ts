import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AdminRoutingModule } from './admin-routing.module';

// Import các module NG-ZORRO cụ thể
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
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

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
import { StatsComponent } from './pages/stats/stats.component';
import { UsersComponent } from './pages/users/users.component';
import { VocabularyComponent } from './pages/vocabulary/vocabulary.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { QuizzesComponent } from './pages/quizzes/quizzes.component';
import { UserListeningAttemptsComponent } from './pages/user-listening/user-listening-attempts.component';
import { UserSpeakingAttemptsComponent } from './pages/user-speaking/user-speaking-attempts.component';
import { UserWritingAttemptsComponent } from './pages/user-writting/user-writing-attempts.component';
// Import component mới
import { PracticeActivityComponent } from './pages/practice-activity/practice-activity.component';


// Import các service
import { FlashcardService } from '../service/flashcard.service';
import { FlashcardSetService } from '../service/flashcard-set.service';
import { ApiService } from '../service/api.service';
import { AuthService } from '../service/auth.service';
import { AuthInterceptor } from '../service/auth.interceptor';
import { UserListeningAttemptService } from '../service/user-listening-attempt.service';
import { UserService } from '../service/user.service';
import { QuestionService } from '../service/question.service';
import { OrderService } from '../service/order.service';
import { PaymentService } from '../service/payment.service';
import { QuizService } from '../service/quiz.service';
import { UserSpeakingAttemptService } from '../service/user-speaking-attempt.interface';
import { UserWritingAttemptService } from '../service/user-writting-attempt.service';
import { PracticeActivityService } from '../service/pratice-activity.service';
// Điều chỉnh import này, cần đảm bảo đường dẫn và tên đúng với service của bạn


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
    QuestionsComponent,
    AnswersComponent,
    QuizResultsComponent,
    LearningMaterialsComponent,
    FlashcardsComponent,
    StatsComponent,
    LessonVocabularyComponent,
    OrdersComponent,
    PaymentsComponent,
    QuizzesComponent,
    UserListeningAttemptsComponent,
    UserSpeakingAttemptsComponent,
    UserWritingAttemptsComponent,
    PracticeActivityComponent, // Đã thêm component mới vào đây
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AdminRoutingModule,
    NgApexchartsModule,
    NzAvatarModule,
    NzBadgeModule,
    NzButtonModule,
    NzCardModule,
    NzDividerModule,
    NzDropDownModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzLayoutModule,
    NzMenuModule,
    NzModalModule,
    NzNotificationModule,
    NzProgressModule,
    NzSelectModule,
    NzSpinModule,
    NzSwitchModule,
    NzTableModule,
    NzUploadModule,
    NzTagModule,
    NzPopconfirmModule,
    NzPopoverModule,
    NzListModule,
    NzDatePickerModule,
    NzMessageModule,
    NzToolTipModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
  ],
  providers: [
    FlashcardService,
    FlashcardSetService,
    ApiService,
    AuthService,
    UserService,
    QuestionService,
    UserListeningAttemptService,
    UserSpeakingAttemptService,
    UserWritingAttemptService,
    PracticeActivityService, // Đã thêm service mới vào đây
    OrderService,
    PaymentService,
    QuizService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  exports: [LessonVocabularyComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminModule {}
