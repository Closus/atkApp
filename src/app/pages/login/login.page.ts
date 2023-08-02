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

  constructor(private navController: NavController, private userService: UserService) { }

  email!: string;
  password!: string;
  saveInfo!: boolean;

  login() {
    if (this.email === 'atk@autotracking.eu' && this.password === 'atk25800') {
      this.userService.login(this.email, this.password).pipe(first()).subscribe((response: any) => {
        const uuid = response.user.uuid;
        console.log(response);
        console.log("----------");
        console.log(uuid);
        this.userService.userDetails = response.user;
        if (this.saveInfo) {
          localStorage.setItem('savedEmail', this.email);
          localStorage.setItem('savedPassword', this.password);
        }
        this.navController.navigateRoot('home');
      }),
      catchError((error) => {
        console.log(error);
        throw error;
      });
    } else {
      console.log('Invalid email or password');
      // Handle invalid email or password here
    }
  }

  ngOnInit() {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');

    if (savedEmail && savedPassword) {
      this.email = savedEmail;
      this.password = savedPassword;
    }
  }

  goToHomePage() {
    this.login();
  }

}
