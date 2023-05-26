import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UserService } from 'src/app/api/user.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-balise',
  templateUrl: './balise.component.html',
  styleUrls: ['./balise.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class BaliseComponent  implements OnInit {
  reverseGeocodedAddresses: { [key: string]: string } = {};

  constructor(private modalController: ModalController, public userService: UserService, private httpClient: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/x-www-form-urlencoded'
    })
  }

  async ngOnInit() {
    for (const data of this.userService.positions) {
      if (data.position) {
        const address = await this.reverseGeocode(data.position.latitude, data.position.longitude);
        this.reverseGeocodedAddresses[data.imei] = address;
      }
    }
  }
  closeModal() {
    this.modalController.dismiss();
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    return "";
  }


  
}
