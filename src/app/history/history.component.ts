import { Component, OnInit } from '@angular/core';
import {HistoryService} from './history.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {AuthenticationService} from '../authentication.service';
import {User} from '../user';
import {NGXLogger} from 'ngx-logger';

export interface Route {
  position: number;
  name: number;
  date: string;
  fuel_price: number;
  participants: Participants[];
  waypoints: Waypoint[];
}

export interface Participants {
  first_name: string;
  last_name: string;
  price: number;
}

export interface Waypoint {
  address: string;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HistoryComponent implements OnInit {
  dataSource = [];
  public routes = [];
  columnsToDisplay = ['name', 'date', 'length', 'fuel_price'];
  expandedElement: Route | null;
  columnsParticipants = ['first_name', 'last_name', 'price'];
  dataSourceParticipants = this.routes;


  user: User;

  constructor(
    private service: HistoryService,
    private authService: AuthenticationService,
    private logger: NGXLogger,
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user =>
      this.user = user
    );
    this.getAllRoutes();
  }

  public getAllRoutes(): void{
    this.service.getAllByUserId(this.user.id).subscribe(routes => {
      this.routes = routes;
      this.dataSource = this.routes;
    } );
  }
}
