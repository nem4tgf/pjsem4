import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './service/auth.guard'; // Đảm bảo đường dẫn đúng tới AuthGuard của bạn
import { LoginComponent } from './admin/components/login/login.component'; // Import LoginComponent

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Chuyển hướng mặc định đến trang login
  {
    path: 'admin',
    // Cấu hình LAZY LOADING cho AdminModule
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard], // Bảo vệ các route trong AdminModule
    data: { role: 'ROLE_ADMIN' }
  },
  { path: '**', redirectTo: '/login' } // Xử lý các route không khớp (ví dụ: trang 404)
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
