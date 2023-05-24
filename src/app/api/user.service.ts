import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://geo.autotracking.eu/api.action?authuser';
  private getPositionsUrl = 'http://geo.autotracking.eu/api.action?getpositions';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/x-www-form-urlencoded'
    })
  }
  public userDetails: any;
  public positions: any;
  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    const body = new URLSearchParams();
    body.set('token' , '7254941903');
    body.set('email', email);
    body.set('passwd', password);
    return this.http.post(this.apiUrl, body.toString(), this.httpOptions);
  }

  getPositions() {
    return this.http.get(this.getPositionsUrl + '&token=7254941903' + '&uuid=' + this.userDetails.uuid);
  }
}
