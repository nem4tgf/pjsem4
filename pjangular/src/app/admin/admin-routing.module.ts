import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// --- Import các component của AdminModule sẽ được sử dụng trong routing ---
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
import { StatsComponent } from './pages/stats/stats.component';
import { UsersComponent } from './pages/users/users.component';
import { VocabularyComponent } from './pages/vocabulary/vocabulary.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'learning-materials', component: LearningMaterialsComponent },
      { path: 'flashcards', component: FlashcardsComponent },
      { path: 'stats', component: StatsComponent },
      { path: 'lessons', component: LessonsComponent },
      { path: 'progress', component: ProgressComponent },
      { path: 'questions', component: QuestionsComponent },
      { path: 'quiz-results', component: QuizResultsComponent },
      { path: 'quizzes', component: QuizzesComponent },
      { path: 'users', component: UsersComponent },
      { path: 'vocabulary', component: VocabularyComponent },
      { path: 'answers', component: AnswersComponent },
      // THÊM ROUTE CHO LESSONVOCABULARYCOMPONENT NẾU CÓ TRANG RIÊNG
      {
        path: 'lessons/:lessonId/vocabulary',
        component: LessonVocabularyComponent,
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
