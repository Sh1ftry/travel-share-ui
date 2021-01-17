import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import tt from '@tomtom-international/web-sdk-maps';
import {TomTomService} from '../tom-tom.service';
import {Subject, zip} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';


export class Person {
  constructor(
    public name: string,
    public surname: string,
  ) {}

  getFullName(): string {
    console.log(name);
    return `${this.name} ${this.surname}`;
  }
}

export class Waypoint {
  constructor(
    public position: number,
    public address: string,
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
  panelOpenState = false;
  API_KEY = '';

  displayedColumns: string[] = ['position', 'name'];
  waypoints: Waypoint[] = [];
  map: any;
  markers: any[] = [];
  markersSubject: Subject<number> = new Subject<number>();

  waypointsForms: FormGroup;

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

  constructor(private tomTomService: TomTomService, private formBuilder: FormBuilder) {
    this.waypointsForms = this.formBuilder.group({
      forms: this.formBuilder.array([]),
    });
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
      switchMap(index => zip(
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

  addTraveller(index: number): void {
    const forms = this.waypointsForms.controls.forms as FormArray;
    console.log(forms);
    console.log(forms.at(index));
    const person = forms.at(index).value.name;
    this.waypoints[index].getInto.push(new Person(person, ''));
  }

  getTravelling(index: number): Person[] {
    const waypoints = this.waypoints.slice(0, index + 1);
    const all = [].concat(...waypoints.map(waypoint => waypoint.getInto));
    const left = [].concat(...waypoints.map(waypoint => waypoint.getOut));
    left.forEach(person => all.splice(all.indexOf(person), 1));
    return all;
  }

  updateWaypoint(patch): void {
    const address = patch.address.address.freeformAddress;
    console.log(address);
    if (this.waypoints.length === patch.index) {
      console.log('pushing');
      this.waypoints.push(new Waypoint(
        patch.index,
        address,
      ));
      const forms = this.waypointsForms.controls.forms as FormArray;
      forms.push(this.formBuilder.group({
        name: ''
      }));
    }
    else {
      console.log('updating');
      this.waypoints[patch.index].address = address;
    }
  }

  createMarker(position): number {
    const index = this.markers.length;
    const marker = new tt.Marker({
      draggable: true
    }).setLngLat(position)
      .addTo(this.map)
      .on('dragend', () => this.markersSubject.next(index));
    this.markers.push(marker);
    return index;
  }

  drawRoute(geojson): void {
    if (!('features' in geojson)) {
      return;
    }
    console.log(geojson);
    console.log(geojson.features[0].properties.segmentSummary);
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
