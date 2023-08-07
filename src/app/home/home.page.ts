import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { IonicModule, MenuController, ModalController, NavController } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { UserService } from '../api/user.service';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { first, interval } from 'rxjs';
import { TripListModalComponent } from '../modals/trip-list-modal/trip-list-modal.component';
import { BaliseComponent } from '../modals/choice/select/balise/balise.component';
import { forkJoin } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { CalendarModal, CalendarModalOptions, CalendarResult, CalendarModule } from 'ion2-calendar';


@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: true,
    imports: [IonicModule, FontAwesomeModule, CalendarModule, CommonModule, TripListModalComponent]
})

export class HomePage implements AfterViewInit {
  @ViewChild(BaliseComponent) baliseComponent!: BaliseComponent; // Access the BaliseComponent instance
  map: L.Map | undefined;
  email: string | undefined;
  name: string | undefined;
  mobile: string | undefined;
  selectedItem = new BehaviorSubject<any>(null);
  pageTitle: string = 'Accueil';  
  selectedDate: string | undefined;
  numberDate: string | undefined;
  selectedTracker: any = null;
  markers: L.Marker[] = [];
  tripData: any;
  tripDataDate : any;
  addressData: any = {};
  previousCoordinates: L.LatLng | null = null;
  customIcon = L.icon({
    iconUrl: '../../assets/images/logoMarker.png',
    iconSize: [80, 80],
    iconAnchor: [10, 80],
    className: 'rotate-icon'
  });
  finishIcon = L.icon({
    iconUrl: '../../assets/images/finish.png',
    iconSize: [35, 35]
  });
  isTripSelected: boolean = false;

  constructor(private menu: MenuController, 
              public modalController: ModalController, 
              private userService: UserService, 
              private navController: NavController,
              ) {}

  ngOnInit() {
    this.menu.swipeGesture(false);
  // Vérifier si un élément est sélectionné
  this.selectedItem.subscribe((selected: any) => {
    console.log('SELECTED', selected);
    if (selected) {
      this.pageTitle = selected.trackerData.name;
      this.centerMap();
      this.updateSelectedMarker(selected);
    } else {
      this.pageTitle = 'Accueil';
    }
    });
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

          this.map.on('zoomstart', () => {
            if (this.map) {
              // Ajoutez la classe 'no-transition' à l'élément du marqueur
              const coordinates: L.LatLngTuple = [this.selectedItem.value.positionData.position.latitude, this.selectedItem.value.positionData.position.longitude];
              const marker = L.marker(coordinates).addTo(this.map);
              const markerElement = marker.getElement();
              if (markerElement) {
                markerElement.classList.add('no-transition');
              }
            }
          });
          this.map.on('zoomend', () => {
            if (this.map) {
              // Réinitialisez la rotation de l'icône du marqueur
              const heading = this.selectedItem.value.positionData.position.heading;
              const coordinates: L.LatLngTuple = [this.selectedItem.value.positionData.position.latitude, this.selectedItem.value.positionData.position.longitude];
              const marker = L.marker(coordinates).addTo(this.map);
              const markerElement = marker.getElement();
              if (markerElement) {
                markerElement.style.transition = 'none';
                markerElement.style.transform = `rotate(${heading}deg)`;
                // Supprimez la classe 'no-transition' de l'élément du marqueur
                markerElement.classList.remove('no-transition');
              }
              // Mettez à jour la carte
              this.updateMap();
            }
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
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('savedPassword');
    this.navController.navigateRoot('login');
  }

  // updateSelectedMarker(): void {
  //   const selected = this.selectedItem.getValue();
  
  //   if (selected && selected.positionData.position) {
  //     const customIcon = L.icon({
  //       iconUrl: '../../assets/images/logoMarker.png',
  //       iconSize: [80, 80],
  //       iconAnchor: [40, 80],
  //       className: 'rotate-icon'
  //     });
  
  //     const coordinates = L.latLng(selected.positionData.position.latitude, selected.positionData.position.longitude);
  
  //     // Vérifiez si les coordonnées ont changé
  //     if (!this.previousCoordinates || !this.previousCoordinates.equals(coordinates)) {
  //       // Supprimer tous les marqueurs existants de la carte
  //       this.map?.eachLayer((layer) => {
  //         if (layer instanceof L.Marker) {
  //           this.map?.removeLayer(layer);
  //         }
  //       });
  
  //       // Créez un nouveau marqueur avec les nouvelles coordonnées
  //       const marker = L.marker(coordinates, { icon: customIcon });
  //       marker.bindPopup(`<p>${selected.trackerData.name}</p>`);
  //       this.map?.addLayer(marker);
  
  //       // Faire pivoter le marqueur en fonction de l'attribut "heading"
  //       const heading = selected.positionData.position.heading;
  //       const markerElement = marker.getElement();
  //       if (markerElement) {
  //         markerElement.style.transform += `rotate(${heading}deg)`;
  //       }
  
  //       // Mettez à jour les coordonnées précédentes
  //       this.previousCoordinates = coordinates;
  //     }
  //   }
  // }

  updateMap(): void {
    // Vérifiez si un élément est sélectionné
    this.selectedItem.subscribe((selected: any) => {
      if (selected) {
        // Mettre à jour le titre de la page
        this.pageTitle = selected.trackerData.name;
  
        // Mettre à jour le marqueur
        this.updateSelectedMarker(selected);
  
      } else {
        this.pageTitle = 'Accueil';
      }
    });
  }
  
  updateSelectedMarker(selected: any): void {
    // Supprimer tous les marqueurs existants de la carte
    this.map?.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map?.removeLayer(layer);
      }
    });
  
