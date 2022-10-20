import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  constructor() { }

  ngOnInit() {
  }

  onSubmit() {
    alert(
     this.name + ', ' + this.email + ', ' + this.password + ', ' + this.confirmPassword
    );
 }

}
