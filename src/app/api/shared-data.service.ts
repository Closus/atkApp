import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  tripDataDate: any;
  private selectedTripSubject = new BehaviorSubject<any>(null);
  selectedTrip$ = this.selectedTripSubject.asObservable();

  setSelectedTrip(trip: any): void {
    this.selectedTripSubject.next(trip);
  }

  setTripDataDate(data: any) {
    this.tripDataDate = data;
  }
}
