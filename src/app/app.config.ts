import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { KeycloakService } from './core/keycloak/keycloak.service';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

export const AuthInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const keycloakService = inject(KeycloakService);
  const token = keycloakService.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq);
};
