import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';

const baseUrl = 'http://127.0.0.1:8000/api';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<any> {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Something bad happened; please try again later.');
  }

  // get user by email
  findByEmail(userEmail): Observable<any> {
    // const url = baseUrl + '/users/email/?email= + encodeURIComponent(email);
    return this.http.get(`${baseUrl}/users/email/`, {params: {email: userEmail}});
  }

  // get all by user id friends/<pk_user>
  getAllByUserId(id): Observable<any> {
    return this.http.get(`${baseUrl}/friends/${id}`);
  }

  // add friends to user friends
  addFriend(idUser,  data): Observable<any> {
    return this.http.put(`${baseUrl}/friends/${idUser}/`, data, this.httpOptions);
  }

  // delete friend from user friends/<pk_user>/
  delete(idUser, data): Observable<any> {
    console.log('data', data);
    return this.http.patch(`${baseUrl}/friends/${idUser}/`, data, this.httpOptions)
      .pipe(
        // catchError(this.handleError('deleteFriend'))
    );
  }
}
