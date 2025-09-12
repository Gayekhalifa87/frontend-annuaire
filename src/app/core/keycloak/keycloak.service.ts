import { Injectable } from '@angular/core';
import Keycloak, { KeycloakInstance } from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private keycloak!: KeycloakInstance;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  /** Initialisation Keycloak */
  async init(forceLogin: boolean = false): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.keycloak = new Keycloak({
      url: 'http://localhost:8180/',
      realm: 'annuaire',
      clientId: 'annuaire-frontend'
    });

    this.initPromise = this.keycloak.init({
      onLoad: forceLogin ? 'login-required' : 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
      checkLoginIframe: false
    }).then(() => {
      this.initialized = true;
      if (this.isLoggedIn()) {
        console.log('✅ Connecté, token :', this.getToken());
      }
    }).catch(err => console.error('❌ Erreur Keycloak', err));

    return this.initPromise;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /** Connexion */
  login(): void {
    this.keycloak?.login({ prompt: 'login' });
  }

  /** Déconnexion → redirige vers la page d’accueil */
  async logout(redirectUrl: string = '/accueil'): Promise<void> {
    if (!this.keycloak) return;

    try {
      // Nettoyage local
      localStorage.clear();
      sessionStorage.clear();

      // Redirection vers Keycloak logout
      const redirectUri = encodeURIComponent(window.location.origin + redirectUrl);
      const logoutUrl = `${this.keycloak.authServerUrl}/realms/${this.keycloak.realm}/protocol/openid-connect/logout?redirect_uri=${redirectUri}`;
      window.location.href = logoutUrl;
    } catch (err) {
      console.error('❌ Erreur logout Keycloak', err);
    }
  }

  getToken(): string | null {
    return this.keycloak?.token ?? null;
  }

  isLoggedIn(): boolean {
    return this.initialized && !!this.keycloak.token;
  }

  getUserProfile(): any {
    return this.initialized ? this.keycloak.tokenParsed : null;
  }

  async updateToken(minValidity: number = 30): Promise<boolean> {
    if (!this.initialized) return false;
    try {
      return await this.keycloak.updateToken(minValidity);
    } catch (err) {
      console.error('❌ Erreur refresh token', err);
      return false;
    }
  }
}
