import { bootstrapApplication } from '@angular/platform-browser';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { AuthInterceptor } from './app/core/keycloak/auth.interceptor';
import { KeycloakService } from './app/core/keycloak/keycloak.service';

/**
 * ✅ Initialisation Keycloak AVANT le démarrage de l'application
 * Bloque l'app jusqu'à ce que Keycloak soit prêt
 */
export function initializeKeycloak(keycloakService: KeycloakService) {
  return (): Promise<void> => {
    console.log('🚀 APP_INITIALIZER: Démarrage Keycloak...');
    return keycloakService.init()
      .then(() => {
        console.log('✅ APP_INITIALIZER: Keycloak prêt');
      })
      .catch(err => {
        console.error('❌ APP_INITIALIZER: Erreur Keycloak', err);
        // Ne pas bloquer l'app en cas d'erreur critique
      });
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      RouterModule.forRoot(routes),
      HttpClientModule,
      ReactiveFormsModule
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      deps: [KeycloakService],
      multi: true
    }
  ]
}).catch(err => console.error('❌ Erreur bootstrap:', err));