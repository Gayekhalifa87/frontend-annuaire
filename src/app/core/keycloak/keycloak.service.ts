import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Keycloak, { KeycloakInstance } from 'keycloak-js';
import { PrivilegeService } from '../privilege.service';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private keycloak!: KeycloakInstance;
  private initialized = false; 
  private initPromise: Promise<void> | null = null;

  constructor(
    private router: Router,
    private privilegeService: PrivilegeService
  ) {}

  /** 🔐 Initialisation Keycloak avec login obligatoire */
  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.keycloak = new Keycloak({
      url: 'https://refonte.seneau.sn/',
      realm: 'auth2-dev',
      clientId: 'seneau-portal',
    });

    this.initPromise = this.keycloak.init({
      onLoad: 'login-required', // ✅ Force la connexion dès le départ
      checkLoginIframe: true, // ✅ Active le check SSO entre onglets
      checkLoginIframeInterval: 5, // Vérifier toutes les 5 secondes
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
    })
    .then(async (authenticated) => {
      this.initialized = true;
      console.log('🔧 Keycloak initialisé, authentifié:', authenticated);

      if (!authenticated) {
        console.log('❌ Pas authentifié, redirection login...');
        await this.login();
        return;
      }

      // ✅ Charger les privilèges après authentification
      await this.loadPrivilegesAndRedirect();

      // ✅ Surveiller les changements d'état de session
      this.setupSessionMonitoring();
    })
    .catch(async err => {
      console.error('❌ Erreur Keycloak init:', err);
      this.initialized = true;
      await this.login();
    });

    return this.initPromise;
  }

  /** 🔄 Surveillance de la session entre onglets */
  private setupSessionMonitoring() {
    // Événement déclenché quand le token change ou expire
    this.keycloak.onAuthLogout = () => {
      console.log('🚪 Déconnexion détectée → redirection login');
      this.privilegeService.clearPrivileges();
      this.login();
    };

    this.keycloak.onAuthRefreshError = () => {
      console.log('❌ Erreur refresh token → redirection login');
      this.privilegeService.clearPrivileges();
      this.login();
    };

    this.keycloak.onTokenExpired = () => {
      console.log('⏰ Token expiré → tentative de refresh');
      this.updateToken(30).catch(() => {
        console.log('❌ Impossible de rafraîchir → redirection login');
        this.login();
      });
    };
  }

  /** 🚀 Charge les privilèges et redirige selon le rôle */
  private async loadPrivilegesAndRedirect(): Promise<void> {
    try {
      console.log('⏳ Chargement des privilèges...');
      await this.privilegeService.loadUserPrivileges().toPromise();
      
      const redirectRoute = this.privilegeService.getRedirectRoute();
      
      if (redirectRoute) {
        console.log('🚀 Redirection vers:', redirectRoute);
        this.router.navigate([redirectRoute]);
      } else {
        console.log('⚠️ Aucun privilège trouvé → déconnexion');
        await this.logout();
      }
    } catch (err) {
      console.error('❌ Erreur chargement privilèges:', err);
      await this.logout();
    }
  }

  /** 🔐 Login Keycloak */
  async login(redirectPath?: string): Promise<void> {
    const redirectUri = redirectPath 
      ? window.location.origin + redirectPath 
      : window.location.origin;

    await this.keycloak.login({
      redirectUri,
      prompt: 'login' // Force toujours le formulaire de login
    });
  }

  /** 🚪 Logout complet avec nettoyage SSO */
  async logout(redirectUrl: string = '/accueil'): Promise<void> {
    if (!this.keycloak) return;

    try {
      // 1️⃣ Nettoyer privilèges et stockage local
      this.privilegeService.clearPrivileges();
      localStorage.clear();
      sessionStorage.clear();

      console.log('🚪 Déconnexion Keycloak...');

      // 2️⃣ Déconnexion Keycloak (supprime le SSO)
      await this.keycloak.logout({
        redirectUri: window.location.origin + redirectUrl
      });

    } catch (err) {
      console.error('❌ Erreur logout Keycloak', err);
      // Fallback: redirection manuelle
      window.location.href = window.location.origin + redirectUrl;
    }
  }

  /** ✅ Vérifie si Keycloak est initialisé */
  isInitialized(): boolean {
    return this.initialized;
  }

  /** 🔐 Vérifie si l'utilisateur est connecté */
  isLoggedIn(): boolean {
    return this.initialized && !!this.keycloak?.authenticated;
  }

  /** 🪪 Récupère le token JWT */
  getToken(): string | null {
    return this.keycloak?.token ?? null;
  }

  /** 👤 Profil utilisateur */
  getUserProfile(): any {
    return this.initialized ? this.keycloak?.tokenParsed : null;
  }

  /** 🔄 Rafraîchit le token si nécessaire */
  async updateToken(minValidity: number = 30): Promise<boolean> {
    if (!this.initialized || !this.keycloak) return false;
    try {
      const refreshed = await this.keycloak.updateToken(minValidity);
      if (refreshed) {
        console.log('✅ Token rafraîchi');
      }
      return refreshed;
    } catch (err) {
      console.error('❌ Erreur refresh token', err);
      return false;
    }
  }
}