import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
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

  displayedColumns: string[] = ['position', 'name', 'surname', 'email', 'delete'];
  ELEMENT_DATA: Friends[] = [];
  dataSource = new MatTableDataSource<Friends>(this.ELEMENT_DATA);
  emailForm: string;
  foundUser = '';

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

  public getAllFriends(): void{
    this.service.getAllByUserId(1).subscribe(friends => {
      this.dataSource.data =  friends.map((friend, index) => { return {...friend, position: index + 1};
      } );
    });
  }

  public addFriend(): void{

    let errorText;
    const emailInput = this.emailForm;
    this.service.findByEmail(emailInput).subscribe(friend => {
        this.foundUser = friend;
        const data = {
          email: this.emailForm
        };
        this.service.addFriend(1, data).subscribe(user => {
          window.location.reload();
        });

      }, (error) => {
        errorText = error;
        console.log(error);
        this.dialog.open(NoneUserFoundDialogComponent);
      });
  }

  public deleteFriend(e): void {
    const data = {
      email: e.email
    };

    this.service.delete(1, data).subscribe({
        next: response => {
          console.log('Delete successful');
        },
        error: error => {
          console.error('There was an error!', error);
        }
      });
    window.location.reload();
  }
}

@Component({
  selector: 'app-none-user-found-dialog',
  templateUrl: './nouserdialog.component.html',
})
export class NoneUserFoundDialogComponent {}
