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
  reverseGeocodedAddresses: any;
  

  constructor(private modalController: ModalController, public userService: UserService, private httpClient: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/x-www-form-urlencoded'
    })
  }

  ngOnInit() {
    for (const data of this.userService.combinedData) {
      if (data.positionData.position) {
        
      }
    }
  }
  closeModal() {
    this.modalController.dismiss(null);
  }


  selectItem(item: any) {
    console.log('item', item);
    this.modalController.dismiss(item);
  }
  
}
