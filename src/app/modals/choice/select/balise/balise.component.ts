import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';



@Component({
  selector: 'app-balise',
  templateUrl: './balise.component.html',
  styleUrls: ['./balise.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class BaliseComponent  implements OnInit {

  constructor(private modalController: ModalController) { }

  ngOnInit() {

  }
  closeModal() {
    this.modalController.dismiss();
  }
}
