import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
  
  // ✅ L'initialisation Keycloak est gérée par APP_INITIALIZER dans main.ts
  // Rien à faire ici
  constructor() {
    console.log('🎯 AppComponent initialisé');
  }
}