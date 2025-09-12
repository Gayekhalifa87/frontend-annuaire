import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'], 
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private router : Router) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {

  }

  retour(){
    /* alert('redirection'); */
    this.router.navigate(['/connexion']);
  }
}
