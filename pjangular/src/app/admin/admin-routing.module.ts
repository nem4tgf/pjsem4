// src/app/admin/admin-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AnswersComponent } from './pages/answers/answers.component';
import { FlashcardsComponent } from './pages/flashcards/flashcards.component';
import { LearningMaterialsComponent } from './pages/learning-materials/learning-materials.component';
import { LessonVocabularyComponent } from './pages/lesson-vocabulary/lesson-vocabulary.component';
import { LessonsComponent } from './pages/lessons/lessons.component';
import { ProgressComponent } from './pages/progress/progress.component';
import { QuestionsComponent } from './pages/questions/questions.component';
import { QuizResultsComponent } from './pages/quiz-results/quiz-results.component';
import { QuizzesComponent } from './pages/quizzes/quizzes.component';
import { UsersComponent } from './pages/users/users.component';
import { VocabularyComponent } from './pages/vocabulary/vocabulary.component';

// *** THÊM CÁC COMPONENT MỚI ***
import { OrdersComponent } from './pages/orders/orders.component';
import { PaymentsComponent } from './pages/payments/payments.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'learning-materials', component: LearningMaterialsComponent },
      { path: 'flashcards', component: FlashcardsComponent },
      { path: 'lessons', component: LessonsComponent },
      { path: 'progress', component: ProgressComponent },
      { path: 'questions', component: QuestionsComponent },
      { path: 'quiz-results', component: QuizResultsComponent },
      { path: 'quizzes', component: QuizzesComponent },
      { path: 'users', component: UsersComponent },
      { path: 'vocabulary', component: VocabularyComponent },
      { path: 'answers', component: AnswersComponent },
      { path: 'lessons/:lessonId/vocabulary', component: LessonVocabularyComponent },
      // *** THÊM CÁC ĐỊNH TUYẾN MỚI VÀO ĐÂY ***
      { path: 'orders', component: OrdersComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
