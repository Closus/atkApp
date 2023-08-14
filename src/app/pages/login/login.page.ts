import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UserService } from 'src/app/api/user.service';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  constructor(private userService: UserService, private navController: NavController) {}

  email!: any;
  password!: any;
  loginError: boolean = false;

  login() {
    this.userService.login(this.email, this.password).then((success) => {
      localStorage.setItem('savedEmail', this.email);
      localStorage.setItem('savedPassword', this.password);
      this.navController.navigateRoot('home');  
    }
    ).catch((error) => {
      console.log('Erreur Login');
      this.loginError = true;
    });
  }

  ngOnInit() {
    if (!this.userService.isLogged) {
      this.email = localStorage.getItem('savedEmail');
      this.password = localStorage.getItem('savedPassword');
      if (this.email && this.password) {
        this.login();
      }
    }
  }
}
