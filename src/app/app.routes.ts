import { Routes } from '@angular/router';
import { ParametresComponent } from './pages/parametres/parametres.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { inject } from '@angular/core';
import { AuthService } from './core/auth.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthGuard } from './core/keycloak/core/keycloak/auth.guard';

// Guard pour protéger les routes (connecté)
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    map(isLoggedIn => {
      if (isLoggedIn) return true;
      router.navigate(['/connexion']);
      return false;
    })
  );
};


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
    path: 'login',
    loadComponent: () => import('./pages/admin/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]  // Redirige si déjà connecté
  },
  { 
    path: 'connexion',
    loadComponent: () => import('./pages/admin/connexion/connexion.component').then(m => m.ConnexionComponent),
    canActivate: [guestGuard]  // Redirige si déjà connecté
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
    loadComponent: () => import('./pages/admin/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard, authGuard]  // AuthGuard Keycloak + notre guard local
  },
  { 
    path: 'recherche',
    loadComponent: () => import('./components/search/search.component').then(m => m.SearchComponent),
    canActivate: [AuthGuard, authGuard]
  },
  {
    path: 'parametres',
    component: ParametresComponent,
    canActivate: [AuthGuard, authGuard]
  },


  // Fallback
  { path: '**', redirectTo: '/accueil' }
];
