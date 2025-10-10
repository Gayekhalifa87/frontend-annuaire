import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { KeycloakService } from '../../keycloak.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private keycloakService: KeycloakService) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    console.log('AuthGuard.canActivate called for', state?.url);
    // Attendre l'initialisation Keycloak si elle est en cours
    try {
      if ((this.keycloakService as any).initPromise) {
        await (this.keycloakService as any).initPromise;
      }
    } catch (e) {
      // ignore init errors
    }

    const loggedLocal = this.authService.isLoggedIn();
    const loggedKeycloak = this.keycloakService.isLoggedIn();
    console.log('AuthGuard states -> local:', loggedLocal, 'keycloak:', loggedKeycloak);
    if (loggedLocal || loggedKeycloak) {
      console.log('AuthGuard: access granted to', state?.url);
      return true;
    }

    // Si pas connecté, lancer le flow Keycloak vers l'URL demandée
  const returnUrl = state && state.url ? state.url : '/admin';
  console.log('AuthGuard: not authenticated, redirecting to Keycloak, returnUrl=', returnUrl);
    try {
      this.keycloakService.login(returnUrl);
    } catch (e) {
      // fallback : naviguer vers accueil
      this.router.navigate(['/accueil']);
    }
    return false;
  }
}
