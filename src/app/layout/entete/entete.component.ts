import { Component } from '@angular/core';
import { Router, RouterModule, Route } from '@angular/router';

@Component({
  selector: 'app-entete',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './entete.component.html',
  styleUrl: './entete.component.css'
})
export class EnteteComponent {

constructor(private router: Router) { }

  goToConnexion() {
  this.router.navigate(['/connexion']);
}

}
