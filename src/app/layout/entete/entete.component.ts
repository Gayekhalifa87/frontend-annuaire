import { Component } from '@angular/core';
import { Router, RouterModule, Route } from '@angular/router';
import { inject } from '@angular/core';
import { KeycloakService } from '../../core/keycloak/keycloak.service';


@Component({
  selector: 'app-entete',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './entete.component.html',
  styleUrl: './entete.component.css'
})
export class EnteteComponent {


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
  
  /** 🔹 Connexion avec Keycloak */
  async onLogin() {
    this.isLoading = true;
    try {
      if (!this.keycloakService.isInitialized()) {
        await this.keycloakService.init(); // Init si pas déjà fait
      }
      await this.keycloakService.login();
      console.log("✅ Utilisateur connecté :", this.keycloakService.getUserProfile());
      this.router.navigate(['/admin']);
    } catch (err) {
      console.error('❌ Erreur de connexion', err);
    } finally {
      this.isLoading = false;
    }
  }

}

