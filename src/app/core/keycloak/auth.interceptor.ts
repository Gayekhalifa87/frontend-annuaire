import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { KeycloakService } from './keycloak.service';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private keycloakService: KeycloakService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  // Récupérer le token Keycloak
  const token = this.keycloakService.getToken();
    
    // Si on a un token, l'ajouter aux headers
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      
      console.log('🔗 Requête avec token:', req.url);
      return next.handle(authReq);
    }
    console.log('🔗 Requête sans token:', req.url);
    return next.handle(req);
  }
}
