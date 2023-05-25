import { Component, AfterViewInit } from '@angular/core';
import { IonicModule, MenuController, ModalController, NavController } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { UserService } from '../api/user.service';
import * as L from 'leaflet';
import { first, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BaliseComponent } from '../modals/choice/select/balise/balise.component';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, FontAwesomeModule],
})
export class HomePage implements AfterViewInit {
  map: L.Map | undefined;
  email: string | undefined;
  name: string | undefined;
  mobile: string | undefined;


  constructor(private menu: MenuController, 
              public modalController: ModalController, 
              private userService: UserService, 
              private navController: NavController
              ) {}

  ngOnInit() {
    
  }
  
  ngAfterViewInit(): void {
    if (this.userService.userDetails) {
      this.email = this.userService.userDetails.email;
      this.name = this.userService.userDetails.name;
      this.mobile = this.userService.userDetails.mobile;

      // Appel API initial
      this.userService.getPositions().pipe(first()).subscribe((response: any) => {
        this.userService.positions = response.trackinglist;
        this.map = L.map('mapId').setView([50.4046, 4.3588], 9), {attributionControl: false};
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
        console.log(this.userService.positions);

        if (this.userService.positions && this.userService.positions.length > 0) {
          console.log("fdp");
          this.userService.positions.forEach((data: any) => {
            console.log(data);
            if (data.position) {
                const markPoint = L.marker([data.position.latitude, data.position.longitude]);
                markPoint.bindPopup(`<p>${data.imei}</p>`);
                this.map?.addLayer(markPoint);
          }
        });
        // Appel API toutes les 60 secondes
        interval(60000).pipe(switchMap(() => this.userService.getPositions())).subscribe((response: any) => {
          this.userService.positions = response.trackinglist;
          this.updateMapMarkers();
        });
      }  
        console.log(response.trackinglist);
      })
      } else {
        this.navController.navigateRoot('login');
      }
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

  updateMapMarkers(): void {
    // Effacer tous les marqueurs existants sur la carte
    this.map?.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map?.removeLayer(layer);
      }
    });
  
    // Ajouter les nouveaux marqueurs à la carte
    if (this.userService.positions && this.userService.positions.length > 0) {
      this.userService.positions.forEach((data: any) => {
        if (data.position) {
          const markPoint = L.marker([data.position.latitude, data.position.longitude]);
          markPoint.bindPopup(`<p>${data.imei}</p>`);
          this.map?.addLayer(markPoint);
        }
      });
    }
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: BaliseComponent
    });
    return await modal.present();
  }
}


