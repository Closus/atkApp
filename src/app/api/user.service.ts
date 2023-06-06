import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  public userDetails: any;
  public positions: any;
  public tracking: any;
  public listtrackers: any[] = [];
  combinedData: any[] = [];
  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    const body = new URLSearchParams();
    body.set('token' , '7254941903');
    body.set('email', email);
    body.set('passwd', password);
    return this.http.post(this.apiUrl + '?authuser', body.toString(), this.httpOptions);
  }

  getAPI(param : string) {
    return this.http.get(this.apiUrl + '?' + param +'&token=7254941903' + '&uuid=' + this.userDetails.uuid);
  }

  getTripById(param : string, id: number) {
    return this.http.get(this.apiUrl + '?' + param + '&token=7254941903' + '&uuid=' + this.userDetails.uuid + "&trackerid=" + id);
  }

  getTripByDate(param : string, id: number, date: string) {
    return this.http.get(this.apiUrl + '?' + param + '&token=7254941903' + '&uuid=' + this.userDetails.uuid + "&trackerid=" + id + "&trackerdate=" + date);
  }

  reverseGeocode(latitude: any, longitude: any){
    return this.http.get('http://94.23.210.102/nominatim/reverse?format=geojson&lat=' + latitude + '&lon=' + longitude );
  }
}
