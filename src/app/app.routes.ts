import { Routes } from '@angular/router';
import { ParametresComponent } from './pages/parametres/parametres.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { AuthGuard } from './core/keycloak/core/keycloak/auth.guard';
import { AdminGuard } from './core/keycloak/core/keycloak/admin.guard';
import { AdminComponent } from './pages/admin';
import { EmployesComponent } from './pages/admin/employes/employes.component';
import { OrganigrammeComponent } from './pages/collaborateur/organigramme/organigramme.component';

export const routes: Routes = [
/*   { 
    path: '', 
    redirectTo: '/accueil', 
    pathMatch: 'full' 
  }, */

  // ✅ /accueil aussi protégé par authentification
  { 
    path: 'accueil', 
    loadComponent: () => import('./pages/collaborateur/accueil/accueil.component').then(m => m.AccueilComponent),
    canActivate: [AuthGuard] // ⚡ Nécessite connexion
  },

  // Routes publiques (sans authentification) - TRÈS LIMITÉES
  {
    path: 'forgotpassword',
    component: ForgotPasswordComponent
  },
  { 
    path: 'reset-password/:token', 
    component: ResetPasswordComponent 
  },

  // ✅ Routes admin - Nécessitent AUTH_ADMIN_ANNUAIRE
  { 
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminGuard] // Vérifie auth + privilège admin
  },
  {
    path: 'employes',
    component: EmployesComponent,
    canActivate: [AdminGuard]
  },
  
  // ✅ Routes protégées - Nécessitent authentification
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
  { 
    path: '**', 
    redirectTo: '/accueil' 
  }
];