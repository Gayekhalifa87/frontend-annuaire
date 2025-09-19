import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/employes';
  private _currentUser = new BehaviorSubject<any>(null);
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  
  public currentUser$ = this._currentUser.asObservable();
  public isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor(private http: HttpClient) {
    // Vérifier si un token existe au démarrage
    this.checkExistingToken();
  }

  /** Vérification token existant au démarrage */
  private checkExistingToken() {
    const token = this.getToken();
    if (token) {
      try {
        const payload = this.parseJWT(token);
        if (payload && payload.exp && payload.exp > Date.now() / 1000) {
          console.log('✅ Token valide trouvé');
          this._currentUser.next(payload);
          this._isLoggedIn.next(true);
        } else {
          console.log('⚠️ Token expiré, suppression');
          this.clearToken();
        }
      } catch (err) {
        console.log('❌ Token invalide, suppression');
        this.clearToken();
      }
    }
  }

  /** Login via backend */
  login(username: string, password: string): Observable<any> {
    console.log('🔐 Tentative de connexion pour:', username);
    
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { 
      username, 
      password 
    }).pipe(
      tap(response => {
        console.log('✅ Connexion réussie');
        this.saveToken(response.access_token);
        
        // Parser le token pour extraire les infos utilisateur
        const userInfo = this.parseJWT(response.access_token);
        this._currentUser.next(userInfo);
        this._isLoggedIn.next(true);
      }),
      catchError(err => {
        console.error('❌ Erreur de connexion:', err);
        this._isLoggedIn.next(false);
        throw err;
      })
    );
  }

  /** Déconnexion */
  logout(): void {
    console.log('🚪 Déconnexion...');
    
    // Appel optionnel au backend pour logout
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.baseUrl}/logout`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: () => console.log('✅ Logout backend OK'),
        error: (err) => console.warn('⚠️ Erreur logout backend:', err)
      });
    }

    this.clearSession();
  }

  /** Nettoyage session locale */
  private clearSession() {
    this.clearToken();
    this._currentUser.next(null);
    this._isLoggedIn.next(false);
  }

  /** Sauvegarde du token */
  private saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  /** Récupération du token */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /** Suppression du token */
  private clearToken() {
    localStorage.removeItem('access_token');
  }

  /** Parser JWT (sans vérification signature) */
  private parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('❌ Erreur parsing JWT:', err);
      return null;
    }
  }

  /** Getters */
  get currentUser(): any {
    return this._currentUser.value;
  }

  isLoggedIn(): boolean {
    return this._isLoggedIn.value;
  }

  /** Mise à jour automatique du token */
  refreshToken(): Observable<any> {
    const token = this.getToken();
    if (!token) return of(null);

    return this.http.post<LoginResponse>(`${this.baseUrl}/refresh`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(response => {
        this.saveToken(response.access_token);
        const userInfo = this.parseJWT(response.access_token);
        this._currentUser.next(userInfo);
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }
}