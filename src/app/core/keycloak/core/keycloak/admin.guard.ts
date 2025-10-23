import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { KeycloakService } from '../../keycloak.service';
import { PrivilegeService } from '../../../privilege.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private keycloakService: KeycloakService,
    private privilegeService: PrivilegeService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    console.log('🔒 AdminGuard: Vérification accès /admin');

    // ✅ Attendre initialisation Keycloak
    let attempts = 0;
    while (!this.keycloakService.isInitialized() && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!this.keycloakService.isInitialized()) {
      console.error('❌ Keycloak non initialisé');
      return false;
    }

    // 🔐 Vérifier authentification
    if (!this.keycloakService.isLoggedIn()) {
      console.log('❌ Non authentifié → redirection login');
      this.keycloakService.login('/admin');
      return false;
    }

    // ✅ Charger/vérifier les privilèges
    const privileges = this.privilegeService.getPrivileges();
    if (privileges.length === 0) {
      try {
        console.log('⏳ Chargement des privilèges...');
        await this.privilegeService.loadUserPrivileges().toPromise();
      } catch (err) {
        console.error('❌ Erreur chargement privilèges:', err);
        return this.router.createUrlTree(['/accueil']);
      }
    }

    // 🔑 Vérifier privilège admin
    if (!this.privilegeService.isAdminAnnuaire()) {
      console.warn('⛔ Pas de privilège AUTH_ADMIN_ANNUAIRE → /accueil');
      return this.router.createUrlTree(['/accueil']);
    }

    console.log('✅ Accès admin autorisé');
    return true;
  }
}