import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { UserService } from 'src/app/api/user.service';
import { catchError, first } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  constructor(private navController: NavController, private userService: UserService) {
    this.email = '';
    this.password = '';
   }

  email!: string;
  password!: string;
  loginError: boolean = false;

  login() {
    this.userService.login(this.email, this.password).pipe(first()).subscribe((response: any) => {
      console.log(response);
      if (response.status === 501) {
        console.log('response', response);
        const uuid = response.user.uuid;
        console.log('response2' , response);
        console.log("----------");
        console.log(uuid);
        console.log(this.userService)
        this.userService.userDetails = response.user;
          localStorage.setItem('savedEmail', this.email);
          localStorage.setItem('savedPassword', this.password);
          this.navController.navigateRoot('home');
      } else {
        this.loginError = true;
      }
    });
  }

  ngOnInit() {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');

    if (savedEmail && savedPassword) {
      this.email = savedEmail;
      this.password = savedPassword;
      this.login();
    }
  }

  goToHomePage() {
    this.login();
  }
}
