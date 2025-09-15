
//
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KeycloakService } from '../../../core/keycloak/keycloak.service';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})
export class ConnexionComponent implements OnInit {

  private router = inject(Router);
  private keycloakService = inject(KeycloakService);

  isLoading = false;
  isInitializing = true; // pour gérer le spinner si besoin

  ngOnInit() {
    // Lancement de l’init en arrière-plan
    this.keycloakService.init().then(() => {
      if (this.keycloakService.isLoggedIn()) {
        console.log("✅ Déjà connecté :", this.keycloakService.getUserProfile());
        this.router.navigate(['/admin']);
      }
    }).finally(() => {
      this.isInitializing = false; // affiche le formulaire immédiatement
    });
  }

  /** 🔹 Déconnexion */
  async onLogout() {
    await this.keycloakService.logout();
  }

  /** 🔹 Mot de passe oublié */
  forgotPassword() {
    this.router.navigate(['/forgotpassword']);
  }

  /** 🔹 Retour accueil */
  retour() {
    this.router.navigate(['/accueil']);
  }
}
