import {Injectable} from '@angular/core';
import {Observable, Observer} from 'rxjs';
import {Marker} from '../../shared/model/marker';

function getOrPut<K, V>(map: Map<K, V>, key: K, value: V): V {
  if (map.has(key)) {
    return map.get(key)!;
  }
  map.set(key, value)
  return value;
}

@Injectable({
  providedIn: 'root',
})
export class MarkerStoreService {
  private markers = new Map<string, Marker[]>();
  private observers = new Map<string, Observer<Marker[]>[]>();

  constructor() {
  }

  add(path: string, marker: Marker) {
    const markers = getOrPut(this.markers, path, []);
    markers.push(marker);
    this.broadcast(path, markers);
  }

  private broadcast(path: string, markers: Marker[]) {
    const observers = this.observers.get(path);
    if (observers) {
      for (let observer of observers) {
        observer.next(markers);
      }
    }
  }

  clear(path: string): void {
    this.markers.delete(path);
    this.broadcast(path, []);
  }

  subscribe(path: string): Observable<Marker[]> {
    return new Observable<Marker[]>(observer => {
      this.addObserver(path, observer);
      return () => this.removeObserver(path, observer);
    });
  }

  private addObserver(path: string, observer: Observer<Marker[]>) {
    getOrPut(this.observers, path, []).push(observer);
    observer.next(this.markers.get(path) ?? []);
  }

  private removeObserver(path: string, observer: Observer<Marker[]>) {
    const observers = this.observers.get(path);
    if (!observers) {
      return;
    }

    observers.removeFirst(o => o === observer);
    if (observers.length === 0) {
      this.observers.delete(path);
    }
  }
}