    if (selected && selected.positionData.position) {
      let customIcon;

      if (selected.positionData.position.heading === '0.0') {
      // Utilisez un autre marqueur si le heading est égal à 0.0
      customIcon = L.icon({
        iconUrl: '../../assets/images/Logo Stop.png', // Remplacez par l'URL de votre autre marqueur
        iconSize: [100, 100],
        iconAnchor: [10, 80],
      });
    } else {
      customIcon = L.icon({
        iconUrl: '../../assets/images/logoMarker.png',
        iconSize: [80, 80],
        iconAnchor: [10, 80],
        className: 'rotate-icon' // Ajoutez une classe pour la rotation
      });
    }
  
      const coordinates = L.latLng(selected.positionData.position.latitude, selected.positionData.position.longitude);
  
      // Créez un nouveau marqueur avec les nouvelles coordonnées
      const marker = L.marker(coordinates, { icon: customIcon });
      marker.bindPopup(`<p>${selected.trackerData.name}</p>`);
      this.map?.addLayer(marker);
  
      // Faire pivoter le marqueur en fonction de l'attribut "heading"
      const heading = selected.positionData.position.heading;
      const markerElement = marker.getElement();
      if (markerElement) {
        markerElement.style.transformOrigin = 'center bottom';
        markerElement.style.transform += `rotate(${heading}deg)`;
      }
    }
  }
  
  
  async presentModal() {
    const modal = await this.modalController.create({
      component: BaliseComponent
    });
    this.clearMap();
    modal.onDidDismiss().then((data) => {
      this.selectedItem.next(data.data);
      this.selectedTracker = data.data;
  
      // Ajouter la condition pour vérifier si la date sélectionnée est antérieure à la date actuelle
      if (!this.numberDate || new Date(this.numberDate) < new Date()) {
        const currentDate = new Date();
        const day = currentDate.getDate().toString().padStart(2, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear().toString();
        this.numberDate = year + month + day;
      }
    });
    return await modal.present();
  }

  centerMap(): void {
    if (this.selectedItem.value && this.selectedItem.value.positionData.position) {
      const selectedPosition = this.selectedItem.value.positionData.position;
      this.map?.setView([selectedPosition.latitude, selectedPosition.longitude], 17, { animate: true });
      
      if (this.map) {
        // Supprimez tous les marqueurs existants de la carte
        this.map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            this.map?.removeLayer(layer);
          }
        });

        // Ajoutez le marqueur avec la bonne position de heading
        const heading = this.selectedItem.value.positionData.position.heading;
        const coordinates: L.LatLngTuple = [selectedPosition.latitude, selectedPosition.longitude];
        const marker = L.marker(coordinates, { icon: this.customIcon }).addTo(this.map);
        const markerElement = marker.getElement();
        if (markerElement) {
          markerElement.style.transformOrigin = 'center bottom';
          markerElement.style.transform += `rotate(${heading}deg)`;
        }
      }
    }
  }

  launchNavigation(): void {
    const selectedPosition = this.selectedItem.value.positionData.position;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPosition.latitude},${selectedPosition.longitude}`;
    window.open(url, '_blank');
  }  

  async openCalendar() {
    this.clearMap();
    const options: CalendarModalOptions = {
      color: 'dark', // Couleur du calendrier (noir),
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
      this.tripData = data;
    });
  }

  // selectedDateTrip() {
  //   if (this.numberDate) {
  //     this.userService.getTripByDate('gettrip', this.selectedItem.value.trackerData.id, this.numberDate).subscribe((data: any) => {
  //       this.tripDataDate = data;
  
  //       if (this.tripDataDate && this.tripDataDate.tracking && this.tripDataDate.tracking.trips && this.tripDataDate.tracking.trips.length > 0) {
  //         const tripCoordinates: L.LatLng[][] = [];
  //         let stepNumber = 1; // Compteur de numéro d'étape
  
  //         this.tripDataDate.tracking.trips.forEach((trip: any, index :any) => {
  //           const tripSteps: L.LatLng[] = [];
  //           this.userService.reverseGeocode(trip.steps[0].latitude, trip.steps[0].longitude).pipe(first()).subscribe((address: any = {}) => {
  //             if (this.addressData) {
  //               this.tripDataDate.tracking.trips[index].address = address;
  //             }
  //           })
  //           trip.steps.forEach((step: any) => {
  //             const latitude = parseFloat(step.latitude);
  //             const longitude = parseFloat(step.longitude);
          
  //             if (!isNaN(latitude) && !isNaN(longitude)) {
  //               const coordinate = L.latLng(latitude, longitude);
  //               tripSteps.push(coordinate);
  //             }
  //           }); 
  //           if (tripSteps.length > 0) {
  //             tripCoordinates.push(tripSteps);
          
  //             if (this.map) {
  //               const stepMarker = L.circleMarker(tripSteps[0], {
  //                 radius: 10, // Adjust the radius as needed
  //                 color: 'red', // Adjust the color as needed
  //                 fillColor: 'red', // Adjust the fill color as needed
  //                 fillOpacity: 1, // Adjust the fill opacity as needed
  //               }).addTo(this.map);

  //               stepMarker.bindTooltip(`${stepNumber}`, {
  //               permanent: true,
  //               direction: 'center',
  //               className: 'step-marker-tooltip', // Ajoutez une classe CSS personnalisée pour le style
  //               opacity: 0.3
  //               });


  //               stepMarker.bindPopup(`Étape ${stepNumber}`);
  //               stepNumber++;
  //               const tripPolyline = L.polyline(tripCoordinates, { color: 'red' }).addTo(this.map);
  //             }
  //           }
  //         });
  //         console.log('data du trip par jour = ', this.tripDataDate);
  //         this.map?.setView(tripCoordinates[0][0], 12, { animate: true });
  //       }
  //     });
  //   }
  // }

  selectedDateTrip() {
    this.isTripSelected = true;
    if (this.numberDate) {
      this.userService.getTripByDate('gettrip', this.selectedItem.value.trackerData.id, this.numberDate).subscribe((data: any) => {
        this.tripDataDate = data;
  
        if (this.tripDataDate && this.tripDataDate.tracking && this.tripDataDate.tracking.trips && this.tripDataDate.tracking.trips.length > 0) {
          const tripCoordinates: L.LatLng[][] = [];
          let stepNumber = 1; // Compteur de numéro d'étape
  
          this.tripDataDate.tracking.trips.forEach((trip: any, index :any) => {
            const tripSteps: L.LatLng[] = [];
            this.userService.reverseGeocode(trip.steps[0].latitude, trip.steps[0].longitude).pipe(first()).subscribe((address: any = {}) => {
              if (this.addressData) {
                this.tripDataDate.tracking.trips[index].address = address;
              }
            })
            trip.steps.forEach((step: any) => {
              const latitude = parseFloat(step.latitude);
              const longitude = parseFloat(step.longitude);
          
              if (!isNaN(latitude) && !isNaN(longitude)) {
                const coordinate = L.latLng(latitude, longitude);
                tripSteps.push(coordinate);
              }
            }); 
  
            if (tripSteps.length > 0) {
              tripCoordinates.push(tripSteps);
  
              if (this.map) {
                const stepMarker = L.circleMarker(tripSteps[0], {
                  radius: 10, // Adjust the radius as needed
                  color: 'black', // Adjust the color as needed
                  fillColor: 'white', // Adjust the fill color as needed
                  fillOpacity: 1, // Adjust the fill opacity as needed
                }).addTo(this.map);

                stepMarker.bindTooltip(`${stepNumber}`, {
                permanent: true,
                direction: 'center',
                className: 'step-marker-tooltip', // Ajoutez une classe CSS personnalisée pour le style
                opacity: 0.3
                });

                stepMarker.bindPopup(`Étape ${stepNumber}`);
                stepNumber++;
  
                const tripPolyline = L.polyline(tripCoordinates, { color: 'red' }).addTo(this.map);
              }
            }
          });
  
          console.log('data du trip par jour = ', this.tripDataDate);
  
          // Create a bounds object using all the coordinates of the trip
          const bounds = L.latLngBounds(tripCoordinates.reduce((acc, val) => acc.concat(val), []));
  
          // Adjust the view of the map to fit the bounds
          this.map?.fitBounds(bounds);
        }
      });
    }
  }

  async openTripListModal() {
    const modal = await this.modalController.create({
      component: TripListModalComponent,
      componentProps: {
        trips: this.tripDataDate.tracking.trips
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result && result.data) {
        this.onLabelSelected(result.data);
        console.log(result.data);
      }
    })
    return await modal.present();
  }

  onLabelSelected(label: string) {
    const selectedTrip = this.tripDataDate.tracking.trips.find((trip: any) => trip.address.features[0].properties.display_name === label);
    console.log('selectedTrip = ', selectedTrip, 'ici')
    if (selectedTrip) {
      const latitude = parseFloat(selectedTrip.steps[0].latitude);
      const longitude = parseFloat(selectedTrip.steps[0].longitude);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        const coordinates = L.latLng(latitude, longitude);
        this.map?.setView(coordinates, 15, { animate: true });
      }
    }
  }
  
  clearMap() {
    if (this.map) {
      this.map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
          this.map?.removeLayer(layer);
        }
      });
    }
    this.isTripSelected = false;
  }
}


