import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { VocabularyComponent } from './pages/vocabulary/vocabulary.component';
import { LessonsComponent } from './pages/lessons/lessons.component';
import { ProgressComponent } from './pages/progress/progress.component';
import { QuestionsComponent } from './pages/questions/questions.component';
import { AnswersComponent } from './pages/answers/answers.component';
import { QuizResultsComponent } from './pages/quiz-results/quiz-results.component';
import { LearningMaterialsComponent } from './pages/learning-materials/learning-materials.component';
import { FlashcardsComponent } from './pages/flashcards/flashcards.component';
import { StatsComponent } from './pages/stats/stats.component';
import { LessonVocabularyComponent } from './pages/lesson-vocabulary/lesson-vocabulary.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { QuizzesComponent } from './pages/quizzes/quizzes.component';

import { AuthGuard } from '../service/auth.guard';
import { UserListeningAttemptsComponent } from './pages/user-listening/user-listening-attempts.component';
import { UserSpeakingAttemptsComponent } from './pages/user-speaking/user-speaking-attempts.component';
import { UserWritingAttemptsComponent } from './pages/user-writting/user-writing-attempts.component';
import { PracticeActivityComponent } from './pages/practice-activity/practice-activity.component'; // Import component mới

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN'] },
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'learning-materials', component: LearningMaterialsComponent },
      { path: 'flashcards', component: FlashcardsComponent },
      { path: 'lessons', component: LessonsComponent },
      { path: 'lesson-vocabulary/:lessonId', component: LessonVocabularyComponent },
      { path: 'progress', component: ProgressComponent },
      { path: 'questions', component: QuestionsComponent },
      { path: 'answers', component: AnswersComponent },
      { path: 'quiz-results', component: QuizResultsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'vocabulary', component: VocabularyComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'stats', component: StatsComponent },
      { path: 'listening-attempts', component: UserListeningAttemptsComponent },
      { path: 'speaking-attempts', component: UserSpeakingAttemptsComponent },
      { path: 'writing-attempts', component: UserWritingAttemptsComponent },
      { path: 'quizzes', component: QuizzesComponent },
      { path: 'practice-activities', component: PracticeActivityComponent }, // Đã thêm route mới
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
