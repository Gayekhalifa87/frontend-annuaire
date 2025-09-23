import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { KeycloakService } from '../../core/keycloak/keycloak.service';

@Component({
  selector: 'app-entete',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './entete.component.html',
  styleUrl: './entete.component.css'
})
export class EnteteComponent implements OnInit {
  isLoggedIn = false;
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private keycloakService : KeycloakService,
    private router: Router
  ) {}

  ngOnInit() {
    // Écouter les changements d'état de connexion
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      console.log('📊 État connexion:', loggedIn);
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('👤 Utilisateur actuel:', user);
    });
  }
  
  /** Navigation vers login (toujours forcer la déconnexion avant connexion) */
  onLogin() {
    console.log('🔐 Redirection vers login...');
    this.keycloakService.logout('/accueil').then(() => {
      this.keycloakService.login();
    });
  }

  /** Déconnexion */
  onLogout() {
    console.log('🚪 Déconnexion...');
    this.authService.logout();
    this.router.navigate(['/accueil']);
  }

  /** Navigation vers admin */
  goToAdmin() {
    if (this.isLoggedIn) {
      this.router.navigate(['/admin']);
    } else {
      this.onLogin();
    }
  }
}