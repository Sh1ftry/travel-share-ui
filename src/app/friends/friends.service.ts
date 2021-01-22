import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {environment} from '../../environments/environment';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  findByEmail(userEmail): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/users/email/`, {params: {email: userEmail}});
  }

  getAllByUserId(id): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/friends/${id}`);
  }

  addFriend(idUser,  data): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/friends/${idUser}/`, data, this.httpOptions).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error);
      })
    );
  }

  delete(idUser, data): Observable<any> {
    console.log('data', data);
    return this.http.patch(`${environment.apiUrl}/api/friends/${idUser}/`, data, this.httpOptions)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(error);
        })
    );
  }
}
