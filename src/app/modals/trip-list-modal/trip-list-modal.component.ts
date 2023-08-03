import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HomePage } from 'src/app/home/home.page';


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

  constructor(private modalController: ModalController) {}

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

