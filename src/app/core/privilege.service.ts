import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface Privilege {
  id: number;
  name: string;
  code: string;
  active: boolean;
}

interface Application {
  id: number;
  applicationName: string;
  applicationCode: string;
  description: string;
  url: string;
  icon: string;
  version: string;
  active: boolean;
  privileges: Privilege[];
}

@Injectable({
  providedIn: 'root'
})
export class PrivilegeService {
  // ✅ Utiliser le proxy au lieu de l'URL directe
  private apiUrl = '/api/v1/agent2';
  private applicationId = 16; // ID de l'application Annuaire
  
  private _userPrivileges = new BehaviorSubject<Privilege[]>([]);
  public userPrivileges$ = this._userPrivileges.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupère les privilèges de l'utilisateur pour l'application
   */
  loadUserPrivileges(): Observable<Application> {
    return this.http.get<Application>(
      `${this.apiUrl}/application/${this.applicationId}`
    ).pipe(
      tap(application => {
        console.log('✅ Privilèges chargés:', application.privileges);
        this._userPrivileges.next(application.privileges);
      }),
      catchError(err => {
        console.error('❌ Erreur chargement privilèges:', err);
        this._userPrivileges.next([]);
        throw err;
      })
    );
  }

  /**
   * Vérifie si l'utilisateur a un privilège spécifique
   */
  hasPrivilege(privilegeCode: string): boolean {
    const privileges = this._userPrivileges.value;
    return privileges.some(p => p.code === privilegeCode && p.active);
  }

  /**
   * Vérifie si l'utilisateur est admin de l'annuaire
   */
  isAdminAnnuaire(): boolean {
    console.log('🔐 Utilisateur est un admin ');
    return this.hasPrivilege('AUTH_ADMIN_ANNUAIRE');
  }

  /**
   * Vérifie si l'utilisateur est collaborateur
   */
  isCollaborateur(): boolean {
    console.log('👤 Utilisateur est un collaborateur ');
    return this.hasPrivilege('AUTH_COLLABORATEUR');
  }

  clearPrivileges(): void {
  this._userPrivileges.next([]);
}

  /**
   * Détermine la route de redirection selon les privilèges
   */
  getRedirectRoute(): string {
    if (this.isAdminAnnuaire()) {
      console.log('🔐 Utilisateur admin -> /admin');
      return '/admin';
    }
    
    if (this.isCollaborateur()) {
      console.log('👤 Utilisateur collaborateur -> /accueil');
      return '/accueil';
    }
    
    console.log('⚠️ Pas de privilège reconnu -> /accueil');
    return '/accueil';
  }

  /**
   * Récupère tous les privilèges
   */
  getPrivileges(): Privilege[] {
    return this._userPrivileges.value;
  }

 
}