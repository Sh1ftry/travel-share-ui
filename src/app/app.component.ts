import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import tt from '@tomtom-international/web-sdk-maps';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    const map = tt.map({
      key: 'key',
      container: 'map',
      center: [9.247769, 50.117286],
      zoom: 4,
      style: 'tomtom://vector/1/basic-main'
    });
    map.addControl(new tt.FullscreenControl());
    map.addControl(new tt.NavigationControl());
  }
}
