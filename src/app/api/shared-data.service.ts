import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  tripDataDate: any;

  constructor() { }

  setTripDataDate(data: any) {
    this.tripDataDate = data;
  }
}
