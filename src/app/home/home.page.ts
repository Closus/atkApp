import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { IonicModule, MenuController, ModalController, NavController } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { UserService } from '../api/user.service';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { TripListModalComponent } from '../modals/trip-list-modal/trip-list-modal.component';
import { BaliseComponent } from '../modals/choice/select/balise/balise.component';
import { BehaviorSubject, first } from 'rxjs';
import { CalendarModal, CalendarModalOptions, CalendarResult, CalendarModule } from 'ion2-calendar';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: true,
    providers: [TripListModalComponent],
    imports: [IonicModule, FontAwesomeModule, CalendarModule, CommonModule, TripListModalComponent]
})

export class HomePage implements AfterViewInit {
  userDetails : any;
  trackerDetails : any;
  map: L.Map | undefined;
  email: string | undefined;
  name: string | undefined;
  mobile: string | undefined;
  selected : any;
  pageTitle: string = 'Accueil';  
  selectedDate: string | undefined;
  numberDate: string | undefined;
  selectedTracker: any = null;
  markers: L.Marker[] = [];
  tripData: any;
  tripDataDate : any;
  addressData: any = {};
  previousCoordinates: L.LatLng | null = null;
  Icon : any;
  isTripSelected: boolean = false;
  currentRotation: number = 0;
  stepNumber: number = 1;
  trips: any;

  constructor(private menu: MenuController, public modalController: ModalController, private userService: UserService, private navController: NavController, public tripListModal: TripListModalComponent, private baliseComponent: BaliseComponent ) {
    this.userService.trackerType.subscribe((trackerType: any) => {
      console.log(trackerType);
      this.Icon = L.icon({
        iconUrl: '../../assets/images/'+trackerType+'.png',
        iconSize: [100, 100],
        iconAnchor: [50, 50],
        className: 'rotate-icon' // Ajoutez une classe pour la rotation
      });
    })
  }

  ngOnInit() {
    this.userService.userDetails.pipe(first()).subscribe((users: any) => {
      this.userDetails = users;
      console.log('userDetails', users)
    })
    this.userService.trackers.subscribe((trackers: any) => {
      this.trackerDetails = trackers;
      console.log('trackers', trackers);
    })
    this.menu.swipeGesture(false);
    // Vérifier si un élément est sélectionné
    this.userService.selected.subscribe((selected: any) => {
      this.selected = selected;
      console.log('SELECTED', selected);
      if (selected) {
        this.pageTitle = selected.name;
        this.centerMap();
      } else {
        this.pageTitle = 'Accueil';
      }
    });
  }

  ngAfterViewInit() {
    if (this.userDetails) {
      this.map = L.map('mapId').setView([50.4046, 4.3588], 9), { attributionControl: false };
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    }
  }
  
  // ngAfterViewInit(): void {
  //   if (this.userDetails) {
  //     //this.email = this.userService.userDetails.email;
  //     //this.name = this.userService.userDetails.name;
  //     //this.mobile = this.userService.userDetails.mobile;
  
  //     // Appel API initial
  //     const listTrackers$ = this.userService.getAPI('listtrackers', this.userDetails.uuid).pipe(first());
  //     const positions$ = this.userService.getAPI('getpositions', this.userDetails.uuid).pipe(first());
  
  //     forkJoin([listTrackers$, positions$]).subscribe(([listTrackersResponse, positionsResponse]: any[]) => {
  //       const listTrackers = listTrackersResponse.trackers;
  //       const positions = positionsResponse.trackinglist;
        
  //       console.log('listtrackers = ', listTrackers);
  //       console.log('positions = ', positions);
      
  //       // Vérifiez si les données des appels API existent
  //       if (listTrackers.length > 0 && positions.length > 0) {
  //         // Réinitialisez la variable combinedData
  //         this.userService.combinedData = [];
      
  //         // Parcourez les listes de trackers et de positions
  //         listTrackers.forEach((tracker: any) => {
  //           const matchingPosition = positions.find((position: any) => position.imei === tracker.imei);
  //           if (matchingPosition) {
  //             let combinedItem = {
  //               imei: tracker.imei,
  //               trackerData: tracker,
  //               positionData: matchingPosition,
  //               address: null
  //             };

