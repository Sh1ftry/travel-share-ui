import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import tt from '@tomtom-international/web-sdk-maps';

export interface Waypoint {
  position: number;
  address: string;
}

const ELEMENT_DATA: Waypoint[] = [
  {position: 1, address: 'Kwiatowa 5, Nibylandia'},
  {position: 2, address: 'Politechnika 69, Patolandia'},
  {position: 3, address: 'Dupna 13, Toaleta'},
];

@Component({
  selector: 'app-route',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class RouteComponent implements OnInit {

  displayedColumns: string[] = ['position', 'name'];
  dataSource = ELEMENT_DATA;

  constructor() { }

  ngOnInit(): void {
    const map = tt.map({
      key: 'key',
      container: 'map',
      center: [9.247769, 50.117286],
      zoom: 4,
      style: 'tomtom://vector/1/basic-main'
    });
    map.addControl(new tt.NavigationControl());
  }

}
