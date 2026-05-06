import {Injectable} from '@angular/core';
import {ReplaySubject, Subject} from "rxjs";
import {LatLngBounds} from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  mapBoundsSource: Subject<LatLngBounds> = new ReplaySubject<LatLngBounds>(1)

  currentMapBounds = this.mapBoundsSource.asObservable()

}

