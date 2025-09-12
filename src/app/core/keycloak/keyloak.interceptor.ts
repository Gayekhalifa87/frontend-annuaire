//
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { KeycloakService } from './keycloak.service';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class KeycloakInterceptor implements HttpInterceptor {
  constructor(private keycloakService: KeycloakService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.keycloakService.updateToken()).pipe(
      switchMap(() => {
        const token = this.keycloakService.getToken();
        if (token) {
          const clonedReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next.handle(clonedReq);
        }
        return next.handle(req);
      })
    );
  }
}
