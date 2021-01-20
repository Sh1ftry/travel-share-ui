import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import {AuthenticationService} from '../authentication.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  registerForm: FormGroup;
  spin = false;

  constructor(private router: Router,
              private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService,
              private snackBar: MatSnackBar,
  ) {
    this.loginForm = formBuilder.group({
      email: formBuilder.control(''),
      password: formBuilder.control(''),
    });

    this.registerForm = formBuilder.group({
      name: formBuilder.control('', Validators.required),
      surname: formBuilder.control('', Validators.required),
      email: formBuilder.control('', [
        Validators.required,
        Validators.email
      ]),
      password: formBuilder.control('', [
        Validators.required,
        Validators.minLength(8)
      ]),
      repeatPassword: formBuilder.control(''),
    }, {
      validator: this.mustMatch,
    });
  }

  mustMatch(formGroup: FormGroup): { [s: string]: boolean } {
    const control = formGroup.controls.password;
    const matchingControl = formGroup.controls.repeatPassword;

    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      return;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  }

  ngOnInit(): void {}

  login(): void {
    this.spin = true;
    const controls = this.loginForm.controls;
    this.authenticationService.login(
      controls.email.value,
      controls.password.value,
    ).subscribe(user => {
      this.spin = false;
      this.router.navigate(['/route']);
    }, _ => {
      this.spin = false;
      this.snackBar.open('Wrong email or password', 'Ok', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    });
  }

  register(): void {
    this.spin = true;
    const controls = this.registerForm.controls;
    this.authenticationService.register(
      controls.name.value,
      controls.surname.value,
      controls.email.value,
      controls.password.value,
      controls.repeatPassword.value
    ).subscribe(user => {
      this.spin = false;
      this.router.navigate(['/route']);
    }, _ => {
      this.spin = false;
      this.snackBar.open('Please provide correct information', 'Ok', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    });
  }

}
