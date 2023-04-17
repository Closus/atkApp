import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, FontAwesomeModule],
  entryComponents: []
})
export class AppComponent {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, fab, far);
  }
}
