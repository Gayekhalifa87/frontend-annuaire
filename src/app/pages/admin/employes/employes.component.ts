import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Employe, EmployeService, ExternalAgent } from '../../../core/employe.service';
import { AuthService } from '../../../core/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employes.component.html',
  styleUrls: ['./employes.component.css']
})
export class EmployesComponent implements OnInit {
  agents: ExternalAgent[] = [];
  filteredAgents: ExternalAgent[] = []; 
  searchTerm: string = '';              
  isLoading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private employeService: EmployeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadExternalAgents();  
  }

  loadExternalAgents(): void {
  this.isLoading = true;
  this.error = null;
  
  this.employeService.getAllExternalAgents(0, 100000).subscribe({
    next: (response) => {
      this.agents = response.results || [];
      
      // Récupérer les employés locaux pour savoir qui est déjà assigné
      this.employeService.getAllCombinedEmployes().subscribe({
        next: (combined) => {
          // Marquer les agents déjà assignés avec leur IP
          this.agents.forEach(agent => {
            const assigned = combined.find(emp => emp.employeId === agent.id);
            if (assigned) {
              agent.ip = assigned.ip;

            }
          });
          
          this.sortAgents(this.agents);
          this.filteredAgents = [...this.agents];
          this.isLoading = false;
        }
      });
    },
    error: (err) => {
      console.error('Erreur :', err);
      this.error = 'Impossible de charger la liste des agents.';
      this.isLoading = false;
    }
  });
}

  /** Recherche live + tri automatique */
  onSearch(): void {
    const term = (this.searchTerm || '').toString().toLowerCase().trim();
    if (!term) {
      this.filteredAgents = [...this.agents];
      this.sortAgents(this.filteredAgents);
      return;
    }

    this.filteredAgents = this.agents.filter(agent => {
      // Toujours convertir en string avant toLowerCase (évite l'erreur)
      const fullName = String(agent.fullName || '');
      const matricule = String(agent.matricule ?? '');
      const email = String(agent.email || '');
      const telephone = String(agent.telephone ?? '');

      return fullName.toLowerCase().includes(term)
        || matricule.toLowerCase().includes(term)
        || email.toLowerCase().includes(term)
        || telephone.toLowerCase().includes(term);
    });

    // Tri automatique après filtrage
    this.sortAgents(this.filteredAgents);
  }

  /** Tri stable par nom (francophone), fallback sur matricule */
  private sortAgents(list: ExternalAgent[]) {
    list.sort((a, b) => {
      const aKey = String(a.fullName || a.matricule || '').trim();
      const bKey = String(b.fullName || b.matricule || '').trim();
      return aKey.localeCompare(bKey, 'fr', { sensitivity: 'base' });
    });
  }




  newEmploye: Employe = {
  employeId: 0,
  ip: undefined,
  telephone: '',
  role: 'USER',
  password: 'ChangeMe123!' 
};

selectedAgent: ExternalAgent | null = null;

openAddEmploye(agent: ExternalAgent): void {
  this.selectedAgent = agent;
  this.newEmploye = {
    employeId: agent.id,  // on prend l'ID externe
    ip: undefined,
    telephone: '',
    role: 'USER',
    password: 'password123!' // mot de passe par défaut
  };

  // Ouvrir le modal Bootstrap
  const modal = new (window as any).bootstrap.Modal(document.getElementById('addEmployeModal'));
  modal.show();
}

/* addEmploye(): void {
  if (!this.newEmploye || !this.newEmploye.employeId) return;

  this.employeService.addEmploye(this.newEmploye).subscribe({
    next: (res) => {
      console.log('Employé ajouté avec succès :', res);
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: `Employé ajouté avec succès !`,
        timer: 2000,
        showConfirmButton: false
      });

      // Fermer le modal Bootstrap si ouvert
      const modal = (window as any).bootstrap.Modal.getInstance(
        document.getElementById('addEmployeModal')
      );
      modal?.hide();

      // Recharger la liste des agents
      this.loadExternalAgents();
    },
    error: (err) => {
      console.error('Erreur ajout employé :', err);

      // Gestion spécifique du message d’erreur renvoyé par le backend
      let message = 'Erreur lors de l’ajout ❌';
      if (err.error && err.error.message) {
        message = err.error.message; // Exemple : "Cette IP est déjà attribuée à un autre employé."
      }

      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: message,
        timer: 3000,
        showConfirmButton: true
      });
    }
  });
} */

  addEmploye(): void {
  if (!this.newEmploye || !this.newEmploye.employeId) return;

  this.employeService.addEmploye(this.newEmploye).subscribe({
    next: (res) => {
      console.log('Employé ajouté avec succès :', res);
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: `Employé ajouté avec succès !`,
        timer: 2000,
        showConfirmButton: false
      });
      // Réinitialiser le formulaire et fermer le modal
      this.newEmploye = {
        employeId: 0,
        ip: undefined,
        telephone: '',
        role: 'USER',
        password: 'ChangeMe123!'
      };
      this.selectedAgent = null;
      const modalEl = document.getElementById('addEmployeModal');
      if (modalEl) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      }

      // Recharger la liste des agents pour voir la nouvelle IP
      this.loadExternalAgents();
    },
    error: (err) => {
      console.error('Erreur ajout employé :', err);

      // Vérifie si le backend a renvoyé un message
      let message = 'Erreur lors de l’ajout ❌';
      if (err.error && err.error.message) {
        message = err.error.message;
      } else if (err.status === 400) {
        message = 'IP ou téléphone déjà utilisé pour cet employé !';
      }

      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: message
      });
    }
  });
}



  retour(): void {
    this.router.navigate(['admin/']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/accueil']);
  }
}
