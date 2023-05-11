import { Component } from '@angular/core';
import { IonicModule, MenuController, ModalController, NavController } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { UserService } from '../api/user.service';
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
  email: string | undefined;
  name: string | undefined;
  mobile: string | undefined;

  constructor(private menu: MenuController, public modalController: ModalController, private userService: UserService, private navController: NavController) {}

  ngOnInit() {
    if (this.userService.userDetails) {
      this.email = this.userService.userDetails.email;
      this.name = this.userService.userDetails.name;
      this.mobile = this.userService.userDetails.mobile;
    } else {
      this.navController.navigateRoot('login');
    }
  }

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

  disconnect() {
    this.navController.navigateRoot('login');
  }
}


