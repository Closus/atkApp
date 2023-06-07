import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';


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

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }
}

