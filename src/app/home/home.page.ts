import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { IonicModule, MenuController, ModalController, NavController } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { UserService } from '../api/user.service';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { TripListModalComponent } from '../modals/trip-list-modal/trip-list-modal.component';
import { BaliseComponent } from '../modals/choice/select/balise/balise.component';
import { Subscription, first } from 'rxjs';
import { CalendarModal, CalendarModalOptions, CalendarResult, CalendarModule } from 'ion2-calendar';
import { SharedDataService } from '../api/shared-data.service';
import 'leaflet.markercluster';

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
  stoppedIcon = L.icon({
    iconUrl: '../../assets/images/LogoStop.png',
    iconSize: [100, 100],
    iconAnchor: [50, 50],
    className: 'rotate-icon'
  });
  selectedTripSubscription: Subscription | undefined;
  showButton: boolean = false;
  showClustersAndMarkers: boolean = false;

  constructor(private menu: MenuController, public modalController: ModalController, private userService: UserService, private navController: NavController, private sharedDataService: SharedDataService) {
    this.userService.trackerType.subscribe((trackerType: any) => {
      console.log(trackerType);
      if (trackerType === 'logoMarker') {
        this.Icon = L.icon({
          iconUrl: '../../assets/images/'+trackerType+'.png',
          iconSize: [100, 100],
          iconAnchor: [50, 50],
          className: 'rotate-icon'
        });
      } else {
        this.Icon = L.icon({
          iconUrl: '../../assets/images/'+trackerType+'.png',
          iconSize: [50, 50],
          iconAnchor: [25, 50]
        });
      }
      this.selectedTripSubscription = this.sharedDataService.selectedTrip$.subscribe(
        (trip) => {
          if (trip) {
            this.centerOnTrip(trip);
          }
        }
      );
    })
  }

  centerOnTrip(trip: any): void {
    const lat = parseFloat(trip.steps[0].latitude);
    const lon = parseFloat(trip.steps[0].longitude);
    console.log(lat, lon);
    this.updateSelectedMarker(lat, lon);
    if (this.map) {
        this.map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            if (this.map) {
              this.map.removeLayer(layer);
            }
          }
        });
    }
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
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
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
          
      // Créez un nouveau marqueur avec les nouvelles coordonnées
      marker.bindPopup(`
        <div class="custom-popup" style="background: black;">
          <h5 style="text-align: center;border-bottom: 1px solid #EC851E;padding-bottom: 2px;">${new Date().toLocaleString()}</h5>
          <p style="text-align: center;">${this.selected.address.road ?? ''} ${this.selected.address.house_number ?? ''}, ${this.selected.address.postcode ?? ''} ${this.selected.address.town ?? ''}</p>
          <table style="width: 100%;">
            <tr>
              <th style="color: #EC851E;">Durée Trajet:</th>
              <th style="color: #EC851E;">Vitesse:</th>
            </tr>
            <tr>
              <td></td>
              <td>${this.selected.info.position.speed} km/h</td>
            </tr>
            <tr>
              <th style="color: #EC851E;">Distance Trajet:</td>
              <th style="color: #EC851E;">Altitude:</td>
            </tr>
            <tr>
              <td> km</td>
              <td>${this.selected.info.position.altitude} m</td>
            </tr>
          </table>
        </div>`
      );

      // Check if the vehicle speed is 0.0
      if (speed && speed === '0.0') {
        console.log('iciiiiiiii', speed); 
        // !!! VENIR DIRE QU IL CHANGE DE TYPE 
        marker.setIcon(this.stoppedIcon);
      } else if (speed) {
        this.createRotatedImage('../../assets/images/logoMarker.png', this.selected.info.position.heading, function(rotatedImgSrc: any) {
          const rotatedIcon = L.icon({
              iconUrl: rotatedImgSrc,
              iconSize: [100, 100],
              iconAnchor: [50, 50]
          });
          marker.setIcon(rotatedIcon);
      });
      } else {
        marker.setIcon(this.Icon);
      }

      // Add the marker to the map
      if (this.map) {
        marker.addTo(this.map);
      }
    }
  }

  createRotatedImage(src: any, rotationDegrees: any, callback: any) {
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Ajustez les dimensions du canvas si nécessaire
        canvas.width = img.width;
        canvas.height = img.height;

        // Effectuez la rotation
        ctx?.translate(canvas.width / 2, canvas.height / 2);
        ctx?.rotate(rotationDegrees * Math.PI / 180);
        ctx?.drawImage(img, -img.width / 2, -img.height / 2);

        // Récupérez l'image tournée
        const rotatedImgSrc = canvas.toDataURL('image/png');

        callback(rotatedImgSrc);
    };
    img.src = src;
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: BaliseComponent
    });
    this.clearMarkersAndClusters();
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
      
      if (this.map && !this.showClustersAndMarkers) {
        // Supprimez tous les marqueurs existants de la carte
        this.map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            this.map?.removeLayer(layer);
          }
        });
      }
    }
    else {
      console.log('fdp', this.selected)
      this.updateSelectedMarker(this.selected.info.position.latitude, this.selected.info.position.longitude, this.selected.info.position.speed);
    }
    // Ajoutez cet événement de clic pour les marqueurs individuels dans le cluster
    if (this.showClustersAndMarkers && this.map) {
      this.map.eachLayer((layer) => {
        if (layer instanceof L.MarkerClusterGroup) {
          layer.on('clusterclick', (cluster) => {
            cluster.layer.getAllChildMarkers().forEach((marker: any) => {
              marker.on('click', () => {
                marker.openPopup();
              });
            });
          });
        }
      });
    }
  }

  launchNavigation(): void {
    const selectedPosition = this.userService.selected.value.info.position;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPosition.latitude},${selectedPosition.longitude}`;
    window.open(url, '_blank');
  }  

  async openCalendar() {
    this.clearMap();
    const options: CalendarModalOptions = {
      color: 'dark', // Couleur du calendrier (noir),
      title: 'Sélectionnez une date', // Titre du calendrier
      canBackwardsSelected: true, // Autorise la sélection de dates antérieures,
      weekStart: 1,
      weekdays: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
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
  //   this.clearMap();
  //   this.isTripSelected = true;
  //   console.log(this.selected.id);
  //   console.log(this.numberDate);
  //   console.log(this.userDetails.user.uuid);
  //   if (this.numberDate) {
  //     this.userService.getTripByDate('gettrip', this.selected.id, this.numberDate, this.userDetails.user.uuid).subscribe((data: any) => {
  //       this.sharedDataService.setTripDataDate(data.tracking);
  //       console.log(data.tracking, 'on est ici ou kwéééééé');
  //       const tripCoordinates: L.LatLng[][] = [];
  //       console.log('data du trip par jour = 1', this.sharedDataService.tripDataDate);
  
  //       if (this.sharedDataService.tripDataDate && this.sharedDataService.tripDataDate.trips && this.sharedDataService.tripDataDate.trips.length > 0) {
  //         this.sharedDataService.tripDataDate.trips.forEach((trip: any, index: any) => {
  //           const tripSteps: L.LatLng[] = trip.steps.map((step: any) => L.latLng(parseFloat(step.latitude), parseFloat(step.longitude)));
  //           tripCoordinates.push(tripSteps);
  
  //           if (this.map) {
  //             const speed = parseFloat(trip.avgspeed).toFixed(2);
  //             const distance = parseFloat(trip.distance).toFixed(2);
  //             const duration = trip.duration;
  //             const altitude = trip.maxspeed; // ou toute autre information d'altitude si elle est disponible
  //             // const address = trip.address.features[0].properties; // Modifier selon la structure de l'adresse
  //             const coordinates = tripSteps[0];

  //             //Création d'un marqueur pour ce voyage spécifique
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
  
  //             // Créez le marqueur avec la popup
  //             const marker = L.marker(coordinates);
  //             tripMarker.bindPopup(`
  //               <div class="custom-popup" style="background: black;">
  //                 <h5 style="text-align: center;border-bottom: 1px solid #EC851E;padding-bottom: 2px;">Adresse</h5>
  //                 <p style="text-align: center;">Nom balise</p>
  //                 <table style="width: 100%;">
  //                   <tr>
  //                     <th style="color: #EC851E;">Durée Trajet:</th>
  //                     <th style="color: #EC851E;">Vitesse max:</th>
  //                   </tr>
  //                   <tr>
  //                     <td>${duration}</td>
  //                     <td>${speed} km/h</td>
  //                   </tr>
  //                   <tr>
  //                     <th style="color: #EC851E;">Distance Trajet:</td>
  //                     <th style="color: #EC851E;">Altitude:</td>
  //                   </tr>
  //                   <tr>
  //                     <td>${distance} km</td>
  //                     <td>${altitude} m</td>
  //                   </tr>
  //                 </table>
  //               </div>`
  //             ).addTo(this.map);
  
  //             // Création d'un polyline pour le voyage
  //             const tripPolyline = L.polyline(tripCoordinates[index], { color: 'red' }).addTo(this.map);
  //           }
  //         });

  //         console.log('data du trip par jour = ', this.sharedDataService.tripDataDate);
  
  //         // Création d'un objet bounds utilisant toutes les coordonnées du voyage
  //         const bounds = L.latLngBounds(tripCoordinates.reduce((acc, val) => acc.concat(val), []));
  
  //         // Ajustement de la vue de la carte pour s'adapter aux limites
  //         if (this.map) {
  //           this.map.fitBounds(bounds);
  //         }
  //       }
  //     });
  //   }
  // }


