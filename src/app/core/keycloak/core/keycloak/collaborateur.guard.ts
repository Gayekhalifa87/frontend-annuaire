import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { KeycloakService } from '../../keycloak.service';
import { PrivilegeService } from '../../../privilege.service';
@Injectable({
  providedIn: 'root'
})
export class CollaborateurGuard implements CanActivate {
  
  constructor(
    private keycloakService: KeycloakService,
    private privilegeService: PrivilegeService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    // ✅ Attendre que Keycloak soit initialisé
    if (!this.keycloakService.isInitialized()) {
      console.log('⏳ Attente initialisation Keycloak...');
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!this.keycloakService.isInitialized()) {
        console.error('❌ Keycloak non initialisé après timeout');
        return true; // Autoriser l'accès à /accueil même si non initialisé
      }
    }

    // Vérifier si l'utilisateur est connecté
    if (!this.keycloakService.isLoggedIn()) {
      console.log('ℹ️ Non authentifié, accès public à /accueil');
      return true; // ✅ /accueil est accessible sans authentification
    }

    // ✅ Attendre le chargement des privilèges si pas encore chargés
    const privileges = this.privilegeService.getPrivileges();
    if (privileges.length === 0) {
      try {
        console.log('⏳ Chargement des privilèges...');
        await this.privilegeService.loadUserPrivileges().toPromise();
      } catch (err) {
        console.error('❌ Erreur chargement privilèges:', err);
        return true; // Autoriser l'accès même en cas d'erreur pour /accueil
      }
    }

    // Si l'utilisateur est admin, rediriger vers /admin
    if (this.privilegeService.isAdminAnnuaire()) {
      console.log('🔄 Utilisateur admin, redirection vers /admin');
      return this.router.createUrlTree(['/admin']);
    }

    // Sinon autoriser l'accès à /accueil
    console.log('✅ Accès collaborateur autorisé');
    return true;
  }
}