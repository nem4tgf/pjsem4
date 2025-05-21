import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './admin/components/dashboard/dashboard.component';
import { UsersComponent } from './admin/pages/users/users.component';
import { VocabularyComponent } from './admin/pages/vocabulary/vocabulary.component';
import { LessonsComponent } from './admin/pages/lessons/lessons.component';
import { QuizzesComponent } from './admin/pages/quizzes/quizzes.component';
import { QuestionsComponent } from './admin/pages/questions/questions.component';
import { AnswersComponent } from './admin/pages/answers/answers.component';
import { ProgressComponent } from './admin/pages/progress/progress.component';
import { QuizResultsComponent } from './admin/pages/quiz-results/quiz-results.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'vocabulary', component: VocabularyComponent },
      { path: 'lessons', component: LessonsComponent },
      { path: 'quizzes', component: QuizzesComponent },
      { path: 'questions', component: QuestionsComponent },
      { path: 'answers', component: AnswersComponent },
      { path: 'progress', component: ProgressComponent },
      { path: 'quiz-results', component: QuizResultsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/admin', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
