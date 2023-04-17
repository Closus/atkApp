import { Component } from '@angular/core';
import { IonicModule, MenuController, ModalController } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, FontAwesomeModule],
})
export class HomePage {
  map: L.Map | undefined;

  constructor(private menu: MenuController, public modalController: ModalController) {}

  ionViewDidEnter() {
    this.map = L.map('mapId').setView([50.4046, 4.3588], 9), {attributionControl: false};
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    const markPoint = L.marker([50.44640, 4.53769]);
    markPoint.bindPopup('<p>DSC Security</p>');
    this.map.addLayer(markPoint);
  }

  openSideMenu() {
    this.menu.enable(true, 'myMenu');
    this.menu.open('myMenu');
  }

  closeSideMenu() {
    this.menu.close('myMenu');
  }
}


