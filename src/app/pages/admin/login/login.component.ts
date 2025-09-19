import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showDebug = false; // Mettre à true pour debug
  loginStatus = 'disconnected';
  currentUser: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.loginStatus = loggedIn ? 'connected' : 'disconnected';
      if (loggedIn) {
        this.router.navigate(['/admin']);
      }
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { username, password } = this.loginForm.value;
      console.log('🔐 Tentative de connexion:', { username });

      this.authService.login(username, password).subscribe({
        next: (response) => {
          console.log('✅ Connexion réussie:', response);
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          console.error('❌ Erreur de connexion:', err);
          if (err.status === 401) {
            this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
          } else {
            this.errorMessage = 'Erreur de connexion. Veuillez réessayer.';
          }
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  toggleDebug() {
    this.showDebug = !this.showDebug;
  }
}