  //             if (matchingPosition.position) {
  //               let geocode = this.userService.reverseGeocode(matchingPosition.position.latitude, matchingPosition.position.longitude).pipe(first()).subscribe((response: any) => {
  //                 combinedItem['address'] = response.features[0].properties.address;
  //               });
  //             }              
      
  //             // Ajoutez l'élément combiné à la variable combinedData
  //             this.userService.combinedData.push(combinedItem);
  //           }
  //         });
      
  //         console.log('combinedData = ', this.userService.combinedData);
      
  //         this.map = L.map('mapId').setView([50.4046, 4.3588], 9), { attributionControl: false };
  //         L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

  //       //   this.map.on('zoomstart', () => {
  //       //     if (this.map) {
  //       //       // Ajoutez la classe 'no-transition' à l'élément du marqueur
  //       //       const coordinates: L.LatLngTuple = [this.userService.selected.value.positionData.position.latitude, this.userService.selected.value.positionData.position.longitude];
  //       //       const marker = L.marker(coordinates).addTo(this.map);
  //       //       const markerElement = marker.getElement();
  //       //       if (markerElement) {
  //       //         markerElement.classList.add('no-transition');
  //       //       }
  //       //     }
  //       //   });
  //       //   this.map.on('zoomend', () => {
  //       //     if (this.map) {
  //       //       // Réinitialisez la rotation de l'icône du marqueur
  //       //       const heading = this.userService.selected.value.positionData.position.heading;
  //       //       const coordinates: L.LatLngTuple = [this.userService.selected.value.positionData.position.latitude, this.userService.selected.value.positionData.position.longitude];
  //       //       const marker = L.marker(coordinates).addTo(this.map);
  //       //       const markerElement = marker.getElement();
  //       //       if (markerElement) {
  //       //         markerElement.style.transition = 'none';
  //       //         markerElement.style.transform = `rotate(${this.currentRotation}deg)`;
  //       //         // Supprimez la classe 'no-transition' de l'élément du marqueur
  //       //         markerElement.classList.remove('no-transition');
  //       //       }
  //       //       // Mettez à jour la carte
  //       //       this.updateMap();
  //       //     }
  //       // });     
  //       } else {
  //         this.navController.navigateRoot('login');
  //       }
  //     });
  //   }  
  // }

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
  //   const selected = this.userService.selected.getValue();
  
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
    this.userService.selected.subscribe((selected: any) => {
      if (selected) {
        // Mettre à jour le titre de la page
        this.pageTitle = selected.trackerData.name;
  
        // Mettre à jour le marqueur
        //this.updateSelectedMarker(selected);
  
      } else {
        this.pageTitle = 'Accueil';
      }
    });
  }
  
  // updateSelectedMarker(selected: any): void {
  //   // Supprimer tous les marqueurs existants de la carte
  //   this.map?.eachLayer((layer) => {
  //     if (layer instanceof L.Marker) {
  //       this.map?.removeLayer(layer);
  //     }
  //   });

  //   console.log('selected updateSelectedMarkers', selected);
  
  //   if (selected && selected.info.position) {
  //     let customIcon;

  //     if (selected.info.position.heading === '0.0') {
  //     // Utilisez un autre marqueur si le heading est égal à 0.0
  //     customIcon = L.icon({
  //       iconUrl: '../../assets/images/Logo Stop.png', // Remplacez par l'URL de votre autre marqueur
  //       iconSize: [100, 100],
  //       iconAnchor: [50, 50],
  //       className: 'stopped-icon'
  //     });
  //   } else {
  //     customIcon = L.icon({
  //       iconUrl: '../../assets/images/logoMarker.png',
  //       iconSize: [100, 100],
  //       iconAnchor: [50, 50],
  //       className: 'rotate-icon' // Ajoutez une classe pour la rotation
  //     });
  //   }
  
  //     const coordinates = L.latLng(selected.info.position.latitude, selected.info.position.longitude);
  
  //     // Créez un nouveau marqueur avec les nouvelles coordonnées
  //     const marker = L.marker(coordinates, { icon: customIcon });
  //     marker.bindPopup(`<div class="custom-popup" style="background: black;">
  //                         <h5 style="text-align: center;border-bottom: 1px solid #EC851E;padding-bottom: 2px;">${new Date().toLocaleString()}</h5>
  //                         <p style="text-align: center;">${selected.address.road ?? ''} ${selected.address.house_number ?? ''}, ${selected.address.postcode ?? ''} ${selected.address.town ?? ''}</p>
  //                         <table style="width: 100%;">
  //                           <tr>
  //                             <th style="color: #EC851E;">Durée Trajet:</th>
  //                             <th style="color: #EC851E;">Vitesse:</th>
  //                           </tr>
  //                           <tr>
  //                             <td></td>
  //                             <td>${selected.info.position.speed} km/h</td>
  //                           </tr>
  //                           <tr>
  //                             <th style="color: #EC851E;">Distance Trajet:</td>
  //                             <th style="color: #EC851E;">Altitude:</td>
  //                           </tr>
  //                           <tr>
  //                             <td> km</td>
  //                             <td>${selected.info.position.altitude} m</td>
  //                           </tr>
  //                         </table>
  //                       </div>`
  //                     );

  //     this.map?.addLayer(marker);
  
  //     // Faire pivoter le marqueur en fonction de l'attribut "heading"
  //     const heading = selected.info.position.heading;
  //     const markerElement = marker.getElement();
  //     if (markerElement) {
  //       markerElement.style.transformOrigin = 'center bottom';
  //       markerElement.style.transform += `rotate(${heading}deg)`;
  //       this.currentRotation = heading;
  //     }
  //   }
  // }


  updateSelectedMarker(latitude : any, longitude : any, speed?: any): void {
    this.clearMap();
    console.log('LAAAAAAAA', latitude);

    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    if (!isNaN(latitude) && !isNaN(longitude)) {
      const coordinates = L.latLng(latitude, longitude);

      // Set the view to the selected coordinates
      this.map?.setView(coordinates, 15, { animate: true });

      // Create a marker for the selected coordinates
      const marker = L.marker(coordinates);

      // Check if the vehicle speed is 0.0
      if (speed && speed === '0.0') {
        console.log('iciiiiiiii', speed);
        marker.setIcon(this.Icon);
      } else {
        // !!!!!!!! CHANGER LE TYPE OU VOIR LES DIFFERENCES DE DATA DES TRACKERS POUR IDENTIFIER LES 3
        // Set the appropriate icon based on the selected type
        marker.setIcon(this.Icon);
      }

      // Add the marker to the map
      if (this.map) {
        marker.addTo(this.map);
      }
    }
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: BaliseComponent
    });
    this.clearMap();
    modal.onDidDismiss().then((data) => {
      this.userService.selected.next(data.data);
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
    console.log('putain',this.selected.address);
    if (!this.selected.info.position) {
      this.userService.addressSearch(this.selected.address).pipe(first()).subscribe((response: any) => {
        console.log(response);
        this.updateSelectedMarker(response[0].lat, response[0].lon);
      })
      //const selectedPosition = this.selected.value.info.position;
      //console.log('selectedPosition = ', selectedPosition);
      //this.map?.setView([selectedPosition.latitude, selectedPosition.longitude], 17, { animate: true });
      
      if (this.map) {
        // Supprimez tous les marqueurs existants de la carte
        this.map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            this.map?.removeLayer(layer);
          }
        });

        // Ajoutez le marqueur avec la bonne position de heading
        //const heading = this.userService.selected.value.info.position.heading;
        //const coordinates: L.LatLngTuple = [selectedPosition.latitude, selectedPosition.longitude];
        //const marker = L.marker(coordinates, { icon: this.customIcon }).addTo(this.map);
      }
    }
    else {
      console.log('fdp', this.selected)
      this.updateSelectedMarker(this.selected.info.position.latitude, this.selected.info.position.longitude, this.selected.info.position.speed);
    }
  }

  launchNavigation(): void {
    const selectedPosition = this.userService.selected.value.positionData.position;
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
    this.userService.getTripById('gettrip', this.userService.selected.value.trackerData.id, this.userDetails.uuid).subscribe((data: any) => {
      console.log('data du trip = ', data);
      this.tripData = data;
    });
  }

  // selectedDateTrip() {
  //   this.isTripSelected = true;
  //   if (this.numberDate) {
  //     this.userService.getTripByDate('gettrip', this.userService.selected.value.trackerData.id, this.numberDate).subscribe((data: any) => {
  //       this.tripDataDate = data;
  
  //       if (this.tripDataDate && this.tripDataDate.tracking && this.tripDataDate.tracking.trips && this.tripDataDate.tracking.trips.length > 0) {
  //         const tripCoordinates: L.LatLng[][] = [];
  //         this.stepNumber = 1; // Compteur de numéro d'étape
  
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
  //                 color: 'black', // Adjust the color as needed
  //                 fillColor: 'white', // Adjust the fill color as needed
  //                 fillOpacity: 1, // Adjust the fill opacity as needed
  //               }).addTo(this.map);

  //               stepMarker.bindTooltip(`${this.stepNumber}`, {
  //               permanent: true,
  //               direction: 'center',
  //               className: 'step-marker-tooltip', // Ajoutez une classe CSS personnalisée pour le style
  //               opacity: 0.3
  //               });

  //               stepMarker.bindPopup(`Étape ${this.stepNumber}`);
  //               this.stepNumber++;
  
  //               const tripPolyline = L.polyline(tripCoordinates, { color: 'red' }).addTo(this.map);
  //             }
  //           }
  //         });
  
  //         console.log('data du trip par jour = ', this.tripDataDate);
  
  //         // Create a bounds object using all the coordinates of the trip
  //         const bounds = L.latLngBounds(tripCoordinates.reduce((acc, val) => acc.concat(val), []));
  
  //         // Adjust the view of the map to fit the bounds
  //         this.map?.fitBounds(bounds);
  //       }
  //     });
  //   }
  // }

  // selectedDateTrip() {
  //   this.isTripSelected = true;
  //   if (this.numberDate) {
  //     this.userService.getTripByDate('gettrip', this.userService.selected.value.trackerData.id, this.numberDate).subscribe((data: any) => {
  //       this.tripDataDate = data;
  
  //       if (this.tripDataDate && this.tripDataDate.tracking && this.tripDataDate.tracking.trips && this.tripDataDate.tracking.trips.length > 0) {
  //         const tripCoordinates: L.LatLng[][] = [];
  
  //         this.tripDataDate.tracking.trips.forEach((trip: any, index: any) => {
  //           const tripSteps: L.LatLng[] = [];
  //           this.userService.reverseGeocode(trip.steps[0].latitude, trip.steps[0].longitude).pipe(first()).subscribe((address: any = {}) => {
  //             if (this.addressData) {
  //               this.tripDataDate.tracking.trips[index].address = address;
  //             }
  //           });
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
  //               // Création d'un marqueur pour ce voyage spécifique
  //               const tripMarker = L.circleMarker(tripSteps[0], {
  //                 radius: 15,
  //                 color: 'black',
  //                 fillColor: 'white',
  //                 fillOpacity: 1,
  //                 weight: 2
  //               }).addTo(this.map);
  
  //               // Affichage du numéro du voyage
  //               tripMarker.bindTooltip(`<span style="font-size: 16px; font-weight: bold;">${index + 1}</span>`, {
  //                 permanent: true,
  //                 direction: 'center',
  //                 className: 'step-marker-tooltip',
  //                 opacity: 1
  //               });
  
  //               // Ajout d'un popup si nécessaire
  //               tripMarker.bindPopup(`Voyage ${index + 1}`);
  //             }
  //           }
  //         });
          
  //         if (this.map) {
  //           // Ajout de la ligne du voyage
  //           const tripPolyline = L.polyline(tripCoordinates.reduce((acc, val) => acc.concat(val), []), { color: 'red' }).addTo(this.map);
  //         }
  
  //         console.log('data du trip par jour = ', this.tripDataDate);
  
  //         // Création d'un objet bounds en utilisant toutes les coordonnées du voyage
  //         const bounds = L.latLngBounds(tripCoordinates.reduce((acc, val) => acc.concat(val), []));
          
  //         if (this.map) {
  //           // Ajustement de la vue de la carte pour s'adapter aux limites
  //           this.map?.fitBounds(bounds);
  //         }
  //       }
  //     });
  //   }
  // }

  selectedDateTrip() {
    this.isTripSelected = true;
    if (this.numberDate) {
      this.userService.getTripByDate('gettrip', this.userService.selected.value.trackerData.id, this.numberDate, this.userDetails.uuid).subscribe((data: any) => {
        this.tripDataDate = data;
        const tripCoordinates: L.LatLng[][] = [];
  
        if (this.tripDataDate && this.tripDataDate.tracking && this.tripDataDate.tracking.trips && this.tripDataDate.tracking.trips.length > 0) {
          this.tripDataDate.tracking.trips.forEach((trip: any, index: any) => {
            const tripSteps: L.LatLng[] = trip.steps.map((step: any) => L.latLng(parseFloat(step.latitude), parseFloat(step.longitude)));
            tripCoordinates.push(tripSteps);
  
            if (this.map) {
              const speed = parseFloat(trip.avgspeed).toFixed(2);
              const distance = parseFloat(trip.distance).toFixed(2);
              const duration = trip.duration;
              const altitude = trip.maxspeed; // ou toute autre information d'altitude si elle est disponible
              // const address = trip.address.features[0].properties; // Modifier selon la structure de l'adresse
              const coordinates = tripSteps[0];

              //Création d'un marqueur pour ce voyage spécifique
                const tripMarker = L.circleMarker(tripSteps[0], {
                  radius: 15,
                  color: 'black',
                  fillColor: 'white',
                  fillOpacity: 1,
                  weight: 2
                }).addTo(this.map);
  
                // Affichage du numéro du voyage
                tripMarker.bindTooltip(`<span style="font-size: 16px; font-weight: bold;">${index + 1}</span>`, {
                  permanent: true,
                  direction: 'center',
                  className: 'step-marker-tooltip',
                  opacity: 1
                });
  
              // Créez le marqueur avec la popup
              const marker = L.marker(coordinates);
              tripMarker.bindPopup(`
                <div class="custom-popup" style="background: black;">
                  <h5 style="text-align: center;border-bottom: 1px solid #EC851E;padding-bottom: 2px;">Adresse</h5>
                  <p style="text-align: center;">Nom balise</p>
                  <table style="width: 100%;">
                    <tr>
                      <th style="color: #EC851E;">Durée Trajet:</th>
                      <th style="color: #EC851E;">Vitesse max:</th>
                    </tr>
                    <tr>
                      <td>${duration}</td>
                      <td>${speed} km/h</td>
                    </tr>
                    <tr>
                      <th style="color: #EC851E;">Distance Trajet:</td>
                      <th style="color: #EC851E;">Altitude:</td>
                    </tr>
                    <tr>
                      <td>${distance} km</td>
                      <td>${altitude} m</td>
                    </tr>
                  </table>
                </div>`
              ).addTo(this.map);
  
              // Création d'un polyline pour le voyage
              const tripPolyline = L.polyline(tripCoordinates[index], { color: 'red' }).addTo(this.map);
            }
          });

          console.log('data du trip par jour = ', this.tripDataDate);
  
          // Création d'un objet bounds utilisant toutes les coordonnées du voyage
          const bounds = L.latLngBounds(tripCoordinates.reduce((acc, val) => acc.concat(val), []));
  
          // Ajustement de la vue de la carte pour s'adapter aux limites
          if (this.map) {
            this.map.fitBounds(bounds);
          }
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


