import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import tt from '@tomtom-international/web-sdk-maps';
import {TomTomService} from '../tom-tom.service';
import {Subject, zip} from 'rxjs';
import {concatMap, map, tap} from 'rxjs/operators';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {NGXLogger} from 'ngx-logger';
import {environment} from '../../environments/environment';
import {MatSnackBar} from '@angular/material/snack-bar';


export class Person {
  constructor(
    public name: string,
    public surname: string,
  ) {}

  getFullName(): string {
    return `${this.name} ${this.surname}`;
  }
}

export class Waypoint {
  constructor(
    public address: string,
    public distanceFromPrevious: number,
    public getInto: Person[] = [],
    public getOut: Person[] = [],
  ) {}
}

@Component({
  selector: 'app-route',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class RouteComponent implements OnInit {
  map: any;
  markersSubject: Subject<number> = new Subject<number>();

  waypoints: Waypoint[] = [];
  markers: any[] = [];
  routeDetailsForm: FormGroup;
  waypointsForms: FormGroup;

  constructor(
    private tomTomService: TomTomService,
    private formBuilder: FormBuilder,
    private logger: NGXLogger,
    private snackBar: MatSnackBar,
  ) {
    this.createForms();
  }

  createForms(): void {
    this.waypointsForms = this.formBuilder.group({
      forms: this.formBuilder.array([]),
    });
    this.routeDetailsForm = this.formBuilder.group({
      routeName: this.formBuilder.control('', Validators.required),
      consumption: this.formBuilder.control('', [
        this.fuelAndPriceValidator,
        Validators.required
      ]),
      price: this.formBuilder.control('', [
        this.fuelAndPriceValidator,
        Validators.required
      ]),
      date: this.formBuilder.control('', [
        this.dateValidator,
        Validators.required
      ]),
    });
  }

  fuelAndPriceValidator(control: FormControl): { [s: string]: boolean } {
    if (control.value) {
      const parsedFloat = parseFloat(control.value);
      if (isNaN(parsedFloat) || parsedFloat < 0)
      {
        return { invalidFloat: true };
      }
    }
    return null;
  }

  dateValidator(control: FormControl): { [s: string]: boolean } {
    if (control.value) {
      const date = new Date(control.value);
      // @ts-ignore
      if (!(date instanceof Date) || isNaN(date)) {
        return { invalidDate: true };
      }
    }
    return null;
  }

  getFormValidationErrors(): boolean {
    let final = false;
    Object.keys(this.routeDetailsForm.controls).forEach(key => {
      const controlErrors: ValidationErrors = this.routeDetailsForm.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          final = final || controlErrors[keyError];
        });
      }
    });
    return final;
  }

  ngOnInit(): void {
    const center = [19.356389, 52.196667];
    this.map = tt.map({
      key: environment.tomtomApiKey,
      container: 'map',
      center,
      zoom: 7,
      style: 'tomtom://vector/1/basic-main'
    });
    this.map.addControl(new tt.NavigationControl());
    this.map.on('click', event => {
      const position = new tt.LngLat(event.lngLat.lng, event.lngLat.lat);
      const index = this.createMarker(position);
      this.markersSubject.next(index);
    });

    this.markersSubject.pipe(
      concatMap(index => zip(
          this.tomTomService.calculateRoute(this.markers.map(marker => marker.getLngLat())),
          this.tomTomService.reverseGeocode(this.markers[index].getLngLat()),
      ).pipe(map(([geojson, address]) => {
        return {
          index, geojson, address
        };
      }))),
      tap(patch => this.drawRoute(patch.geojson))
    ).subscribe(patch => this.updateWaypoint(patch));
  }

  calculate(): void {
    if (this.getFormValidationErrors()
      || this.waypoints.length < 2
      || this.waypoints.map(waypoint => waypoint.getInto.length < 1).reduce((final, current) => final &&= current)
    )
    {
      this.snackBar.open('Please properly fill waypoints and route details', 'Ok', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    this.logger.debug('Calculating final shares');
    const travellers = {};
    const lastWaypointIndex = this.waypoints.length - 1;
    this.waypoints.forEach((waypoint, index) => {
      waypoint.getInto.forEach(person => {
        if (travellers[person.getFullName()] === undefined)
        {
          travellers[person.getFullName()] = [];
        }
        const segment = {
          getIn: index,
          getOut: lastWaypointIndex
        };
        this.logger.debug(`Adding ${JSON.stringify(segment)} segment for ${person.getFullName()}`);
        travellers[person.getFullName()].push(segment);
      });
      waypoint.getOut.forEach(person => {
        travellers[person.getFullName()].forEach(segment => {
          if (segment.getOut === lastWaypointIndex) {
            segment.getOut = index;
          }
        });
      });
    });

    const averageFuelConsumption = parseFloat(this.routeDetailsForm.value.consumption);
    const fuelPrice = parseFloat(this.routeDetailsForm.value.price);
    const routeLength = this.waypoints
      .map(waypoint => waypoint.distanceFromPrevious)
      .reduce((full, current) => full += current);

    const fullPrice = (routeLength / 100000) * averageFuelConsumption * fuelPrice;
    this.logger.debug(`Route length is ${routeLength}m and full price is ${fullPrice}`);

    const shares = {};
    Object.keys(travellers).forEach(name => {
      let travellerDistance = 0.0;
      travellers[name].forEach(segment => {
        this.waypoints.slice(segment.getIn + 1, segment.getOut + 1)
          .forEach(waypoint => travellerDistance += waypoint.distanceFromPrevious);
      });
      if (shares[name] === undefined) {
        shares[name] = 0.0;
      }
      let share = (travellerDistance / routeLength);
      if (isNaN(share)) {
        share = 1.0;
      }
      shares[name] = shares[name] + share;
    });

    this.logger.debug(`Distance shares ${JSON.stringify(shares)}`);

    let sharesSum = 1.0;
    if (Object.keys(shares).length > 0) {
      // @ts-ignore
      sharesSum = Object.values(shares).reduce((sum: number, current: number) => sum += current);
    }

    this.logger.debug(`Sum of all distances shares is ${sharesSum}`);

    const priceShares = {};
    Object.keys(shares).forEach(name => {
      const travellerShare = (shares[name] / sharesSum) * fullPrice;
      priceShares[name] = travellerShare;
    });

    this.logger.debug(`Final shares ${JSON.stringify(priceShares)}`);
  }

  cancel(): void {
    window.location.reload();
  }

  addTraveller(index: number): void {
    this.logger.debug(`Adding traveller to waypoint ${index}`);
    const forms = this.waypointsForms.controls.forms as FormArray;
    const person = forms.at(index).value.name;
    forms.at(index).setValue({
      name: ''
    });
    this.waypoints[index].getInto.push(new Person(person, ''));
  }

  deleteTraveller(index: number, person: Person): void {
    this.logger.debug(`Trying to delete ${person.getFullName()} from waypoints ${index}`);
    this.waypoints.slice(index).forEach(waypoint => {
      const getIntoIndex = waypoint.getInto.indexOf(person);
      const getOutIndex = waypoint.getOut.indexOf(person);
      if (getIntoIndex > -1)
      {
        this.logger.debug(`Deleting ${person.getFullName()} from get into list`);
        waypoint.getInto.splice(getIntoIndex, 1);
      }
      else if (getOutIndex > -1)
      {
        this.logger.debug(`Deleting ${person.getFullName()} from get out list`);
        waypoint.getOut.splice(getOutIndex, 1);
      }
    });
  }

  getTravelling(index: number): Person[] {
    const waypoints = this.waypoints.slice(0, index + 1);
    const all = [].concat(...waypoints.map(waypoint => waypoint.getInto));
    const left = [].concat(...waypoints.map(waypoint => waypoint.getOut));
    left.forEach(person => all.splice(all.indexOf(person), 1));
    return all;
  }

  deleteWaypoint(index: number): void {
    this.logger.debug(`Deleting ${index} waypoint`);
    this.deleteMarker(index);
    this.waypoints[index].getInto.forEach(person => {
      this.deleteTraveller(index, person);
    });
    this.waypoints.splice(index, 1);
    this.tomTomService
      .calculateRoute(this.markers.map(m => m.getLngLat()))
      .pipe(
        tap(geojson => this.drawRoute(geojson))
      )
      .subscribe(geojson => {
        this.waypoints.forEach((waypoint, i) => {
          if (i > 0)
          {
            // @ts-ignore
            waypoint.distanceFromPrevious = geojson.features[0].properties.segmentSummary[i - 1].lengthInMeters;
          }
          else
          {
            waypoint.distanceFromPrevious = 0;
          }
        });
      });
    const forms = this.waypointsForms.controls.forms as FormArray;
    forms.removeAt(index);
  }

  updateWaypoint(patch): void {
    const address = patch.address.address.freeformAddress;
    let distanceFromPrevious = 0;
    if ('features' in patch.geojson && patch.index > 0)
    {
      distanceFromPrevious = patch.geojson.features[0].properties.segmentSummary[patch.index - 1].lengthInMeters;
    }
    if (this.waypoints.length === patch.index) {
      this.logger.debug(`Adding new waypoint with address ${address}`);
      this.waypoints.push(new Waypoint(address, distanceFromPrevious));
      const forms = this.waypointsForms.controls.forms as FormArray;
      forms.push(this.formBuilder.group({
        name: ''
      }));
    }
    else {
      this.logger.debug(`Updating existing waypoint ${patch.index} with address ${address}`);
      this.waypoints[patch.index].address = address;
      this.waypoints[patch.index].distanceFromPrevious = distanceFromPrevious;
      if (patch.index !== this.waypoints.length - 1)
      {
        this.waypoints[patch.index + 1].distanceFromPrevious =
          patch.geojson.features[0].properties.segmentSummary[patch.index].lengthInMeters;
      }
    }
  }

  deleteMarker(position): void {
    this.logger.debug(`Removing marker ${position}`);
    const marker = this.markers[position];
    marker.remove();
    this.markers.splice(this.markers.lastIndexOf(marker), 1);
  }

  createMarker(position): number {
    const index = this.markers.length;
    this.logger.debug(`Creating marker ${index}`);
    const marker = new tt.Marker({
      draggable: true
    }).setLngLat(position)
      .addTo(this.map)
      .on('dragend', () => {
        this.markersSubject.next(this.markers.indexOf(marker));
      });
    this.markers.push(marker);
    return index;
  }

  drop(event: CdkDragDrop<Person[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  drawRoute(geojson): void {
    if (!('features' in geojson)) {
      if (this.map.getLayer('route')) {
        this.map.removeLayer('route');
        this.map.removeSource('route');
      }
      return;
    }
    this.logger.debug(`Got proper GeoJSON - drawing map`);
    if (this.map.getLayer('route')) {
      this.map.removeLayer('route');
      this.map.removeSource('route');
    }
    this.map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geojson
      },
      paint: {
        'line-color': '#2faaff',
        'line-width': 6
      }
    }, this.findFirstBuildingLayerId());
  }

  findFirstBuildingLayerId(): number {
    const layers = this.map.getStyle().layers;
    for (const index in layers) {
      if (layers[index].type === 'fill-extrusion') {
        return layers[index].id;
      }
    }
  }
}
