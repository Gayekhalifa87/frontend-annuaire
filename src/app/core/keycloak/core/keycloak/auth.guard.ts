import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { KeycloakService } from '../../keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router, 
    private keycloakService: KeycloakService
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Promise<boolean> {
    console.log('🔐 AuthGuard: Vérification pour', state?.url);
    
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

    const isAuthenticated = this.keycloakService.isLoggedIn();
    console.log('AuthGuard: Authentifié =', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('✅ Accès autorisé à', state?.url);
      return true;
    }

    // ❌ Pas connecté → redirection login
    const returnUrl = state?.url || '/accueil';
    console.log('❌ Non authentifié → redirection login, returnUrl=', returnUrl);
    
    this.keycloakService.login(returnUrl);
    return false;
  }
}