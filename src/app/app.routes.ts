import { Routes } from '@angular/router';
import { ParametresComponent } from './pages/parametres/parametres.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { AuthGuard } from './core/keycloak/core/keycloak/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/accueil',
    pathMatch: 'full'
  },
  {
    path: 'accueil', 
    loadComponent: () => import('./pages/collaborateur/accueil/accueil.component').then(m => m.AccueilComponent)
  },
  {
    path: 'connexion',
    loadComponent: () => import('./pages/admin/connexion/connexion.component').then(m => m.ConnexionComponent)
  },
  {
    path: 'forgotpassword',
    component: ForgotPasswordComponent
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin/admin.component').then(m => m.AdminComponent),
    // canActivate: [AuthGuard]  // Tu peux ajouter une garde d'authentification si nécessaire
    canActivate: [AuthGuard] 
  },
  {
    path: 'recherche',
    loadComponent: () => import('./components/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'parametres',
    component: ParametresComponent
  },
  { path: 'reset-password/:token', 
    component: ResetPasswordComponent 
  },
  {
    path: '**',
    redirectTo: '/accueil'
  }
];
