import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UserService } from 'src/app/api/user.service';
import { HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-balise',
  templateUrl: './balise.component.html',
  styleUrls: ['./balise.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class BaliseComponent  implements OnInit {
  reverseGeocodedAddresses: any;
  trackerDetails: any;
  selectedType: string = 'vehicule';
  filtered : any;
  constructor(private modalController: ModalController, public userService: UserService) {}

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/x-www-form-urlencoded'
    })
  }

  ngOnInit() {
    this.userService.trackers.subscribe((trackers: any) => {
      this.trackerDetails = trackers;
      this.getFilteredTrackers();
    });
  }

  closeModal() {
    this.modalController.dismiss(null);
  }

  handleEvent(event: Event) {
    const customEvent = event as CustomEvent;
    this.selectedType = customEvent.detail.value;
    this.getFilteredTrackers();

  }

  getFilteredTrackers() {
    console.log('new',this.selectedType);
    switch (this.selectedType) {
        case 'vehicule':
            this.userService.trackerType.next('logoMarker');
            this.filtered = this.trackerDetails.trackers.filter((tracker: { info: { position: any; }; }) => tracker.info && tracker.info.position);
            break;
        case 'Batiments':
            this.userService.trackerType.next('marker4');
            this.filtered = this.trackerDetails.trackers.filter((tracker: { pictureUrl: string; }) => tracker.pictureUrl === 'http://geo.autotracking.eu/show?id=400');
            break;
        case 'Autres':
            this.userService.trackerType.next('test');
            this.filtered = this.trackerDetails.trackers.filter((tracker: { pictureUrl: string; }) => tracker.pictureUrl === 'http://geo.autotracking.eu/pics/buggy38.png');
            break;
        default:
            this.userService.trackerType.next('logoMarker');
            this.filtered = this.trackerDetails.trackers;
    }
  }

  selectItem(item: any) {
    this.modalController.dismiss(item);
  }
}
