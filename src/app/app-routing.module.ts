import { NgModule } from '@angular/core';
import { RouterModule, Routes} from '@angular/router';
import { RouteComponent } from './route/route.component';
import { HistoryComponent } from './history/history.component';
import { FriendsComponent, NoneUserFoundDialogComponent } from './friends/friends.component';

const routes: Routes = [
  { path: 'route', component: RouteComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'friends', component: FriendsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
