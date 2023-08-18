import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UserService } from '../../api/user.service';
import { SharedDataService } from '../../api/shared-data.service';

@Component({
  selector: 'app-trip-list-modal',
  templateUrl: 'trip-list-modal.component.html',
  styleUrls: ['trip-list-modal.component.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true,
  entryComponents: [TripListModalComponent]
})
export class TripListModalComponent {
  @Input() trips: any[] | undefined; 
  @Output() labelSelected = new EventEmitter<string>();
  data: any;
  result: any;
  addresses: any[] = [];

  constructor(private modalController: ModalController, private userService: UserService, private sharedDataService: SharedDataService) {
    this.userService.selected.subscribe((response: any) => {
      this.data = response;
      console.log('selected data for html', this.data);
    });
    this.result = this.sharedDataService.tripDataDate;
    console.log('result',this.result);
  }

  ngOnInit() {
    if (this.trips) {
      this.trips.forEach((trip, index) => {
        const lastStep = trip.steps[trip.steps.length - 1];
        const latitude = lastStep.latitude;
        const longitude = lastStep.longitude;
        this.getAddressForTrip(latitude, longitude, index);
      });
    }
  }

  // getAddressForTrip(latitude: any, longitude: any, index: number) {
  //   this.userService.reverseGeocode(latitude, longitude).subscribe((address: any) => {
  //     this.addresses[index] = address.features[0].properties;
  //     console.log('Adresse pour le trip', index, ':', this.addresses[index]);
  //   });
  // }

  getAddressForTrip(latitude: any, longitude: any, index: number) {
    this.userService.reverseGeocode(latitude, longitude).subscribe((address: any) => {
        this.addresses[index] = address.features[0].properties;

        let house_number = this.addresses[index].address.house_number ? this.addresses[index].address.house_number : '';
        let road = this.addresses[index].address.road ? this.addresses[index].address.road : '';
        let postal_code = this.addresses[index].address.postal_code ? this.addresses[index].address.postal_code : '';
        let town = this.addresses[index].address.town ? this.addresses[index].address.town : '';

        this.addresses[index] = {
          street: `${house_number} ${road}`.trim(),
          city: `${postal_code} ${town}`.trim()
      };

        console.log('Adresse pour le trip', index, ':', this.addresses[index]);
    });
  }
  
  closeModal() {
    this.modalController.dismiss();
  }

  selectItem(label: string) {
    this.labelSelected.emit(label); 
    this.modalController.dismiss();   
  }

  centerMapOnLabel(trip: any) {
    this.modalController.dismiss(trip.address.features[0].properties.display_name);
  }
}

