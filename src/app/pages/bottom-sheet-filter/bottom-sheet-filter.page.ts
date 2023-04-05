import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-bottom-sheet-filter',
  templateUrl: './bottom-sheet-filter.page.html',
  styleUrls: ['./bottom-sheet-filter.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class BottomSheetFilterPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
