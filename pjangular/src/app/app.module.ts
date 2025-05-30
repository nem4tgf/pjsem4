import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Import LoginComponent nếu nó là một trang độc lập (không thuộc AdminModule)
import { LoginComponent } from './admin/components/login/login.component';
// Import AuthInterceptor
import { AuthInterceptor } from './service/auth.interceptor';


// Import các module Ng-Zorro Ant Design CHỈ cần cho AppComponent hoặc LoginComponent
// Nếu các component này không dùng gì, có thể bỏ bớt các import này.
// Ví dụ: NzCardModule, NzInputModule, NzButtonModule, NzFormModule nếu LoginComponent sử dụng chúng.
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzNotificationModule } from 'ng-zorro-antd/notification'; // Thông báo chung cho ứng dụng


registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent // Khai báo LoginComponent ở đây vì nó là một điểm truy cập ban đầu của ứng dụng
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, // Chứa cấu hình routing chính, bao gồm cả lazy loading cho AdminModule
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,          // Cần cho các form (bao gồm login)
    ReactiveFormsModule,  // Cần cho các form (bao gồm login)

    // Các module Ng-Zorro Ant Design được sử dụng bởi AppComponent hoặc LoginComponent
    NzCardModule,
    NzInputModule,
    NzButtonModule,
    NzFormModule,
    NzNotificationModule,

    // KHÔNG IMPORT AdminModule Ở ĐÂY.
    // Nó sẽ được tải lười biếng thông qua AppRoutingModule.
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
