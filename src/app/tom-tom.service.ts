import { Injectable } from '@angular/core';
import {EMPTY, from, Observable, of} from 'rxjs';
import { map } from 'rxjs/operators';
import tt from '@tomtom-international/web-sdk-services';

@Injectable({
  providedIn: 'root'
})
export class TomTomService {

  API_KEY = '';

  private static getLocationsString(locations): string {
    return locations.reduce((result, location) => {
      return result + location.lng + ',' + location.lat + ':';
    }, '').slice(0, -1);
  }

  reverseGeocode(position): Observable<object> {
    // @ts-ignore
    return from(tt.services.reverseGeocode({
      key: this.API_KEY,
      language: 'en-US',
      position
    }).go()).pipe(map(response => {
      // @ts-ignore
      return response.addresses[0];
    }));
  }

  calculateRoute(positions): Observable<object> {
    // @ts-ignore
    const locations = TomTomService.getLocationsString(positions);
    if (locations.includes(':'))
    {
      return from(tt.services.calculateRoute({
        key: this.API_KEY,
        traffic: false,
        locations
      }).go()).pipe(map(response => {
        // @ts-ignore
        return response.toGeoJson();
      }));
    }
    else
    {
      return of({});
    }
  }
}
