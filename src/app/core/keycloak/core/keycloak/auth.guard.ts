// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
// Remonte correctement vers le service Keycloak
import { KeycloakService } from '../../keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private keycloakService: KeycloakService
  ) {}

  async canActivate(): Promise<boolean> {
    try {
      if (this.keycloakService.isLoggedIn()) {
        return true;
      } else {
        await this.keycloakService.login();
        return false;
      }
    } catch (err: any) {
      console.error('❌ AuthGuard : impossible de se connecter', err);
      this.router.navigate(['/connexion']);
      return false;
    }
  }
}
