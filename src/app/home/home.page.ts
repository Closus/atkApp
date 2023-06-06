import { Component, AfterViewInit } from '@angular/core';
import { IonicModule, MenuController, ModalController, NavController } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { UserService } from '../api/user.service';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { first, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BaliseComponent } from '../modals/choice/select/balise/balise.component';
import { forkJoin } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { CalendarModal, CalendarModalOptions, CalendarResult, CalendarModule } from 'ion2-calendar';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, FontAwesomeModule, CalendarModule, CommonModule]
})

export class HomePage implements AfterViewInit {
  map: L.Map | undefined;
  email: string | undefined;
  name: string | undefined;
  mobile: string | undefined;
  selectedItem = new BehaviorSubject<any>(null);
  pageTitle: string = 'Accueil';  
  selectedDate: string | undefined;
  numberDate: string | undefined;

  constructor(private menu: MenuController, 
              public modalController: ModalController, 
              private userService: UserService, 
              private navController: NavController,
              private balise : BaliseComponent
              ) {}

  ngOnInit() {
    this.menu.swipeGesture(false);
    let customIcon = L.icon({
      iconUrl: '../../assets/images/test.png',
    
      iconSize:     [25, 25], // size of the icon
    });
    // Vérifier si un élément est sélectionné
    this.selectedItem.subscribe((selected: any) => {
      console.log('SELECTED',selected);
      if (selected) {
        this.pageTitle = selected.trackerData.name;

        if (!selected.marker) {
          const customIcon = L.icon({
            iconUrl: '../../assets/images/test.png',
            iconSize: [25, 25],
          });
    
          selected.marker = L.marker(
            [selected.positionData.position.latitude, selected.positionData.position.longitude],
            { icon: customIcon }
          );
          selected.marker.bindPopup(`<p>${selected.trackerData.name}</p>`);
        }
      } else {
        this.pageTitle = 'Accueil';
      }
      this.updateSelectedMarker();

      // Appel API toutes les 60 secondes
      interval(60000)
      .pipe(switchMap(() => this.userService.getAPI('getpositions')))
      .subscribe((response: any) => {
        this.userService.positions = response.trackinglist;
        console.log('refresh 60 secondes');
        this.updateSelectedMarker();
      });
    })
  }
  
  ngAfterViewInit(): void {
    let customIcon = L.icon({
      iconUrl: '../../assets/images/test.png',
    
      iconSize:     [25, 25], // size of the icon
    });
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
              let combinedItem = {
                imei: tracker.imei,
                trackerData: tracker,
                positionData: matchingPosition,
                address: null
              };

              if (matchingPosition.position) {
                let geocode = this.userService.reverseGeocode(matchingPosition.position.latitude, matchingPosition.position.longitude).pipe(first()).subscribe((response: any) => {
                  combinedItem['address'] = response.features[0].properties.address;
                });
              }              
      
              // Ajoutez l'élément combiné à la variable combinedData
              this.userService.combinedData.push(combinedItem);
            }
          });
      
          console.log('combinedData = ', this.userService.combinedData);
      
          this.map = L.map('mapId').setView([50.4046, 4.3588], 9), { attributionControl: false };
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);          
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

  // updateMapMarkers(): void {
  //   let customIcon = L.icon({
  //     iconUrl: '../../assets/images/test.png',
    
  //     iconSize:     [25, 25], // size of the icon
  //   });
  //   // Effacer tous les marqueurs existants sur la carte
  //   this.map?.eachLayer((layer) => {
  //     if (layer instanceof L.Marker) {
  //       this.map?.removeLayer(layer);
  //     }
  //   });
  
  //   // Ajoutez les marqueurs à la carte pour chaque élément dans combinedData
  //   this.userService.combinedData.forEach((data: any) => {
  //     if ( data.positionData.position) {
  //       const markPoint = L.marker([data.positionData.position.latitude, data.positionData.position.longitude], { icon: customIcon });
  //       markPoint.bindPopup(`<p>${data.trackerData.name}</p>`);
  //       this.map?.addLayer(markPoint);
  //     }
  //   });
  // }

  updateSelectedMarker(): void {
    const selected = this.selectedItem.getValue();
    if (selected && selected.positionData.position && selected.marker) {
      selected.marker.setLatLng([
        selected.positionData.position.latitude,
        selected.positionData.position.longitude,
      ]);
  
      selected.marker.setPopupContent(`<p>${selected.trackerData.name}</p>`);
  
      if (!this.map?.hasLayer(selected.marker)) {
        this.map?.addLayer(selected.marker);
      }
    }
  }  
  
  async presentModal() {
    const modal = await this.modalController.create({
      component: BaliseComponent
    });
    modal.onDidDismiss().then((data) => {
      this.selectedItem.next(data.data);
    })
    return await modal.present();
  }

  centerMap(): void {
    if (this.selectedItem.value && this.selectedItem.value.positionData.position) {
      const selectedPosition = this.selectedItem.value.positionData.position;
      this.map?.setView([selectedPosition.latitude, selectedPosition.longitude], 17, { animate: true });
    }
  }

  launchNavigation(): void {
    const selectedPosition = this.selectedItem.value.positionData.position;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPosition.latitude},${selectedPosition.longitude}`;
    window.open(url, '_blank');
  }  

  async openCalendar() {
    const options: CalendarModalOptions = {
      color: 'dark', // Couleur du calendrier (noir)
      title: 'Sélectionnez une date', // Titre du calendrier
      canBackwardsSelected: true, // Autorise la sélection de dates antérieures
      defaultDate: this.selectedDate ? new Date(this.selectedDate) : new Date() // Date par défaut (la date sélectionnée ou la date actuelle)
    };
    
    const calendarModal = await this.modalController.create({
      component: CalendarModal,
      componentProps: {
        options: options
      }
    });
  
    await calendarModal.present();
  
    const { data } = await calendarModal.onWillDismiss<CalendarResult>();
    if (data && data.date) {
      const selectedDate = data.date + '/' + data.months + '/' + data.years;
      console.log(data, 'datatime');
      this.pageTitle = this.pageTitle + ' - ' + selectedDate.toLocaleString() ;
      if (data.date < 10 || data.months < 10) {
        const day = data.date.toString().padStart(2, '0'); // Ajouter un zéro devant le jour si nécessaire
        const month = data.months.toString().padStart(2, '0'); // Ajouter un zéro devant le mois si nécessaire
        this.numberDate = `${data.years}${month}${day}`;
      } else {
        this.numberDate = selectedDate.split('/').join('');
      }
      console.log(this.numberDate);
    }
  }

  selectedTrip() {
    this.userService.getTripById('gettrip', this.selectedItem.value.trackerData.id).subscribe((data: any) => {
      console.log('data du trip = ', data);
    });
  }

  selectedDateTrip() {
    if (this.numberDate) {
      this.userService.getTripByDate('gettrip', this.selectedItem.value.trackerData.id,this.numberDate).subscribe((data: any) => {
        console.log('data du trip par jour = ', data);
      });
    }
  }
  
  
}


