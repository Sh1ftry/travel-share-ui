import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {FriendsService} from './friends.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NGXLogger} from 'ngx-logger';
import {AuthenticationService} from '../authentication.service';
import {User} from '../user';
import {HttpResponse} from '@angular/common/http';

export interface Friends {
  position: number;
  first_name: string;
  last_name: string;
  email: string;
}

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

  displayedColumns: string[] = ['position', 'first_name', 'last_name', 'email', 'delete'];
  ELEMENT_DATA: Friends[] = [];
  dataSource = new MatTableDataSource<Friends>(this.ELEMENT_DATA);
  emailForm: string;
  foundUser = '';
  user: User;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public dialog: MatDialog,
    private service: FriendsService,
    private snackBar: MatSnackBar,
    private logger: NGXLogger,
    private authService: AuthenticationService,
  ) { }


  ngOnInit(): void {
    this.authService.currentUser.subscribe(user =>
      this.user = user
    );
    this.getAllFriends(this.user.id);
  }

  ngAfterViewInit(): void  {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public getAllFriends(id): void{
    this.service.getAllByUserId(id).subscribe(friends => {
      this.dataSource.data =  friends.map((friend, index) => { return {...friend, position: index + 1};
      } );
    });
  }

  public addFriend(): void{;
    const emailInput = this.emailForm;
    this.logger.debug(`Add friends`);
    this.service.findByEmail(emailInput).subscribe(friend => {
        this.foundUser = friend;
        const email = {
          email: this.emailForm
        };
        this.service.addFriend(this.user.id, email).subscribe(user => {
          const data = this.dataSource.data;
          data.push({first_name: user.first_name, email: user.email, last_name: user.last_name, position: data.length + 1});
          this.dataSource.data = data;
          this.logger.debug(`${user.email} added to friends list`);
        }, error => {
          this.logger.error(`Error: ${error}`);
          if (error === 'Not Found')
          {
            this.snackBar.open('User with this email does not exist', 'Ok', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
          else if (error === 'Bad Request')
          {
            this.snackBar.open('You are already friends', 'Ok', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
          else {
            this.snackBar.open('Something went wrong', 'Ok', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
        });
      }, (error) => {
        this.logger.error(`Error: ${error.status}`);
        this.snackBar.open('Something went wrong', 'Ok', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        });
  }

  public deleteFriend(e): void {
    const email = {
      email: e.email
    };

    this.service.delete(this.user.id, email).subscribe({
        next: response => {
          this.logger.debug(`Delete successful`);
          const data = this.dataSource.data.filter(user => user.email !== e.email)
            .map((user, index) => {
              user.position = index + 1;
              return user;
            });
          this.dataSource.data = data;
          this.snackBar.open('Friend has been deleted', 'Ok', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
        error: error => {
          this.logger.error(`An error occurred: ${error}`);
        }
      });
  }
}
