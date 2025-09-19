import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeycloakService } from './core/keycloak/keycloak.service'; // ⚡ chemin correct


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'frontend';

  // ⚡ Injection du service Keycloak
  constructor(private keycloakService: KeycloakService) {}

  ngOnInit() {
    // ⚡ Utilisation après injection
    this.keycloakService.init(true).then(() => {
      if (!this.keycloakService.isLoggedIn()) {
        console.log("Utilisateur non connecté");
      } else {
        console.log("Utilisateur connecté");
      }
    });
  }
}
