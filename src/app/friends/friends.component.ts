import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {FriendsService} from './friends.service';

export interface Friends {
  position: number;
  name: string;
  surname: string;
  email: string;
  password: string;
}

/* const ELEMENT_DATA: Friends[] = [
  {position: 1, name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
  {position: 2, name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
  {position: 3, name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
  {position: 4, name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
  {position: 5, name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
  {position: 6, name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
  {position: 7, name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
  {position: 8, name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
  {position: 9, name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
  {position: 10, name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
]; */

/*const ELEMENT_DATA: Friends[] = [
  { name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
  { name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
  {name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
  {name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
  { name: 'Michal', surname: 'Granda', email: 'michgra097@wp.pl'},
];*/

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit, AfterViewInit{
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  friends: string[] = [];

  displayedColumns: string[] = ['position', 'name', 'surname', 'email', 'delete'];
  ELEMENT_DATA: Friends[] = [];
  dataSource = new MatTableDataSource<Friends>(this.ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog, private service: FriendsService) { }

  ngOnInit(): void {
     this.getAllFriends();
  }

  ngAfterViewInit(): void  {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openDialog(): any {
     this.dialog.open(NoneUserFoundDialogComponent);
  }

  public getAllFriends(): void{
    this.service.getAllByUserId(1).subscribe(friend => {
      this.friends = friend;
      this.dataSource.data = friend as Friends[];
    } );
  }
}

@Component({
  selector: 'app-none-user-found-dialog',
  templateUrl: './nouserdialog.component.html',
})
export class NoneUserFoundDialogComponent {}
