import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true, // <-- IMPORTANT pour Angular standalone
  imports: [CommonModule, FormsModule], // <-- importer FormsModule ici
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token!: string;
  password = '';
  confirm = '';

  showPassword = false;
  confrm = false;
  showConfirm: any;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token')!;
  }

  onSubmit() {
    if (this.password !== this.confirm) {
      /* alert('Les mots de passe ne correspondent pas'); */
      return;
    }
    this.http.post(`http://localhost:3000/api/employes/reset-password/${this.token}`, { newPassword: this.password })

      .subscribe({
        next: (res: any) => {
          /* alert(res.message); */
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Erreur lors de la réinitialisation');
        }
      });
  }
}
