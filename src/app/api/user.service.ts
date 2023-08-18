import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { NavController } from '@ionic/angular';
import { rejects } from 'assert';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://geo.autotracking.eu/api.action';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/x-www-form-urlencoded'
    })
  }
  public isLogged : boolean = false;
  public userDetails = new BehaviorSubject<any>(null);
  public trackers = new BehaviorSubject<any>(null);
  public trackerType = new BehaviorSubject<any>('logoMarker');
  public positions: any;
  public tracking: any;
  public listtrackers: any[] = [];
  combinedData: any[] = [];
  public selected = new BehaviorSubject<any>(null);
  public tripDataDate: any;

  constructor(private http: HttpClient, private navController: NavController) { }

  login(email: string, password: string) {
    return new Promise((resolve, reject) => {
      const body = new URLSearchParams();
      body.set('token' , '7254941903');
      body.set('email', email);
      body.set('passwd', password);
      this.http.post(this.apiUrl + '?authuser', body.toString(), this.httpOptions).subscribe((response : any) => {
        if (response.status === 501) {
          this.userDetails.next(response);
          this.getTrackers(response.user.uuid);
          this.isLogged = true;
          resolve(true);
        } else {
          reject(false);
        }
      }, (error) => {
        reject(false);
      })
    })
  }

  getTrackers(userId : string) {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiUrl + '?listtrackers' + '&token=7254941903' + '&uuid=' + userId).subscribe((trackers : any) => {
        if (trackers.status === 501) {
          this.http.get(this.apiUrl + '?getpositions' + '&token=7254941903' + '&uuid=' + userId).subscribe((positions : any) => {
            if (positions.status === 501) {
              trackers.trackers.forEach((tracker: any, tIndex: number) => {
                let trackerInfo = positions.trackinglist.find((position: any) => position.imei === tracker.imei);
                trackers.trackers[tIndex].info = trackerInfo;
                if (tracker.latitude && tracker.longitude) {
                  this.http.get('http://94.23.210.102/nominatim/reverse?format=geojson&lat=' + tracker.latitude + '&lon=' + tracker.longitude ).subscribe((address : any) => {  
                    if (address.features) {
                      trackers.trackers[tIndex].address = address.features[0].properties.address;
                    }
                  })
                } else if (tracker.info && tracker.info.position && tracker.info.position.latitude && tracker.info.position.longitude) {
                  this.http.get('http://94.23.210.102/nominatim/reverse?format=geojson&lat=' + tracker.info.position.latitude + '&lon=' + tracker.info.position.longitude ).subscribe((address : any) => {  
                      if (address.features && address.features[0] && address.features[0].properties) {
                          trackers.trackers[tIndex].address = address.features[0].properties.address;
                      }
                  }) 
                }
                else {
                  trackers.trackers[tIndex].address = null;
                }
              })
              this.trackers.next(trackers);
              resolve(true);
            }
            else {
              reject(false);
            }
          });
        }
        else {
          reject(false);
        }
      }), (error : any) => {
        reject(false)
      }
    })
  }

  getAPI(param : string, userId : string) {
    return this.http.get(this.apiUrl + '?' + param +'&token=7254941903' + '&uuid=' + userId);
  }

  getTripById(param : string, trackerId: number, userId: string) {
    return this.http.get(this.apiUrl + '?' + param + '&token=7254941903' + '&uuid=' + userId + "&trackerid=" + trackerId);
  }

  getTripByDate(param : string, trackerId: number, date: string, userId : string) {
    return this.http.get(this.apiUrl + '?' + param + '&token=7254941903' + '&uuid=' + userId + "&trackerid=" + trackerId + "&trackerdate=" + date);
  }

  reverseGeocode(latitude: any, longitude: any){
    return this.http.get('http://94.23.210.102/nominatim/reverse?format=geojson&lat=' + latitude + '&lon=' + longitude );
  }

  addressSearch(address: any){
    console.log('http://94.23.210.102/nominatim/search?street='+address.house_number+'%20'+address.road+'&postalcode='+address.postcode+'%20&city='+address.town+'%20&country='+address.country+'&format=json')
    return this.http.get('http://94.23.210.102/nominatim/search?street='+(address.house_number || '')+'%20'+address.road+'&postalcode='+address.postcode+'%20&city='+address.town+'%20&country='+address.country+'&format=json');
  }
}
