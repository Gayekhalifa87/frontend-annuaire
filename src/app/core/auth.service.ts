import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KeycloakService } from './keycloak/keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser = new BehaviorSubject<any>(null);
  public currentUser$ = this._currentUser.asObservable();

  constructor(private keycloakService: KeycloakService) {
    // Vérification session Keycloak au démarrage
    this.keycloakService.init(false).then(() => {
      this._currentUser.next(
        this.keycloakService.isLoggedIn() ? this.keycloakService.getUserProfile() : null
      );
    });
  }

  /** Login */
  async login(): Promise<void> {
    if (!this.keycloakService.isInitialized()) {
      await this.keycloakService.init(true);
    }
    this.keycloakService.login();
  }

  /** Logout complet */
  async logout(): Promise<void> {
    this._currentUser.next(null);
    localStorage.clear();
    sessionStorage.clear();

    // 🔹 Redirection Keycloak → tue session et cookies HttpOnly
    await this.keycloakService.logout('/accueil');
  }

  /** Token */
  getToken(): string | null {
    return this.keycloakService.getToken();
  }

  /** Vérifie si connecté */
  isLoggedIn(): boolean {
    return this.keycloakService.isLoggedIn();
  }

  /** Définir utilisateur courant */
  setCurrentUser(user: any) {
    this._currentUser.next(user);
  }

  /** Retourne utilisateur courant */
  get currentUser(): any {
    return this._currentUser.value;
  }
}
