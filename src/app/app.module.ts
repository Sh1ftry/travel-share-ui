import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppRoutingModule } from './app-routing.module';
import { RouteComponent } from './route/route.component';
import { HistoryComponent } from './history/history.component';
import { FriendsComponent } from './friends/friends.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRippleModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { LoginComponent } from './login/login.component';
import { MatTabsModule } from '@angular/material/tabs';
import { BearerAuthInterceptor } from './bearer-auth.interceptor';
import { ErrorInterceptor } from './error.interceptor';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AppComponent,
    RouteComponent,
    HistoryComponent,
    FriendsComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    AppRoutingModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRippleModule,
    MatCardModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    DragDropModule,
    ReactiveFormsModule,
    MatTabsModule,
    LoggerModule.forRoot({level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.OFF})
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BearerAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
