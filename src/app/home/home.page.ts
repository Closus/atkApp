import { Component, AfterViewInit } from '@angular/core';
import { IonicModule, MenuController, ModalController, NavController } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { UserService } from '../api/user.service';
import * as L from 'leaflet';
import { first, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BaliseComponent } from '../modals/choice/select/balise/balise.component';
import { forkJoin } from 'rxjs';


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
      const listTrackers$ = this.userService.getAPI('listtrackers').pipe(first());
      const positions$ = this.userService.getAPI('getpositions').pipe(first());
  
      forkJoin([listTrackers$, positions$]).subscribe(([listTrackersResponse, positionsResponse]: any[]) => {
        const listTrackers = listTrackersResponse.trackers;
        const positions = positionsResponse.trackinglist;
        
        console.log('listtrackers = ', listTrackers);
        console.log('positions = ', positions);
      
        // Vérifiez si les données des appels API existent
        if (listTrackers.length > 0 && positions.length > 0) {
          // Réinitialisez la variable combinedData
          this.userService.combinedData = [];
      
          // Parcourez les listes de trackers et de positions
          listTrackers.forEach((tracker: any) => {
            const matchingPosition = positions.find((position: any) => position.imei === tracker.imei);
            if (matchingPosition) {
              // Combinez les données en ajoutant les propriétés nécessaires
              const combinedItem = {
                imei: tracker.imei,
                trackerData: tracker,
                positionData: matchingPosition
              };
      
              // Ajoutez l'élément combiné à la variable combinedData
              this.userService.combinedData.push(combinedItem);
            }
          });
      
          console.log('combinedData = ', this.userService.combinedData);
      
          this.map = L.map('mapId').setView([50.4046, 4.3588], 9), { attributionControl: false };
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      
          // Ajoutez les marqueurs à la carte pour chaque élément dans combinedData
          this.userService.combinedData.forEach((data: any) => {
            if (data.positionData.position) {
              const markPoint = L.marker([data.positionData.position.latitude, data.positionData.position.longitude]);
              markPoint.bindPopup(`<p>${data.imei}</p>`);
              this.map?.addLayer(markPoint);
            }
          });
      
          // Appel API toutes les 60 secondes
          interval(60000)
            .pipe(switchMap(() => this.userService.getAPI('getpositions')))
            .subscribe((response: any) => {
              this.userService.positions = response.trackinglist;
              this.updateMapMarkers();
            });
        } else {
          this.navController.navigateRoot('login');
        }
      });
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


