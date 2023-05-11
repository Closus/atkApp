import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://geo.autotracking.eu/api.action?authuser';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/x-www-form-urlencoded'
    })
  }
  public userDetails: any;
  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    const body = new URLSearchParams();
    body.set('token' , '7254941903');
    body.set('email', email);
    body.set('passwd', password);
    return this.http.post(this.apiUrl, body.toString(), this.httpOptions);
  }
}