selectedDateTrip() {
    this.clearMap();
    this.isTripSelected = true;
    this.showClustersAndMarkers = true;
    console.log(this.selected.id);
    console.log(this.numberDate);
    console.log(this.userDetails.user.uuid);

    if (this.numberDate) {
      if (this.showClustersAndMarkers) {
        this.userService.getTripByDate('gettrip', this.selected.id, this.numberDate, this.userDetails.user.uuid).subscribe((data: any) => {
            this.sharedDataService.setTripDataDate(data.tracking);

            const tripCoordinates: L.LatLng[][] = [];
            const markersCluster = L.markerClusterGroup();  // Création du groupe de clusters

            if (this.sharedDataService.tripDataDate && this.sharedDataService.tripDataDate.trips && this.sharedDataService.tripDataDate.trips.length > 0) {
                this.sharedDataService.tripDataDate.trips.forEach((trip: any, index: any) => {
                    const tripSteps: L.LatLng[] = trip.steps.map((step: any) => L.latLng(parseFloat(step.latitude), parseFloat(step.longitude)));
                    tripCoordinates.push(tripSteps);

                    if (this.map) {
                        const speed = parseFloat(trip.avgspeed).toFixed(2);
                        const distance = parseFloat(trip.distance).toFixed(2);
                        const duration = trip.duration;
                        const altitude = trip.maxspeed;
                        const coordinates = tripSteps[0];

                        const tripMarker = L.circleMarker(tripSteps[0], {
                            radius: 15,
                            color: 'black',
                            fillColor: 'white',
                            fillOpacity: 1,
                            weight: 2
                        });

                        tripMarker.bindTooltip(`<span style="font-size: 16px; font-weight: bold;">${index + 1}</span>`, {
                            permanent: true,
                            direction: 'center',
                            className: 'step-marker-tooltip',
                            opacity: 1
                        });

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
                        );

                        markersCluster.addLayer(tripMarker);  // Ajout du marker au groupe de clusters

                        const tripPolyline = L.polyline(tripCoordinates[index], { color: 'red' }).addTo(this.map);
                    }
                });

                if (this.map) {

                  this.map.addLayer(markersCluster);  // Ajout du groupe de clusters à la carte

                  const bounds = L.latLngBounds(tripCoordinates.reduce((acc, val) => acc.concat(val), []));
                  this.map.fitBounds(bounds);
                }
            }
        });
      }
    }
  }

  async openTripListModal() {
    this.showButton = true;
    const modal = await this.modalController.create({
      component: TripListModalComponent,
      componentProps: {
        trips: this.sharedDataService.tripDataDate.trips
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result && result.data) {
        this.onLabelSelected(result.data);
        console.log(result.data);
      }
      this.showButton = false;
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
        if(this.map) {
          const tripPolyline = L.polyline(selectedTrip.steps.map((step: any) => L.latLng(parseFloat(step.latitude), parseFloat(step.longitude))), { color: 'red' }).addTo(this.map);
        }
      }
    }
  }
  
  clearMap() {
    if (this.map) {
      this.map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker ||  layer instanceof L.CircleMarker) {
          this.map?.removeLayer(layer);
        }
      });
    }
    this.isTripSelected = false;
  }

  clearMarkersAndClusters(): void {
    if (this.map) {
      this.map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.MarkerClusterGroup || layer instanceof L.CircleMarker || layer instanceof L.Polyline) {
          this.map?.removeLayer(layer);
        }
      });
    }
  }
}