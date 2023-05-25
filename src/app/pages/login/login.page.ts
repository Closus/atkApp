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

  login() {
    this.userService.login('atk@autotracking.eu', 'atk25800').pipe(first()).subscribe((response: any) => {
      const uuid = response.user.uuid;
      console.log(response);
      console.log("----------");
      console.log(uuid);
      this.userService.userDetails = response.user;
      this.navController.navigateRoot('home');
      }),
      catchError((error) => {
        console.log(error);
        throw error;
      });
  }

  ngOnInit() {
  }

  goToHomePage() {
    this.navController.navigateRoot('home');
    this.login();
  }

}
