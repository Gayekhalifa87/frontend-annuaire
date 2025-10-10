import { Routes } from '@angular/router';
import { ParametresComponent } from './pages/parametres/parametres.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { inject } from '@angular/core';
import { AuthService } from './core/auth.service';
import { KeycloakService } from './core/keycloak/keycloak.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthGuard } from './core/keycloak/core/keycloak/auth.guard';
import { AdminComponent } from './pages/admin';
import { EmployesComponent } from './pages/admin/employes/employes.component';
import { OrganigrammeComponent } from './pages/collaborateur/organigramme/organigramme.component';

// (Utiliser la classe AuthGuard injectable pour protéger les routes)


// Guard pour rediriger si déjà connecté
export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    map(isLoggedIn => {
      if (!isLoggedIn) return true;
      router.navigate(['/admin']);
      return false;
    })
  );
};

export const routes: Routes = [
  { path: '', redirectTo: '/accueil', pathMatch: 'full' },

  // Routes publiques
  { 
    path: 'accueil', 
    loadComponent: () => import('./pages/collaborateur/accueil/accueil.component').then(m => m.AccueilComponent)
  },

  {
    path: 'forgotpassword',
    component: ForgotPasswordComponent
  },
  { 
    path: 'reset-password/:token', 
    component: ResetPasswordComponent 
  },

  // Routes protégées (nécessitent d’être connecté)
  { 
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard]  
  },
  {
    path: 'employes',
    component: EmployesComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'recherche',
    loadComponent: () => import('./components/search/search.component').then(m => m.SearchComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'parametres',
    component: ParametresComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'organigramme',
    component: OrganigrammeComponent,
    canActivate: [AuthGuard]
  },


  // Fallback
  { path: '**', redirectTo: '/accueil' }
];
