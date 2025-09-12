import { Component } from '@angular/core';
import { Location } from '@angular/common'; 
import { Router } from '@angular/router';
import { Input } from '@angular/core';

@Component({
  selector: 'app-settings-header',
  standalone: true,
  imports: [],
  templateUrl: './settings-header.component.html',
  styleUrl: './settings-header.component.css'
})
export class SettingsHeaderComponent {
  @Input() user: any;
constructor(private router: Router) {}

  retour(): void {
    this.router.navigate(['admin/']); // change '/' par la route de ton choix
  }

}
