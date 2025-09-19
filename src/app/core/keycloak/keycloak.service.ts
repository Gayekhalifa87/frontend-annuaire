import { Injectable } from '@angular/core';
import Keycloak, { KeycloakInstance } from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})  
export class KeycloakService {
  private keycloak!: KeycloakInstance;
  private initialized = false; // ✅ Changé de true à false
  private initPromise: Promise<void> | null = null;

  /** Initialisation Keycloak */
  async init(forceLogin: boolean = false): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.keycloak = new Keycloak({
      url: 'https://refonte.seneau.sn/',
      realm: 'auth2-dev',
      clientId: 'seneau',
      // ✅ Pour un client confidentiel, ajoutez :
      // credentials: {
      //   secret: 'eLDu7SfmCjSGlI7YOFXp7xZtgJi73mhF'
      // }
    });

    this.initPromise = this.keycloak.init({
      onLoad: forceLogin ? 'login-required' : 'check-sso',
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
    }).then((authenticated) => {
      this.initialized = true;
      console.log('🔧 Keycloak initialisé, authentifié :', authenticated);
      
      if (this.isLoggedIn()) {
        console.log('✅ Connecté, token :', this.getToken());
        console.log('👤 Profil utilisateur :', this.getUserProfile());
      }
    }).catch(err => {
      console.error('❌ Erreur Keycloak init :', err);
      this.initialized = true; // ✅ Marquer comme initialisé même en cas d'erreur
      
      // ✅ Gestion d'erreur sécurisée
      if (err && typeof err === 'object' && err.error === 'login_required') {
        console.log('🔄 Connexion requise, redirection...');
        if (forceLogin) {
          this.login();
        }
      } else {
        console.log('ℹ️ Keycloak initialisé sans authentification');
      }
    });

    return this.initPromise;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /** Connexion */
  login(): void {
    if (!this.keycloak) {
      console.error('❌ Keycloak pas encore initialisé');
      return;
    }
    
    this.keycloak.login({ 
      prompt: 'login',
      // ✅ Ajoutez une URL de redirection explicite
      redirectUri: window.location.origin + '/admin'
    });
  }

  /** Déconnexion avec redirection */
  async logout(redirectUrl: string = '/accueil'): Promise<void> {
    if (!this.keycloak) return;

    try {
      // Nettoyage local
      localStorage.clear();
      sessionStorage.clear();

      // 🔹 Redirection vers Keycloak logout
      await this.keycloak.logout({
        redirectUri: window.location.origin + redirectUrl
      });
    } catch (err) {
      console.error('❌ Erreur logout Keycloak', err);
      // ✅ Fallback : redirection manuelle
      window.location.href = window.location.origin + redirectUrl;
    }
  }

  getToken(): string | null {
    return this.keycloak?.token ?? null;
  }

  isLoggedIn(): boolean {
    return this.initialized && !!this.keycloak?.authenticated;
  }

  getUserProfile(): any {
    return this.initialized ? this.keycloak?.tokenParsed : null;
  }

  async updateToken(minValidity: number = 30): Promise<boolean> {
    if (!this.initialized || !this.keycloak) return false;
    try {
      return await this.keycloak.updateToken(minValidity);
    } catch (err) {
      console.error('❌ Erreur refresh token', err);
      return false;
    }
  }

  // ✅ Méthode utile pour débugger
  getKeycloakInstance(): KeycloakInstance | null {
    return this.keycloak || null;
  }
}